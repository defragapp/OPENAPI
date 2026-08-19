import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const typography = read('./typography-system.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const productCohesion = read('./production-product-cohesion-v1.css');
const intelligenceDemo = read('./public-intelligence-demonstration-v1.css');
const visualAuthority = read('./production-visual-authority-v1.css');
const seniorAuthority = read('./senior-design-system-v1.css');
const demoV2 = read('./public-intelligence-demonstration-v2.css');
const launchPolish = read('./launch-polish-final-v1.css');
const stories = read('./LandingProductStories.tsx');
const publicPolicy = read('./PublicPolicy.tsx');
const staticAuthority = read('../public/premium-action-static-v1.css');

describe('production visual authority v1', () => {
  it('orders production, senior, demo, then terminal cross-route launch polish', () => {
    expect(main).toContain("import seniorDesignSystemCss from './senior-design-system-v1.css?inline';");
    expect(main).toContain("import publicIntelligenceDemonstrationV2Css from './public-intelligence-demonstration-v2.css?inline';");
    expect(main).toContain("import launchPolishFinalCss from './launch-polish-final-v1.css?inline';");
    const visualIndex = main.indexOf('style.textContent += `\\n${productionVisualAuthorityCss}`;');
    const seniorIndex = main.indexOf('style.textContent += `\\n${seniorDesignSystemCss}`;');
    const demoV2Index = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationV2Css}`;');
    const launchIndex = main.indexOf('style.textContent += `\\n${launchPolishFinalCss}`;');
    expect(seniorIndex).toBeGreaterThan(visualIndex);
    expect(demoV2Index).toBeGreaterThan(seniorIndex);
    expect(launchIndex).toBeGreaterThan(demoV2Index);
    expect(main.slice(launchIndex + 'style.textContent += `\\n${launchPolishFinalCss}`;'.length)).not.toContain('style.textContent +=');
    expect(main).toContain("document.documentElement.dataset.sovereignVisualAuthority = 'senior-design-system-v1';");
    expect(main).toContain("document.documentElement.dataset.sovereignPublicDemoAuthority = 'text-first-v2';");
    expect(main).toContain("document.documentElement.dataset.sovereignLaunchPolish = 'final-v1';");
  });

  it('uses the canonical native enterprise sans title stack without decorative substitutions', () => {
    for (const source of [typography, sansAuthority, staticAuthority, intelligenceDemo, visualAuthority, seniorAuthority, launchPolish]) {
      expect(source).toContain('-apple-system');
      expect(source).toContain('"SF Pro Display"');
      expect(source).toContain('"Segoe UI"');
      expect(source).not.toContain('\n    Optima,');
      expect(source).not.toContain('\n    "Avenir Next",');
      expect(source).not.toContain('font-family: "Sovereign Display"');
      expect(source).not.toContain('font-family: "Sovereign Sans"');
    }
    expect(demoV2).toContain('var(--sds-title, system-ui, sans-serif)');
    expect(demoV2).toContain('var(--sds-body, system-ui, sans-serif)');
    for (const retired of ['Optima', 'Avenir Next', 'Sovereign Display', 'Sovereign Sans', 'Georgia, serif']) {
      expect(demoV2).not.toContain(retired);
      expect(launchPolish).not.toContain(retired);
    }
  });

  it('preserves founder visual foundations while final polish stabilizes every page family', () => {
    for (const marker of [
      '--sovereign-accent: #b99772',
      '.public-approved-v8 .v0-hero h1 > span',
      '.public-approved-v8 .landing-story__heading h2',
      '.public-approved-v8 .v0-final h2'
    ]) expect(visualAuthority).toContain(marker);
    for (const marker of [
      '--sds-shell: min(1180px, calc(100vw - 64px))',
      'font-size: clamp(3.6rem, 5.5vw, 5rem)',
      '.account-shell .auth-panel',
      '.user-question',
      '.sovereign-composer'
    ]) expect(seniorAuthority).toContain(marker);
    for (const marker of [
      '--launch-header-h: 64px',
      '--launch-brand-size: 13px',
      '.public-approved-v8 .v0-footer > .v0-shell',
      '.account-shell .passkey-button',
      '.plan-onboarding .onboarding-plan-grid',
      '.public-not-found',
      '.intelligence-topbar'
    ]) expect(launchPolish).toContain(marker);
  });

  it('makes public product proof text-first rather than a workflow tutorial and fail-open visible', () => {
    for (const marker of [
      '.landing-intelligence-demo',
      '.landing-demo-question',
      '.landing-demo-core',
      '.landing-demo-copy > h3',
      '.landing-demo-visual',
      '.landing-demo-insights',
      '.landing-demo-continuation',
      '.landing-fit-check',
      '.landing-evidence'
    ]) expect(demoV2).toContain(marker);
    expect(demoV2).not.toContain('.landing-workflow__progress');
    expect(demoV2).not.toContain('.landing-demo__traffic');
    expect(launchPolish).toContain("[data-product-stories='text-first-intelligence-v2']");
    expect(launchPolish).toContain('visibility: visible !important');
    expect(launchPolish).toContain('opacity: 1 !important');
  });

  it('gives self, relationship, and system one progressively richer visual grammar', () => {
    for (const marker of [
      '.landing-understanding--decision',
      '.decision-field__choice',
      '.decision-field__adapt',
      '.landing-understanding--relationship',
      '.relationship-field__center',
      '.relationship-field__bridge',
      '.landing-understanding--system',
      '.system-field__state',
      '.system-field__route--direct'
    ]) expect(demoV2).toContain(marker);
    expect(stories).toContain('className="system-field__state system-field__state--current"');
    expect(stories).toContain('className="system-field__state system-field__state--changed"');
  });

  it('uses one finite explanatory motion sequence and preserves reduced-motion meaning', () => {
    for (const marker of [
      '@keyframes public-demo-arrive-v2',
      '@keyframes public-demo-line-v2',
      '@keyframes public-demo-resolve-v2',
      ".landing-story[data-visible='true'] .landing-demo-question",
      '@media (prefers-reduced-motion: reduce)',
      'animation: none !important',
      'opacity: 1 !important'
    ]) expect(demoV2).toContain(marker);
    expect(demoV2).not.toContain('infinite');
  });

  it('reclaims the policy component and keeps non-demo pages governed by the senior and launch systems', () => {
    expect(publicPolicy).toContain('className="policy-kicker"');
    expect(publicPolicy).toContain("'How Sovereign.OS handles your information.'");
    for (const marker of [
      '.public-secondary-page .policy-hero',
      '.public-secondary-page .policy-grid article',
      '.account-shell .account-layout',
      '.plan-onboarding .plan-layout',
      '.intelligence-workspace'
    ]) expect(seniorAuthority).toContain(marker);
    for (const marker of [
      '.public-secondary-page .policy-hero',
      '.account-shell .account-layout',
      '.plan-onboarding .plan-layout',
      '.invitation-shell',
      '.intelligence-topbar'
    ]) expect(launchPolish).toContain(marker);
  });

  it('keeps all active authority styles structurally balanced', () => {
    for (const source of [productCohesion, intelligenceDemo, visualAuthority, seniorAuthority, demoV2, launchPolish]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});