import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const rootConfig = read('wrangler.jsonc');
const directConfig = read('wrangler.production-direct.jsonc');
const workerConfig = read('apps/sovereign-worker/wrangler.jsonc');
const modelConfig = read('packages/agent-contracts/src/model-config.ts');
const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
const entry = read('apps/sovereign-worker/src/entry.ts');
const session = read('apps/sovereign-worker/src/d1-session.ts');
const capacity = read('apps/sovereign-worker/src/ai/free-tier-capacity.ts');
const capacityMigration = read('apps/sovereign-worker/migrations/0013_workers_ai_free_capacity.sql');
const usage = read('apps/sovereign-worker/src/billing/usage.ts');
const browser = read('apps/web/src/ProductionRuntime.ts');
const answer = read('apps/sovereign-worker/src/agent/recognition.ts');
const answerTests = read('apps/sovereign-worker/src/agent/recognition.test.ts');
const sovereignTests = read('apps/sovereign-worker/src/agent/sovereign.test.ts');
const baselineContractTests = read('apps/sovereign-worker/src/baseline-contracts.test.ts');
const modelConfigTests = read('packages/agent-contracts/src/model-config.test.ts');
const d1SessionTests = read('apps/sovereign-worker/src/d1-session.test.ts');
const gatewaySmoke = read('scripts/worker-gateway-smoke.ts');
const stripeSmoke = read('scripts/stripe-smoke.ts');
const productSmoke = read('scripts/product-smoke.ts');
const deploy = read('scripts/cloudflare-production-deploy-v2.mjs');
const controls = read('scripts/configure-cloudflare-free-tier.mjs');
const bundle = read('scripts/verify-worker-bundle-size.mjs');
const schema = read('docs/api-shield/sovereign-critical-api.openapi.yaml');
const readme = read('README.md');
const aiGuide = read('docs/openai-integration.md');
const releasePrep = read('docs/release-prep.md');
const previewGuide = read('docs/direct-cloudflare-preview.md');
const releaseGates = read('docs/release-gates.md');
const how = read('apps/web/public/how-it-works.html');
const pricing = read('apps/web/public/pricing.html');
const faq = read('apps/web/public/faq.html');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireAll(label, text, values) {
  for (const value of values) assert(text.includes(value), `${label} is missing ${value}`);
}

const scripts = packageJson.scripts || {};
requireAll('package scripts', JSON.stringify(scripts), [
  'cloudflare-production-deploy-v2.mjs',
  'verify-production-release-v2.mjs',
  'verify:worker-bundle-size'
]);
assert(!String(scripts['production:deploy']).includes('cloudflare-direct-production-deploy.mjs'), 'Retired production deploy remains authoritative');

