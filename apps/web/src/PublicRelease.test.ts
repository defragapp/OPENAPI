import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const productCss = readFileSync(new URL('./sovereign-product-v2.css', import.meta.url), 'utf8');
const precisionCss = readFileSync(new URL('./sovereign-product-precision.css', import.meta.url), 'utf8');

 describe('public production release surfaces', () => {
  it('publishes canonical and controlled social metadata', () => {
    expect(index).toContain('rel="canonical" href="https://sovereign.defrag.app/"');
    expect(index).toContain('Private personal, relationship, and system intelligence');
    for (const [page, canonical] of [[pricing, '/pricing'], [questions, '/faq'], [how, '/how-it-works']] as const) {
      expect(page).toContain(`rel="canonical" href="https://sovereign.defrag.app${canonical}"`);
      expect(page).toContain('og-sovereign.svg');
      expect(page).toContain('/static-release.css?v=20260730-cohesion');
      expect(page).toContain('/sovereign-product-precision.css?v=20260730-precision');
    }
  });

  it('keeps private routes out of crawl guidance', () => {
    for (const route of ['/app', '/login', '/signup', '/onboarding', '/auth/', '/invitation', '/consent.html', '/api/']) expect(robots).toContain(`Disallow: ${route}`);
    expect(sitemap).toContain('https://sovereign.defrag.app/how-it-works');
    expect(sitemap).not.toContain('.html');
    expect(sitemap).not.toContain('/app');
  });

  it('uses a real interactive answer as the public focal point', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    expect(landing).toContain('<PublicAnswerStage');
    expect(landing).toContain('<PermissionField />');
    expect(landing).toContain('<SystemMap />');
    expect(landing).toContain('Sanitized demonstration · Not your Baseline');
    expect(landing).toContain('Your ability to create direction is real. The problem begins when responsibility reaches you without matching authority.');
    expect(landing).toContain('The useful explanation stays primary while exact Basis remains available underneath it.');
  });

  it('is responsive without depending on hover, serif display fonts, or motion', () => {
    expect(productCss).toContain('@media(max-width:760px)');
    expect(precisionCss).toContain('@media(max-width:760px)');
    expect(precisionCss).toContain('@media(prefers-reduced-motion:reduce)');
    expect(precisionCss).toContain('--precision-display');
    expect(precisionCss).not.toContain('Iowan Old Style');
    expect(landing).toContain('role="tablist"');
    expect(landing).toContain('role="tabpanel"');
    expect(landing).toContain('aria-live="polite"');
  });
});
