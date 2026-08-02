import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const slice = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
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
const releaseCss = readFileSync(new URL('./v0-single-example-release.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('uses the approved hero and immediate field action in the first viewport', () => {
    expect(landing).toContain('Personal AI for real life');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Build my Baseline');
    expect(landing).toContain('Explore the field');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).not.toContain('Know yourself.');
  });

  it('presents the tightened public sequence in its intended order', () => {
    const renderStart = landing.indexOf('export function PublicLanding()');
    const renderEnd = landing.indexOf('function V0Navigation()', renderStart);
    const rendered = landing.slice(renderStart, renderEnd);
    const values = [
      '<V0Navigation />',
      '<V0Hero />',
      '<CapabilitySummary />',
      '<ComparisonStory />',
      '<FinalCallToAction />',
      '<V0Footer />'
    ];
    let previous = -1;
    for (const value of values) {
      const index = rendered.indexOf(value);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(landing).toContain('One place to understand what keeps happening.');
    expect(landing).toContain('Understand yourself');
    expect(landing).toContain('Understand a relationship');
    expect(landing).toContain('Understand a system');
    expect(landing).toContain('Other AI answers');
    expect(landing).toContain('everyone the same.');
    expect(landing).toContain('Your thoughts deserve');
    expect(landing).toContain('a better place to live.');
  });

  it('uses one interactive product demonstration instead of disconnected claims', () => {
    expect(landing).toContain("import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice'");
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v2"');
    expect(landing).toContain('data-viewport-surface="capability-summary"');
    expect(slice).toContain('LANDING_AXIS_LAYOUT');
    expect(slice).toContain('landing-expression-slice__beam');
    expect(slice).toContain('role="button"');
    expect(slice).toContain('role="status"');
    expect(slice).toContain('Hover, focus, or tap a line.');
    expect(slice).toContain('Why do I keep taking responsibility for everyone around me?');
  });

  it('keeps the illustrative field secondary, bounded, and permission-safe', () => {
    expect(slice).toContain('Illustrative Baseline');
    expect(slice).toContain('relative expression in a sanitized example');
    expect(slice).toContain('not a diagnosis, score, or claim about anyone’s internal state');
    expect(landing).toContain('With permission, keep both people distinct');
    expect(landing).toContain('permitted relationship or system information');
    expect(slice).not.toContain('compatibility score');
    expect(slice).not.toContain('private-thought');
  });

  it('keeps verified plans, correction, and optional Covenant available elsewhere in the real product', () => {
    for (const phrase of ['$0', '$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Covenant']) expect(publicCopy).toContain(phrase);
    expect(policy).toContain('Private account export is not available at launch.');
  });

  it('renders the public React route without runtime copy rewriting', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain("import './v0-visual-port.css';");
    expect(main).toContain("import './v0-single-example-release.css';");
    expect(main).not.toContain('ProductLanguageRuntime');
  });

  it('applies the founder visual system and single-example release layer', () => {
    for (const selector of ['.v0-landing-port', '.v0-hero', '.intelligence-workspace', '.intelligence-sidebar', '.sovereign-composer', '.account-shell', '.auth-panel']) {
      expect(v0Css).toContain(selector);
    }
    for (const selector of ['.landing-expression-slice', '.landing-expression-slice__beam', '.v0-capability-summary', '.v0-comparison-grid', '.v0-final']) {
      expect(releaseCss).toContain(selector);
    }
    expect(releaseCss).toContain('@media (max-width: 760px)');
    expect(releaseCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps support pages, consent, and fallback routes intact', () => {
    expect(how).toContain('Ask about your life. Get an answer built around you.');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(faq).toContain('Clear answers about what Sovereign does—and what remains yours.');
    expect(platformPublicCss).toContain('opacity: 1 !important');
    expect(staticExperienceCss).toContain('@media (max-width: 620px)');
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
    expect(notFound).toContain('content="noindex, nofollow"');
    expect(consent).toContain('You decide what another account may use.');
    expect(consent).toContain('The inviting account cannot make or change these decisions for you.');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});
