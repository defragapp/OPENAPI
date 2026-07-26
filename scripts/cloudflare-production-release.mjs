import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const workerDir = resolve(root, 'apps/sovereign-worker');
const mode = process.argv[2];
const allowedModes = new Set(['candidate', 'migrate', 'promote', 'rollback']);
if (!allowedModes.has(mode)) {
  throw new Error('Usage: node scripts/cloudflare-production-release.mjs <candidate|migrate|promote|rollback>');
}

const workerName = required('PRODUCTION_WORKER_NAME');
const accountId = required('CLOUDFLARE_ACCOUNT_ID');
const token = required('CLOUDFLARE_API_TOKEN');
const commitSha = resolveCommitSha();
const shortSha = commitSha.slice(0, 12);
const env = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CLOUDFLARE_API_TOKEN: token
};
const noProvisionFlags = ['--experimental-provision=false', '--experimental-auto-create=false'];
const sensitiveValues = [
  token,
  process.env.PRODUCTION_RELEASE_APPROVAL
].filter(Boolean);

function required(name) {
  const value = String(process.env[name] ?? '').trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function sanitize(value) {
  let output = String(value ?? '');
  for (const secret of sensitiveValues) output = output.replaceAll(secret, '[redacted]');
  return output;
}

function runBinary(binary, args, options = {}) {
  const capture = options.capture !== false;
  const result = spawnSync(binary, args, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    input: options.input,
    stdio: capture ? ['pipe', 'pipe', 'pipe'] : 'inherit',
    env: { ...env, ...(options.extraEnv ?? {}) }
  });
  if (result.status !== 0) {
    throw new Error(`${binary} ${args.join(' ')} failed: ${sanitize(result.stderr || result.stdout)}`);
  }
  return result.stdout ?? '';
}

function runWrangler(args, options = {}) {
  return runBinary(
    'pnpm',
    ['--filter', '@sovereign/worker', 'exec', 'wrangler', ...args],
    options
  );
}

function parseJsonOutput(output) {
  const trimmed = output.trim();
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

function resolveCommitSha() {
  const configured = String(
    process.env.RELEASE_COMMIT_SHA ||
    process.env.WORKERS_CI_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    ''
  ).trim();
  const gitHeadResult = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  const gitHead = gitHeadResult.status === 0 ? gitHeadResult.stdout.trim() : '';
  const value = configured || gitHead;
  if (!/^[0-9a-f]{40}$/i.test(value)) throw new Error('A full 40-character RELEASE_COMMIT_SHA is required');
  if (configured && gitHead && configured !== gitHead) {
    throw new Error(`Release commit ${configured} does not match checked-out HEAD ${gitHead}`);
  }
  return value.toLowerCase();
}

function requireApproval(action, suffix = commitSha) {
  const expected = `${action}:${suffix}`;
  if (process.env.PRODUCTION_RELEASE_APPROVAL !== expected) {
    throw new Error(`PRODUCTION_RELEASE_APPROVAL must equal ${expected}`);
  }
}

function assertHttpsBaseUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('PRODUCTION_BASE_URL must use HTTPS');
  if (url.username || url.password || url.search || url.hash) throw new Error('PRODUCTION_BASE_URL must not include credentials, query, or fragment');
  if (url.pathname !== '/' && url.pathname !== '') throw new Error('PRODUCTION_BASE_URL must be an origin without a path');
  if (url.hostname.includes('sovereign-openapi-preview')) throw new Error('PRODUCTION_BASE_URL must not use the isolated preview hostname');
  return url;
}

function ensureTrackedTreeIsClean() {
  const result = spawnSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: root, encoding: 'utf8' });
  if (result.status === 0 && result.stdout.trim()) {
    throw new Error('Production release requires an exact clean commit');
  }
}

function findD1DatabaseId(name) {
  const listed = parseJsonOutput(runWrangler(['d1', 'list', '--json', ...noProvisionFlags]));
  const match = rows(listed).find((item) => item.name === name || item.database_name === name);
  const id = match?.uuid ?? match?.id ?? match?.database_id;
  if (!id) throw new Error(`Production D1 database ${name} does not exist; this release tool never creates production storage`);
  return id;
}

