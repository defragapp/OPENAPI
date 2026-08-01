const commitSha = String(process.env.GITHUB_SHA || process.env.WORKERS_CI_COMMIT_SHA || '').trim();

if (!/^[0-9a-f]{40}$/i.test(commitSha)) {
  throw new Error('A full 40-character commit SHA is required for parent-domain verification');
}

const publicBase = 'https://sovereign.defrag.app';
const appBase = 'https://app.defrag.app';
const redirectChecks = [
  ['https://defrag.app/', 'https://sovereign.defrag.app/'],
  ['https://www.defrag.app/', 'https://sovereign.defrag.app/'],
  ['https://defrag.app/app', 'https://app.defrag.app/app'],
  ['https://www.defrag.app/login', 'https://app.defrag.app/login']
];

const healthChecks = [
  'https://defrag.app/health',
  'https://www.defrag.app/health'
];

function normalizeLocation(value, source) {
  if (!value) return '';
  return new URL(value, source).toString();
}

function headerIncludes(response, name, value) {
  return String(response.headers.get(name) || '').toLowerCase().includes(String(value).toLowerCase());
}

function uniqueMatches(source, pattern) {
  return [...new Set([...source.matchAll(pattern)].map((match) => match[1]).filter(Boolean))];
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache',
      ...(options.headers || {})
    },
    signal: AbortSignal.timeout(12_000)
  });
}

