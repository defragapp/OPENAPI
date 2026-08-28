import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const requireAll = (label, source, values) => {
  for (const value of values) assert(source.includes(value), `${label} is missing ${value}`);
};
const rejectAll = (label, source, values) => {
  for (const value of values) assert(!source.includes(value), `${label} contains prohibited ${value}`);
};
const balanced = (label, source) => {
  const open = (source.match(/{/g) ?? []).length;
  const close = (source.match(/}/g) ?? []).length;
  assert(open === close, `${label} CSS has unbalanced braces (${open}/${close}).`);
};

const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;

const main = read('apps/web/src/main.tsx');
const fingerprint = read('apps/web/src/v0-release-fingerprint.ts');
const landing = read('apps/web/src/PublicLanding.tsx');
const stories = read('apps/web/src/LandingProductStories.tsx');
const storyCss = read('apps/web/src/landing-product-stories-v2.css');
const landingField = read('apps/web/src/expression-field/LandingExpressionSlice.tsx');
const landingFieldCss = read('apps/web/src/landing-expression-field-v3.css');
const landingFieldIntegration = read('apps/web/src/landing-expression-field-integration.css');
const heroVisual = read('apps/web/src/landing-hero-field-v4.css');
const refinement = read('apps/web/src/experience-refinement-v1.css');
const routeCohesionCss = read('apps/web/src/deployed-route-cohesion.css');
const authenticatedWorkspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
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
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const product = read('apps/sovereign-worker/src/db/product.ts');
const v0Platform = read('apps/web/src/v0-platform-port.css');
const v0Motion = read('apps/web/src/v0-motion-accessibility.css');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const v0Global = read('apps/web/src/v0-global-experience.css');
const passkeyCss = read('apps/web/src/passkey-auth.css');
const staticAuthority = read('apps/web/public/premium-public-release.css');
const staticV0 = read('apps/web/public/v0-public-port.css');
const staticRefinement = read('apps/web/public/experience-static-refinement-v1.css');
const how = read('apps/web/public/how-it-works.html');
const pricing = read('apps/web/public/pricing.html');
const faq = read('apps/web/public/faq.html');

for (const path of [
  'apps/web/src/LandingProductStories.tsx',
  'apps/web/src/landing-product-stories-v2.css',
  'apps/web/src/expression-field/LandingExpressionSlice.tsx',
  'apps/web/src/landing-expression-field-v3.css',
  'apps/web/src/landing-expression-field-integration.css',
  'apps/web/src/landing-hero-field-v4.css',
  'apps/web/src/experience-refinement-v1.css',
  'apps/web/src/deployed-route-cohesion.css',
  'apps/web/src/passkey-auth.css',
  'apps/web/public/experience-static-refinement-v1.css'
]) assert(existsSync(path), `Required visual release source is missing: ${path}`);

requireAll('application entry', main, [
  "import { installV0ReleaseFingerprint } from './v0-release-fingerprint'",
  "import './landing-expression-field-v3.css'",
  "import './landing-expression-field-integration.css'",
  "import './landing-product-stories-v2.css'",
  "import './landing-hero-field-v4.css'",
  "import './deployed-route-cohesion.css'",
  "import './passkey-auth.css'",
  "import experienceRefinementCss from './experience-refinement-v1.css?inline'",
  'style.textContent += `\\n${experienceRefinementCss}`',
  "dataset.sovereignProductStories = 'isolated-mobile-first-v2'",
  'installV0ReleaseFingerprint();'
]);

