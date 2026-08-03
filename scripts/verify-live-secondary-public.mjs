const publicBase = String(process.env.PUBLIC_BASE_URL || 'https://sovereign.defrag.app').replace(/\/$/, '');
const expectedCssPath = '/v0-public-static.css?v=20260803-locked-v1';
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
    `href="${expectedCssPath}"`,
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

const staticCss = await read(expectedCssPath);
assert(staticCss.response.ok, `secondary stylesheet returned ${staticCss.response.status}`);
for (const marker of [
  '--v0-page: #090b0e',
  '--v0-cream: #f1e9de',
  '--v0-blue: #2f93ff',
  '--v0-blue-bright: #78c7ff',
  '/fonts/sovereign-display.woff2',
  '/fonts/sovereign-sans.woff2',
  'body.launch-page',
  '.launch-nav-inner',
  '.launch-mobile-menu-panel',
  '.journey-steps',
  '.pricing-grid',
  '.faq-list details',
  '.launch-footer'
]) {
  assert(staticCss.text.includes(marker), `secondary stylesheet is missing ${marker}`);
}
assert(!staticCss.text.includes('--v0-warm'), 'secondary stylesheet still contains the retired warm token');
assert(!staticCss.text.includes('--v0-sage'), 'secondary stylesheet still contains the retired sage token');

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
  'var(--v8-blue-bright)'
]) {
  assert(compactCss.includes(marker), `compiled policy stylesheet is missing ${marker}`);
}
const lockedBlueAtmosphereEncodings = [
  'rgba(47,147,255,.075)',
  'rgba(47,147,255,0.075)',
  'rgb(47 147 255/.075)',
  'rgb(47 147 255/7.5%)',
  '#2f93ff13'
];
assert(
  lockedBlueAtmosphereEncodings.some((marker) => compactCss.includes(marker)),
  'compiled policy stylesheet is missing the locked blue atmosphere'
);

console.log(`Secondary public visual release verified routes=${[...staticRoutes, ...policyRoutes].join(',')} contract=${expectedContract}`);
