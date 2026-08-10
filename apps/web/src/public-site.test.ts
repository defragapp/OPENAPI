import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const field = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const consentCss = readFileSync(new URL('../public/consent.css', import.meta.url), 'utf8');
const staticExperienceCss = readFileSync(new URL('../public/static-experience.css', import.meta.url), 'utf8');
const platformPublicCss = readFileSync(new URL('../public/platform-public.css', import.meta.url), 'utf8');
const v0Css = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const storyCss = readFileSync(new URL('./v0-restored-product-stories.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${stories}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('keeps the approved hero and immediate interactive field', () => {
    expect(landing).toContain('Personal AI for real life');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Sovereign maps your Baseline, then translates what is happening within you, between people, and across the systems around you.');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(field).toContain('Drag to rotate');
    expect(field).toContain('landing-expression-slice__tooltip');
    expect(landing).not.toContain('Know yourself.');
  });

  it('presents the intended product sequence in order', () => {
    const rendered = landing.slice(landing.indexOf('export function PublicLanding()'), landing.indexOf('function V0Navigation()'));
    const values = ['<V0Navigation />', '<V0Hero />', '<LandingProductStories />', '<ComparisonStory />', '<FinalCallToAction />', '<V0Footer />'];
    let previous = -1;
    for (const value of values) {
      const index = rendered.indexOf(value);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(stories).toContain('Ask about your life.');
    expect(stories).toContain('Understand what happens');
    expect(stories).toContain('From one person');
    expect(landing).toContain('Other AI answers');
    expect(landing).toContain('Your thoughts deserve');
  });

  it('shows one visible reasoning flow plus relationship and system context', () => {
    for (const marker of [
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'Reading your Baseline',
      'Finding the pattern',
      'Keeping both people distinct',
      'Clarity may take time.',
      'Between you',
      'Mapping the people',
      'Movement'
    ]) expect(stories).toContain(marker);
    expect((stories.match(/<WorkflowPanel /g) ?? []).length).toBe(1);
    expect(stories).toContain("aria-current={index === visibleIndex ? 'step' : undefined}");
    expect(stories).toContain('<RelationshipContext />');
    expect(stories).toContain('<SystemContext />');
  });

  it('keeps relationship and system examples permission-safe, anonymous, and source-aware', () => {
    expect(stories).toContain('With permission, Sovereign keeps both people distinct');
    expect(stories).toContain('Each person controls what may be included');
    expect(stories).toContain('No compatibility score');
    expect(stories).toContain('<strong>Basis</strong>');
    expect(stories).not.toContain("name: 'Maya'");
    expect(stories).not.toContain("name: 'Noa'");
    expect(stories).not.toContain("name: 'Ruth'");
    expect(stories).not.toContain("code: 'Needs time'");
    expect(stories).not.toContain("code: 'Recognizes quickly'");
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
  });

  it('keeps verified plans, correction, and optional Covenant available elsewhere', () => {
    for (const phrase of ['$0', '$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Covenant']) expect(publicCopy).toContain(phrase);
    expect(policy).toContain('Private account export is not available at launch.');
  });

  it('renders the public route without runtime copy rewriting', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain("import './landing-expression-field-integration.css';");
    expect(main).toContain("import './v0-restored-product-stories.css';");
    expect(main).not.toContain('ProductLanguageRuntime');
  });

  it('applies the founder visual system and restored product authority', () => {
    for (const selector of ['.v0-landing-port', '.v0-hero', '.intelligence-workspace', '.sovereign-composer', '.account-shell', '.auth-panel']) expect(v0Css).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storyCss).toContain(selector);
    expect(storyCss).toContain('@media (max-width: 760px)');
    expect(storyCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps support pages, consent, and fallback routes intact', () => {
    expect(how).toContain('Ask about your life. Get an answer built around you.');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(faq).toContain('Clear answers about what Sovereign does—and what remains yours.');
    expect(platformPublicCss).toContain('opacity: 1 !important');
    expect(staticExperienceCss).toContain('@media (max-width: 620px)');
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
    expect(consent).toContain('You decide what another account may use.');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});