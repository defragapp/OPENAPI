import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const fieldStyles = read('./landing-expression-field-v3.css');
const integrationStyles = read('./landing-expression-field-integration.css');
const storyStyles = read('./v0-restored-product-stories.css');
const layoutRepair = read('./v0-product-story-layout-repair.css');

describe('public landing v3 release', () => {
  it('loads the integrated field, restored stories, final layout repair, and passkey authority in order', () => {
    const fieldImport = "import './landing-expression-field-v3.css';";
    const integrationImport = "import './landing-expression-field-integration.css';";
    const storiesImport = "import './v0-restored-product-stories.css';";
    const repairImport = "import './v0-product-story-layout-repair.css';";
    const passkeyImport = "import './passkey-auth.css';";
    expect(main.indexOf(integrationImport)).toBeGreaterThan(main.indexOf(fieldImport));
    expect(main.indexOf(storiesImport)).toBeGreaterThan(main.indexOf(integrationImport));
    expect(main.indexOf(repairImport)).toBeGreaterThan(main.indexOf(storiesImport));
    expect(main.indexOf(passkeyImport)).toBeGreaterThan(main.indexOf(repairImport));
  });

  it('renders the hero field followed by the three real product demonstrations', () => {
    expect(landing).toContain("import { LandingProductStories } from './LandingProductStories'");
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(landing).toContain('<V0Hero />');
    expect(landing).toContain('<LandingProductStories />');
    expect(landing.indexOf('<LandingProductStories />')).toBeGreaterThan(landing.indexOf('<V0Hero />'));
    for (const marker of ['PersonalStory', 'RelationshipStory', 'SystemStory']) expect(stories).toContain(marker);
  });

  it('keeps the opening field center-emitted, draggable, and free of a globe or card', () => {
    expect(field).toContain('onPointerDown={handlePointerDown}');
    expect(field).toContain('onPointerMove={handlePointerMove}');
    expect(field).toContain('landing-expression-slice__tooltip');
    expect(field).toContain('Baseline');
    expect(field).toContain('Live change');
    expect(field).not.toContain('sphere');
    expect(integrationStyles).toContain('background: transparent');
    expect(integrationStyles).toContain('border-radius: 0');
    expect(fieldStyles).toContain('width: 100vw');
  });

  it('restores chat, evidence, and visible workflow progress without restoring field globes', () => {
    for (const marker of [
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'Reading your Baseline',
      'Keeping both people distinct',
      'Mapping the people',
      'v0-baseline-trace',
      'is-active',
      'is-complete'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
  });

  it('prevents stretched desktop and mobile product stages', () => {
    for (const marker of [
      'align-items: start !important',
      'grid-auto-rows: auto !important',
      'height: auto !important',
      'min-height: 0 !important',
      'display: block !important',
      'grid-template-columns: minmax(0, 1fr) !important',
      '@media (max-width: 760px)',
      'padding-block: 58px !important'
    ]) expect(layoutRepair).toContain(marker);
    expect(layoutRepair).toContain('.v0-composer-preview');
    expect(layoutRepair).toContain('.v0-workflow-panel ol');
    expect(layoutRepair).not.toContain('min-height: 690px');
    expect(layoutRepair).not.toContain('min-height: 720px');
  });

  it('makes the compact layout authoritative in the rendered page and refreshes stale iOS restores', () => {
    for (const marker of [
      'data-layout-release="compact-product-stories-v2"',
      'data-product-story-layout-authority="compact-v2"',
      'PRODUCT_STORY_LAYOUT_AUTHORITY',
      'grid-template-columns: minmax(0, 1fr) !important',
      'height: auto !important',
      'min-height: 0 !important'
    ]) expect(landing).toContain(marker);

    expect(main).toContain('function refreshStaleIosPageRestore');
    expect(main).toContain('event.persisted');
    expect(main).toContain("dataset.sovereignLayoutRelease = 'compact-product-stories-v2'");
  });

  it('keeps iOS sizing, touch targets, reduced motion, and non-pill controls', () => {
    expect(fieldStyles).toContain('@media (max-width: 760px)');
    expect(fieldStyles).toContain('touch-action: none');
    expect(fieldStyles).toContain('stroke-width: 34');
    expect(storyStyles).toContain('@media (max-width: 760px)');
    expect(storyStyles).toContain('@media (max-width: 390px)');
    expect(storyStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(layoutRepair).toContain('@media (max-width: 390px)');
    expect(layoutRepair).toContain('@media (prefers-reduced-motion: reduce)');
    expect(layoutRepair).toContain('min-height: 44px');
    expect(storyStyles).toContain('border-radius: 4px');
  });

  it('keeps the new CSS layers structurally balanced', () => {
    for (const source of [fieldStyles, integrationStyles, storyStyles, layoutRepair]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});