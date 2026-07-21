import { spawnSync } from 'node:child_process';
const filesResult = spawnSync('git', ['ls-files'], { encoding: 'utf8' });
if (filesResult.status !== 0) process.exit(filesResult.status ?? 1);
const files = filesResult.stdout.split('\n').filter((file) => file && file !== 'pnpm-lock.yaml' && file !== 'scripts/scan-secrets.mjs');
if (!files.length) {
  console.log('No committed files to scan.');
  process.exit(0);
}
const secretPattern = '(sk-live-|sk_test_|wh' + 'sec_|OPENAI_API_KEY=sk-|cf_[A-Za-z0-9_-]{20,})';
const result = spawnSync('git', ['grep', '-nE', secretPattern, '--', ...files], { encoding: 'utf8' });
if (result.status === 0 && result.stdout.trim()) {
  console.error(result.stdout.trim());
  throw new Error('Potential secret detected');
}
if (result.status && result.status !== 1) {
  console.error(result.stderr);
  process.exit(result.status);
}
console.log('No committed secret patterns detected.');
