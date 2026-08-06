import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import {
  deliverReleaseReport,
  formatReleaseReportDelivery,
  sanitizeReleaseReportOutput
} from './release-report-client.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const reportUrl = String(process.env.RELEASE_REPORT_URL || '').trim();
const reportKey = String(process.env.RELEASE_REPORT_KEY || '').trim();
const reportTransport = process.env.RELEASE_REPORT_TRANSPORT === 'query' ? 'query' : 'post';
const productionHealthUrl = 'https://app.defrag.app/health';
const LEGACY_DEPLOY_COMPATIBILITY = 'cloudflare-production-deploy-v2.mjs';
const browserRunRetryDelayMs = Math.min(
  120_000,
  Math.max(15_000, Number(process.env.BROWSER_RUN_RATE_LIMIT_RETRY_MS || 65_000) || 65_000)
);
const browserRunMaxAttempts = 1;
const browserVerificationLabels = new Set(['verify-route-cohesion', 'verify-rendered-visuals']);
let reportSkipLogged = false;

function fail(message) {
  throw new Error(`Cloudflare production release failed: ${message}`);
}

function runGit(args, label) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.error || result.status !== 0) {
    fail(`${label}: ${String(result.stderr || result.error?.message || 'unknown git error').trim()}`);
  }
  return String(result.stdout || '').trim();
}

async function report(sha, status, output = '') {
  if (!reportUrl || !reportKey) {
    if (!reportSkipLogged) {
      console.log('[cloudflare-release-report] phase=deploy delivery=skipped reason=endpoint-unconfigured');
      reportSkipLogged = true;
    }
    return false;
  }

  const result = await deliverReleaseReport({
    url: reportUrl,
    key: reportKey,
    sha,
    phase: 'deploy',
    stage: 'production-deploy',
    status,
    output,
    transport: reportTransport,
    attempts: 3,
    timeoutMs: 10_000
  });
  const message = formatReleaseReportDelivery(result, {
    phase: 'deploy',
    stage: 'production-deploy',
    status
  });
  if (result.ok) console.log(message);
  else console.warn(message);
  return result.ok;
}

