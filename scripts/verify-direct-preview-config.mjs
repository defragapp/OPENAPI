import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const rootConfig = JSON.parse(read('wrangler.jsonc'));
const productionConfig = JSON.parse(read('wrangler.production-direct.jsonc'));
const workerConfig = JSON.parse(read('apps/sovereign-worker/wrangler.jsonc'));
const packageJson = JSON.parse(read('package.json'));
const preview = workerConfig.env?.preview;

const readme = read('README.md');
const agents = read('AGENTS.md');
const productionReleaseDoc = read('docs/production-release.md');
const releaseGates = read('docs/release-gates.md');
const workersBuildsHistory = read('docs/cloudflare-workers-builds-production.md');
const previewDoc = read('docs/direct-cloudflare-preview.md');
const bootstrap = read('scripts/cloudflare-preview-bootstrap.mjs');
const buildDiagnostics = read('scripts/cloudflare-build-diagnostics.mjs');
const mainReleaseGuard = read('scripts/assert-main-release.mjs');
const textRelease = read('scripts/cloudflare-production-text-release.mjs');
const deployV3 = read('scripts/cloudflare-production-deploy-v3.mjs');
const releaseOrchestrator = read('scripts/release-orchestrator.mjs');
const releaseEvidence = read('scripts/release-evidence-lib.mjs');
const freeTierControls = read('scripts/configure-cloudflare-free-tier.mjs');
const parentDomainVerifier = read('scripts/verify-parent-domain-routes-v3.mjs');
const authenticatedWorkspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
const productionEntry = read('apps/sovereign-worker/src/production-entry.ts');
const runtimeEntry = read('apps/sovereign-worker/src/entry.ts');
const honoApp = read('apps/sovereign-worker/src/index.ts');
const requestBodyLimits = read('apps/sovereign-worker/src/security/request-body.ts');
const aiCapacity = read('apps/sovereign-worker/src/ai/free-tier-capacity.ts');
const sovereignWorkspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const launchSaturation = read('scripts/launch-saturation.mjs');
const launchSaturationDoc = read('docs/launch-saturation-runbook.md');
const ownerActions = read('docs/release/OWNER_ACTIONS.md');
const stripeWebhook = read('apps/sovereign-worker/src/routes/stripe.ts');

const expectedObservability = {
  enabled: true,
  logs: { enabled: true, invocation_logs: true },
  traces: { enabled: true, head_sampling_rate: 0.05 }
};
const expectedGatewayId = 'sovereign-ai-gateway';
const expectedModel = '@cf/zai-org/glm-4.7-flash';
const currentMigration = '0017_privacy_access_and_eligibility';
const capacityMigration = '0013_workers_ai_free_capacity';

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function requireAll(label, text, values) {
  for (const value of values) requireValue(text.includes(value), `${label} is missing ${value}`);
}

requireValue(JSON.stringify(rootConfig) === JSON.stringify(productionConfig), 'Root and direct production Wrangler configs must remain identical');
for (const [label, observability] of [
  ['production', rootConfig.observability],
  ['local', workerConfig.observability],
  ['preview', preview?.observability]
]) {
  requireValue(JSON.stringify(observability) === JSON.stringify(expectedObservability), `${label} observability drifted`);
}

