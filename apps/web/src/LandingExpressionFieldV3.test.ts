import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const styles = read('./landing-expression-field-v3.css');
const controls = read('./emergency-public-removal.css');

describe('premium rotating public Expression Field v3', () => {
  it('loads the replacement field after legacy landing authority and before passkey authority', () => {
    const legacy = "import './v0-single-example-release.css';";
    const replacement = "import './landing-expression-field-v3.css';";
    const passkey = "import './passkey-auth.css';";

    expect(main).toContain(replacement);
    expect(main.indexOf(replacement)).toBeGreaterThan(main.indexOf(legacy));
    expect(main.indexOf(passkey)).toBeGreaterThan(main.indexOf(replacement));
  });

  it('places one field directly beneath the approved hero quote without hero buttons or copy blocks', () => {
    const heroStart = landing.indexOf('function V0Hero()');
    const heroEnd = landing.indexOf('function CapabilitySummary()', heroStart);
    const hero = landing.slice(heroStart, heroEnd);

    expect(hero).toContain('Healing isn’t optional.');
    expect(hero).toContain('Holding onto the pain is.');
    expect(hero).toContain('<LandingExpressionSlice />');
    expect(hero).not.toContain('v0-hero-copy');
    expect(hero).not.toContain('v0-actions');
    expect(hero).not.toContain('Build my Baseline');
    expect(hero).not.toContain('Explore the field');
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

  it('renders a full-width, globe-free, center-emitted field with iOS-safe geometry', () => {
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

    expect(field).not.toContain('sphere');
    expect(field).not.toContain('globe');
    expect(styles).not.toContain('border-radius: 32px');
  });

  it('keeps platform controls restrained rather than pill-shaped and never hides the replacement field', () => {
    expect(controls).toContain('border-radius: 4px !important');
    expect(controls).not.toContain('.landing-expression-slice');
    expect(controls).not.toContain('display: none');
  });

  it('keeps both release stylesheets structurally balanced', () => {
    expect((styles.match(/{/g) ?? []).length).toBe((styles.match(/}/g) ?? []).length);
    expect((controls.match(/{/g) ?? []).length).toBe((controls.match(/}/g) ?? []).length);
  });
});
