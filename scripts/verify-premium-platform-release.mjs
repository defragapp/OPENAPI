import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (value, message) => { if (!value) throw new Error(message); };
const requireAll = (label, source, values) => values.forEach((value) => assert(source.includes(value), `${label} is missing ${value}`));
const balanced = (label, source) => assert((source.match(/{/g) ?? []).length === (source.match(/}/g) ?? []).length, `${label} CSS is unbalanced.`);

const main = read('apps/web/src/main.tsx');
const app = read('apps/web/src/App.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const landingCss = read('apps/web/src/public-landing.css');
const viewportProbe = read('apps/web/src/PublicLandingViewportContract.ts');
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const onboarding = read('apps/web/src/PlanOnboarding.tsx');
const controls = read('apps/web/src/AccountControlCenter.tsx');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const premium = read('apps/web/src/premium-platform-release.css');
const visual = read('apps/web/src/sovereign-visual-system.css');
const viewport = read('apps/web/src/responsive-viewport-contract.css');
const publicCss = read('apps/web/public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`apps/web/public/${name}.html`));

assert(main.includes("import './public-landing.css';"), 'Public landing visual owner is not imported.');
assert(!main.includes('mobile-density-contract.css'), 'The retired mobile density override is still imported.');
assert(!/final|refinement|polish.*css|landing-v2/i.test(main), 'A retired override-layer filename is imported.');

requireAll('v0 editorial landing', landing, [
  'className="sovereign-public"', 'data-visual-contract="v0-editorial-reconciliation"',
  'Know yourself.', 'Understand the system.', 'Choose what fits.',
  'className="baseline-artifact"', 'className="product-window chat-window"',
  'className="product-window workflow-window"', 'className="workflow-branches"',
  'className="system-instrument"', 'className="system-center"',
  'className="consent-editorial"', 'className="pricing-editorial"',
  '$20', '$99 / year'
]);
requireAll('public landing visual owner', landingCss, [
  '.sovereign-public', '.public-hero', '.baseline-hinge', '.story-grid', '.product-window',
  '.system-instrument', '.consent-editorial', '.pricing-editorial',
  '@supports (animation-timeline:view())', '@media (max-width:720px)', '@media (max-width:390px)', '@media (prefers-reduced-motion:reduce)'
]);
for (const layer of [premium, visual, viewport]) assert(!layer.includes('.sovereign-public'), 'A later visual layer overrides the isolated public route.');
requireAll('rendered viewport measurement', viewportProbe, ['getBoundingClientRect()', 'node.offsetWidth', 'doc.documentElement.scrollWidth', 'consentStacked', "querySelector<HTMLElement>('.sovereign-public')"]);
requireAll('canonical workspace', `${authenticated}\n${workspace}`, ['data-workspace-contract="one-room"', '<SovereignIntelligenceWorkspace onboardingVerified />', "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'", "version: 'sovereign-answer.v2'"]);
requireAll('auth', app, ["path === '/login'", "path === '/signup'", "path === '/invitation'", '__TURNSTILE_SITE_KEY__']);
requireAll('billing', `${onboarding}\n${controls}`, ['/api/v1/billing/checkout', '/api/v1/billing/portal']);
requireAll('consent', membership, ['person.identityBound === true', "person.activeScopes.includes('system.include')"]);
supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'SOVEREIGN.OS']));
for (const source of [landingCss, premium, visual, viewport, publicCss]) balanced('visual contract', source);
for (const prohibited of ['Healing isn', 'compatibility-score', 'Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'mock-auth', 'fake-answer']) assert(!landing.includes(prohibited), `Public landing contains prohibited value: ${prohibited}`);

const visualParity = spawnSync(process.execPath, ['scripts/verify-public-visual-parity.mjs'], { encoding: 'utf8' });
assert(visualParity.status === 0, `Public visual parity gate failed: ${visualParity.stderr || visualParity.stdout}`);

console.log(JSON.stringify({ ok: true, release: 'sovereign-v0-editorial-reconciliation', canonicalWorkspace: 'SovereignIntelligenceWorkspace', answerContract: 'sovereign-answer.v2', publicVisualOwner: 'public-landing.css', renderedViewportProbe: true }, null, 2));
