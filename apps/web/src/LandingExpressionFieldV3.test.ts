import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const styles = read('./landing-expression-field-v3.css');
const integration = read('./landing-expression-field-integration.css');
const heroExtension = read('./landing-hero-field-v4.css');
const cohesionRefinement = read('./sitewide-cohesion-refinement-v2.css');
const mobileRelease = read('./space-mobile-release-v3.css');
const productionReadiness = read('./production-readiness-visual-v1.css');
const finalAuthority = read('./public-landing-final-authority.css');
const interactionRuntime = read('./release-interaction-runtime.ts');
const controls = read('./emergency-public-removal.css');

describe('premium rotating public Expression Field v3', () => {
  it('loads the public component layers and installs one bounded landing authority last', () => {
    const replacement = "import './landing-expression-field-v3.css';";
    const integrationImport = "import './landing-expression-field-integration.css';";
    const storiesImport = "import './v0-restored-product-stories.css';";
    const approved = "import './public-landing-approved-v8.css';";
    const hero = "import './landing-hero-field-v4.css';";
    const passkey = "import './passkey-auth.css';";

    expect(main.indexOf(integrationImport)).toBeGreaterThan(main.indexOf(replacement));
    expect(main.indexOf(storiesImport)).toBeGreaterThan(main.indexOf(integrationImport));
    expect(main.indexOf(hero)).toBeGreaterThan(main.indexOf(approved));
    expect(main.indexOf(passkey)).toBeGreaterThan(main.indexOf(hero));
    expect(main).toContain("import sitewideCohesionRefinementCss from './sitewide-cohesion-refinement-v2.css?inline';");
    expect(main).toContain("import spaceMobileReleaseCss from './space-mobile-release-v3.css?inline';");
    expect(main).toContain("import productionReadinessVisualCss from './production-readiness-visual-v1.css?inline';");
    expect(main).toContain("import publicLandingFinalAuthorityCss from './public-landing-final-authority.css?inline';");
    expect(main).toContain('`${platformVisualCohesionCss}\\n${sitewideCohesionRefinementCss}\\n${spaceMobileReleaseCss}\\n${productionReadinessVisualCss}\\n${publicLandingFinalAuthorityCss}`');
    expect(main).not.toContain('heroCompositionReleaseCss');
    expect(main).toContain("dataset.sovereignHeroComposition = 'v3-bounded'");
    expect(main).toContain('installProductionReadinessRuntime();');
    expect(main).toContain('installReleaseInteractionRuntime();');
  });

  it('keeps the field in the hero and restores real-life questions before product stories', () => {
    const heroStart = landing.indexOf('function V0Hero()');
    const heroEnd = landing.indexOf('function MobileCapabilityRail()', heroStart);
    const hero = landing.slice(heroStart, heroEnd);

    expect(hero).toContain('Healing isn’t optional.');
    expect(hero).toContain('Holding onto the pain is.');
    expect(hero).toContain('<LandingExpressionSlice />');
    expect(landing.indexOf('<RealLifeQuestions />')).toBeGreaterThan(landing.indexOf('<V0Hero />'));
    expect(landing.indexOf('<LandingProductStories />')).toBeGreaterThan(landing.indexOf('<RealLifeQuestions />'));
    expect(landing).toContain('Why do I keep taking responsibility for everyone around me?');
    expect(landing).toContain('What is mine, what is theirs, and what happens between us?');
    expect(landing).toContain('Does this choice fit me, or does it cost too much of me?');
    expect(landing).toContain('className="v0-wordmark v0-wordmark--mobile" href="/" aria-label="Sovereign.OS home">SOVEREIGN.OS');
  });

  it('supports stable automatic rotation plus pointer and keyboard control', () => {
    for (const marker of [
      'AUTO_ROTATION_DEGREES_PER_MS',
      'INTERACTION_PAUSE_MS',
      'requestAnimationFrame',
      'prefers-reduced-motion: reduce',
      'ROTATION_LIMIT',
      'handlePointerDown',
      'handlePointerMove',
      'handlePointerEnd',
      'setPointerCapture',
      'releasePointerCapture',
      'onPointerDown={handlePointerDown}',
      'onPointerMove={handlePointerMove}',
      'onPointerUp={handlePointerEnd}',
      'onPointerCancel={handlePointerEnd}',
      'role="button"',
      'tabIndex={0}',
      "event.key === 'ArrowLeft'",
      "event.key === 'ArrowRight'",
      "event.key === 'ArrowUp'",
      "event.key === 'ArrowDown'",
      'yaw: wrapAngle',
      'pitch: clamp'
    ]) expect(field).toContain(marker);
  });

  it('renders all sixteen value-driven measurements with compact endpoint detail after selection', () => {
    for (const marker of [
      'expressionAxisIds',
      'expressionAxisRegistryById',
      'data-field-axis-count={expressionAxisIds.length}',
      'Sixteen interactive measurements',
      'MIN_AXIS_LENGTH',
      'MAX_AXIS_LENGTH',
      'Math.pow(normalized, 1.32)',
      'Relative reach',
      'landing-expression-slice__readout',
      'data-field-geometry="spherical-360"',
      'buildSphereGrid',
      'buildAmbientRays',
      'SPHERE_RADIUS',
      'TOOLTIP_WIDTH',
      'placeTooltip',
      'const horizontalExit = Math.abs(deltaX) >= Math.abs(deltaY)',
      'deltaX >= 0 ? point.x + TOOLTIP_GAP',
      'deltaY >= 0 ? point.y + TOOLTIP_GAP',
      '<g className="landing-expression-slice__tooltip"',
      'landing-expression-slice__endpoint',
      'data-reach-tier={reachTier}',
      'const beamWidth = selectedLine',
      'const beamOpacity = selectedLine',
      'const auraOpacity = selectedLine'
    ]) expect(field).toContain(marker);

    expect(field).not.toContain('const placeRight = point.x <= CENTER');
    expect(field).not.toContain('<div className="landing-expression-slice__tooltip"');
    expect(field).not.toContain('giftExpression');
    expect(field).not.toContain('shadowExpression');
    expect(heroExtension).toContain('.landing-expression-slice__tooltip');
    expect(heroExtension).toContain('display: none !important');
    expect(cohesionRefinement).toContain('.public-approved-v8 .landing-expression-slice__tooltip');
    expect(cohesionRefinement).toContain('display: block !important');
    expect(mobileRelease).toContain('.landing-expression-slice[data-inspecting="true"] .landing-expression-slice__tooltip');
    expect(mobileRelease).toContain('visibility: hidden');
    expect(mobileRelease).toContain('.landing-expression-slice[data-inspecting="true"] .landing-expression-slice__readout--accessible');
    expect(productionReadiness).toContain('.landing-expression-slice[data-inspecting="true"] .landing-expression-slice__tooltip');
    expect(productionReadiness).toContain('width: 148px !important');
    expect(productionReadiness).toContain('height: 50px !important');
    expect(interactionRuntime).toContain("field.dataset.inspecting = 'true'");
    expect(interactionRuntime).toContain("event.key === 'Escape'");
  });

  it('keeps the 360 field below the hero copy and makes the complete density visible', () => {
    for (const marker of [
      '.landing-expression-slice__sphere-shell',
      '.landing-expression-slice__sphere-grid path',
      'stroke: #2f93ff',
      'stroke: #78c7ff',
      'height: 58%',
      'mask-image: linear-gradient',
      '.landing-expression-slice__readout',
      '@media (max-width: 760px)',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(heroExtension).toContain(marker);

    expect(styles).toContain('touch-action: none');
    expect(integration).toContain('background: transparent');
    expect(integration).toContain('border-radius: 0');
    expect(cohesionRefinement).toContain('top: 96% !important');
    expect(mobileRelease).toContain('width: min(1440px, calc(100vw - 24px)) !important');
    expect(mobileRelease).toContain('.landing-expression-slice__ambient');
    expect(mobileRelease).toContain('[data-reach-tier="primary"]');
    expect(mobileRelease).toContain('[data-reach-tier="supporting"]');
    expect(mobileRelease).toContain('[data-reach-tier="background"]');
    expect(productionReadiness).toContain('height: clamp(315px, 39%, 430px) !important');
    expect(productionReadiness).toContain('width: min(1240px, 94vw) !important');
  });

  it('bounds the opening field and the complete public page at desktop and phone widths', () => {
    for (const marker of [
      'max-height: 920px !important',
      'padding: clamp(68px, 7vh, 86px) 24px 390px !important',
      'font-size: clamp(4rem, 6.25vw, 6.75rem) !important',
      'height: 420px !important',
      'width: min(1260px, 94vw) !important',
      '.public-approved-v8 .landing-story',
      'padding: 108px 0 116px !important',
      'grid-template-columns: repeat(2, minmax(0, 1fr)) !important',
      '.public-approved-v8 .v0-comparison',
      '.public-approved-v8 .v0-final',
      '@media (max-width: 900px)',
      'max-height: 880px !important',
      'height: 360px !important',
      '@media (max-width: 560px)',
      'height: 340px !important'
    ]) expect(finalAuthority).toContain(marker);
    expect(finalAuthority).toContain('.public-approved-v8 .sovereign-opening-capabilities');
    expect(finalAuthority).toContain('display: none !important');
    expect(finalAuthority).not.toContain('width: min(1480px, 118vw)');
    expect(finalAuthority).not.toContain('height: clamp(500px, 62svh, 580px)');
  });

  it('moves rotating questions below the hero and keeps public, account, and space branding cohesive', () => {
    for (const marker of [
      '--sovereign-wordmark-family',
      '.v0-wordmark',
      '.account-nav .wordmark',
      '.intelligence-brand strong',
      '.public-approved-v8 .landing-question-orbit',
      'min-height: 188px !important',
      'font-family: var(--font-display',
      '.account-shell',
      '.auth-panel',
      '.sovereign-app-runtime .surface-heading h1',
      '.sovereign-app-runtime .mobile-menu-trigger::before',
      'content: "SOVEREIGN.OS"',
      '.sovereign-app-runtime .intelligence-topbar > div:first-of-type > strong',
      '@media (max-width: 900px)',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(cohesionRefinement).toContain(marker);
    expect(productionReadiness).toContain('min-height: 176px !important');
    expect(productionReadiness).toContain('position: sticky !important');
  });

  it('keeps platform controls restrained and product stories free of duplicate field globes', () => {
    expect(controls).toContain('border-radius: 4px !important');
    expect(controls).not.toContain('.landing-expression-slice');
    expect(controls).not.toContain('display: none');
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
  });

  it('keeps release stylesheets structurally balanced', () => {
    for (const source of [styles, integration, heroExtension, cohesionRefinement, mobileRelease, productionReadiness, finalAuthority, controls]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
