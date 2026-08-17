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
const typography = readFileSync(new URL('./typography-system.css', import.meta.url), 'utf8');
const sansAuthority = readFileSync(new URL('./sans-typography-authority-v1.css', import.meta.url), 'utf8');

const retiredInterfacePhrases = [
  'Ask about your life. Get an answer built around you.',
  'What do you want to understand?',
  'Bring the question you already have.',
  'One private reference beneath every question.',
  'One private foundation. More useful answers across the questions that shape your life.',
  'Separate helping from carrying the outcome.',
  'See where responsibility keeps landing.'
] as const;

describe('public production positioning release', () => {
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
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).not.toContain('<BaselineFoundation />');
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

  it('introduces self exploration before People and Systems', () => {
    for (const marker of [
      'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',
      'Start with you',
      'Explore yourself.',
      'What does Alignment look like for me?',
      'How do I express myself when I’m clear?',
      'How do I create best?',
      '<LandingProductStories />',
      'Most AI starts with the prompt. Sovereign starts with you.',
      'Know yourself. Understand your people. See the whole system.'
    ]) expect(landing).toContain(marker);

    for (const marker of [
      '01 · You',
      'Explore how you think, decide, create, connect, and grow.',
      'What does Alignment look like for me when I’m creating something new?',
      '02 · You + your people',
      'Understand what happens between you.',
      '03 · From 1:1 to the whole system',
      'See the whole system.',
      'Roles',
      'Authority + expectations',
      'Missing perspective'
    ]) expect(stories).toContain(marker);

    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
    expect(stories).not.toContain('capacity beneath');
    expect(stories).not.toContain('LandingExpressionFieldPreview');
  });

  it('keeps framework mechanics off the root narrative while preserving deeper disclosure', () => {
    expect(landing).not.toContain('calculated astronomical positions');
    expect(landing).not.toContain('partial Human Design');
    expect(landing).not.toContain('Gene Keys activations');
    expect(landing).not.toContain('numerology');
    expect(how).toContain('Where Baseline Design comes from');
    expect(how).toContain('calculated astronomical data with selected interpretive frameworks');
    expect(questions).toContain('Which frameworks are included?');
    expect(questions).toContain('partial Human Design and Gene Keys activations');
  });

  it('keeps retired public positioning out of active public surfaces', () => {
    for (const phrase of retiredInterfacePhrases) {
      expect(landing).not.toContain(phrase);
      expect(stories).not.toContain(phrase);
    }
    expect(`${landing}\n${stories}\n${how}\n${questions}`).not.toContain('capacity beneath');
    expect(language).toContain('### 1. You');
    expect(language).toContain('### 2. You + your people');
    expect(language).toContain('### 3. From 1:1 to the whole system');
    expect(language).toContain('## Retired and prohibited phrasing');
  });

  it('renders headings through the sans authority, never the retired display face', () => {
    expect(typography).not.toContain('font-family: "Sovereign Display"');
    expect(typography).not.toContain('/fonts/sovereign-display.woff2');
    expect(typography).toContain('--font-display: var(--font-title);');
    expect(sansAuthority).toContain('The retired display serif must not render anywhere in the active product.');
    expect(landingRefinementV5).not.toContain('var(--font-display, Georgia, serif)');
    expect(landingRefinementV5).toContain('One typeface. Hierarchy comes from weight, scale, and opacity.');
  });

  it('retains the founder composition and responsive behavior while removing the dead root Baseline intro', () => {
    for (const selector of ['.v0-hero', '.v0-comparison-grid', '.v0-final']) expect(v0Css).toContain(selector);
    for (const selector of ['.landing-expression-slice', '.landing-expression-slice__beam', '.landing-expression-slice__tooltip']) expect(fieldCss).toContain(selector);
    for (const selector of ['.landing-expression-slice__sphere-shell', '.landing-question-orbit__stage', '.landing-expression-slice__readout']) expect(heroExtension).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storiesCss).toContain(selector);
    expect(landingRefinement).toContain('scroll-snap-type: inline mandatory !important');
    expect(landingRefinement).toContain('.landing-demo--system-context');
    expect(landingRefinementV5).toContain('@keyframes sovereign-hero-rise');
    expect(landingRefinementV5).not.toContain('.landing-baseline-intro');
    expect(landingRefinementV5).toContain('@media (max-width: 760px)');
    expect(landingRefinementV5).toContain('@media (prefers-reduced-motion: reduce)');
    expect(fieldCss).toContain('@media (max-width: 760px)');
    expect(heroExtension).toContain('@media (max-width: 760px)');
    expect(storiesCss).toContain('@media (max-width: 760px)');
    expect(storiesCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
