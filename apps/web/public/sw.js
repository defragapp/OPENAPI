const CACHE_NAME = 'sovereign-public-v15';
const ASSET_CACHE_NAME = 'sovereign-public-assets-v16';
const PUBLIC_SHELL = [
  '/',
  '/how-it-works',
  '/pricing',
  '/faq',
  '/manifest.webmanifest',
  '/app-icon.svg',
  '/brand-mark.svg',
  '/safari-pinned-tab.svg',
  '/launch.css',
  '/launch-polish.css',
  '/static-release.css',
  '/static-experience.css',
  '/platform-public.css'
];
const PUBLIC_ASSETS = new Set(PUBLIC_SHELL.filter((path) => path !== '/'));
const PUBLIC_NAVIGATION = new Set([
  '/',
  '/how-it-works',
  '/how-it-works.html',
  '/pricing',
  '/pricing.html',
  '/faq',
  '/faq.html',
  '/questions',
  '/privacy',
  '/terms'
]);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    await caches.delete(CACHE_NAME);
    await caches.delete(ASSET_CACHE_NAME);
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(PUBLIC_SHELL.map((path) => cache.add(path)));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME && key !== ASSET_CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    if (!PUBLIC_NAVIGATION.has(url.pathname)) return;
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(networkFirstAsset(request));
    return;
  }

  if (PUBLIC_ASSETS.has(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (isCacheable(response)) await cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match('/')) || Response.error();
  }
}

async function networkFirstAsset(request) {
  const cache = await caches.open(ASSET_CACHE_NAME);
  try {
    const response = await fetch(request, { cache: 'reload' });
    if (!isExpectedCompiledAsset(response, request.url)) return response;
    await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const refresh = fetch(request, { cache: 'no-cache' }).then(async (response) => {
    if (isCacheable(response)) await cache.put(request, response.clone());
    return response;
  }).catch(() => undefined);
  return cached || (await refresh) || Response.error();
}

function isExpectedCompiledAsset(response, requestUrl) {
  if (!isCacheable(response)) return false;
  const pathname = new URL(requestUrl).pathname;
  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  if (pathname.endsWith('.css')) return contentType.includes('text/css');
  if (pathname.endsWith('.js')) return /(javascript|ecmascript)/.test(contentType);
  return true;
}

function isCacheable(response) {
  return response.ok && response.type !== 'opaque' && !/no-store|private/i.test(response.headers.get('cache-control') || '');
}
