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
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const publicCopy = `${landing}\n${policy}\n${how}\n${pricing}\n${faq}\n${consent}`;

describe('Sovereign.OS public experience', () => {
  it('makes the product unmistakable in the first viewport', () => {
    expect(landing).toContain('Understand yourself—and everyone your life includes.');
    expect(landing).toContain('Sovereign.OS turns your Baseline Design into a private AI for personal, relationship, and system intelligence.');
    expect(landing).toContain('Baseline Design is your personal starting point: an explorable view of your qualities, needs, strengths, shadow and light, and alignment.');
    expect(landing).toContain('Start free');
    expect(index).toContain('Sovereign.OS turns Baseline Design into a private AI');
    expect(index).toContain('Personal, relationship, and system intelligence');
  });

  it('explains the complete Baseline-first platform in direct language', () => {
    for (const phrase of [
      'Baseline Design',
      'shadow and light',
      'alignment',
      'See the relationship from both sides',
      'Understand how the whole group functions',
      'Covenant'
    ]) expect(publicCopy).toContain(phrase);
    expect(publicCopy).not.toMatch(/healing journey|observatory|signal map|hidden motive revealed|diagnose the relationship/i);
  });

  it('keeps the landing concise and visually demonstrative', () => {
    expect((landing.match(/<section/g) ?? []).length).toBeLessThanOrEqual(7);
    for (const label of ['BASELINE DESIGN', 'APPLY IT ANYWHERE', 'RELATIONSHIPS · FAMILIES · TEAMS']) {
      expect(landing).toContain(label);
    }
    expect(landing).toContain('Start with you. Expand when the wider system matters.');
    expect(landing).toContain('<BaselineOrbit />');
    for (const selector of ['.baseline-orbit', '.orbit-node-core', '.orbit-node-aligned']) {
      expect(baselineCss).toContain(selector);
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
