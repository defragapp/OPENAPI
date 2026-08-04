import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
const auditScriptPath = '/route-cohesion-audit.js';
const auditAttribute = 'data-sovereign-route-cohesion-audit';
const auditMarkerSelector = `html[${auditAttribute}]`;
const auditDeadlineMs = 30_000;
const auditPollIntervalMs = 50;
const browserEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/snapshot?timeout=120000&waitForTimeout=1800&cacheTTL=0`;
const browserRunIntervalMs = Math.min(
  60_000,
  Math.max(12_000, Math.trunc(Number(process.env.BROWSER_RUN_REQUEST_INTERVAL_MS || 15_000) || 15_000))
);
const browserRunRetryFloorMs = Math.min(
  120_000,
  Math.max(browserRunIntervalMs, Math.trunc(Number(process.env.BROWSER_RUN_RETRY_FLOOR_MS || 15_000) || 15_000))
);
const browserRunRequestMaxAttempts = Math.min(
  5,
  Math.max(2, Math.trunc(Number(process.env.BROWSER_RUN_REQUEST_MAX_ATTEMPTS || 4) || 4))
);

const routes = [
  { name: 'how-it-works', url: `${publicBase}/how-it-works`, root: 'body.launch-page', heading: '.launch-hero h1', nav: '.launch-nav', content: 'main', family: 'static-public', mobile: true },
  { name: 'pricing', url: `${publicBase}/pricing`, root: 'body.launch-page', heading: '.launch-hero h1', nav: '.launch-nav', content: 'main', family: 'static-public', mobile: true },
  { name: 'faq', url: `${publicBase}/faq`, root: 'body.launch-page', heading: '.launch-hero h1', nav: '.launch-nav', content: 'main', family: 'static-public', mobile: true },
  { name: 'privacy', url: `${publicBase}/privacy`, root: '.public-secondary-page', heading: '.policy-hero h1', nav: '.v0-nav', content: '.policy-grid', family: 'policy', mobile: true },
  { name: 'terms', url: `${publicBase}/terms`, root: '.public-secondary-page', heading: '.policy-hero h1', nav: '.v0-nav', content: '.policy-grid', family: 'policy', mobile: false },
  { name: 'login', url: `${appBase}/login`, root: '.account-shell', heading: '.account-intro h1', nav: '.account-nav', content: '.account-layout', family: 'auth', mobile: true },
  { name: 'signup', url: `${appBase}/signup`, root: '.account-shell', heading: '.account-intro h1', nav: '.account-nav', content: '.account-layout', family: 'auth', mobile: true },
  { name: 'invitation', url: `${appBase}/invitation?token=route-cohesion-audit`, root: '.invitation-shell', heading: '.auth-panel h1', nav: '.wordmark', content: '.auth-panel', family: 'invitation', mobile: true, waitUntil: 'load' },
  { name: 'onboarding-gate', url: `${appBase}/onboarding`, root: '.account-shell', heading: '.account-intro h1', nav: '.account-nav', content: '.account-layout', family: 'auth-redirect', mobile: false },
  { name: 'workspace-gate', url: `${appBase}/app`, root: '.account-shell', heading: '.account-intro h1', nav: '.account-nav', content: '.account-layout', family: 'auth-redirect', mobile: false },
  { name: 'not-found', url: `${appBase}/route-cohesion-not-found`, root: '.public-not-found', heading: '.public-not-found h1', nav: '.launch-nav', content: '.public-not-found > section', family: 'static-public', mobile: true }
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

function parseRetryAfter(value, now = Date.now()) {
  const text = String(value || '').trim();
  if (!text) return 0;
  if (/^\d+(?:\.\d+)?$/.test(text)) return Math.max(0, Math.ceil(Number(text) * 1_000));
  const timestamp = Date.parse(text);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - now) : 0;
}

function parseRateLimitReset(value) {
  const match = String(value || '').match(/\bt=(\d+(?:\.\d+)?)/i);
  return match ? Math.max(0, Math.ceil(Number(match[1]) * 1_000)) : 0;
}

function browserRunRetryDelay(headers, now = Date.now()) {
  const retryAfterMs = parseRetryAfter(headers?.get?.('retry-after'), now);
  const rateLimitResetMs = parseRateLimitReset(headers?.get?.('ratelimit'));
  return Math.min(120_000, Math.max(browserRunRetryFloorMs, retryAfterMs + 1_000, rateLimitResetMs + 1_000));
}

function isBrowserRunRateLimit(status, payload, text = '') {
  if (status === 429) return true;
  const errors = Array.isArray(payload?.errors) ? payload.errors : [];
  if (errors.some((entry) => Number(entry?.code) === 2001 || /rate limit exceeded/i.test(String(entry?.message || '')))) return true;
  return /(?:\bcode["']?\s*:\s*2001|rate limit exceeded)/i.test(String(text || ''));
}

function isBrowserRunTransientRequestTimeout(status, payload) {
  if (status !== 422) return false;
  const errors = Array.isArray(payload?.errors) ? payload.errors : [];
  return errors.some((entry) => (
    Number(entry?.code) === 6002
    && /^request timed out$/i.test(String(entry?.detail || '').trim())
  ));
}

function auditScriptUrl(route, baseUrl = route.url) {
  const url = new URL(auditScriptPath, baseUrl);
  url.searchParams.set('attribute', auditAttribute);
  url.searchParams.set('root', route.root);
  url.searchParams.set('heading', route.heading);
  url.searchParams.set('nav', route.nav);
  url.searchParams.set('content', route.content);
  url.searchParams.set('deadline', String(auditDeadlineMs));
  url.searchParams.set('poll', String(auditPollIntervalMs));
  if (commitSha) url.searchParams.set('release', commitSha);
  return url.toString();
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
    gotoOptions: { waitUntil: route.waitUntil || 'networkidle0', timeout: 45_000 },
    waitForSelector: { selector: auditMarkerSelector, timeout: 45_000 },
    waitForTimeout: 100,
    actionTimeout: 120_000,
    screenshotOptions: { fullPage: false, type: 'png', captureBeyondViewport: false },
    addStyleTag: [{
      content: 'html{scroll-behavior:auto!important}*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}'
    }],
    addScriptTag: [{ url: auditScriptUrl(route) }]
  };
}

function preflightSnapshotBody() {
  const route = routes[0];
  return {
    route,
    request: productionSnapshotBody(route, 'desktop')
  };
}

function verifyAuditTransportContract() {
  const auditSource = readFileSync(resolve('apps/web/public/route-cohesion-audit.js'), 'utf8');
  assert(auditSource.includes('document.currentScript'), 'external Browser Run audit asset cannot read its route configuration');
  assert(auditSource.includes('setTimeout(inspect, pollInterval)'), 'external Browser Run audit asset lacks bounded root polling');
  assert(auditSource.includes("document.addEventListener('DOMContentLoaded', start"), 'external Browser Run audit asset lacks document readiness handling');
  assert(auditSource.includes('documentRoot.setAttribute(attribute'), 'external Browser Run audit asset does not publish the shared rendered-root attribute');
  assert(auditSource.includes('auditError'), 'external Browser Run audit asset cannot publish explicit runtime errors');
  assert(!auditSource.includes('how-it-works'), '/how-it-works has a route-specific audit exception');

  const preflight = preflightSnapshotBody();
  assert(preflight.route.name === 'how-it-works', 'Browser Run preflight is not anchored to the first real production route');
  assert(!('html' in preflight.request), 'Browser Run preflight still uses supplied HTML that cannot load the external audit script');
  assert(preflight.request.url.startsWith(`${publicBase}/how-it-works?`), 'Browser Run preflight does not render the real /how-it-works route');
  assert(preflight.request.waitForSelector.selector === auditMarkerSelector, 'Browser Run preflight does not wait for the shared audit marker');
  assert(preflight.request.addScriptTag[0]?.url?.startsWith(`${publicBase}${auditScriptPath}?`), 'Browser Run preflight does not use the CSP-compatible external audit asset');
  assert(!('content' in preflight.request.addScriptTag[0]), 'Browser Run preflight still injects an inline audit script');

  const invitationRoute = routes.find((route) => route.name === 'invitation');
  assert(invitationRoute, 'invitation route audit contract is missing');
  assert(new URL(invitationRoute.url).pathname === '/invitation', 'invitation audit URL does not mount InvitationPage');
  assert(new URL(invitationRoute.url).searchParams.get('token') === 'route-cohesion-audit', 'invitation audit URL does not provide deterministic token input');
  assert(invitationRoute.heading === '.auth-panel h1', 'invitation audit heading selector does not match InvitationPage');
  assert(invitationRoute.waitUntil === 'load', 'invitation audit does not avoid token-preview network-idle deadlock');

  assert(browserRunIntervalMs >= 12_000, 'Browser Run request interval is below the free-plan safety floor');
  assert(browserRunRequestMaxAttempts >= 2 && browserRunRequestMaxAttempts <= 5, 'Browser Run per-request retry bound is invalid');
  assert(parseRetryAfter('12', 0) === 12_000, 'Retry-After seconds are not parsed correctly');
  assert(parseRetryAfter(new Date(20_000).toUTCString(), 0) === 20_000, 'Retry-After HTTP date is not parsed correctly');
  assert(parseRetryAfter('invalid', 0) === 0, 'Invalid Retry-After values are not ignored');
  assert(parseRateLimitReset('"default";r=0;t=9') === 9_000, 'Ratelimit reset seconds are not parsed correctly');
  assert(browserRunRetryDelay(new Headers({ 'retry-after': '12', ratelimit: '"default";r=0;t=9' }), 0) >= 13_000, 'Browser Run retry delay does not honor response headers');
  assert(isBrowserRunRateLimit(429, { errors: [{ code: 2001, message: 'Rate limit exceeded' }] }), 'HTTP 429 is not recognized as a Browser Run throttle');
  assert(isBrowserRunRateLimit(200, { success: false, errors: [{ code: 2001, message: 'Rate limit exceeded' }] }), 'Browser Run code 2001 is not recognized without HTTP 429');
  assert(!isBrowserRunRateLimit(422, { errors: [{ code: 6002, message: 'Navigation timeout' }] }), 'Unrelated Browser Run failures are incorrectly retried');
  assert(isBrowserRunTransientRequestTimeout(422, { errors: [{ code: 6002, message: 'A timeout was reached', detail: 'Request timed out' }] }), 'Transient Browser Run request timeout is not recognized');
  assert(!isBrowserRunTransientRequestTimeout(422, { errors: [{ code: 6002, message: 'A timeout was reached', detail: 'Navigation timeout of 45000 ms exceeded' }] }), 'Navigation timeout is incorrectly retried as a transient request timeout');
  assert(!isBrowserRunTransientRequestTimeout(422, { errors: [{ code: 6002, message: 'A timeout was reached', detail: 'Waiting for selector failed' }] }), 'Selector timeout is incorrectly retried as a transient request timeout');

  for (const route of routes) {
    const pathname = new URL(route.url).pathname;
    const sample = { pathname, routeCohesion: route.family === 'static-public' ? 'v1' : '', auditError: '' };
    const encoded = Buffer.from(JSON.stringify(sample), 'utf8').toString('base64');
    const html = `<!doctype html><html ${auditAttribute}="${encoded}"><head></head><body></body></html>`;
    const decoded = decodeAuditPayload(html, `${route.name}/desktop`);
    const request = productionSnapshotBody(route, 'desktop');
    const scriptUrl = new URL(request.addScriptTag[0].url);

    assert(decoded.pathname === pathname, `${route.name}/desktop: audit transport changed the route pathname`);
    assert(scriptUrl.origin === new URL(route.url).origin, `${route.name}/desktop: audit asset is not same-origin with the rendered route`);
    assert(scriptUrl.pathname === auditScriptPath, `${route.name}/desktop: audit asset path is incorrect`);
    assert(scriptUrl.searchParams.get('root') === route.root, `${route.name}/desktop: audit root selector changed in transport`);
    assert(scriptUrl.searchParams.get('heading') === route.heading, `${route.name}/desktop: audit heading selector changed in transport`);
    assert(scriptUrl.searchParams.get('nav') === route.nav, `${route.name}/desktop: audit navigation selector changed in transport`);
    assert(scriptUrl.searchParams.get('content') === route.content, `${route.name}/desktop: audit content selector changed in transport`);
    assert(scriptUrl.searchParams.get('deadline') === String(auditDeadlineMs), `${route.name}/desktop: audit deadline changed in transport`);
    assert(scriptUrl.searchParams.get('poll') === String(auditPollIntervalMs), `${route.name}/desktop: audit polling interval changed in transport`);
    assert(request.gotoOptions.waitUntil === (route.waitUntil || 'networkidle0'), `${route.name}/desktop: Browser Run navigation condition changed in transport`);
    assert(!('content' in request.addScriptTag[0]), `${route.name}/desktop: Browser Run still injects inline script content blocked by production CSP`);
    assert(request.waitForSelector.selector === auditMarkerSelector, `${route.name}/desktop: Browser Run does not wait for audit completion`);
  }

  console.log(`Pure route cohesion audit contract verified routes=${routes.map((route) => route.name).join(',')} marker=${auditMarkerSelector} transport=same-origin-external-script requestIntervalMs=${browserRunIntervalMs} requestAttempts=${browserRunRequestMaxAttempts}; live Browser Run not exercised`);
}

async function waitForBrowserSlot() {
  const elapsed = Date.now() - lastBrowserRunAt;
  if (lastBrowserRunAt && elapsed < browserRunIntervalMs) await delay(browserRunIntervalMs - elapsed);
  lastBrowserRunAt = Date.now();
}

async function browserSnapshot(request, label) {
  for (let attempt = 1; attempt <= browserRunRequestMaxAttempts; attempt += 1) {
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
    const rateLimited = isBrowserRunRateLimit(response.status, payload, text);
    const transientRequestTimeout = isBrowserRunTransientRequestTimeout(response.status, payload);
    const retryReason = rateLimited
      ? 'browser-run-rate-limit'
      : transientRequestTimeout
        ? 'browser-run-request-timeout'
        : '';
    if ((!response.ok || payload?.success === false) && retryReason && attempt < browserRunRequestMaxAttempts) {
      const waitMs = rateLimited ? browserRunRetryDelay(response.headers) : browserRunRetryFloorMs;
      console.warn(
        `[route-cohesion] label=${label} status=retry reason=${retryReason} `
        + `http=${response.status} attempt=${attempt}/${browserRunRequestMaxAttempts} waitMs=${waitMs}`
      );
      await delay(waitMs);
      continue;
    }
    if (!response.ok || payload?.success === false) {
      throw new Error(
        `Route cohesion browser audit failed for ${label} (${response.status}) attempt=${attempt}/${browserRunRequestMaxAttempts}: `
        + redact(JSON.stringify(payload?.errors || payload || text)).slice(0, 800)
      );
    }

    const result = payload?.result || payload || {};
    const html = String(result?.content || '');
    const screenshot = Buffer.from(String(result?.screenshot || ''), 'base64');
    return { responseStatus: response.status, result, html, screenshot };
  }

  throw new Error(`Route cohesion browser audit failed for ${label}: retry loop exhausted without a response`);
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
  const { route } = preflightSnapshotBody();
  const result = await capture(route, 'desktop');
  verify(result);
  console.log(`Cloudflare Browser Run audit transport preflight passed route=${result.route}/${result.profile}`);
  return result;
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

  const preflight = await verifyBrowserTransportPreflight();

  const results = [preflight];
  for (const route of routes) {
    if (route.name !== preflight.route) {
      const desktop = await capture(route, 'desktop');
      verify(desktop);
      results.push(desktop);
    }
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
    auditScript: auditScriptPath,
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
