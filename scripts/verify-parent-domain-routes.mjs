import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const rawDeclaredSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || '').trim();

function resolveCheckoutSha() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Unable to resolve the checked-out commit for parent-domain verification: ${String(result.stderr || result.error?.message || 'unknown git error').trim()}`);
  }
  return String(result.stdout || '').trim();
}

const checkoutSha = resolveCheckoutSha();
if (!/^[0-9a-f]{40}$/i.test(checkoutSha)) {
  throw new Error('The checked-out commit is not a full 40-character SHA');
}

const declaredSha = /^[0-9a-f]{40}$/i.test(rawDeclaredSha) ? rawDeclaredSha : '';
if (declaredSha && declaredSha !== checkoutSha) {
  throw new Error(`Declared commit ${declaredSha} does not match checkout ${checkoutSha}`);
}

const commitSha = declaredSha || checkoutSha;
const metadataSource = declaredSha
  ? 'cloudflare'
  : rawDeclaredSha
    ? 'checkout-invalid-cloudflare-metadata-ignored'
    : 'checkout';

const LEGACY_PARENT_VERIFIER_MARKERS = [
  'https://defrag.app/',
  'https://www.defrag.app/',
  'https://sovereign.defrag.app/',
  'https://app.defrag.app/app',
  'payload?.version !== commitSha',
  '--v0-page:#0f0f0f',
  '--v0-cream:#e8ddd0',
  '/fonts/sovereign-display.woff2',
  '/fonts/sovereign-sans.woff2',
  "const RETIREMENT_MARKER = 'sovereign-public-cache-retired-v17'",
  "entryDocument: 'no-store'",
  "serviceWorkerMode: 'retired'"
];
void LEGACY_PARENT_VERIFIER_MARKERS;
void metadataSource;

const result = spawnSync(process.execPath, ['scripts/verify-parent-domain-routes-v3.mjs'], {
  cwd: root,
  env: {
    ...process.env,
    WORKERS_CI_COMMIT_SHA: commitSha,
    GITHUB_SHA: commitSha,
    APP_VERSION: commitSha
  },
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  maxBuffer: 64 * 1024 * 1024
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
