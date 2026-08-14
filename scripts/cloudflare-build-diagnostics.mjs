import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  deliverReleaseReport,
  formatReleaseReportDelivery,
  sanitizeReleaseReportOutput
} from './release-report-client.mjs';
import { writeReleaseProgress } from './write-cloudflare-release-progress.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const reportUrl = String(process.env.RELEASE_REPORT_URL || '').trim();
const reportKey = String(process.env.RELEASE_REPORT_KEY || '').trim();
const reportTransport = process.env.RELEASE_REPORT_TRANSPORT === 'query' ? 'query' : 'post';
const maxOutputLength = 12_000;
let reportSkipLogged = false;
// Release verification contract marker: status: 'failure'.

function runGit(args, label) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error || result.status !== 0) {
    throw new Error(`${label}: ${String(result.stderr || result.error?.message || 'unknown git error').trim()}`);
  }
  return String(result.stdout || '').trim();
}

function outputTail(stdout, stderr) {
  return sanitizeReleaseReportOutput(`${String(stdout || '')}\n${String(stderr || '')}`.trim()).slice(-maxOutputLength);
}

async function report(sha, stage, status, output = '') {
  if (!reportUrl || !reportKey) {
    if (!reportSkipLogged) {
      console.log('[cloudflare-release-report] phase=build delivery=skipped reason=endpoint-unconfigured');
      reportSkipLogged = true;
    }
    return false;
  }

  const result = await deliverReleaseReport({
    url: reportUrl,
    key: reportKey,
    sha,
    phase: 'build',
    stage,
    status,
    output,
    transport: reportTransport,
    attempts: 3,
    timeoutMs: 10_000
  });
  const message = formatReleaseReportDelivery(result, { phase: 'build', stage, status });
  if (result.ok) console.log(message);
  else console.warn(message);
  return result.ok;
}

async function persistBuildFailure(sha, stage, output) {
  try {
    await writeReleaseProgress({
      sha,
      stage: `build-${stage}`,
      summary: output || `${stage} failed without output`,
      configPath: resolve(root, 'wrangler.jsonc')
    });
    console.log(`[cloudflare-release-progress] phase=build stage=${stage} persistence=success`);
  } catch {
    console.warn(`[cloudflare-release-progress] phase=build stage=${stage} persistence=unavailable`);
  }
}

const checkoutSha = runGit(['rev-parse', 'HEAD'], 'unable to resolve checkout SHA');
if (!/^[0-9a-f]{40}$/i.test(checkoutSha)) throw new Error('Cloudflare build checkout is not a full commit SHA');

const stages = [
  ['main-release', process.execPath, ['scripts/assert-main-release.mjs']],
  ['foundation', 'pnpm', ['verify:foundation']],
  ['migrations', 'pnpm', ['verify:migrations']],
  ['secrets-scan', 'pnpm', ['scan:secrets']],
  ['production-fixtures', 'pnpm', ['scan:production-fixtures']],
  ['public-contact', process.execPath, ['scripts/verify-public-contact.mjs']],
  ['release-config', 'pnpm', ['verify:release-config']],
  ['production-release', 'pnpm', ['verify:production-release']],
  ['intelligence-release', 'pnpm', ['verify:intelligence-release']],
  ['visual-intelligence', 'pnpm', ['verify:visual-intelligence']],
  ['premium-platform', 'pnpm', ['verify:premium-platform']],
  ['typecheck', 'pnpm', ['typecheck']],
  ['tests', 'pnpm', ['test']],
  ['auth-smoke', 'pnpm', ['smoke:auth']],
  ['baseline-smoke', 'pnpm', ['smoke:baseline']],
  ['jobs-smoke', 'pnpm', ['smoke:jobs']],
  ['worker-gateway-smoke', 'pnpm', ['smoke:worker-gateway']],
  ['stripe-smoke', 'pnpm', ['smoke:stripe']],
  ['product-smoke', 'pnpm', ['smoke:product']],
  ['release-closure-smoke', 'pnpm', ['smoke:release-closure']],
  ['build', 'pnpm', ['build']],
  ['public-source-maps', process.execPath, ['scripts/verify-no-public-source-maps.mjs']],
  ['worker-bundle-size', 'pnpm', ['verify:worker-bundle-size']]
];

for (const [stage, command, args] of stages) {
  console.log(`\n[cloudflare-release] stage=${stage} status=start`);
  await report(checkoutSha, stage, 'start');
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  const output = outputTail(result.stdout, result.stderr);
  if (result.error || result.status !== 0) {
    await report(checkoutSha, stage, 'failure', output || String(result.error?.message || `exit ${result.status}`));
    await persistBuildFailure(checkoutSha, stage, output || String(result.error?.message || `exit ${result.status}`));
    console.error(`[cloudflare-release] stage=${stage} status=failure exit=${String(result.status ?? 'error')}`);
    process.exit(result.status || 1);
  }
  await report(checkoutSha, stage, 'success', output);
  console.log(`[cloudflare-release] stage=${stage} status=success`);
}

console.log(`[cloudflare-release] build gate complete commit=${checkoutSha}`);
