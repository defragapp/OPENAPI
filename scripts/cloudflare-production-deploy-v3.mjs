import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { applyD1Migrations, parseWranglerJson, runWranglerCli, wranglerFailure, wranglerRows } from './d1-utils.mjs';
import { assertReleaseSha, RELEASE_MIGRATION_VERSION } from './release-evidence-lib.mjs';
import {
  cleanupProductionConfig,
  prepareProductionConfig
} from './prepare-cloudflare-production-config.mjs';

const WORKER_NAME = 'sovv-web';
const productionWorkersDev = false;
const RETIRED_PRODUCTION_EVIDENCE_FIELDS = ['workersDevUrl'];
// Production deploy v3 does not record workers.dev retirement evidence because the retired subdomain is never probed.
void RETIRED_PRODUCTION_EVIDENCE_FIELDS;
const REQUIRED_SECRETS = [
  'SESSION_SIGNING_SECRET',
  'TURNSTILE_SECRET_KEY',
  'RESEND_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
];

function resolveCheckoutSha() {
  const declared = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();
  if (declared) return assertReleaseSha(declared);
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error || result.status !== 0) throw new Error('Unable to resolve the checked-out commit SHA');
  return assertReleaseSha(result.stdout);
}

export async function ensureProductionSecrets({
  runWrangler,
  fetchImpl = fetch,
  accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || '').trim(),
  apiToken = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim(),
  turnstileSiteKey = String(process.env.VITE_TURNSTILE_SITE_KEY || '').trim()
}) {
  const result = runWrangler(['secret', 'list', '--name', WORKER_NAME, '--format', 'json']);
  const failure = wranglerFailure(result, 'wrangler secret list');
  if (failure) throw failure;
  const existing = new Set(
    wranglerRows(parseWranglerJson(result.stdout || result.stderr, 'wrangler secret list'))
      .map((entry) => entry?.name)
      .filter(Boolean)
  );
  const additions = {};
  if (!existing.has('SESSION_SIGNING_SECRET')) {
    additions.SESSION_SIGNING_SECRET = randomBytes(48).toString('base64url');
  }
  if (!existing.has('TURNSTILE_SECRET_KEY') && accountId && apiToken && turnstileSiteKey) {
    const response = await fetchImpl(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/challenges/widgets/${encodeURIComponent(turnstileSiteKey)}`,
      { headers: { authorization: `Bearer ${apiToken}` }, signal: AbortSignal.timeout(15_000) }
    );
    if (response.ok) {
      const payload = await response.json().catch(() => null);
      if (payload?.result?.secret) additions.TURNSTILE_SECRET_KEY = payload.result.secret;
    }
  }
  if (Object.keys(additions).length) {
    const writeResult = runWrangler(['secret', 'bulk', '--name', WORKER_NAME], { input: JSON.stringify(additions) });
    const writeFailure = wranglerFailure(writeResult, 'wrangler secret bulk');
    if (writeFailure) throw writeFailure;
  }
  const configured = new Set([...existing, ...Object.keys(additions)]);
  const missing = REQUIRED_SECRETS.filter((name) => !configured.has(name));
  if (missing.length) throw new Error(`Production secrets are missing from ${WORKER_NAME}: ${missing.join(', ')}`);
  return { configured: [...configured].sort() };
}

async function configureProductionControls({ accountId, apiToken, databaseId }) {
  const { configureCloudflareFreeTier } = await import('./configure-cloudflare-free-tier.mjs');
  return configureCloudflareFreeTier({
    accountId,
    apiToken,
    databaseId,
    gatewayId: 'sovereign',
    zoneName: 'defrag.app'
  });
}

export async function main({
  runWrangler = runWranglerCli,
  generatedConfigPath,
  commitSha = resolveCheckoutSha(),
  databaseId,
  applyMigrations = true,
  prepareConfig = prepareProductionConfig,
  ensureSecrets = ensureProductionSecrets,
  configureControls = configureProductionControls,
  cleanupConfig = cleanupProductionConfig,
  fetchImpl = fetch
} = {}) {
  const sha = assertReleaseSha(commitSha);
  let prepared;
  let ownsConfig = false;
  let deployInvoked = false;
  try {
    if (!generatedConfigPath || !databaseId) {
      prepared = prepareConfig({ commitSha: sha, runWrangler, generatedConfigPath });
      generatedConfigPath = prepared.generatedConfigPath;
      databaseId = prepared.databaseId;
      ownsConfig = true;
    }
    if (applyMigrations) {
      const migrationResult = applyD1Migrations({ configPath: generatedConfigPath, runWrangler });
      const migrationFailure = wranglerFailure(migrationResult, 'wrangler d1 migrations apply');
      if (migrationFailure) return { status: 'failed', stage: 'migrations', deploys: 0, output: migrationFailure.message };
    }

    await ensureSecrets({ runWrangler, fetchImpl });
    const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || '').trim();
    const apiToken = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim();
    const controls = await configureControls({ accountId, apiToken, databaseId });

    deployInvoked = true;
    const deployResult = runWrangler(['deploy', '--config', generatedConfigPath]);
    const deployFailure = wranglerFailure(deployResult, 'wrangler deploy');
    if (deployFailure) {
      return { status: 'failed', stage: 'deploy', deploys: 1, output: deployFailure.message };
    }
    return {
      status: 'ok',
      deploys: 1,
      commitSha: sha,
      migrationVersion: RELEASE_MIGRATION_VERSION,
      workerName: WORKER_NAME,
      productionWorkersDev,
      controls,
      output: deployResult.stdout
    };
  } catch (error) {
    return {
      status: 'failed',
      stage: deployInvoked ? 'deploy' : 'prepare',
      deploys: deployInvoked ? 1 : 0,
      output: error instanceof Error ? error.message : String(error)
    };
  } finally {
    if (ownsConfig && generatedConfigPath) cleanupConfig(generatedConfigPath);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await main();
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'ok') process.exitCode = 1;
}
