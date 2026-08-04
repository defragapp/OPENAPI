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
const maxOutputLength = 12_000;
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
  const result = await deliverReleaseReport({
    url: reportUrl,
    key: reportKey,
    sha,
    phase: 'build',
    stage,
    status,
    output,
    attempts: 3,
    timeoutMs: 10_000
  });
  const message = formatReleaseReportDelivery(result, { phase: 'build', stage, status });
  if (result.ok) console.log(message);
  else console.warn(message);
  return result.ok;
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
    console.error(`[cloudflare-release] stage=${stage} status=failure exit=${String(result.status ?? 'error')}`);
    process.exit(result.status || 1);
  }
  await report(checkoutSha, stage, 'success', output);
  console.log(`[cloudflare-release] stage=${stage} status=success`);
}

console.log(`[cloudflare-release] build gate complete commit=${checkoutSha}`);
