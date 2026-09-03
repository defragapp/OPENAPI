import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const packageJson = JSON.parse(read('package.json'));
const configs = [
  ['root config', read('wrangler.jsonc')],
  ['direct config', read('wrangler.production-direct.jsonc')],
  ['worker config', read('apps/sovereign-worker/wrangler.jsonc')]
];
const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;

const modelConfig = read('packages/agent-contracts/src/model-config.ts');
const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
const entry = read('apps/sovereign-worker/src/entry.ts');
const session = read('apps/sovereign-worker/src/d1-session.ts');
const capacity = read('apps/sovereign-worker/src/ai/free-tier-capacity.ts');
const capacityMigration = read('apps/sovereign-worker/migrations/0013_workers_ai_free_capacity.sql');
const passkeyMigration = read('apps/sovereign-worker/migrations/0014_passkey_authentication.sql');
const passkeyRoutes = read('apps/sovereign-worker/src/auth-passkeys.ts');
const passkeyVerifier = read('apps/sovereign-worker/src/security/webauthn-es256.ts');
const accountSession = read('apps/sovereign-worker/src/auth-session.ts');
const email = read('apps/sovereign-worker/src/email.ts');
const usage = read('apps/sovereign-worker/src/billing/usage.ts');
const deploy = read('scripts/cloudflare-production-deploy-v2.mjs');
const controls = read('scripts/configure-cloudflare-free-tier.mjs');
const bundle = read('scripts/verify-worker-bundle-size.mjs');
const schema = read('docs/api-shield/sovereign-critical-api.openapi.yaml');

const main = read('apps/web/src/main.tsx');
const index = read('apps/web/index.html');
console.log('DEBUG: cwd =', process.cwd());
console.log('DEBUG: reading landing...');
const landing = read('apps/web/src/PublicLanding.tsx');
const stories = read('apps/web/src/LandingProductStories.tsx');
const field = read('apps/web/src/expression-field/LandingExpressionSlice.tsx');
const fingerprint = read('apps/web/src/v0-release-fingerprint.ts');
const v0Platform = read('apps/web/src/v0-platform-port.css');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const v0Global = read('apps/web/src/v0-global-experience.css');
const fieldCss = read('apps/web/src/landing-expression-field-v3.css');
const integrationCss = read('apps/web/src/landing-expression-field-integration.css');
const heroCss = read('apps/web/src/landing-hero-field-v4.css');
const storyCss = read('apps/web/src/v0-restored-product-stories.css');
const passkeyCss = read('apps/web/src/passkey-auth.css');
const passkeyClient = read('apps/web/src/passkey-client.ts');
const passkeyLogin = read('apps/web/src/PasskeyAuthentication.tsx');
const passkeyManager = read('apps/web/src/PasskeyManager.tsx');
const verifiedPlan = read('apps/web/src/VerifiedPlanStatus.tsx');
const authenticatedWorkspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
const composition = read('apps/web/src/interface-composition.css');
const staticV0 = read('apps/web/public/v0-public-static.css');
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

function rejectAll(label, text, values) {
  for (const value of values) assert(!text.includes(value), `${label} contains prohibited ${value}`);
}

function balanced(label, source) {
  assert((source.match(/{/g) ?? []).length === (source.match(/}/g) ?? []).length, `${label} CSS is unbalanced`);
}

const scripts = JSON.stringify(packageJson.scripts || {});
requireAll('package scripts', scripts, ['cloudflare-production-deploy-v2.mjs', 'verify-production-release-v2.mjs', 'verify:worker-bundle-size']);
assert(!scripts.includes('cloudflare-direct-production-deploy.mjs'), 'Retired production deploy remains authoritative');

for (const [label, config] of configs) {
  requireAll(label, config, ['"AI_PROVIDER": "cloudflare-gateway"', '"AI_MODEL": "@cf/zai-org/glm-4.7-flash"', '"binding": "AI"']);
  assert(!config.includes('openai/gpt-5.5'), `${label} still selects paid third-party inference`);
  assert(!config.includes('r2_buckets'), `${label} enables R2`);
  assert(!config.includes('"queues"'), `${label} enables Queues`);
}