const fieldImport = "import './landing-expression-field-v3.css';";
const integrationImport = "import './landing-expression-field-integration.css';";
const storyImport = "import './landing-product-stories-v2.css';";
const heroImport = "import './landing-hero-field-v4.css';";
const routeCohesionImport = "import './deployed-route-cohesion.css';";
const passkeyImport = "import './passkey-auth.css';";
assert(main.indexOf(fieldImport) < main.indexOf(integrationImport), 'Field integration must load after field geometry.');
assert(main.indexOf(integrationImport) < main.indexOf(storyImport), 'Isolated story styling must load after the opening field.');
assert(main.indexOf(storyImport) < main.indexOf(heroImport), 'Hero field extension must load after isolated story styling.');
assert(main.indexOf(heroImport) < main.indexOf(routeCohesionImport), 'Route cohesion styling must load after hero interaction authority.');
assert(main.indexOf(routeCohesionImport) < main.indexOf(passkeyImport), 'Route cohesion styling must load before the final passkey stylesheet authority.');
assert(!main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './"), 'A local stylesheet import loads after passkey authority.');

/* The sequence fingerprint preserves founder archive provenance; active UI copy is verified separately below. */
requireAll('runtime identity', fingerprint, [
  `V0_ARCHIVE_SHA256 = '${archiveSha}'`,
  `V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`,
  "PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'",
  "PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3'",
  "dataset.sovereignVisualContract = 'v0-landing-selective-port'"
]);

requireAll('public landing', landing, [
  `const V0_ARCHIVE_SHA = '${archiveSha}'`,
  'data-visual-contract="v0-landing-selective-port"',
  'data-viewport-contract="v0-public-landing-v3"',
  'Healing isn’t optional.',
  'Holding onto the pain is.',
  'Personal intelligence for real life',
  'Sovereign begins with the capacity beneath a pattern.',
  'See a Sovereign answer',
  '<LandingExpressionSlice />',
  '<RealLifeQuestions />',
  'Start with what’s actually happening.',
  'Why do we keep having the same fight?',
  '<LandingProductStories />',
  '<ComparisonStory />',
  '<FinalCallToAction />',
  'Generic AI',
  'Your thoughts deserve'
]);
for (const retired of ['Ask about your life.', 'What do you want to understand?', 'Bring the question you already have.', 'Bring the question you actually have.']) {
  assert(!landing.includes(retired), `Public landing contains retired language: ${retired}`);
}

const landingRenderStart = landing.indexOf('export function PublicLanding()');
const landingRenderEnd = landing.indexOf('function V0Navigation()', landingRenderStart);
assert(landingRenderStart >= 0 && landingRenderEnd > landingRenderStart, 'PublicLanding render boundary is missing.');
const renderedLanding = landing.slice(landingRenderStart, landingRenderEnd);
const orderedLanding = ['<V0Navigation />', '<V0Hero />', '<RealLifeQuestions />', '<LandingProductStories />', '<ComparisonStory />', '<FinalCallToAction />', '<V0Footer />'];
let prior = -1;
for (const marker of orderedLanding) {
  const index = renderedLanding.indexOf(marker);
  assert(index > prior, `Landing render order is wrong at ${marker}`);
  prior = index;
}

requireAll('isolated landing demonstrations', stories, [
  '<PersonalStory />',
  '<RelationshipStory />',
  '<SystemStory />',
  'className="landing-stories"',
  'className="landing-story__stage"',
  'className="landing-demo landing-demo--chat"',
  'className="landing-demo landing-demo--workflow"',
  'className="landing-evidence"',
  'className="landing-workflow"',
  'className="landing-system-map"',
  'surface="personal-chat"',
  'surface="personal-reasoning"',
  'surface="relationship-chat"',
  'surface="relationship-reasoning"',
  'surface="system-map"',
  'surface="system-reasoning"',
  'Capacity beneath the pattern',
  'How pressure changes the expression',
  'What may keep it going',
  'What could change',
  'Keeping both people distinct',
  'System structure',
  'Illustrative permitted Baselines',
  'No compatibility score',
  'No private-thought claims',
  'Each person controls what may be included'
]);
for (const retired of ['Ask about your life.', 'Get an answer built for you.', 'Bring the question']) {
  assert(!stories.includes(retired), `Landing demonstrations contain retired language: ${retired}`);
}

const renderedStoriesStart = stories.indexOf('export function LandingProductStories()');
assert(renderedStoriesStart >= 0, 'LandingProductStories render source is missing.');
const renderedStories = stories.slice(renderedStoriesStart);
rejectAll('rendered landing demonstrations', renderedStories, [
  'className="v0-story-grid"',
  'className="v0-window',
  'className="v0-window-body"',
  'className="v0-flow',
  'className="v0-workflow-panel"',
  'className="v0-family-system-map"',
  'LandingExpressionFieldPreview',
  'sphere',
  'globe'
]);

requireAll('mobile-first story visual authority', storyCss, [
  '.landing-stories',
  '.landing-story__stage',
  '.landing-demo',
  '.landing-demo__body',
  '.landing-workflow',
  '.landing-system-map',
  'align-items: start',
  'height: auto',
  'min-height: 0',
  '@media (max-width: 900px)',
  'display: flex',
  'flex-direction: column',
  '@media (max-width: 760px)',
  '@media (max-width: 390px)',
  '@media (prefers-reduced-motion: reduce)',
  'min-height: 44px',
  'border-radius: 4px'
]);
rejectAll('mobile-first story visual authority', storyCss, [
  'min-height: 690px',
  'min-height: 720px',
  'height: 100%'
]);

requireAll('integrated opening field foundation', `${landingField}\n${landingFieldCss}\n${landingFieldIntegration}\n${heroVisual}`, [
  'data-visual-contract="landing-expression-field-v3"',
  'data-field-geometry="spherical-360"',
  'onPointerDown={handlePointerDown}',
  'onPointerMove={handlePointerMove}',
  'landing-expression-slice__readout',
  'MIN_AXIS_LENGTH',
  'MAX_AXIS_LENGTH',
  'Math.pow(normalized, 1.32)',
  'buildSphereGrid',
  'requestAnimationFrame',
  '.landing-expression-slice__ambient',
  '.landing-expression-slice__sphere-shell',
  '.landing-expression-slice__sphere-grid path',
  'background: transparent',
  'border-radius: 0',
  'width: 100vw',
  'touch-action: none'
]);
requireAll('final opening field presentation', refinement, [
  '--landing-blue: #e8ddd0 !important',
  '--landing-blue-bright: #fffaf3 !important',
  '.landing-expression-slice__beam',
  'fill: rgba(241, 233, 222, 0.72) !important',
  '-webkit-text-stroke: 1.15px rgba(241, 233, 222, 0.82)'
]);
rejectAll('integrated opening field', landingField, ['Math.random', 'giftExpression', 'shadowExpression']);
assert(!landingField.includes('<div className="landing-expression-slice__tooltip"'), 'The retired floating tooltip returned.');
requireAll('real-life question visual authority', heroVisual, [
  '.landing-question-orbit',
  '.landing-question-orbit__stage',
  '@keyframes landing-real-question',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('authenticated workspace', `${authenticatedWorkspace}\n${workspace}`, [
  'data-workspace-contract="one-room"',
  '<SovereignIntelligenceWorkspace onboardingVerified />',
  "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'",
  "version: 'sovereign-answer.v2'",
  'What is active for you now?',
  'Look closer at the pattern.',
  'Understand what happens between you.',
  'See how the whole system functions.',
  'Keep what changes your understanding.',
  'className="system-graph"',
  'className="basis-strip"',
  '<WorkspaceExpressionField',
  '<ThreadExpressionField'
]);
requireAll('final workspace presentation', refinement, [
  '.sovereign-app-runtime .intelligence-sidebar',
  '.sovereign-app-runtime .sovereign-composer',
  '.sovereign-app-runtime .intelligence-context',
  '--refine-paper: #e8ddd0',
  '--refine-page: #080a0d'
]);

requireAll('deterministic Expression Field', `${expressionField}\n${expressionFieldMath}\n${expressionFieldContract}\n${expressionFieldFixture}`, [
  'export function ExpressionFieldRenderer',
  'context.moveTo(centerX, centerY)',
  'quaternionFromUnitVectors',
  'slerpQuaternion',
  'expressionAxisIds.length',
  "export const EXPRESSION_FIELD_VERSION = 'expression-field.v1'",
  "export const EXPRESSION_AXIS_REGISTRY_VERSION = 'expression-axis-registry.v1'",
  'ONE CENTER · SIXTEEN EXPRESSIONS'
]);
rejectAll('deterministic Expression Field', `${expressionField}\n${expressionFieldMath}`, ['Math.random']);

requireAll('relationship and system field composition', `${relationalExpressionField}\n${systemExpressionField}\n${relationalContext}`, [
  '<ExpressionFieldRenderer',
  'data-expression-field-composition="relationship"',
  'data-expression-field-composition="system"',
  'buildExpressionAxisValues({ facets: baseline.facets })',
  'expressionAxes'
]);

requireAll('private Expression Field route', `${runtimeEntry}\n${expressionFieldWorker}`, [
  "url.pathname === '/api/v1/expression-field'",
  'handleExpressionFieldRequest(request, env)',
  'const auth = await requireAuth(request, env)',
  "value.subject === 'self'",
  "'cache-control': 'private, no-store'",
  "measurementKind: 'relative_expression_salience'",
  "state: 'unconfirmed'"
]);

requireAll('Expression Field accessibility', expressionFieldCss, [
  'touch-action: pan-y',
  'touch-action: none',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)',
  'env(safe-area-inset-top)',
  'env(safe-area-inset-bottom)'
]);

requireAll('consent-safe system membership', `${membership}\n${product}`, [
  'person.identityBound === true',
  "person.activeScopes.includes('system.include')",
  "cg.scope = 'system.include'",
  "i.status = 'accepted'",
  'p.bound_account_id IS NOT NULL',
  "await requireConsent(env, accountId, personId, 'system.include')"
]);

requireAll('application route coverage', `${v0Platform}\n${routeCohesionCss}\n${refinement}`, [
  'body:has(.plan-onboarding)',
  'body:has(.sovereign-policy)',
  'body:has(.email-code-fallback)',
  '.public-secondary-page',
  '.private-route-gate',
  ':where(.plan-onboarding, .public-secondary-page, .public-not-found, .private-route-gate)',
  '@media (prefers-reduced-motion: reduce)'
]);
requireAll('founder visual foundation', `${v0Visual}\n${v0Global}\n${v0Motion}`, [
  '--v0-page: #0f0f0f',
  '--v0-cream: #e8ddd0',
  '.v0-hero',
  '.v0-comparison-grid',
  '.v0-final',
  '.intelligence-workspace',
  '.sovereign-composer',
  '.account-shell'
]);
requireAll('standalone routes', `${staticAuthority}\n${staticV0}\n${staticRefinement}\n${how}\n${pricing}\n${faq}`, [
  "@import url('/v0-public-port.css?v=20260801-founder-v0')",
  `Archive SHA-256: ${archiveSha}`,
  '/experience-static-refinement-v1.css?v=20260816-refinement-v1',
  '--v0-blue: #e8ddd0',
  'Sovereign.OS',
  'Build my Baseline',
  '$20',
  '$99',
  'permission'
]);

for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'generateAIResponse', 'Demo User', 'dashboard-grid', 'mock-auth', 'fake-answer']) {
  assert(!`${landing}\n${renderedStories}`.includes(prohibited), `Public visual release contains prohibited ${prohibited}`);
}

for (const [label, css] of [
  ['platform coverage', v0Platform],
  ['motion coverage', v0Motion],
  ['founder visual foundation', v0Visual],
  ['global visual authority', v0Global],
  ['landing field', landingFieldCss],
  ['landing field integration', landingFieldIntegration],
  ['hero field and questions', heroVisual],
  ['isolated product stories', storyCss],
  ['route cohesion authority', routeCohesionCss],
  ['experience refinement', refinement],
  ['passkey authority', passkeyCss],
  ['standalone authority', staticV0],
  ['standalone refinement', staticRefinement],
  ['authenticated Expression Field', expressionFieldCss]
]) balanced(label, css);

console.log(JSON.stringify({
  ok: true,
  release: 'sovereign-v0-public-landing-v3-refined-experience',
  archiveSha256: archiveSha,
  sequenceFingerprint,
  publicField: 'landing-expression-field-v3-spherical-360',
  questionTreatment: 'situational-real-life-questions',
  productStoryDom: 'isolated-mobile-first-v2',
  productStories: ['personal-chat-workflow', 'relationship-context', 'system-context'],
  legacyStoryDomRendered: false,
  mobileNaturalHeightRequired: true,
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  answerContract: 'sovereign-answer.v2'
}, null, 2));