requireValue(rootConfig.name === 'sovv-web', 'Production Worker name drifted');
requireValue(rootConfig.main === 'apps/sovereign-worker/src/production-entry.ts', 'Production preflight entry drifted');
requireValue(rootConfig.workers_dev === false, 'Production workers.dev must remain disabled');
requireValue(rootConfig.preview_urls === false, 'Production preview URLs must remain disabled');
requireValue(rootConfig.vars?.APP_ENV === 'production', 'Production APP_ENV drifted');
requireValue(rootConfig.vars?.AI_PROVIDER === 'cloudflare-gateway', 'Production AI provider drifted');
requireValue(rootConfig.vars?.AI_MODEL === expectedModel, 'Production AI model drifted');
requireValue(rootConfig.vars?.AI_GATEWAY_ID === expectedGatewayId, 'Production AI Gateway drifted');
requireValue(rootConfig.vars?.WORKERS_AI_DAILY_NEURON_BUDGET === '7500', 'Production Workers AI Free daily budget drifted');
requireValue(rootConfig.vars?.PUBLIC_CONTACT_EMAIL === 'info@defrag.app', 'Production public contact drifted');
requireValue(rootConfig.vars?.WORLDS_VIDEO_ENABLED === 'false', 'Worlds video must remain disabled for the text-first launch');
requireValue(rootConfig.d1_databases?.some((item) => item.binding === 'DB' && item.database_name === 'sovereign-openapi-db'), 'Production D1 binding drifted');
requireValue(rootConfig.durable_objects?.bindings?.some((item) => item.name === 'THREADS'), 'Production Durable Object binding drifted');
requireValue(rootConfig.ai?.binding === 'AI', 'Production Workers AI binding drifted');
requireValue(rootConfig.assets?.binding === 'ASSETS', 'Production assets binding drifted');
requireValue(rootConfig.assets?.not_found_handling === '404-page', 'Production 404 asset contract drifted');
requireValue(!rootConfig.r2_buckets?.length, 'Production must not enable R2');
requireValue(!rootConfig.queues?.producers?.length && !rootConfig.queues?.consumers?.length, 'Production must not enable Queue');

requireAll('production preflight', productionEntry, [
  "DISABLED_TEXT_FIRST_PATHS = new Set(['/api/tts'])",
  "safety.disposition !== 'standard'",
  'authorizeConversationContext(env, auth.accountId, selection, entitlements)',
  "requireFeature(entitlements, 'covenant.lens')",
  'LEGACY_SYSTEM_ALIGNMENT_PATH',
  "'systems.family' : 'systems.team'"
]);

for (const hostname of ['sovereign.defrag.app', 'app.defrag.app']) {
  requireValue(rootConfig.routes?.some((route) => route.pattern === hostname && route.custom_domain === true), `Production is missing Custom Domain ${hostname}`);
}
for (const pattern of ['defrag.app/*', 'www.defrag.app/*']) {
  requireValue(rootConfig.routes?.some((route) => route.pattern === pattern && route.zone_name === 'defrag.app' && route.custom_domain !== true), `Production is missing parent route ${pattern}`);
}

requireValue(workerConfig.main === 'src/runtime-entry.ts', 'Package Worker runtime entry drifted');
requireValue(workerConfig.vars?.APP_ENV === 'development', 'Local Worker APP_ENV drifted');
requireValue(workerConfig.vars?.AI_MODEL === expectedModel, 'Local Worker AI model drifted');
requireValue(workerConfig.vars?.AI_GATEWAY_ID === expectedGatewayId, 'Local Worker AI Gateway drifted');
requireValue(preview?.name === 'sovereign-openapi-preview', 'Preview Worker name drifted');
requireValue(preview?.workers_dev === true, 'Preview must remain isolated on workers.dev');
requireValue(preview?.preview_urls === false, 'Versioned preview URLs must remain disabled');
requireValue(preview?.vars?.APP_ENV === 'preview', 'Preview APP_ENV drifted');
requireValue(preview?.vars?.AI_MODEL === expectedModel, 'Preview Worker AI model drifted');
requireValue(preview?.vars?.AI_GATEWAY_ID === expectedGatewayId, 'Preview AI Gateway drifted');
requireValue(preview?.d1_databases?.some((item) => item.binding === 'DB'), 'Preview D1 binding missing');
requireValue(preview?.durable_objects?.bindings?.some((item) => item.name === 'THREADS'), 'Preview Durable Object binding missing');
requireValue(preview?.ai?.binding === 'AI', 'Preview Workers AI binding missing');
requireValue(!preview?.r2_buckets?.length && !preview?.queues?.producers?.length && !preview?.queues?.consumers?.length, 'Preview must not enable R2 or Queue');

for (const [label, assets] of [['production', rootConfig.assets], ['local', workerConfig.assets], ['preview', preview?.assets]]) {
  for (const pathname of ['/', '/login', '/signup', '/onboarding', '/app', '/app/*', '/auth/*', '/invitation', '/consent.html', '/privacy', '/terms']) {
    requireValue(assets?.run_worker_first?.includes(pathname), `${label} assets must run the Worker first for ${pathname}`);
  }
}
requireValue(existsSync('apps/web/public/404.html'), 'The static 404 document is missing');