requireAll('model config', modelConfig, ["DEFAULT_AI_MODEL = '@cf/zai-org/glm-4.7-flash'", "DEFAULT_AI_PROVIDER = 'cloudflare-gateway'"]);
requireAll('D1 session and AI privacy boundary', session, ['db.withSession(bookmark)', "readD1Bookmark(request) ?? 'first-primary'", 'reserveWorkersAiCapacity', 'settleWorkersAiCapacity', 'skipCache: true', 'collectLog: false']);
requireAll('free capacity ledger', capacity, ['MAX_WORKERS_AI_DAILY_NEURON_BUDGET = 7_500']);
requireAll('capacity migration', capacityMigration, ['CREATE TABLE IF NOT EXISTS workers_ai_daily_capacity', 'reserved_neurons INTEGER NOT NULL', 'request_count INTEGER NOT NULL']);
requireAll('failed response refunds', usage, [
  'export async function releaseAiTurn',
  'return releaseAiTurns(env, accountId, periodKey, 1)',
  'export async function releaseAiTurns',
  'turns_used = MAX(0, turns_used - ?)',
  '.bind(count, accountId, periodKey)'
]);
requireAll('entry release integration', entry, ['releaseAiTurn(env, auth.accountId, usage.periodKey)', "migrationVersion: '0019_deprecate_manual_capacity'"]);

requireAll('passkey migration', passkeyMigration, [
  'CREATE TABLE auth_passkeys',
  'credential_id TEXT NOT NULL UNIQUE',
  'public_key_jwk TEXT NOT NULL',
  'CREATE TABLE auth_passkey_challenges',
  "purpose TEXT NOT NULL CHECK(purpose IN ('register','login'))",
  'challenge_hash TEXT NOT NULL',
  'used_at TEXT'
]);
requireAll('passkey credential verification', passkeyVerifier, [
  'FLAG_USER_VERIFIED = 0x04',
  "attestation.get('fmt') !== 'none'",
  'key.get(3) !== -7',
  "crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }",
  'constantTimeEqual',
  'rp_id_mismatch',
  'client_data_invalid'
]);
requireAll('passkey lifecycle', passkeyRoutes, [
  'auth_passkey_challenges',
  'auth_passkeys',
  "'login'",
  "'register'",
  'challenge_used',
  'signature_counter_replayed',
  'createAccountSessionResponse',
  'deletePasskey'
]);
requireAll('secure session', accountSession, ['__Host-sovereign_session=', 'HttpOnly; Secure; SameSite=Lax; Priority=High', 'createSignedSessionToken', 'INSERT INTO auth_sessions']);
requireAll('runtime passkey readiness', runtime, [
  "'/api/v1/auth/passkey/login/options'",
  "'/api/v1/auth/passkey/login/verify'",
  "'/api/v1/auth/passkey/register/options'",
  "'/api/v1/auth/passkey/register/verify'",
  "'/api/v1/auth/passkeys'",
  "passkeys: db?.passkeys_ready === 1 ? 'configured' : 'missing'",
  "dependencies.passkeys === 'configured'",
  "migrationVersion: '0013_workers_ai_free_capacity'",
  "latestMigrationVersion: '0014_passkey_authentication'"
]);

requireAll('transactional email', email, ['background:#0f0f0f', 'color:#f5f1e8', 'background:#e8ddd0', 'Sovereign.OS', 'Private account message', 'Do not forward it.', "provider: 'resend'"]);
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

requireAll('production deploy compatibility', deploy, [
  "const model = '@cf/zai-org/glm-4.7-flash'",
  "const migrationVersion = '0013_workers_ai_free_capacity'",
  'configureCloudflareFreeTier',
  "'d1', 'migrations', 'apply'",
  "'deploy', '--config', generatedConfigPath",
  "dependencies?.aiFreeCapacity === 'configured'",
  "assertDocument('home'",
  "assertDocument('how-it-works'",
  "assertDocument('pricing'",
  "assertDocument('faq'",
  "assertDocument('login'",
  "assertDocument('signup'",
  "assertDocument('app'",
  'v0-landing-selective-port',
  'dailyNeuronReservationBudget: 7_500',
  "cloudflarePlanTarget: 'free'"
]);
requireAll('production retirement guard', deploy, ["'Know yourself.'", "'Understand the system.'", "'Choose what fits.'", 'assert(!javascript.text.includes(prohibited)']);
assert(!deploy.includes("'Math.random'"), 'Production deploy still rejects a dependency bundle by a generic string');

requireAll('bundle verifier', bundle, ['CLOUDFLARE_FREE_LIMIT_BYTES = 3 * 1024 * 1024', 'INTERNAL_BUDGET_BYTES = 2_500 * 1024', 'Wrangler did not report a compressed Worker upload size']);
requireAll('API Shield schema', schema, ['openapi: 3.0.3', 'https://app.defrag.app', '/api/v1/account/onboarding:', '/api/v1/billing/portal:', '/api/v1/people/{personId}/consent/{scope}:']);
assert(!schema.includes('/api/v1/auth/signup:'), 'Turnstile-bearing signup must remain outside the Free-plan schema limit');
assert(!schema.includes('/api/v1/auth/login:'), 'Turnstile-bearing email login must remain outside the Free-plan schema limit');

