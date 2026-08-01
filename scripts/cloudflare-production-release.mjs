import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

function fail(message) {
  throw new Error(`Cloudflare production release failed: ${message}`);
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    stdio: 'inherit'
  });
  if (result.error || result.status !== 0) {
    fail(`${command} ${args.join(' ')} exited with ${result.status ?? 'an execution error'}`);
  }
}

function readGit(args, label) {
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

const checkoutSha = readGit(['rev-parse', 'HEAD'], 'unable to resolve checked-out commit');
if (!/^[0-9a-f]{40}$/i.test(checkoutSha)) {
  fail('checked-out commit is not a full 40-character SHA');
}

const suppliedSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();
if (suppliedSha && suppliedSha !== checkoutSha) {
  fail(`supplied commit ${suppliedSha} does not match checkout ${checkoutSha}`);
}

const releaseEnv = {
  ...process.env,
  WORKERS_CI_COMMIT_SHA: checkoutSha,
  GITHUB_SHA: checkoutSha,
  APP_VERSION: checkoutSha
};

run(process.execPath, ['scripts/assert-main-release.mjs'], releaseEnv);
run(process.execPath, ['scripts/cloudflare-production-deploy-v2.mjs'], releaseEnv);
run(process.execPath, ['scripts/verify-parent-domain-routes.mjs'], releaseEnv);
