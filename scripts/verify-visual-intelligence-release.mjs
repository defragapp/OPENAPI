import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;

const main = read('apps/web/src/main.tsx');
const fingerprint = read('apps/web/src/v0-release-fingerprint.ts');
const authenticatedWorkspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const stories = read('apps/web/src/LandingProductStories.tsx');
const landingField = read('apps/web/src/expression-field/LandingExpressionSlice.tsx');
const v0Platform = read('apps/web/src/v0-platform-port.css');
const v0Motion = read('apps/web/src/v0-motion-accessibility.css');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const v0Global = read('apps/web/src/v0-global-experience.css');
const landingFieldCss = read('apps/web/src/landing-expression-field-v3.css');
const landingFieldIntegration = read('apps/web/src/landing-expression-field-integration.css');
const storyCss = read('apps/web/src/v0-restored-product-stories.css');
const passkeyCss = read('apps/web/src/passkey-auth.css');
const staticAuthority = read('apps/web/public/premium-public-release.css');
const staticV0 = read('apps/web/public/v0-public-port.css');
const expressionField = read('apps/web/src/expression-field/ExpressionField.tsx');
const expressionFieldCss = read('apps/web/src/expression-field/expression-field.css');
const expressionFieldMath = read('apps/web/src/expression-field/expression-field-math.ts');
const expressionFieldFixture = read('apps/web/src/expression-field/expression-field.fixture.ts');
const relationalExpressionField = read('apps/web/src/expression-field/RelationalExpressionField.tsx');
const systemExpressionField = read('apps/web/src/expression-field/SystemExpressionField.tsx');
const expressionFieldWorker = read('apps/sovereign-worker/src/expression-field.ts');
const relationalContext = read('apps/sovereign-worker/src/relational-context.ts');
const runtimeEntry = read('apps/sovereign-worker/src/runtime-entry.ts');
const expressionFieldContract = read('packages/agent-contracts/src/expression-field.ts');
const how = read('apps/web/public/how-it-works.html');
const pricing = read('apps/web/public/pricing.html');
const faq = read('apps/web/public/faq.html');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const product = read('apps/sovereign-worker/src/db/product.ts');

function requireAll(label, source, values) {
  for (const value of values) if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
}

function rejectAll(label, source, values) {
  for (const value of values) if (source.includes(value)) throw new Error(`${label} contains prohibited ${value}`);
}

function balanced(label, source) {
  const open = (source.match(/{/g) ?? []).length;
  const close = (source.match(/}/g) ?? []).length;
  if (open !== close) throw new Error(`${label} CSS has unbalanced braces (${open}/${close}).`);
}

requireAll('application entry', main, [
  "import { AuthenticatedWorkspace } from './AuthenticatedWorkspace'",
  "import { installV0ReleaseFingerprint } from './v0-release-fingerprint'",
  "import './workspace-chat.css'",
  "import './expression-field/expression-field.css'",
  "import './v0-platform-port.css'",
  "import './v0-motion-accessibility.css'",
  "import './v0-visual-port.css'",
  "import './v0-global-experience.css'",
  "import './landing-expression-field-v3.css'",
  "import './landing-expression-field-integration.css'",
  "import './v0-restored-product-stories.css'",
  "import './passkey-auth.css'",
  'installV0ReleaseFingerprint();',
  "location.pathname === '/app'",
  '<AuthenticatedWorkspace />'
]);

const orderedImports = [
  "import './v0-platform-port.css';",
  "import './v0-motion-accessibility.css';",
  "import './v0-visual-port.css';",
  "import './v0-global-experience.css';",
  "import './landing-expression-field-v3.css';",
  "import './landing-expression-field-integration.css';",
  "import './v0-restored-product-stories.css';",
  "import './passkey-auth.css';"
];
let previousImport = -1;
for (const marker of orderedImports) {
  const index = main.indexOf(marker);
  if (index <= previousImport) throw new Error(`Visual authority order is wrong at ${marker}`);
  previousImport = index;
}
if (main.slice(previousImport + orderedImports.at(-1).length).includes("import './")) throw new Error('A local visual layer loads after passkey authority.');

for (const retired of [
  'apps/web/src/experience-reconciliation.css',
  'apps/web/src/sovereign-experience-v3.css',
  'apps/web/src/sovereign-experience-v3-fixes.css'
]) {
  if (existsSync(retired)) throw new Error(`Retired visual override remains: ${retired}`);
  if (main.includes(retired.split('/').pop())) throw new Error(`Retired visual override is still imported: ${retired}`);
}

requireAll('runtime identity', fingerprint, [
  `V0_ARCHIVE_SHA256 = '${archiveSha}'`,
  `V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`,
  "PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'",
  "PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3'",
  "dataset.sovereignVisualContract = 'v0-landing-selective-port'",
  'dataset.sovereignV0Archive = V0_ARCHIVE_SHA256',
  'dataset.sovereignV0Sequence = V0_SEQUENCE_FINGERPRINT'
]);

