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
const publicPolicy = read('./PublicPolicy.tsx');
const staticAuthority = read('../public/premium-action-static-v1.css');

describe('production visual authority v1', () => {
  it('keeps one deterministic terminal visual authority after product, typography, demo, and production layers', () => {
    expect(main).toContain("import productionProductCohesionCss from './production-product-cohesion-v1.css?inline';");
    expect(main).toContain("import publicIntelligenceDemonstrationCss from './public-intelligence-demonstration-v1.css?inline';");
    expect(main).toContain("import productionVisualAuthorityCss from './production-visual-authority-v1.css?inline';");
    expect(main).toContain("import seniorDesignSystemCss from './senior-design-system-v1.css?inline';");
    const sansIndex = main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;');
    const productIndex = main.indexOf('style.textContent += `\\n${productionProductCohesionCss}`;');
    const demoIndex = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationCss}`;');
    const visualIndex = main.indexOf('style.textContent += `\\n${productionVisualAuthorityCss}`;');
    const seniorIndex = main.indexOf('style.textContent += `\\n${seniorDesignSystemCss}`;');
    expect(productIndex).toBeGreaterThan(sansIndex);
    expect(demoIndex).toBeGreaterThan(productIndex);
    expect(visualIndex).toBeGreaterThan(demoIndex);
    expect(seniorIndex).toBeGreaterThan(visualIndex);
    expect(main.slice(seniorIndex + 'style.textContent += `\\n${seniorDesignSystemCss}`;'.length)).not.toContain('style.textContent +=');
    expect(main).toContain("document.documentElement.dataset.sovereignVisualAuthority = 'senior-design-system-v1';");
  });

  it('uses the canonical native enterprise sans title stack without decorative substitutions', () => {
    for (const source of [typography, sansAuthority, staticAuthority, intelligenceDemo, visualAuthority, seniorAuthority]) {
      expect(source).toContain('-apple-system');
      expect(source).toContain('"SF Pro Display"');
      expect(source).toContain('"Segoe UI"');
      expect(source).not.toContain('\n    Optima,');
      expect(source).not.toContain('\n    "Avenir Next",');
      expect(source).not.toContain('font-family: "Sovereign Display"');
      expect(source).not.toContain('font-family: "Sovereign Sans"');
    }
    expect(typography.indexOf('-apple-system')).toBeLessThan(typography.indexOf('"SF Pro Display"'));
    expect(sansAuthority.indexOf('-apple-system')).toBeLessThan(sansAuthority.indexOf('"SF Pro Display"'));
    expect(staticAuthority.indexOf('-apple-system')).toBeLessThan(staticAuthority.indexOf('"SF Pro Display"'));
  });

  it('preserves founder visual foundations while allowing the terminal system to stabilize rendered scale', () => {
    for (const marker of [
      '--sovereign-accent: #b99772',
      '--landing-shell: min(1240px, calc(100vw - 72px))',
      '.public-approved-v8 .v0-hero h1 > span',
      'font-size: clamp(4.6rem, 7.3vw, 7.4rem)',
      '.public-approved-v8 .v0-hero h1 > em',
      'font-size: clamp(4.1rem, 6.6vw, 6.75rem)',
      '.public-approved-v8 .landing-story__heading h2',
      'font-size: clamp(2.7rem, 4vw, 3.9rem)',
      '.public-approved-v8 .landing-workflow > li.is-active',
      '.public-approved-v8 .landing-message--assistant > div',
      '.public-approved-v8 .v0-final h2'
    ]) expect(visualAuthority).toContain(marker);
    for (const marker of [
      '--sds-shell: min(1180px, calc(100vw - 64px))',
      'font-size: clamp(3.6rem, 5.5vw, 5rem)',
      'font-size: clamp(2.35rem, 3.4vw, 3.2rem)',
      'border-radius: var(--sds-radius)',
      '.user-question',
      '.sovereign-composer'
    ]) expect(seniorAuthority).toContain(marker);
    expect(visualAuthority).not.toContain('#62b5ff');
    expect(visualAuthority).not.toContain('rgba(126, 201, 255');
    expect(intelligenceDemo).toContain('.landing-system-analysis__sequence');
    expect(intelligenceDemo).toContain('.landing-demo__composer-shell');
  });

  it('keeps representative product demonstrations readable at normal desktop viewing distance', () => {
    for (const marker of [
      'font-size: 1.02rem !important',
      'font-size: 0.98rem !important',
      'html:root:root:root body .public-approved-v8 .landing-answer__direct',
      'font-size: 1rem !important',
      'html:root:root:root body .public-approved-v8 .landing-answer__section > p',
      'font-size: 0.9rem !important',
      '.public-approved-v8 .landing-workflow__copy > span',
      'font-size: 0.84rem !important'
    ]) expect(visualAuthority).toContain(marker);
    expect(seniorAuthority).toContain('.public-approved-v8 .landing-message');
    expect(seniorAuthority).toContain('font-size: .9rem !important');
  });

  it('reclaims the actual policy component from stale grid auto-placement and normalizes it to the shared shell', () => {
    expect(publicPolicy).toContain('className="policy-kicker"');
    expect(publicPolicy).toContain("'How Sovereign.OS handles your information.'");
    expect(publicPolicy).toContain("'Terms for using Sovereign.OS.'");
    for (const marker of [
      '.public-secondary-page .policy-hero',
      'grid-template-areas: "kicker kicker" "title body" "title effective"',
      '.public-secondary-page .policy-hero h1',
      'font-size: clamp(2.9rem,4.25vw,4.25rem)',
      '.public-secondary-page .policy-grid article',
      'border-radius:0 !important'
    ]) expect(seniorAuthority.replaceAll(' ', '')).toContain(marker.replaceAll(' ', ''));
  });

  it('uses motion to reveal product state and honors reduced motion', () => {
    for (const marker of [
      '@keyframes sds-demo-enter',
      '@keyframes sds-thread-resolve',
      '@keyframes sds-system-flow',
      '.landing-story[data-visible="true"] .landing-demo',
      '@media (prefers-reduced-motion:reduce)',
      'animation:none !important',
      'opacity:1 !important'
    ]) expect(seniorAuthority.replaceAll(' ', '')).toContain(marker.replaceAll(' ', ''));
  });

  it('carries the same constraint language through auth, onboarding, policy, and workspace', () => {
    for (const marker of [
      '.account-shell .account-intro h1',
      '.account-shell .auth-panel',
      '.plan-onboarding .baseline-onboarding-form',
      '.policy-review-gate > section',
      '.intelligence-workspace',
      '.intelligence-sidebar nav button.active',
      '.user-question',
      '.sovereign-composer'
    ]) expect(seniorAuthority).toContain(marker);
  });

  it('keeps all authority styles structurally balanced', () => {
    for (const source of [productCohesion, intelligenceDemo, visualAuthority, seniorAuthority]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});