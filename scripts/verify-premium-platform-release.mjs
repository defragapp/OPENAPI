import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };
const requireAll = (label, source, values) => values.forEach((value) => assert(source.includes(value), `${label} is missing ${value}`));
const balanced = (label, source) => assert((source.match(/{/g) ?? []).length === (source.match(/}/g) ?? []).length, `${label} CSS is unbalanced.`);

const main = read('apps/web/src/main.tsx');
const app = read('apps/web/src/App.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const engine = read('apps/web/src/engine-room.css');
const safeArea = read('apps/web/src/engine-room-safe-area.css');
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const onboarding = read('apps/web/src/PlanOnboarding.tsx');
const controls = read('apps/web/src/AccountControlCenter.tsx');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const publicCss = read('apps/web/public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`apps/web/public/${name}.html`));

const safeAreaImport = "import './engine-room-safe-area.css';";
const engineImport = "import './engine-room.css';";
assert(main.includes(safeAreaImport), 'Engine Room safe-area import is missing.');
assert(main.includes(engineImport), 'Engine Room import is missing.');
assert(main.indexOf(engineImport) > main.indexOf(safeAreaImport), 'Engine Room must load after its safe-area layer.');
assert(!main.slice(main.indexOf(engineImport) + engineImport.length).includes("import './"), 'A local visual layer loads after Engine Room.');
assert(!main.includes('landing-live-correction.css'), 'The obsolete landing correction layer is still imported.');
assert(!existsSync('apps/web/src/landing-live-correction.css'), 'The obsolete landing correction layer still exists.');

requireAll('canonical Engine Room composition', landing, [
  'className="sovereign-landing engine-room"',
  '<BootSequence />', '<EngineHeader />', '<TechnicalGrid />', '<DataPointField />',
  '<HeroIntelligenceStage />', '<BaselineContextStage />', '<ConnectedScalesStage',
  '<PublicAnswerStage />', '<TerminalStage />', '<EngineProgress />',
  'KNOW YOURSELF.', 'UNDERSTAND THE SYSTEM.', 'Choose what fits.',
  'Your intelligence begins with your Baseline.',
  'ONE INTELLIGENCE · THREE CONNECTED SCALES',
  'Why do I keep taking responsibility for everyone else?',
  'The question is whether the responsibility is actually yours.',
  'SOVEREIGN+ / $20 MONTHLY / $99 YEARLY',
  '&gt; READY'
]);

requireAll('canonical Engine Room visual system', `${safeArea}\n${engine}`, [
  '--engine-black: #050505', '--engine-ink: #f2eee6', '--engine-copper: #c38a67',
  '.engine-scroll-shell', 'height: 560svh', 'position: sticky', '.engine-grid', '.baseline-machine',
  '.scale-machine', '.query-computation', '.engine-terminal',
  '@media (max-width: 760px)', '@media (max-width: 440px)', '@media (prefers-reduced-motion: reduce)',
  'min-height: 44px', 'env(safe-area-inset-bottom)'
]);
for (const prohibited of ['font-family: var(--font-display)', 'border-radius: 999px', '#e8ddd0 !important']) {
  assert(!engine.includes(prohibited), `Engine Room contains prohibited retired treatment: ${prohibited}`);
}

requireAll('canonical workspace', `${authenticated}\n${workspace}`, [
  'data-workspace-contract="one-room"', '<SovereignIntelligenceWorkspace onboardingVerified />',
  "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'",
  "version: 'sovereign-answer.v2'"
]);
requireAll('auth', app, ["path === '/login'", "path === '/signup'", "path === '/invitation'", '__TURNSTILE_SITE_KEY__']);
requireAll('billing', `${onboarding}\n${controls}`, ['/api/v1/billing/checkout', '/api/v1/billing/portal']);
requireAll('consent', membership, ['person.identityBound === true', "person.activeScopes.includes('system.include')"]);
supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'SOVEREIGN.OS']));
balanced('Engine Room', engine);
balanced('Engine Room safe area', safeArea);
balanced('public support', publicCss);

console.log(JSON.stringify({
  ok: true,
  release: 'sovereign-engine-room',
  canonicalLanding: 'PublicLanding.tsx + engine-room.css',
  visualDirection: 'continuous-scroll-driven-intelligence-environment',
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  answerContract: 'sovereign-answer.v2',
  pricing: { free: 0, monthly: 20, annual: 99 },
  renderedViewportProbe: true
}, null, 2));
