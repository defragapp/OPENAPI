import { existsSync, readFileSync } from 'node:fs';

const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const authenticatedWorkspace = readFileSync('apps/web/src/AuthenticatedWorkspace.tsx', 'utf8');
const workspace = readFileSync('apps/web/src/SovereignIntelligenceWorkspace.tsx', 'utf8');
const expressionField = readFileSync('apps/web/src/expression-field/ExpressionField.tsx', 'utf8');
const expressionFieldCss = readFileSync('apps/web/src/expression-field/expression-field.css', 'utf8');
const expressionFieldMath = readFileSync('apps/web/src/expression-field/expression-field-math.ts', 'utf8');
const expressionFieldFixture = readFileSync('apps/web/src/expression-field/expression-field.fixture.ts', 'utf8');
const expressionFieldWorker = readFileSync('apps/sovereign-worker/src/expression-field.ts', 'utf8');
const runtimeEntry = readFileSync('apps/sovereign-worker/src/runtime-entry.ts', 'utf8');
const expressionFieldContract = readFileSync('packages/agent-contracts/src/expression-field.ts', 'utf8');
const hardening = readFileSync('apps/web/src/premium-surface-hardening.css', 'utf8');
const selectivePort = readFileSync('apps/web/src/selective-visual-port.css', 'utf8');
const workspaceCss = `${readFileSync('apps/web/src/workspace-chat.css', 'utf8')}\n${readFileSync('apps/web/src/sovereign-cohesion.css', 'utf8')}\n${hardening}\n${selectivePort}\n${expressionFieldCss}`;
const landing = readFileSync('apps/web/src/PublicLanding.tsx', 'utf8');
const landingCss = `${readFileSync('apps/web/src/public-landing.css', 'utf8')}\n${readFileSync('apps/web/src/sovereign-cohesion.css', 'utf8')}\n${hardening}\n${selectivePort}\n${expressionFieldCss}`;
const cohesion = readFileSync('apps/web/src/sovereign-cohesion.css', 'utf8');
const contextField = readFileSync('apps/web/public/assets/sovereign-context-field.svg', 'utf8');
const staticExperienceCss = readFileSync('apps/web/public/static-experience.css', 'utf8');
const how = readFileSync('apps/web/public/how-it-works.html', 'utf8');
const pricing = readFileSync('apps/web/public/pricing.html', 'utf8');
const faq = readFileSync('apps/web/public/faq.html', 'utf8');
const tokens = readFileSync('apps/web/src/styles.css', 'utf8');
const membership = readFileSync('apps/web/src/SystemMembershipManager.tsx', 'utf8');
const product = readFileSync('apps/sovereign-worker/src/db/product.ts', 'utf8');

function requireAll(label, source, values) {
  for (const value of values) {
    if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
  }
}

requireAll('authenticated app entry', main, [
  "import { AuthenticatedWorkspace } from './AuthenticatedWorkspace'",
  "import './workspace-chat.css'",
  "import './sovereign-cohesion.css'",
  "import './premium-surface-hardening.css'",
  "import './selective-visual-port.css'",
  "import './expression-field/expression-field.css'",
  "location.pathname === '/app'",
  '<AuthenticatedWorkspace />'
]);

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

