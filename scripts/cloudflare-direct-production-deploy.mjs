import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceConfigPath = resolve(root, 'wrangler.production-direct.jsonc');
const generatedConfigPath = resolve(root, '.wrangler.production-direct.generated.jsonc');
const metadataPath = resolve(root, 'production-deployment.json');

const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || '8b1954d216d65077c6480d62583fe2c2').trim();
const apiToken = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim();
const workerName = 'sovv-web';
const d1Name = 'sovereign-openapi-db';
const commitSha = String(process.env.GITHUB_SHA || process.env.WORKERS_CI_COMMIT_SHA || '').trim();
const turnstileSiteKey = String(process.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADhGIF8-iOLIg8MU').trim();
const publicBase = 'https://sovereign.defrag.app';
const appBase = 'https://app.defrag.app';
const donationUrl = 'https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02';
const migrationVersion = '0009_production_scale_and_billing_safety';

if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is required');
if (!/^[0-9a-f]{40}$/i.test(commitSha)) throw new Error('A full 40-character commit SHA is required');
if (!turnstileSiteKey) throw new Error('VITE_TURNSTILE_SITE_KEY is required for production authentication');

const env = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  VITE_TURNSTILE_SITE_KEY: turnstileSiteKey
};
if (apiToken) env.CLOUDFLARE_API_TOKEN = apiToken;

const sensitiveValues = [apiToken].filter(Boolean);

function sanitize(value) {
  let output = String(value ?? '');
  for (const secret of sensitiveValues) output = output.replaceAll(secret, '[redacted]');
  return output;
}

function executeWrangler(args, options = {}) {
  const capture = options.capture !== false;
  return spawnSync(
    'pnpm',
    ['--filter', '@sovereign/worker', 'exec', 'wrangler', ...args],
    {
      cwd: root,
      encoding: 'utf8',
      input: options.input,
      stdio: capture ? ['pipe', 'pipe', 'pipe'] : 'inherit',
      env
    }
  );
}

function runWrangler(args, options = {}) {
  const result = executeWrangler(args, options);
  if (result.status !== 0) {
    throw new Error(`wrangler ${args.join(' ')} failed: ${sanitize(result.stderr || result.stdout)}`);
  }
  return result.stdout ?? '';
}

function parseJsonOutput(output) {
  const trimmed = String(output || '').trim();
  if (!trimmed) return [];
  try {
    return JSON.parse(trimmed);
  } catch {
    const starts = [trimmed.indexOf('{'), trimmed.indexOf('[')].filter((index) => index >= 0);
    if (!starts.length) throw new Error(`Expected JSON output, received: ${sanitize(trimmed)}`);
    return JSON.parse(trimmed.slice(Math.min(...starts)));
  }
}

function rows(value) {
  if (Array.isArray(value)) return value;
  return value?.result ?? value?.databases ?? value?.secrets ?? [];
}

function findDatabaseId(value) {
  const match = rows(value).find((item) => item.name === d1Name || item.database_name === d1Name);
  return match?.uuid ?? match?.id ?? match?.database_id;
}

