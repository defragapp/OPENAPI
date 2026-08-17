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
const language = readFileSync(new URL('../../../docs/product-language-system.md', import.meta.url), 'utf8');
const field = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const v0Css = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const fieldCss = readFileSync(new URL('./landing-expression-field-v3.css', import.meta.url), 'utf8');
const integrationCss = readFileSync(new URL('./landing-expression-field-integration.css', import.meta.url), 'utf8');
const heroExtension = readFileSync(new URL('./landing-hero-field-v4.css', import.meta.url), 'utf8');
const storiesCss = readFileSync(new URL('./v0-restored-product-stories.css', import.meta.url), 'utf8');
const landingRefinement = readFileSync(new URL('./landing-refinement-v2.css', import.meta.url), 'utf8');
const landingRefinementV5 = readFileSync(new URL('./landing-live-refinement-v5.css', import.meta.url), 'utf8');

const retiredInterfacePhrases = [
  'Ask about your life. Get an answer built around you.',
  'What do you want to understand?',
  'Bring the question you already have.'
] as const;

describe('founder v0 public production release', () => {
  it('publishes category-first canonical and social metadata', () => {
    expect(index).toContain('rel="canonical" href="https://sovereign.defrag.app/"');
    expect(index).toContain('Sovereign.OS — Private personal AI for real life');
    expect(index).toContain('https://sovereign.defrag.app/og-sovereign.png');
    expect(index).not.toContain('og:title" content="Sovereign — Healing isn’t optional. Holding onto the pain is."');
    for (const [page, canonical] of [[pricing, '/pricing'], [questions, '/faq'], [how, '/how-it-works']] as const) {
      expect(page).toContain(`rel="canonical" href="https://sovereign.defrag.app${canonical}"`);
      expect(page).toContain('og-sovereign.png');
    }
  });

  it('keeps private routes out of crawl guidance', () => {
    for (const route of ['/app', '/login', '/signup', '/onboarding', '/auth/', '/invitation', '/consent.html', '/api/']) expect(robots).toContain(`Disallow: ${route}`);
    expect(sitemap).toContain('https://sovereign.defrag.app/how-it-works');
    expect(sitemap).not.toContain('/app');
  });

  it('uses the interactive 360 field as the opening product visual with intentional click-led inspection', () => {
    expect(landing).toContain('data-answer-contract="sovereign-answer.v2"');
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<BaselineFoundation />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('landing-expression-slice__tooltip-title');
    expect(field).toContain('landing-expression-slice__tooltip-value');
    expect(field).toContain('onPointerDown={handlePointerDown}');
    expect(field).toContain('onClick={(event) =>');
    expect(field).toContain('setHasInspection(true)');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(field).toContain('role="status"');
    expect(field).toContain('data-field-geometry="spherical-360"');
    expect(field).toContain('buildSphereGrid');
    expect(field).not.toContain('<div className="landing-expression-slice__tooltip"');
    expect(integrationCss).toContain('background: transparent');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
    expect(landingRefinementV5).toContain('width: 104px !important');
    expect(landingRefinementV5).toContain('height: 26px !important');
  });

  it('introduces Baseline Design before concrete questions and the three demonstrations', () => {
    expect(landing).toContain('One private reference beneath every question.');
    expect(landing).toContain('calculated astronomical positions and selected interpretive frameworks');
    expect(landing).toContain('What this unlocks');
    expect(landing).toContain('One private foundation. More useful answers across the questions that shape your life.');
    expect(landing).toContain('Why do we keep having the same argument even when we both want it to stop?');
    expect(landing).toContain('Should I stay in this job, ask for more, or leave?');
    expect(landing).toContain('<LandingProductStories />');
    expect(landing.indexOf('<BaselineFoundation />')).toBeLessThan(landing.indexOf('<RealLifeQuestions />'));
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
    for (const marker of [
      'Separate helping from carrying the outcome.',
      'Understand what happens between you.',
      'See where responsibility keeps landing.',
      'What your Baseline supports',
      'Keeping both people distinct',
      'What Sovereign separates',
      'surface="personal-chat"',
      'surface="relationship-chat"',
      'surface="system-map"'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('capacity beneath');
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
  });

  it('keeps retired chatbot and capacity-first phrasing out of active public language', () => {
    for (const phrase of retiredInterfacePhrases) {
      expect(landing).not.toContain(phrase);
      expect(stories).not.toContain(phrase);
      expect(how).not.toContain(phrase);
      expect(pricing).not.toContain(phrase);
      expect(questions).not.toContain(phrase);
    }
    expect(`${landing}\n${stories}\n${how}\n${questions}`).not.toContain('capacity beneath');
    expect(language).toContain('### Public translation rule');
    expect(language).toContain('## Retired and prohibited phrasing');
  });

  it('retains the founder hierarchy and responsive behavior while mobile proof is intentionally shorter', () => {
    for (const selector of ['.v0-hero', '.v0-comparison-grid', '.v0-final']) expect(v0Css).toContain(selector);
    for (const selector of ['.landing-expression-slice', '.landing-expression-slice__beam', '.landing-expression-slice__tooltip']) expect(fieldCss).toContain(selector);
    for (const selector of ['.landing-expression-slice__sphere-shell', '.landing-question-orbit__stage', '.landing-expression-slice__readout']) expect(heroExtension).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storiesCss).toContain(selector);
    expect(landingRefinement).toContain('scroll-snap-type: inline mandatory !important');
    expect(landingRefinement).toContain('.landing-demo--system-context');
    expect(landingRefinementV5).toContain('@keyframes sovereign-hero-rise');
    expect(landingRefinementV5).toContain('.landing-baseline-intro__heading');
    expect(landingRefinementV5).toContain('@media (max-width: 760px)');
    expect(landingRefinementV5).toContain('@media (prefers-reduced-motion: reduce)');
    expect(fieldCss).toContain('@media (max-width: 760px)');
    expect(heroExtension).toContain('@media (max-width: 760px)');
    expect(storiesCss).toContain('@media (max-width: 760px)');
    expect(storiesCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