requireAll('shared tokens', tokens, [
  '--sov-page: #0d0d0e',
  '--sov-panel: #151516',
  '--sov-raised: #1c1c1e',
  '--sov-paper: #eee8df',
  '--sov-clay: #dda273',
  '--sov-sage: #9fbaa1',
  '--sov-danger: #d19a9a'
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

requireAll('canonical cohesion system', cohesion, [
  'Sovereign.OS cohesion release',
  'Canonical presentation layer',
  '--cohesion-night:#080a09',
  '--cohesion-paper:#ece5da',
  '--cohesion-clay:#c98a64',
  '--cohesion-sage:#a5b5a2',
  "url('/assets/sovereign-context-field.svg')",
  '.hero-intelligence-stage',
  '.baseline-context-stage',
  '.scale-experience',
  '.question-section',
  '.permission-field',
  '.intelligence-workspace',
  '.sovereign-composer',
  '.mobile-bottom-nav',
  'grid-template-columns:repeat(6,minmax(0,1fr))',
  '@media(max-width:1180px)',
  '@media(max-width:980px)',
  '@media(max-width:760px)',
  '@media(max-width:560px)',
  '@media(max-width:420px)',
  '@media(prefers-reduced-motion:reduce)',
  'env(safe-area-inset-bottom)'
]);

requireAll('selective visual port layer', `${landing}\n${hardening}\n${selectivePort}`, [
  'STEP 01 · YOU',
  'STEP 02 · YOU + 1',
  'STEP 03 · YOUR WHOLE SYSTEM',
  'visual-reasoning-panel',
  'className="visual-evidence-chips"',
  'className="relationship-baseline-pair"',
  'className="story-system-map"',
  '.sovereign-story-step',
  '.response-thread .answer-baseline',
  '.response-thread .relationship-answer > div:first-child',
  '.system-overview .system-graph',
  '.response-thread .basis-strip',
  '.relationship-baseline-pair',
  '.story-fixture-boundary'
]);

requireAll('workspace layout and accessibility', workspaceCss, [
  'width:224px',
  'width:360px',
  'width:min(100%,1120px)',
  'min-height:44px',
  'font-size:1rem',
  '@media(max-width:980px)',
  '@media(max-width:760px)',
  '@media(max-width:420px)',
  '@media (max-width: 680px)',
  '@media(prefers-reduced-motion:reduce)',
  '@media (prefers-reduced-motion: reduce)',
  'env(safe-area-inset-bottom)'
]);

requireAll('public category clarity', landing, [
  'Know yourself.',
  'Understand the system.',
  'Choose what fits.',
  'private AI for understanding yourself',
  'Why do I keep taking responsibility for everyone else?',
  'EXAMPLE ANSWER',
  'Sanitized demonstration · Not your Baseline',
  'Sanitized product demonstrations · Illustrative Baseline values · Not your personal result',
  'Build my Baseline'
]);
if (landing.indexOf('Sanitized demonstration · Not your Baseline') > landing.indexOf('YOU ASKED')) {
  throw new Error('The public answer boundary must appear before the demonstration question.');
}

requireAll('public product stage', landing, [
  'DIRECT ANSWER',
  'THE PERSONAL CONNECTION',
  'A PRACTICAL NEXT STEP',
  'Why this is personal',
  'Shadow',
  'Gift',
  'Alignment',
  'BASIS',
  '<LandingExpressionField />',
  'WHAT MAY BE ACTIVE NOW',
  'YOUR CONFIRMATION',
  'STILL UNKNOWN',
  'WHAT HAPPENS BETWEEN YOU',
  'PRESSURE FIELD',
  'PERMISSION BEFORE COMPARISON'
]);

requireAll('Expression Field public and authenticated composition', `${landing}\n${authenticatedWorkspace}\n${expressionField}\n${expressionFieldFixture}`, [
  "import { LandingExpressionField } from './expression-field/ExpressionField'",
  '<LandingExpressionField />',
  'export function LandingExpressionField()',
  'Sanitized demonstration · Illustrative values · Not your Baseline',
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

if (landing.includes('Healing isn’t optional. Holding the pain is.')) {
  throw new Error('The public homepage must not present Sovereign.OS as a healing product.');
}
for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'localStorage']) {
  if (landing.includes(prohibited)) throw new Error(`The public homepage contains prohibited mock or scoring behavior: ${prohibited}`);
}

requireAll('public visual accessibility', landingCss, [
  'font-size:clamp(3.75rem,5.2vw,4.25rem)',
  'min-height:44px',
  'min-width: 320px',
  '.relationship-baseline-pair',
  '.story-person-node[aria-pressed="true"]',
  '.expression-field-canvas',
  '@media(max-width:980px)',
  '@media(max-width:760px)',
  '@media(max-width:420px)',
  '@media (max-width: 680px)',
  '@media(prefers-reduced-motion:reduce)',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)'
]);

requireAll('Sovereign context field asset', contextField, [
  '<title id="title">Sovereign context field</title>',
  'translucent planes and lines reorganizing around a central opening',
  '<linearGradient id="planeA"',
  '<linearGradient id="planeB"',
  '<filter id="depth"',
  'aria-labelledby="title description"'
]);

requireAll('static public support experience', staticExperienceCss, [
  '--paper: #080a09',
  '.pricing-grid',
  '.pricing-page .pricing-hero > p:last-child',
  '.questions-page .questions-hero > p:last-child',
  '.price-card-body',
  '.plan-comparison-list',
  '.faq-list details',
  'border-radius: 2px',
  'min-width: 320px',
  '@media (max-width: 860px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('static page cohesion', `${how}\n${pricing}\n${faq}`, [
  '20260730-cohesion',
  'Private personal, relationship, and system intelligence',
  'Build my Baseline',
  '$20',
  '$99',
  '10 Sovereign AI turns each month',
  '300 Sovereign AI turns each month',
  'permission'
]);

requireAll('system membership manager', membership, [
  "person.identityBound === true",
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

for (const [label, css] of [
  ['premium hardening', hardening],
  ['selective visual port', selectivePort],
  ['Expression Field', expressionFieldCss]
]) {
  const open = (css.match(/{/g) ?? []).length;
  const close = (css.match(/}/g) ?? []).length;
  if (open !== close) throw new Error(`${label} CSS has unbalanced braces (${open}/${close}).`);
}

console.log('Sovereign.OS cohesion release, Expression Field, and product contract verified.');