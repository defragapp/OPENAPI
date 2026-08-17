import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const icon = readFileSync(new URL('../public/app-icon.svg', import.meta.url), 'utf8');
const brandMark = readFileSync(new URL('../public/brand-mark.svg', import.meta.url), 'utf8');

describe('release PWA surface', () => {
  it('provides install metadata and one consistent application mark', () => {
    expect(manifest.name).toBe('Sovereign.OS');
    expect(manifest.scope).toBe('/');
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: '/app-icon.png', sizes: '512x512', type: 'image/png' }),
      expect.objectContaining({ src: '/app-icon.svg', type: 'image/svg+xml' })
    ]));
    expect(index).toContain('rel="icon" href="/app-icon.svg"');
    expect(index).toContain('rel="icon" href="/app-icon.png" type="image/png" sizes="512x512"');
    expect(index).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180"');
    expect(index).toContain('rel="mask-icon" href="/safari-pinned-tab.svg"');
    expect(consent).toContain('rel="icon" href="/app-icon.png" type="image/png" sizes="512x512"');
    expect(consent).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180"');
    expect(consent).toContain('rel="mask-icon" href="/safari-pinned-tab.svg"');
    expect(icon).toContain('<svg');
    expect(icon).toContain('viewBox="0 0 512 512"');
    expect(icon).toContain('A central point with a quiet field of lines showing different relative emphasis.');
    expect(brandMark).toContain('viewBox="0 0 48 48"');
  });

  it('retires every legacy service worker and Sovereign public cache', () => {
    expect(serviceWorker).toContain("const RETIREMENT_MARKER = 'sovereign-public-cache-retired-v17'");
    expect(serviceWorker).toContain('caches.keys()');
    expect(serviceWorker).toContain('self.registration.unregister()');
    expect(serviceWorker).toContain("self.clients.matchAll({ type: 'window', includeUncontrolled: true })");
    expect(serviceWorker).toContain('client.navigate(client.url)');
    expect(serviceWorker).not.toContain("addEventListener('fetch'");
  });

  it('removes registrations and cached shells from the active application runtime', () => {
    expect(main).toContain('navigator.serviceWorker.getRegistrations()');
    expect(main).toContain('registration.unregister()');
    expect(main).toContain("key.startsWith('sovereign-public')");
    expect(main).toContain("window.sessionStorage.setItem('sovereign-public-cache-retired', 'true')");
    expect(main).toContain('window.location.reload()');
    expect(main).not.toContain(".register('/sw.js");
  });

  it('prevents HTML and the retirement worker from being stored by browsers or the CDN', () => {
    expect(headers).toContain('/\n  Cache-Control: no-store, no-cache, must-revalidate');
    expect(headers).toContain('/*.html\n  Cache-Control: no-store, no-cache, must-revalidate');
    expect(headers).toContain('/sw.js\n  Cache-Control: no-store, no-cache, must-revalidate');
    expect(headers).toContain('CDN-Cache-Control: no-store');
    expect(headers).toContain('Cloudflare-CDN-Cache-Control: no-store');
    expect(headers).toContain('/assets/*\n  Cache-Control: public, max-age=31536000, immutable');
  });
});
