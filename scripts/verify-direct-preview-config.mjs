import { existsSync, readFileSync } from 'node:fs';

const rootConfig = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const workerConfig = JSON.parse(readFileSync('apps/sovereign-worker/wrangler.jsonc', 'utf8'));
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const readme = readFileSync('README.md', 'utf8');
const bootstrap = readFileSync('scripts/cloudflare-preview-bootstrap.mjs', 'utf8');
const productionDeploy = readFileSync('scripts/cloudflare-direct-production-deploy.mjs', 'utf8');
const preview = workerConfig.env?.preview;

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

requireValue(rootConfig.name === 'sovv-web', 'Root Worker name must match production');
requireValue(rootConfig.main === 'apps/sovereign-worker/src/runtime-entry.ts', 'Root config must use the active OPENAPI runtime');
requireValue(rootConfig.workers_dev === true, 'Production Worker must preserve its workers.dev fallback');
requireValue(rootConfig.preview_urls === false, 'Versioned preview URLs must remain disabled');
requireValue(rootConfig.vars?.APP_ENV === 'production', 'Root config must be production-only');
requireValue(rootConfig.d1_databases?.some((item) => item.binding === 'DB'), 'Root config is missing D1');
requireValue(rootConfig.durable_objects?.bindings?.some((item) => item.name === 'THREADS'), 'Root config is missing Durable Object coordination');
requireValue(rootConfig.ai?.binding === 'AI', 'Root config is missing Workers AI');
requireValue(rootConfig.assets?.binding === 'ASSETS', 'Root config is missing static assets');
requireValue(!rootConfig.r2_buckets?.length, 'Production must not enable R2');
requireValue(!rootConfig.queues?.producers?.length && !rootConfig.queues?.consumers?.length, 'Production must not enable Queue');
for (const hostname of ['sovereign.defrag.app', 'app.defrag.app']) {
  requireValue(rootConfig.routes?.some((route) => route.pattern === hostname && route.custom_domain === true), `Production is missing ${hostname}`);
}

requireValue(workerConfig.main === 'src/runtime-entry.ts', 'Worker must use the active OPENAPI runtime entry');
requireValue(workerConfig.vars?.APP_ENV === 'development', 'Package-level Worker config must remain local-development only');
requireValue(preview?.name === 'sovereign-openapi-preview', 'Preview Worker name drifted');
requireValue(preview?.workers_dev === true, 'Preview must deploy to workers.dev');
requireValue(preview?.preview_urls === false, 'Versioned preview URLs must remain disabled');
requireValue(preview?.vars?.APP_ENV === 'preview', 'Preview environment must be explicit');
requireValue(preview?.d1_databases?.some((item) => item.binding === 'DB'), 'Preview is missing D1');
requireValue(preview?.durable_objects?.bindings?.some((item) => item.name === 'THREADS'), 'Preview is missing Durable Object coordination');
requireValue(preview?.ai?.binding === 'AI', 'Preview is missing Workers AI');
requireValue(preview?.assets?.binding === 'ASSETS', 'Preview is missing static assets');
requireValue(!preview?.r2_buckets?.length, 'R2 must remain disabled for visual-review preview');
requireValue(!preview?.queues?.producers?.length && !preview?.queues?.consumers?.length, 'Queue must remain disabled for visual-review preview');
requireValue(!workerConfig.r2_buckets?.length, 'Package-level Worker config must not declare R2');
requireValue(!workerConfig.queues?.producers?.length && !workerConfig.queues?.consumers?.length, 'Package-level Worker config must not declare Queue');

requireValue(!existsSync('.github/workflows'), 'GitHub Actions workflows are forbidden; Cloudflare Workers Builds is the sole release path');
requireValue(packageJson.scripts?.['verify:cloudflare-build']?.includes('verify:release-config'), 'Canonical build must retain release verification');
requireValue(packageJson.scripts?.['verify:release-config'] === 'node scripts/verify-direct-preview-config.mjs', 'Release verifier must use the direct Cloudflare contract');
requireValue(packageJson.scripts?.['preview:bootstrap'] === 'node scripts/cloudflare-preview-bootstrap.mjs', 'Preview bootstrap command drifted');
requireValue(packageJson.scripts?.['production:deploy'] === 'node scripts/cloudflare-direct-production-deploy.mjs', 'Production deploy command drifted');

requireValue(!existsSync('.dev.vars.example'), 'Deploy-template secret form must not exist');
requireValue(!existsSync('scripts/verify-one-click-deploy.mjs'), 'One-click fork verifier must not exist');
requireValue(!readme.includes('deploy.workers.cloudflare.com'), 'README must not use Deploy to Cloudflare');
requireValue(readme.includes('defragapp/OPENAPI'), 'README must name the canonical repository');
requireValue(readme.includes('Cloudflare Queue and R2 are intentionally disabled'), 'README must document the no-Queue, no-R2 launch architecture');
requireValue(readme.includes('GitHub Actions is not supported for this repository'), 'README must explicitly prohibit GitHub Actions');
requireValue(readme.includes('Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`'), 'README Cloudflare build command drifted');
requireValue(readme.includes('Deploy command: `pnpm production:deploy`'), 'README Cloudflare deploy command drifted');

for (const required of ['WORKERS_CI_COMMIT_SHA', 'APP_VERSION', "'d1', 'migrations', 'apply'", "'deploy', '--config'", 'verifyLiveProduction']) {
  requireValue(productionDeploy.includes(required), `Production deploy is missing ${required}`);
}
for (const required of ['PREVIEW_BASE_URL', 'PREVIEW_SESSION_SIGNING_SECRET', "['deploy', '--env', 'preview'", 'sovereign-openapi-preview-db']) {
  requireValue(bootstrap.includes(required), `Preview bootstrap is missing ${required}`);
}

console.log('Direct Cloudflare release config verified existing_repo=true production_root=true cloudflare_builds_only=true github_actions=false isolated_preview=true fork=false r2=false queues=false d1=true durable_objects=true ai=true assets=true');