import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { configureCloudflareFreeTier } from './configure-cloudflare-free-tier.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceConfigPath = resolve(root, 'wrangler.production-direct.jsonc');
const generatedConfigPath = resolve(root, '.wrangler.production-direct.generated.jsonc');
const metadataPath = resolve(root, 'production-deployment.json');
const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || '8b1954d216d65077c6480d62583fe2c2').trim();
const apiToken = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim();
const commitSha = String(process.env.GITHUB_SHA || process.env.WORKERS_CI_COMMIT_SHA || '').trim();
const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|rotating-real-life-questions|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;
const workerName = 'sovv-web';
const d1Name = 'sovereign-openapi-db';
const model = '@cf/zai-org/glm-4.7-flash';
const publicBase = 'https://sovereign.defrag.app';
const appBase = 'https://app.defrag.app';
const migrationVersion = '0013_workers_ai_free_capacity';
const turnstileSiteKey = String(process.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADhGIF8-iOLIg8MU').trim();

if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is required');
if (!apiToken) throw new Error('CLOUDFLARE_API_TOKEN is required for production deployment');
if (!/^[0-9a-f]{40}$/i.test(commitSha)) throw new Error('A full 40-character commit SHA is required');
if (!turnstileSiteKey) throw new Error('VITE_TURNSTILE_SITE_KEY is required');

const env = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CLOUDFLARE_API_TOKEN: apiToken,
  VITE_TURNSTILE_SITE_KEY: turnstileSiteKey
};
const sensitiveValues = [apiToken];

function sanitize(value) {
  let output = String(value ?? '');
  for (const secret of sensitiveValues.filter(Boolean)) output = output.replaceAll(secret, '[redacted]');
  return output;
}

function executeWrangler(args, options = {}) {
  return spawnSync('pnpm', ['--filter', '@sovereign/worker', 'exec', 'wrangler', ...args], {
    cwd: root,
    encoding: 'utf8',
    input: options.input,
    stdio: options.capture === false ? 'inherit' : ['pipe', 'pipe', 'pipe'],
    env
  });
}

function runWrangler(args, options = {}) {
  const result = executeWrangler(args, options);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`wrangler ${args.join(' ')} failed: ${sanitize(result.stderr || result.stdout)}`);
  return result.stdout || '';
}

function parseJsonOutput(output) {
  const text = String(output || '').trim();
  if (!text) return [];
  try { return JSON.parse(text); } catch {
    const starts = [text.indexOf('{'), text.indexOf('[')].filter((index) => index >= 0);
    if (!starts.length) throw new Error(`Expected JSON output: ${sanitize(text.slice(0, 500))}`);
    return JSON.parse(text.slice(Math.min(...starts)));
  }
}

