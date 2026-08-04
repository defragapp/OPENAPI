import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  deliverReleaseReport,
  formatReleaseReportDelivery,
  sanitizeReleaseReportOutput
} from './release-report-client.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const reportUrl = 'https://60e450a49abc97aea5.v2.appdeploy.ai/api/report';
const reportKey = 'sovereign-release-379a-9d8c4e77';
const LEGACY_DEPLOY_COMPATIBILITY = 'cloudflare-production-deploy-v2.mjs';

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
  const result = await deliverReleaseReport({
    url: reportUrl,
    key: reportKey,
    sha,
    phase: 'deploy',
    stage: 'production-deploy',
    status,
    output,
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

const checkoutSha = runGit(['rev-parse', 'HEAD'], 'unable to resolve the checked-out commit');
if (!/^[0-9a-f]{40}$/i.test(checkoutSha)) {
  fail('the checked-out commit is not a full 40-character SHA');
}

const rawDeclaredSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();
const declaredSha = /^[0-9a-f]{40}$/i.test(rawDeclaredSha) ? rawDeclaredSha : '';
if (declaredSha && declaredSha !== checkoutSha) {
  fail(`declared commit ${declaredSha} does not match checkout ${checkoutSha}`);
}

const releaseEnv = {
  ...process.env,
  WORKERS_CI_COMMIT_SHA: checkoutSha,
  GITHUB_SHA: checkoutSha,
  APP_VERSION: checkoutSha
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
for (const [label, path] of authoritativeSteps) {
  const result = runNodeScript(path, releaseEnv);
  const output = emitResult(label, result);
  combinedOutput = `${combinedOutput}\n[${label}]\n${output}`.trim();
  if (result.error || result.status !== 0) {
    await report(checkoutSha, 'failure', combinedOutput || String(result.error?.message || `exit ${result.status}`));
    if (result.error) fail(result.error.message);
    process.exit(result.status || 1);
  }
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
  await report(checkoutSha, 'failure', combinedOutput || String(evidenceResult.error?.message || `exit ${evidenceResult.status}`));
  if (evidenceResult.error) fail(evidenceResult.error.message);
  process.exit(evidenceResult.status || 1);
}

await report(checkoutSha, 'success', sanitizeReleaseReportOutput(combinedOutput));
