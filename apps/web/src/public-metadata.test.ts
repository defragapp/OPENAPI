import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const manifest = readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8');
const socialPreview = readFileSync(new URL('../public/og-sovereign.svg', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

describe('public metadata and fallback documents', () => {
  it('uses an immediate plain-language product description in document metadata', () => {
    expect(index).toContain('Ask about your life. Get an answer built around you.');
    expect(index).toContain('Private AI for personal questions, decisions, relationships, families, and teams.');
    expect(index).toContain('Private AI built around your Baseline');
    expect(index).not.toContain('Know yourself. Understand the system. Choose what fits.');
    expect(index).not.toContain('Personal AI for real life');
  });

  it('keeps the static 404 on the current cohesion assets and product category', () => {
    for (const asset of [
      '/launch.css?v=20260730-cohesion',
      '/launch-polish.css?v=20260730-cohesion',
      '/static-release.css?v=20260730-cohesion',
      '/static-experience.css?v=20260730-cohesion'
    ]) {
      expect(notFound).toContain(asset);
    }
    expect(notFound).toContain('Private AI for personal, relationship, and system intelligence');
    expect(notFound).not.toContain('20260728-baseline-first');
    expect(notFound).not.toContain('20260729-visual-sync');
  });

  it('keeps install metadata clear and accurate', () => {
    expect(manifest).toContain('Private AI for understanding yourself, a decision, a relationship, or a group.');
    expect(manifest).toContain('Open your private Sovereign.OS workspace.');
    expect(manifest).not.toContain('the decisions in front of you');
  });

  it('keeps social previews permission-safe and consistent with the hero promise', () => {
    expect(socialPreview).toContain('Ask about your life.');
    expect(socialPreview).toContain('Get an answer built');
    expect(socialPreview).toContain('around you.');
    expect(socialPreview).toContain('Build your private Baseline once.');
    expect(socialPreview).not.toContain('Know yourself.');
    expect(socialPreview).not.toContain('Understand the system.');
  });

  it('invalidates the retired public shell without caching private workspace navigation', () => {
    expect(serviceWorker).toContain("const CACHE_NAME = 'sovereign-public-v14'");
    expect(serviceWorker).toContain("'/platform-public.css'");
    expect(serviceWorker).not.toContain("  '/app',");
    expect(serviceWorker).toContain("url.pathname.startsWith('/api/')");
    expect(serviceWorker).toContain("if (!PUBLIC_NAVIGATION.has(url.pathname)) return;");
  });
});