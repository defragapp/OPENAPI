import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const workerDir = resolve(root, 'apps/sovereign-worker');
const workerName = process.env.PREVIEW_WORKER_NAME || 'sovereign-openapi-preview';
const d1Name = process.env.PREVIEW_D1_NAME || 'sovereign-openapi-preview-db';
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;

if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is required for preview bootstrap');
if (!token) throw new Error('CLOUDFLARE_API_TOKEN is required for preview bootstrap');

const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId, CLOUDFLARE_API_TOKEN: token };

function run(args, options = {}) {
  const result = spawnSync('pnpm', ['--filter', '@sovereign/worker', 'exec', 'wrangler', ...args], { cwd: root, encoding: 'utf8', stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', env });
  if (result.status !== 0) {
    const detail = options.capture ? sanitize(result.stderr || result.stdout) : 'see Wrangler output';
    throw new Error(`wrangler ${args.join(' ')} failed: ${detail}`);
  }
  return result.stdout ?? '';
}

function sanitize(value) {
  return String(value).replaceAll(token, '[redacted-cloudflare-token]');
}

function parseJsonOutput(output) {
  const trimmed = output.trim();
  const start = Math.min(...[trimmed.indexOf('{'), trimmed.indexOf('[')].filter((index) => index >= 0));
  return JSON.parse(start >= 0 ? trimmed.slice(start) : trimmed);
}

function findDatabaseId(listJson) {
  const rows = Array.isArray(listJson) ? listJson : (listJson.result ?? listJson.databases ?? []);
  const match = rows.find((item) => item.name === d1Name || item.database_name === d1Name);
  return match?.uuid ?? match?.id ?? match?.database_id;
}

let databaseId = findDatabaseId(parseJsonOutput(run(['d1', 'list', '--json'], { capture: true })));
let createdDatabase = false;
if (!databaseId) {
  const created = parseJsonOutput(run(['d1', 'create', d1Name, '--json'], { capture: true }));
  databaseId = created.uuid ?? created.id ?? created.result?.uuid ?? created.result?.id;
  createdDatabase = true;
}
if (!databaseId) throw new Error('Unable to resolve preview D1 database id');

const configPath = resolve(workerDir, '.wrangler.preview.generated.jsonc');
try {
  const config = JSON.parse(readFileSync(resolve(workerDir, 'wrangler.jsonc'), 'utf8'));
  config.name = workerName;
  config.env.preview.name = workerName;
  config.env.preview.d1_databases = [{ binding: 'DB', database_name: d1Name, database_id: databaseId }];
  config.env.preview.vars = {
    ...config.env.preview.vars,
    APP_ENV: 'preview',
    APP_VERSION: process.env.GITHUB_SHA || config.env.preview.vars.APP_VERSION,
    AI_PROVIDER: process.env.AI_PROVIDER || config.env.preview.vars.AI_PROVIDER,
    AI_MODEL: process.env.AI_MODEL || config.env.preview.vars.AI_MODEL,
    AI_GATEWAY_ID: process.env.AI_GATEWAY_ID || config.env.preview.vars.AI_GATEWAY_ID,
    SOVV_INTERNAL_BASE_URL: process.env.SOVV_BASE_URL || '',
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: process.env.STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY || '',
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: process.env.STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL || '',
    STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL || `https://${workerName}.workers.dev/app?billing=success`,
    STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL || `https://${workerName}.workers.dev/app?billing=cancelled`,
    STRIPE_PORTAL_RETURN_URL: process.env.STRIPE_PORTAL_RETURN_URL || `https://${workerName}.workers.dev/app?billing=portal`,
    SCRIPTURE_TRANSLATION: process.env.SCRIPTURE_TRANSLATION || 'WEB'
  };
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  run(['d1', 'migrations', 'apply', d1Name, '--remote', '--env', 'preview', '--config', configPath]);

  const secrets = {
    SESSION_SIGNING_SECRET: process.env.PREVIEW_SESSION_SIGNING_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    SOVV_INTERNAL_AUTH_TOKEN: process.env.SOVV_INTERNAL_AUTH_TOKEN
  };
  for (const [name, value] of Object.entries(secrets)) {
    if (!value) continue;
    const result = spawnSync('pnpm', ['--filter', '@sovereign/worker', 'exec', 'wrangler', 'secret', 'put', name, '--env', 'preview', '--config', configPath], { cwd: root, input: value, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], env });
    if (result.status !== 0) throw new Error(`wrangler secret put ${name} failed: ${sanitize(result.stderr || result.stdout)}`);
  }

  const deployOutput = run(['deploy', '--env', 'preview', '--config', configPath], { capture: true });
  const deployedUrl = deployOutput.match(/https:\/\/[^\s]+\.workers\.dev/)?.[0] ?? `https://${workerName}.workers.dev`;
  const metadata = { workerName, d1Name, createdDatabase, deployedUrl, databaseIdSource: 'cloudflare-api', commitSha: process.env.GITHUB_SHA ?? 'local' };
  writeFileSync(resolve(root, 'preview-deployment.json'), JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify({ ...metadata, databaseIdSource: 'resolved-not-printed' }, null, 2));
} finally {
  rmSync(configPath, { force: true });
}
