const publicBase = String(process.env.PUBLIC_BASE_URL || 'https://sovereign.defrag.app').replace(/\/$/, '');
const expectedCssPath = '/v0-public-static.css?v=20260803-refined-v2';
const routeCssPath = '/deployed-route-cohesion.css?v=20260803-route-v1';
const refinementCssPath = '/experience-static-refinement-v1.css?v=20260817-cohesion-v2';
const terminalCssPath = '/premium-action-static-v1.css?v=20260818-geist-v1';
const expectedContract = 'founder-v0-locked-v1';
const staticRoutes = ['/how-it-works', '/pricing', '/faq'];
const policyRoutes = ['/privacy', '/terms'];

function fail(message) {
  throw new Error(`Secondary public visual verification failed: ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

async function read(path) {
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${publicBase}${path}${separator}verify=${Date.now()}`, {
    headers: {
      accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
      'cache-control': 'no-cache',
      'user-agent': 'SovereignSecondaryPublicVerifier/2.0'
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000)
  });
  return { response, text: await response.text() };
}

function assertSecurityHeaders(label, response) {
  assert(String(response.headers.get('strict-transport-security') || '').includes('max-age=31536000'), `${label} is missing HSTS`);
  assert(String(response.headers.get('x-content-type-options') || '').toLowerCase() === 'nosniff', `${label} is missing nosniff`);
  assert(String(response.headers.get('x-frame-options') || '').toLowerCase() === 'deny', `${label} is missing frame denial`);
}

function assertStaticDocument(path, document) {
  assert(document.response.ok, `${path} returned ${document.response.status}`);
  for (const marker of [
    `data-secondary-visual-contract="${expectedContract}"`,
    'data-route-cohesion="v1"',
    `href="${expectedCssPath}"`,
    `href="${routeCssPath}"`,
    `href="${refinementCssPath}"`,
    `href="${terminalCssPath}"`,
    'class="launch-nav-inner"',
    'class="launch-wordmark"',
    '>SOVEREIGN.OS</a>',
    'class="launch-cta" href="/signup">Get started',
    'class="launch-mobile-menu"',
    'class="launch-mobile-menu-panel"',
    'class="launch-footer-inner"',
    '© 2026 Sovereign.OS'
  ]) assert(document.text.includes(marker), `${path} is missing ${marker}`);
  assertSecurityHeaders(path, document.response);
}

const staticDocuments = await Promise.all(staticRoutes.map((path) => read(path)));
staticDocuments.forEach((document, index) => assertStaticDocument(staticRoutes[index], document));

const howItWorks = staticDocuments[0].text;
for (const marker of [
  'Start with yourself. Add another person or the wider situation only when it helps.',
  'YOU → PEOPLE → SYSTEMS',
  'Understand yourself first. Expand outward when the question does.',
  'Explore yourself.',
  'See what may be more relevant now.',
  'Understand what happens between two people.',
  'See the wider system.',
  'Get the answer first.',
  'Ask about what you actually want to understand.',
  'A private reference built around you.',
  'Source details',
  'class="product-proof-window"',
  'SELF EXPLORATION',
  'How do I know whether I’m refining an idea because it is getting clearer—or changing it because I’m anticipating everyone else’s reaction?',
  '<summary>See source details</summary>',
  'Start with the question',
  'Use what matters from your Baseline',
  'Find the useful difference',
  'Leave what is not known unanswered',
  'Give you something you can try',
  'THE CONVERSATION STAYS PRIMARY',
  'Get the answer. Go deeper when you want.',
  'What still needs clarity',
  'Where Baseline Design comes from',
  'class="launch-section support-note-section"'
]) assert(howItWorks.includes(marker), `/how-it-works is missing ${marker}`);
for (const retired of [
  'Ordinary questions. More context when it belongs.',
  'EXAMPLE BASIS',
  'HD G13.1 · GK ACT13 · ☉ CAN 04.2°',
  'One private foundation',
  'consented people',
  'permitted perspectives',
  'confirmed responsibilities',
  'ONE ANSWER · FOUR DISTINCTIONS',
  'Where responsibility shifts',
  'Help fund continued public development.',
  'OPTIONAL WORLD PREVIEW',
  'World as experience',
  '/worlds-how-it-works.svg'
]) assert(!howItWorks.includes(retired), `/how-it-works still contains retired or internal language: ${retired}`);
assert(!howItWorks.toLowerCase().includes('capacity beneath'), '/how-it-works returned to capacity-first public language');

