import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const field = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const v0Css = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const fieldCss = readFileSync(new URL('./landing-expression-field-v3.css', import.meta.url), 'utf8');
const integrationCss = readFileSync(new URL('./landing-expression-field-integration.css', import.meta.url), 'utf8');
const storiesCss = readFileSync(new URL('./v0-restored-product-stories.css', import.meta.url), 'utf8');

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
    expect(sitemap).not.toContain('/app');
  });

  it('uses the integrated field as the opening product visual', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('onPointerDown={handlePointerDown}');
    expect(field).toContain('role="status"');
    expect(field).not.toContain('sphere');
    expect(integrationCss).toContain('background: transparent');
  });

  it('restores the three chat and workflow demonstrations without field globes', () => {
    expect(landing).toContain('<LandingProductStories />');
    for (const marker of [
      'Ask about your life.',
      'Understand what happens',
      'From one person',
      'Reading your Baseline',
      'Keeping both people distinct',
      'Mapping the people',
      'surface="personal-chat"',
      'surface="relationship-chat"',
      'surface="system-map"'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
  });

  it('retains the founder hierarchy and responsive behavior', () => {
    for (const selector of ['.v0-hero', '.v0-comparison-grid', '.v0-final']) expect(v0Css).toContain(selector);
    for (const selector of ['.landing-expression-slice', '.landing-expression-slice__beam', '.landing-expression-slice__tooltip']) expect(fieldCss).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storiesCss).toContain(selector);
    expect(fieldCss).toContain('@media (max-width: 760px)');
    expect(storiesCss).toContain('@media (max-width: 760px)');
    expect(storiesCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
