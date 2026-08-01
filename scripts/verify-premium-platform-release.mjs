import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };
const requireAll = (label, source, values) => values.forEach((value) => assert(source.includes(value), `${label} is missing ${value}`));
const rejectAll = (label, source, values) => values.forEach((value) => assert(!source.includes(value), `${label} contains prohibited ${value}`));
const balanced = (label, source) => assert((source.match(/{/g) ?? []).length === (source.match(/}/g) ?? []).length, `${label} CSS is unbalanced.`);

const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|rotating-real-life-questions|ask-about-your-life|get-an-answer-built-for-you|see-the-space-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;
const main = read('apps/web/src/main.tsx');
const fingerprint = read('apps/web/src/v0-release-fingerprint.ts');
const app = read('apps/web/src/App.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const viewportProbe = read('apps/web/src/PublicLandingViewportContract.ts');
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const onboarding = read('apps/web/src/PlanOnboarding.tsx');
const controls = read('apps/web/src/AccountControlCenter.tsx');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const v0PlatformVisual = read('apps/web/src/v0-platform-port.css');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const staticV0Visual = read('apps/web/public/v0-public-port.css');
const publicSupport = read('apps/web/public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`apps/web/public/${name}.html`));

for (const path of [
  'apps/web/src/v0-release-fingerprint.ts',
  'apps/web/src/v0-platform-port.css',
  'apps/web/src/v0-visual-port.css',
  'apps/web/public/v0-public-port.css'
]) assert(existsSync(path), `Founder v0 release source is missing: ${path}`);

const platformImport = "import './v0-platform-port.css';";
const v0Import = "import './v0-visual-port.css';";
const platformImportIndex = main.indexOf(platformImport);
const v0ImportIndex = main.indexOf(v0Import);
assert(platformImportIndex >= 0, 'The founder v0 platform coverage layer is not imported.');
assert(v0ImportIndex > platformImportIndex, 'The founder v0 final authority does not load after route coverage.');
assert(!main.slice(v0ImportIndex + v0Import.length).includes("import './"), 'A local visual layer loads after the founder v0 authority.');

requireAll('founder v0 runtime fingerprint', `${fingerprint}\n${main}`, [
  `V0_ARCHIVE_SHA256 = '${archiveSha}'`,
  `V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`,
  "dataset.sovereignVisualContract = 'v0-landing-selective-port'",
  'dataset.sovereignV0Archive = V0_ARCHIVE_SHA256',
  'dataset.sovereignV0Sequence = V0_SEQUENCE_FINGERPRINT',
  "import { installV0ReleaseFingerprint } from './v0-release-fingerprint'",
  'installV0ReleaseFingerprint();'
]);

requireAll('founder v0 archive fingerprint', landing, [
  `const V0_ARCHIVE_SHA = '${archiveSha}'`,
  'data-visual-contract="v0-landing-selective-port"',
  'data-v0-archive-sha={V0_ARCHIVE_SHA}',
  'data-viewport-contract="v0-public-landing-v1"'
]);

requireAll('founder v0 hero copy', landing, [
  'Healing isn’t optional.',
  'Holding onto the pain is.'
]);

const renderStart = landing.indexOf('export function PublicLanding()');
const renderEnd = landing.indexOf('function V0Navigation()', renderStart);
assert(renderStart >= 0, 'PublicLanding render function is missing.');
assert(renderEnd > renderStart, 'PublicLanding render boundary is missing.');
const renderedSequence = landing.slice(renderStart, renderEnd);
const orderedLandingMarkers = [
  '<V0Navigation />',
  '<V0Hero />',
  '<RotatingQuestions />',
  '<PersonalStory />',
  '<RelationshipStory />',
  '<SystemStory />',
  '<ComparisonStory />',
  '<FinalCallToAction />',
  '<V0Footer />'
];
let previousIndex = -1;
for (const marker of orderedLandingMarkers) {
  const index = renderedSequence.indexOf(marker);
  assert(index >= 0, `Founder v0 rendered composition is missing ${marker}`);
  assert(index > previousIndex, `Founder v0 rendered composition order is wrong at ${marker}`);
  previousIndex = index;
}

requireAll('founder v0 public composition', landing, [
  'Personal AI for real life',
  'Ask about your life.',
  'Get an answer built for you.',
  'See the space',
  'between you.',
  'From one person',
  'to the whole system.',
  'Other AI answers',
  'everyone the same.',
  'Your thoughts deserve',
  'a better place to live.',
  'data-viewport-surface="personal-chat"',
  'data-viewport-surface="personal-reasoning"',
  'data-viewport-surface="relationship-chat"',
  'data-viewport-surface="relationship-reasoning"',
  'data-viewport-surface="system-map"',
  'data-viewport-surface="comparison"',
  'Illustrative permitted Baselines',
  'No compatibility score',
  'Each person controls what may be included'
]);

requireAll('v0 visual language', v0Visual, [
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
  '.intelligence-sidebar',
  '.sovereign-composer',
  '.account-shell',
  '.auth-panel',
  '@media (max-width: 760px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('v0 application route coverage', v0PlatformVisual, [
  'body:has(.plan-onboarding)',
  'body:has(.sovereign-policy)',
  'body:has(.email-code-fallback)',
  '.plan-nav',
  '.onboarding-plan-grid',
  '.plan-visual',
  '.policy-hero',
  '.policy-grid',
  '.policy-contact',
  '.email-code-fallback',
  '@media (max-width: 700px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('v0 static-route visual language', staticV0Visual, [
  `Archive SHA-256: ${archiveSha}`,
  'body.launch-page',
  '.launch-nav',
  '.launch-hero',
  '.journey-steps',
  '.pricing-grid',
  '.faq-list details',
  '.launch-footer',
  '@media(max-width:760px)',
  '@media(prefers-reduced-motion:reduce)'
]);
requireAll('static route authority import', publicSupport, ["@import url('/v0-public-port.css?v=20260801-founder-v0')"]);

requireAll('v0 rendered viewport measurement', viewportProbe, [
  "'hero'",
  "'personal-chat'",
  "'personal-reasoning'",
  "'relationship-chat'",
  "'relationship-reasoning'",
  "'system-map'",
  "'comparison'",
  'const narrow = snapshot.viewportWidth <= narrowViewportMaximum',
  'getBoundingClientRect()',
  'node.offsetWidth',
  'comparisonStacked',
  'runPublicLandingViewportContract'
]);

requireAll('canonical real workspace', `${authenticated}\n${workspace}`, [
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

const productionVisualSource = `${landing}\n${v0PlatformVisual}\n${v0Visual}\n${app}\n${workspace}`;
rejectAll('selective v0 port', productionVisualSource, [
  'Math.random',
  'localStorage.setItem("sovereign-user"',
  'mock-auth',
  'fake-answer',
  'dashboard-grid',
  'Demo User',
  'generateAIResponse',
  'Same generic dashboard'
]);

supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'SOVEREIGN.OS']));
balanced('founder v0 platform coverage', v0PlatformVisual);
balanced('founder v0 visual authority', v0Visual);
balanced('founder v0 static authority', staticV0Visual);
balanced('public support authority', publicSupport);

console.log(JSON.stringify({
  ok: true,
  release: 'sovereign-v0-selective-visual-port',
  archiveSha256: archiveSha,
  sequenceFingerprint,
  canonicalLanding: 'PublicLanding.tsx + v0-visual-port.css',
  platformRouteCoverage: 'v0-platform-port.css',
  staticRouteVisualAuthority: 'v0-public-port.css',
  visualDirection: 'founder-v0-dark-editorial',
  portMode: 'components-and-styling-only',
  excludedMockRuntime: true,
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  answerContract: 'sovereign-answer.v2',
  renderedViewportProbe: true
}, null, 2));
