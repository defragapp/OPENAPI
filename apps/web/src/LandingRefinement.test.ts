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
const languageAuthority = read('../../../docs/product-language-system.md');
const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('approved public landing v8', () => {
  it('preserves the founder cascade and loads the final landing authority after prior live refinements', () => {
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
    expect(main).toContain("import renderedFidelityCss from './rendered-fidelity-v1.css?inline';");
    expect(main).toContain("import landingRefinementV2Css from './landing-refinement-v2.css?inline';");
    expect(main).toContain("import landingLiveRefinementV5Css from './landing-live-refinement-v5.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${landingLiveRefinementV5Css}`;')).toBeGreaterThan(
      main.indexOf('style.textContent += `\\n${landingLiveRefinementV4Css}`;')
    );
    expect(main.indexOf('style.textContent += `\\n${invitationRenderedFidelityCss}`;')).toBeGreaterThan(
      main.indexOf('style.textContent += `\\n${landingLiveRefinementV5Css}`;')
    );
  });

  it('keeps the founder hero while making the opening value proposition explicit', () => {
    for (const marker of [
      'Healing isn’t optional.',
      'Holding onto the pain is.',
      '<LandingExpressionSlice />',
      '<BaselineFoundation />',
      '<RealLifeQuestions />',
      '<LandingProductStories />',
      'Build a private Baseline once.',
      'One private reference beneath every question.',
      'calculated astronomical positions and selected interpretive frameworks',
      'What this unlocks',
      'One private foundation. More useful answers across the questions that shape your life.',
      'Why do we keep having the same argument even when we both want it to stop?',
      'Start free · No card required',
      'Get started'
    ]) expect(landing).toContain(marker);
    expect(landing.indexOf('<BaselineFoundation />')).toBeLessThan(landing.indexOf('<RealLifeQuestions />'));
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
    expect(landing).toContain("data-question-fallback={index === 0 ? 'visible' : undefined}");
    expect(landing).not.toContain('capacity beneath');
  });

  it('implements the canonical Baseline-first hierarchy without leading with internal capacity language', () => {
    for (const marker of [
      '## Experience hierarchy',
      'Baseline Design is the foundation.',
      'A visitor arrives with an ordinary real-life question',
      'Relationship and system intelligence extend that same foundation outward.',
      'The technical machinery stays underneath the experience.',
      '### Public translation rule',
      'must not lead the public landing, demo headings, share metadata, or the first explanation of the product'
    ]) expect(languageAuthority).toContain(marker);

    expect(landing).toContain('A blank conversation starts with the prompt. Sovereign starts with your Baseline.');
    expect(landing).not.toContain('Generic AI sees the prompt. Sovereign sees the context.');
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

  it('gives the hero deliberate type contrast, controlled entry motion, and a real Baseline introduction', () => {
    for (const marker of [
      '.v0-hero h1 > span',
      'font-family: var(--font-subheading',
      '.v0-hero h1 > em',
      'font-family: var(--font-display',
      '@keyframes sovereign-hero-rise',
      '@keyframes sovereign-field-arrive',
      '.landing-baseline-intro__heading',
      '.landing-baseline-intro__principles',
      '.landing-baseline-intro__value',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(landingRefinementV5).toContain(marker);
  });

  it('shows self, relationship, and system reasoning as distinct product behavior', () => {
    for (const marker of [
      'What your Baseline supports',
      'Where responsibility shifts',
      'A cleaner boundary'
    ]) expect(stories).toContain(marker);

    for (const marker of [
      'Separate helping from carrying the outcome.',
      'How Sovereign gets there',
      'Understand what happens between you.',
      'See where responsibility keeps landing.',
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'Shared with permission',
      'Illustrative supplied context',
      'Observed route',
      'Testable change',
      'What to test',
      'That is a system pattern—not proof that any one person is the cause.'
    ]) expect(renderedStories).toContain(marker);

    expect(stories).toContain('landing-workflow__progress');
    expect(stories).toContain("360 + step * 900");
    expect((stories.match(/<WorkflowPanel /g) ?? []).length).toBe(1);
    expect(stories).not.toContain("role: 'Stabilizer'");
    expect(stories).not.toContain("role: 'Catalyst'");
    expect(stories).not.toContain("role: 'Observer'");
    expect(stories).not.toContain("role: 'Anchor'");
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
    for (const source of [fieldStyles, integrationStyles, storyStyles, approvedStyles, heroExtension, finalAuthority, refinement, renderedFidelity, landingRefinementV2, landingRefinementV5]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
