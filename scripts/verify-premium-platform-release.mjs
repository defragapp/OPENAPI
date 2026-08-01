import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };
const requireAll = (label, source, values) => values.forEach((value) => assert(source.includes(value), `${label} is missing ${value}`));
const balanced = (label, source) => assert((source.match(/{/g) ?? []).length === (source.match(/}/g) ?? []).length, `${label} CSS is unbalanced.`);

const main = read('apps/web/src/main.tsx');
const app = read('apps/web/src/App.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const viewportProbe = read('apps/web/src/PublicLandingViewportContract.ts');
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const onboarding = read('apps/web/src/PlanOnboarding.tsx');
const controls = read('apps/web/src/AccountControlCenter.tsx');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const premium = read('apps/web/src/premium-platform-release.css');
const visual = read('apps/web/src/sovereign-visual-system.css');
const viewport = read('apps/web/src/responsive-viewport-contract.css');
const editorial = read('apps/web/src/public-landing-editorial.css');
const publicCss = read('apps/web/public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`apps/web/public/${name}.html`));
const reactCss = `${premium}\n${visual}\n${viewport}\n${editorial}`;

const imports = [
  "import './premium-platform-release.css';",
  "import './sovereign-visual-system.css';",
  "import './typography-system.css';",
  "import './responsive-viewport-contract.css';",
  "import './public-landing-editorial.css';"
];
const indexes = imports.map((value) => main.indexOf(value));
assert(indexes.every((value) => value >= 0), 'A required visual contract import is missing.');
assert(indexes.every((value, index) => index === 0 || value > indexes[index - 1]), 'React visual layers load in the wrong order.');
const finalImportEnd = indexes.at(-1) + imports.at(-1).length;
assert(!main.slice(finalImportEnd).includes("import './"), 'A local visual layer loads after the canonical public landing contract.');
assert(!main.includes('landing-live-correction.css'), 'The obsolete landing correction layer is still imported.');
assert(!existsSync('apps/web/src/landing-live-correction.css'), 'The obsolete landing correction layer still exists.');
assert(!main.includes('mobile-density-contract.css'), 'The retired mobile density override is still imported.');
assert(!/final|refinement|polish.*css|landing-v2/i.test(main), 'A retired override-layer filename is imported.');

requireAll('rendered landing composition', landing, [
  'data-viewport-contract="public-landing-v1"',
  'className="story-product-stage"',
  'data-viewport-surface="permission"',
  'surface="personal-chat"',
  'surface="personal-reasoning"',
  'surface="relationship-chat"',
  'surface="relationship-reasoning"',
  'surface="system-map"'
]);
requireAll('responsive viewport contract', viewport, [
  '.sovereign-landing .sovereign-story-step',
  '.sovereign-landing [data-viewport-surface]',
  'width: calc(100% - var(--public-mobile-left) - var(--public-mobile-right));',
  'min-height: 0;',
  'transform: none;',
  'env(safe-area-inset-left)',
  'env(safe-area-inset-right)',
  '@media (max-width: 760px)',
  '@media (max-width: 430px)'
]);
requireAll('canonical public landing contract', editorial, [
  '--editorial-page:#0f0f0f',
  '--editorial-cream:#e8ddd0',
  '.sovereign-landing .landing-nav',
  '.sovereign-landing .landing-hero',
  '.sovereign-landing .hero-intelligence-stage',
  '.sovereign-landing .landing-foundation',
  '.sovereign-landing .sovereign-story-step',
  '.sovereign-landing .permission-section',
  '.sovereign-landing .pricing-preview',
  '@media(max-width:1024px)',
  '@media(max-width:760px)',
  '@media(max-width:430px)',
  '@media(prefers-reduced-motion:reduce)'
]);
requireAll('rendered viewport measurement', viewportProbe, [
  'getBoundingClientRect()',
  'node.offsetWidth',
  'doc.documentElement.scrollWidth',
  'permissionStacked',
  'runPublicLandingViewportContract',
  "new URLSearchParams(location.search).get('viewport-contract') !== '1'"
]);
requireAll('visual surfaces', reactCss, ['.sovereign-landing', '.intelligence-workspace', '.relationship-overview', '.system-overview', '.baseline-builder', '.sovereign-answer', '.sovereign-composer', '.visual-demo-window', '.story-system-map']);
requireAll('canonical workspace', `${authenticated}\n${workspace}`, ['data-workspace-contract="one-room"', '<SovereignIntelligenceWorkspace onboardingVerified />', "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'", "version: 'sovereign-answer.v2'"]);
requireAll('auth', app, ["path === '/login'", "path === '/signup'", "path === '/invitation'", '__TURNSTILE_SITE_KEY__']);
requireAll('billing', `${onboarding}\n${controls}`, ['/api/v1/billing/checkout', '/api/v1/billing/portal']);
requireAll('consent', membership, ['person.identityBound === true', "person.activeScopes.includes('system.include')"]);
supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'SOVEREIGN.OS']));
for (const [label, source] of [['premium', premium], ['visual', visual], ['responsive', viewport], ['public landing', editorial], ['public support', publicCss]]) balanced(label, source);

console.log(JSON.stringify({
  ok: true,
  release: 'sovereign-cinematic-public-landing',
  canonicalLanding: 'public-landing-editorial.css',
  visualDirection: 'zip-inspired-cinematic-dark',
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  answerContract: 'sovereign-answer.v2',
  renderedViewportProbe: true
}, null, 2));
