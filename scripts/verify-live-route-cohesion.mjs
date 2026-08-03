import { createHash } from 'node:crypto';

const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || '8b1954d216d65077c6480d62583fe2c2').trim();
const apiToken = String(
  process.env.CLOUDFLARE_BROWSER_API_TOKEN
  || process.env.CLOUDFLARE_API_TOKEN
  || process.env.CF_API_TOKEN
  || ''
).trim();
const commitSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || process.env.APP_VERSION || '').trim();
const publicBase = String(process.env.PUBLIC_SITE_URL || 'https://sovereign.defrag.app').replace(/\/$/, '');
const appBase = String(process.env.PUBLIC_APP_URL || 'https://app.defrag.app').replace(/\/$/, '');
const routeStylesheet = '/deployed-route-cohesion.css?v=20260803-route-v1';

const routes = [
  { name: 'how-it-works', url: `${publicBase}/how-it-works`, root: 'body.launch-page', heading: '.launch-hero h1', nav: '.launch-nav', content: 'main', family: 'static-public', mobile: true },
  { name: 'pricing', url: `${publicBase}/pricing`, root: 'body.launch-page', heading: '.launch-hero h1', nav: '.launch-nav', content: 'main', family: 'static-public', mobile: true },
  { name: 'faq', url: `${publicBase}/faq`, root: 'body.launch-page', heading: '.launch-hero h1', nav: '.launch-nav', content: 'main', family: 'static-public', mobile: true },
  { name: 'privacy', url: `${publicBase}/privacy`, root: '.public-secondary-page', heading: '.policy-hero h1', nav: '.v0-nav', content: '.policy-grid', family: 'policy', mobile: true },
  { name: 'terms', url: `${publicBase}/terms`, root: '.public-secondary-page', heading: '.policy-hero h1', nav: '.v0-nav', content: '.policy-grid', family: 'policy', mobile: false },
  { name: 'login', url: `${appBase}/login`, root: '.account-shell', heading: '.account-intro h1', nav: '.account-nav', content: '.account-layout', family: 'auth', mobile: true },
  { name: 'signup', url: `${appBase}/signup`, root: '.account-shell', heading: '.account-intro h1', nav: '.account-nav', content: '.account-layout', family: 'auth', mobile: true },
  { name: 'invitation', url: `${appBase}/invite/route-cohesion-audit`, root: '.invitation-shell', heading: '.auth-panel h2', nav: '.wordmark', content: '.auth-panel', family: 'invitation', mobile: true },
  { name: 'onboarding-gate', url: `${appBase}/onboarding`, root: '.account-shell', heading: '.account-intro h1', nav: '.account-nav', content: '.account-layout', family: 'auth-redirect', mobile: false },
  { name: 'workspace-gate', url: `${appBase}/app`, root: '.account-shell', heading: '.account-intro h1', nav: '.account-nav', content: '.account-layout', family: 'auth-redirect', mobile: false },
  { name: 'not-found', url: `${appBase}/route-cohesion-not-found`, root: '.public-not-found', heading: '.public-not-found h1', nav: '.private-route-brand', content: '.public-not-found > section', family: 'not-found', mobile: true }
];

const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true }
};

const fullNavigationFamilies = new Set(['static-public', 'policy', 'auth', 'auth-redirect']);
let lastBrowserRunAt = 0;

function assert(condition, message) {
  if (!condition) throw new Error(`Route cohesion verification failed: ${message}`);
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function redact(value) {
  return String(value || '')
    .replace(/cfat_[A-Za-z0-9_-]+/g, '[redacted-cloudflare-token]')
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]');
}