requireAll('application visual entry', main, [
  "import './interface-composition.css'",
  "import './v0-platform-port.css'",
  "import './v0-visual-port.css'",
  "import './v0-global-experience.css'",
  "import './landing-expression-field-v3.css'",
  "import './landing-expression-field-integration.css'",
  "import './v0-restored-product-stories.css'",
  "import './landing-hero-field-v4.css'",
  "import './passkey-auth.css'",
  "import { PasskeyAuthentication } from './PasskeyAuthentication'",
  '<PasskeyAuthentication />',
  '<PublicLanding />',
  '<AuthenticatedWorkspace />',
  '<PublicPolicy'
]);
const orderedImports = [
  "import './v0-platform-port.css';",
  "import './v0-visual-port.css';",
  "import './v0-global-experience.css';",
  "import './landing-expression-field-v3.css';",
  "import './landing-expression-field-integration.css';",
  "import './v0-restored-product-stories.css';",
  "import './public-landing-approved-v8.css';",
  "import './landing-hero-field-v4.css';",
  "import './passkey-auth.css';"
];
let previousImport = -1;
for (const marker of orderedImports) {
  const index = main.indexOf(marker);
  assert(index > previousImport, `Application visual import order is wrong at ${marker}`);
  previousImport = index;
}
assert(!main.slice(previousImport + orderedImports.at(-1).length).includes("import './"), 'A visual layer loads after passkey auth authority');

requireAll('runtime fingerprint', fingerprint, [
  `V0_ARCHIVE_SHA256 = '${archiveSha}'`,
  `V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`,
  "PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'",
  "PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3'",
  "dataset.sovereignVisualContract = 'v0-landing-selective-port'",
  'dataset.sovereignV0Archive = V0_ARCHIVE_SHA256',
  'dataset.sovereignV0Sequence = V0_SEQUENCE_FINGERPRINT'
]);
requireAll('application document', index, ['id="root"', 'Healing isn’t optional. Holding onto the pain is.', 'release-fingerprint']);
requireAll('landing v3 composition', landing, [
  `const V0_ARCHIVE_SHA = '${archiveSha}'`,
  'data-visual-contract="v0-landing-selective-port"',
  'data-viewport-contract="v0-public-landing-v3"',
  'Healing isn’t optional.',
  'Holding onto the pain is.',
  '<LandingExpressionSlice />',
  '<RealLifeQuestions />',
  'Bring the question you actually have.',
  'Why do we keep having the same fight?',
  '<LandingProductStories />',
  '<ComparisonStory />'
]);
requireAll('restored landing stories', stories, [
  '<LandingProductStories />',
  'demo-selector',
  'demo-card',
  'See source details',
  'Representative example · Not your Baseline Design'
]);
rejectAll('restored landing stories', stories, [
  '<PersonalStory />',
  '<RelationshipStory />',
  '<SystemStory />',
  'surface="personal-chat"',
  'surface="personal-reasoning"',
  'surface="relationship-chat"',
  'surface="relationship-reasoning"',
  'surface="system-map"',
  'surface="system-reasoning"',
  'v0-workflow-panel',
  'v0-family-system-map'
]);
rejectAll('restored landing stories', stories, ['LandingExpressionFieldPreview', 'sphere', 'globe']);
requireAll('integrated landing field', `${field}\n${fieldCss}\n${integrationCss}\n${heroCss}`, [
  'data-field-geometry="spherical-360"',
  'onPointerDown={handlePointerDown}',
  'onPointerMove={handlePointerMove}',
  'landing-expression-slice__readout',
  'MIN_AXIS_LENGTH',
  'MAX_AXIS_LENGTH',
  'Math.pow(normalized, 1.32)',
  'buildSphereGrid',
  'requestAnimationFrame',
  '.landing-expression-slice__sphere-shell',
  '.landing-question-orbit__stage',
  'stroke: #2f93ff',
  'width: 100vw',
  'background: transparent',
  'border-radius: 0'
]);
rejectAll('integrated landing field', field, ['Math.random', 'giftExpression', 'shadowExpression']);
assert(!field.includes('<div className="landing-expression-slice__tooltip"'), 'The retired floating tooltip returned.');

