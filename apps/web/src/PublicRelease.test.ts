import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');

describe('public production release surfaces', () => {
  it('publishes canonical and controlled social metadata', () => {
    expect(index).toContain('rel="canonical" href="https://sovereign.defrag.app/"');
    for (const [page, canonical] of [[pricing, '/pricing.html'], [questions, '/faq.html'], [how, '/how-it-works.html']] as const) {
      expect(page).toContain(`rel="canonical" href="https://sovereign.defrag.app${canonical}"`);
      expect(page).toContain('og-sovereign.svg');
      expect(page).toContain('/static-release.css');
    }
  });

  it('keeps private routes out of crawl guidance', () => {
    for (const route of ['/app', '/login', '/signup', '/onboarding', '/auth/', '/invitation', '/consent.html', '/api/']) expect(robots).toContain(`Disallow: ${route}`);
    expect(sitemap).toContain('https://sovereign.defrag.app/how-it-works.html');
    expect(sitemap).not.toContain('/app');
  });

  it('uses a real interactive answer as the public focal point', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    expect(landing).toContain('<LivingSovereignAnswer />');
    expect(landing).toContain('EXAMPLE SOVEREIGN ANSWER');
    expect(landing).toContain('Sanitized demonstration · Not your Baseline');
    expect(landing).toContain('See what is supported, what is only possible, and what remains unknown.');
  });

  it('is responsive without depending on hover or motion', () => {
    expect(landingCss).toContain('@media (max-width: 760px)');
    expect(landingCss).toContain('@media (max-width: 440px)');
    expect(landingCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(landing).toContain('role="tablist"');
    expect(landing).toContain('role="tabpanel"');
  });
});
