import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const styles = read('./landing-expression-field-v3.css');
const integration = read('./landing-expression-field-integration.css');
const controls = read('./emergency-public-removal.css');

describe('premium rotating public Expression Field v3', () => {
  it('loads the integrated field before restored stories and passkey authority', () => {
    const replacement = "import './landing-expression-field-v3.css';";
    const integrationImport = "import './landing-expression-field-integration.css';";
    const storiesImport = "import './v0-restored-product-stories.css';";
    const passkey = "import './passkey-auth.css';";

    expect(main.indexOf(integrationImport)).toBeGreaterThan(main.indexOf(replacement));
    expect(main.indexOf(storiesImport)).toBeGreaterThan(main.indexOf(integrationImport));
    expect(main.indexOf(passkey)).toBeGreaterThan(main.indexOf(storiesImport));
  });

  it('places one field directly beneath the approved hero quote and before restored product stories', () => {
    const heroStart = landing.indexOf('function V0Hero()');
    const heroEnd = landing.indexOf('function ComparisonStory()', heroStart);
    const hero = landing.slice(heroStart, heroEnd);

    expect(hero).toContain('Healing isn’t optional.');
    expect(hero).toContain('Holding onto the pain is.');
    expect(hero).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<LandingProductStories />');
    expect(hero).not.toContain('v0-hero-copy');
    expect(hero).not.toContain('v0-actions');
  });

  it('supports drag rotation and line-level keyboard, pointer, and touch selection', () => {
    for (const marker of [
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
      'onPointerEnter',
      'onFocus',
      'onClick',
      "event.key === 'ArrowLeft'",
      "event.key === 'ArrowRight'"
    ]) expect(field).toContain(marker);
  });

  it('shows Baseline, live change, and current values only in the selected-line tooltip', () => {
    for (const marker of [
      'Baseline value',
      'Live change',
      'Current',
      'selected.axis.baselineValue',
      'selected.axis.currentDelta',
      'selected.axis.value',
      'landing-expression-slice__tooltip',
      'role="status"'
    ]) expect(field).toContain(marker);

    expect(field).toContain('selected && selectedGeometry');
    expect(field).not.toContain('landing-expression-slice__header');
    expect(field).not.toContain('landing-expression-slice__question');
    expect(field).not.toContain('landing-expression-slice__note');
  });

  it('renders a full-width, globe-free, center-emitted field integrated into the page', () => {
    for (const marker of [
      'width: 100vw',
      'min-width: 320px',
      'border-radius: 0',
      'touch-action: none',
      '.landing-expression-slice__grid line',
      '.landing-expression-slice__ambient',
      '.landing-expression-slice__horizon',
      '.landing-expression-slice__origin',
      'stroke-width: 34',
      '@media (max-width: 760px)',
      'env(safe-area-inset-bottom)',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(styles).toContain(marker);

    expect(integration).toContain('background: transparent');
    expect(integration).toContain('border-radius: 0');
    expect(field).not.toContain('sphere');
    expect(field).not.toContain('globe');
  });

  it('keeps platform controls restrained and product stories free of field globes', () => {
    expect(controls).toContain('border-radius: 4px !important');
    expect(controls).not.toContain('.landing-expression-slice');
    expect(controls).not.toContain('display: none');
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
  });

  it('keeps release stylesheets structurally balanced', () => {
    for (const source of [styles, integration, controls]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
