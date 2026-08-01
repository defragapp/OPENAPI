const commitSha = String(process.env.GITHUB_SHA || process.env.WORKERS_CI_COMMIT_SHA || '').trim();

if (!/^[0-9a-f]{40}$/i.test(commitSha)) {
  throw new Error('A full 40-character commit SHA is required for parent-domain verification');
}

const publicBase = 'https://sovereign.defrag.app';
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
  if (headerIncludes(home, 'cache-control', 'immutable')) {
    throw new Error('Public entry HTML must not be immutable');
  }

  const scriptPaths = uniqueMatches(html, /src=["'](\/assets\/[^"']+\.js)["']/g);
  const stylePaths = uniqueMatches(html, /href=["'](\/assets\/[^"']+\.css)["']/g);
  if (!scriptPaths.length) throw new Error('Public entry is missing its compiled JavaScript asset');
  if (!stylePaths.length) throw new Error('Public entry is missing its compiled CSS asset');

  const [scripts, styles, serviceWorker, displayFont, sansFont] = await Promise.all([
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
    fetchWithTimeout(`${publicBase}/fonts/sovereign-sans.woff2`).then(async (response) => ({ response, bytes: (await response.arrayBuffer()).byteLength }))
  ]);

  const compiledJavaScript = scripts.join('\n');
  for (const marker of [
    'Know yourself.',
    'Understand the system.',
    'Choose what fits.',
    'Your intelligence begins with your Baseline.',
    'What do you want to understand?'
  ]) {
    if (!compiledJavaScript.includes(marker)) throw new Error(`Compiled application is missing current product marker: ${marker}`);
  }

  const compiledCss = styles.join('\n');
  const compactCss = compiledCss.replace(/\s+/g, '');
  for (const marker of [
    '--editorial-page:#fbfbf8',
    '--editorial-ink:#171815',
    '.sovereign-landing{',
    '/fonts/sovereign-display.woff2',
    '/fonts/sovereign-sans.woff2'
  ]) {
    if (!compactCss.includes(marker.replace(/\s+/g, ''))) {
      throw new Error(`Compiled CSS is missing current editorial marker: ${marker}`);
    }
  }
  for (const family of ['Sovereign Display', 'Sovereign Sans']) {
    if (!compiledCss.includes(family)) throw new Error(`Compiled CSS is missing self-hosted family: ${family}`);
  }

  if (!serviceWorker.response.ok
    || !serviceWorker.text.includes("const CACHE_NAME = 'sovereign-public-v15'")
    || !serviceWorker.text.includes('networkFirst(request)')
    || serviceWorker.text.includes("  '/app',")) {
    throw new Error('Public service worker is stale or caches private workspace navigation');
  }

  for (const [label, font] of [['display', displayFont], ['sans', sansFont]]) {
    const contentType = String(font.response.headers.get('content-type') || '').toLowerCase();
    if (!font.response.ok || font.bytes < 1_000 || !/(font|woff|octet-stream)/.test(contentType)) {
      throw new Error(`Self-hosted ${label} font is unavailable or invalid`);
    }
  }

  return {
    entryDocument: 'current-and-revalidating',
    javascriptAssets: scriptPaths,
    cssAssets: stylePaths,
    editorialContract: 'public-landing-editorial.css',
    typography: ['Sovereign Display', 'Sovereign Sans'],
    serviceWorkerCache: 'sovereign-public-v15'
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
