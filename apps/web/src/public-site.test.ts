import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
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
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('uses the supplied v0 hero and action in the first viewport', () => {
    expect(landing).toContain('Personal AI for real life');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Build my Baseline');
    expect(landing).toContain('See a Sovereign answer');
    expect(landing).not.toContain('Know yourself.');
  });

  it('presents the v0 story sequence in its intended order', () => {
    const values = [
      '<RotatingQuestions />',
      '<PersonalStory />',
      '<RelationshipStory />',
      '<SystemStory />',
      '<ComparisonStory />',
      '<FinalCallToAction />'
    ];
    let previous = -1;
    for (const value of values) {
      const index = landing.indexOf(value);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(landing).toContain('Ask about your life.');
    expect(landing).toContain('Get an answer built for you.');
    expect(landing).toContain('See the space');
    expect(landing).toContain('between you.');
    expect(landing).toContain('From one person');
    expect(landing).toContain('to the whole system.');
    expect(landing).toContain('Other AI answers');
    expect(landing).toContain('everyone the same.');
    expect(landing).toContain('Your thoughts deserve');
    expect(landing).toContain('a better place to live.');
  });

  it('uses the v0 product demonstrations instead of disconnected marketing claims', () => {
    for (const marker of ['className="v0-story-grid"', 'className="v0-baseline-trace"', 'className="v0-flow"', 'className="v0-family-map"', 'className="v0-comparison-grid"']) {
      expect(landing).toContain(marker);
    }
    expect(landing).toContain('Why do I keep taking on responsibility for everyone around me?');
    expect(landing).toContain('Why does the same conversation land so differently for me and Maya?');
    expect(landing).toContain('Can you map my whole family?');
  });

  it('keeps exact Basis fixtures secondary and permission-safe', () => {
    for (const value of ['SUN · LEO', 'GK 13.4', 'GATE 4.11', 'MARS · CANCER', 'AUTH · EMO', 'AUTH · SPLENIC']) expect(landing).toContain(value);
    expect(landing).toContain('Grounded in');
    expect(landing).toContain('Illustrative permitted Baselines');
    expect(landing).toContain('No compatibility score');
    expect(landing).toContain('No private-thought claims');
    expect(landing).toContain('Each person controls what may be included');
  });

  it('keeps verified plans, correction, and optional Covenant available elsewhere in the real product', () => {
    for (const phrase of ['$0', '$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Covenant']) expect(publicCopy).toContain(phrase);
    expect(policy).toContain('Private account export is not available at launch.');
  });

  it('renders the public React route without runtime copy rewriting', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain("import './v0-visual-port.css';");
    expect(main).not.toContain('ProductLanguageRuntime');
  });

  it('applies the v0 visual system to public and authenticated surfaces', () => {
    for (const selector of ['.v0-landing-port', '.v0-hero', '.v0-window', '.intelligence-workspace', '.intelligence-sidebar', '.sovereign-composer', '.account-shell', '.auth-panel']) {
      expect(v0Css).toContain(selector);
    }
    expect(v0Css).toContain('@media (max-width: 760px)');
    expect(v0Css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps support pages, consent, and fallback routes intact', () => {
    expect(how).toContain('Set up your Baseline once. Use it wherever life connects.');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(faq).toContain('What Sovereign understands. What remains yours to confirm.');
    expect(platformPublicCss).toContain('opacity: 1 !important');
    expect(staticExperienceCss).toContain('@media (max-width: 620px)');
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
    expect(notFound).toContain('content="noindex, nofollow"');
    expect(consent).toContain('You decide what another account may use.');
    expect(consent).toContain('The inviting account cannot make or change these decisions for you.');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});