function rows(value) {
  if (Array.isArray(value)) return value;
  return value?.result || value?.databases || value?.secrets || [];
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(url, options = {}) {
  return fetch(url, {
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body,
    redirect: options.redirect || 'follow',
    signal: AbortSignal.timeout(options.timeoutMs || 15_000)
  });
}

async function readText(url, options) {
  const response = await request(url, options);
  return { response, text: await response.text() };
}

async function readJson(url, options) {
  const response = await request(url, options);
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { json = undefined; }
  return { response, text, json };
}

function assertContains(label, text, values) {
  for (const value of values) assert(text.includes(value), `${label} is missing: ${value}`);
}

function assertDocument(label, document, markers = []) {
  assert(document.response.ok, `${label} returned ${document.response.status}`);
  assertContains(label, document.text, ['<html', '<head', '<body', ...markers]);
}

function headerIncludes(response, name, value) {
  return String(response.headers.get(name) || '').toLowerCase().includes(String(value).toLowerCase());
}

async function resolveTurnstileSecret() {
  const response = await request(`https://api.cloudflare.com/client/v4/accounts/${accountId}/challenges/widgets/${encodeURIComponent(turnstileSiteKey)}`, {
    headers: { authorization: `Bearer ${apiToken}` }
  });
  if (!response.ok) return undefined;
  const payload = await response.json().catch(() => ({}));
  return payload?.result?.secret || undefined;
}

async function verifyLiveProduction() {
  let ready;
  let lastError;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      ready = await readJson(`${appBase}/ready`);
      assert(ready.response.ok && ready.json?.ready === true, `ready returned ${ready.response.status}`);
      assert(ready.json?.version === commitSha, `ready version is ${ready.json?.version || 'missing'}`);
      assert(ready.json?.migrationVersion === migrationVersion, 'migration version mismatch');
      assert(ready.json?.dependencies?.aiFreeCapacity === 'configured', 'free-capacity ledger is not configured');
      break;
    } catch (error) {
      lastError = error;
      if (attempt === 30) throw new Error(`Live readiness did not converge: ${lastError?.message || lastError}`);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000));
    }
  }

  const [home, how, pricing, faq, login, signup, app, health, notFound] = await Promise.all([
    readText(`${publicBase}/?release=${commitSha}`),
    readText(`${publicBase}/how-it-works`),
    readText(`${publicBase}/pricing`),
    readText(`${publicBase}/faq`),
    readText(`${appBase}/login`),
    readText(`${appBase}/signup`),
    readText(`${appBase}/app`),
    readJson(`${appBase}/health`),
    readText(`${publicBase}/release-probe-not-found`)
  ]);

  assertDocument('home', home, ['id="root"', 'Sovereign']);
  assertDocument('how-it-works', how, ['Sovereign.OS', '/premium-public-release.css?v=20260730-final']);
  assertDocument('pricing', pricing, ['Sovereign.OS', '$0', '$20', '$99', '/premium-public-release.css?v=20260730-final']);
  assertDocument('faq', faq, ['Sovereign.OS', '/premium-public-release.css?v=20260730-final']);
  assertDocument('login', login, ['id="root"']);
  assertDocument('signup', signup, ['id="root"']);
  assertDocument('app', app, ['id="root"']);
  assert(notFound.response.status === 404 && notFound.text.includes('This page is not part of Sovereign.OS.'), 'public 404 contract failed');
  assert(health.response.ok && health.json?.ok === true && health.json?.version === commitSha, 'health contract failed');
  assert(health.json?.dependencies?.ai === 'configured', 'Workers AI dependency is not configured');
  assert(health.json?.dependencies?.aiFreeCapacity === 'configured', 'Workers AI free-capacity ledger is not configured');
  assert(health.json?.dependencies?.authentication === 'configured', 'authentication is not configured');
  assert(health.json?.dependencies?.stripe === 'configured', 'Stripe is not configured');

  for (const document of [home.response, how.response, pricing.response, faq.response, login.response, signup.response, app.response]) {
    assert(headerIncludes(document, 'strict-transport-security', 'max-age=31536000'), 'HSTS is missing');
    assert(headerIncludes(document, 'x-content-type-options', 'nosniff'), 'nosniff is missing');
    assert(headerIncludes(document, 'x-frame-options', 'deny'), 'frame protection is missing');
  }
  for (const document of [login.response, signup.response, app.response]) {
    assert(headerIncludes(document, 'x-robots-tag', 'noindex'), 'application document is indexable');
  }

  const jsPath = home.text.match(/src=["'](\/assets\/[^"']+\.js)["']/)?.[1];
  const cssPath = home.text.match(/href=["'](\/assets\/[^"']+\.css)["']/)?.[1];
  assert(jsPath, 'compiled JavaScript asset is missing');
  assert(cssPath, 'compiled CSS asset is missing');
  const [javascript, stylesheet, staticAuthority, staticStyles] = await Promise.all([
    readText(`${publicBase}${jsPath}`),
    readText(`${publicBase}${cssPath}`),
    readText(`${publicBase}/premium-public-release.css?v=20260730-final`),
    readText(`${publicBase}/v0-public-port.css?v=20260801-founder-v0`)
  ]);
  assert(javascript.response.ok && headerIncludes(javascript.response, 'cache-control', 'immutable'), 'compiled JavaScript is unavailable or not immutable');
  assert(stylesheet.response.ok && headerIncludes(stylesheet.response, 'cache-control', 'immutable'), 'compiled CSS is unavailable or not immutable');
  assert(staticAuthority.response.ok, 'static visual authority is unavailable');
  assert(staticStyles.response.ok, 'founder v0 static-route CSS is unavailable');
  assertContains('static visual authority', staticAuthority.text, ["@import url('/v0-public-port.css?v=20260801-founder-v0')"]);
  assertContains('founder v0 static-route CSS', staticStyles.text, [
    `Archive SHA-256: ${archiveSha}`,
    'body.launch-page',
    '.launch-nav',
    '.launch-hero',
    '.journey-steps',
    '.pricing-grid',
    '.faq-list details',
    '.launch-footer'
  ]);

  assertContains('compiled single-example application', javascript.text, [
    sequenceFingerprint,
    archiveSha,
    'v0-landing-selective-port',
    'v0-public-landing-v2',
    'v0-single-example-landing',
    'Personal AI for real life',
    'Healing isn’t optional.',
    'Holding onto the pain is.',
    'Illustrative Baseline',
    'See what is active before it repeats.',
    'Hover, focus, or tap a line.',
    'An interactive field of eight Cloudflare-blue lines radiating from one stable point.',
    'Clarity',
    'Focus',
    'Steadiness',
    'Courage',
    'Tenderness',
    'Boundaries',
    'Responsibility',
    'Repair',
    'Why do I keep taking responsibility for everyone around me?',
    'Relative expression inside one sanitized example',
    'One place to understand what keeps happening.',
    'Understand yourself',
    'Understand a relationship',
    'Understand a system',
    'Other AI answers',
    'everyone the same.',
    'Your thoughts deserve',
    'a better place to live.',
    'Explore this through Covenant?'
  ]);
  for (const prohibited of [
    'Know yourself.',
    'Understand the system.',
    'Choose what fits.',
    'mock-auth',
    'fake-answer',
    'dashboard-grid',
    'Demo User',
    'generateAIResponse'
  ]) {
    assert(!javascript.text.includes(prohibited), `compiled application contains rejected reconstruction or mock marker: ${prohibited}`);
  }

  const compactCss = stylesheet.text.replace(/\s+/g, '');
  for (const marker of [
    '--v0-page:#0f0f0f',
    '--v0-cream:#e8ddd0',
    '.v0-hero{',
    '.v0-single-example-landing{',
    '.landing-expression-slice{',
    '.landing-expression-slice__canvas{',
    '.landing-expression-slice__tooltip{',
    '.v0-capability-summary{',
    '.v0-comparison-grid{',
    '.intelligence-workspace{',
    '.sovereign-composer{',
    '.account-shell',
    '.plan-onboarding',
    '.sovereign-policy',
    '.email-code-fallback'
  ]) {
    assert(compactCss.includes(marker), `compiled CSS is missing v0/sitewide marker: ${marker}`);
  }

  const invalidWebhookBody = JSON.stringify({ id: 'evt_release_invalid', type: 'customer.subscription.updated', data: { object: {} } });
  const [session, account, checkout, webhook, signupWithoutTurnstile] = await Promise.all([
    request(`${appBase}/api/v1/auth/session`, { redirect: 'manual' }),
    request(`${appBase}/api/v1/you`, { redirect: 'manual' }),
    request(`${appBase}/api/v1/billing/checkout`, {
      method: 'POST',
      headers: { origin: appBase, 'content-type': 'application/json', 'x-idempotency-key': `release-${commitSha}` },
      body: JSON.stringify({ interval: 'monthly' }),
      redirect: 'manual'
    }),
    request(`${appBase}/api/v1/stripe/webhook`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'stripe-signature': 't=0,v1=invalid' },
      body: invalidWebhookBody,
      redirect: 'manual'
    }),
    request(`${appBase}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { origin: appBase, 'content-type': 'application/json' },
      body: JSON.stringify({ email: `release-${commitSha.slice(0, 12)}@example.invalid`, name: 'Release Probe', termsAccepted: true }),
      redirect: 'manual'
    })
  ]);
  assert(session.status === 401, `unauthenticated session returned ${session.status}`);
  assert(account.status === 401, `unauthenticated account returned ${account.status}`);
  assert(checkout.status === 401, `unauthenticated checkout returned ${checkout.status}`);
  assert(webhook.status === 400, `invalid Stripe signature returned ${webhook.status}`);
  assert([400, 403].includes(signupWithoutTurnstile.status), `Turnstile/API Shield rejection returned ${signupWithoutTurnstile.status}`);

  return {
    health: health.json,
    ready: ready.json,
    visualRelease: {
      archiveSha256: archiveSha,
      sequenceFingerprint,
      contract: 'v0-public-landing-v2',
      platformRouteCoverage: 'v0-platform-port.css',
      sitewideVisualAuthority: 'v0-visual-port.css',
      staticRouteVisualAuthority: 'v0-public-port.css',
      javascriptAsset: jsPath,
      cssAsset: cssPath
    },
    probes: {
      publicDocuments: 'passed',
      pricing: 'passed',
      applicationShell: 'passed',
      immutableAssets: 'passed',
      securityHeaders: 'passed',
      unauthenticatedAccess: 'passed',
      turnstileOrSchemaRejection: signupWithoutTurnstile.status,
      stripeSignatureRejection: 'passed'
    }
  };
}

let generated = false;
try {
  const databases = rows(parseJsonOutput(runWrangler(['d1', 'list', '--json'])));
  const database = databases.find((item) => item.name === d1Name || item.database_name === d1Name);
  let databaseId = database?.uuid || database?.id || database?.database_id;
  if (!databaseId) {
    runWrangler(['d1', 'create', d1Name], { capture: false });
    const refreshed = rows(parseJsonOutput(runWrangler(['d1', 'list', '--json'])));
    databaseId = refreshed.find((item) => item.name === d1Name || item.database_name === d1Name)?.uuid;
  }
  if (!databaseId) throw new Error(`Unable to resolve D1 database ${d1Name}`);

  const config = JSON.parse(readFileSync(sourceConfigPath, 'utf8'));
  config.name = workerName;
  config.vars.APP_VERSION = commitSha;
  config.vars.AI_MODEL = model;
  config.d1_databases = [{ binding: 'DB', database_name: d1Name, database_id: databaseId, migrations_dir: 'apps/sovereign-worker/migrations' }];
  writeFileSync(generatedConfigPath, JSON.stringify(config, null, 2));
  generated = true;

  runWrangler(['d1', 'migrations', 'apply', d1Name, '--remote', '--config', generatedConfigPath], { capture: false });

  const existingSecrets = new Set(rows(parseJsonOutput(runWrangler(['secret', 'list', '--name', workerName, '--format', 'json']))).map((item) => item.name));
  const secrets = {};
  if (!existingSecrets.has('SESSION_SIGNING_SECRET')) secrets.SESSION_SIGNING_SECRET = randomBytes(48).toString('base64url');
  if (!existingSecrets.has('TURNSTILE_SECRET_KEY')) {
    const secret = await resolveTurnstileSecret();
    if (secret) secrets.TURNSTILE_SECRET_KEY = secret;
  }
  if (Object.keys(secrets).length) {
    for (const value of Object.values(secrets)) sensitiveValues.push(value);
    runWrangler(['secret', 'bulk', '--name', workerName], { input: JSON.stringify(secrets) });
  }
  const configuredSecrets = new Set([...existingSecrets, ...Object.keys(secrets)]);
  const requiredSecrets = ['SESSION_SIGNING_SECRET', 'TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
  const missing = requiredSecrets.filter((name) => !configuredSecrets.has(name));
  if (missing.length) throw new Error(`Production secrets are missing from ${workerName}: ${missing.join(', ')}`);

  const controls = await configureCloudflareFreeTier({ accountId, apiToken, databaseId, gatewayId: 'sovereign', zoneName: 'defrag.app' });
  const deployOutput = runWrangler(['deploy', '--config', generatedConfigPath]);
  const workersDevUrl = deployOutput.match(/https:\/\/[^\s]+\.workers\.dev/)?.[0] || null;
  const verification = await verifyLiveProduction();
  const metadata = {
    workerName,
    commitSha,
    migrationVersion,
    model,
    d1Name,
    workersDevUrl,
    publicUrl: publicBase,
    appUrl: appBase,
    cloudflarePlanTarget: 'free',
    dailyNeuronReservationBudget: 7_500,
    r2Enabled: false,
    queueEnabled: false,
    privateExports: 'disabled',
    controls,
    verification
  };
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata, null, 2));
} finally {
  if (generated) rmSync(generatedConfigPath, { force: true });
}
