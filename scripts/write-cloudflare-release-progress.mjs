import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceConfigPath = resolve(root, 'wrangler.production-direct.jsonc');
const canonicalConfigPath = resolve(root, 'wrangler.jsonc');
const generatedConfigPath = resolve(root, '.wrangler.release-progress.generated.jsonc');
const progressAssetPath = resolve(root, 'apps/web/dist/release-progress.json');
const DATABASE_NAME = 'sovereign-openapi-db';
const WORKER_NAME = 'sovv-web';
const APP_BASE = 'https://app.defrag.app';
const PROGRESS_CONTRACT = 'sovereign-production-release-progress.v1';
const MAX_SUMMARY_LENGTH = 2_000;

function fail(message) {
  throw new Error(`Cloudflare release progress failed: ${message}`);
}

function sanitize(value) {
  return String(value || '')
    .replace(/cfat_[A-Za-z0-9_-]+/g, '[redacted-cloudflare-token]')
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
    .replace(/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9_-]+/g, '[redacted-provider-key]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(-MAX_SUMMARY_LENGTH);
}

function runGit(args, label) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.error || result.status !== 0) {
    fail(`${label}: ${String(result.stderr || result.error?.message || `exit ${result.status}`).trim()}`);
  }
  return String(result.stdout || '').trim();
}

function parseJsonOutput(output, label) {
  const text = String(output || '').trim();
  if (!text) fail(`${label} returned no JSON`);
  try {
    return JSON.parse(text);
  } catch {
    const starts = [text.indexOf('{'), text.indexOf('[')].filter((index) => index >= 0);
    if (!starts.length) fail(`${label} did not return JSON: ${text.slice(0, 500)}`);
    try {
      return JSON.parse(text.slice(Math.min(...starts)));
    } catch {
      fail(`${label} returned invalid JSON: ${text.slice(0, 500)}`);
    }
  }
}

function rows(value) {
  if (Array.isArray(value)) return value;
  return value?.result || value?.databases || [];
}

function resolveCommitSha() {
  const declared = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();
  const checkout = runGit(['rev-parse', 'HEAD'], 'unable to resolve checkout SHA');
  if (!/^[0-9a-f]{40}$/i.test(checkout)) fail('checkout SHA is invalid');
  if (declared && declared !== checkout) fail(`declared commit ${declared} does not match checkout ${checkout}`);
  return checkout;
}

function executeWrangler(args) {
  const result = spawnSync('pnpm', ['--filter', '@sovereign/worker', 'exec', 'wrangler', ...args], {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    fail(`wrangler ${args.join(' ')} failed: ${String(result.stderr || result.error?.message || `exit ${result.status}`).trim()}`);
  }
  return String(result.stdout || '');
}

function validateProgress(value, sha) {
  return Boolean(
    value
    && typeof value === 'object'
    && value.contract === PROGRESS_CONTRACT
    && value.sha === sha
    && typeof value.stage === 'string'
    && /^[a-z0-9-]{2,80}$/.test(value.stage)
    && value.status === 'failure'
    && typeof value.summary === 'string'
    && value.summary.length > 0
    && value.summary.length <= MAX_SUMMARY_LENGTH
    && typeof value.failedAt === 'string'
  );
}

async function readProgress(sha) {
  let lastError = 'no response';
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(`${APP_BASE}/release-progress.json?sha=${sha}&attempt=${attempt}`, {
        headers: { 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(15_000)
      });
      const text = await response.text();
      const payload = JSON.parse(text);
      if (response.ok && validateProgress(payload, sha)) return payload;
      lastError = `status=${response.status} sha=${payload?.sha || 'missing'} stage=${payload?.stage || 'missing'}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    if (attempt < 30) await new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000));
  }
  fail(`failure progress deployment did not converge: ${lastError}`);
}

function selfTest() {
  const tokenLike = ['cf', 'at_', 'example-value'].join('');
  const bearerLike = ['Bear', 'er ', 'abc.def.ghi'].join('');
  const providerLike = ['sk', '_live_', 'example-value'].join('');
  const sanitized = sanitize(`failure ${tokenLike} ${bearerLike} ${providerLike}`);
  if (sanitized.includes(tokenLike) || sanitized.includes('abc.def.ghi') || sanitized.includes(providerLike)) {
    fail('self-test redaction failed');
  }
  const sampleSha = 'a'.repeat(40);
  const sample = {
    contract: PROGRESS_CONTRACT,
    sha: sampleSha,
    stage: 'verify-route-cohesion',
    status: 'failure',
    summary: sanitized,
    failedAt: new Date(0).toISOString()
  };
  if (!validateProgress(sample, sampleSha)) fail('self-test contract validation failed');
  console.log(`Release progress contract verified contract=${PROGRESS_CONTRACT} redaction=true fail-closed=true`);
}

if (process.argv.includes('--self-test')) {
  selfTest();
} else {
  const sha = resolveCommitSha();
  const stage = String(process.env.RELEASE_PROGRESS_STAGE || '').trim();
  const status = String(process.env.RELEASE_PROGRESS_STATUS || '').trim();
  const summary = sanitize(process.env.RELEASE_PROGRESS_SUMMARY || 'authoritative release step failed without output');

  if (!/^[a-z0-9-]{2,80}$/.test(stage)) fail('RELEASE_PROGRESS_STAGE is invalid');
  if (status !== 'failure') fail('only fail-closed failure progress may be published');
  if (!summary) fail('RELEASE_PROGRESS_SUMMARY is empty after sanitization');

  const progress = {
    contract: PROGRESS_CONTRACT,
    sha,
    stage,
    status: 'failure',
    summary,
    failedAt: new Date().toISOString()
  };

  mkdirSync(resolve(root, 'apps/web/dist'), { recursive: true });
  writeFileSync(progressAssetPath, `${JSON.stringify(progress, null, 2)}\n`);

  const canonicalConfig = JSON.parse(readFileSync(canonicalConfigPath, 'utf8'));
  const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || canonicalConfig.account_id || '').trim();
  if (!/^[0-9a-f]{32}$/i.test(accountId)) fail('a valid Cloudflare account ID is required');
  if (!String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim()) {
    fail('CLOUDFLARE_API_TOKEN is required for the failure progress deployment');
  }

  const databases = rows(parseJsonOutput(executeWrangler(['d1', 'list', '--json']), 'wrangler d1 list'));
  const database = databases.find((item) => item?.name === DATABASE_NAME || item?.database_name === DATABASE_NAME);
  const databaseId = database?.uuid || database?.id || database?.database_id;
  if (!databaseId) fail(`unable to resolve D1 database ${DATABASE_NAME}`);

  const config = JSON.parse(readFileSync(sourceConfigPath, 'utf8'));
  config.account_id = accountId;
  config.name = WORKER_NAME;
  config.vars.APP_VERSION = sha;
  config.d1_databases = [{
    binding: 'DB',
    database_name: DATABASE_NAME,
    database_id: databaseId,
    migrations_dir: 'apps/sovereign-worker/migrations'
  }];
  writeFileSync(generatedConfigPath, JSON.stringify(config, null, 2));

  try {
    executeWrangler(['deploy', '--config', generatedConfigPath]);
    const published = await readProgress(sha);
    console.log(JSON.stringify({ releaseProgress: published, failureProgressDeploy: true }, null, 2));
  } finally {
    rmSync(generatedConfigPath, { force: true });
  }
}