requireAll('authenticated workspace gate', authenticatedWorkspace, [
  "import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace'",
  "import { AccountControlCenter } from './AccountControlCenter'",
  "import { SystemMembershipManager } from './SystemMembershipManager'",
  "import { AccountExpressionField } from './expression-field/ExpressionField'",
  "fetch('/api/v1/account/onboarding'",
  "location.replace(`/login?returnTo=",
  "location.replace('/onboarding')",
  'data-workspace-contract="one-room"',
  '<SovereignIntelligenceWorkspace onboardingVerified />',
  '<AccountExpressionField />',
  '<AccountControlCenter />',
  '<SystemMembershipManager />'
]);

requireAll('answer renderer', workspace, [
  'className={`sovereign-answer answer-${answer.mode}`}',
  'className="direct-answer"',
  'Supports the fit',
  'Pulls against it',
  'The real tradeoff',
  'You may be bringing',
  'They may be bringing',
  'What happens between you',
  'className="system-graph"',
  'className="basis-strip"',
  'values.slice(0, limit)',
  'const limit = mobile ? 3 : 5',
  'role="dialog"',
  'aria-modal="true"'
]);

requireAll('landing v3 archive contract', landing, [
  `const V0_ARCHIVE_SHA = '${archiveSha}'`,
  'data-visual-contract="v0-landing-selective-port"',
  'data-viewport-contract="v0-public-landing-v3"',
  'Healing isn’t optional.',
  'Holding onto the pain is.',
  'Personal AI for real life',
  '<LandingExpressionSlice />',
  '<LandingProductStories />',
  '<ComparisonStory />',
  '<FinalCallToAction />',
  'Other AI answers',
  'everyone the same.',
  'Your thoughts deserve',
  'a better place to live.'
]);

requireAll('restored landing demonstrations', stories, [
  '<PersonalStory />',
  '<RelationshipStory />',
  '<SystemStory />',
  'Ask about your life.',
  'Get an answer built for you.',
  'Understand what happens',
  'between you.',
  'From one person',
  'to the whole system.',
  'className="v0-story-grid"',
  'className="v0-baseline-trace"',
  'v0-window v0-flow v0-workflow-panel',
  'v0-family-map-no-globes',
  'How Sovereign works it through',
  'How Sovereign reads both of you',
  'How Sovereign maps the system',
  'Reading your Baseline',
  'Keeping both people distinct',
  'Mapping the people',
  'Illustrative permitted Baselines',
  'No compatibility score',
  'No private-thought claims',
  'Each person controls what may be included'
]);
rejectAll('restored landing demonstrations', stories, ['LandingExpressionFieldPreview', 'sphere', 'globe']);

requireAll('integrated landing field', `${landingField}\n${landingFieldCss}\n${landingFieldIntegration}`, [
  'data-visual-contract="landing-expression-field-v3"',
  'onPointerDown={handlePointerDown}',
  'onPointerMove={handlePointerMove}',
  'landing-expression-slice__tooltip',
  'Baseline value',
  'Live change',
  'Current',
  '.landing-expression-slice__ambient',
  '.landing-expression-slice__horizon',
  'background: transparent',
  'border-radius: 0',
  'width: 100vw',
  'touch-action: none'
]);
rejectAll('integrated landing field', landingField, ['sphere', 'globe', 'Math.random']);

requireAll('restored landing visual authority', storyCss, [
  '.v0-restored-product-stories',
  '.v0-story-grid',
  '.v0-window',
  '.v0-workflow-panel',
  '.v0-family-map-no-globes',
  '@media (max-width: 760px)',
  '@media (max-width: 390px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('founder v0 visual foundation', v0Visual, [
  `Source archive SHA-256:\n * ${archiveSha}`,
  '--v0-page: #0f0f0f',
  '--v0-cream: #e8ddd0',
  '.v0-landing-port',
  '.v0-hero',
  '.v0-story-grid',
  '.v0-window',
  '.v0-flow',
  '.v0-family-map',
  '.v0-comparison-grid',
  '.v0-final',
  '.intelligence-workspace',
  '.intelligence-sidebar',
  '.sovereign-composer',
  '.account-shell',
  '.auth-panel',
  '.workspace-sheet'
]);

requireAll('application route coverage', v0Platform, [
  'body:has(.plan-onboarding)',
  'body:has(.sovereign-policy)',
  'body:has(.email-code-fallback)',
  '.plan-nav',
  '.onboarding-plan-grid',
  '.policy-hero',
  '.policy-grid',
  '.email-code-fallback',
  '@media (max-width: 700px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('standalone route authority', `${staticAuthority}\n${staticV0}`, [
  "@import url('/v0-public-port.css?v=20260801-founder-v0')",
  `Archive SHA-256: ${archiveSha}`,
  'body.launch-page',
  '.launch-nav',
  '.launch-hero',
  '.journey-steps',
  '.pricing-grid',
  '.faq-list details',
  '.launch-footer'
]);

