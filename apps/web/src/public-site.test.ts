import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landingScript = readFileSync(new URL('../public/public-site.js', import.meta.url), 'utf8');
const howItWorks = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const marketingCss = readFileSync(new URL('../public/marketing.css', import.meta.url), 'utf8');
const recognitionCss = readFileSync(new URL('../public/recognition-ui.css', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('public Sovereign.OS marketing experience', () => {
  it('positions Sovereign as Baseline-aware intelligence rather than incident-first chat', () => {
    for (const copy of [
      'An AI that already knows <em>where to begin.</em>',
      'Most AI waits for a prompt. Sovereign begins with a map.',
      'Stop starting from zero.',
      'Your life is not divided into separate apps.',
      'Live a life you would choose to watch again.'
    ]) expect(landingScript).toContain(copy);

    expect(landingScript).not.toMatch(/tell it what happened|describe what happened|what happened\?|start with what happened/i);
    expect(howItWorks).not.toMatch(/tell it what happened|describe what happened|what happened\?|start with what happened/i);
  });

  it('markets outputs and living context while keeping frameworks secondary', () => {
    for (const copy of [
      'Baseline Design',
      'what is active now',
      'consented relationships',
      'systems',
      'saved understanding',
      'clear human guidance'
    ]) expect(`${landingScript}\n${howItWorks}`).toContain(copy);

    expect(landingScript).toContain('The systems remain in the');
    expect(howItWorks).toContain('Transparency without turning the product into a chart.');
  });

  it('explains privacy, consent, uncertainty, and optional continuity without certainty claims', () => {
    for (const copy of [
      'Permission comes before comparison.',
      'Nothing enters the Library unless you approve it.',
      'Current conditions are treated as possible amplification—not destiny or proof.',
      'The system never claims your exact state—or another person’s—without confirmation.'
    ]) expect(howItWorks).toContain(copy);

    expect(`${landingScript}\n${howItWorks}`).not.toMatch(/secretly thinks|unlock your destiny|we diagnose|proves? what another person thinks/i);
  });

  it('loads the real marketing surface without changing the authenticated app shell', () => {
    expect(index).toContain('/public-site.js');
    expect(index).toContain('/recognition-ui.css');
    expect(landingScript).toContain("location.pathname !== '/'");
    expect(landingScript).toContain("shell.className = 'marketing-page marketing-home'");
    expect(landingScript).toContain("link.href = '/marketing.css'");
    expect(landingScript).toContain("/how-it-works.html");
  });

  it('uses one conceptual visual system with readable mobile behavior', () => {
    for (const selector of [
      '.signal-orbit',
      '.intelligence-layout',
      '.lens-grid',
      '.comparison',
      '@media (max-width:700px)'
    ]) expect(marketingCss).toContain(selector);

    expect(marketingCss).toContain('.marketing-nav-links a:not(.nav-cta)');
    expect(marketingCss).toContain('display:none');
    expect(marketingCss).toContain('min-height:44px');
    expect(marketingCss).toContain('prefers-reduced-motion');
  });

  it('keeps optional exact-data consent readable and explicit', () => {
    expect(recognitionCss).toContain('.scope-list > label');
    expect(recognitionCss).toContain('min-height: 58px');
    expect(recognitionCss).toContain('width: 24px');
    expect(recognitionCss).toContain('[data-recognition-module-offer]');
  });

  it('keeps the highest-value entry actions clear', () => {
    expect(landingScript).toContain('Build my Baseline');
    expect(landingScript).toContain('Enter Sovereign');
    expect(landingScript).toContain('See the intelligence');
    expect(howItWorks).toContain('Create my Baseline');
  });
});
