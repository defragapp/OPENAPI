import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const typography = read('./typography-system.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const productCohesion = read('./production-product-cohesion-v1.css');
const visualAuthority = read('./production-visual-authority-v1.css');
const staticAuthority = read('../public/premium-action-static-v1.css');
const brand = read('./BrandMark.tsx');

describe('production visual authority v1', () => {
  it('keeps one deterministic terminal visual authority after product and typography layers', () => {
    expect(main).toContain("import productionProductCohesionCss from './production-product-cohesion-v1.css?inline';");
    expect(main).toContain("import productionVisualAuthorityCss from './production-visual-authority-v1.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${productionProductCohesionCss}`;')).toBeGreaterThan(
      main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;')
    );
    expect(main.indexOf('style.textContent += `\\n${productionVisualAuthorityCss}`;')).toBeGreaterThan(
      main.indexOf('style.textContent += `\\n${productionProductCohesionCss}`;')
    );
    expect(main).toContain("document.documentElement.dataset.sovereignVisualAuthority = 'production-v1';");
  });

  it('uses the native SF/Segoe display system and excludes rejected title authorities', () => {
    for (const source of [typography, sansAuthority, staticAuthority, visualAuthority]) {
      expect(source).toContain('-apple-system');
      expect(source).toContain('"SF Pro Display"');
      expect(source).toContain('"Segoe UI Variable Display"');
      expect(source).not.toContain('Optima');
      expect(source).not.toContain('Avenir Next');
      expect(source).not.toContain('font-family: "Sovereign Display"');
      expect(source).not.toContain('font-family: "Sovereign Sans"');
    }
    expect(typography.indexOf('-apple-system')).toBeLessThan(typography.indexOf('"SF Pro Display"'));
    expect(sansAuthority.indexOf('-apple-system')).toBeLessThan(sansAuthority.indexOf('"SF Pro Display"'));
    expect(staticAuthority.indexOf('-apple-system')).toBeLessThan(staticAuthority.indexOf('"SF Pro Display"'));
  });

  it('uses one public brand size and header geometry across React and static routes', () => {
    expect(brand).toContain('className="brand-mark"');
    expect(brand).not.toContain('fontSize');
    expect(visualAuthority).toContain('font-size: 0.75rem !important');
    expect(visualAuthority).toContain('min-height: 64px !important');
    expect(staticAuthority).toContain('font-size: 0.75rem !important');
    expect(staticAuthority).toContain('min-height: 64px !important');
    expect(visualAuthority).toContain('--sovereign-public-shell: min(1180px, calc(100vw - 64px))');
    expect(staticAuthority).toContain('--static-shell-final: min(1180px, calc(100vw - 64px))');
  });

  it('gives the landing constrained proportions and never hides product proof by default', () => {
    for (const marker of [
      '--sovereign-accent: #b99772',
      '.public-approved-v8 .v0-hero h1 > span',
      'font-size: clamp(3.55rem, 5vw, 5.15rem)',
      '.public-approved-v8 .landing-story__heading h2',
      'font-size: clamp(2.15rem, 3vw, 2.95rem)',
      '.public-approved-v8 .landing-workflow > li.is-active',
      '.public-approved-v8 .landing-message--assistant > div',
      '.public-approved-v8 .landing-system-map path',
      '.public-approved-v8 .v0-final h2',
      'opacity: 1 !important',
      'visibility: visible !important'
    ]) expect(visualAuthority).toContain(marker);
    expect(visualAuthority).not.toContain('#62b5ff');
    expect(visualAuthority).not.toContain('rgba(126, 201, 255');
  });

  it('uses motion as enhancement and honors reduced motion', () => {
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

  it('forces policy surfaces back into a disciplined legal-document hierarchy', () => {
    for (const marker of [
      '.public-secondary-page .policy-hero',
      'min-height: 430px !important',
      '.public-secondary-page .policy-grid',
      'display: block !important',
      '.public-secondary-page .policy-grid article:nth-child(n)',
      'background: transparent !important',
      'border-radius: 0 !important',
      '.public-secondary-page .policy-contact'
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
    for (const source of [productCohesion, visualAuthority, staticAuthority]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
