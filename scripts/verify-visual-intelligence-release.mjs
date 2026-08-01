import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|rotating-real-life-questions|ask-about-your-life|get-an-answer-built-for-you|see-the-space-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;
const main = read('apps/web/src/main.tsx');
const fingerprint = read('apps/web/src/v0-release-fingerprint.ts');
const authenticatedWorkspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const v0Platform = read('apps/web/src/v0-platform-port.css');
const v0Motion = read('apps/web/src/v0-motion-accessibility.css');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const v0Global = read('apps/web/src/v0-global-experience.css');
const passkeyCss = read('apps/web/src/passkey-auth.css');
const staticAuthority = read('apps/web/public/premium-public-release.css');
const staticV0 = read('apps/web/public/v0-public-port.css');
const expressionField = read('apps/web/src/expression-field/ExpressionField.tsx');
const expressionFieldCss = read('apps/web/src/expression-field/expression-field.css');
const expressionFieldMath = read('apps/web/src/expression-field/expression-field-math.ts');
const expressionFieldFixture = read('apps/web/src/expression-field/expression-field.fixture.ts');
const expressionFieldWorker = read('apps/sovereign-worker/src/expression-field.ts');
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

requireAll('authenticated app entry', main, [
  "import { AuthenticatedWorkspace } from './AuthenticatedWorkspace'",
  "import { installV0ReleaseFingerprint } from './v0-release-fingerprint'",
  "import './workspace-chat.css'",
  "import './expression-field/expression-field.css'",
  "import './v0-platform-port.css'",
  "import './v0-motion-accessibility.css'",
  "import './v0-visual-port.css'",
  "import './v0-global-experience.css'",
  "import './passkey-auth.css'",
  'installV0ReleaseFingerprint();',
  "location.pathname === '/app'",
  '<AuthenticatedWorkspace />'
]);
const platformImport = "import './v0-platform-port.css';";
const motionImport = "import './v0-motion-accessibility.css';";
const v0Import = "import './v0-visual-port.css';";
const globalImport = "import './v0-global-experience.css';";
const passkeyImport = "import './passkey-auth.css';";
if (main.indexOf(platformImport) > main.indexOf(motionImport)) throw new Error('Platform route coverage loads after reduced-motion coverage.');
if (main.indexOf(motionImport) > main.indexOf(v0Import)) throw new Error('Reduced-motion coverage loads after the founder v0 foundation.');
if (main.indexOf(v0Import) > main.indexOf(globalImport)) throw new Error('Global product authority loads before the founder v0 foundation.');
if (main.indexOf(globalImport) > main.indexOf(passkeyImport)) throw new Error('Passkey styling loads before global product authority.');
if (main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './")) throw new Error('A local visual layer loads after the passkey-specific final authority.');

for (const retired of [
  'apps/web/src/experience-reconciliation.css',
  'apps/web/src/sovereign-experience-v3.css',
  'apps/web/src/sovereign-experience-v3-fixes.css'
]) {
  if (existsSync(retired)) throw new Error(`Retired visual override remains: ${retired}`);
  if (main.includes(retired.split('/').pop())) throw new Error(`Retired visual override is still imported: ${retired}`);
}

requireAll('runtime v0 identity', fingerprint, [
  `V0_ARCHIVE_SHA256 = '${archiveSha}'`,
  `V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`,
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

requireAll('founder v0 archive contract', landing, [
  `const V0_ARCHIVE_SHA = '${archiveSha}'`,
  'data-visual-contract="v0-landing-selective-port"',
  'Healing isn’t optional.',
  'Holding onto the pain is.',
  'Personal AI for real life',
  '<RotatingQuestions />',
  '<PersonalStory />',
  '<RelationshipStory />',
  '<SystemStory />',
  '<ComparisonStory />',
  '<FinalCallToAction />',
  'Ask about your life.',
  'Get an answer built for you.',
  'See the space',
  'between you.',
  'From one person',
  'to the whole system.',
  'Other AI answers',
  'everyone the same.',
  'Your thoughts deserve',
  'a better place to live.'
]);

requireAll('v0 demonstration components', landing, [
  'className="v0-story-grid"',
  'className="v0-baseline-trace"',
  'function ProcessingFlow(',
  'className="v0-window v0-flow"',
  'className="v0-family-map"',
  'className="v0-comparison-grid"',
  'How Sovereign works it through',
  'How Sovereign reads both of you',
  'Illustrative permitted Baselines',
  'No compatibility score',
  'No private-thought claims',
  'Each person controls what may be included'
]);

requireAll('v0 final visual authority', v0Visual, [
  `Source archive SHA-256:\n * ${archiveSha}`,
  '--v0-page: #0f0f0f',
  '--v0-cream: #e8ddd0',
  '.v0-landing-port',
  '.v0-hero',
  '.v0-question-band',
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
  '.workspace-sheet',
  '@media (max-width: 760px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('v0 application route coverage', v0Platform, [
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

requireAll('v0 standalone route authority', `${staticAuthority}\n${staticV0}`, [
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

rejectAll('selective v0 port', `${landing}\n${v0Platform}\n${v0Visual}`, [
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

requireAll('Expression Field authenticated composition', `${authenticatedWorkspace}\n${expressionField}\n${expressionFieldFixture}`, [
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
requireAll('Expression Field deterministic renderer', `${expressionField}\n${expressionFieldMath}\n${expressionFieldContract}`, [
  'const shellPoints = fibonacciSphere(1200)',
  'context.moveTo(centerX, centerY)',
  'expressionAxisIds.length',
  "export const EXPRESSION_FIELD_VERSION = 'expression-field.v1'",
  "export const EXPRESSION_AXIS_REGISTRY_VERSION = 'expression-axis-registry.v1'"
]);
if (`${expressionField}\n${expressionFieldMath}`.includes('Math.random')) throw new Error('Expression Field production rendering must remain deterministic.');
requireAll('Expression Field privacy-safe Worker route', `${runtimeEntry}\n${expressionFieldWorker}`, [
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
  if (`${workspace}\n${landing}`.toLowerCase().includes(prohibited.toLowerCase())) throw new Error(`User interface contains prohibited framing: ${prohibited}`);
}

balanced('founder v0 platform coverage', v0Platform);
balanced('founder v0 motion coverage', v0Motion);
balanced('founder v0 foundation', v0Visual);
balanced('founder v0 global product authority', v0Global);
balanced('passkey-specific authority', passkeyCss);
balanced('founder v0 standalone authority', staticV0);
balanced('Expression Field', expressionFieldCss);

console.log('Sovereign.OS founder v0 selective port, real workspace, Expression Field, and complete route coverage verified.');
