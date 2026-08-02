import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const manifest = readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8');
const socialPreview = readFileSync(new URL('../public/og-sovereign.svg', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const productStories = readFileSync(new URL('./landing-product-stories-v2.css', import.meta.url), 'utf8');

describe('public metadata and fallback documents', () => {
  it('uses the founder v0 promise in document metadata', () => {
    expect(index).toContain('Healing isn’t optional. Holding onto the pain is.');
    expect(index).toContain('Personal AI that builds your Baseline');
    expect(index).toContain('Personal AI for real life');
    expect(index).not.toContain('Know yourself. Understand the system. Choose what fits.');
  });

  it('delivers product-story layout through the compiled application bundle', () => {
    expect(index).toContain('<script type="module" src="/src/main.tsx"></script>');
    expect(index).not.toContain('v0-product-story-layout-hotfix.css');
    expect(main).toContain("import './landing-product-stories-v2.css';");
    for (const marker of [
      '.landing-story__stage',
      'display: flex',
      'flex-direction: column',
      'height: auto',
      'min-height: 0',
      '@media (max-width: 760px)'
    ]) expect(productStories).toContain(marker);
  });

  it('keeps the static 404 on the current production assets', () => {
    for (const asset of [
      '/launch.css?v=20260730-cohesion',
      '/launch-polish.css?v=20260730-cohesion',
      '/static-release.css?v=20260730-cohesion',
      '/static-experience.css?v=20260730-cohesion'
    ]) expect(notFound).toContain(asset);
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
  });

  it('keeps install metadata aligned with the v0 category', () => {
    expect(manifest).toContain('Personal AI that builds your Baseline');
    expect(manifest).toContain('Open your private Sovereign workspace.');
    expect(manifest).toContain('"theme_color": "#0f0f0f"');
  });

  it('keeps social previews consistent with the founder hero', () => {
    expect(socialPreview).toContain('Healing isn’t optional.');
    expect(socialPreview).toContain('Holding onto the pain is.');
    expect(socialPreview).toContain('PERSONAL AI FOR REAL LIFE');
    expect(socialPreview).not.toContain('Know yourself.');
  });

  it('retires the stale public shell instead of caching another visual release', () => {
    expect(serviceWorker).toContain("const RETIREMENT_MARKER = 'sovereign-public-cache-retired-v17'");
    expect(serviceWorker).toContain('self.registration.unregister()');
    expect(serviceWorker).toContain('caches.keys()');
    expect(serviceWorker).toContain('client.navigate(client.url)');
    expect(serviceWorker).not.toContain("addEventListener('fetch'");
    expect(serviceWorker).not.toContain('PUBLIC_NAVIGATION');
    expect(serviceWorker).not.toContain("  '/app',");
  });
});