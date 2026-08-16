import { spawnSync } from 'node:child_process';

const checks = [
  ['node', ['scripts/scan-production-fixtures.mjs']],
  ['node', ['scripts/verify-direct-preview-config.mjs']],
  ['node', ['scripts/verify-production-release-v3.mjs', 'scripts/verify-production-release-v2.mjs']],
  ['node', ['--import', 'tsx', 'scripts/release-closure-smoke.ts']],
  ['git', ['diff', '--check']]
] as const;

for (const [cmd, args] of checks) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('Release smoke passed production_fixture_scan=true current_release_verifier=true diff_check=true');
