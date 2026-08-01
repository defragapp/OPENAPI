import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

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

const checkoutSha = runGit(['rev-parse', 'HEAD'], 'unable to resolve the checked-out commit');
if (!/^[0-9a-f]{40}$/i.test(checkoutSha)) {
  fail('the checked-out commit is not a full 40-character SHA');
}

const rawDeclaredSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();
const declaredSha = /^[0-9a-f]{40}$/i.test(rawDeclaredSha) ? rawDeclaredSha : '';
if (declaredSha && declaredSha !== checkoutSha) {
  fail(`declared commit ${declaredSha} does not match checkout ${checkoutSha}`);
}

const result = spawnSync(process.execPath, ['scripts/cloudflare-production-deploy-v2.mjs'], {
  cwd: root,
  env: {
    ...process.env,
    WORKERS_CI_COMMIT_SHA: checkoutSha,
    GITHUB_SHA: checkoutSha,
    APP_VERSION: checkoutSha
  },
  stdio: 'inherit'
});

if (result.error) fail(result.error.message);
if (result.status !== 0) process.exit(result.status || 1);
