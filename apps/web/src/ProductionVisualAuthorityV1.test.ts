import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const typography = read('./typography-system.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const productCohesion = read('./production-product-cohesion-v1.css');
const intelligenceDemo = read('./public-intelligence-demonstration-v1.css');
const visualAuthority = read('./production-visual-authority-v1.css');
const publicPolicy = read('./PublicPolicy.tsx');
const staticAuthority = read('../public/premium-action-static-v1.css');

describe('production visual authority v1', () => {
  it('keeps one deterministic terminal visual authority after product, typography, and demo layers', () => {
    expect(main).toContain("import productionProductCohesionCss from './production-product-cohesion-v1.css?inline';");
    expect(main).toContain("import publicIntelligenceDemonstrationCss from './public-intelligence-demonstration-v1.css?inline';");
    expect(main).toContain("import productionVisualAuthorityCss from './production-visual-authority-v1.css?inline';");
    const sansIndex = main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;');
    const productIndex = main.indexOf('style.textContent += `\\n${productionProductCohesionCss}`;');
    const demoIndex = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationCss}`;');
    const visualIndex = main.indexOf('style.textContent += `\\n${productionVisualAuthorityCss}`;');
    expect(productIndex).toBeGreaterThan(sansIndex);
    expect(demoIndex).toBeGreaterThan(productIndex);
    expect(visualIndex).toBeGreaterThan(demoIndex);
    expect(main.slice(visualIndex + 'style.textContent += `\\n${productionVisualAuthorityCss}`;'.length)).not.toContain('style.textContent +=');
    expect(main).toContain("document.documentElement.dataset.sovereignVisualAuthority = 'production-v1';");
  });

  it('uses self-hosted Geist Sans titles with native enterprise fallbacks', () => {
    for (const source of [typography, sansAuthority, staticAuthority, intelligenceDemo, visualAuthority]) {
      expect(source).toContain("\"Geist Sans\"");

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

  it('restores founder-scale desktop hierarchy without rebuilding the landing story', () => {
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
  });

  it('reclaims the actual policy component from stale grid auto-placement at desktop and preserves phone bounds', () => {
    expect(publicPolicy).toContain('className="policy-kicker"');
    expect(publicPolicy).toContain("'How Sovereign.OS handles your information.'");
    expect(publicPolicy).toContain("'Terms for using Sovereign.OS.'");
    for (const marker of [
      '.public-secondary-page .policy-hero',
      'display: block !important',
      '.public-secondary-page .policy-kicker',
      '.public-secondary-page .policy-hero h1',
      'max-width: 980px !important',
      'font-size: clamp(4.2rem, 6.2vw, 6.4rem)',
      '@media (max-width: 900px)',
      'width: calc(100% - 32px) !important',
      'font-size: clamp(2.55rem, 9.8vw, 3.85rem)'
    ]) expect(visualAuthority).toContain(marker);
  });

  it('uses motion to reveal product state and honors reduced motion', () => {
    for (const marker of [
      '@keyframes sovereign-field-breathe-v1',
      '@keyframes sovereign-demo-arrive-v1',
      '@keyframes sovereign-content-arrive-v1',
      '@keyframes sovereign-system-flow-v1',
      '.landing-story[data-visible="true"] .landing-demo',
      '@media (prefers-reduced-motion: reduce)',
      'animation: none !important',
      'opacity: 1 !important'
    ]) expect(visualAuthority).toContain(marker);
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
      '.sovereign-composer',
      '.intelligence-context'
    ]) expect(productCohesion).toContain(marker);
    expect(productCohesion).toContain('--product-accent: #b99772');
  });

  it('keeps all new authority styles structurally balanced', () => {
    for (const source of [productCohesion, intelligenceDemo, visualAuthority]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});