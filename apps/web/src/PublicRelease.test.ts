import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const slice = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const v0Css = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const releaseCss = readFileSync(new URL('./v0-single-example-release.css', import.meta.url), 'utf8');

describe('founder v0 public production release', () => {
  it('publishes canonical and controlled social metadata', () => {
    expect(index).toContain('rel="canonical" href="https://sovereign.defrag.app/"');
    expect(index).toContain('Healing isn’t optional. Holding onto the pain is.');
    for (const [page, canonical] of [[pricing, '/pricing'], [questions, '/faq'], [how, '/how-it-works']] as const) {
      expect(page).toContain(`rel="canonical" href="https://sovereign.defrag.app${canonical}"`);
      expect(page).toContain('og-sovereign.svg');
    }
  });

  it('keeps private routes out of crawl guidance', () => {
    for (const route of ['/app', '/login', '/signup', '/onboarding', '/auth/', '/invitation', '/consent.html', '/api/']) expect(robots).toContain(`Disallow: ${route}`);
    expect(sitemap).toContain('https://sovereign.defrag.app/how-it-works');
    expect(sitemap).not.toContain('.html');
    expect(sitemap).not.toContain('/app');
  });

  it('uses one interactive Expression Field as the public focal point', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v2"');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<CapabilitySummary />');
    expect(slice).toContain('landing-expression-slice__beam');
    expect(slice).toContain('role="button"');
    expect(slice).toContain('role="status"');
    expect(slice).toContain('See what is active before it repeats.');
    expect(slice).not.toContain('sphere');
    expect(landing).not.toContain('\nfunction PersonalStory(');
    expect(landing).not.toContain('\nfunction RelationshipStory(');
    expect(landing).not.toContain('\nfunction SystemStory(');
  });

  it('retains the founder hierarchy with single-example responsive behavior', () => {
    for (const selector of ['.v0-hero', '.v0-comparison-grid', '.v0-final']) {
      expect(v0Css).toContain(selector);
    }
    for (const selector of ['.landing-expression-slice', '.landing-expression-slice__beam', '.landing-expression-slice__tooltip', '.v0-capability-summary']) {
      expect(releaseCss).toContain(selector);
    }
    expect(releaseCss).toContain('@media (max-width: 760px)');
    expect(releaseCss).toContain('@media (max-width: 380px)');
    expect(releaseCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(slice).toContain('aria-label="An interactive field of eight Cloudflare-blue lines radiating from one stable point.');
    expect(slice).toContain('Illustrative Baseline');
    expect(landing).toContain('With permission, keep both people distinct');
  });
});
