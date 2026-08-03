import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

function sanitize(value) {
  return String(value || '')
    .replace(/cfat_[A-Za-z0-9_-]+/g, '[redacted-cloudflare-token]')
    .replace(/\bsk-(?:live|test|proj)?[_A-Za-z0-9-]+/g, '[redacted-api-key]')
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
    .replace(/(CLOUDFLARE_API_TOKEN|CF_API_TOKEN|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|RESEND_API_KEY)=\S+/g, '$1=[redacted]');
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function report(sha, status, output = '') {
  const payload = JSON.stringify({
    key: reportKey,
    sha,
    phase: 'deploy',
    stage: 'production-deploy',
    status,
    output: sanitize(output).slice(-12_000)
  });

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(reportUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
        signal: AbortSignal.timeout(10_000)
      });
      if (response.ok) return true;
    } catch {
      // Retry below. Telemetry is non-authoritative and never controls release success.
    }
    if (attempt < 3) await delay(attempt * 1_000);
  }

  return false;
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
const steps = [
  ['deploy-v4', 'scripts/cloudflare-production-deploy-v4.mjs'],
  ['verify-runtime-v3', 'scripts/verify-parent-domain-routes-v3.mjs'],
  ['verify-secondary-public', 'scripts/verify-live-secondary-public.mjs'],
  ['verify-route-cohesion', 'scripts/verify-live-route-cohesion.mjs'],
  ['verify-rendered-visuals', 'scripts/verify-live-visual-release-v3.mjs']
];

void LEGACY_DEPLOY_COMPATIBILITY;
await report(checkoutSha, 'start');
let combinedOutput = '';
for (const [label, path] of steps) {
  const result = runNodeScript(path, releaseEnv);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  const output = `${String(result.stdout || '')}\n${String(result.stderr || '')}`.trim();
  combinedOutput = `${combinedOutput}\n[${label}]\n${output}`.trim();
  if (result.error || result.status !== 0) {
    await report(checkoutSha, 'failure', combinedOutput || String(result.error?.message || `exit ${result.status}`));
    if (result.error) fail(result.error.message);
    process.exit(result.status || 1);
  }
}
await report(checkoutSha, 'success', combinedOutput);