async function verifyVisualRelease() {
  const home = await fetchWithTimeout(`${publicBase}/?release=${commitSha}`);
  const html = await home.text();
  if (!home.ok || !html.includes('id="root"') || !html.includes('Sovereign.OS')) {
    throw new Error(`Public entry document is unavailable: status=${home.status}`);
  }
  if (!headerIncludes(home, 'cache-control', 'no-store')) {
    throw new Error(`Public entry HTML must be non-storable; received cache-control=${home.headers.get('cache-control') || 'missing'}`);
  }

  const scriptPaths = uniqueMatches(html, /src=["'](\/assets\/[^"']+\.js)["']/g);
  const stylePaths = uniqueMatches(html, /href=["'](\/assets\/[^"']+\.css)["']/g);
  if (!scriptPaths.length) throw new Error('Public entry is missing its compiled JavaScript asset');
  if (!stylePaths.length) throw new Error('Public entry is missing its compiled CSS asset');

  const [scripts, styles, serviceWorker, displayFont, sansFont, expressionFieldAuthBoundary] = await Promise.all([
    Promise.all(scriptPaths.map(async (path) => {
      const response = await fetchWithTimeout(`${publicBase}${path}`);
      const text = await response.text();
      if (!response.ok || !headerIncludes(response, 'cache-control', 'immutable')) {
        throw new Error(`Compiled JavaScript is unavailable or not immutable: ${path}`);
      }
      return text;
    })),
    Promise.all(stylePaths.map(async (path) => {
      const response = await fetchWithTimeout(`${publicBase}${path}`);
      const text = await response.text();
      if (!response.ok || !headerIncludes(response, 'cache-control', 'immutable')) {
        throw new Error(`Compiled CSS is unavailable or not immutable: ${path}`);
      }
      return text;
    })),
    fetchWithTimeout(`${publicBase}/sw.js`).then(async (response) => ({ response, text: await response.text() })),
    fetchWithTimeout(`${publicBase}/fonts/sovereign-display.woff2`).then(async (response) => ({ response, bytes: (await response.arrayBuffer()).byteLength })),
    fetchWithTimeout(`${publicBase}/fonts/sovereign-sans.woff2`).then(async (response) => ({ response, bytes: (await response.arrayBuffer()).byteLength })),
    fetchWithTimeout(`${appBase}/api/v1/expression-field?mode=live`, {
      redirect: 'manual',
      headers: { accept: 'application/json' }
    })
  ]);

  const compiledJavaScript = scripts.join('\n');
  for (const marker of [
    'Know yourself.',
    'Understand the system.',
    'Choose what fits.',
    'Your intelligence begins with your Baseline.',
    'What do you want to understand?',
    'ONE CENTER · SIXTEEN EXPRESSIONS',
    'Sanitized demonstration · Illustrative values · Not your Baseline',
    '/api/v1/expression-field?mode=live',
    'sovereign-public-cache-retired'
  ]) {
    if (!compiledJavaScript.includes(marker)) throw new Error(`Compiled application is missing current product marker: ${marker}`);
  }

  const compiledCss = styles.join('\n');
  const compactCss = compiledCss.replace(/\s+/g, '');
  for (const marker of [
    '--editorial-page:#0f0f0f',
    '--editorial-ink:#f5f1e8',
    '--editorial-cream:#e8ddd0',
    '.sovereign-landing{',
    '.expression-field-canvas{',
    '.expression-field-focus{',
    'touch-action:pan-y',
    'touch-action:none',
    '/fonts/sovereign-display.woff2',
    '/fonts/sovereign-sans.woff2'
  ]) {
    if (!compactCss.includes(marker.replace(/\s+/g, ''))) {
      throw new Error(`Compiled CSS is missing current cinematic marker: ${marker}`);
    }
  }
  for (const family of ['Sovereign Display', 'Sovereign Sans']) {
    if (!compiledCss.includes(family)) throw new Error(`Compiled CSS is missing self-hosted family: ${family}`);
  }

  if (expressionFieldAuthBoundary.status !== 401) {
    throw new Error(`Private Expression Field endpoint returned ${expressionFieldAuthBoundary.status}; expected 401 without a session`);
  }

  if (!serviceWorker.response.ok
    || !headerIncludes(serviceWorker.response, 'cache-control', 'no-store')
    || !serviceWorker.text.includes("const RETIREMENT_MARKER = 'sovereign-public-cache-retired-v17'")
    || !serviceWorker.text.includes('self.registration.unregister()')
    || !serviceWorker.text.includes('caches.keys()')
    || !serviceWorker.text.includes('client.navigate(client.url)')
    || serviceWorker.text.includes("addEventListener('fetch'")) {
    throw new Error('Public service worker retirement contract is missing or cacheable');
  }

  for (const [label, font] of [['display', displayFont], ['sans', sansFont]]) {
    const contentType = String(font.response.headers.get('content-type') || '').toLowerCase();
    if (!font.response.ok || font.bytes < 1_000 || !/(font|woff|octet-stream)/.test(contentType)) {
      throw new Error(`Self-hosted ${label} font is unavailable or invalid`);
    }
  }

  return {
    entryDocument: 'no-store',
    javascriptAssets: scriptPaths,
    cssAssets: stylePaths,
    editorialContract: 'public-landing-editorial.css',
    expressionFieldContract: 'expression-field.v1',
    expressionFieldAuthBoundary: 'private-401-without-session',
    visualDirection: 'zip-inspired-cinematic-dark',
    typography: ['Sovereign Display', 'Sovereign Sans'],
    serviceWorkerMode: 'retired',
    serviceWorkerCache: 'none'
  };
}

async function verifyOnce() {
  for (const [source, expected] of redirectChecks) {
    const response = await fetchWithTimeout(source, { redirect: 'manual' });
    if (response.status !== 308) {
      throw new Error(`${source} returned ${response.status}; expected 308`);
    }
    const location = normalizeLocation(response.headers.get('location'), source);
    if (location !== expected) {
      throw new Error(`${source} redirected to ${location || 'nothing'}; expected ${expected}`);
    }
  }

  for (const source of healthChecks) {
    const response = await fetchWithTimeout(source, { redirect: 'manual' });
    const text = await response.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`${source} returned invalid JSON: ${text.slice(0, 300)}`);
    }
    if (!response.ok || payload?.ok !== true || payload?.version !== commitSha) {
      throw new Error(`${source} is not serving ${commitSha}: status=${response.status} body=${text.slice(0, 500)}`);
    }
  }

  return verifyVisualRelease();
}

let lastError;
for (let attempt = 1; attempt <= 24; attempt += 1) {
  try {
    const visualRelease = await verifyOnce();
    console.log(JSON.stringify({
      parentDomainsVerified: true,
      version: commitSha,
      redirects: redirectChecks.map(([source, destination]) => ({ source, destination })),
      health: healthChecks,
      visualRelease
    }, null, 2));
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 24) await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
}

throw new Error(`Parent-domain verification did not converge: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
