import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const workersCi = String(process.env.WORKERS_CI || '').trim() === '1';
const branch = String(process.env.WORKERS_CI_BRANCH || '').trim();
const declaredSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();

function fail(message) {
  throw new Error(`Main-only release guard failed: ${message}`);
}

if (workersCi && branch !== 'main') {
  fail(`production builds must originate from main; received ${branch || 'an unknown branch'}`);
}

const head = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
});

if (head.error || head.status !== 0) {
  fail(`unable to resolve the checked-out commit: ${head.stderr || head.error?.message || 'unknown git error'}`);
}

const checkoutSha = String(head.stdout || '').trim();
if (!/^[0-9a-f]{40}$/i.test(checkoutSha)) {
  fail('the checked-out commit is not a full 40-character SHA');
}

if (workersCi && !/^[0-9a-f]{40}$/i.test(declaredSha)) {
  fail('WORKERS_CI_COMMIT_SHA is missing or invalid');
}

if (declaredSha && declaredSha !== checkoutSha) {
  fail(`declared commit ${declaredSha} does not match checkout ${checkoutSha}`);
}

console.log(`Main-only release guard verified branch=${workersCi ? branch : 'local'} commit=${checkoutSha}`);
