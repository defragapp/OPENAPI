import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };
const requireAll = (label, source, values) => values.forEach((value) => assert(source.includes(value), `${label} is missing ${value}`));
const rejectAll = (label, source, values) => values.forEach((value) => assert(!source.includes(value), `${label} contains prohibited ${value}`));
const balanced = (label, source) => assert((source.match(/{/g) ?? []).length === (source.match(/}/g) ?? []).length, `${label} CSS is unbalanced.`);

const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;

const main = read('apps/web/src/main.tsx');
const fingerprint = read('apps/web/src/v0-release-fingerprint.ts');
const app = read('apps/web/src/App.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const stories = read('apps/web/src/LandingProductStories.tsx');
const field = read('apps/web/src/expression-field/LandingExpressionSlice.tsx');
const viewportProbe = read('apps/web/src/PublicLandingViewportContract.ts');
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const onboarding = read('apps/web/src/PlanOnboarding.tsx');
const controls = read('apps/web/src/AccountControlCenter.tsx');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const v0PlatformVisual = read('apps/web/src/v0-platform-port.css');
const v0MotionVisual = read('apps/web/src/v0-motion-accessibility.css');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const v0GlobalVisual = read('apps/web/src/v0-global-experience.css');
const fieldVisual = read('apps/web/src/landing-expression-field-v3.css');
const fieldIntegration = read('apps/web/src/landing-expression-field-integration.css');
const storyVisual = read('apps/web/src/v0-restored-product-stories.css');
const heroVisual = read('apps/web/src/landing-hero-field-v4.css');
const passkeyVisual = read('apps/web/src/passkey-auth.css');
const staticV0Visual = read('apps/web/public/v0-public-port.css');
const publicSupport = read('apps/web/public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`apps/web/public/${name}.html`));

for (const path of [
  'apps/web/src/v0-release-fingerprint.ts',
  'apps/web/src/v0-platform-port.css',
  'apps/web/src/v0-motion-accessibility.css',
  'apps/web/src/v0-visual-port.css',
  'apps/web/src/v0-global-experience.css',
  'apps/web/src/landing-expression-field-v3.css',
  'apps/web/src/landing-expression-field-integration.css',
  'apps/web/src/v0-restored-product-stories.css',
  'apps/web/src/landing-hero-field-v4.css',
  'apps/web/src/passkey-auth.css',
  'apps/web/public/v0-public-port.css'
]) assert(existsSync(path), `Required release source is missing: ${path}`);

const orderedImports = [
  "import './v0-platform-port.css';",
  "import './v0-motion-accessibility.css';",
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
  assert(index > previousImport, `Visual import order is wrong at ${marker}`);
  previousImport = index;
}
assert(!main.slice(previousImport + orderedImports.at(-1).length).includes("import './"), 'A local visual layer loads after passkey authority.');

requireAll('landing v3 runtime fingerprint', `${fingerprint}\n${main}`, [
  `V0_ARCHIVE_SHA256 = '${archiveSha}'`,
  `V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`,
  "PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'",
  "PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3'",
  "dataset.sovereignVisualContract = 'v0-landing-selective-port'",
  'dataset.sovereignV0Archive = V0_ARCHIVE_SHA256',
  'dataset.sovereignV0Sequence = V0_SEQUENCE_FINGERPRINT',
  "import { installV0ReleaseFingerprint } from './v0-release-fingerprint'",
  'installV0ReleaseFingerprint();'
]);

requireAll('landing archive and hero contract', landing, [
  `const V0_ARCHIVE_SHA = '${archiveSha}'`,
  'data-visual-contract="v0-landing-selective-port"',
  'data-v0-archive-sha={V0_ARCHIVE_SHA}',
  'data-viewport-contract="v0-public-landing-v3"',
  'Personal AI for real life',
  'Healing isn’t optional.',
  'Holding onto the pain is.',
  '<LandingExpressionSlice />',
  '<RealLifeQuestions />',
  'Bring the question you actually have.',
  'Why do I keep taking responsibility for everyone around me?',
  'What is mine, what is theirs, and what happens between us?',
  '<LandingProductStories />'
]);

const renderedSequence = landing.slice(landing.indexOf('export function PublicLanding()'), landing.indexOf('function V0Navigation()'));
const orderedLandingMarkers = [
  '<V0Navigation />',
  '<V0Hero />',
  '<RealLifeQuestions />',
  '<LandingProductStories />',
  '<ComparisonStory />',
  '<FinalCallToAction />',
  '<V0Footer />'
];
let previousMarker = -1;
for (const marker of orderedLandingMarkers) {
  const index = renderedSequence.indexOf(marker);
  assert(index > previousMarker, `Landing composition order is wrong at ${marker}`);
  previousMarker = index;
}

requireAll('restored product stories', stories, [
  '<PersonalStory />',
  '<RelationshipStory />',
  '<SystemStory />',
  'Ask about your life.',
  'Get an answer built for you.',
  'Understand what happens',
  'between you.',
  'From one person',
  'to the whole system.',
  'surface="personal-chat"',
  'surface="personal-reasoning"',
  'surface="relationship-chat"',
  'surface="relationship-reasoning"',
  'surface="system-map"',
  'surface="system-reasoning"',
  'Reading your Baseline',
  'Finding the pattern',
  'Building the distinction',
  'Answering the real question',
  'Keeping both people distinct',
  'Reading each perspective',
  'Finding the interaction',
  'Showing what happens between you',
  'Mapping the people',
  'Reading roles and responsibility',
  'Tracing the recurring pattern',
  'Showing the whole system',
  'className="v0-baseline-trace"',
  'v0-workflow-panel',
  'v0-family-system-map',
  'Illustrative permitted Baselines',
  'No compatibility score',
  'No private-thought claims',
  'Each person controls what may be included'
]);
rejectAll('restored product stories', stories, ['LandingExpressionFieldPreview', 'sphere', 'globe']);

requireAll('integrated hero field', `${field}\n${fieldVisual}\n${fieldIntegration}\n${heroVisual}`, [
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
  '.landing-expression-slice__sphere-shell',
  '.landing-expression-slice__sphere-grid path',
  'stroke: #2f93ff',
  'width: 100vw',
  'border-radius: 0',
  'background: transparent',
  'touch-action: none'
]);
rejectAll('integrated hero field', field, ['Math.random', 'giftExpression', 'shadowExpression']);
assert(!field.includes('<div className="landing-expression-slice__tooltip"'), 'The retired floating tooltip returned to the hero field.');

requireAll('real-life question visual authority', heroVisual, [
  '.landing-question-orbit',
  '.landing-question-orbit__stage',
  '@keyframes landing-real-question',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('restored story visual authority', storyVisual, [
  '.v0-restored-product-stories',
  '.v0-story-grid',
  '.v0-window',
  '.v0-workflow-panel',
  '.v0-family-system-map',
  'min-height: 44px',
  'border-radius: 4px',
  '@media (max-width: 760px)',
  '@media (max-width: 390px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('founder v0 visual language', v0Visual, [
  `Source archive SHA-256:\n * ${archiveSha}`,
  '--v0-page: #0f0f0f',
  '--v0-cream: #e8ddd0',
  '.v0-hero',
  '.v0-story-grid',
  '.v0-baseline-trace',
  '.v0-flow',
  '.v0-family-map',
  '.v0-comparison-grid',
  '.v0-final',
  '.intelligence-workspace',
  '.sovereign-composer',
  '.account-shell',
  '.auth-panel'
]);

requireAll('application route coverage', v0PlatformVisual, [
  'body:has(.plan-onboarding)',
  'body:has(.sovereign-policy)',
  'body:has(.email-code-fallback)',
  '.onboarding-plan-grid',
  '.policy-grid',
  '.email-code-fallback',
  '@media (max-width: 700px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('standalone route authority', `${publicSupport}\n${staticV0Visual}`, [
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

requireAll('rendered viewport measurement', viewportProbe, [
  "'hero'",
  "'expression-slice'",
  "'personal-chat'",
  "'personal-reasoning'",
  "'relationship-chat'",
  "'relationship-reasoning'",
  "'system-map'",
  "'system-reasoning'",
  "'comparison'",
  'getBoundingClientRect()',
  'node.offsetWidth',
  'comparisonStacked',
  'runPublicLandingViewportContract'
]);

requireAll('canonical workspace', `${authenticated}\n${workspace}`, [
  'data-workspace-contract="one-room"',
  '<SovereignIntelligenceWorkspace onboardingVerified />',
  "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'",
  "version: 'sovereign-answer.v2'",
  '/api/v1/threads/',
  '/api/v1/today',
  '/api/v1/people',
  '/api/v1/systems'
]);
requireAll('real authentication', app, ["path === '/login'", "path === '/signup'", "path === '/invitation'", '__TURNSTILE_SITE_KEY__']);
requireAll('real billing', `${onboarding}\n${controls}`, ['/api/v1/billing/checkout', '/api/v1/billing/portal']);
requireAll('real consent', membership, ['person.identityBound === true', "person.activeScopes.includes('system.include')"]);

const productionSource = `${landing}\n${stories}\n${field}\n${v0PlatformVisual}\n${v0Visual}\n${app}\n${workspace}`;
rejectAll('selective v0 port', productionSource, [
  'Math.random',
  'localStorage.setItem("sovereign-user"',
  'mock-auth',
  'fake-answer',
  'dashboard-grid',
  'Demo User',
  'generateAIResponse',
  'Alignment Score',
  'Stability Index',
  'Growth Rate'
]);

supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'Sovereign.OS']));
for (const [label, source] of [
  ['founder v0 platform', v0PlatformVisual],
  ['founder v0 motion', v0MotionVisual],
  ['founder v0 visual foundation', v0Visual],
  ['founder v0 global authority', v0GlobalVisual],
  ['landing field', fieldVisual],
  ['field integration', fieldIntegration],
  ['restored product stories', storyVisual],
  ['hero field and questions', heroVisual],
  ['passkey authority', passkeyVisual],
  ['standalone authority', staticV0Visual],
  ['public support authority', publicSupport]
]) balanced(label, source);

console.log(JSON.stringify({
  ok: true,
  release: 'sovereign-v0-public-landing-v3',
  archiveSha256: archiveSha,
  sequenceFingerprint,
  canonicalLanding: 'PublicLanding.tsx + LandingProductStories.tsx',
  publicField: 'landing-expression-field-v3-spherical-360',
  questionTreatment: 'rotating-real-life-questions',
  productStories: ['personal-chat-workflow', 'relationship-chat-workflow', 'system-chat-workflow'],
  visualDirection: 'founder-v0-dark-editorial',
  excludedMockRuntime: true,
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  answerContract: 'sovereign-answer.v2',
  renderedViewportProbe: true
}, null, 2));