const pricing = staticDocuments[1].text;
for (const marker of [
  'Free: your personal Baseline Design. Sovereign+: your people, your systems, your Library.',
  'aria-label="Sovereign.OS plans"',
  'class="annual-price"',
  '$0',
  '$20',
  '$99 / year',
  '10 Sovereign AI turns each month',
  '300 Sovereign AI turns each month',
  'Your personal Baseline Design.',
  'Understand another person with their permission',
  'Private invitations and sharing controls',
  'Your Baseline Design stays yours. Plus expands what you can explore.',
  'one-time amount from $1'
]) assert(pricing.includes(marker), `/pricing is missing ${marker}`);
for (const retired of ['permission-based relationship and system context', 'Permission-aware invitations and controls']) {
  assert(!pricing.includes(retired), `/pricing still contains implementation-first language: ${retired}`);
}

const faq = staticDocuments[2].text;
for (const marker of [
  'What can Sovereign help you understand?',
  'What can I use Sovereign to explore about myself?',
  'Baseline Design is a private, explorable reference built around you.',
  'PEOPLE + PERMISSION',
  'FRAMEWORKS + LIMITS',
  'PRIVACY + ACCOUNT',
  'PLANS + SUPPORT',
  'SAFETY',
  'Where does Baseline Design come from?',
  'Which frameworks are included?',
  'Can I see what information Sovereign used for an answer?',
  'Do those source details prove the interpretation is true?',
  'Tarot is not part of Sovereign.OS.',
  'Does Sovereign reduce me to a type?',
  'Can I support Sovereign.OS without subscribing?'
]) assert(faq.includes(marker), `/faq is missing ${marker}`);
for (const retired of ['What is Basis?', 'What does Basis prove?', 'server-approved Basis values', 'consented people', 'permitted perspectives', 'confirmed responsibilities']) {
  assert(!faq.includes(retired), `/faq still contains retired or internal language: ${retired}`);
}
assert(!faq.toLowerCase().includes('capacity beneath'), '/faq returned to capacity-first public language');
assert(!faq.includes('private personal foundation'), '/faq returned to the retired Baseline foundation metaphor');

