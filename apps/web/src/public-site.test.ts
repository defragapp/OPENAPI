import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const consentCss = readFileSync(new URL('../public/consent.css', import.meta.url), 'utf8');
const launchCss = readFileSync(new URL('../public/launch.css', import.meta.url), 'utf8');
const launchPolishCss = readFileSync(new URL('../public/launch-polish.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('makes the product and a paid-value answer unmistakable in the first viewport', () => {
    expect(landing).toContain('PRIVATE AI, BUILT AROUND YOUR BASELINE');
    expect(landing).toContain('Know yourself.');
    expect(landing).toContain('Understand the system.');
    expect(landing).toContain('Choose what fits.');
    expect(landing).toContain('The resentment often arrives later');
    expect(landing).toContain('Build my Baseline');
  });

  it('explains the complete Baseline-first platform in direct language', () => {
    for (const phrase of ['Baseline Design', 'Shadow', 'Gift', 'Alignment', 'TWO PEOPLE · TWO BASELINES · ONE INTERACTION', 'SEE THE WHOLE SYSTEM', 'Covenant']) {
      expect(publicCopy).toContain(phrase);
    }
    expect(publicCopy).not.toMatch(/healing journey|hidden motive revealed|diagnose the relationship/i);
  });

  it('uses interactive product structures instead of a grid of marketing claims', () => {
    expect(landing).toContain('<LivingSovereignAnswer />');
    expect(landing).toContain('<PublicAnswerStage');
    expect(landing).toContain('<SystemMap />');
    expect(landing).toContain('role="tablist"');
    expect(landing).toContain('role="tabpanel"');
    expect(landing).toContain('aria-live="polite"');
  });

  it('uses exact data-only Basis fixtures', () => {
    expect(landing).toContain('Sanitized demonstration fixture');
    for (const value of ['HD G13.1', 'GK ACT13', 'N LP1', '☉ CAN 04.2°']) expect(landing).toContain(value);
    expect(landing).toContain('Exact source details');
    expect(landing).not.toContain('pressure concentrates with you');
  });

  it('keeps verified prices, permission, and limits explicit', () => {
    for (const phrase of ['$20', '$99', '10 Sovereign AI turns', '300 Sovereign AI turns', 'Stripe']) expect(publicCopy).toContain(phrase);
    expect(landing).toContain('No compatibility score. No mind-reading.');
    expect(faq).toContain('It cannot know another person’s exact feelings, motives, private experience, or future behavior.');
    expect(policy).toContain('Private account export is not available at launch.');
  });

  it('renders public React routes without runtime copy rewriting', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain('<PublicPolicy kind={publicPolicyKind} />');
    expect(main).not.toContain('ProductLanguageRuntime');
    expect(main).not.toMatch(/refinement|landing-v2/i);
  });

  it('keeps static pages responsive and consent independently controlled', () => {
    for (const page of [how, pricing, faq]) {
      expect(page).toContain('/launch.css?v=20260728-baseline-first');
      expect(page).toContain('/launch-polish.css?v=20260728-baseline-first');
    }
    expect(launchCss).toContain('@media (max-width: 680px)');
    expect(launchPolishCss).toContain('prefers-reduced-motion');
    expect(landingCss).toContain('@media (max-width: 760px)');
    expect(consent).toContain('You decide what another account may use.');
    expect(consent).toContain('The inviting account cannot make or change these decisions for you.');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});
