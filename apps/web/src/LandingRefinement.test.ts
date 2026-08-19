import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));
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
const seniorSystem = read('./senior-design-system-v1.css');
const demoV2 = read('./public-intelligence-demonstration-v2.css');
const languageAuthority = read('../../../docs/product-language-system.md');
const visualContract = read('../../../docs/v0-visual-port-contract.md');

describe('public positioning reset', () => {
  it('preserves the component cascade and gives the new public demo sub-system the final narrow authority', () => {
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
    for (let index = 1; index < imports.length; index += 1) expect(main.indexOf(imports[index]!)).toBeGreaterThan(main.indexOf(imports[index - 1]!));
    const senior = main.indexOf('style.textContent += `\\n${seniorDesignSystemCss}`;');
    const demos = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationV2Css}`;');
    expect(demos).toBeGreaterThan(senior);
    expect(main.slice(demos + 'style.textContent += `\\n${publicIntelligenceDemonstrationV2Css}`;'.length)).not.toContain('style.textContent +=');
  });

  it('keeps the founder hero and actual public product hierarchy intact', () => {
    for (const marker of [
      'Healing isn’t optional.',
      'Holding onto the pain is.',
      '<LandingExpressionSlice />',
      '<RealLifeQuestions />',
      '<LandingProductStories />',
      'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',
      'You → your people → the whole system',
      'Start with yourself. Expand outward when it matters.',
      'How do I make decisions that actually fit me?',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      'Start free · No card required',
      'Get started',
      'data-public-narrative="self-people-systems-v1"'
    ]) expect(landing).toContain(marker);
    expect(landing).not.toContain('<BaselineFoundation />');
    expect(landing).not.toContain('capacity beneath');
  });

  it('keeps the canonical public language and sans-only rendered typography boundary', () => {
    for (const marker of [
      '### 1. You',
      '### 2. You + your people',
      '### 3. From 1:1 to the whole system',
      '### User-facing vocabulary boundary',
      '`Sovereign Display` is retired from rendered UI use.'
    ]) expect(languageAuthority).toContain(marker);
    expect(visualContract).toContain('section identity is `01 · You`');
    expect(visualContract).toContain('source codes stay hidden by default behind a plain `See source details` disclosure');
    for (const source of [typography, sansAuthority, seniorSystem]) {
      expect(source).toContain('-apple-system');
      expect(source).toContain('"SF Pro Display"');
      expect(source).not.toContain('\n    Optima,');
      expect(source).not.toContain('\n    "Avenir Next",');
    }
    expect(landingRefinementV5).not.toContain('var(--font-display, Georgia, serif)');
  });

  it('keeps one interactive hero line field with click-led inspection', () => {
    for (const marker of [
      'const VIEWBOX_SIZE = 920',
      'const SPHERE_RADIUS = 286',
      'const TOOLTIP_WIDTH = 104',
      'const TOOLTIP_HEIGHT = 26',
      'data-field-geometry="spherical-360"',
      "data-inspecting={hasInspection ? 'true' : 'false'}",
      'onPointerDown={handlePointerDown}',
      'onPointerMove={handlePointerMove}',
      'setHasInspection(true)',
      '{selected.axis.value}',
      'requestAnimationFrame'
    ]) expect(field).toContain(marker);
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
  });

  it('shows self, relationship, and system intelligence as edited AI answers rather than processing diagrams', () => {
    for (const marker of [
      '01 · You',
      'Explore how you think, decide, communicate, create, connect, and grow.',
      'How do I make decisions that actually fit me?',
      'The right decision may not be the easiest one to explain.',
      '02 · You + your people',
      'See why the same moment lands differently—and how to bridge the gap.',
      'You may both be trying to reach clarity in opposite ways.',
      '03 · From 1:1 to the whole system',
      'See the whole system.',
      'When one person changes roles, the system has to find another route.',
      '<DecisionField />',
      '<RelationshipField />',
      '<SystemField />',
      'Does this fit?',
      '<strong>See source details</strong>'
    ]) expect(renderedStories).toContain(marker);
    expect(renderedStories).not.toContain('function WorkflowPanel(');
    expect(renderedStories).not.toContain('useWorkflowProgress');
    expect(renderedStories).not.toContain('data-motion-state');
  });

  it('keeps source codes secondary and collapsed by default', () => {
    for (const marker of ["{ code: 'HD G13.1'", "{ code: 'GK ACT13'", "{ code: '☉ CAN 04.2°'", "{ code: 'HD G22.4'", "{ code: 'HD G57.2'", "{ code: 'REL ☿ □ ☿ 1.8°'"]) expect(stories).toContain(marker);
    expect(renderedStories).toContain('<details className="landing-evidence">');
    expect(renderedStories).toContain('<strong>See source details</strong>');
    expect(renderedStories).toContain('These values are not visitor data.');
    expect(renderedStories).not.toContain('<strong>Example Basis</strong>');
    expect(finalAuthority).toContain('.landing-evidence__code');
  });

  it('uses one coherent visual grammar that grows from person to relationship to system', () => {
    for (const marker of [
      '.landing-understanding--decision',
      '.decision-field__choice',
      '.decision-field__adapt',
      '.landing-understanding--relationship',
      '.relationship-field__people',
      '.relationship-field__center',
      '.relationship-field__bridge',
      '.landing-understanding--system',
      '.system-field__state',
      '.system-field__route--direct'
    ]) expect(demoV2).toContain(marker);
    expect(renderedStories).toContain('className="system-field__state system-field__state--current"');
    expect(renderedStories).toContain('className="system-field__state system-field__state--changed"');
    expect(demoV2).toContain('grid-template-columns: minmax(0, 1.18fr) minmax(360px, .82fr) !important');
    expect(demoV2).toContain('@media (max-width: 760px)');
  });

  it('uses finite reveal motion only and leaves all meaning present under reduced motion', () => {
    for (const marker of [
      '@keyframes public-demo-arrive-v2',
      '@keyframes public-demo-line-v2',
      '@keyframes public-demo-resolve-v2',
      '@media (prefers-reduced-motion: reduce)',
      'animation: none !important',
      'opacity: 1 !important'
    ]) expect(demoV2).toContain(marker);
    expect(demoV2).not.toContain('infinite');
  });

  it('keeps all active CSS layers structurally balanced', () => {
    for (const source of [fieldStyles, integrationStyles, storyStyles, approvedStyles, heroExtension, finalAuthority, refinement, renderedFidelity, landingRefinementV2, landingRefinementV5, typography, sansAuthority, seniorSystem, demoV2]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});