import { existsSync, readFileSync } from 'node:fs';

const workerConfig = JSON.parse(readFileSync('apps/sovereign-worker/wrangler.jsonc', 'utf8'));
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const readme = readFileSync('README.md', 'utf8');
const bootstrap = readFileSync('scripts/cloudflare-preview-bootstrap.mjs', 'utf8');
const preview = workerConfig.env?.preview;

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

requireValue(workerConfig.main === 'src/runtime-entry.ts', 'Worker must use the active OPENAPI runtime entry');
requireValue(preview?.name === 'sovereign-openapi-preview', 'Preview Worker name drifted');
requireValue(preview?.workers_dev === true, 'Preview must deploy to workers.dev');
requireValue(preview?.preview_urls === false, 'Versioned preview URLs must remain disabled');
requireValue(preview?.vars?.APP_ENV === 'preview', 'Preview environment must be explicit');
requireValue(preview?.d1_databases?.some((item) => item.binding === 'DB'), 'Preview is missing D1');
requireValue(preview?.durable_objects?.bindings?.some((item) => item.name === 'THREADS'), 'Preview is missing Durable Object coordination');
requireValue(preview?.queues?.producers?.some((item) => item.binding === 'JOBS'), 'Preview is missing Queue producer');
requireValue(preview?.queues?.consumers?.length, 'Preview is missing Queue consumer');
requireValue(preview?.ai?.binding === 'AI', 'Preview is missing Workers AI');
requireValue(preview?.assets?.binding === 'ASSETS', 'Preview is missing static assets');
requireValue(!preview?.r2_buckets?.length, 'R2 must remain disabled for visual-review preview');

requireValue(packageJson.scripts?.['verify:cloudflare-build']?.includes('verify:release-config'), 'Canonical build must retain release verification');
requireValue(packageJson.scripts?.['verify:release-config'] === 'node scripts/verify-direct-preview-config.mjs', 'Release verifier must use direct preview contract');
requireValue(packageJson.scripts?.['preview:bootstrap'] === 'node scripts/cloudflare-preview-bootstrap.mjs', 'Preview bootstrap command drifted');

requireValue(!existsSync('wrangler.jsonc'), 'Fork-oriented root Wrangler config must not exist');
requireValue(!existsSync('.dev.vars.example'), 'Deploy-template secret form must not exist');
requireValue(!existsSync('scripts/verify-one-click-deploy.mjs'), 'One-click fork verifier must not exist');
requireValue(!readme.includes('deploy.workers.cloudflare.com'), 'README must not use Deploy to Cloudflare');
requireValue(readme.includes('defragapp/OPENAPI'), 'README must name the canonical repository');
requireValue(readme.includes('R2 is intentionally excluded from preview'), 'README must document no-R2 preview');

for (const required of ['PREVIEW_BASE_URL', 'PREVIEW_SESSION_SIGNING_SECRET', "['deploy', '--env', 'preview'", 'sovereign-openapi-preview-db']) {
  requireValue(bootstrap.includes(required), `Preview bootstrap is missing ${required}`);
}

console.log('Direct Cloudflare preview verified existing_repo=true fork=false r2=false d1=true durable_objects=true queues=true ai=true assets=true');
