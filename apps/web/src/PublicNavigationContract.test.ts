import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const landing = read('./PublicLanding.tsx');
const policy = read('./PublicPolicy.tsx');
const staticPages = [
  read('../public/how-it-works.html'),
  read('../public/pricing.html'),
  read('../public/faq.html')
];
const visualAuthority = read('./production-visual-authority-v1.css');
const staticAuthority = read('../public/premium-action-static-v1.css');
const brand = read('./BrandMark.tsx');

const publicDestinations = ['/how-it-works', '/pricing', '/faq', '/login', '/signup'] as const;

describe('public navigation and brand contract', () => {
  it('gives the root landing complete route-level navigation on desktop and mobile', () => {
    for (const href of publicDestinations) {
      expect(landing).toContain(`href="${href}"`);
    }
    expect(landing).not.toContain('<a href="#how">How it works</a>');
    expect(landing).toContain('aria-label="Sovereign.OS home"><BrandMark /></a>');
  });

  it('keeps every standalone public page connected to the same destinations', () => {
    for (const document of staticPages) {
      expect(document).toContain('href="/"');
      for (const href of publicDestinations) {
        expect(document).toContain(`href="${href}"`);
      }
      expect(document).toContain('>SOVEREIGN.OS</a>');
    }
  });

  it('uses the same BrandMark and complete exits on Privacy and Terms', () => {
    expect((policy.match(/<BrandMark \/>/g) ?? []).length).toBeGreaterThanOrEqual(3);
    for (const href of publicDestinations) {
      expect(policy).toContain(`href="${href}"`);
    }
    expect(policy).not.toContain('aria-label="Sovereign.OS home">Sovereign</a>');
  });

  it('centralizes React brand geometry instead of hard-coding it in the component', () => {
    expect(brand).toBe('import React from \'react\';\n\nexport function BrandMark() {\n  return <span className="brand-mark">SOVEREIGN.OS</span>;\n}\n');
    expect(visualAuthority).toContain('font-size: 0.75rem !important');
    expect(visualAuthority).toContain('font-weight: 720 !important');
    expect(visualAuthority).toContain('letter-spacing: 0.17em !important');
    expect(visualAuthority).toContain('min-height: 64px !important');
  });

  it('allows exactly one visible React wordmark per breakpoint', () => {
    expect(visualAuthority).toContain('.public-approved-v8 .v0-wordmark--desktop,');
    expect(visualAuthority).toContain('.public-secondary-page .v0-wordmark--desktop {\n  display: inline-flex !important;');
    expect(visualAuthority).toContain('.public-approved-v8 .v0-wordmark--mobile,');
    expect(visualAuthority).toContain('.public-secondary-page .v0-wordmark--mobile {\n  display: none !important;');
    expect(visualAuthority).toContain('@media (max-width: 760px)');
    expect(visualAuthority).toContain('.public-secondary-page .v0-wordmark--desktop { display: none !important; }');
    expect(visualAuthority).toContain('.public-secondary-page .v0-wordmark--mobile { display: inline-flex !important; }');
  });

  it('uses the same wordmark geometry on standalone public routes', () => {
    expect(staticAuthority).toContain('font-size: 0.75rem !important');
    expect(staticAuthority).toContain('font-weight: 720 !important');
    expect(staticAuthority).toContain('letter-spacing: 0.17em !important');
    expect(staticAuthority).toContain('min-height: 64px !important');
  });
});