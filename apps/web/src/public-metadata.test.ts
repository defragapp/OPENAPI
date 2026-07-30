import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const manifest = readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8');
const socialPreview = readFileSync(new URL('../public/og-sovereign.svg', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

 describe('public metadata and fallback documents', () => {
  it('uses the current personal, relationship, decision, and system positioning in document metadata', () => {
    expect(index).toContain('Sovereign.OS — Ask about your life. Get an answer built around you.');
    expect(index).toContain('private AI that answers questions about yourself, decisions, relationships, and systems');
    expect(index).toContain('Private personal, relationship, decision, and system intelligence');
    expect(index).not.toContain('Personal AI for real life');
    expect(index).not.toContain('Know yourself. Understand the system. Choose what fits.');
  });

  it('keeps the static 404 on the unified product assets and product category', () => {
    for (const asset of [
      '/launch.css?v=20260730-cohesion',
      '/launch-polish.css?v=20260730-cohesion',
      '/static-release.css?v=20260730-cohesion',
      '/static-experience.css?v=20260730-cohesion',
      '/platform-public.css?v=20260730-platform2',
      '/sovereign-product-v2.css?v=20260730-reconciliation',
      '/sovereign-product-precision.css?v=20260730-precision'
    ]) expect(notFound).toContain(asset);
    expect(notFound).toContain('Private AI for personal, relationship, and system intelligence');
  });

  it('keeps install metadata aligned with the current product category', () => {
    expect(manifest).toContain('Private AI for understanding yourself, your relationships, and the systems around you.');
    expect(manifest).toContain('Open your private Sovereign.OS workspace.');
    expect(manifest).not.toContain('private personal AI');
  });

  it('keeps the enduring brand line in the social preview without using it as the homepage explanation', () => {
    expect(socialPreview).toContain('Know yourself.');
    expect(socialPreview).toContain('Understand the system.');
    expect(socialPreview).toContain('Choose what fits.');
    expect(index).not.toContain('Know yourself. Understand the system. Choose what fits.');
  });

  it('invalidates the retired public shell and caches the unified public styles without private navigation', () => {
    expect(serviceWorker).toContain("const CACHE_NAME = 'sovereign-public-v15'");
    expect(serviceWorker).toContain("'/platform-public.css'");
    expect(serviceWorker).toContain("'/sovereign-product-v2.css'");
    expect(serviceWorker).toContain("'/sovereign-product-precision.css'");
    expect(serviceWorker).not.toContain("  '/app',");
    expect(serviceWorker).toContain("url.pathname.startsWith('/api/')");
    expect(serviceWorker).toContain("if (!PUBLIC_NAVIGATION.has(url.pathname)) return;");
  });
});
