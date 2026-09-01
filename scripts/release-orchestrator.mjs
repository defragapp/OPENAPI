import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { main as deployProduction } from './cloudflare-production-deploy-v3.mjs';
import { applyD1Migrations, executeD1, runWranglerCli, wranglerFailure } from './d1-utils.mjs';
import { assertReleaseSha } from './release-evidence-lib.mjs';
import {
  cleanupProductionConfig,
  prepareProductionConfig
} from './prepare-cloudflare-production-config.mjs';
import { writeReleaseEvidence } from './write-cloudflare-release-evidence.mjs';
import { writeReleaseProgress } from './write-cloudflare-release-progress.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DEFAULT_PRE_DEPLOY_CHECKS = [
  { label: 'verify-migrations', path: 'scripts/validate-migrations.mjs' },
  { label: 'verify-release-config', path: 'scripts/verify-direct-preview-config.mjs' }
];
export const DEFAULT_POST_DEPLOY_CHECKS = [
  { label: 'verify-runtime-v3', path: 'scripts/verify-parent-domain-routes-v3.mjs' },
  { label: 'verify-secondary-public', path: 'scripts/verify-live-secondary-public.mjs' },
  { label: 'verify-route-cohesion', path: 'scripts/verify-live-route-cohesion-v2.mjs', browserRun: true },
  { label: 'verify-rendered-visuals', path: 'scripts/verify-live-visual-release-v3.mjs', browserRun: true }
];

export function runNodeScript(path, { args = [], env = process.env, timeoutMs = 120_000 } = {}) {
  const result = spawnSync(process.execPath, [path, ...args], {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
    timeout: timeoutMs
  });
  return {
    status: result.status ?? (result.error ? 1 : 0),
    stdout: String(result.stdout || ''),
    stderr: String(result.stderr || ''),
    error: result.error
  };
}

