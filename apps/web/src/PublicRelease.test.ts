import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const robots = readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const securityTxt = readFileSync(new URL('../public/.well-known/security.txt', import.meta.url), 'utf8');
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
const intelligenceDemoCss = readFileSync(new URL('./public-intelligence-demonstration-v1.css', import.meta.url), 'utf8');
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
  'See where responsibility keeps landing.',
  'Understand both sides and what happens between you.',
  'Ordinary questions. More context when it belongs.'
] as const;

describe('public production positioning release', () => {
  it('publishes category-first canonical and social metadata', () => {
    expect(index).toContain('rel="canonical" href="https://sovereign.defrag.app/"');
    expect(index).toContain('Sovereign.OS — Private personal AI for real life');
    expect(index).toContain('https://sovereign.defrag.app/og-sovereign.png');
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

  it('publishes one deterministic vulnerability-reporting contact', () => {
    expect(securityTxt).toContain('Contact: mailto:info@defrag.app');
    expect(securityTxt).toContain('Canonical: https://sovereign.defrag.app/.well-known/security.txt');
    expect(securityTxt).toContain('Preferred-Languages: en');
    expect(securityTxt).toMatch(/Expires: 20\d{2}-\d{2}-\d{2}T00:00:00Z/);
    expect(securityTxt).not.toMatch(/token|secret|password/i);
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
    expect(integrationCss).toContain('background: transparent');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
  });

  it('introduces self exploration before People and Systems with recognizable high-value questions', () => {
    for (const marker of [
      'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',
      'How do I make decisions that actually fit me?',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      'How does pressure move through this team?',
      '<LandingProductStories />',
      'Sovereign starts',
      'Know yourself. Understand your people. See the whole system.'
    ]) expect(landing).toContain(marker);

    for (const marker of [
      '01 · You',
      'Explore how you think, decide, communicate, create, connect, and grow.',
      '02 · You + your people',
      'See why the same moment lands differently',
      '03 · From 1:1 to the whole system',
      'See the whole system.',
      'How Sovereign compares two people',
      'How Sovereign reads a system',
      'Show what happens between you',
      'Show how pressure moves',
      'What you can change'
    ]) expect(stories).toContain(marker);

    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
    expect(stories).not.toContain('LandingExpressionFieldPreview');
  });

  it('keeps framework mechanics off the root narrative and source codes collapsed behind inspection', () => {
    expect(landing).not.toContain('calculated astronomical positions');
    expect(landing).not.toContain('partial Human Design');
    expect(landing).not.toContain('Gene Keys activations');
    expect(landing).not.toContain('numerology');
    expect(how).toContain('Where Baseline Design comes from');
    expect(how).toContain('calculated astronomical data with selected interpretive frameworks');
    expect(how).toContain('<summary>See source details</summary>');
    expect(how).not.toContain('HD G13.1 · GK ACT13 · ☉ CAN 04.2°');
    expect(how).not.toContain('EXAMPLE BASIS');
    expect(stories).toContain('<details className="landing-evidence">');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(questions).toContain('Which frameworks are included?');
    expect(questions).toContain('partial Human Design and Gene Keys activations');
    expect(questions).toContain('Can I see what information Sovereign used for an answer?');
    expect(questions).toContain('Do those source details prove the interpretation is true?');
    expect(questions).not.toContain('What is Basis?');
    expect(questions).not.toContain('What does Basis prove?');
  });

  it('keeps internal implementation vocabulary out of active public surfaces', () => {
    const publicSource = `${landing}\n${stories}\n${how}\n${questions}\n${pricing}`;
    for (const phrase of retiredInterfacePhrases) expect(publicSource).not.toContain(phrase);
    for (const phrase of ['Example Basis', 'server-approved', 'authorized references', 'permitted context', 'consented people', 'permitted perspectives', 'confirmed responsibilities']) {
      expect(publicSource).not.toContain(phrase);
    }
    expect(publicSource.toLowerCase()).not.toContain('example basis');
    expect(language).toContain('### 1. You');
    expect(language).toContain('### 2. You + your people');
    expect(language).toContain('### 3. From 1:1 to the whole system');
    expect(language).toContain('## Retired and prohibited phrasing');
    expect(language).toContain('`Understand both sides and what happens between you.`;');
    expect(language).toContain('`What is Basis?`;');
  });

  it('renders headings through the canonical Geist Sans title authority', () => {
    expect(typography).not.toContain('font-family: "Sovereign Display"');
    expect(typography).not.toContain('/fonts/sovereign-display.woff2');
    expect(typography).toContain('--font-display: var(--font-title);');
    expect(typography).toContain("\"Geist Sans\",");
    expect(typography).toContain('-apple-system');
    expect(typography).toContain('"SF Pro Display"');
    expect(sansAuthority).toContain("\"Geist Sans\",");
    expect(sansAuthority).toContain('font-family: var(--font-title) !important');
    expect(sansAuthority).not.toContain('\n    Optima,');
    expect(sansAuthority).not.toContain('\n    "Avenir Next",');
    expect(landingRefinementV5).not.toContain('var(--font-display, Georgia, serif)');
    expect(landingRefinementV5).toContain('One typeface. Hierarchy comes from weight, scale, and opacity.');
  });

  it('puts workflow before the conversation and anchors the composer below the answer surface', () => {
    expect(stories.indexOf('surface="personal-reasoning"')).toBeLessThan(stories.indexOf('surface="personal-chat"'));
    expect(stories.indexOf('surface="relationship-reasoning"')).toBeLessThan(stories.indexOf('surface="relationship-chat"'));
    expect(stories.indexOf('surface="system-reasoning"')).toBeLessThan(stories.indexOf('surface="system-map"'));
    expect(stories).toContain('landing-demo__composer-shell');
    expect(intelligenceDemoCss).toContain('.landing-demo__composer-shell');
    expect(intelligenceDemoCss).toContain('grid-template-columns: minmax(320px, .88fr) minmax(0, 1.12fr) !important;');
    expect(intelligenceDemoCss).toContain('@media (max-width: 900px)');
  });

  it('retains the founder composition and responsive behavior while removing the dead root Baseline intro', () => {
    for (const selector of ['.v0-hero', '.v0-comparison-grid', '.v0-final']) expect(v0Css).toContain(selector);
    for (const selector of ['.landing-expression-slice', '.landing-expression-slice__beam', '.landing-expression-slice__tooltip']) expect(fieldCss).toContain(selector);
    for (const selector of ['.landing-expression-slice__sphere-shell', '.landing-question-orbit__stage', '.landing-expression-slice__readout']) expect(heroExtension).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storiesCss).toContain(selector);
    expect(landingRefinement).toContain('scroll-snap-type: inline mandatory !important');
    expect(landingRefinementV5).toContain('@keyframes sovereign-hero-rise');
    expect(landingRefinementV5).not.toContain('.landing-baseline-intro');
    expect(landingRefinementV5).toContain('@media (max-width: 760px)');
    expect(landingRefinementV5).toContain('@media (prefers-reduced-motion: reduce)');
    expect(intelligenceDemoCss).toContain('@media (max-width: 760px)');
    expect(fieldCss).toContain('@media (max-width: 760px)');
    expect(heroExtension).toContain('@media (max-width: 760px)');
    expect(storiesCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});