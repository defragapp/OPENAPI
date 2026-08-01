import { existsSync, readFileSync } from 'node:fs';

const rootConfig = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const productionConfig = JSON.parse(readFileSync('wrangler.production-direct.jsonc', 'utf8'));
const workerConfig = JSON.parse(readFileSync('apps/sovereign-worker/wrangler.jsonc', 'utf8'));
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const readme = readFileSync('README.md', 'utf8');
const bootstrap = readFileSync('scripts/cloudflare-preview-bootstrap.mjs', 'utf8');
const mainReleaseGuard = readFileSync('scripts/assert-main-release.mjs', 'utf8');
const productionDeploy = readFileSync('scripts/cloudflare-production-deploy-v2.mjs', 'utf8');
const freeTierControls = readFileSync('scripts/configure-cloudflare-free-tier.mjs', 'utf8');
const parentDomainVerifier = readFileSync('scripts/verify-parent-domain-routes.mjs', 'utf8');
const preview = workerConfig.env?.preview;

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

requireValue(JSON.stringify(rootConfig) === JSON.stringify(productionConfig), 'Root and direct production Wrangler configs must remain identical');
requireValue(rootConfig.name === 'sovv-web', 'Root Worker name must match production');
requireValue(rootConfig.main === 'apps/sovereign-worker/src/runtime-entry.ts', 'Root config must use the active OPENAPI runtime');
requireValue(rootConfig.workers_dev === true, 'Production Worker must preserve its workers.dev fallback');
requireValue(rootConfig.preview_urls === false, 'Versioned preview URLs must remain disabled');
requireValue(rootConfig.vars?.APP_ENV === 'production', 'Root config must be production-only');
requireValue(rootConfig.vars?.AI_MODEL === '@cf/zai-org/glm-4.7-flash', 'Production must use the Cloudflare-hosted free-tier model');
requireValue(rootConfig.d1_databases?.some((item) => item.binding === 'DB'), 'Root config is missing D1');
requireValue(rootConfig.durable_objects?.bindings?.some((item) => item.name === 'THREADS'), 'Root config is missing Durable Object coordination');
requireValue(rootConfig.ai?.binding === 'AI', 'Root config is missing Workers AI');
requireValue(rootConfig.assets?.binding === 'ASSETS', 'Root config is missing static assets');
requireValue(rootConfig.assets?.not_found_handling === '404-page', 'Production assets must return a real 404 document for unknown routes');
requireValue(!rootConfig.r2_buckets?.length, 'Production must not enable R2');
requireValue(!rootConfig.queues?.producers?.length && !rootConfig.queues?.consumers?.length, 'Production must not enable Queue');
for (const hostname of ['sovereign.defrag.app', 'app.defrag.app']) {
  requireValue(rootConfig.routes?.some((route) => route.pattern === hostname && route.custom_domain === true), `Production is missing Custom Domain ${hostname}`);
}
for (const pattern of ['defrag.app/*', 'www.defrag.app/*']) {
  requireValue(rootConfig.routes?.some((route) => route.pattern === pattern && route.zone_name === 'defrag.app' && route.custom_domain !== true), `Production is missing parent route ${pattern}`);
}

requireValue(workerConfig.main === 'src/runtime-entry.ts', 'Worker must use the active OPENAPI runtime entry');
requireValue(workerConfig.vars?.APP_ENV === 'development', 'Package-level Worker config must remain local-development only');
requireValue(workerConfig.vars?.AI_MODEL === '@cf/zai-org/glm-4.7-flash', 'Local Worker must use the Cloudflare-hosted model');
requireValue(preview?.name === 'sovereign-openapi-preview', 'Preview Worker name drifted');
requireValue(preview?.workers_dev === true, 'Preview must deploy to workers.dev');
requireValue(preview?.preview_urls === false, 'Versioned preview URLs must remain disabled');
requireValue(preview?.vars?.APP_ENV === 'preview', 'Preview environment must be explicit');
requireValue(preview?.vars?.AI_MODEL === '@cf/zai-org/glm-4.7-flash', 'Preview must use the Cloudflare-hosted model');
requireValue(preview?.d1_databases?.some((item) => item.binding === 'DB'), 'Preview is missing D1');
requireValue(preview?.durable_objects?.bindings?.some((item) => item.name === 'THREADS'), 'Preview is missing Durable Object coordination');
requireValue(preview?.ai?.binding === 'AI', 'Preview is missing Workers AI');
requireValue(preview?.assets?.binding === 'ASSETS', 'Preview is missing static assets');
requireValue(workerConfig.assets?.not_found_handling === '404-page', 'Local assets must preserve the production 404 contract');
requireValue(preview?.assets?.not_found_handling === '404-page', 'Preview assets must preserve the production 404 contract');
requireValue(!preview?.r2_buckets?.length, 'R2 must remain disabled for visual-review preview');
requireValue(!preview?.queues?.producers?.length && !preview?.queues?.consumers?.length, 'Queue must remain disabled for visual-review preview');
requireValue(!workerConfig.r2_buckets?.length, 'Package-level Worker config must not declare R2');
requireValue(!workerConfig.queues?.producers?.length && !workerConfig.queues?.consumers?.length, 'Package-level Worker config must not declare Queue');
for (const [label, assets] of [['production', rootConfig.assets], ['local', workerConfig.assets], ['preview', preview?.assets]]) {
  for (const pathname of ['/', '/login', '/signup', '/onboarding', '/app', '/app/*', '/auth/*', '/invitation', '/consent.html', '/privacy', '/terms']) {
    requireValue(assets?.run_worker_first?.includes(pathname), `${label} assets must run the Worker first for ${pathname}`);
  }
}
requireValue(existsSync('apps/web/public/404.html'), 'The static 404 document is missing');