function auditScript(route) {
  return `(() => {
    const root = document.querySelector(${JSON.stringify(route.root)});
    const heading = document.querySelector(${JSON.stringify(route.heading)});
    const nav = document.querySelector(${JSON.stringify(route.nav)});
    const content = document.querySelector(${JSON.stringify(route.content)});
    const bodyCopySelector = 'p:not(.eyebrow):not(.launch-kicker):not(.policy-kicker):not([class*="kicker"]), li, dd';
    const firstParagraph = content?.querySelector(bodyCopySelector) || document.querySelector(bodyCopySelector);
    const styleOf = (element) => element ? getComputedStyle(element) : null;
    const rectOf = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top + scrollY),
        left: Math.round(rect.left + scrollX)
      };
    };
    const headingStyle = styleOf(heading);
    const paragraphStyle = styleOf(firstParagraph);
    const rootStyle = styleOf(root);
    const payload = {
      pathname: location.pathname,
      rootPresent: Boolean(root),
      headingPresent: Boolean(heading),
      navPresent: Boolean(nav),
      contentPresent: Boolean(content),
      bodyCopyPresent: Boolean(firstParagraph),
      routeCohesion: document.body?.dataset?.routeCohesion || '',
      stylesheetPresent: [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => String(link.getAttribute('href') || '').includes('/deployed-route-cohesion.css')),
      compiledAuthorityPresent: [...document.styleSheets].some((sheet) => {
        try {
          return [...(sheet.cssRules || [])].some((rule) => String(rule.cssText || '').includes('--route-blue'));
        } catch {
          return false;
        }
      }),
      document: {
        width: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0),
        height: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0),
        overflowX: Math.max(0, Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0) - innerWidth)
      },
      boxes: {
        root: rectOf(root),
        heading: rectOf(heading),
        nav: rectOf(nav),
        content: rectOf(content)
      },
      typography: {
        headingFamily: headingStyle?.fontFamily || '',
        headingSize: parseFloat(headingStyle?.fontSize || '0'),
        headingLineHeight: parseFloat(headingStyle?.lineHeight || '0'),
        paragraphFamily: paragraphStyle?.fontFamily || '',
        paragraphSize: parseFloat(paragraphStyle?.fontSize || '0'),
        paragraphLineHeight: parseFloat(paragraphStyle?.lineHeight || '0')
      },
      color: {
        rootBackground: rootStyle?.backgroundColor || '',
        bodyBackground: getComputedStyle(document.body).backgroundColor
      },
      textLength: (document.body?.innerText || '').replace(/\\s+/g, ' ').trim().length
    };
    const node = document.createElement('script');
    node.id = '__sovereign_route_cohesion_audit';
    node.type = 'application/json';
    node.textContent = JSON.stringify(payload);
    document.head.appendChild(node);
  })();`;
}

async function waitForBrowserSlot() {
  const interval = 10_500;
  const elapsed = Date.now() - lastBrowserRunAt;
  if (lastBrowserRunAt && elapsed < interval) await delay(interval - elapsed);
  lastBrowserRunAt = Date.now();
}

