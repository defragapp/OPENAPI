import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const v0Css = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');

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

  it('uses the v0 self, relationship, and system demonstrations as the public focal point', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    expect(landing).toContain('<PersonalStory />');
    expect(landing).toContain('<RelationshipStory />');
    expect(landing).toContain('<SystemStory />');
    expect(landing).toContain('Step 01 · You');
    expect(landing).toContain('Step 02 · You + 1');
    expect(landing).toContain('Step 03 · Your whole system');
    expect(landing).toContain('How Sovereign works it through');
    expect(landing).toContain('How Sovereign reads both of you');
    expect(landing).toContain('className="v0-family-map"');
  });

  it('retains archive-specific visual hierarchy and responsive behavior', () => {
    for (const selector of ['.v0-hero', '.v0-question-band', '.v0-story-grid', '.v0-window', '.v0-flow', '.v0-family-map', '.v0-comparison-grid', '.v0-final']) {
      expect(v0Css).toContain(selector);
    }
    expect(v0Css).toContain('@media (max-width: 760px)');
    expect(v0Css).toContain('@media (max-width: 430px)');
    expect(v0Css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(landing).toContain('aria-label="Illustrative family system map"');
    expect(landing).toContain('Illustrative permitted Baselines');
    expect(landing).toContain('Each person controls what may be included');
  });
});