requireValue(packageJson.scripts?.['verify:cloudflare-build']?.startsWith('node scripts/assert-main-release.mjs && '), 'Canonical build must begin with the main release guard');
requireValue(packageJson.scripts?.['verify:cloudflare-build']?.includes('verify:release-config'), 'Canonical build must retain release verification');
requireValue(packageJson.scripts?.['verify:release-config'] === 'node scripts/verify-direct-preview-config.mjs', 'Release verifier must use the direct Cloudflare contract');
requireValue(packageJson.scripts?.['preview:bootstrap'] === 'node scripts/cloudflare-preview-bootstrap.mjs', 'Preview bootstrap command drifted');
requireValue(packageJson.scripts?.['production:deploy'] === 'node scripts/assert-main-release.mjs && node scripts/cloudflare-production-deploy-v2.mjs && node scripts/verify-parent-domain-routes.mjs', 'Production deploy command drifted');
for (const required of ['WORKERS_CI_BRANCH', 'WORKERS_CI_COMMIT_SHA', "'refs/heads/main'", "'FETCH_HEAD'", 'has been superseded by current main']) {
  requireValue(mainReleaseGuard.includes(required), `Main release guard is missing ${required}`);
}

requireValue(!existsSync('.dev.vars.example'), 'Deploy-template secret form must not exist');
requireValue(!existsSync('scripts/verify-one-click-deploy.mjs'), 'One-click fork verifier must not exist');
requireValue(!readme.includes('deploy.workers.cloudflare.com'), 'README must not use Deploy to Cloudflare');
requireValue(readme.includes('defragapp/OPENAPI'), 'README must name the canonical repository');
requireValue(readme.includes('Cloudflare Queue and R2 are intentionally disabled'), 'README must document the no-Queue, no-R2 launch architecture');
requireValue(readme.includes('Cloudflare Workers Builds connected directly to `defragapp/OPENAPI` is the sole production release authority'), 'README must keep Cloudflare Workers Builds as production authority');
requireValue(readme.includes('Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`'), 'README Cloudflare build command drifted');
requireValue(readme.includes('Deploy command: `pnpm production:deploy`'), 'README Cloudflare deploy command drifted');
requireValue(readme.includes('`defrag.app/*` and `www.defrag.app/*` remain explicit Worker routes'), 'README parent-route contract drifted');

for (const required of ['WORKERS_CI_COMMIT_SHA', 'APP_VERSION', "'d1', 'migrations', 'apply'", "'deploy', '--config'", 'verifyLiveProduction', 'configureCloudflareFreeTier']) {
  requireValue(productionDeploy.includes(required), `Production deploy is missing ${required}`);
}
for (const required of ["read_replication: { mode: 'auto' }", 'rate_limiting_limit: 50', 'collect_logs: false', 'schema_validation/schemas', 'sovereign_ai_messages_free_tier']) {
  requireValue(freeTierControls.includes(required), `Cloudflare free-tier control is missing ${required}`);
}
for (const required of [
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
]) {
  requireValue(parentDomainVerifier.includes(required), `Parent-domain verifier is missing ${required}`);
}
for (const required of [
  'PREVIEW_BASE_URL',
  'PREVIEW_SESSION_SIGNING_SECRET',
  "['deploy', '--env', 'preview'",
  'sovereign-openapi-preview-db',
  "const APPROVED_AI_PROVIDER = 'cloudflare-gateway'",
  "const APPROVED_AI_MODEL = '@cf/zai-org/glm-4.7-flash'",
  'Preview AI_PROVIDER must remain',
  'Preview AI_MODEL must remain',
  'AI_PROVIDER: APPROVED_AI_PROVIDER',
  'AI_MODEL: APPROVED_AI_MODEL',
  "migrationTarget: '0013_workers_ai_free_capacity'"
]) {
  requireValue(bootstrap.includes(required), `Preview bootstrap is missing ${required}`);
}
requireValue(!bootstrap.includes('AI_MODEL: process.env.AI_MODEL ||'), 'Preview bootstrap must not allow arbitrary model override');
requireValue(!bootstrap.includes('AI_PROVIDER: process.env.AI_PROVIDER ||'), 'Preview bootstrap must not allow arbitrary provider override');

console.log('Direct Cloudflare release config verified production_root=true cloudflare_builds_only=true current_main_only=true github_workflows_non_authoritative=true free_workers_ai=true d1_replication=true gateway_rate_limit=true api_shield=true waf_rate_limit=true r2=false queues=false');