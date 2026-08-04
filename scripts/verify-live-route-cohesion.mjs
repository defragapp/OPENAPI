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
const auditAttribute = 'data-sovereign-route-cohesion-audit';
const auditMarkerSelector = `html[${auditAttribute}]`;
const auditDeadlineMs = 30_000;
const auditPollIntervalMs = 50;
const browserEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/snapshot?timeout=120000&waitForTimeout=1800&cacheTTL=0`;

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
  const serializationFallback = Buffer.from(JSON.stringify({
    pathname: '',
    auditError: 'audit payload serialization failed'
  }), 'utf8').toString('base64');

  return `(() => {
    const attribute = ${JSON.stringify(auditAttribute)};
    const rootSelector = ${JSON.stringify(route.root)};
    const headingSelector = ${JSON.stringify(route.heading)};
    const navSelector = ${JSON.stringify(route.nav)};
    const contentSelector = ${JSON.stringify(route.content)};
    const deadline = Date.now() + ${auditDeadlineMs};
    const pollInterval = ${auditPollIntervalMs};
    const serializationFallback = ${JSON.stringify(serializationFallback)};
    let started = false;

    const errorMessage = (error) => {
      if (error && typeof error === 'object' && 'name' in error && 'message' in error) {
        return String(error.name) + ': ' + String(error.message);
      }
      return String(error || 'unknown browser audit error');
    };

    const encode = (payload) => {
      const bytes = new TextEncoder().encode(JSON.stringify(payload));
      let binary = '';
      for (const byte of bytes) binary += String.fromCharCode(byte);
      return btoa(binary);
    };

    const publish = (payload) => {
      const documentRoot = document.documentElement;
      if (!documentRoot) return false;
      try {
        documentRoot.setAttribute(attribute, encode(payload));
      } catch {
        try {
          documentRoot.setAttribute(attribute, serializationFallback);
        } catch {
          return false;
        }
      }
      return documentRoot.hasAttribute(attribute);
    };

    const inspect = () => {
      try {
        const documentRoot = document.documentElement;
        const body = document.body;
        const root = document.querySelector(rootSelector);

        if (!documentRoot || !body || !root) {
          if (Date.now() < deadline) {
            setTimeout(inspect, pollInterval);
            return;
          }
          publish({
            pathname: location.pathname,
            rootPresent: Boolean(root),
            auditError: 'route root did not become available before the browser audit deadline'
          });
          return;
        }

        const heading = document.querySelector(headingSelector);
        const nav = document.querySelector(navSelector);
        const content = document.querySelector(contentSelector);
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
          routeCohesion: body.dataset?.routeCohesion || '',
          stylesheetPresent: [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => String(link.getAttribute('href') || '').includes('/deployed-route-cohesion.css')),
          compiledAuthorityPresent: [...document.styleSheets].some((sheet) => {
            try {
              return [...(sheet.cssRules || [])].some((rule) => String(rule.cssText || '').includes('--route-blue'));
            } catch {
              return false;
            }
          }),
          document: {
            width: Math.max(documentRoot.scrollWidth, body.scrollWidth || 0),
            height: Math.max(documentRoot.scrollHeight, body.scrollHeight || 0),
            overflowX: Math.max(0, Math.max(documentRoot.scrollWidth, body.scrollWidth || 0) - innerWidth)
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
            bodyBackground: getComputedStyle(body).backgroundColor
          },
          textLength: (body.innerText || '').replace(/\\s+/g, ' ').trim().length,
          auditError: ''
        };
        publish(payload);
      } catch (error) {
        publish({
          pathname: location.pathname,
          auditError: errorMessage(error)
        });
      }
    };

    const start = () => {
      if (started) return;
      started = true;
      try {
        inspect();
      } catch (error) {
        publish({
          pathname: location.pathname,
          auditError: errorMessage(error)
        });
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
      setTimeout(start, 0);
    } else {
      start();
    }
  })();`;
}

function auditAttributeMatch(html) {
  return String(html || '').match(new RegExp(`\\b${auditAttribute}=["']([^"']+)["']`, 'i'));
}

function decodeAuditPayload(html, label) {
  const attributeMatch = auditAttributeMatch(html);
  assert(attributeMatch, `${label}: rendered audit payload is missing`);
  try {
    return JSON.parse(Buffer.from(attributeMatch[1], 'base64').toString('utf8'));
  } catch {
    throw new Error(`Route cohesion verification failed: ${label}: rendered audit payload is invalid`);
  }
}

function productionSnapshotBody(route, profileName) {
  return {
    url: `${route.url}${route.url.includes('?') ? '&' : '?'}release=${encodeURIComponent(commitSha)}&routeAudit=${profileName}`,
    formats: ['content', 'screenshot'],
    viewport: viewports[profileName],
    gotoOptions: { waitUntil: 'networkidle0', timeout: 45_000 },
    waitForSelector: { selector: auditMarkerSelector, timeout: 45_000 },
    waitForTimeout: 100,
    actionTimeout: 120_000,
    screenshotOptions: { fullPage: false, type: 'png', captureBeyondViewport: false },
    addStyleTag: [{
      content: 'html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}'
    }],
    addScriptTag: [{ content: auditScript(route) }]
  };
}

function preflightSnapshotBody() {
  const route = {
    name: 'transport-preflight',
    root: '#route-cohesion-preflight',
    heading: '#route-cohesion-preflight h1',
    nav: 'nav',
    content: '#route-cohesion-preflight',
    family: 'static-public'
  };
  return {
    route,
    request: {
      html: '<!doctype html><html><head><style>body{font:16px/1.5 sans-serif}h1{font:48px/1.1 serif}</style></head><body data-route-cohesion="v1"><nav>Preflight navigation</nav><main id="route-cohesion-preflight"><h1>Browser audit preflight</h1><p>Rendered content used to prove injected script execution.</p></main></body></html>',
      formats: ['content', 'screenshot'],
      viewport: viewports.desktop,
      gotoOptions: { waitUntil: 'domcontentloaded', timeout: 45_000 },
      waitForSelector: { selector: auditMarkerSelector, timeout: 45_000 },
      waitForTimeout: 50,
      actionTimeout: 120_000,
      screenshotOptions: { fullPage: false, type: 'png', captureBeyondViewport: false },
      addScriptTag: [{ content: auditScript(route) }]
    }
  };
}

function verifyAuditTransportContract() {
  const preflight = preflightSnapshotBody();
  assert(preflight.request.waitForSelector.selector === auditMarkerSelector, 'Browser Run preflight does not wait for the shared audit marker');
  assert(preflight.request.addScriptTag[0]?.content === auditScript(preflight.route), 'Browser Run preflight does not use the shared audit script');

  for (const route of routes) {
    const pathname = new URL(route.url).pathname;
    const sample = { pathname, routeCohesion: route.family === 'static-public' ? 'v1' : '', auditError: '' };
    const encoded = Buffer.from(JSON.stringify(sample), 'utf8').toString('base64');
    const html = `<!doctype html><html ${auditAttribute}="${encoded}"><head></head><body></body></html>`;
    const decoded = decodeAuditPayload(html, `${route.name}/desktop`);
    const script = auditScript(route);
    const request = productionSnapshotBody(route, 'desktop');

    assert(decoded.pathname === pathname, `${route.name}/desktop: audit transport changed the route pathname`);
    assert(script.includes(`const deadline = Date.now() + ${auditDeadlineMs};`), `${route.name}/desktop: audit script lacks a bounded readiness deadline`);
    assert(script.includes(`setTimeout(inspect, pollInterval);`), `${route.name}/desktop: audit script lacks bounded root polling`);
    assert(script.includes("document.addEventListener('DOMContentLoaded', start"), `${route.name}/desktop: audit script lacks document readiness handling`);
    assert(script.includes('catch (error)'), `${route.name}/desktop: audit script lacks top-level exception handling`);
    assert(script.includes('auditError'), `${route.name}/desktop: audit script cannot publish explicit runtime errors`);
    assert(script.includes('documentRoot.setAttribute(attribute'), `${route.name}/desktop: audit writer does not use the shared rendered-root attribute`);
    assert(request.waitForSelector.selector === auditMarkerSelector, `${route.name}/desktop: Browser Run does not wait for audit completion`);
  }

  const howItWorksScript = auditScript(routes[0]);
  assert(!howItWorksScript.includes('how-it-works'), '/how-it-works has a route-specific audit exception');
  console.log(`Pure route cohesion audit contract verified routes=${routes.map((route) => route.name).join(',')} marker=${auditMarkerSelector}; live Browser Run not exercised`);
}

async function waitForBrowserSlot() {
  const interval = 10_500;
  const elapsed = Date.now() - lastBrowserRunAt;
  if (lastBrowserRunAt && elapsed < interval) await delay(interval - elapsed);
  lastBrowserRunAt = Date.now();
}

async function browserSnapshot(request, label) {
  await waitForBrowserSlot();
  const response = await fetch(browserEndpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(135_000)
  });

  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = undefined; }
  if (!response.ok || payload?.success === false) {
    throw new Error(`Route cohesion browser audit failed for ${label} (${response.status}): ${redact(JSON.stringify(payload?.errors || payload || text)).slice(0, 800)}`);
  }

  const result = payload?.result || payload || {};
  const html = String(result?.content || '');
  const screenshot = Buffer.from(String(result?.screenshot || ''), 'base64');
  return { responseStatus: response.status, result, html, screenshot };
}

function routeRootHint(route) {
  const classMatch = String(route.root).match(/\.([A-Za-z0-9_-]+)/);
  if (classMatch) return classMatch[1];
  const idMatch = String(route.root).match(/#([A-Za-z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return String(route.root).replace(/[^A-Za-z0-9_-]/g, '');
}

function missingAuditPayloadError(route, profileName, snapshot) {
  const label = `${route.name}/${profileName}`;
  const rootHint = routeRootHint(route);
  const prefix = redact(snapshot.html.slice(0, 500).replace(/\s+/g, ' ').trim());
  const resultKeys = Object.keys(snapshot.result || {}).sort();
  return new Error(
    `Route cohesion verification failed: ${label}: rendered audit payload is missing; `
    + `browserStatus=${snapshot.responseStatus}; resultKeys=${JSON.stringify(resultKeys)}; `
    + `htmlLength=${snapshot.html.length}; htmlPrefix=${JSON.stringify(prefix)}; `
    + `routeRootHint=${JSON.stringify(rootHint)}; routeRootAppears=${Boolean(rootHint && snapshot.html.includes(rootHint))}; `
    + `auditAttributeAppears=${snapshot.html.includes(auditAttribute)}; `
    + `screenshotPresent=${snapshot.screenshot.length > 0}; screenshotBytes=${snapshot.screenshot.length}`
  );
}

async function verifyBrowserTransportPreflight() {
  const { route, request } = preflightSnapshotBody();
  const snapshot = await browserSnapshot(request, 'transport-preflight/desktop');
  if (!auditAttributeMatch(snapshot.html)) throw missingAuditPayloadError(route, 'desktop', snapshot);
  const audit = decodeAuditPayload(snapshot.html, 'transport-preflight/desktop');
  assert(!audit.auditError, `transport-preflight/desktop: browser audit failed: ${audit.auditError}`);
  assert(audit.rootPresent, 'transport-preflight/desktop: synthetic route root is missing');
  assert(audit.headingPresent, 'transport-preflight/desktop: synthetic heading is missing');
  assert(audit.contentPresent, 'transport-preflight/desktop: synthetic content is missing');
  console.log('Cloudflare Browser Run audit transport preflight passed');
}

async function capture(route, profileName) {
  const request = productionSnapshotBody(route, profileName);
  const snapshot = await browserSnapshot(request, `${route.name}/${profileName}`);
  if (!auditAttributeMatch(snapshot.html)) throw missingAuditPayloadError(route, profileName, snapshot);
  const audit = decodeAuditPayload(snapshot.html, `${route.name}/${profileName}`);
  assert(!audit.auditError, `${route.name}/${profileName}: browser audit failed: ${audit.auditError}`);
  return {
    route: route.name,
    family: route.family,
    profile: profileName,
    url: request.url,
    screenshotSha256: snapshot.screenshot.length ? createHash('sha256').update(snapshot.screenshot).digest('hex') : '',
    audit
  };
}

function verify(result) {
  const { route, profile, family, audit } = result;
  const label = `${route}/${profile}`;
  const mobile = profile === 'mobile';
  assert(!audit.auditError, `${label}: browser audit failed: ${audit.auditError}`);
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

if (process.argv.includes('--self-test')) {
  verifyAuditTransportContract();
} else {
  assert(apiToken, 'Cloudflare Browser Rendering token is unavailable');
  assert(/^[0-9a-f]{40}$/i.test(commitSha), 'A full release commit SHA is required');

  await verifyBrowserTransportPreflight();

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
    browserTransportPreflight: true,
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
}