requireAll('founder platform coverage', v0Platform, ['body:has(.plan-onboarding)', 'body:has(.sovereign-policy)', 'body:has(.email-code-fallback)', '.onboarding-plan-grid', '.policy-grid', '.email-code-fallback']);
requireAll('founder visual foundation', v0Visual, ['--v0-page: #0f0f0f', '--v0-cream: #e8ddd0', '.v0-hero', '.v0-family-map', '.intelligence-workspace', '.sovereign-composer', '.account-shell']);
requireAll('restored story visual authority', storyCss, ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map', '@media (max-width: 760px)', '@media (prefers-reduced-motion: reduce)']);
requireAll('global product authority', v0Global, ['Founder-v0 visual authority for every non-landing product surface', '.account-shell', '.plan-onboarding', '.public-policy', '.private-route-gate', '.sovereign-app-runtime', '.verified-plan-strip', '.account-plan-verification']);
requireAll('passkey visual authority', passkeyCss, ['.passkey-primary', '.passkey-button', '.passkey-manager', '.passkey-list']);

requireAll('browser passkey client', passkeyClient, ['navigator.credentials', 'decodeRequestOptions', 'decodeCreationOptions', 'serializeAssertion', 'serializeRegistration']);
requireAll('passkey-first login', passkeyLogin, ['Sign in without opening your email.', 'Sign in with a passkey', 'Email recovery or first-time verification', '/api/v1/auth/passkey/login/options', '/api/v1/auth/passkey/login/verify', 'Confirming your Stripe plan']);
requireAll('authenticated passkey controls', passkeyManager, ['Add passkey', 'Email stays available for recovery.', '/api/v1/auth/passkey/register/options', '/api/v1/auth/passkey/register/verify', '/api/v1/auth/passkeys']);
requireAll('verified Stripe plan surface', verifiedPlan, ['/api/v1/billing/entitlements', 'Stripe verified', 'Sovereign+', 'Billing controls']);
requireAll('workspace plan integration', authenticatedWorkspace, ['<VerifiedPlanStatus />', '<PasskeyManager />', 'Confirming your account and verified plan']);

requireAll('standalone founder CSS', staticV0, ['--v0-page:#0f0f0f', '--v0-cream:#e8ddd0', 'body{min-width:320px', '.launch-nav', '.launch-hero', '.journey-steps', '.pricing-grid', '.faq-list', '.launch-footer']);
for (const [label, document] of [['How it works', how], ['pricing', pricing], ['FAQ', faq]]) {
  requireAll(`${label} founder document`, document, ['data-visual-contract="founder-v0-static"', '/v0-public-static.css?v=20260801-v0-global', 'Release compatibility marker only; the retired stylesheet is not loaded']);
  assert(!/<link[^>]+premium-public-release\.css/i.test(document), `${label} still loads retired visual CSS`);
  assert(!/<link[^>]+v0-public-port\.css/i.test(document), `${label} still loads the retired static bridge`);
}
requireAll('How it works document', how, ['Ask about your life. Get an answer built around you.', 'journey-steps', 'baseline-explainer']);
requireAll('pricing document', pricing, ['$0', '$20', '$99 / year', 'Stripe handles payment details', 'Start free. Expand when the question includes more than you.']);
assert(!pricing.includes('Begin with yourself.'), 'Pricing retains rejected product language');
requireAll('FAQ document', faq, ['<details', 'Do I need to open my email every time I sign in?', 'When is my plan verified?', 'Can I correct or remove an interpretation?']);
requireAll('cross-platform composition', composition, ['.sovereign-landing', '.account-shell', '.plan-onboarding', '.sovereign-policy', '.public-not-found', '.intelligence-workspace', '@media (max-width: 700px)']);

for (const [label, document] of documents) {
  requireAll(label, document, ['@cf/zai-org/glm-4.7-flash', '0013_workers_ai_free_capacity']);
  assert(!document.includes('AI_MODEL=openai/gpt-5.5'), `${label} still selects the retired paid model`);
}

for (const [label, css] of [
  ['v0 platform', v0Platform],
  ['v0 visual', v0Visual],
  ['v0 global', v0Global],
  ['landing field', fieldCss],
  ['field integration', integrationCss],
  ['hero field and questions', heroCss],
  ['restored stories', storyCss],
  ['passkey auth', passkeyCss],
  ['v0 static public', staticV0]
]) balanced(label, css);

console.log('Production release v2 verification passed: founder-v0 global surfaces, passkey-first auth, Resend v0 email, Stripe plan proof, interactive 360 landing field, rotating real-life questions, and restored product workflows are enforced.');
