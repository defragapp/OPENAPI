import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const typography = read('./typography-system.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const productCohesion = read('./production-product-cohesion-v1.css');
const visualAuthority = read('./production-visual-authority-v1.css');
const staticAuthority = read('../public/premium-action-static-v1.css');

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

  it('uses a humanist title face first while preserving resilient native fallbacks', () => {
    for (const source of [typography, sansAuthority, staticAuthority, visualAuthority]) {
      expect(source).toContain('Optima');
      expect(source).not.toContain('Avenir Next');
      expect(source).not.toContain('font-family: "Sovereign Display"');
      expect(source).not.toContain('font-family: "Sovereign Sans"');
    }
    expect(typography.indexOf('Optima')).toBeLessThan(typography.indexOf('"Helvetica Neue"'));
    expect(sansAuthority.indexOf('Optima')).toBeLessThan(sansAuthority.indexOf('"Helvetica Neue"'));
    expect(staticAuthority.indexOf('Optima')).toBeLessThan(staticAuthority.indexOf('"Helvetica Neue"'));
  });

  it('gives the landing established proportions and warm interface chrome without rebuilding its story', () => {
    for (const marker of [
      '--sovereign-accent: #b99772',
      '.public-approved-v8 .v0-hero h1 > span',
      'font-size: clamp(3.7rem, 5.35vw, 5.7rem)',
      '.public-approved-v8 .landing-story__heading h2',
      'font-size: clamp(2.2rem, 3.2vw, 3.2rem)',
      '.public-approved-v8 .landing-workflow > li.is-active',
      '.public-approved-v8 .landing-message--assistant > div',
      '.public-approved-v8 .landing-system-map path',
      '.public-approved-v8 .v0-final h2'
    ]) expect(visualAuthority).toContain(marker);
    expect(visualAuthority).not.toContain('#62b5ff');
    expect(visualAuthority).not.toContain('rgba(126, 201, 255');
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
    for (const source of [productCohesion, visualAuthority]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
