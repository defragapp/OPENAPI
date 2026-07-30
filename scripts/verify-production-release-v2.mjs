import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const configs = [
  ['root config', read('wrangler.jsonc')],
  ['direct config', read('wrangler.production-direct.jsonc')],
  ['worker config', read('apps/sovereign-worker/wrangler.jsonc')]
];
const modelConfig = read('packages/agent-contracts/src/model-config.ts');
const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
const entry = read('apps/sovereign-worker/src/entry.ts');
const session = read('apps/sovereign-worker/src/d1-session.ts');
const capacity = read('apps/sovereign-worker/src/ai/free-tier-capacity.ts');
const migration = read('apps/sovereign-worker/migrations/0013_workers_ai_free_capacity.sql');
const usage = read('apps/sovereign-worker/src/billing/usage.ts');
const deploy = read('scripts/cloudflare-production-deploy-v2.mjs');
const controls = read('scripts/configure-cloudflare-free-tier.mjs');
const bundle = read('scripts/verify-worker-bundle-size.mjs');
const schema = read('docs/api-shield/sovereign-critical-api.openapi.yaml');
const main = read('apps/web/src/main.tsx');
const index = read('apps/web/index.html');
const composition = read('apps/web/src/interface-composition.css');
const how = read('apps/web/public/how-it-works.html');
const pricing = read('apps/web/public/pricing.html');
const faq = read('apps/web/public/faq.html');
const documents = [
  ['README', read('README.md')],
  ['AI integration guide', read('docs/openai-integration.md')],
  ['release preparation guide', read('docs/release-prep.md')],
  ['preview guide', read('docs/direct-cloudflare-preview.md')],
  ['release gates', read('docs/release-gates.md')]
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireAll(label, text, values) {
  for (const value of values) assert(text.includes(value), `${label} is missing ${value}`);
}

const scripts = JSON.stringify(packageJson.scripts || {});
requireAll('package scripts', scripts, [
  'cloudflare-production-deploy-v2.mjs',
  'verify-production-release-v2.mjs',
  'verify:worker-bundle-size'
]);
assert(!scripts.includes('cloudflare-direct-production-deploy.mjs'), 'Retired production deploy remains authoritative');

for (const [label, config] of configs) {
  requireAll(label, config, [
    '"AI_PROVIDER": "cloudflare-gateway"',
    '"AI_MODEL": "@cf/zai-org/glm-4.7-flash"',
    '"binding": "AI"'
  ]);
  assert(!config.includes('openai/gpt-5.5'), `${label} still selects paid third-party inference`);
  assert(!config.includes('r2_buckets'), `${label} enables R2`);
  assert(!config.includes('"queues"'), `${label} enables Queues`);
}

requireAll('model config', modelConfig, [
  "DEFAULT_AI_MODEL = '@cf/zai-org/glm-4.7-flash'",
  "DEFAULT_AI_PROVIDER = 'cloudflare-gateway'"
]);
requireAll('D1 session and AI privacy boundary', session, [
  'db.withSession(bookmark)',
  "readD1Bookmark(request) ?? 'first-primary'",
  'reserveWorkersAiCapacity',
  'releaseWorkersAiCapacity',
  'skipCache: true',
  'collectLog: false'
]);
requireAll('free capacity ledger', capacity, [
  'FREE_DAILY_NEURON_BUDGET = 7_500',
  'workers_ai_daily_capacity',
  'sovereign_free_capacity_reached',
  'retry-after'
]);
requireAll('capacity migration', migration, [
  'CREATE TABLE IF NOT EXISTS workers_ai_daily_capacity',
  'reserved_neurons INTEGER NOT NULL',
  'request_count INTEGER NOT NULL'
]);
requireAll('failed response refunds', usage, [
  'export async function releaseAiTurn',
  'turns_used = MAX(0, turns_used - 1)'
]);
requireAll('entry release integration', entry, [
  'releaseAiTurn(env, auth.accountId, usage.periodKey)',
  "migrationVersion: '0013_workers_ai_free_capacity'"
]);
requireAll('runtime readiness', runtime, [
  'createD1RequestSession(request, env.DB)',
  "aiFreeCapacity: db?.capacity_ready === 1 ? 'configured' : 'missing'",
  "dependencies.aiFreeCapacity === 'configured'",
  "migrationVersion: '0013_workers_ai_free_capacity'"
]);

requireAll('Cloudflare controls', controls, [
  "read_replication: { mode: 'auto' }",
  'rate_limiting_interval: 60',
  'rate_limiting_limit: 50',
  'collect_logs: false',
  'sovereign_ai_messages_free_tier',
  'schema_validation/schemas',
  "validation_default_mitigation_action: 'block'",
  'configureOptionalZoneControl',
  "error?.status !== 403"
]);
assert(!controls.includes('http.request.method'), 'Free-plan rate-limit expression must use path-only fields');

requireAll('production deploy', deploy, [
  "const model = '@cf/zai-org/glm-4.7-flash'",
  "const migrationVersion = '0013_workers_ai_free_capacity'",
  'configureCloudflareFreeTier',
  "'d1', 'migrations', 'apply'",
  "'deploy', '--config', generatedConfigPath",
  "dependencies?.aiFreeCapacity === 'configured'",
  'assertDocument',
  "assertDocument('home'",
  "assertDocument('how-it-works'",
  "assertDocument('pricing'",
  "assertDocument('faq'",
  "assertDocument('login'",
  "assertDocument('signup'",
  "assertDocument('app'",
  'dailyNeuronReservationBudget: 7_500',
  'ready version is',
  "cloudflarePlanTarget: 'free'"
]);
assert(!deploy.includes('Set up your Baseline once. Use it wherever life connects.'), 'Production deploy still gates on mutable marketing copy');
assert(!deploy.includes('/launch-polish.css?v=20260730-cohesion'), 'Production deploy still gates on a retired stylesheet fingerprint');

requireAll('bundle verifier', bundle, [
  'CLOUDFLARE_FREE_LIMIT_BYTES = 3 * 1024 * 1024',
  'INTERNAL_BUDGET_BYTES = 2_500 * 1024',
  'Wrangler did not report a compressed Worker upload size'
]);
requireAll('API Shield schema', schema, [
  'openapi: 3.0.3',
  'https://app.defrag.app',
  '/api/v1/account/onboarding:',
  '/api/v1/billing/portal:',
  '/api/v1/people/{personId}/consent/{scope}:'
]);
assert(!schema.includes('/api/v1/auth/signup:'), 'Turnstile-bearing signup must remain outside the Free-plan schema limit');
assert(!schema.includes('/api/v1/auth/login:'), 'Turnstile-bearing login must remain outside the Free-plan schema limit');

requireAll('application visual entry', main, [
  "import './interface-composition.css'",
  '<PublicLanding />',
  '<AuthenticatedWorkspace />',
  '<PublicPolicy'
]);
requireAll('application document', index, [
  'id="root"',
  'Sovereign.OS',
  'release-fingerprint'
]);
requireAll('cross-platform composition', composition, [
  '.sovereign-landing',
  '.account-shell',
  '.plan-onboarding',
  '.sovereign-policy',
  '.public-not-found',
  '.intelligence-workspace',
  '@media (max-width: 700px)'
]);

requireAll('How it works document', how, [
  '<body class="launch-page"',
  'SOVEREIGN.OS',
  'journey-steps',
  'baseline-explainer'
]);
requireAll('pricing document', pricing, [
  '<body class="launch-page pricing-page"',
  '$0', '$20', '$99 / year',
  '10 Sovereign AI turns each month',
  '300 Sovereign AI turns each month'
]);
requireAll('FAQ document', faq, [
  '<body class="launch-page questions-page"',
  '<details',
  'What is Sovereign.OS?',
  'Can I correct or remove an interpretation?'
]);

for (const [label, document] of documents) {
  requireAll(label, document, ['@cf/zai-org/glm-4.7-flash', '0013_workers_ai_free_capacity']);
  assert(!document.includes('AI_MODEL=openai/gpt-5.5'), `${label} still instructs maintainers to select the retired paid model`);
}

console.log('Production release v2 verification passed.');
