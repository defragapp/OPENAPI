import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };
const requireAll = (label, source, values) => values.forEach((value) => assert(source.includes(value), `${label} is missing ${value}`));
const balanced = (label, source) => assert((source.match(/{/g) ?? []).length === (source.match(/}/g) ?? []).length, `${label} CSS is unbalanced.`);

const main = read('apps/web/src/main.tsx');
const app = read('apps/web/src/App.tsx');
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const onboarding = read('apps/web/src/PlanOnboarding.tsx');
const controls = read('apps/web/src/AccountControlCenter.tsx');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const premium = read('apps/web/src/premium-platform-release.css');
const visual = read('apps/web/src/sovereign-visual-system.css');
const viewport = read('apps/web/src/responsive-viewport-contract.css');
const density = read('apps/web/src/mobile-density-polish.css');
const publicCss = read('apps/web/public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`apps/web/public/${name}.html`));
const reactCss = `${premium}\n${visual}\n${viewport}\n${density}`;

const premiumImport = "import './premium-platform-release.css';";
const visualImport = "import './sovereign-visual-system.css';";
const viewportImport = "import './responsive-viewport-contract.css';";
const densityImport = "import './mobile-density-polish.css';";
const premiumIndex = main.indexOf(premiumImport);
const visualIndex = main.indexOf(visualImport);
const viewportIndex = main.indexOf(viewportImport);
const densityIndex = main.indexOf(densityImport);
assert(premiumIndex >= 0 && visualIndex > premiumIndex && viewportIndex > visualIndex && densityIndex > viewportIndex, 'React visual layers load in the wrong order.');
assert(!main.slice(densityIndex + densityImport.length).includes("import './"), 'A local visual layer loads after the mobile density contract.');

requireAll('viewport repair', viewport, [
  '.sovereign-landing .hero-intelligence-stage', 'display: block;',
  'grid-template-columns: minmax(0, 1fr);', 'min-height: 0;',
  '@media (max-width: 700px)', '@media (max-width: 430px)',
  '.sovereign-landing .permission-section', '.intelligence-scroll',
  '@media (prefers-reduced-motion: reduce)'
]);
requireAll('mobile density refinement', density, [
  '@media (max-width: 700px)', '@media (max-width: 430px)',
  'font-size: clamp(3.25rem, 15.8vw, 4.35rem);',
  'padding-block: 62px;', '.sovereign-landing .permission-section',
  '.sovereign-landing .visual-demo-window', '@media (prefers-reduced-motion: reduce)'
]);
requireAll('visual surfaces', reactCss, [
  '.sovereign-landing', '.intelligence-workspace', '.today-facet-view', '.explore-editorial',
  '.relationship-overview', '.system-overview', '.baseline-builder', '.baseline-reveal',
  '.sovereign-answer', '.sovereign-composer', '.intelligence-context', '.library-grid',
  '.visual-demo-window', '.visual-reasoning-panel', '.story-system-map',
  '@supports (animation-timeline: view())', '@media (forced-colors: active)', '@media print',
  'env(safe-area-inset-bottom)'
]);
requireAll('canonical workspace', `${authenticated}\n${workspace}`, [
  'data-workspace-contract="one-room"', '<SovereignIntelligenceWorkspace onboardingVerified />',
  '<AccountControlCenter />', '<SystemMembershipManager />',
  "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'",
  "version: 'sovereign-answer.v2'"
]);
requireAll('auth and invitations', app, ["path === '/login'", "path === '/signup'", "path === '/invitation'", '__TURNSTILE_SITE_KEY__']);
requireAll('billing', `${onboarding}\n${controls}`, ['/api/v1/billing/checkout', 'JSON.stringify({ interval })', '/api/v1/billing/portal']);
requireAll('consent', membership, ['person.identityBound === true', "person.activeScopes.includes('system.include')"]);
supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'SOVEREIGN.OS']));
for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'compatibility-score', 'Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid']) assert(!`${reactCss}\n${publicCss}`.includes(prohibited), `Prohibited framing found: ${prohibited}`);
balanced('premium', premium);
balanced('visual', visual);
balanced('viewport', viewport);
balanced('density', density);
balanced('public', publicCss);

console.log(JSON.stringify({ ok: true, release: 'sovereign-mobile-density-refinement', canonicalWorkspace: 'SovereignIntelligenceWorkspace', answerContract: 'sovereign-answer.v2' }, null, 2));