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
const turnstileSiteKey = String(process.env.VITE_TURNSTILE_SITE_KEY || '').trim();

if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is required');
if (!/^[0-9a-f]{40}$/i.test(commitSha)) throw new Error('A full 40-character commit SHA is required');

const env = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: accountId
};
if (apiToken) env.CLOUDFLARE_API_TOKEN = apiToken;

const sensitiveValues = [apiToken].filter(Boolean);

function sanitize(value) {
  let output = String(value ?? '');
  for (const secret of sensitiveValues) output = output.replaceAll(secret, '[redacted]');
  return output;
}

function runWrangler(args, options = {}) {
  const capture = options.capture !== false;
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
  // Cloudflare Workers Builds authenticates Wrangler internally without exposing
  // its token to the build. Preserve the existing Worker secret in that mode.
  if (!turnstileSiteKey || !apiToken) return undefined;
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/challenges/widgets/${encodeURIComponent(turnstileSiteKey)}`,
      { headers: { authorization: `Bearer ${apiToken}` } }
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

let createdDatabase = false;
let databaseId;

try {
  databaseId = findDatabaseId(parseJsonOutput(runWrangler(['d1', 'list', '--json'])));
  if (!databaseId) {
    const created = parseJsonOutput(runWrangler(['d1', 'create', d1Name, '--json']));
    databaseId = created.uuid ?? created.id ?? created.result?.uuid ?? created.result?.id;
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

  // The first deployment provisions Queue, Durable Object, Workers AI and assets.
  // Existing encrypted secrets on sovv-web are preserved by Wrangler.
  runWrangler(['deploy', '--config', generatedConfigPath], { capture: false });

  const existingSecrets = new Set(
    rows(parseJsonOutput(runWrangler([
      'secret', 'list',
      '--config', generatedConfigPath,
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
    runWrangler(['secret', 'bulk', '--config', generatedConfigPath], {
      input: JSON.stringify(secrets)
    });
  }

  const finalDeployOutput = runWrangler(['deploy', '--config', generatedConfigPath]);
  const workersDevUrl = finalDeployOutput.match(/https:\/\/[^\s]+\.workers\.dev/)?.[0] || null;

  const metadata = {
    workerName,
    commitSha,
    d1Name,
    createdDatabase,
    queueName: 'sovereign-openapi-jobs',
    workersDevUrl,
    publicUrl: 'https://defrag.app',
    r2Enabled: false,
    sessionSecretCreated: Object.hasOwn(secrets, 'SESSION_SIGNING_SECRET'),
    turnstileSecretConfigured: existingSecrets.has('TURNSTILE_SECRET_KEY') || Object.hasOwn(secrets, 'TURNSTILE_SECRET_KEY')
  };
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata, null, 2));
} finally {
  rmSync(generatedConfigPath, { force: true });
}
