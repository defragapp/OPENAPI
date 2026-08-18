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
const approvedStyles = read('./public-landing-approved-v8.css');
const heroExtension = read('./landing-hero-field-v4.css');
const finalAuthority = read('./public-landing-final-authority.css');
const refinement = read('./experience-refinement-v1.css');
const renderedFidelity = read('./rendered-fidelity-v1.css');
const landingRefinementV2 = read('./landing-refinement-v2.css');
const landingRefinementV5 = read('./landing-live-refinement-v5.css');
const typography = read('./typography-system.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const languageAuthority = read('../../../docs/product-language-system.md');
const visualContract = read('../../../docs/v0-visual-port-contract.md');
const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public positioning reset', () => {
  it('preserves the visual cascade and mounts sans typography as the terminal inline authority', () => {
    const imports = [
      "import './landing-expression-field-v3.css';",
      "import './landing-expression-field-integration.css';",
      "import './v0-restored-product-stories.css';",
      "import './landing-product-stories-v2.css';",
      "import './public-landing-approved-v8.css';",
      "import './landing-hero-field-v4.css';",
      "import './deployed-route-cohesion.css';",
      "import './passkey-auth.css';"
    ];
    for (let index = 1; index < imports.length; index += 1) {
      expect(main.indexOf(imports[index]!)).toBeGreaterThan(main.indexOf(imports[index - 1]!));
    }
    expect(main.slice(main.indexOf(imports.at(-1)!) + imports.at(-1)!.length)).not.toContain("import './");
    expect(main).toContain("import sansTypographyAuthorityCss from './sans-typography-authority-v1.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;')).toBeGreaterThan(
      main.indexOf('style.textContent += `\\n${premiumActionAuthorityCss}`;')
    );
  });

  it('keeps the founder hero but explains the actual product immediately', () => {
    for (const marker of [
      'Healing isn’t optional.',
      'Holding onto the pain is.',
      '<LandingExpressionSlice />',
      '<RealLifeQuestions />',
      '<LandingProductStories />',
      'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',
      'Start with you',
      'Explore yourself.',
      'What does Alignment look like for me?',
      'How do I express myself when I’m clear?',
      'How do I create best?',
      'Start free · No card required',
      'Get started',
      'data-public-narrative="self-people-systems-v1"'
    ]) expect(landing).toContain(marker);

    expect(landing).not.toContain('<BaselineFoundation />');
    expect(landing).not.toContain('One private reference beneath every question.');
    expect(landing).not.toContain('One private foundation. More useful answers across the questions that shape your life.');
    expect(landing).not.toContain('calculated astronomical positions');
    expect(landing).not.toContain('partial Human Design');
    expect(landing).not.toContain('Gene Keys activations');
    expect(landing).not.toContain('numerology');
    expect(landing).not.toContain('capacity beneath');
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
    expect(landing).toContain("data-question-fallback={index === 0 ? 'visible' : undefined}");
  });

  it('enforces the canonical public hierarchy of You, your people, and whole systems', () => {
    for (const marker of [
      '## Experience hierarchy',
      '### 1. You',
      '### 2. You + your people',
      '### 3. From 1:1 to the whole system',
      '## What Baseline means publicly',
      '`A private reference built around you.`',
      'Do not use `foundation`, `personal foundation`, `private foundation`, or `one private foundation` as the primary public metaphor for Baseline.',
      '`Sovereign Display` is retired from rendered UI use.'
    ]) expect(languageAuthority).toContain(marker);

    for (const marker of [
      'section identity is `01 · You`',
      'section identity is `02 · You + your people`',
      'section identity is `03 · From 1:1 to the whole system`',
      '`Sovereign Display` and serif fallback typography are explicitly excluded from the active rendered product.'
    ]) expect(visualContract).toContain(marker);

    expect(landing).toContain('Most AI starts with the prompt. Sovereign starts with you.');
    expect(landing).toContain('Know yourself. Understand your people. See the whole system.');
  });

  it('retires the display serif from active typography authority', () => {
    expect(typography).not.toContain('font-family: "Sovereign Display"');
    expect(typography).not.toContain('/fonts/sovereign-display.woff2');
    expect(typography).toContain('font-family: var(--font-title) !important');
    expect(typography).toContain('--font-display: var(--font-title);');
    expect(typography).toContain('--serif: var(--font-title);');
    expect(typography).not.toContain('"Sovereign Sans"');
    expect(typography).toContain('"SF Pro Display"');
    expect(typography).not.toContain('Avenir Next');
    expect(sansAuthority).not.toContain('"Sovereign Sans"');
    expect(sansAuthority).not.toContain('Avenir Next');
    expect(sansAuthority).toContain('"SF Pro Display"');
    expect(sansAuthority).not.toContain('PREMIUM_TITLE_SCALE_V2');

    expect(sansAuthority).toContain('The retired display serif must not render anywhere in the active product.');
    expect(sansAuthority).toContain('.public-approved-v8 .v0-hero h1 > em');
    expect(sansAuthority).toContain('font-family: var(--font-title) !important');

    expect(landingRefinementV5).toContain('One typeface. Hierarchy comes from weight, scale, and opacity.');
    expect(landingRefinementV5).toContain('font-family: inherit !important');
    expect(landingRefinementV5).not.toContain('var(--font-display, Georgia, serif)');
    expect(landingRefinementV5).not.toContain('.landing-baseline-intro');
  });

  it('keeps one interactive line field with click-led minimal endpoint inspection', () => {
    for (const marker of [
      'const VIEWBOX_SIZE = 920',
      'const SPHERE_RADIUS = 286',
      'const TOOLTIP_WIDTH = 104',
      'const TOOLTIP_HEIGHT = 26',
      'data-field-geometry="spherical-360"',
      "data-inspecting={hasInspection ? 'true' : 'false'}",
      'onPointerDown={handlePointerDown}',
      'onPointerMove={handlePointerMove}',
      'onClick={(event) =>',
      'setHasInspection(true)',
      'hasInspection ? (',
      'landing-expression-slice__tooltip-title',
      'landing-expression-slice__tooltip-value',
      '{selected.axis.value}',
      'relative emphasis',
      'requestAnimationFrame'
    ]) expect(field).toContain(marker);
    expect(field).toContain('click a line to inspect it');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(field).not.toContain('measurement lines');
    expect(field).not.toContain('stable blue sphere');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
    expect(refinement).toContain('--landing-blue: #e8ddd0 !important');
    expect(renderedFidelity).toContain('--v8-blue: #d8d0c5 !important');
    expect(landingRefinementV5).toContain('width: 104px !important');
    expect(landingRefinementV5).toContain('height: 26px !important');
  });

  it('shows self exploration, relationship intelligence, and system intelligence as distinct product behavior', () => {
    for (const marker of [
      '01 · You',
      'Explore how you think, decide, create, connect, and grow.',
      'What does Alignment look like for me when I’m creating something new?',
      'How you tend to create',
      'What changes under pressure',
      'What feels aligned',
      'What to explore next',
      '02 · You + your people',
      'Understand both sides and what happens between you.',
      'Why does the same situation land differently for us?',
      '03 · From 1:1 to the whole system',
      'See the whole system.',
      'Why does everyone fall back into the same roles when my family is under pressure?',
      'Roles',
      'Perspectives',
      'Responsibilities',
      'Seeing the whole system'
    ]) expect(stories).toContain(marker);
    expect(renderedStories).toContain('<WorkflowPanel title="How Sovereign explores the question" steps={SELF_FLOW} surface="personal-reasoning" />');

    expect(renderedStories).not.toContain('Separate helping from carrying the outcome.');
    expect(renderedStories).not.toContain('See where responsibility keeps landing.');
    expect(stories).toContain('landing-workflow__progress');
    expect(stories).toContain("360 + step * 900");
    expect((stories.match(/<WorkflowPanel /g) ?? []).length).toBe(1);
    expect(renderedStories).not.toContain('Permitted context');
    expect(renderedStories).not.toContain('capacity beneath');
  });

  it('keeps exact supporting codes quiet and secondary', () => {
    for (const marker of ["{ code: 'GK 13.4'", "{ code: 'GATE 4.11'", "{ code: 'MARS · CANCER'", "{ code: 'GATE 22.4'", "{ code: 'GATE 57.2'"]) {
      expect(stories).toContain(marker);
    }
    expect(stories).toContain('<strong>Basis</strong>');
    expect(finalAuthority).toContain('.landing-evidence__code');
  });

  it('makes desktop demonstrations larger while making mobile proof shorter and swipeable', () => {
    for (const marker of [
      'width: min(1280px, calc(100% - 64px)) !important',
      'font-size: 0.92rem !important',
      'grid-template-columns: minmax(0, 1.34fr) minmax(320px, 0.66fr) !important',
      'landing-workflow__progress',
      'scroll-snap-type: inline mandatory !important',
      'grid-auto-columns: minmax(252px, 82vw) !important',
      '.landing-demo--system-context',
      'display: none !important'
    ]) expect(landingRefinementV2).toContain(marker);
    expect(approvedStyles).toContain('@media (max-width: 760px)');
    expect(heroExtension).toContain('@keyframes landing-real-question');
    expect(main).toContain('window.visualViewport');
  });

  it('keeps every active CSS layer structurally balanced', () => {
    for (const source of [fieldStyles, integrationStyles, storyStyles, approvedStyles, heroExtension, finalAuthority, refinement, renderedFidelity, landingRefinementV2, landingRefinementV5, typography, sansAuthority]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
