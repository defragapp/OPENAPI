import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };
const requireAll = (label, source, values) => values.forEach((value) => assert(source.includes(value), `${label} is missing ${value}`));
const rejectAll = (label, source, values) => values.forEach((value) => assert(!source.includes(value), `${label} contains prohibited ${value}`));
const balanced = (label, source) => assert((source.match(/{/g) ?? []).length === (source.match(/}/g) ?? []).length, `${label} CSS is unbalanced.`);

const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const main = read('apps/web/src/main.tsx');
const app = read('apps/web/src/App.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const viewportProbe = read('apps/web/src/PublicLandingViewportContract.ts');
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const onboarding = read('apps/web/src/PlanOnboarding.tsx');
const controls = read('apps/web/src/AccountControlCenter.tsx');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const publicSupport = read('apps/web/public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`apps/web/public/${name}.html`));

assert(existsSync('apps/web/src/v0-visual-port.css'), 'The founder v0 visual authority is missing.');
const v0Import = "import './v0-visual-port.css';";
const v0ImportIndex = main.indexOf(v0Import);
assert(v0ImportIndex >= 0, 'The founder v0 visual authority is not imported.');
assert(!main.slice(v0ImportIndex + v0Import.length).includes("import './"), 'A local visual layer loads after the founder v0 authority.');

requireAll('founder v0 archive fingerprint', landing, [
  `const V0_ARCHIVE_SHA = '${archiveSha}'`,
  'data-visual-contract="v0-landing-selective-port"',
  'data-v0-archive-sha={V0_ARCHIVE_SHA}',
  'data-viewport-contract="v0-public-landing-v1"'
]);

const orderedLandingMarkers = [
  'Healing isn’t optional.',
  'Holding onto the pain is.',
  '<RotatingQuestions />',
  '<PersonalStory />',
  '<RelationshipStory />',
  '<SystemStory />',
  '<ComparisonStory />',
  '<FinalCallToAction />'
];
let previousIndex = -1;
for (const marker of orderedLandingMarkers) {
  const index = landing.indexOf(marker);
  assert(index > previousIndex, `Founder v0 landing order is wrong at ${marker}`);
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

requireAll('v0 rendered viewport measurement', viewportProbe, [
  "'hero'",
  "'personal-chat'",
  "'personal-reasoning'",
  "'relationship-chat'",
  "'relationship-reasoning'",
  "'system-map'",
  "'comparison'",
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

const productionVisualSource = `${landing}\n${v0Visual}\n${app}\n${workspace}`;
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
balanced('founder v0 visual authority', v0Visual);
balanced('public support', publicSupport);

console.log(JSON.stringify({
  ok: true,
  release: 'sovereign-v0-selective-visual-port',
  archiveSha256: archiveSha,
  canonicalLanding: 'PublicLanding.tsx + v0-visual-port.css',
  visualDirection: 'founder-v0-dark-editorial',
  portMode: 'components-and-styling-only',
  excludedMockRuntime: true,
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  answerContract: 'sovereign-answer.v2',
  renderedViewportProbe: true
}, null, 2));
