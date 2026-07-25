import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const workerDir = resolve(root, 'apps/sovereign-worker');
const workerName = process.env.PREVIEW_WORKER_NAME || 'sovereign-openapi-preview';
const d1Name = process.env.PREVIEW_D1_NAME || 'sovereign-openapi-preview-db';
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const commitSha = process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || 'local';
const workersCi = process.env.WORKERS_CI === '1';
const configuredPreviewBaseUrl = String(process.env.PREVIEW_BASE_URL || '').replace(/\/+$/, '');
const accountSubdomain = String(process.env.CLOUDFLARE_WORKERS_SUBDOMAIN || '').trim();
const previewBaseUrl =
  configuredPreviewBaseUrl ||
  (accountSubdomain ? `https://${workerName}.${accountSubdomain}.workers.dev` : '');
const previewHostname = previewBaseUrl ? new URL(previewBaseUrl).hostname : '';
const env = { ...process.env };

if (accountId) env.CLOUDFLARE_ACCOUNT_ID = accountId;
if (token) env.CLOUDFLARE_API_TOKEN = token;

if (workersCi && !process.env.PREVIEW_SESSION_SIGNING_SECRET) {
  throw new Error('PREVIEW_SESSION_SIGNING_SECRET is required in Cloudflare Workers Builds');
}
if (workersCi && !previewBaseUrl) {
  throw new Error(
    'PREVIEW_BASE_URL or CLOUDFLARE_WORKERS_SUBDOMAIN is required in Cloudflare Workers Builds'
  );
}

const sensitiveValues = [
  token,
  process.env.PREVIEW_SESSION_SIGNING_SECRET,
  process.env.STRIPE_SECRET_KEY,
  process.env.STRIPE_WEBHOOK_SECRET,
  process.env.SOVV_INTERNAL_AUTH_TOKEN,
  process.env.TURNSTILE_SECRET_KEY,
  process.env.EMAIL_API_TOKEN
].filter(Boolean);

function sanitize(value) {
  let sanitized = String(value ?? '');
  for (const secret of sensitiveValues) sanitized = sanitized.replaceAll(secret, '[redacted]');
  return sanitized;
}

function run(args, options = {}) {
  const hasInput = options.input !== undefined;
  const capture = Boolean(options.capture || hasInput);
  const result = spawnSync(
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
  if (result.status !== 0) {
    const detail = capture ? sanitize(result.stderr || result.stdout) : 'see Wrangler output above';
    throw new Error(`wrangler ${args.join(' ')} failed: ${detail}`);
  }
  return result.stdout ?? '';
}

function parseJsonOutput(output) {
  const trimmed = output.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const starts = [trimmed.indexOf('{'), trimmed.indexOf('[')].filter((index) => index >= 0);
    if (starts.length === 0) {
      throw new Error(`Expected JSON from Wrangler, received: ${sanitize(trimmed)}`);
    }
    return JSON.parse(trimmed.slice(Math.min(...starts)));
  }
}

function findDatabaseId(listJson) {
  const rows = Array.isArray(listJson) ? listJson : (listJson.result ?? listJson.databases ?? []);
  const match = rows.find((item) => item.name === d1Name || item.database_name === d1Name);
  return match?.uuid ?? match?.id ?? match?.database_id;
}

function runD1Json(args) {
  try {
    return parseJsonOutput(run(args, { capture: true }));
  } catch (error) {
    throw new Error(
      `Cloudflare build token must include Account D1 Edit permission. ${sanitize(error.message)}`
    );
  }
}

let databaseId = findDatabaseId(runD1Json(['d1', 'list', '--json']));
let createdDatabase = false;
if (!databaseId) {
  const created = runD1Json(['d1', 'create', d1Name, '--json']);
  databaseId = created.uuid ?? created.id ?? created.result?.uuid ?? created.result?.id;
  createdDatabase = true;
}
if (!databaseId) throw new Error('Unable to resolve preview D1 database id');