function buildProductionConfig() {
  const baseUrl = required('PRODUCTION_BASE_URL').replace(/\/+$/, '');
  const base = assertHttpsBaseUrl(baseUrl);
  const d1Name = required('PRODUCTION_D1_NAME');
  const r2BucketName = required('PRODUCTION_R2_BUCKET_NAME');
  const queueName = required('PRODUCTION_QUEUE_NAME');
  const turnstileHostname = required('TURNSTILE_EXPECTED_HOSTNAME');
  if (turnstileHostname !== base.hostname) {
    throw new Error('TURNSTILE_EXPECTED_HOSTNAME must exactly match PRODUCTION_BASE_URL hostname');
  }

  for (const name of [
    'VITE_TURNSTILE_SITE_KEY',
    'EMAIL_API_URL',
    'EMAIL_FROM',
    'STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY',
    'STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL'
  ]) required(name);

  const config = JSON.parse(readFileSync(resolve(workerDir, 'wrangler.jsonc'), 'utf8'));
  config.name = workerName;
  config.preview_urls = false;
  config.vars = {
    ...config.vars,
    APP_ENV: 'production',
    APP_VERSION: commitSha,
    PUBLIC_APP_URL: baseUrl,
    AI_PROVIDER: process.env.AI_PROVIDER || config.vars.AI_PROVIDER,
    AI_MODEL: process.env.AI_MODEL || config.vars.AI_MODEL,
    AI_GATEWAY_ID: process.env.AI_GATEWAY_ID || config.vars.AI_GATEWAY_ID,
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: required('STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY'),
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: required('STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL'),
    STRIPE_SUCCESS_URL: `${baseUrl}/app?billing=success`,
    STRIPE_CANCEL_URL: `${baseUrl}/app?billing=cancelled`,
    STRIPE_PORTAL_RETURN_URL: `${baseUrl}/app?billing=portal`,
    TURNSTILE_EXPECTED_HOSTNAME: turnstileHostname,
    EMAIL_API_URL: required('EMAIL_API_URL'),
    EMAIL_FROM: required('EMAIL_FROM'),
    EMAIL_TIMEOUT_MS: process.env.EMAIL_TIMEOUT_MS || '2500',
    BASELINE_HORIZONS_URL: process.env.BASELINE_HORIZONS_URL || config.vars.BASELINE_HORIZONS_URL,
    BASELINE_PROVIDER_TIMEOUT_MS: process.env.BASELINE_PROVIDER_TIMEOUT_MS || config.vars.BASELINE_PROVIDER_TIMEOUT_MS,
    SCRIPTURE_TRANSLATION: process.env.SCRIPTURE_TRANSLATION || 'WEB'
  };
  delete config.env;
  config.d1_databases = [{ binding: 'DB', database_name: d1Name, database_id: findD1DatabaseId(d1Name) }];
  config.r2_buckets = [{ binding: 'ARTIFACTS', bucket_name: r2BucketName }];
  config.queues = {
    producers: [{ binding: 'JOBS', queue: queueName }],
    consumers: [{ queue: queueName, max_batch_size: 10, max_batch_timeout: 30 }]
  };

  const configPath = resolve(workerDir, '.wrangler.production.generated.jsonc');
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  return { configPath, baseUrl, d1Name, r2BucketName, queueName };
}

function verifyRuntimeSecrets(configPath) {
  const requiredSecrets = [
    'SESSION_SIGNING_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'TURNSTILE_SECRET_KEY',
    'EMAIL_API_TOKEN'
  ];
  const listed = parseJsonOutput(runWrangler(['secret', 'list', '--config', configPath, '--format', 'json', ...noProvisionFlags]));
  const names = new Set(rows(listed).map((item) => item.name));
  const missing = requiredSecrets.filter((name) => !names.has(name));
  if (missing.length) throw new Error(`Production Worker is missing runtime secrets: ${missing.join(', ')}`);
}

