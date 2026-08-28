import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const styles = read('./public.css');
const integration = read('./public.css');
const heroExtension = read('./public.css');
const cohesionRefinement = read('./releases.css');
const mobileRelease = read('./releases.css');
const productionReadiness = read('./releases.css');
const finalAuthority = read('./releases.css');
const landingRefinementV2 = read('./releases.css');
const landingRefinementV5 = read('./releases.css');
const interactionRuntime = read('./release-interaction-runtime.ts');
const controls = read('./public.css');

describe('premium rotating public Expression Field v3', () => {
  it('loads the public component layers and appends the landing refinement after rendered fidelity', () => {
    expect(main).toContain("import './public.css';");
    expect(main).toContain("import './passkey-auth.css';");
    expect(main).toContain("import releasesCss from './releases.css?inline';");
    expect(main).toContain("style.textContent = releasesCss;");
    expect(main.indexOf("import './passkey-auth.css';")).toBeGreaterThan(main.indexOf("import './public.css';"));
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
    expect(landing).toContain("{ scope: 'Self', text: 'How do I make decisions that actually fit me?' }");
    expect(landing).toContain("{ scope: 'System', text: 'What changes when I stop playing the role everyone expects?' }");
    expect(landing).toContain('<small>{question.scope}</small>');
    expect(landing).toContain('<strong>{question.text}</strong>');
    expect(landingRefinementV2).toContain('font-size: clamp(1.3rem, 2vw, 1.7rem) !important');
  });

  it('supports stable automatic rotation plus pointer, click/focus, and keyboard control', () => {
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
      'onFocus={() => selectAxis(axis.id)}',
      'onClick={(event) =>',
      'role="button"',
      'tabIndex={0}',
      "event.key === 'ArrowLeft'",
      "event.key === 'ArrowRight'",
      "event.key === 'ArrowUp'",
      "event.key === 'ArrowDown'",
      'yaw: wrapAngle',
      'pitch: clamp'
    ]) expect(field).toContain(marker);
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
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
      "data-inspecting={hasInspection ? 'true' : 'false'}",
      'data-field-geometry="spherical-360"',
      'buildSphereGrid',
      'buildAmbientRays',
      'SPHERE_RADIUS',
      'TOOLTIP_WIDTH = 104',
      'TOOLTIP_HEIGHT = 26',
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
    expect(landingRefinementV5).toContain('.landing-expression-slice__tooltip-panel');
    expect(landingRefinementV5).toContain('width: 104px !important');
    expect(landingRefinementV5).toContain('height: 26px !important');
    expect(landingRefinementV5).toContain('@media (prefers-reduced-motion: reduce)');
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
