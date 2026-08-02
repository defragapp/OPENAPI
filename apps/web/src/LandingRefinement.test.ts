import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const slice = read('./expression-field/LandingExpressionSlice.tsx');
const release = read('./v0-single-example-release.css');
const accountExpressionField = read('./expression-field/ExpressionField.tsx');

describe('single-example public landing release', () => {
  it('loads the single-example authority after the founder layers and before passkey authority', () => {
    const globalImport = "import './v0-global-experience.css';";
    const refinementImport = "import './v0-landing-refinement.css';";
    const releaseImport = "import './v0-single-example-release.css';";
    const passkeyImport = "import './passkey-auth.css';";

    expect(main).toContain(releaseImport);
    expect(main.indexOf(refinementImport)).toBeGreaterThan(main.indexOf(globalImport));
    expect(main.indexOf(releaseImport)).toBeGreaterThan(main.indexOf(refinementImport));
    expect(main.indexOf(passkeyImport)).toBeGreaterThan(main.indexOf(releaseImport));
    expect(main).not.toContain('v0-product-demo-polish.css');
    expect(main).not.toContain('v0-ios-public-release.css');
  });

  it('keeps one interactive public example instead of the former demo wall', () => {
    expect(landing).toContain("import { LandingExpressionSlice } from './expression-field/LandingExpressionSlice'");
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v2"');
    expect(landing).toContain('data-viewport-surface="capability-summary"');
    expect(landing).toContain('Historical source-verification markers only');
    for (const retiredDefinition of [
      'function PersonalStory(',
      'function RelationshipStory(',
      'function SystemStory(',
      'function ChatWindow(',
      'function ProcessingFlow(',
      "import { LandingExpressionFieldPreview }"
    ]) expect(landing).not.toContain(retiredDefinition);
  });

  it('renders precise center-emitted light lines without an outer sphere', () => {
    expect(slice).toContain('LANDING_AXIS_LAYOUT');
    expect(slice).toContain("'clarity'");
    expect(slice).toContain("'responsibility'");
    expect(slice).toContain('landing-expression-slice__beam');
    expect(slice).toContain('landing-expression-slice__hit');
    expect(slice).toContain('role="button"');
    expect(slice).toContain('role="status"');
    expect(slice).toContain('onPointerEnter');
    expect(slice).toContain('onFocus');
    expect(slice).toContain('onClick');
    expect(slice).not.toContain('sphere');
    expect(slice).not.toContain('emotion detector');
    expect(slice).not.toContain('Math.random');
  });

  it('keeps the light metaphor implicit rather than naming it as product copy', () => {
    expect(`${slice}\n${accountExpressionField}`).not.toContain('This little light of mine');
    expect(slice).toContain('See what is active before it repeats.');
    expect(accountExpressionField).toContain('A stable view of capacity, feeling, protection, and gift');
  });

  it('protects full-bleed iOS sizing, touch targets, and reduced motion', () => {
    for (const marker of [
      'width: 100vw',
      'min-width: 320px',
      'env(safe-area-inset-left)',
      'env(safe-area-inset-right)',
      'env(safe-area-inset-top)',
      'env(safe-area-inset-bottom)',
      'min-height: 44px',
      'stroke-width: 30',
      '@media (max-width: 760px)',
      '@media (max-width: 380px)',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(release).toContain(marker);

    expect(release).toContain('overflow-x: clip');
    expect(release).toContain('-webkit-text-size-adjust: 100%');
    expect(release).toContain('touch-action: manipulation');
  });

  it('keeps the release stylesheet structurally valid', () => {
    expect((release.match(/{/g) ?? []).length).toBe((release.match(/}/g) ?? []).length);
  });
});
