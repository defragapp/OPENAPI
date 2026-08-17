const publicBase = String(process.env.PUBLIC_BASE_URL || 'https://sovereign.defrag.app').replace(/\/$/, '');
const expectedCssPath = '/v0-public-static.css?v=20260803-refined-v2';
const routeCssPath = '/deployed-route-cohesion.css?v=20260803-route-v1';
const refinementCssPath = '/experience-static-refinement-v1.css?v=20260817-cohesion-v2';
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
      'user-agent': 'SovereignSecondaryPublicVerifier/1.0'
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
  'Your Baseline first. The situation second.',
  'ONE ANSWER · FOUR DISTINCTIONS',
  'Start with your Baseline.',
  'Add only what is relevant now.',
  'Keep people and roles distinct.',
  'Give the useful distinction first.',
  'class="product-proof-window"',
  'This is user-visible context—not hidden model reasoning.',
  'What your Baseline supports',
  'What pressure may be adding',
  'Where responsibility shifts',
  'What could change',
  'class="launch-section text-thread-proof-section"',
  'THE CONVERSATION STAYS PRIMARY',
  'Understand it. Then keep going.',
  'Direct answer',
  'Relevant structure',
  'Still unknown',
  'Continue',
  'class="launch-section support-note-section"'
]) assert(howItWorks.includes(marker), `/how-it-works is missing ${marker}`);
assert(!howItWorks.toLowerCase().includes('capacity beneath'), '/how-it-works returned to capacity-first public language');
assert(!howItWorks.includes('OPTIONAL WORLD PREVIEW'), '/how-it-works still advertises the retired World preview');
assert(!howItWorks.includes('World as experience'), '/how-it-works still presents Worlds as an active launch experience');
assert(!howItWorks.includes('/worlds-how-it-works.svg'), '/how-it-works still loads the retired Worlds launch illustration');
assert(!howItWorks.includes('Help fund continued public development.'), '/how-it-works still gives development support primary-page prominence');

const pricing = staticDocuments[1].text;
for (const marker of [
  'Start with your Baseline. Add more only when you need it.',
  'aria-label="Sovereign.OS plans"',
  'class="annual-price"',
  '$0',
  '$20',
  '$99 / year',
  '10 Sovereign AI turns each month',
  '300 Sovereign AI turns each month',
  'Free is complete for you. Plus expands the context.'
]) assert(pricing.includes(marker), `/pricing is missing ${marker}`);

const faq = staticDocuments[2].text;
for (const marker of [
  'What you should know before you begin.',
  'PEOPLE + PERMISSION',
  'FRAMEWORKS + LIMITS',
  'PRIVACY + ACCOUNT',
  'PLANS + SUPPORT',
  'SAFETY',
  'Tarot is not part of Sovereign.OS.',
  'Can I support Sovereign.OS without subscribing?'
]) assert(faq.includes(marker), `/faq is missing ${marker}`);
assert(!faq.toLowerCase().includes('capacity beneath'), '/faq returned to capacity-first public language');

const [staticCss, routeCss, refinementCss] = await Promise.all([
  read(expectedCssPath),
  read(routeCssPath),
  read(refinementCssPath)
]);
assert(staticCss.response.ok, `secondary stylesheet returned ${staticCss.response.status}`);
assert(routeCss.response.ok, `route cohesion stylesheet returned ${routeCss.response.status}`);
assert(refinementCss.response.ok, `static refinement stylesheet returned ${refinementCss.response.status}`);
for (const marker of [
  '--v0-page: #090b0e',
  '--v0-cream: #f1e9de',
  '--v0-blue: #2f93ff',
  '--v0-blue-bright: #78c7ff',
  '--v0-shell: min(1120px',
  '/fonts/sovereign-display.woff2',
  '/fonts/sovereign-sans.woff2',
  'body.launch-page',
  '.launch-nav-inner',
  '.launch-mobile-menu-panel',
  '.journey-steps',
  '.pricing-grid',
  '.price-options .annual-price > small',
  '.product-proof-window',
  '.support-note-section',
  '.faq-list details',
  '.launch-footer',
  '@media (max-width: 430px)',
  'min-height: 44px'
]) assert(staticCss.text.includes(marker), `secondary stylesheet is missing ${marker}`);
assert(!staticCss.text.includes('--v0-warm'), 'secondary stylesheet still contains the retired warm token');
assert(!staticCss.text.includes('--v0-sage'), 'secondary stylesheet still contains the retired sage token');
for (const marker of [
  '--v0-blue: #e8ddd0',
  '--v0-blue-bright: #fffaf3',
  '--static-shell: min(1180px, calc(100vw - 96px))',
  'body.launch-page .launch-hero.launch-hero-compact',
  'body.how-page .journey-steps > article',
  'body.pricing-page .pricing-grid',
  'body.questions-page .faq-category',
  'body.not-found-page .not-found-stage',
  'body.consent-page .consent-hero',
  '@media (max-width: 650px)',
  '@media (max-width: 360px)',
  '@media (prefers-reduced-motion: reduce)'
]) assert(refinementCss.text.includes(marker), `static refinement stylesheet is missing ${marker}`);
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
]) assert(compactJavaScript.includes(marker), `compiled injected refinement is missing ${marker}`);
for (const marker of [
  '--v8-blue:#d8d0c5!important',
  'background:#111316!important',
  'padding:54px0!important'
]) assert(compactJavaScript.includes(marker), `compiled rendered fidelity is missing ${marker}`);
assert(/saturate\((?:0?\.)08\)/.test(compactJavaScript), 'compiled rendered fidelity is missing saturation 0.08');
assert(compactJavaScript.includes('-webkit-text-stroke:'), 'compiled injected refinement is missing the founder outline treatment');
assert(
  compactJavaScript.includes('.sovereign-app-runtime.sovereign-composer') || compactJavaScript.includes('.sovereign-app-runtime .sovereign-composer'),
  'compiled injected refinement is missing the workspace composer authority'
);

console.log(`Secondary public visual release verified routes=${[...staticRoutes, ...policyRoutes].join(',')} contract=${expectedContract} cohesion=v2 refinement=editorial-static-v2 fidelity=v1 thread=text-first`);