async function resolveTurnstileSecret() {
  if (!apiToken) return undefined;
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/challenges/widgets/${encodeURIComponent(turnstileSiteKey)}`,
      { headers: { authorization: `Bearer ${apiToken}` }, signal: AbortSignal.timeout(8_000) }
    );
    if (!response.ok) {
      console.warn(`Turnstile widget lookup skipped (${response.status}).`);
      return undefined;
    }
    const payload = await response.json();
    return payload?.result?.secret || undefined;
  } catch (error) {
    console.warn(`Turnstile widget lookup skipped: ${sanitize(error?.message || error)}`);
    return undefined;
  }
}

async function request(url, options = {}) {
  return fetch(url, {
    redirect: options.redirect ?? 'follow',
    method: options.method ?? 'GET',
    headers: options.headers,
    body: options.body,
    signal: AbortSignal.timeout(options.timeoutMs ?? 10_000)
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
  return { response, json, text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function headerIncludes(response, name, fragment) {
  return String(response.headers.get(name) || '').toLowerCase().includes(String(fragment).toLowerCase());
}

async function verifyLiveProduction() {
  let lastError;
  for (let attempt = 1; attempt <= 24; attempt += 1) {
    try {
      const ready = await readJson(`${appBase}/ready`);
      assert(ready.response.ok, `ready returned ${ready.response.status}`);
      assert(ready.json?.ready === true, `ready=false: ${ready.text.slice(0, 500)}`);
      assert(ready.json?.version === commitSha, `ready version mismatch: ${ready.json?.version ?? 'missing'}`);
      assert(ready.json?.migrationVersion === migrationVersion, `migration mismatch: ${ready.json?.migrationVersion ?? 'missing'}`);
      assert(ready.json?.dependencies?.authentication === 'configured', 'authentication dependency is not configured');
      assert(ready.json?.dependencies?.transactionalEmail !== 'missing', 'transactional email is not configured');
      assert(ready.json?.dependencies?.stripe === 'configured', 'Stripe dependency is not configured');
      assert(ready.json?.dependencies?.privateExports === 'disabled', 'private exports are not disabled');
      assert(ready.json?.dependencies?.sharing === 'public-link-only', 'sharing contract is incorrect');
      break;
    } catch (error) {
      lastError = error;
      if (attempt === 24) throw new Error(`Live readiness did not converge: ${sanitize(lastError?.message || lastError)}`);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000));
    }
  }

  const [home, pricing, login, signup, health, ready] = await Promise.all([
    readText(`${publicBase}/`),
    readText(`${publicBase}/pricing.html`),
    readText(`${appBase}/login`),
    readText(`${appBase}/signup`),
    readJson(`${appBase}/health`),
    readJson(`${appBase}/ready`)
  ]);

  assert(home.response.ok, `public home returned ${home.response.status}`);
  assert(/Sovereign\.OS/i.test(home.text), 'public home does not identify Sovereign.OS');
  assert(home.text.includes('See what is really happening'), 'public home fingerprint is missing');
  assert(pricing.response.ok, `pricing returned ${pricing.response.status}`);
  assert(pricing.text.includes('$20') && pricing.text.includes('$99'), 'launch pricing is missing');
  assert(!pricing.text.includes('$29') && !pricing.text.includes('$79'), 'legacy pricing is still visible');
  assert(pricing.text.includes('Consent-aware invitations and sharing'), 'share-first plan copy is missing');
  assert(pricing.text.includes(donationUrl), 'donation link is missing from pricing');
  assert(!/full account export|export features/i.test(`${home.text}\n${pricing.text}`), 'export promise is still public');
  assert(login.response.ok && signup.response.ok, 'login or signup page is unavailable');
  assert(/SOVEREIGN\.OS/i.test(login.text) && /SOVEREIGN\.OS/i.test(signup.text), 'account pages do not identify Sovereign.OS');
  assert(health.response.ok && health.json?.ok === true, 'health is not healthy');
  assert(health.json?.version === commitSha, 'health is not serving the deployed commit');
  assert(health.json?.migrationVersion === migrationVersion, 'health is not serving migration 0009');
  assert(ready.json?.ready === true && ready.json?.version === commitSha, 'ready is not serving the deployed commit');

  for (const page of [home.response, login.response, signup.response]) {
    assert(headerIncludes(page, 'strict-transport-security', 'max-age=31536000'), 'HSTS is missing from a document');
    assert(headerIncludes(page, 'x-content-type-options', 'nosniff'), 'nosniff is missing from a document');
    assert(headerIncludes(page, 'x-frame-options', 'deny'), 'frame denial is missing from a document');
    assert(headerIncludes(page, 'content-security-policy', "frame-ancestors 'none'"), 'document frame CSP is missing');
  }
  assert(headerIncludes(login.response, 'content-security-policy', 'challenges.cloudflare.com'), 'Turnstile CSP is missing');
  assert(headerIncludes(login.response, 'x-robots-tag', 'noindex'), 'authenticated hostname is indexable');

  const [appRoot, publicLogin, appPricing, publicApi] = await Promise.all([
    request(`${appBase}/`, { redirect: 'manual' }),
    request(`${publicBase}/login`, { redirect: 'manual' }),
    request(`${appBase}/pricing.html`, { redirect: 'manual' }),
    request(`${publicBase}/api/v1/auth/session`, { redirect: 'manual' })
  ]);
  assert(appRoot.status === 308 && appRoot.headers.get('location')?.startsWith(`${appBase}/app`), 'app root redirect is incorrect');
  assert(publicLogin.status === 308 && publicLogin.headers.get('location')?.startsWith(`${appBase}/login`), 'public login redirect is incorrect');
  assert(appPricing.status === 308 && appPricing.headers.get('location')?.startsWith(`${publicBase}/pricing.html`), 'app pricing redirect is incorrect');
  assert(publicApi.status === 308 && publicApi.headers.get('location')?.startsWith(`${appBase}/api/v1/auth/session`), 'public API redirect is incorrect');

  const invalidWebhookBody = JSON.stringify({
    id: 'evt_smoke_invalid',
    type: 'customer.subscription.updated',
    data: { object: {} }
  });
  const [session, you, checkout, webhook, legacyWebhook, disabledExport, signupWithoutTurnstile] = await Promise.all([
    request(`${appBase}/api/v1/auth/session`, { redirect: 'manual' }),
    request(`${appBase}/api/v1/you`, { redirect: 'manual' }),
    request(`${appBase}/api/v1/billing/checkout`, {
      method: 'POST',
      headers: { origin: appBase, 'content-type': 'application/json', 'x-idempotency-key': `smoke-${commitSha}` },
      body: JSON.stringify({ interval: 'monthly' }),
      redirect: 'manual'
    }),
    request(`${appBase}/api/v1/stripe/webhook`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'stripe-signature': 't=0,v1=invalid' },
      body: invalidWebhookBody,
      redirect: 'manual'
    }),
    request(`${appBase}/api/stripe/webhook`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'stripe-signature': 't=0,v1=invalid' },
      body: invalidWebhookBody,
      redirect: 'manual'
    }),
    request(`${appBase}/api/v1/export-jobs`, {
      method: 'POST',
      headers: { origin: appBase, 'content-type': 'application/json' },
      body: '{}',
      redirect: 'manual'
    }),
    request(`${appBase}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { origin: appBase, 'content-type': 'application/json' },
      body: JSON.stringify({
        email: `deploy-smoke-${commitSha.slice(0, 12)}@example.invalid`,
        name: 'Deployment Probe',
        termsAccepted: true
      }),
      redirect: 'manual'
    })
  ]);
  assert(session.status === 401, `unauthenticated session returned ${session.status}`);
  assert(you.status === 401, `unauthenticated account returned ${you.status}`);
  assert(checkout.status === 401, `unauthenticated checkout returned ${checkout.status}`);
  assert(webhook.status === 400, `invalid current Stripe signature returned ${webhook.status}`);
  assert(legacyWebhook.status === 400, `invalid legacy Stripe signature returned ${legacyWebhook.status}`);
  assert(disabledExport.status === 404, `disabled export returned ${disabledExport.status}`);
  assert(signupWithoutTurnstile.status === 400, `signup without Turnstile returned ${signupWithoutTurnstile.status}`);

  const securityHeaders = health.response.headers;
  assert(securityHeaders.get('cache-control') === 'no-store', 'health cache-control is not no-store');
  assert(headerIncludes(health.response, 'strict-transport-security', 'max-age=31536000'), 'health HSTS is missing');
  assert(headerIncludes(health.response, 'x-content-type-options', 'nosniff'), 'health nosniff is missing');
  assert(headerIncludes(health.response, 'x-frame-options', 'deny'), 'health frame denial is missing');
  assert(headerIncludes(health.response, 'content-security-policy', "default-src 'none'"), 'API CSP is missing');

  const assetPath = home.text.match(/(?:src|href)=["'](\/assets\/[^"']+\.(?:js|css))["']/)?.[1];
  assert(assetPath, 'compiled asset fingerprint is missing from the public document');
  const asset = await request(`${publicBase}${assetPath}`);
  assert(asset.ok, `compiled asset returned ${asset.status}`);
  assert(headerIncludes(asset, 'cache-control', 'immutable'), 'compiled asset is not immutable');

  const concurrent = await Promise.all(Array.from({ length: 20 }, () => readJson(`${appBase}/health`)));
  assert(concurrent.every((item) => item.response.ok && item.json?.version === commitSha), 'concurrent health probe failed');

  return {
    publicUrl: publicBase,
    appUrl: appBase,
    health: health.json,
    ready: ready.json,
    probes: {
      publicHome: 'passed',
      pricing: 'passed',
      donationLinkPresent: 'passed',
      hostnameSeparation: 'passed',
      unauthenticatedAccess: 'passed',
      turnstileRequired: 'passed',
      stripeSignatureRejection: 'current-and-legacy-passed',
      exportsDisabled: 'passed',
      documentSecurityHeaders: 'passed',
      apiSecurityHeaders: 'passed',
      appNoIndex: 'passed',
      immutableAsset: assetPath,
      concurrentHealth: '20/20'
    }
  };
}