requireValue(packageJson.scripts?.['verify:cloudflare-build'] === 'node scripts/cloudflare-build-diagnostics.mjs', 'Canonical build gate command drifted');
requireValue(packageJson.scripts?.['verify:release-config'] === 'node scripts/verify-direct-preview-config.mjs', 'Release config verifier command drifted');
requireValue(packageJson.scripts?.['preview:bootstrap'] === 'node scripts/cloudflare-preview-bootstrap.mjs', 'Preview bootstrap command drifted');
requireValue(packageJson.scripts?.['production:release:text'] === 'node scripts/assert-main-release.mjs --require-current-origin-main && node scripts/cloudflare-production-text-release.mjs', 'Text-first production release command drifted');
requireValue(packageJson.scripts?.['production:release:oauth'] === 'bash scripts/production-release-oauth.sh', 'Optional OAuth Browser-audited release command drifted');

for (const required of [
  'verify:foundation',
  'verify:migrations',
  'scan:secrets',
  'scan:production-fixtures',
  'verify:release-config',
  'verify:production-release',
  'verify:intelligence-release',
  'verify:visual-intelligence',
  'verify:premium-platform',
  "['typecheck']",
  "['test']",
  "['build']",
  'verify:worker-bundle-size'
]) {
  requireValue(buildDiagnostics.includes(required), `Cloudflare build diagnostics are missing ${required}`);
}
for (const required of [
  'WORKERS_CI_BRANCH',
  'WORKERS_CI_COMMIT_SHA',
  "'refs/heads/main'",
  "'FETCH_HEAD'",
  'has been superseded by current main',
  '--require-current-origin-main',
  'requireCurrentOriginMain'
]) {
  requireValue(mainReleaseGuard.includes(required), `Main release guard is missing ${required}`);
}

requireAll('text-first release', textRelease, [
  'DEFAULT_POST_DEPLOY_CHECKS.filter((check) => check.browserRun !== true)',
  "const requiredChecks = ['verify-runtime-v3', 'verify-secondary-public']",
  'postDeployChecks: TEXT_FIRST_POST_DEPLOY_CHECKS',
  'CLOUDFLARE_API_TOKEN'
]);
requireValue(!textRelease.includes('verify-live-route-cohesion'), 'Text-first release must not invoke live route Browser Rendering');
requireValue(!textRelease.includes('verify-live-visual-release'), 'Text-first release must not invoke live visual Browser Rendering');
requireAll('bounded AI message request helper', requestBodyLimits, [
  'MAX_THREAD_MESSAGE_BODY_BYTES = 64 * 1024',
  'MAX_THREAD_MESSAGE_CHARACTERS = 12_000',
  "reader.cancel('request_body_limit_exceeded')",
  "error: 'sovereign_message_too_large'"
]);
requireAll('bounded public Stripe webhook', stripeWebhook, [
  'MAX_STRIPE_WEBHOOK_BODY_BYTES = 512 * 1024',
  'readBoundedText(',
  "new Response('Payload too large'",
  'if (!boundedBody.ok) return boundedBody.response',
  'verifyStripeSignature({ body, header: signature'
]);
requireValue(
  stripeWebhook.indexOf('readBoundedText(') < stripeWebhook.indexOf('verifyStripeSignature({ body, header: signature'),
  'Stripe webhook must bound the raw body before signature or database work'
);

