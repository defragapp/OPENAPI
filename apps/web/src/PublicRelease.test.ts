import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const staticCss = readFileSync(new URL('../public/static-release.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-release.css', import.meta.url), 'utf8');
const brandCss = readFileSync(new URL('./sovereign-brand.css', import.meta.url), 'utf8');

describe('public production release surfaces', () => {
  it('publishes canonical and controlled social metadata', () => {
    expect(index).toContain('rel="canonical" href="https://sovereign.defrag.app/"');
    expect(index).toContain('og-sovereign.svg');
    expect(index).toContain('twitter:card');
    for (const [page, canonical] of [[pricing, '/pricing.html'], [questions, '/faq.html'], [how, '/how-it-works.html']] as const) {
      expect(page).toContain(`rel="canonical" href="https://sovereign.defrag.app${canonical}"`);
      expect(page).toContain('og-sovereign.svg');
      expect(page).toContain('/static-release.css');
    }
  });

  it('keeps private account, auth, invitation, consent, and API routes out of crawl guidance', () => {
    for (const route of ['/app', '/login', '/signup', '/onboarding', '/auth/', '/invitation', '/consent.html', '/api/']) expect(robots).toContain(`Disallow: ${route}`);
    expect(robots).toContain('Sitemap: https://sovereign.defrag.app/sitemap.xml');
    expect(sitemap).toContain('https://sovereign.defrag.app/how-it-works.html');
    expect(sitemap).not.toContain('/app');
  });

  it('keeps every mobile public destination visible without a hidden horizontal scroller', () => {
    expect(landingCss).toContain('repeat(auto-fit, minmax(78px, 1fr))');
    expect(landingCss).toContain('.landing-nav nav a:not(.landing-nav-cta)');
    expect(landingCss).not.toContain('overflow-x: auto');
    expect(staticCss).toContain('repeat(auto-fit, minmax(78px, 1fr))');
    expect(staticCss).toContain('.launch-links a:not(.launch-cta)');
    expect(staticCss).not.toContain('overflow-x: auto');
  });

  it('labels authenticated mobile navigation as a menu instead of an unexplained mark', () => {
    expect(brandCss).toContain('content: "Menu"');
    expect(brandCss).toContain('min-width: 86px');
    expect(brandCss).toContain('min-height');
  });

  it('uses the orbit-derived mark consistently', () => {
    expect(brandCss).toContain('.landing-wordmark > span::before');
    expect(brandCss).toContain('.intelligence-brand > span::before');
    expect(brandCss).toContain('.response-mark::before');
    expect(brandCss).toContain('.account-control-trigger::before');
  });
});
