import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };
const requireAll = (label, source, values) => values.forEach((value) => assert(source.includes(value), `${label} is missing ${value}`));
const balanced = (label, source) => assert((source.match(/{/g) ?? []).length === (source.match(/}/g) ?? []).length, `${label} CSS is unbalanced.`);

const main = read('apps/web/src/main.tsx');
const app = read('apps/web/src/App.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const engine = read('apps/web/src/engine-room.css');
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const onboarding = read('apps/web/src/PlanOnboarding.tsx');
const controls = read('apps/web/src/AccountControlCenter.tsx');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const publicCss = read('apps/web/public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`apps/web/public/${name}.html`));

const imports = [
  "import './premium-platform-release.css';",
  "import './sovereign-visual-system.css';",
  "import './typography-system.css';",
  "import './responsive-viewport-contract.css';",
  "import './public-landing-editorial.css';",
  "import './public-landing-production-lock.css';",
  "import './engine-room.css';"
];
const indexes = imports.map((value) => main.indexOf(value));
assert(indexes.every((value) => value >= 0), 'A required visual contract import is missing.');
assert(indexes.every((value, index) => index === 0 || value > indexes[index - 1]), 'React visual layers load in the wrong order.');
const finalImportEnd = indexes.at(-1) + imports.at(-1).length;
assert(!main.slice(finalImportEnd).includes("import './"), 'A local visual layer loads after Engine Room.');
assert(!main.includes('landing-live-correction.css'), 'The obsolete landing correction layer is still imported.');
assert(!existsSync('apps/web/src/landing-live-correction.css'), 'The obsolete landing correction layer still exists.');

requireAll('Engine Room composition', landing, [
  'className="sovereign-landing engine-room"',
  'data-viewport-contract="engine-room-v1"',
  '<BootSequence />',
  '<EngineHeader />',
  '<TechnicalGrid />',
  '<DataPointField />',
  '<HeroState />',
  '<BaselineState />',
  '<ConnectedScalesState />',
  '<LiveQueryState />',
  '<ReadyState />',
  'KNOW YOURSELF.',
  'UNDERSTAND THE SYSTEM.',
  'Your intelligence begins with a stable Baseline.',
  'Move outward without rebuilding context.',
  'Why do I keep taking responsibility for everyone else?',
  'The question is whether the responsibility is actually yours.',
  '&gt; READY'
]);

requireAll('Engine Room visual system', engine, [
  '--engine-bg: #050505',
  '--engine-sans:',
  '--engine-mono:',
  '.engine-scroll-shell { min-height: 600svh; }',
  'position: sticky',
  '.engine-grid',
  '.baseline-machine',
  '.scale-field',
  '.query-computation',
  '.engine-ready',
  '@media (max-width: 680px)',
  '@media (prefers-reduced-motion: reduce)',
  'min-height: 44px'
]);
for (const prohibited of ['font-family: var(--font-display)', 'border-radius: 999px', '#e8ddd0 !important']) {
  assert(!engine.includes(prohibited), `Engine Room contains prohibited editorial treatment: ${prohibited}`);
}

requireAll('canonical workspace', `${authenticated}\n${workspace}`, [
  'data-workspace-contract="one-room"',
  '<SovereignIntelligenceWorkspace onboardingVerified />',
  "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'",
  "version: 'sovereign-answer.v2'"
]);
requireAll('auth', app, ["path === '/login'", "path === '/signup'", "path === '/invitation'", '__TURNSTILE_SITE_KEY__']);
requireAll('billing', `${onboarding}\n${controls}`, ['/api/v1/billing/checkout', '/api/v1/billing/portal']);
requireAll('consent', membership, ['person.identityBound === true', "person.activeScopes.includes('system.include')"]);
supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'SOVEREIGN.OS']));
balanced('Engine Room', engine);
balanced('public support', publicCss);

console.log(JSON.stringify({
  ok: true,
  release: 'sovereign-engine-room',
  canonicalLanding: 'engine-room.css',
  visualDirection: 'continuous-scroll-driven-intelligence-environment',
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  answerContract: 'sovereign-answer.v2',
  renderedViewportProbe: true
}, null, 2));