requireAll('bounded production message preflight', productionEntry, [
  "import { readThreadMessageBody } from './security/request-body'",
  'readThreadMessageBody(request.clone())'
]);
requireValue(
  productionEntry.indexOf('readThreadMessageBody(request.clone())') < productionEntry.indexOf('decideSovereignInputSafety(message)'),
  'Production must bound the message request before safety, entitlement, or delegated runtime work'
);
requireAll('bounded runtime message route', runtimeEntry, [
  "import { readThreadMessageBody } from './security/request-body'",
  'readThreadMessageBody(request)'
]);
requireAll('bounded Hono message route', honoApp, [
  "import { readThreadMessageBody } from './security/request-body'",
  'readThreadMessageBody(context.req.raw)'
]);
requireAll('bounded public API ingress', honoApp, [
  "import { bodyLimit } from 'hono/body-limit'",
  'MAX_API_REQUEST_BODY_BYTES = 1024 * 1024',
  "app.use('/api/*', bodyLimit({",
  "error: 'request_body_too_large'"
]);
requireAll('bounded public composer', sovereignWorkspace, [
  'MAX_COMPOSER_CHARACTERS = 10_000',
  'MAX_THREAD_MESSAGE_CHARACTERS = 12_000',
  'maxLength={MAX_COMPOSER_CHARACTERS}'
]);
requireAll('Unicode-conservative AI capacity', aiCapacity, [
  'CONSERVATIVE_BYTES_PER_TOKEN = 1',
  'new TextEncoder().encode(serialized).byteLength',
  'budget < 1 || budget > DEFAULT_DAILY_NEURON_BUDGET',
  'sovereign_free_capacity_reached'
]);
requireAll('guarded launch saturation', launchSaturation, [
  'SATURATION_APPROVED_CANARY_ORIGIN',
  'Refusing to run saturation traffic against a production or branded domain',
  "'ai-free-capacity'",
  'A single Free-capacity canary run is capped at 60 requests and concurrency 5',
  'capacityExhaustionObserved',
  'sovereign-launch-saturation-result.v1',
  'stageConcurrency(config.concurrency)'
]);
requireAll('launch saturation runbook', launchSaturationDoc, [
  'Status: controlled canary authority for #259.',
  'Free capacity exhaustion and graceful degradation',
  'pnpm test:launch-saturation',
  'pnpm saturation:canary',
  'pnpm exec wrangler rollback STABLE_VERSION_ID --config wrangler.jsonc',
  'Do not remove general Access'
]);
requireAll('current owner gates', ownerActions, [
  'Cloudflare credential containment and replacement',
  'Workers AI Free launch posture',
  'Human product acceptance',
  'Terms, Privacy, and launch-market approval',
  'General public Access cutover'
]);
requireValue(packageJson.scripts?.['test:launch-saturation'] === 'node scripts/launch-saturation.mjs --self-test', 'Saturation self-test command drifted');
requireValue(packageJson.scripts?.['saturation:canary'] === 'node scripts/launch-saturation.mjs', 'Canary saturation command drifted');
requireValue(packageJson.scripts?.test?.includes('node scripts/launch-saturation.mjs --self-test'), 'Root test must exercise saturation safety controls');

requireAll('single-deploy implementation', deployV3, [
  'WORKERS_CI_COMMIT_SHA',
  "runWrangler(['deploy', '--config', generatedConfigPath])",
  'configureCloudflareFreeTier',
  "controls?.gateway?.management !== 'verified'",
  'AI Gateway launch rate/privacy controls are not management-verified',
  'controls.gateway.collectLogs !== false',
  "controls.gateway.rateLimit !== '500/60s'",
  "controls.gateway.technique !== 'sliding'",
  'applyMigrations = true',
  'if (applyMigrations)',
  'applyD1Migrations'
]);
requireValue(!deployV3.includes('sovereign_global_daily_spend'), 'Free release deploy must not require a daily Gateway dollar spend rule');
requireValue(!deployV3.includes('sovereign_global_30_day_spend'), 'Free release deploy must not require a 30-day Gateway dollar spend rule');
requireAll('release orchestrator', releaseOrchestrator, [
  'applyD1Migrations',
  'writeReleaseEvidence',
  "routeCohesionVerified: passedPostDeployChecks.has('verify-route-cohesion')",
  "renderedVisualVerified: passedPostDeployChecks.has('verify-rendered-visuals')",
  'persistFailure'
]);
requireAll('release evidence provenance', releaseEvidence, [
  `RELEASE_MIGRATION_VERSION = '${currentMigration}'`,
  'routeCohesionVerified = false',
  'renderedVisualVerified = false',
  "typeof value.routeCohesionVerified === 'boolean'",
  "typeof value.renderedVisualVerified === 'boolean'"
]);

requireAll('Cloudflare controls', freeTierControls, [
  "read_replication: { mode: 'auto' }",
  'rate_limiting_interval: AI_GATEWAY_RATE_WINDOW_SECONDS',
  'rate_limiting_limit: AI_GATEWAY_RATE_LIMIT',
  "rate_limiting_technique: 'sliding'",
  'collect_logs: false',
  'schema_validation/schemas',
  'sovereign_ai_messages_free_tier'
]);
requireValue(!freeTierControls.includes('spend_limits'), 'Workers AI Free controls must not require Gateway dollar spend rules');
requireValue(!freeTierControls.includes('http.request.method'), 'Free-plan rate-limit expression must use path-only fields');
requireAll('parent-domain verifier', parentDomainVerifier, [
  `const expectedMigration = '${currentMigration}'`,
  "dependencies?.policyAcceptanceReceipts === 'configured'",
  "dependencies?.privacyAccessControls === 'configured'",
  "dependencies?.privateExports === 'on-demand-no-artifact'",
  'https://defrag.app/',
  'https://www.defrag.app/'
]);

