import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const requireAll = (label, source, values) => {
  for (const value of values) assert(source.includes(value), `${label} is missing ${value}`);
};
const balanced = (label, source) => {
  const open = (source.match(/{/g) ?? []).length;
  const close = (source.match(/}/g) ?? []).length;
  assert(open === close, `${label} CSS has unbalanced braces (${open}/${close}).`);
};

const main = read('apps/web/src/main.tsx');
const app = read('apps/web/src/App.tsx');
const authenticated = read('apps/web/src/AuthenticatedWorkspace.tsx');
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const onboarding = read('apps/web/src/PlanOnboarding.tsx');
const controls = read('apps/web/src/AccountControlCenter.tsx');
const membership = read('apps/web/src/SystemMembershipManager.tsx');
const finalCss = read('apps/web/src/premium-platform-release.css');
const publicCss = read('apps/web/public/premium-public-release.css');
const how = read('apps/web/public/how-it-works.html');
const pricing = read('apps/web/public/pricing.html');
const faq = read('apps/web/public/faq.html');
const notFound = read('apps/web/public/404.html');

const selectiveImport = "import './selective-visual-port.css';";
const finalImport = "import './premium-platform-release.css';";
const selectiveIndex = main.indexOf(selectiveImport);
const finalIndex = main.indexOf(finalImport);
assert(selectiveIndex >= 0, 'Selective visual reference layer is not imported.');
assert(finalIndex > selectiveIndex, 'Premium final-release composition must load after the selective visual port.');
assert(!main.slice(finalIndex + finalImport.length).includes("import './"), 'Another local visual layer loads after the premium final-release composition.');

requireAll('premium React surface coverage', finalCss, [
  '.sovereign-landing',
  '.sovereign-policy',
  '.public-not-found',
  '.private-route-gate',
  '.account-shell',
  '.auth-panel',
  '.plan-onboarding',
  '.intelligence-workspace',
  '.today-facet-view',
  '.explore-editorial',
  '.relationship-overview',
  '.system-overview',
  '.baseline-builder',
  '.baseline-reveal',
  '.sovereign-answer',
  '.sovereign-composer',
  '.intelligence-context',
  '.library-grid',
  '.account-control-dialog',
  '.system-membership-dialog',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)',
  '@media print',
  'env(safe-area-inset-bottom)'
]);

requireAll('premium static surface coverage', publicCss, [
  '.launch-nav',
  '.launch-hero',
  '.journey-steps',
  '.baseline-explainer',
  '.pricing-grid',
  '.price-card',
  '.plan-comparison-list',
  '.faq-list',
  '.launch-callout',
  '.not-found-stage',
  '.launch-footer',
  'min-width: 320px',
  '@media (max-width: 620px)',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)'
]);

for (const [label, document] of [
  ['How it works', how],
  ['Pricing', pricing],
  ['Questions', faq],
  ['Not found', notFound]
]) requireAll(label, document, ['/premium-public-release.css?v=20260730-final', 'SOVEREIGN.OS']);

requireAll('canonical workspace', `${authenticated}\n${workspace}`, [
  'data-workspace-contract="one-room"',
  '<SovereignIntelligenceWorkspace onboardingVerified />',
  '<AccountControlCenter />',
  '<SystemMembershipManager />',
  "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'",
  "version: 'sovereign-answer.v2'"
]);

requireAll('authentication and invitation architecture', app, [
  "path === '/login'",
  "path === '/signup'",
  "path === '/invitation'",
  "path === '/onboarding'",
  '__TURNSTILE_SITE_KEY__',
  '/api/v1/invitations/preview',
  '/api/v1/invitations/redeem'
]);

requireAll('Stripe and billing architecture', `${onboarding}\n${controls}`, [
  "/api/v1/billing/checkout",
  'JSON.stringify({ interval })',
  "/api/v1/billing/portal"
]);

requireAll('consent-enforced systems', membership, [
  "person.identityBound === true",
  "person.activeScopes.includes('system.include')",
  '/members`,'
]);

for (const prohibited of [
  'Alignment Score',
  'Stability Index',
  'Growth Rate',
  'compatibility-score',
  'Math.random',
  'localStorage',
  'mock-auth',
  'fake-answer',
  'dashboard-grid'
]) assert(!`${finalCss}\n${publicCss}`.includes(prohibited), `Premium release introduces prohibited behavior or framing: ${prohibited}`);

balanced('premium React release', finalCss);
balanced('premium public release', publicCss);

console.log(JSON.stringify({
  ok: true,
  release: 'premium-platform-final',
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  answerContract: 'sovereign-answer.v2',
  preservedSystems: ['authentication', 'Turnstile', 'Stripe checkout', 'Stripe portal', 'consent', 'Baseline', 'current context', 'People', 'Systems', 'Library'],
  coveredRoutes: ['home', 'how-it-works', 'pricing', 'faq', 'privacy', 'terms', 'login', 'signup', 'redeem', 'invitation', 'onboarding', 'app', 'not-found']
}, null, 2));