async function capture(route, profileName) {
  await waitForBrowserSlot();
  const viewport = viewports[profileName];
  const url = `${route.url}${route.url.includes('?') ? '&' : '?'}release=${encodeURIComponent(commitSha)}&routeAudit=${profileName}`;
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/snapshot?timeout=120000&waitForTimeout=1800&cacheTTL=0`,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiToken}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        url,
        viewport,
        gotoOptions: { waitUntil: 'networkidle0', timeout: 45_000 },
        waitForSelector: { selector: route.root, timeout: 45_000, visible: true },
        waitForTimeout: 1_800,
        actionTimeout: 120_000,
        screenshotOptions: { fullPage: false, type: 'png', captureBeyondViewport: false },
        addStyleTag: [{
          content: 'html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}'
        }],
        addScriptTag: [{ content: auditScript(route) }]
      }),
      signal: AbortSignal.timeout(135_000)
    }
  );

  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = undefined; }
  if (!response.ok || payload?.success === false) {
    throw new Error(`Route cohesion browser audit failed for ${route.name}/${profileName} (${response.status}): ${redact(JSON.stringify(payload?.errors || payload || text)).slice(0, 800)}`);
  }

  const result = payload?.result || payload;
  const html = String(result?.content || '');
  const match = html.match(/<script[^>]+id=["']__sovereign_route_cohesion_audit["'][^>]*>([\s\S]*?)<\/script>/i);
  assert(match, `${route.name}/${profileName}: rendered audit payload is missing`);
  const audit = JSON.parse(match[1]);
  const screenshot = Buffer.from(String(result?.screenshot || ''), 'base64');
  return {
    route: route.name,
    family: route.family,
    profile: profileName,
    url,
    screenshotSha256: screenshot.length ? createHash('sha256').update(screenshot).digest('hex') : '',
    audit
  };
}

function verify(result) {
  const { route, profile, family, audit } = result;
  const label = `${route}/${profile}`;
  const mobile = profile === 'mobile';
  assert(audit.rootPresent, `${label}: route root is missing`);
  assert(audit.headingPresent, `${label}: primary heading is missing`);
  assert(audit.navPresent, `${label}: navigation or route brand is missing`);
  assert(audit.contentPresent, `${label}: primary content is missing`);
  assert(audit.bodyCopyPresent, `${label}: representative body copy is missing`);
  assert(audit.document.overflowX <= 1, `${label}: horizontal overflow is ${audit.document.overflowX}px`);
  assert(audit.textLength > 80, `${label}: rendered content is unexpectedly empty`);
  assert(String(audit.typography.headingFamily).includes('Sovereign Display'), `${label}: heading is not using Sovereign Display (${audit.typography.headingFamily})`);
  assert(audit.typography.headingSize >= (mobile ? 32 : 42), `${label}: heading is too small (${audit.typography.headingSize}px)`);
  assert(audit.typography.headingSize <= (mobile ? 78 : 112), `${label}: heading is too large (${audit.typography.headingSize}px)`);
  assert(audit.typography.paragraphSize >= 14, `${label}: body copy is too small (${audit.typography.paragraphSize}px)`);
  assert(audit.typography.paragraphSize <= 20, `${label}: body copy is too large (${audit.typography.paragraphSize}px)`);
  assert(audit.typography.paragraphLineHeight >= audit.typography.paragraphSize * 1.42, `${label}: body line height is too tight`);
  assert(audit.boxes.heading?.width <= viewports[profile].width, `${label}: heading exceeds viewport width`);
  assert(audit.boxes.content?.width <= viewports[profile].width + 1, `${label}: primary content exceeds viewport width`);
  if (family === 'static-public') {
    assert(audit.routeCohesion === 'v1', `${label}: static route cohesion marker is missing`);
    assert(audit.stylesheetPresent, `${label}: shared static route stylesheet is missing`);
  } else {
    assert(audit.compiledAuthorityPresent, `${label}: compiled non-landing route authority is missing`);
  }
  if (fullNavigationFamilies.has(family) && audit.boxes.nav?.height) {
    assert(audit.boxes.nav.height >= 44 && audit.boxes.nav.height <= 100, `${label}: navigation height is disorganized (${audit.boxes.nav.height}px)`);
  }
}

assert(apiToken, 'Cloudflare Browser Rendering token is unavailable');
assert(/^[0-9a-f]{40}$/i.test(commitSha), 'A full release commit SHA is required');

const results = [];
for (const route of routes) {
  const desktop = await capture(route, 'desktop');
  verify(desktop);
  results.push(desktop);
  if (route.mobile) {
    const mobile = await capture(route, 'mobile');
    verify(mobile);
    results.push(mobile);
  }
}

console.log(JSON.stringify({
  ok: true,
  release: 'sovereign-deployed-route-cohesion-v1',
  commitSha,
  stylesheet: routeStylesheet,
  pages: routes.map((route) => route.name),
  results: results.map((result) => ({
    route: result.route,
    family: result.family,
    profile: result.profile,
    screenshotSha256: result.screenshotSha256,
    document: result.audit.document,
    boxes: result.audit.boxes,
    typography: result.audit.typography
  }))
}, null, 2));