requireAll('preview bootstrap', bootstrap, [
  'PREVIEW_BASE_URL',
  'PREVIEW_SESSION_SIGNING_SECRET',
  "const APPROVED_AI_PROVIDER = 'cloudflare-gateway'",
  `const APPROVED_AI_MODEL = '${expectedModel}'`,
  'const FREE_AI_NEURON_CEILING = 7_500',
  'resolvePreviewNeuronBudget',
  'WORKERS_AI_DAILY_NEURON_BUDGET: previewNeuronBudget',
  'dailyNeuronBudget: Number(previewNeuronBudget)',
  `const CAPACITY_LEDGER_MIGRATION = '${capacityMigration}'`,
  `const CURRENT_MIGRATION_TARGET = '${currentMigration}'`,
  'migrationTarget: CURRENT_MIGRATION_TARGET',
  'capacityLedgerMigration: CAPACITY_LEDGER_MIGRATION'
]);
requireValue(!bootstrap.includes('AI_MODEL: process.env.AI_MODEL ||'), 'Preview bootstrap must not allow arbitrary model override');
requireValue(!bootstrap.includes('AI_PROVIDER: process.env.AI_PROVIDER ||'), 'Preview bootstrap must not allow arbitrary provider override');

requireValue(!existsSync('.dev.vars.example'), 'Deploy-template secret form must not exist');
requireValue(!existsSync('scripts/verify-one-click-deploy.mjs'), 'Retired one-click deploy verifier must not exist');
requireValue(!readme.includes('deploy.workers.cloudflare.com'), 'README must not use Deploy to Cloudflare');
requireAll('README', readme, [
  'defragapp/OPENAPI',
  'text-first',
  currentMigration,
  capacityMigration,
  'pnpm production:release:text',
  'on-demand',
  'GitHub Actions, deploy hooks, Cloudflare Pages'
]);
requireAll('AGENTS', agents, [
  currentMigration,
  'pnpm production:release:text',
  'Release evidence must describe what actually ran',
  'Worlds/video generation is not part of the current launch runtime'
]);
requireAll('production release document', productionReleaseDoc, [
  'Status: canonical production release authority.',
  'pnpm production:release:text',
  currentMigration,
  'routeCohesionVerified: true',
  'renderedVisualVerified: true',
  'Human desktop/iPhone acceptance is tracked separately'
]);
requireAll('release gates document', releaseGates, [
  currentMigration,
  capacityMigration,
  'pnpm production:release:text',
  'routeCohesionVerified=true',
  'renderedVisualVerified=true',
  '#210:',
  '#216:'
]);
requireAll('preview guide', previewDoc, [expectedModel, capacityMigration, currentMigration, 'on-demand/no-artifact']);
requireAll('Workers Builds history', workersBuildsHistory, [
  'Status: historical operational reference only.',
  currentMigration,
  'pnpm production:release:text',
  'historical Workers Builds trigger'
]);

requireValue(!authenticatedWorkspace.includes("import { WorldVideoLauncher } from './WorldVideoLauncher'"), 'Current authenticated workspace must not import the video launcher');
requireValue(!authenticatedWorkspace.includes('<WorldVideoLauncher />'), 'Current authenticated workspace must not mount the video launcher');
requireValue(authenticatedWorkspace.includes('data-workspace-contract="one-room"'), 'Canonical one-room workspace contract is missing');

console.log('Direct Cloudflare release config verified production_root=true text_first_release=true browser_rendering_optional=true current_migration=0017 privacy_export=on_demand_no_artifact worlds_video=false current_main_only=true github_workflows_non_authoritative=true d1_replication=true workers_ai_free=true gateway_rate_limit=true api_body_limit=true api_shield=true waf_rate_limit=true r2=false queues=false');