function wranglerOutput(args, configPath) {
  const tmpDir = resolve(root, '.tmp');
  mkdirSync(tmpDir, { recursive: true });
  const outputPath = resolve(tmpDir, `wrangler-${mode}-${Date.now()}.jsonl`);
  const wranglerArgs = configPath ? [...args, '--config', configPath] : args;
  const stdout = runWrangler(wranglerArgs, {
    extraEnv: { WRANGLER_OUTPUT_FILE: outputPath }
  });
  let entries = [];
  try {
    entries = readFileSync(outputPath, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    // Wrangler stdout remains available as a fallback for older output formats.
  } finally {
    rmSync(outputPath, { force: true });
  }
  return { stdout, entries };
}

function versionIdFrom(result) {
  const entry = result.entries.find((item) => item.type === 'version-upload' || item.type === 'version-deploy');
  return entry?.version_id ?? entry?.versionId ?? result.stdout.match(/[0-9a-f]{8}-[0-9a-f-]{27,}/i)?.[0];
}

ensureTrackedTreeIsClean();

if (mode === 'rollback') {
  const rollbackVersion = required('PRODUCTION_ROLLBACK_VERSION_ID');
  requireApproval('rollback', rollbackVersion);
  const output = runWrangler([
    'rollback', rollbackVersion,
    '--name', workerName,
    '--message', `Rollback Sovereign.OS to ${rollbackVersion}`
  ]);
  console.log(JSON.stringify({ mode, workerName, rollbackVersion, output: sanitize(output.trim()) }, null, 2));
  process.exit(0);
}

if (mode === 'promote') {
  const versionId = required('PRODUCTION_VERSION_ID');
  requireApproval('promote', `${commitSha}:${versionId}`);
  if (process.env.PRODUCTION_PREVIEW_APPROVED_SHA !== commitSha) {
    throw new Error('PRODUCTION_PREVIEW_APPROVED_SHA must match the release commit');
  }
  if (process.env.PRODUCTION_MIGRATIONS_APPLIED_SHA !== commitSha) {
    throw new Error('PRODUCTION_MIGRATIONS_APPLIED_SHA must match the release commit');
  }
  if (!String(process.env.PRODUCTION_APPROVAL_EVIDENCE_URL || '').startsWith('https://')) {
    throw new Error('PRODUCTION_APPROVAL_EVIDENCE_URL must link to the reviewed release evidence');
  }
  const result = wranglerOutput([
    'versions', 'deploy',
    '--name', workerName,
    '--version-id', versionId,
    '--percentage', '100',
    '--message', `Sovereign.OS ${commitSha}`,
    '--yes',
    ...noProvisionFlags
  ]);
  console.log(JSON.stringify({ mode, workerName, commitSha, versionId, deployedVersionId: versionIdFrom(result) || versionId }, null, 2));
  process.exit(0);
}

const generated = buildProductionConfig();
try {
  if (mode === 'migrate') {
    requireApproval('migrate');
    if (process.env.PRODUCTION_MIGRATIONS_BACKWARD_COMPATIBLE !== 'YES') {
      throw new Error('PRODUCTION_MIGRATIONS_BACKWARD_COMPATIBLE must equal YES');
    }
    const before = runWrangler(['d1', 'migrations', 'list', generated.d1Name, '--remote', '--config', generated.configPath, ...noProvisionFlags]);
    runWrangler(['d1', 'migrations', 'apply', generated.d1Name, '--remote', '--config', generated.configPath, ...noProvisionFlags], { capture: false });
    console.log(JSON.stringify({ mode, commitSha, d1Name: generated.d1Name, automaticBackup: true, migrationPlan: sanitize(before.trim()) }, null, 2));
    process.exit(0);
  }

  requireApproval('candidate');
  verifyRuntimeSecrets(generated.configPath);
  const result = wranglerOutput([
    'versions', 'upload',
    '--message', `Sovereign.OS release candidate ${commitSha}`,
    '--tag', `release-${shortSha}`,
    ...noProvisionFlags
  ], generated.configPath);
  const versionId = versionIdFrom(result);
  if (!versionId) throw new Error('Wrangler did not report the uploaded production version ID');
  const metadata = {
    mode,
    workerName,
    commitSha,
    versionId,
    tag: `release-${shortSha}`,
    baseUrl: generated.baseUrl,
    d1Name: generated.d1Name,
    r2BucketName: generated.r2BucketName,
    queueName: generated.queueName,
    trafficPromoted: false
  };
  writeFileSync(resolve(root, 'production-candidate.json'), JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata, null, 2));
} finally {
  rmSync(generated.configPath, { force: true });
}
