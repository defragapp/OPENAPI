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
const baselineCss = readFileSync(new URL('./baseline-orbit.css', import.meta.url), 'utf8');
const refinementCss = readFileSync(new URL('./brand-landing-refinement.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const icon = readFileSync(new URL('../public/app-icon.svg', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('makes the product unmistakable in the first viewport', () => {
    expect(landing).toContain('Begin with how you work. See what life is asking of you.');
    expect(landing).toContain('Why this appears');
    expect(landing).toContain('PRESSURE CONCENTRATION');
    expect(landing).toContain('Sovereign.OS turns your Baseline Design into private, explorable intelligence for choices, relationships, families, and teams.');
    expect(landing).toContain('Start with how you process, communicate, connect, decide, and respond under pressure.');
    expect(landing).toContain('Build my Baseline');
    expect(index).toContain('Personal intelligence for real life');
    expect(index).toContain('Private personal, relationship, and system intelligence');
  });

  it('explains the complete Baseline-first platform in direct language', () => {
    for (const phrase of [
      'Baseline Design',
      'shadow and light',
      'alignment',
      'See where two people differ.',
      'See how the whole group works.',
      'Covenant'
    ]) expect(publicCopy).toContain(phrase);
    expect(publicCopy).not.toMatch(/healing journey|observatory|signal map|hidden motive revealed|diagnose the relationship/i);
  });

  it('keeps the landing concise and visually demonstrative', () => {
    expect((landing.match(/<section/g) ?? []).length).toBeLessThanOrEqual(7);
    for (const label of ['BASELINE DESIGN', 'BRING A REAL QUESTION', 'TWO PEOPLE · TWO BASELINES · ONE RELATIONSHIP']) {
      expect(landing).toContain(label);
    }
    expect(landing).toContain('Start with who you are. Expand only when the wider context matters.');
    expect(landing).toContain('<BaselineOrbit />');
    expect(landing).toContain('className="relationship-visual"');
    for (const selector of ['.baseline-orbit', '.orbit-node-core', '.orbit-node-aligned']) {
      expect(baselineCss).toContain(selector);
    }
    for (const selector of ['.relationship-visual', '.relationship-person', '.orbit-layer-key']) {
      expect(refinementCss).toContain(selector);
    }
  });

  it('uses accessible examples instead of unexplained decoration', () => {
    for (const phrase of [
      'role="tablist"',
      'role="tabpanel"',
      'aria-live="polite"',
      'onKeyDown',
      'ArrowLeft',
      'aria-selected',
      'Examples show possibilities, not verdicts'
    ]) expect(landing).toContain(phrase);
    for (const selector of ['.baseline-card', '.example-tabs', '.example-thread', '.example-sovereign']) {
      expect(landingCss).toContain(selector);
    }
  });

  it('uses one consistent, non-letterform brand mark', () => {
    expect(index).toContain('rel="icon" href="/app-icon.svg"');
    expect(index).toContain('rel="mask-icon" href="/safari-pinned-tab.svg"');
    expect(icon).toContain('A central point held by three open layers');
    expect(refinementCss).toContain("url('/brand-mark.svg')");
    expect(refinementCss).toContain('.landing-wordmark > span');
    expect(refinementCss).toContain('.intelligence-brand > span');
  });

  it('keeps pricing, privacy, permission, and authority explicit', () => {
    for (const phrase of ['$20', '$99', '10 Sovereign responses', '300 Sovereign responses', 'Stripe']) {
      expect(publicCopy).toContain(phrase);
    }
    for (const phrase of [
      'Raw birth',
      'permission',
      'cannot establish another person’s private motive',
      'Your experience remains authoritative'
    ]) expect(publicCopy).toContain(phrase);
    expect(policy).toContain('Private account export is not available at launch.');
    expect(landing).not.toContain('donate.stripe.com');
    expect(pricing).not.toContain('donate.stripe.com');
    expect(publicCopy).not.toMatch(/full account export|export features|Support the platform/i);
  });

  it('renders public React routes without runtime copy rewriting', () => {
    expect(main).toContain("location.pathname === '/'");
    expect(main).toContain('<PublicLanding />');
    expect(main).toContain('<PublicPolicy kind={publicPolicyKind} />');
    expect(main).toContain("import './brand-landing-refinement.css'");
    expect(main).not.toContain('ProductLanguageRuntime');
    expect(index).not.toContain('/public-site.js');
    expect(index).not.toContain('/intelligence-ui.js');
    expect(index).not.toContain('/ux-audit-runtime.js');
  });

  it('keeps static pages responsive and consent independently controlled', () => {
    for (const page of [how, pricing, faq]) {
      expect(page).toContain('/launch.css?v=20260726-platform-r2');
      expect(page).toContain('/launch-polish.css?v=20260726-final-r1');
    }
    expect(launchCss).toContain('@media (max-width: 680px)');
    expect(launchPolishCss).toContain('prefers-reduced-motion');
    expect(consent).toContain('You decide what another account may use.');
    expect(consent).toContain('The inviting account cannot make or change these decisions for you.');
    expect(consent).toContain('noindex,nofollow');
    expect(consentCss).toContain('@media (max-width: 680px)');
  });
});