rejectAll('selective v0 port', `${landing}\n${stories}\n${v0Platform}\n${v0Visual}`, [
  'Know yourself.',
  'Understand the system.',
  'Choose what fits.',
  'Alignment Score',
  'Stability Index',
  'Growth Rate',
  'Math.random',
  'generateAIResponse',
  'Demo User',
  'dashboard-grid',
  'mock-auth',
  'fake-answer'
]);

requireAll('authenticated Expression Field composition', `${authenticatedWorkspace}\n${expressionField}\n${expressionFieldFixture}`, [
  '<AccountExpressionField />',
  'export function AccountExpressionField()',
  "fetch('/api/v1/expression-field?mode=live'",
  "credentials: 'same-origin'",
  "cache: 'no-store'",
  'ONE CENTER · SIXTEEN EXPRESSIONS',
  'aria-live="polite"',
  'role="dialog"',
  'aria-modal="true"'
]);
requireAll('deterministic Expression Field renderer', `${expressionField}\n${expressionFieldMath}\n${expressionFieldContract}`, [
  'export function ExpressionFieldRenderer',
  'context.moveTo(centerX, centerY)',
  'quaternionFromUnitVectors',
  'slerpQuaternion',
  'expressionAxisIds.length',
  "export const EXPRESSION_FIELD_VERSION = 'expression-field.v1'",
  "export const EXPRESSION_AXIS_REGISTRY_VERSION = 'expression-axis-registry.v1'"
]);
requireAll('authenticated relationship and system field composition', `${workspace}\n${relationalExpressionField}\n${systemExpressionField}\n${relationalContext}`, [
  '<WorkspaceExpressionField',
  '<ThreadExpressionField',
  '<ExpressionFieldRenderer',
  'data-expression-field-composition="relationship"',
  'data-expression-field-composition="system"',
  'buildExpressionAxisValues({ facets: baseline.facets })',
  'expressionAxes'
]);
if (existsSync('apps/web/src/ContextInteractionField.tsx')) throw new Error('The retired landing-only field renderer remains.');
if (`${relationalExpressionField}\n${systemExpressionField}`.includes('<line')) throw new Error('Authenticated relationship and system engagement must not use literal connector lines.');
if (`${expressionField}\n${expressionFieldMath}`.includes('Math.random')) throw new Error('Expression Field production rendering must remain deterministic.');

requireAll('privacy-safe Expression Field route', `${runtimeEntry}\n${expressionFieldWorker}`, [
  "url.pathname === '/api/v1/expression-field'",
  'handleExpressionFieldRequest(request, env)',
  'const auth = await requireAuth(request, env)',
  "value.subject === 'self'",
  "'cache-control': 'private, no-store'",
  "vary: 'Cookie'",
  "measurementKind: 'relative_expression_salience'",
  "state: 'unconfirmed'"
]);
requireAll('Expression Field iOS and accessibility contract', expressionFieldCss, [
  'touch-action: pan-y',
  'touch-action: none',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)',
  'env(safe-area-inset-top)',
  'env(safe-area-inset-bottom)'
]);

requireAll('static page continuity', `${how}\n${pricing}\n${faq}`, [
  'Sovereign.OS',
  'Build my Baseline',
  '$20',
  '$99',
  '10 Sovereign AI turns each month',
  '300 Sovereign AI turns each month',
  'permission',
  '/premium-public-release.css?v=20260730-final'
]);

requireAll('system membership manager', membership, [
  'person.identityBound === true',
  "person.activeScopes.includes('system.include')",
  '/members`,',
  'Add only permitted people.',
  'Add permitted member'
]);
requireAll('consent-safe system projection', product, [
  'FROM system_memberships sm',
  "cg.scope = 'system.include'",
  "i.status = 'accepted'",
  'cg.granted_at IS NOT NULL AND cg.revoked_at IS NULL',
  'p.bound_account_id IS NOT NULL',
  "await requireConsent(env, accountId, personId, 'system.include')"
]);

for (const prohibited of ['God is telling you', 'They secretly want', 'This proves', 'You are incompatible']) {
  if (`${workspace}\n${landing}\n${stories}`.toLowerCase().includes(prohibited.toLowerCase())) throw new Error(`User interface contains prohibited framing: ${prohibited}`);
}

for (const [label, css] of [
  ['founder platform coverage', v0Platform],
  ['founder motion coverage', v0Motion],
  ['founder foundation', v0Visual],
  ['global product authority', v0Global],
  ['landing field', landingFieldCss],
  ['landing field integration', landingFieldIntegration],
  ['restored product stories', storyCss],
  ['passkey authority', passkeyCss],
  ['standalone authority', staticV0],
  ['authenticated Expression Field', expressionFieldCss]
]) balanced(label, css);

console.log('Sovereign.OS founder v0 landing v3, restored product workflows, real workspace, Expression Field, and complete route coverage verified.');
