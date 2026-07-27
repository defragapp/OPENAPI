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
const migrationVersion = '0010_account_onboarding_and_chat_history';

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
    signal: AbortSignal.timeout(options.timeoutMs ?? 12_000)
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

function assertContainsAll(label, text, fingerprints) {
  for (const fingerprint of fingerprints) {
    assert(text.includes(fingerprint), `${label} is missing: ${fingerprint}`);
  }
}

function headerIncludes(response, name, fragment) {
  return String(response.headers.get(name) || '').toLowerCase().includes(String(fragment).toLowerCase());
}

async function verifyLiveProduction() {
  let lastError;
  for (let attempt = 1; attempt <= 24; attempt += 1) {
    try {
      const readyProbe = await readJson(`${appBase}/ready`);
      assert(readyProbe.response.ok, `ready returned ${readyProbe.response.status}`);
      assert(readyProbe.json?.ready === true, `ready=false: ${readyProbe.text.slice(0, 500)}`);
      assert(readyProbe.json?.version === commitSha, `ready version mismatch: ${readyProbe.json?.version ?? 'missing'}`);
      assert(readyProbe.json?.migrationVersion === migrationVersion, `migration mismatch: ${readyProbe.json?.migrationVersion ?? 'missing'}`);
      assert(readyProbe.json?.dependencies?.authentication === 'configured', 'authentication dependency is not configured');
      assert(readyProbe.json?.dependencies?.transactionalEmail !== 'missing', 'transactional email is not configured');
      assert(readyProbe.json?.dependencies?.stripe === 'configured', 'Stripe dependency is not configured');
      assert(readyProbe.json?.dependencies?.privateExports === 'disabled', 'private exports are not disabled');
      assert(readyProbe.json?.dependencies?.sharing === 'public-link-only', 'sharing contract is incorrect');
      break;
    } catch (error) {
      lastError = error;
      if (attempt === 24) throw new Error(`Live readiness did not converge: ${sanitize(lastError?.message || lastError)}`);
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000));
    }
  }

  const [
    home,
    how,
    howClean,
    pricing,
    pricingClean,
    faq,
    faqClean,
    privacy,
    terms,
    login,
    signup,
    appPage,
    invitation,
    consent,
    health,
    ready
  ] = await Promise.all([
    readText(`${publicBase}/`),
    readText(`${publicBase}/how-it-works.html`),
    readText(`${publicBase}/how-it-works`),
    readText(`${publicBase}/pricing.html`),
    readText(`${publicBase}/pricing`),
    readText(`${publicBase}/faq.html`),
    readText(`${publicBase}/faq`),
    readText(`${publicBase}/privacy`),
    readText(`${publicBase}/terms`),
    readText(`${appBase}/login`),
    readText(`${appBase}/signup`),
    readText(`${appBase}/app`),
    readText(`${appBase}/invitation`),
    readText(`${appBase}/consent.html`),
    readJson(`${appBase}/health`),
    readJson(`${appBase}/ready`)
  ]);

  assert(home.response.ok, `public home returned ${home.response.status}`);
  assertContainsAll('public home', home.text, ['Sovereign.OS', 'Know yourself. Understand the system.']);

  assert(how.response.ok && howClean.response.ok, 'How it works page or clean URL is unavailable');
  assertContainsAll('How it works', how.text, [
    'One Baseline. An entire life in context.',
    'THE PLATFORM IN FOUR PARTS',
    'Explore shadow and light',
    '/launch-polish.css?v=20260726-final-r1'
  ]);
  assertContainsAll('How it works clean URL', howClean.text, [
    'One Baseline. An entire life in context.',
    'See yourself, the relationship, and the whole system.'
  ]);

  assert(pricing.response.ok && pricingClean.response.ok, 'pricing page or clean URL is unavailable');
  assertContainsAll('pricing', pricing.text, [
    '$20',
    '$99',
    '10 Sovereign responses each month',
    '300 Sovereign responses each month',
    'Consent-aware invitations and sharing controls',
    '/launch-polish.css?v=20260726-final-r1'
  ]);
  assertContainsAll('pricing clean URL', pricingClean.text, [
    '$20',
    '$99',
    'Begin with yourself. Expand to every relationship and system your life includes.'
  ]);
  assert(!pricing.text.includes('$29') && !pricing.text.includes('$79'), 'legacy pricing is still visible');
  assert(!/donate\.stripe\.com|Support Sovereign\.OS|Support the platform/i.test(pricing.text), 'unapproved support placement is public');

  assert(faq.response.ok && faqClean.response.ok, 'Questions page or clean URL is unavailable');
  assertContainsAll('Questions', faq.text, [
    'What it is. What you can explore. What it never pretends to know.',
    'What is Sovereign.OS?',
    'What do shadow and light mean?',
    'What does alignment mean?',
    'Can Sovereign know why another person did something?',
    'What is Covenant?',
    '/launch-polish.css?v=20260726-final-r1'
  ]);
  assertContainsAll('Questions clean URL', faqClean.text, ['What is Sovereign.OS?', 'What does Sovereign+ include?']);

  assert(privacy.response.ok && terms.response.ok, 'privacy or terms page is unavailable');
  assert(login.response.ok && signup.response.ok, 'login or signup page is unavailable');
  assert(appPage.response.ok, `workspace shell returned ${appPage.response.status}`);
  assert(invitation.response.ok, `invitation page returned ${invitation.response.status}`);
  assert(consent.response.ok, `consent page returned ${consent.response.status}`);
  assertContainsAll('consent page', consent.text, [
    'You decide what another account may use.',
    'The inviting account cannot make or change these decisions for you.',
    '/consent.css?v=20260726-consent-r1',
    '/consent.js?v=20260726-consent-r1'
  ]);
  assert(!consent.text.includes('<style>'), 'consent page still carries the retired inline visual layer');
  assert(!consent.text.includes('const labels ='), 'consent controls are still inline and blocked by CSP');
  assert(!/full account export|export features/i.test(`${home.text}\n${pricing.text}\n${faq.text}`), 'export promise is still public');

  assert(health.response.ok && health.json?.ok === true, 'health is not healthy');
  assert(health.json?.version === commitSha, 'health is not serving the deployed commit');
  assert(health.json?.migrationVersion === migrationVersion, 'health is not serving the current migration');
  assert(ready.json?.ready === true && ready.json?.version === commitSha, 'ready is not serving the deployed commit');

  const publicDocuments = [home.response, how.response, howClean.response, pricing.response, pricingClean.response, faq.response, faqClean.response, privacy.response, terms.response];
  const appDocuments = [login.response, signup.response, appPage.response, invitation.response, consent.response];
  for (const page of [...publicDocuments, ...appDocuments]) {
    assert(headerIncludes(page, 'strict-transport-security', 'max-age=31536000'), 'HSTS is missing from a document');
    assert(headerIncludes(page, 'x-content-type-options', 'nosniff'), 'nosniff is missing from a document');
    assert(headerIncludes(page, 'x-frame-options', 'deny'), 'frame denial is missing from a document');
    assert(headerIncludes(page, 'content-security-policy', "frame-ancestors 'none'"), 'document frame CSP is missing');
  }
  assert(headerIncludes(login.response, 'content-security-policy', 'challenges.cloudflare.com'), 'Turnstile CSP is missing');
  for (const page of appDocuments) {
    assert(headerIncludes(page, 'x-robots-tag', 'noindex'), 'an app-host document is indexable');
  }

  const jsAssetPath = home.text.match(/src=["'](\/assets\/[^"']+\.js)["']/)?.[1];
  assert(jsAssetPath, 'compiled JavaScript fingerprint is missing from the public document');
  const jsAsset = await readText(`${publicBase}${jsAssetPath}`);
  assert(jsAsset.response.ok, `compiled JavaScript returned ${jsAsset.response.status}`);
  assert(headerIncludes(jsAsset.response, 'cache-control', 'immutable'), 'compiled JavaScript is not immutable');

  const compiledCopy = jsAsset.text;
  assertContainsAll('compiled application copy', compiledCopy, [
    'How Sovereign.OS handles your information.',
    'Terms for using Sovereign.OS.',
    'Welcome back.',
    'Create your account.',
    'Choose what this connection may use.',
    'What is active in your life now.',
    'Explore any part of who you are.',
    'See the relationship from both sides.',
    'Understand the whole system.',
    'Return to what changed your understanding.',
    'Meet your Baseline Design.',
    'Your workspace, under your control.',
    'Know yourself. Understand the system. Choose what fits.',
    'Optional Christian and biblical lens.'
  ]);

  const cssAssetPaths = [...home.text.matchAll(/href=["'](\/assets\/[^"']+\.css)["']/g)].map((match) => match[1]);
  assert(cssAssetPaths.length > 0, 'compiled CSS fingerprint is missing from the public document');
  const cssAssets = await Promise.all(cssAssetPaths.map((path) => readText(`${publicBase}${path}`)));
  assert(cssAssets.every((asset) => asset.response.ok), 'a compiled CSS asset is unavailable');
  const compiledCss = cssAssets.map((asset) => asset.text).join('\n');
  assertContainsAll('compiled visual polish', compiledCss, [
    'polish-reveal',
    'polish-signal',
    'prefers-reduced-motion'
  ]);

  const launchPolish = await readText(`${publicBase}/launch-polish.css?v=20260726-final-r1`);
  assert(launchPolish.response.ok, 'public launch polish stylesheet is unavailable');
  assertContainsAll('public launch polish', launchPolish.text, [
    'launch-reveal',
    'animation-timeline: view()',
    'prefers-reduced-motion'
  ]);

  const consentCss = await request(`${appBase}/consent.css?v=20260726-consent-r1`);
  const consentJs = await request(`${appBase}/consent.js?v=20260726-consent-r1`);
  assert(consentCss.ok && consentJs.ok, 'consent page assets are unavailable');

  const [appRoot, publicLogin, publicConsent, appPricing, publicApi] = await Promise.all([
    request(`${appBase}/`, { redirect: 'manual' }),
    request(`${publicBase}/login`, { redirect: 'manual' }),
    request(`${publicBase}/consent.html`, { redirect: 'manual' }),
    request(`${appBase}/pricing.html`, { redirect: 'manual' }),
    request(`${publicBase}/api/v1/auth/session`, { redirect: 'manual' })
  ]);
  assert(appRoot.status === 308 && appRoot.headers.get('location')?.startsWith(`${appBase}/app`), 'app root redirect is incorrect');
  assert(publicLogin.status === 308 && publicLogin.headers.get('location')?.startsWith(`${appBase}/login`), 'public login redirect is incorrect');
  assert(publicConsent.status === 308 && publicConsent.headers.get('location')?.startsWith(`${appBase}/consent.html`), 'public consent redirect is incorrect');
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

  const stripeSignatureRejection = webhook.status === 400 && legacyWebhook.status === 400;
  const exportsDisabled = disabledExport.status === 404;
  assert(stripeSignatureRejection, 'Stripe signature rejection contract failed');
  assert(exportsDisabled, 'private export contract failed');

  const securityHeaders = health.response.headers;
  assert(securityHeaders.get('cache-control') === 'no-store', 'health cache-control is not no-store');
  assert(headerIncludes(health.response, 'strict-transport-security', 'max-age=31536000'), 'health HSTS is missing');
  assert(headerIncludes(health.response, 'x-content-type-options', 'nosniff'), 'health nosniff is missing');
  assert(headerIncludes(health.response, 'x-frame-options', 'deny'), 'health frame denial is missing');
  assert(headerIncludes(health.response, 'content-security-policy', "default-src 'none'"), 'API CSP is missing');

  const concurrentHealth = await Promise.all(Array.from({ length: 20 }, () => readJson(`${appBase}/health`)));
  assert(concurrentHealth.every((item) => item.response.ok && item.json?.version === commitSha), 'concurrent health probe failed');

  return {
    publicUrl: publicBase,
    appUrl: appBase,
    health: health.json,
    ready: ready.json,
    probes: {
      publicHome: 'passed',
      howItWorks: 'html-and-clean-url-passed',
      pricing: 'html-and-clean-url-passed',
      questions: 'html-and-clean-url-passed',
      privacy: 'passed',
      terms: 'passed',
      login: 'passed',
      signup: 'passed',
      workspaceShell: 'passed',
      invitation: 'passed',
      consent: 'page-assets-and-csp-passed',
      compiledCopy: 'all-user-facing-fingerprints-passed',
      visualPolish: 'motion-and-reduced-motion-passed',
      supportPlacementExcluded: 'passed',
      hostnameSeparation: 'passed',
      unauthenticatedAccess: 'passed',
      turnstileRequired: 'passed',
      stripeSignatureRejection: 'current-and-legacy-passed',
      exportsDisabled: 'passed',
      documentSecurityHeaders: 'passed',
      apiSecurityHeaders: 'passed',
      appNoIndex: 'passed',
      immutableAsset: jsAssetPath,
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
