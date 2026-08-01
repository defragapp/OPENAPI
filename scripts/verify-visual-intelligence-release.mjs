import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const main = read('apps/web/src/main.tsx');
const authenticatedWorkspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const expressionField = read('apps/web/src/expression-field/ExpressionField.tsx');
const expressionFieldCss = read('apps/web/src/expression-field/expression-field.css');
const expressionFieldMath = read('apps/web/src/expression-field/expression-field-math.ts');
const expressionFieldFixture = read('apps/web/src/expression-field/expression-field.fixture.ts');
const expressionFieldWorker = read('apps/sovereign-worker/src/expression-field.ts');
const runtimeEntry = read('apps/sovereign-worker/src/runtime-entry.ts');
const expressionFieldContract = read('packages/agent-contracts/src/expression-field.ts');
const staticExperienceCss = read('apps/web/public/static-experience.css');
const how = read('apps/web/public/how-it-works.html');
const pricing = read('apps/web/public/pricing.html');
const faq = read('apps/web/public/faq.html');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const product = read('apps/sovereign-worker/src/db/product.ts');

function requireAll(label, source, values) {
  for (const value of values) {
    if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
  }
}

function rejectAll(label, source, values) {
  for (const value of values) {
    if (source.includes(value)) throw new Error(`${label} contains prohibited ${value}`);
  }
}

requireAll('authenticated app entry', main, [
  "import { AuthenticatedWorkspace } from './AuthenticatedWorkspace'",
  "import './workspace-chat.css'",
  "import './expression-field/expression-field.css'",
  "import './v0-visual-port.css'",
  "location.pathname === '/app'",
  '<AuthenticatedWorkspace />'
]);
const v0Import = "import './v0-visual-port.css';";
if (main.slice(main.indexOf(v0Import) + v0Import.length).includes("import './")) {
  throw new Error('A local visual layer loads after the founder v0 visual authority.');
}

for (const retired of [
  'apps/web/src/experience-reconciliation.css',
  'apps/web/src/sovereign-experience-v3.css',
  'apps/web/src/sovereign-experience-v3-fixes.css'
]) {
  if (existsSync(retired)) throw new Error(`Retired visual override remains: ${retired}`);
  if (main.includes(retired.split('/').pop())) throw new Error(`Retired visual override is still imported: ${retired}`);
}

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
  'className="v0-flow"',
  'className="v0-family-map"',
  'className="v0-comparison-grid"',
  'How Sovereign works it through',
  'How Sovereign reads both of you',
  'Illustrative permitted Baselines',
  'No compatibility score',
  'No private-thought claims',
  'Each person controls what may be included'
]);

requireAll('v0 visual system and sitewide extension', v0Visual, [
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

rejectAll('selective v0 port', `${landing}\n${v0Visual}`, [
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
if (`${expressionField}\n${expressionFieldMath}`.includes('Math.random')) {
  throw new Error('Expression Field production rendering must remain deterministic.');
}
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

requireAll('static public support experience', staticExperienceCss, [
  '.pricing-grid',
  '.pricing-page .pricing-hero > p:last-child',
  '.questions-page .questions-hero > p:last-child',
  '.price-card-body',
  '.plan-comparison-list',
  '.faq-list details',
  'min-width: 320px',
  '@media (max-width: 860px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('static page continuity', `${how}\n${pricing}\n${faq}`, [
  'SOVEREIGN.OS',
  'Build my Baseline',
  '$20',
  '$99',
  '10 Sovereign AI turns each month',
  '300 Sovereign AI turns each month',
  'permission'
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
  if (`${workspace}\n${landing}`.toLowerCase().includes(prohibited.toLowerCase())) {
    throw new Error(`User interface contains prohibited framing: ${prohibited}`);
  }
}

for (const [label, css] of [['founder v0', v0Visual], ['Expression Field', expressionFieldCss]]) {
  const open = (css.match(/{/g) ?? []).length;
  const close = (css.match(/}/g) ?? []).length;
  if (open !== close) throw new Error(`${label} CSS has unbalanced braces (${open}/${close}).`);
}

console.log('Sovereign.OS founder v0 selective port, real workspace, Expression Field, and product contracts verified.');
