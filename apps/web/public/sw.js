const RETIREMENT_MARKER = 'sovereign-public-cache-retired-v17';
const RETIRED_CACHE_PREFIX = 'sovereign-public';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(RETIRED_CACHE_PREFIX))
        .map((key) => caches.delete(key))
    );

    await self.registration.unregister();
    await self.clients.claim();

    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(windows.map(async (client) => {
      try {
        await client.navigate(client.url);
      } catch {
        // A closed or cross-navigation client needs no further action.
      }
    }));
  })());
});
