import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const rootConfig = read('wrangler.jsonc');
const directConfig = read('wrangler.production-direct.jsonc');
const workerConfig = read('apps/sovereign-worker/wrangler.jsonc');
const modelConfig = read('packages/agent-contracts/src/model-config.ts');
const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
const session = read('apps/sovereign-worker/src/d1-session.ts');
const browser = read('apps/web/src/ProductionRuntime.ts');
const answer = read('apps/sovereign-worker/src/agent/recognition.ts');
const answerTests = read('apps/sovereign-worker/src/agent/recognition.test.ts');
const deploy = read('scripts/cloudflare-production-deploy-v2.mjs');
const controls = read('scripts/configure-cloudflare-free-tier.mjs');
const bundle = read('scripts/verify-worker-bundle-size.mjs');
const schema = read('docs/api-shield/sovereign-critical-api.openapi.yaml');
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
  'normalizeWorkersAiInput',
  "output.response_format = { type: 'json_object' }",
  'skipCache: true',
  'collectLog: false'
]);
requireAll('runtime D1 integration', runtime, [
  'createD1RequestSession(request, env.DB)',
  'withD1SessionEnv(env, session)',
  'attachD1Bookmark(response, session)'
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

requireAll('Cloudflare controls', controls, [
  "read_replication: { mode: 'auto' }",
  'rate_limiting_interval: 60',
  'rate_limiting_limit: 50',
  'collect_logs: false',
  'sovereign_ai_messages_free_tier',
  'requests_per_period: 10',
  'schema_validation/schemas',
  "validation_default_mitigation_action: 'block'",
  'api_gateway/operations'
]);
requireAll('production deploy', deploy, [
  "const model = '@cf/zai-org/glm-4.7-flash'",
  'configureCloudflareFreeTier',
  "'d1', 'migrations', 'apply'",
  "'deploy', '--config', generatedConfigPath",
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

requireAll('How it works', how, [
  'Set up your Baseline once. Use it wherever life connects.',
  'A large private context becomes one clear answer.',
  '/launch-polish.css?v=20260730-cohesion'
]);
requireAll('pricing', pricing, ['$0', '$20', '$99 / year', '10 Sovereign AI turns each month', '300 Sovereign AI turns each month']);
requireAll('FAQ', faq, ['What Sovereign understands. What remains yours to confirm.', 'Can I correct or remove an interpretation?']);

console.log('Production release v2 verification passed.');