const [staticCss, routeCss, refinementCss, terminalCss] = await Promise.all([
  read(expectedCssPath),
  read(routeCssPath),
  read(refinementCssPath),
  read(terminalCssPath)
]);
assert(staticCss.response.ok, `secondary stylesheet returned ${staticCss.response.status}`);
assert(routeCss.response.ok, `route cohesion stylesheet returned ${routeCss.response.status}`);
assert(refinementCss.response.ok, `static refinement stylesheet returned ${refinementCss.response.status}`);
assert(terminalCss.response.ok, `terminal static stylesheet returned ${terminalCss.response.status}`);
for (const marker of [
  '--v0-page: #090b0e',
  '--v0-cream: #f1e9de',
  '--v0-shell: min(1120px',
  'body.launch-page',
  '.launch-nav-inner',
  '.launch-mobile-menu-panel',
  '.journey-steps',
  '.pricing-grid',
  '.product-proof-window',
  '.support-note-section',
  '.faq-list details',
  '.launch-footer',
  '@media (max-width: 430px)',
  'min-height: 44px'
]) assert(staticCss.text.includes(marker), `secondary stylesheet is missing ${marker}`);
for (const marker of [
  '--v0-blue: #e8ddd0',
  '--v0-blue-bright: #fffaf3',
  '--static-shell: min(1180px, calc(100vw - 96px))',
  'body.launch-page .launch-hero.launch-hero-compact',
  'body.how-page .journey-steps > article',
  'body.pricing-page .pricing-grid',
  'body.questions-page .faq-category',
  '@media (max-width: 650px)',
  '@media (max-width: 360px)',
  '@media (prefers-reduced-motion: reduce)'
]) assert(refinementCss.text.includes(marker), `static refinement stylesheet is missing ${marker}`);
for (const marker of [
  '--static-title-font:',
  'font-family: "Geist Sans";',
  '/fonts/geist/Geist-Variable.woff2?v=1.7.2',
  'font-family: var(--static-title-font) !important',
  'border-radius: 0 !important;'
]) assert(terminalCss.text.includes(marker), `terminal static stylesheet is missing ${marker}`);
assert(!terminalCss.text.includes('Sovereign Display'), 'terminal static typography references the retired display face');
for (const marker of [
  'body.how-page .journey-steps',
  'grid-template-columns: repeat(2, minmax(0, 1fr))',
  'body.pricing-page .price-card',
  'body.pricing-page .plan-comparison-list > div',
  'body.questions-page .faq-section',
  'body.questions-page .faq-list summary',
  '@media (max-width: 650px)'
]) assert(routeCss.text.includes(marker), `route cohesion stylesheet is missing ${marker}`);

const [home, ...policyDocuments] = await Promise.all([read('/'), ...policyRoutes.map((path) => read(path))]);
assert(home.response.ok, `home returned ${home.response.status}`);
policyDocuments.forEach((document, index) => {
  assert(document.response.ok, `${policyRoutes[index]} returned ${document.response.status}`);
  assertSecurityHeaders(policyRoutes[index], document.response);
});

const jsPath = home.text.match(/src=["'](\/assets\/[^"']+\.js)["']/)?.[1];
const cssPath = home.text.match(/href=["'](\/assets\/[^"']+\.css)["']/)?.[1];
assert(jsPath, 'compiled JavaScript asset is missing');
assert(cssPath, 'compiled CSS asset is missing');

const [javascript, stylesheet] = await Promise.all([read(jsPath), read(cssPath)]);
assert(javascript.response.ok, `compiled JavaScript returned ${javascript.response.status}`);
assert(stylesheet.response.ok, `compiled CSS returned ${stylesheet.response.status}`);
for (const marker of [
  expectedContract,
  'public-approved-v8 public-secondary-page',
  'How Sovereign.OS handles your information.',
  'Terms for using Sovereign.OS.',
  'Email Sovereign.OS'
]) assert(javascript.text.includes(marker), `compiled policy application is missing ${marker}`);
const compactCss = stylesheet.text.replace(/\s+/g, '');
for (const marker of [
  '.public-secondary-page',
  '.public-secondary-page.policy-hero',
  '.public-secondary-page.policy-gridarticle',
  '.public-secondary-page.policy-contact',
  '--route-blue:#2f93ff',
  '.account-shell',
  '.plan-onboarding',
  '.sovereign-app-runtime',
  'var(--route-blue-bright)'
]) assert(compactCss.includes(marker), `compiled route stylesheet is missing ${marker}`);
const compactJavaScript = javascript.text.replace(/\s+/g, '');
for (const marker of [
  '--refine-paper:#e8ddd0',
  '--refine-page:#080a0d',
  '--route-blue:#e8ddd0!important',
  '--landing-blue:#e8ddd0!important'
]) assert(compactCss.includes(marker), `compiled stylesheet is missing ${marker}`);
assert(compactCss.includes('--font-title:'), 'compiled stylesheet is missing the typography authority');

console.log(`Secondary public release verified routes=${[...staticRoutes, ...policyRoutes].join(',')} contract=${expectedContract} positioning=self-people-systems typography=geist-sans`);
