import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const workersCi = String(process.env.WORKERS_CI || '').trim() === '1';
const branch = String(process.env.WORKERS_CI_BRANCH || '').trim();
const declaredShaFromEnvironment = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();

function fail(message) {
  throw new Error(`Main-only release guard failed: ${message}`);
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

if (workersCi && branch !== 'main') {
  fail(`production builds must originate from main; received ${branch || 'an unknown branch'}`);
}

const checkoutSha = runGit(['rev-parse', 'HEAD'], 'unable to resolve the checked-out commit');
if (!/^[0-9a-f]{40}$/i.test(checkoutSha)) {
  fail('the checked-out commit is not a full 40-character SHA');
}

const declaredSha = declaredShaFromEnvironment || checkoutSha;
if (!/^[0-9a-f]{40}$/i.test(declaredSha)) {
  fail('WORKERS_CI_COMMIT_SHA is invalid and the checked-out commit could not be used');
}

if (declaredSha !== checkoutSha) {
  fail(`declared commit ${declaredSha} does not match checkout ${checkoutSha}`);
}

let currentMainSha = checkoutSha;
if (workersCi) {
  runGit(['fetch', '--quiet', '--depth=1', 'origin', 'refs/heads/main'], 'unable to refresh current origin/main');
  currentMainSha = runGit(['rev-parse', 'FETCH_HEAD'], 'unable to resolve current origin/main');
  if (!/^[0-9a-f]{40}$/i.test(currentMainSha)) {
    fail('current origin/main is not a full 40-character SHA');
  }
  if (currentMainSha !== checkoutSha) {
    fail(`commit ${checkoutSha} has been superseded by current main ${currentMainSha}; refusing a stale production release`);
  }
}

const shaSource = declaredShaFromEnvironment ? 'environment' : 'git-checkout';
console.log(`Main-only release guard verified branch=${workersCi ? branch : 'local'} commit=${checkoutSha} currentMain=${currentMainSha} shaSource=${shaSource}`);
