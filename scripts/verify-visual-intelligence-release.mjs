import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const requireAll = (label, source, values) => {
  for (const value of values) {
    if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
  }
};
const balanced = (label, source) => {
  const open = (source.match(/{/g) ?? []).length;
  const close = (source.match(/}/g) ?? []).length;
  if (open !== close) throw new Error(`${label} CSS has unbalanced braces (${open}/${close}).`);
};

const main = read('apps/web/src/main.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const engineCss = read('apps/web/src/engine-room.css');
const engineSafeAreaCss = read('apps/web/src/engine-room-safe-area.css');
const engine = `${engineSafeAreaCss}\n${engineCss}`;
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const expressionField = read('apps/web/src/expression-field/ExpressionField.tsx');
const expressionFieldCss = read('apps/web/src/expression-field/expression-field.css');
const expressionFieldMath = read('apps/web/src/expression-field/expression-field-math.ts');
const expressionFieldWorker = read('apps/sovereign-worker/src/expression-field.ts');
const runtimeEntry = read('apps/sovereign-worker/src/runtime-entry.ts');
const expressionFieldContract = read('packages/agent-contracts/src/expression-field.ts');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const product = read('apps/sovereign-worker/src/db/product.ts');

requireAll('application entry', main, [
  "import { AuthenticatedWorkspace } from './AuthenticatedWorkspace'",
  "import './engine-room-safe-area.css'",
  "import './engine-room.css'",
  "location.pathname === '/app'",
  '<AuthenticatedWorkspace />'
]);
if (main.indexOf("import './engine-room.css'") < main.indexOf("import './public-landing-editorial.css'")) {
  throw new Error('Engine Room must load after all retired public landing layers.');
}

requireAll('Engine Room product narrative', landing, [
  'data-product-contract="baseline-first"',
  'data-answer-contract="sovereign-answer.v2"',
  'data-viewport-contract="engine-room-v1"',
  'KNOW YOURSELF.',
  'UNDERSTAND THE SYSTEM.',
  'Personal, relationship, and system intelligence built from context.',
  '&gt; BUILD_MY_BASELINE',
  '&gt; VIEW_ENGINE',
  'Your intelligence begins with a stable Baseline.',
  'INPUT / NATAL_REDUCTION',
  'STATUS / VALIDATED',
  'SELF',
  'RELATIONSHIP',
  'SYSTEM',
  'PERMISSION /',
  'SOURCE /',
  'CONSENTED',
  'Why do I keep taking responsibility for everyone else?',
  'FETCH_BASELINE',
  'APPLY_CURRENT_CONTEXT',
  'DISTINGUISH_SIGNAL',
  'FORM_UNDERSTANDING',
  'Your capacity is real.',
  'The question is whether the responsibility is actually yours.',
  'I will do my part.',
  'I must make this work for everyone.',
  '&gt; READY'
]);

requireAll('Engine Room behavior', landing, [
  "type EngineState = 'hero' | 'baseline' | 'scales' | 'query' | 'ready'",
  'window.requestAnimationFrame(update)',
  "window.addEventListener('scroll', requestUpdate, { passive: true })",
  "window.matchMedia('(prefers-reduced-motion: reduce)')",
  'resolveState(next)',
  "'--engine-progress': progress.toFixed(4)"
]);

requireAll('Engine Room visual accessibility', engine, [
  '--engine-bg: #050505',
  '--engine-ink: #f2efe8',
  '--engine-clay: #b77b5e',
  '--engine-sage: #829b8c',
  '--engine-rose: #a96f72',
  '--engine-sans:',
  '--engine-mono:',
  '.engine-scroll-shell { min-height: 600svh; }',
  'position: sticky',
  'min-height: 44px',
  '@media (max-width: 900px)',
  '@media (max-width: 680px)',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)',
  'env(safe-area-inset-top)',
  'env(safe-area-inset-bottom)',
  'env(safe-area-inset-left)',
  'env(safe-area-inset-right)'
]);
for (const prohibited of [
  'Purple AI',
  'OVERLAP: 68%',
  'Compatibility score',
  'Math.random',
  'localStorage',
  'font-family: var(--font-display)',
  'border-radius: 999px'
]) {
  if (`${landing}\n${engine}`.includes(prohibited)) {
    throw new Error(`Engine Room contains prohibited implementation or framing: ${prohibited}`);
  }
}

requireAll('canonical authenticated workspace', `${authenticated}\n${workspace}`, [
  "import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace'",
  "import { AccountExpressionField } from './expression-field/ExpressionField'",
  'data-workspace-contract="one-room"',
  '<SovereignIntelligenceWorkspace onboardingVerified />',
  '<AccountExpressionField />',
  "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'",
  "version: 'sovereign-answer.v2'",
  'className="basis-strip"',
  'className="system-graph"'
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
  "state: 'unconfirmed'"
]);
requireAll('Expression Field accessibility', expressionFieldCss, [
  'touch-action: pan-y',
  'touch-action: none',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)'
]);

requireAll('system membership manager', membership, [
  'person.identityBound === true',
  "person.activeScopes.includes('system.include')",
  'Add only permitted people.'
]);
requireAll('consent-safe system projection', product, [
  'FROM system_memberships sm',
  "cg.scope = 'system.include'",
  "i.status = 'accepted'",
  'cg.granted_at IS NOT NULL AND cg.revoked_at IS NULL',
  'p.bound_account_id IS NOT NULL'
]);

for (const prohibited of ['God is telling you', 'They secretly want', 'This proves', 'You are incompatible', 'Tarot']) {
  if (`${workspace}\n${landing}`.toLowerCase().includes(prohibited.toLowerCase())) {
    throw new Error(`User interface contains prohibited framing: ${prohibited}`);
  }
}

balanced('Engine Room', engineCss);
balanced('Engine Room safe area', engineSafeAreaCss);
balanced('Expression Field', expressionFieldCss);
console.log('Sovereign.OS Engine Room, Expression Field, and product intelligence contracts verified.');
