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
const density = read('apps/web/src/mobile-density-contract.css');
const publicCss = read('apps/web/public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`apps/web/public/${name}.html`));
const reactCss = `${premium}\n${visual}\n${viewport}\n${density}`;

const imports = ["import './premium-platform-release.css';", "import './sovereign-visual-system.css';", "import './responsive-viewport-contract.css';", "import './mobile-density-contract.css';"];
const indexes = imports.map((value) => main.indexOf(value));
assert(indexes.every((value) => value >= 0), 'A required visual contract import is missing.');
assert(indexes.every((value, index) => index === 0 || value > indexes[index - 1]), 'React visual layers load in the wrong order.');
assert(!main.slice(indexes[3] + imports[3].length).includes("import './"), 'A local visual layer loads after the density contract.');
assert(!/final|refinement|polish.*css|landing-v2/i.test(main), 'A retired override-layer filename is imported.');

requireAll('viewport repair', viewport, ['.sovereign-landing .hero-intelligence-stage', 'grid-template-columns: minmax(0, 1fr);', 'min-height: 0;', '@media (max-width: 700px)', '@media (max-width: 430px)']);
requireAll('mobile density contract', density, ['@media (max-width: 700px)', '@media (max-width: 430px)', 'font-size: clamp(3.15rem, 15.6vw, 4.55rem);', '.sovereign-landing .visual-demo-window', '.sovereign-landing .permission-section', '@media (prefers-reduced-motion: reduce)']);
requireAll('visual surfaces', reactCss, ['.sovereign-landing', '.intelligence-workspace', '.relationship-overview', '.system-overview', '.baseline-builder', '.sovereign-answer', '.sovereign-composer', '.visual-demo-window', '.story-system-map']);
requireAll('canonical workspace', `${authenticated}\n${workspace}`, ['data-workspace-contract="one-room"', '<SovereignIntelligenceWorkspace onboardingVerified />', "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'", "version: 'sovereign-answer.v2'"]);
requireAll('auth', app, ["path === '/login'", "path === '/signup'", "path === '/invitation'", '__TURNSTILE_SITE_KEY__']);
requireAll('billing', `${onboarding}\n${controls}`, ['/api/v1/billing/checkout', '/api/v1/billing/portal']);
requireAll('consent', membership, ['person.identityBound === true', "person.activeScopes.includes('system.include')"]);
supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'SOVEREIGN.OS']));
for (const source of [premium, visual, viewport, density, publicCss]) balanced('visual contract', source);

console.log(JSON.stringify({ ok: true, release: 'sovereign-mobile-density-contract', canonicalWorkspace: 'SovereignIntelligenceWorkspace', answerContract: 'sovereign-answer.v2' }, null, 2));