for (const [label, config] of [['root config', rootConfig], ['direct config', directConfig], ['worker config', workerConfig]]) {
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
requireAll('D1 session boundary', session, [
  'db.withSession(bookmark)',
  "readD1Bookmark(request) ?? 'first-primary'",
  'reserveWorkersAiCapacity(session, model, normalizedInput)',
  'releaseWorkersAiCapacity(session, reservation)',
  'normalizeWorkersAiInput',
  "output.response_format = { type: 'json_object' }",
  'skipCache: true',
  'collectLog: false'
]);
requireAll('global free capacity', capacity, [
  'FREE_DAILY_NEURON_BUDGET = 7_500',
  'INPUT_NEURONS_PER_MILLION_TOKENS = 5_500',
  'OUTPUT_NEURONS_PER_MILLION_TOKENS = 36_400',
  'CONSERVATIVE_CHARACTERS_PER_TOKEN = 2',
  'workers_ai_daily_capacity',
  'sovereign_free_capacity_reached',
  'retry-after'
]);
requireAll('capacity migration', capacityMigration, [
  'CREATE TABLE IF NOT EXISTS workers_ai_daily_capacity',
  'reserved_neurons INTEGER NOT NULL',
  'request_count INTEGER NOT NULL'
]);
requireAll('failed-turn refunds', usage, [
  'export async function releaseAiTurn',
  'turns_used = MAX(0, turns_used - 1)'
]);
requireAll('entry refund integration', entry, [
  'releaseAiTurn(env, auth.accountId, usage.periodKey)',
  "migrationVersion: '0013_workers_ai_free_capacity'"
]);
requireAll('runtime D1 integration', runtime, [
  'createD1RequestSession(request, env.DB)',
  'withD1SessionEnv(env, session)',
  'attachD1Bookmark(response, session)',
  "aiFreeCapacity: db?.capacity_ready === 1 ? 'configured' : 'missing'",
  "dependencies.aiFreeCapacity === 'configured'",
  "migrationVersion: '0013_workers_ai_free_capacity'"
]);
requireAll('browser bookmark continuity', browser, [
  "const D1_BOOKMARK_HEADER = 'x-d1-bookmark'",
  'sessionStorage.setItem(D1_BOOKMARK_STORAGE_KEY, bookmark)',
  'clearStoredD1Bookmark()'
]);

requireAll('answer contract', answer, [
  "version: z.literal('sovereign-answer.v2')",
  "confidence: z.enum(['confirmed', 'supported', 'exploratory'])",
  "safety_mode: z.enum(['standard', 'grounded', 'escalate'])",
  'Sovereign answer selected an invented or unauthorized Basis reference'
]);
requireAll('answer regression tests', answerTests, [
  'rejects the score-based external mock',
  'alignment_score',
  'missing safety metadata'
]);

for (const [label, fixture] of [
  ['gateway smoke', gatewaySmoke],
  ['Stripe smoke', stripeSmoke],
  ['product smoke', productSmoke],
  ['Sovereign adapter tests', sovereignTests],
  ['Baseline contract tests', baselineContractTests]
]) {
  assert(fixture.includes('@cf/zai-org/glm-4.7-flash'), `${label} does not exercise the approved Workers AI model`);
}
assert(!gatewaySmoke.includes('openai/gpt-5.5'), 'Gateway smoke still exercises the retired model');
assert(!stripeSmoke.includes('openai/gpt-5.5'), 'Stripe smoke still carries the retired model');
assert(!productSmoke.includes('openai/gpt-5.5'), 'Product smoke still carries the retired model');
assert(!sovereignTests.includes('openai/gpt-5.5'), 'Sovereign adapter tests still bypass approved model selection');
assert(!baselineContractTests.includes('openai/gpt-5.5'), 'Baseline contract tests still record the retired model');
requireAll('gateway smoke privacy contract', gatewaySmoke, [
  'resolveAiModelConfig',
  'skipCache !== true',
  'collectLog !== false',
  '[redacted]'
]);
requireAll('intentional non-Workers-AI normalization tests', d1SessionTests, [
  "normalizeWorkersAiInput('openai/gpt-5.5', input)",
  "normalizeWorkersAiOutput('openai/gpt-5.5', output)"
]);
requireAll('intentional isolated model injection test', modelConfigTests, [
  "resolveAiModel('openai/gpt-5.5')",
  'allows explicit model injection for isolated tests while release gates enforce Workers AI'
]);

requireAll('Cloudflare controls', controls, [
  "read_replication: { mode: 'auto' }",
  'rate_limiting_interval: 60',
  'rate_limiting_limit: 50',
  'collect_logs: false',
  'sovereign_ai_messages_free_tier',
  'starts_with(http.request.uri.path',
  'ends_with(http.request.uri.path',
  'requests_per_period: 10',
  'schema_validation/schemas',
  "validation_default_mitigation_action: 'block'",
  'api_gateway/operations'
]);
assert(!controls.includes('http.request.method'), 'Free-plan rate-limit expression must use path-only fields');
requireAll('production deploy', deploy, [
  "const model = '@cf/zai-org/glm-4.7-flash'",
  "const migrationVersion = '0013_workers_ai_free_capacity'",
  'configureCloudflareFreeTier',
  "'d1', 'migrations', 'apply'",
  "'deploy', '--config', generatedConfigPath",
  "dependencies?.aiFreeCapacity === 'configured'",
  'dailyNeuronReservationBudget: 7_500',
  'Set up your Baseline once. Use it wherever life connects.',
  '/launch-polish.css?v=20260730-cohesion',
  'ready version is',
  "cloudflarePlanTarget: 'free'"
]);

requireAll('bundle verifier', bundle, [
  'CLOUDFLARE_FREE_LIMIT_BYTES = 3 * 1024 * 1024',
  'INTERNAL_BUDGET_BYTES = 2_500 * 1024',
  'Wrangler did not report a compressed Worker upload size'
]);
requireAll('API Shield schema', schema, [
  'openapi: 3.0.3',
  'https://app.defrag.app',
  'Free-plan schema inspection is',
  '/api/v1/account/onboarding:',
  '/api/v1/billing/portal:',
  '/api/v1/people/{personId}/consent/{scope}:',
  'city_or_regional',
  'stored_permitted',
  'EmptyObject:'
]);
assert(!schema.includes('/api/v1/auth/signup:'), 'Turnstile-bearing signup must not be blocked by the Free-plan 1 KB schema limit');
assert(!schema.includes('/api/v1/auth/login:'), 'Turnstile-bearing login must not be blocked by the Free-plan 1 KB schema limit');

for (const [label, document] of [
  ['README', readme],
  ['AI integration guide', aiGuide],
  ['release preparation guide', releasePrep],
  ['preview guide', previewGuide],
  ['release gates', releaseGates]
]) {
  requireAll(label, document, ['@cf/zai-org/glm-4.7-flash', '0013_workers_ai_free_capacity']);
  assert(!document.includes('AI_MODEL=openai/gpt-5.5'), `${label} still instructs maintainers to select the retired paid model`);
}
requireAll('README release authority', readme, [
  'Cloudflare Workers Builds connected directly to `defragapp/OPENAPI` is the sole production release authority.',
  'D1-backed daily free-capacity reservations',
  'personalized inference bypasses Gateway cache and persistent prompt logging'
]);
requireAll('AI integration guide contract', aiGuide, [
  'Failed generation releases the daily reservation and refunds the user\'s monthly turn.',
  'Production and preview never fall back to direct OpenAI or synthetic interpretation.'
]);
requireAll('release preparation contract', releasePrep, [
  'GitHub Actions and ad-hoc local commands are not production release authorities.',
  'daily free-capacity failures do not charge users for missing answers'
]);
requireAll('preview contract', previewGuide, [
  'bypass personalized Gateway caching',
  'return controlled capacity errors without charging monthly turns for missing answers'
]);
requireAll('release gate authority', releaseGates, [
  'Cloudflare Workers Builds is green for the exact approved `main` commit.',
  'GitHub Actions and ad-hoc local commands are not accepted as production release evidence.'
]);

requireAll('How it works', how, [
  'Set up your Baseline once. Use it wherever life connects.',
  'A large private context becomes one clear answer.',
  '/launch-polish.css?v=20260730-cohesion'
]);
requireAll('pricing', pricing, ['$0', '$20', '$99 / year', '10 Sovereign AI turns each month', '300 Sovereign AI turns each month']);
requireAll('FAQ', faq, ['What Sovereign understands. What remains yours to confirm.', 'Can I correct or remove an interpretation?']);

console.log('Production release v2 verification passed.');
