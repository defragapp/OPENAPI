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
const mobileRelease = read('./workspace-mobile-release-v3.css');
const productionReadiness = read('./production-readiness-visual-v1.css');
const finalAuthority = read('./public-landing-final-authority.css');
const landingRefinementV2 = read('./landing-refinement-v2.css');
const interactionRuntime = read('./release-interaction-runtime.ts');
const controls = read('./emergency-public-removal.css');

describe('premium rotating public Expression Field v3', () => {
  it('loads the public component layers and appends the landing refinement after rendered fidelity', () => {
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
    expect(main).toContain("import landingRefinementV2Css from './landing-refinement-v2.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${landingRefinementV2Css}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${renderedFidelityCss}`;'));
    expect(main).toContain("dataset.sovereignHeroComposition = 'v3-bounded'");
    expect(main).toContain('installProductionReadinessRuntime();');
    expect(main).toContain('installReleaseInteractionRuntime();');
  });

  it('keeps the field in the hero and makes real-life questions a visible selling surface', () => {
    const heroStart = landing.indexOf('function V0Hero()');
    const heroEnd = landing.indexOf('function MobileCapabilityRail()', heroStart);
    const hero = landing.slice(heroStart, heroEnd);

    expect(hero).toContain('Healing isn’t optional.');
    expect(hero).toContain('Holding onto the pain is.');
    expect(hero).toContain('<LandingExpressionSlice />');
    expect(landing.indexOf('<RealLifeQuestions />')).toBeGreaterThan(landing.indexOf('<V0Hero />'));
    expect(landing.indexOf('<LandingProductStories />')).toBeGreaterThan(landing.indexOf('<RealLifeQuestions />'));
    expect(landing).toContain("{ scope: 'Self', text: 'Why do I keep taking responsibility for everyone around me?' }");
    expect(landing).toContain("{ scope: 'Family system', text: 'What changes when I stop playing the role everyone expects?' }");
    expect(landing).toContain('<small>{question.scope}</small>');
    expect(landing).toContain('<strong>{question.text}</strong>');
    expect(landingRefinementV2).toContain('font-size: clamp(1.3rem, 2vw, 1.7rem) !important');
  });

  it('supports stable automatic rotation plus pointer, hover, and keyboard control', () => {
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
      'onPointerEnter={() => selectAxis(axis.id)}',
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

  it('renders all sixteen value-driven themes with a compact name/value endpoint label', () => {
    for (const marker of [
      'expressionAxisIds',
      'expressionAxisRegistryById',
      'data-field-axis-count={expressionAxisIds.length}',
      'sixteen interactive themes',
      'MIN_AXIS_LENGTH',
      'MAX_AXIS_LENGTH',
      'Math.pow(normalized, 1.32)',
      'relative emphasis',
      'data-inspecting="true"',
      'data-field-geometry="spherical-360"',
      'buildSphereGrid',
      'buildAmbientRays',
      'SPHERE_RADIUS',
      'TOOLTIP_WIDTH = 132',
      'TOOLTIP_HEIGHT = 34',
      'placeTooltip',
      '<g className="landing-expression-slice__tooltip"',
      'landing-expression-slice__tooltip-title',
      'landing-expression-slice__tooltip-value',
      '{selected.axis.value}',
      'landing-expression-slice__endpoint',
      'data-reach-tier={reachTier}'
    ]) expect(field).toContain(marker);

    expect(field).not.toContain('Sixteen interactive measurements');
    expect(field).not.toContain('measurement lines');
    expect(field).not.toContain('stable blue sphere');
    expect(field).not.toContain('giftExpression');
    expect(field).not.toContain('shadowExpression');
    expect(heroExtension).toContain('.landing-expression-slice__tooltip');
    expect(heroExtension).toContain('display: none !important');
    expect(landingRefinementV2).toContain('.landing-expression-slice__tooltip');
    expect(landingRefinementV2).toContain('display: block !important');
    expect(landingRefinementV2).toContain('width: 132px !important');
    expect(landingRefinementV2).toContain('height: 34px !important');
    expect(landingRefinementV2).toContain('@media (max-width: 760px)');
    expect(landingRefinementV2).toContain('display: none !important');
    expect(interactionRuntime).toContain("field.dataset.inspecting = 'true'");
    expect(interactionRuntime).toContain("event.key === 'Escape'");
  });

  it('keeps the 360 field below the hero copy and the final visual treatment monochrome', () => {
    for (const marker of [
      '.landing-expression-slice__sphere-shell',
      '.landing-expression-slice__sphere-grid path',
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
    expect(mobileRelease).toContain('[data-reach-tier="primary"]');
    expect(mobileRelease).toContain('[data-reach-tier="supporting"]');
    expect(mobileRelease).toContain('[data-reach-tier="background"]');
    expect(productionReadiness).toContain('height: clamp(315px, 39%, 430px) !important');
  });

  it('keeps desktop proof spacious and mobile proof intentionally condensed', () => {
    expect(finalAuthority).toContain('.public-approved-v8 .landing-story');
    expect(finalAuthority).toContain('.public-approved-v8 .v0-comparison');
    expect(finalAuthority).toContain('.public-approved-v8 .v0-final');
    expect(landingRefinementV2).toContain('width: min(1280px, calc(100% - 64px)) !important');
    expect(landingRefinementV2).toContain('scroll-snap-type: inline mandatory !important');
    expect(landingRefinementV2).toContain('.landing-demo--system-context');
    expect(landingRefinementV2).toContain('display: none !important');
    expect(landingRefinementV2).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps platform controls restrained and product stories free of duplicate field globes', () => {
    expect(controls).toContain('border-radius: 4px !important');
    expect(controls).not.toContain('.landing-expression-slice');
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
  });

  it('keeps release stylesheets structurally balanced', () => {
    for (const source of [styles, integration, heroExtension, cohesionRefinement, mobileRelease, productionReadiness, finalAuthority, landingRefinementV2, controls]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
