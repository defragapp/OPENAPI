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

  it('keeps one semantic React wordmark without coupling navigation to a specific visual treatment', () => {
    expect(brand).toBe('import React from \'react\';\n\nexport function BrandMark() {\n  return <span className="brand-mark">SOVEREIGN.OS</span>;\n}\n');
    expect(landing).toContain('className="public-logo v0-wordmark v0-wordmark--desktop"');
    expect(landing).toContain('className="public-logo-mobile v0-wordmark v0-wordmark--mobile"');
  });
});
