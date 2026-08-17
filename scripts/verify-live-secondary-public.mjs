const publicBase = String(process.env.PUBLIC_BASE_URL || 'https://sovereign.defrag.app').replace(/\/$/, '');
const expectedCssPath = '/v0-public-static.css?v=20260803-refined-v2';
const routeCssPath = '/deployed-route-cohesion.css?v=20260803-route-v1';
const refinementCssPath = '/experience-static-refinement-v1.css?v=20260816-refinement-v1';
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
  ]) {
    assert(document.text.includes(marker), `${path} is missing ${marker}`);
  }
  assertSecurityHeaders(path, document.response);
}

const staticDocuments = await Promise.all(staticRoutes.map((path) => read(path)));
staticDocuments.forEach((document, index) => assertStaticDocument(staticRoutes[index], document));

const howItWorks = staticDocuments[0].text;
assert(howItWorks.includes('class="product-proof-window"'), '/how-it-works is missing the restrained product proof');
assert(howItWorks.includes('This is user-visible context—not hidden model reasoning.'), '/how-it-works does not distinguish visible context from hidden model reasoning');
assert(howItWorks.includes('without exposing chain-of-thought'), '/how-it-works does not keep hidden reasoning out of the product proof');
assert(howItWorks.includes('class="launch-section worlds-proof-section"'), '/how-it-works is missing the Worlds product proof');
assert(howItWorks.includes('See the pattern. Then step into it.'), '/how-it-works is missing the Worlds positioning');
assert(howItWorks.includes('src="/worlds-how-it-works.svg"'), '/how-it-works is missing the Worlds illustration');
assert(howItWorks.includes('qualitative expression emphasis'), '/how-it-works is missing the Expression Field measurement boundary');
assert(howItWorks.includes('A peek into the structure—not a literal place, prediction, or spiritual portal.'), '/how-it-works does not keep the World illustration boundary explicit');
assert(howItWorks.includes('class="launch-section support-note-section"'), '/how-it-works is missing the reduced-prominence support note');
assert(!howItWorks.includes('Help fund continued public development.'), '/how-it-works still gives development support primary-page prominence');

const pricing = staticDocuments[1].text;
assert(pricing.includes('aria-label="Sovereign.OS plans"'), '/pricing is missing the plan decision label');
assert(pricing.includes('class="annual-price"'), '/pricing is missing the clarified annual option');
assert(pricing.includes('$99 / year'), '/pricing is missing the annual price hierarchy');

const [staticCss, routeCss, refinementCss, worldsIllustration] = await Promise.all([
  read(expectedCssPath),
  read(routeCssPath),
  read(refinementCssPath),
  read('/worlds-how-it-works.svg')
]);
assert(staticCss.response.ok, `secondary stylesheet returned ${staticCss.response.status}`);
assert(routeCss.response.ok, `route cohesion stylesheet returned ${routeCss.response.status}`);
assert(refinementCss.response.ok, `static refinement stylesheet returned ${refinementCss.response.status}`);
assert(worldsIllustration.response.ok, `Worlds illustration returned ${worldsIllustration.response.status}`);
assert(worldsIllustration.text.includes('Sovereign Worlds illustrative scene'), 'Worlds illustration is missing its accessible title');
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
]) {
  assert(staticCss.text.includes(marker), `secondary stylesheet is missing ${marker}`);
}
assert(!staticCss.text.includes('--v0-warm'), 'secondary stylesheet still contains the retired warm token');
assert(!staticCss.text.includes('--v0-sage'), 'secondary stylesheet still contains the retired sage token');
for (const marker of [
  '--v0-blue: #e8ddd0',
  '--v0-blue-bright: #fffaf3',
  'background: #090b0e',
  'body.how-page .worlds-aperture img',
  'filter: saturate(0.18)',
  '@media (prefers-reduced-motion: reduce)'
]) {
  assert(refinementCss.text.includes(marker), `static refinement stylesheet is missing ${marker}`);
}
for (const marker of [
  'body.how-page .journey-steps',
  'grid-template-columns: repeat(2, minmax(0, 1fr))',
  'body.how-page .worlds-proof-window',
  'body.how-page .worlds-aperture',
  'body.how-page .worlds-field-instrument',
  'body.how-page .worlds-proof-flow',
  'body.pricing-page .price-card',
  'body.pricing-page .plan-comparison-list > div',
  'body.questions-page .faq-section',
  'body.questions-page .faq-list summary',
  '@media (max-width: 650px)'
]) {
  assert(routeCss.text.includes(marker), `route cohesion stylesheet is missing ${marker}`);
}

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
]) {
  assert(javascript.text.includes(marker), `compiled policy application is missing ${marker}`);
}
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
]) {
  assert(compactCss.includes(marker), `compiled route stylesheet is missing ${marker}`);
}
const compactJavaScript = javascript.text.replace(/\s+/g, '');
for (const marker of [
  '--refine-paper:#e8ddd0',
  '--refine-page:#080a0d',
  '--route-blue:#e8ddd0!important',
  '--landing-blue:#e8ddd0!important'
]) {
  assert(compactJavaScript.includes(marker), `compiled injected refinement is missing ${marker}`);
}
assert(compactJavaScript.includes('-webkit-text-stroke:'), 'compiled injected refinement is missing the founder outline treatment');
assert(
  compactJavaScript.includes('.sovereign-app-runtime.sovereign-composer') || compactJavaScript.includes('.sovereign-app-runtime .sovereign-composer'),
  'compiled injected refinement is missing the workspace composer authority'
);

console.log(`Secondary public visual release verified routes=${[...staticRoutes, ...policyRoutes].join(',')} contract=${expectedContract} cohesion=v1 refinement=v1 worlds=illustrative`);