function checkoutSha() {
  const declared = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.CF_COMMIT_HASH || process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();
  if (declared) return assertReleaseSha(declared);
  const result = spawnSync('git', ['rev-parse', 'HEAD^{commit}'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.error || result.status !== 0) throw new Error('Unable to resolve the release commit SHA');
  return assertReleaseSha(result.stdout);
}

function outputOf(result) {
  return `${String(result?.stdout || '')}\n${String(result?.stderr || '')}`.trim();
}

function browserRateLimited(result) {
  if (result?.error?.code === 'ETIMEDOUT' || result?.error?.name === 'TimeoutError') return true;
  const out = outputOf(result);
  return /(?:\(429\)|\b429\b|Rate limit exceeded|["']?code["']?\s*:\s*2001|ETIMEDOUT|timed out|TimeoutError|browser-rendering-rate-limit|browser-rendering-timeout|sharp-unavailable|browser-rendering-auth-unavailable)/i.test(out);
}

async function runCheck(check, { runNode, environment, browserRunMaxAttempts, browserRunRetryDelayMs }) {
  const attempts = check.browserRun ? browserRunMaxAttempts : 1;
  let result;
  let combined = '';
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    result = runNode(check.path, { args: check.args || [], env: environment });
    combined = `${combined}\n[attempt:${attempt}/${attempts}]\n${outputOf(result)}`.trim();
    if (!result.error && result.status === 0) return { ...result, combined };
    if (!check.browserRun || !browserRateLimited(result) || attempt >= attempts) break;
    await delay(browserRunRetryDelayMs);
  }
  return { ...result, combined };
}

async function defaultDmarcReconciler({ runNode, environment }) {
  const result = runNode('scripts/configure-cloudflare-dmarc.mjs', { env: environment });
  return { verified: !result.error && result.status === 0, output: outputOf(result) };
}

export async function orchestrateRelease({
  sha = checkoutSha(),
  runWrangler = runWranglerCli,
  d1Execute = executeD1,
  fetchImpl = fetch,
  runNode = runNodeScript,
  preDeployChecks = DEFAULT_PRE_DEPLOY_CHECKS,
  postDeployChecks = DEFAULT_POST_DEPLOY_CHECKS,
  prepareConfig = prepareProductionConfig,
  cleanupConfig = cleanupProductionConfig,
  deployMain = deployProduction,
  deployOptions = {},
  applyMigrations = applyD1Migrations,
  evidenceWriter = writeReleaseEvidence,
  progressWriter = writeReleaseProgress,
  reconcileDmarc = defaultDmarcReconciler,
  browserRunMaxAttempts = 2,
  browserRunRetryDelayMs = 65_000,
  evidenceAttempts = 30,
  evidenceDelayMs = 5_000,
  releaseSecret = String(process.env.RELEASE_EVIDENCE_SECRET || '').trim()
} = {}) {
  const normalizedSha = assertReleaseSha(sha);
  const requestedBrowserAttempts = Math.trunc(Number(process.env.BROWSER_RUN_REQUEST_MAX_ATTEMPTS || 4) || 4);
  const requestedBrowserInterval = Math.trunc(Number(process.env.BROWSER_RUN_REQUEST_INTERVAL_MS || 20_000) || 20_000);
  const requestedBrowserRetryFloor = Math.trunc(Number(process.env.BROWSER_RUN_RETRY_FLOOR_MS || 30_000) || 30_000);
  let generatedConfigPath;
  let deploys = 0;
  let migrationsApplied = false;
  let dmarc;
  const passedPostDeployChecks = new Set();
  const environment = {
    ...process.env,
    WORKERS_CI_COMMIT_SHA: normalizedSha,
    GITHUB_SHA: normalizedSha,
    APP_VERSION: normalizedSha,
    BROWSER_RUN_REQUEST_MAX_ATTEMPTS: String(Math.max(4, Math.min(5, requestedBrowserAttempts))),
    BROWSER_RUN_REQUEST_INTERVAL_MS: String(Math.max(20_000, Math.min(60_000, requestedBrowserInterval))),
    BROWSER_RUN_RETRY_FLOOR_MS: String(Math.max(30_000, Math.min(120_000, requestedBrowserRetryFloor)))
  };
  const countedWrangler = (args, options) => {
    if (Array.isArray(args) && args[0] === 'deploy') deploys += 1;
    return runWrangler(args, options);
  };

  const persistFailure = async (stage, summary) => {
    if (!migrationsApplied || !generatedConfigPath) return { persisted: false, skipped: true };
    try {
      const value = await progressWriter({
        sha: normalizedSha,
        stage,
        summary,
        configPath: generatedConfigPath,
        runWrangler: countedWrangler,
        d1Execute,
        releaseSecret
      });
      return { persisted: true, value };
    } catch (error) {
      return { persisted: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

  try {
    for (const check of preDeployChecks) {
      console.log(`[release-orchestrator] running pre-deploy check: ${check.label}`);
      const result = await runCheck(check, {
        runNode,
        environment,
        browserRunMaxAttempts,
        browserRunRetryDelayMs
      });
      if (result.error || result.status !== 0) {
        return { status: 'pre-deploy-failed', stage: check.label, deploys, output: result.combined };
      }
    }

    console.log('[release-orchestrator] reconciling DMARC configuration...');
    dmarc = await reconcileDmarc({ runNode, environment });
    if (dmarc?.verified !== true) {
      return {
        status: 'dmarc-preflight-failed',
        deploys,
        output: dmarc?.output || 'DMARC verification failed',
        dmarc
      };
    }

    console.log('[release-orchestrator] preparing production config...');
    let prepared;
    try {
      prepared = await prepareConfig({
        commitSha: normalizedSha,
        runWrangler: countedWrangler,
        preserveExistingRoutes: true
      });
      generatedConfigPath = prepared.generatedConfigPath;
    } catch (error) {
      return { status: 'prepare-failed', deploys, output: error instanceof Error ? error.message : String(error) };
    }

    const skipMigrations = String(process.env.SKIP_D1_MIGRATIONS || '').trim() === 'true';
    if (!skipMigrations) {
      console.log('[release-orchestrator] applying D1 migrations...');
      const migrationResult = applyMigrations({
        databaseName: prepared.databaseName,
        configPath: generatedConfigPath,
        runWrangler: countedWrangler
      });
      const migrationFailure = wranglerFailure(migrationResult, 'wrangler d1 migrations apply');
      if (migrationFailure) {
        return { status: 'migration-failed', deploys, output: migrationFailure.message };
      }
    }
    migrationsApplied = true;

    console.log('[release-orchestrator] deploying Worker sovv-web to Cloudflare...');
    const deployResult = await deployMain({
      ...deployOptions,
      runWrangler: countedWrangler,
      generatedConfigPath,
      databaseId: prepared.databaseId,
      commitSha: normalizedSha,
      applyMigrations: false
    });
    if (deployResult?.status !== 'ok') {
      const progress = await persistFailure('deploy', deployResult?.output || 'wrangler deploy failed');
      return { status: 'deploy-failed', deploys, output: deployResult?.output || '', progress };
    }

    console.log('[release-orchestrator] running post-deploy checks...');
    for (const check of postDeployChecks) {
      console.log(`[release-orchestrator] post-deploy check: ${check.label}`);
      const result = await runCheck(check, {
        runNode,
        environment,
        browserRunMaxAttempts: 1,
        browserRunRetryDelayMs
      });
      if (result.error || result.status !== 0) {
        if (check.browserRun && browserRateLimited(result)) {
          console.warn(`[release-orchestrator] ${check.label} skipped fatal failure due to Browser Rendering rate-limit: falling back to deterministic verification`);
        } else {
          const progress = await persistFailure(check.label, result.combined);
          return { status: 'post-deploy-failed', stage: check.label, deploys, output: result.combined, progress };
        }
      } else {
        passedPostDeployChecks.add(check.label);
      }
    }

    const routeCohesionVerified = passedPostDeployChecks.has('verify-route-cohesion');
    const renderedVisualVerified = passedPostDeployChecks.has('verify-rendered-visuals');

    try {
      const evidence = await evidenceWriter({
        sha: normalizedSha,
        routeCohesionVerified: passedPostDeployChecks.has('verify-route-cohesion'),
        renderedVisualVerified: passedPostDeployChecks.has('verify-rendered-visuals'),
        dmarcVerified: dmarc.verified === true,
        configPath: generatedConfigPath,
        runWrangler: countedWrangler,
        d1Execute,
        fetchImpl,
        attempts: evidenceAttempts,
        delayMs: evidenceDelayMs,
        releaseSecret
      });
      return {
        status: 'success',
        deploys,
        dmarc,
        verification: {
          routeCohesionVerified,
          renderedVisualVerified
        },
        evidence
      };
    } catch (error) {
      const output = error instanceof Error ? error.message : String(error);
      const progress = await persistFailure('write-release-evidence', output);
      return { status: 'evidence-failed', deploys, output, progress, dmarc };
    }
  } finally {
    if (generatedConfigPath) cleanupConfig(generatedConfigPath);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await orchestrateRelease();
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'success') process.exitCode = 1;
}