let createdDatabase = false;
let databaseId;

try {
  databaseId = findDatabaseId(parseJsonOutput(runWrangler(['d1', 'list', '--json'])));
  if (!databaseId) {
    runWrangler(['d1', 'create', d1Name], { capture: false });
    databaseId = findDatabaseId(parseJsonOutput(runWrangler(['d1', 'list', '--json'])));
    createdDatabase = true;
  }
  if (!databaseId) throw new Error(`Unable to resolve D1 database ${d1Name}`);

  const config = JSON.parse(readFileSync(sourceConfigPath, 'utf8'));
  config.name = workerName;
  config.vars.APP_VERSION = commitSha;
  config.d1_databases = [{
    binding: 'DB',
    database_name: d1Name,
    database_id: databaseId,
    migrations_dir: 'apps/sovereign-worker/migrations'
  }];
  writeFileSync(generatedConfigPath, JSON.stringify(config, null, 2));

  runWrangler([
    'd1', 'migrations', 'apply', d1Name,
    '--remote',
    '--config', generatedConfigPath
  ], { capture: false });

  const existingSecrets = new Set(
    rows(parseJsonOutput(runWrangler([
      'secret', 'list',
      '--name', workerName,
      '--format', 'json'
    ]))).map((item) => item.name)
  );

  const secrets = {};
  if (!existingSecrets.has('SESSION_SIGNING_SECRET')) {
    secrets.SESSION_SIGNING_SECRET = randomBytes(48).toString('base64url');
  }
  if (!existingSecrets.has('TURNSTILE_SECRET_KEY')) {
    const turnstileSecret = await resolveTurnstileSecret();
    if (turnstileSecret) secrets.TURNSTILE_SECRET_KEY = turnstileSecret;
  }

  if (Object.keys(secrets).length) {
    for (const value of Object.values(secrets)) sensitiveValues.push(value);
    runWrangler(['secret', 'bulk', '--name', workerName], { input: JSON.stringify(secrets) });
  }

  const configuredSecrets = new Set([...existingSecrets, ...Object.keys(secrets)]);
  const requiredSecrets = ['SESSION_SIGNING_SECRET', 'TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
  const missingSecrets = requiredSecrets.filter((name) => !configuredSecrets.has(name));
  if (missingSecrets.length) {
    throw new Error(`Production secrets are missing from ${workerName}: ${missingSecrets.join(', ')}`);
  }

  const deployOutput = runWrangler(['deploy', '--config', generatedConfigPath]);
  const workersDevUrl = deployOutput.match(/https:\/\/[^\s]+\.workers\.dev/)?.[0] || null;
  const verification = await verifyLiveProduction();

  const metadata = {
    workerName,
    commitSha,
    migrationVersion,
    d1Name,
    createdDatabase,
    workersDevUrl,
    publicUrl: publicBase,
    appUrl: appBase,
    legacyParentUrl: 'https://defrag.app',
    legacyParentPreserved: true,
    r2Enabled: false,
    queueEnabled: false,
    privateExports: 'disabled',
    sharing: 'public-link-only',
    donationUrl,
    sessionSecretCreated: Object.hasOwn(secrets, 'SESSION_SIGNING_SECRET'),
    turnstileSecretConfigured: configuredSecrets.has('TURNSTILE_SECRET_KEY'),
    resendConfigured: configuredSecrets.has('RESEND_API_KEY'),
    stripeConfigured: configuredSecrets.has('STRIPE_SECRET_KEY') && configuredSecrets.has('STRIPE_WEBHOOK_SECRET'),
    verification
  };
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata, null, 2));
} finally {
  rmSync(generatedConfigPath, { force: true });
}