const configPath = resolve(workerDir, '.wrangler.preview.generated.jsonc');
try {
  const config = JSON.parse(readFileSync(resolve(workerDir, 'wrangler.jsonc'), 'utf8'));
  config.name = workerName;
  config.env.preview.name = workerName;
  config.env.preview.workers_dev = true;
  config.env.preview.preview_urls = false;
  config.env.preview.d1_databases = [
    { binding: 'DB', database_name: d1Name, database_id: databaseId }
  ];
  config.env.preview.vars = {
    ...config.env.preview.vars,
    APP_ENV: 'preview',
    APP_VERSION: commitSha,
    PUBLIC_APP_URL: previewBaseUrl,
    AI_PROVIDER: process.env.AI_PROVIDER || config.env.preview.vars.AI_PROVIDER,
    AI_MODEL: process.env.AI_MODEL || config.env.preview.vars.AI_MODEL,
    AI_GATEWAY_ID: process.env.AI_GATEWAY_ID || config.env.preview.vars.AI_GATEWAY_ID,
    SOVV_INTERNAL_BASE_URL: process.env.SOVV_BASE_URL || '',
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY:
      process.env.STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY || '',
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL:
      process.env.STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL || '',
    STRIPE_SUCCESS_URL: previewBaseUrl ? `${previewBaseUrl}/app?billing=success` : '',
    STRIPE_CANCEL_URL: previewBaseUrl ? `${previewBaseUrl}/app?billing=cancelled` : '',
    STRIPE_PORTAL_RETURN_URL: previewBaseUrl ? `${previewBaseUrl}/app?billing=portal` : '',
    TURNSTILE_EXPECTED_HOSTNAME: process.env.TURNSTILE_EXPECTED_HOSTNAME || previewHostname,
    EMAIL_API_URL: process.env.EMAIL_API_URL || '',
    EMAIL_FROM: process.env.EMAIL_FROM || '',
    EMAIL_TIMEOUT_MS: process.env.EMAIL_TIMEOUT_MS || '2500',
    ASTRONOMY_API_URL: process.env.ASTRONOMY_API_URL || '',
    BASELINE_HORIZONS_URL:
      process.env.BASELINE_HORIZONS_URL || config.env.preview.vars.BASELINE_HORIZONS_URL,
    BASELINE_PROVIDER_TIMEOUT_MS:
      process.env.BASELINE_PROVIDER_TIMEOUT_MS || config.env.preview.vars.BASELINE_PROVIDER_TIMEOUT_MS,
    SCRIPTURE_TRANSLATION: process.env.SCRIPTURE_TRANSLATION || 'WEB'
  };
  // One preview serves both signup and login, so do not set a single global
  // TURNSTILE_EXPECTED_ACTION unless the verifier is changed to accept both actions.
  delete config.env.preview.vars.TURNSTILE_EXPECTED_ACTION;
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  try {
    run(['d1', 'migrations', 'apply', d1Name, '--remote', '--env', 'preview', '--config', configPath]);
  } catch (error) {
    throw new Error(
      `Remote D1 migration failed. Confirm the build token has D1 Edit permission. ${sanitize(error.message)}`
    );
  }

  // The Worker must exist before runtime secrets can be attached. This first deploy
  // also provisions draft R2 and Queue bindings when the build token has permission.
  run(['deploy', '--env', 'preview', '--config', configPath]);

  const secrets = Object.fromEntries(
    Object.entries({
      SESSION_SIGNING_SECRET: process.env.PREVIEW_SESSION_SIGNING_SECRET,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      SOVV_INTERNAL_AUTH_TOKEN: process.env.SOVV_INTERNAL_AUTH_TOKEN,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
      EMAIL_API_TOKEN: process.env.EMAIL_API_TOKEN
    }).filter(([, value]) => Boolean(value))
  );

  if (Object.keys(secrets).length > 0) {
    try {
      run(['secret', 'bulk', '--env', 'preview', '--config', configPath], {
        input: JSON.stringify(secrets)
      });
    } catch (error) {
      throw new Error(`Runtime secret upload failed after initial deploy. ${sanitize(error.message)}`);
    }
  }

  // Final deploy guarantees the exact commit/config is active after secret updates.
  const deployOutput = run(['deploy', '--env', 'preview', '--config', configPath], {
    capture: true
  });
  const deployedUrl =
    deployOutput.match(/https:\/\/[^\s]+\.workers\.dev/)?.[0] || previewBaseUrl;
  if (!deployedUrl) {
    throw new Error('Wrangler did not report a workers.dev URL and PREVIEW_BASE_URL is not set');
  }

  const metadata = {
    workerName,
    d1Name,
    createdDatabase,
    deployedUrl,
    previewBaseUrl: deployedUrl,
    databaseIdSource: 'cloudflare-api',
    commitSha,
    buildUuid: process.env.WORKERS_CI_BUILD_UUID || null,
    configuredIntegrations: {
      turnstile: Boolean(process.env.VITE_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY),
      email: Boolean(process.env.EMAIL_API_URL && process.env.EMAIL_API_TOKEN && process.env.EMAIL_FROM),
      baseline: {
        configured: Boolean(config.env.preview.vars.BASELINE_HORIZONS_URL),
        mode: 'openapi-owned-geocentric-v2',
        birthplaceGeocoder: 'disabled'
      },
      legacySovv: Boolean(process.env.SOVV_BASE_URL),
      stripeTest: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
    }
  };
  writeFileSync(resolve(root, 'preview-deployment.json'), JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify({ ...metadata, databaseIdSource: 'resolved-not-printed' }, null, 2));
} finally {
  rmSync(configPath, { force: true });
}
