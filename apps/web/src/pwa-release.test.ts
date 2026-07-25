import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const icon = readFileSync(new URL('../public/app-icon.svg', import.meta.url), 'utf8');

describe('release PWA surface', () => {
  it('provides installable metadata and an application icon', () => {
    expect(manifest.name).toBe('Sovereign.OS');
    expect(manifest.scope).toBe('/');
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: '/app-icon.svg', type: 'image/svg+xml' })
    ]));
    expect(index).toContain('rel="icon" href="/app-icon.svg"');
    expect(icon).toContain('<svg');
    expect(icon).toContain('viewBox="0 0 512 512"');
  });

  it('never caches authenticated navigation or API requests', () => {
    expect(serviceWorker).toContain("url.pathname.startsWith('/api/')");
    expect(serviceWorker).toContain('PUBLIC_NAVIGATION.has(url.pathname)');
    expect(serviceWorker).not.toMatch(/PUBLIC_NAVIGATION[^;]+\/app/);
    expect(serviceWorker).not.toMatch(/PUBLIC_SHELL[^;]+\/login/);
    expect(serviceWorker).not.toMatch(/PUBLIC_SHELL[^;]+\/signup/);
  });

  it('refreshes public navigation before using an offline fallback', () => {
    expect(serviceWorker).toContain('networkFirst(request)');
    expect(serviceWorker).toContain('staleWhileRevalidate(request)');
    expect(serviceWorker).toContain('no-store|private');
    expect(serviceWorker).toContain("cache.match('/')");
  });
});
