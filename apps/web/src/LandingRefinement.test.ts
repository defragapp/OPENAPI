import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const fieldStyles = read('./landing-expression-field-v3.css');
const integrationStyles = read('./landing-expression-field-integration.css');
const storyStyles = read('./landing-product-stories-v2.css');
const premiumV5Styles = read('./public-landing-premium-v5.css');
const premiumV6Styles = read('./public-landing-premium-v6.css');
const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public landing v3 release', () => {
  it('loads the integrated field, isolated product stories, premium v6, and passkey authority in order', () => {
    const fieldImport = "import './landing-expression-field-v3.css';";
    const integrationImport = "import './landing-expression-field-integration.css';";
    const storiesImport = "import './landing-product-stories-v2.css';";
    const premiumV5Import = "import './public-landing-premium-v5.css';";
    const premiumV6Import = "import './public-landing-premium-v6.css';";
    const passkeyImport = "import './passkey-auth.css';";
    expect(main.indexOf(integrationImport)).toBeGreaterThan(main.indexOf(fieldImport));
    expect(main.indexOf(storiesImport)).toBeGreaterThan(main.indexOf(integrationImport));
    expect(main.indexOf(premiumV5Import)).toBeGreaterThan(main.indexOf(storiesImport));
    expect(main.indexOf(premiumV6Import)).toBeGreaterThan(main.indexOf(premiumV5Import));
    expect(main.indexOf(passkeyImport)).toBeGreaterThan(main.indexOf(premiumV6Import));
  });

  it('renders the hero field followed by the three real product demonstrations', () => {
    expect(landing).toContain("import { LandingProductStories } from './LandingProductStories'");
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(landing).toContain('data-public-release="premium-public-v6"');
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
    expect(premiumV6Styles).toContain('min-height: clamp(330px, 34vw, 470px)');
  });

  it('renders chat, evidence, visible workflow progress, and the system map through isolated classes', () => {
    for (const marker of [
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'landing-evidence',
      'landing-workflow',
      'landing-system-map',
      'is-active',
      'is-complete'
    ]) expect(renderedStories).toContain(marker);

    for (const marker of [
      'Reading your Baseline',
      'Keeping both people distinct',
      'Mapping the people'
    ]) expect(stories).toContain(marker);

    expect(renderedStories).not.toContain('LandingExpressionFieldPreview');
    expect(renderedStories).not.toContain('sphere');
    expect(renderedStories).not.toContain('globe');
  });

  it('does not render the retired v0 showcase classes that caused the live stretch regression', () => {
    for (const marker of [
      '<div className="v0-story-grid"',
      '<article className="v0-window',
      '<div className="v0-window-body"',
      '<article className="v0-flow',
      '<article className="v0-workflow-panel"',
      '<div className="v0-family-system-map"'
    ]) expect(renderedStories).not.toContain(marker);
  });

  it('uses content-driven desktop panels and a real mobile column', () => {
    for (const marker of [
      '.landing-story__stage',
      'align-items: start',
      'height: auto',
      'min-height: 0',
      '@media (max-width: 900px)',
      'display: flex',
      'flex-direction: column',
      '@media (max-width: 760px)'
    ]) expect(storyStyles).toContain(marker);
    expect(storyStyles).not.toContain('min-height: 690px');
    expect(storyStyles).not.toContain('min-height: 720px');
    expect(storyStyles).not.toContain('height: 100%');
  });

  it('keeps iOS touch targets, safe widths, reduced motion, and non-boxed controls', () => {
    expect(fieldStyles).toContain('@media (max-width: 760px)');
    expect(fieldStyles).toContain('touch-action: none');
    expect(fieldStyles).toContain('stroke-width: 34');
    expect(storyStyles).toContain('width: calc(100% - 24px)');
    expect(storyStyles).toContain('min-height: 44px');
    expect(storyStyles).toContain('border-radius: 4px');
    expect(storyStyles).toContain('@media (max-width: 390px)');
    expect(storyStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(premiumV5Styles).toContain('clip-path: none');
    expect(premiumV6Styles).toContain('clip-path: none');
    expect(premiumV6Styles).toContain('border-bottom: 1px solid rgba(243, 236, 226, 0.46)');
    expect(premiumV6Styles).not.toContain('border-radius: 999px');
    expect(main).toContain('function refreshStaleIosPageRestore');
    expect(main).toContain('event.persisted');
    expect(main).toContain("dataset.sovereignLayoutRelease = 'premium-public-v6'");
  });

  it('keeps the new CSS layers structurally balanced', () => {
    for (const source of [fieldStyles, integrationStyles, storyStyles, premiumV5Styles, premiumV6Styles]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});