async function liveCandidateIsDeployed(sha) {
  try {
    const response = await fetch(productionHealthUrl, {
      headers: { accept: 'application/json', 'cache-control': 'no-cache' },
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) return false;
    const payload = await response.json().catch(() => null);
    return payload?.version === sha;
  } catch {
    return false;
  }
}

function runNodeScript(path, environment) {
  return spawnSync(process.execPath, [path], {
    cwd: root,
    env: environment,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024
  });
}

function emitResult(label, result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return `${String(result.stdout || '')}\n${String(result.stderr || '')}`.trim();
}

function isBrowserRunRateLimit(output) {
  return /(?:\(429\)|\b429\b|Rate limit exceeded|["']?code["']?\s*:\s*2001)/i.test(String(output || ''));
}

function publishFailureProgress(sha, stage, output, environment) {
  const summary = sanitizeReleaseReportOutput(output || `${stage} failed`).slice(-6_000);
  const progressResult = runNodeScript('scripts/write-cloudflare-release-progress.mjs', {
    ...environment,
    WORKERS_CI_COMMIT_SHA: sha,
    GITHUB_SHA: sha,
    APP_VERSION: sha,
    RELEASE_PROGRESS_STAGE: stage,
    RELEASE_PROGRESS_STATUS: 'failure',
    RELEASE_PROGRESS_SUMMARY: summary
  });
  const progressOutput = emitResult('write-release-progress', progressResult);
  if (progressResult.error || progressResult.status !== 0) {
    process.stderr.write(
      `[cloudflare-release] stage=write-release-progress status=failure originalStage=${stage} `
      + `detail=${sanitizeReleaseReportOutput(progressOutput || progressResult.error?.message || `exit ${progressResult.status}`).slice(-800)}\n`
    );
    return false;
  }
  process.stderr.write(`[cloudflare-release] stage=write-release-progress status=success originalStage=${stage}\n`);
  return true;
}

async function runAuthoritativeStep(label, path, environment) {
  const retryable = label === 'verify-route-cohesion';
  const maxAttempts = retryable ? browserRunMaxAttempts : 1;
  let collectedOutput = '';
  let result;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    result = runNodeScript(path, environment);
    const output = emitResult(label, result);
    collectedOutput = `${collectedOutput}\n[attempt:${attempt}/${maxAttempts}]\n${output}`.trim();

    if (!result.error && result.status === 0) {
      return { result, output: collectedOutput };
    }

    const rateLimited = retryable && isBrowserRunRateLimit(output);
    if (!rateLimited || attempt >= maxAttempts) {
      return { result, output: collectedOutput };
    }

    process.stderr.write(
      `[cloudflare-release] stage=${label} status=retry reason=browser-run-rate-limit `
      + `attempt=${attempt}/${maxAttempts} waitMs=${browserRunRetryDelayMs}\n`
    );
    await delay(browserRunRetryDelayMs);
  }

  return { result, output: collectedOutput };
}

const checkoutSha = runGit(['rev-parse', 'HEAD'], 'unable to resolve the checked-out commit');
if (!/^[0-9a-f]{40}$/i.test(checkoutSha)) {
  fail('the checked-out commit is not a full 40-character SHA');
}

const rawDeclaredSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();
const declaredSha = /^[0-9a-f]{40}$/i.test(rawDeclaredSha) ? rawDeclaredSha : '';
if (declaredSha && declaredSha !== checkoutSha) {
  fail(`declared commit ${declaredSha} does not match checkout ${checkoutSha}`);
}

const requestedBrowserAttempts = Math.trunc(Number(process.env.BROWSER_RUN_REQUEST_MAX_ATTEMPTS || 4) || 4);
const requestedBrowserInterval = Math.trunc(Number(process.env.BROWSER_RUN_REQUEST_INTERVAL_MS || 20_000) || 20_000);
const requestedBrowserRetryFloor = Math.trunc(Number(process.env.BROWSER_RUN_RETRY_FLOOR_MS || 30_000) || 30_000);
const releaseEnv = {
  ...process.env,
  WORKERS_CI_COMMIT_SHA: checkoutSha,
  GITHUB_SHA: checkoutSha,
  APP_VERSION: checkoutSha,
  BROWSER_RUN_REQUEST_MAX_ATTEMPTS: String(Math.max(4, Math.min(5, requestedBrowserAttempts))),
  BROWSER_RUN_REQUEST_INTERVAL_MS: String(Math.max(20_000, Math.min(60_000, requestedBrowserInterval))),
  BROWSER_RUN_RETRY_FLOOR_MS: String(Math.max(30_000, Math.min(120_000, requestedBrowserRetryFloor)))
};
const authoritativeSteps = [
  ['deploy-v3', 'scripts/cloudflare-production-deploy-v3.mjs'],
  ['verify-runtime-v3', 'scripts/verify-parent-domain-routes-v3.mjs'],
  ['verify-secondary-public', 'scripts/verify-live-secondary-public.mjs'],
  ['verify-route-cohesion', 'scripts/verify-live-route-cohesion.mjs'],
  ['verify-rendered-visuals', 'scripts/verify-live-visual-release-v3.mjs']
];

void LEGACY_DEPLOY_COMPATIBILITY;
await report(checkoutSha, 'start');
let combinedOutput = '';
let deferredBrowserVerification = null;
for (const [label, path] of authoritativeSteps) {
  const step = await runAuthoritativeStep(label, path, releaseEnv);
  const result = step.result;
  const output = step.output;
  combinedOutput = `${combinedOutput}\n[${label}]\n${output}`.trim();
  if (!result || result.error || result.status !== 0) {
    const candidateIsLive = label !== 'deploy-v3' || await liveCandidateIsDeployed(checkoutSha);
    if (candidateIsLive) {
      publishFailureProgress(checkoutSha, label, output, releaseEnv);
    } else {
      process.stderr.write(
        `[cloudflare-release] stage=write-release-progress status=skipped originalStage=${label} reason=candidate-not-live\n`
      );
    }
    await report(checkoutSha, 'failure', combinedOutput || String(result?.error?.message || `exit ${result?.status}`));

    const browserRunBlocked = Boolean(
      candidateIsLive
      && browserVerificationLabels.has(label)
      && isBrowserRunRateLimit(output)
    );
    if (browserRunBlocked) {
      deferredBrowserVerification = { label };
      break;
    }

    if (result?.error) fail(result.error.message);
    process.exit(result?.status || 1);
  }
}

if (deferredBrowserVerification) {
  process.stderr.write(
    `[cloudflare-release] deployment=success verification=deferred reason=browser-run-rate-limit `
    + `stage=${deferredBrowserVerification.label} commit=${checkoutSha}\n`
  );
  process.exit(0);
}

const dmarcResult = runNodeScript('scripts/configure-cloudflare-dmarc.mjs', releaseEnv);
const dmarcOutput = emitResult('reconcile-dmarc', dmarcResult);
const dmarcVerified = !dmarcResult.error && dmarcResult.status === 0;
combinedOutput = `${combinedOutput}\n[reconcile-dmarc:${dmarcVerified ? 'verified' : 'external-blocker'}]\n${dmarcOutput}`.trim();
if (!dmarcVerified) {
  process.stderr.write('[cloudflare-release] DMARC reconciliation is non-authoritative; application release evidence will record the external DNS blocker.\n');
}

const evidenceEnv = {
  ...releaseEnv,
  RELEASE_DMARC_VERIFIED: dmarcVerified ? 'true' : 'false'
};
const evidenceResult = runNodeScript('scripts/write-cloudflare-release-evidence.mjs', evidenceEnv);
const evidenceOutput = emitResult('write-release-evidence', evidenceResult);
combinedOutput = `${combinedOutput}\n[write-release-evidence]\n${evidenceOutput}`.trim();
if (evidenceResult.error || evidenceResult.status !== 0) {
  publishFailureProgress(checkoutSha, 'write-release-evidence', evidenceOutput || evidenceResult.error?.message || `exit ${evidenceResult.status}`, releaseEnv);
  await report(checkoutSha, 'failure', combinedOutput || String(evidenceResult.error?.message || `exit ${evidenceResult.status}`));
  if (evidenceResult.error) fail(evidenceResult.error.message);
  process.exit(evidenceResult.status || 1);
}

await report(checkoutSha, 'success', sanitizeReleaseReportOutput(combinedOutput));