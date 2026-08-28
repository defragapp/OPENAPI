import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const fieldStyles = read('./public.css');
const integrationStyles = read('./public.css');
const storyStyles = read('./public.css');
const approvedStyles = read('./public.css');
const heroExtension = read('./public.css');
const finalAuthority = read('./releases.css');
const refinement = read('./releases.css');
const renderedFidelity = read('./releases.css');
const landingRefinementV2 = read('./releases.css');
const landingRefinementV5 = read('./releases.css');
const intelligenceDemoStyles = read('./releases.css');
const typography = read('./design-system.css');
const sansAuthority = read('./design-system.css');
const languageAuthority = read('../../../docs/product-language-system.md');
const visualContract = read('../../../docs/v0-visual-port-contract.md');
const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public positioning reset', () => {
  it('preserves the visual cascade and keeps production visual authority terminal', () => {
    const imports = [
      "import './design-system.css';",
      "import './public.css';",
      "import './workspace.css';",
      "import './app-shell.css';",
      "import './passkey-auth.css';"
    ];
    for (let index = 1; index < imports.length; index += 1) {
      expect(main.indexOf(imports[index]!)).toBeGreaterThan(main.indexOf(imports[index - 1]!));
    }
    expect(main).toContain("import releasesCss from './releases.css?inline';");
  });

  it('keeps the founder hero but explains the actual product immediately', () => {
    for (const marker of [
      'Healing isn\u2019t optional.',
      'Holding onto the pain is.',
      '<LandingExpressionSlice />',
      '<RealLifeQuestions />',
      '<LandingProductStories />',
      'Sovereign.OS builds your private Baseline — the intelligence reference that carries across every conversation.',
      'How do I make decisions that actually fit me?',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      'How does pressure move through this team?',
      'Private by design · Your data never trains a model',
      'Build your Baseline',
      'data-public-narrative="self-people-systems-v1"'
    ]) expect(landing).toContain(marker);

    expect(landing).not.toContain('<BaselineFoundation />');
    expect(landing).not.toContain('One private reference beneath every question.');
    expect(landing).not.toContain('One private foundation. More useful answers across the questions that shape your life.');
    expect(landing).not.toContain('calculated astronomical positions');
    expect(landing).not.toContain('partial Human Design');
    expect(landing).not.toContain('Gene Keys activations');
    expect(landing).not.toContain('numerology');
    expect(landing).not.toContain('server-approved Basis');
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
    expect(landing).toContain("data-question-fallback={index === 0 ? 'visible' : undefined}");
  });

  it('enforces the canonical public hierarchy and source-detail vocabulary boundary', () => {
    for (const marker of [
      '## Experience hierarchy',
      '### 1. You',
      '### 2. You + your people',
      '### 3. From 1:1 to the whole system',
      '## What Baseline means publicly',
      '`A private reference built around you.`',
      '### User-facing vocabulary boundary',
      '`Basis` remains the internal/server contract name',
      '**Sources** or **See source details**',
      '## Retired and prohibited phrasing',
      '`Sovereign Display` is retired from rendered UI use.',
      '**See why the same moment lands differently—and how to bridge the gap.**'
    ]) expect(languageAuthority).toContain(marker);

    for (const marker of [
      'section identity is `01 · You`',
      'section identity is `02 · You + your people`',
      'section identity is `03 · From 1:1 to the whole system`',
      'source codes stay hidden by default behind a plain `See source details` disclosure',
      '`Sovereign Display` and serif fallback typography are explicitly excluded from the active rendered product.'
    ]) expect(visualContract).toContain(marker);

    expect(landing).toContain('Sovereign starts');
    expect(landing).toContain('Know yourself. Understand your people. See the whole system.');
  });

  it('uses the canonical self-hosted Geist Sans title authority', () => {
    for (const source of [typography, sansAuthority]) {
      expect(source).toContain("\"Geist Sans\"");

      expect(source).toContain('-apple-system');
      expect(source).toContain('"SF Pro Display"');
      expect(source).toContain('"Segoe UI Variable Display"');
      expect(source).toContain('"Segoe UI"');
      expect(source).toContain('font-family: var(--font-title) !important');
      expect(source).not.toContain('\n    Optima,');
      expect(source).not.toContain('\n    "Avenir Next",');
      expect(source).not.toContain('font-family: "Sovereign Display"');
      expect(source).not.toContain('font-family: "Sovereign Sans"');
    }
    expect(typography).not.toContain('/fonts/sovereign-display.woff2');
    expect(typography).toContain('--font-display: var(--font-title);');
    expect(typography).toContain('--serif: var(--font-title);');
    expect(typography.indexOf('-apple-system')).toBeLessThan(typography.indexOf('"SF Pro Display"'));
    expect(sansAuthority.indexOf('-apple-system')).toBeLessThan(sansAuthority.indexOf('"SF Pro Display"'));
    expect(sansAuthority).toContain('--font-title:');
    expect(landingRefinementV5).toContain('One typeface. Hierarchy comes from weight, scale, and opacity.');
    expect(landingRefinementV5).toContain('font-family: inherit !important');
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
      'landing-expression-slice__tooltip-title',
      'landing-expression-slice__tooltip-value',
      '{selected.axis.value}',
      'relative emphasis',
      'requestAnimationFrame'
    ]) expect(field).toContain(marker);
    expect(field).toContain('click a line to inspect it');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
    expect(refinement).toContain('--landing-blue: #e8ddd0 !important');
    expect(renderedFidelity).toContain('--v8-blue: #d8d0c5 !important');
  });

  it('shows self, relationship, and system intelligence as substantive product behavior in approved language', () => {
    for (const marker of [
      '01 · YOU',
      '02 · YOU & YOUR PEOPLE',
      '03 · WHOLE SYSTEM',
      'demo-selector',
      'demo-card',
      'See source details',
      'Representative example · Not your Baseline Design'
    ]) expect(stories).toContain(marker);

    expect((stories.match(/<WorkflowPanel/g) ?? []).length).toBe(0);
    expect(stories).not.toContain('landing-workflow__progress');
    expect(stories).not.toContain('280 + step * 760');
    expect(renderedStories).not.toContain('<FamilySystemMap />');
    expect(renderedStories).not.toContain('<RelationshipContext />');
    expect(renderedStories).not.toContain('<SystemContext />');
    expect(renderedStories).not.toContain('Permitted context');
    expect(renderedStories).not.toContain('capacity beneath');
    expect(renderedStories).not.toContain('permitted perspectives');
    expect(renderedStories).not.toContain('confirmed responsibilities');
  });

  it('keeps exact fixture-backed source codes secondary and collapsed by default', () => {
    for (const marker of ["{ code: 'tenderness'", "{ code: 'responsibility'", "{ code: 'boundaries'", "{ code: 'clarity □ steadiness'"]) {
      expect(stories).toContain(marker);
    }
    expect(stories).toContain('<details className="landing-evidence">');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(stories).toContain('These values are not visitor data.');
    expect(stories).not.toContain('<strong>Example Basis</strong>');
    expect(stories).not.toContain("chips: ['HD G13.1'");
    expect(stories).not.toContain('GATE 4.11');
    expect(finalAuthority).toContain('.landing-evidence__code');
    expect(intelligenceDemoStyles).toContain('.landing-evidence > summary');
  });

  it('places simplified demo before source details and anchors the composer outside the answer body', () => {
    expect(stories).toContain('demo-selector');
    expect(stories).toContain('demo-card');
    expect(stories).toContain('landing-evidence');
    expect(intelligenceDemoStyles).toContain('.landing-demo__composer-shell');
    expect(intelligenceDemoStyles).toContain('flex: 1 1 auto !important;');
    expect(intelligenceDemoStyles).toContain('grid-template-columns: repeat(5, minmax(0, 1fr)) !important;');
  });

  it('makes desktop demonstrations larger while making mobile proof shorter and swipeable', () => {
    for (const marker of [
      'width: min(1280px, calc(100% - 64px)) !important',
      'font-size: 0.92rem !important',
      'scroll-snap-type: inline mandatory !important',
      'grid-auto-columns: minmax(252px, 82vw) !important'
    ]) expect(landingRefinementV2).toContain(marker);
    expect(intelligenceDemoStyles).toContain('grid-template-columns: minmax(320px, .88fr) minmax(0, 1.12fr) !important;');
    expect(intelligenceDemoStyles).toContain('@media (max-width: 900px)');
    expect(intelligenceDemoStyles).toContain('@media (max-width: 760px)');
    expect(approvedStyles).toContain('@media (max-width: 760px)');
    expect(heroExtension).toContain('@keyframes landing-real-question');
    expect(main).toContain('window.visualViewport');
  });

  it('keeps every active CSS layer structurally balanced', () => {
    for (const source of [fieldStyles, integrationStyles, storyStyles, approvedStyles, heroExtension, finalAuthority, refinement, renderedFidelity, landingRefinementV2, landingRefinementV5, intelligenceDemoStyles, typography, sansAuthority]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});