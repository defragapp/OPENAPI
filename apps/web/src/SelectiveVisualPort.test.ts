import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const expressionRenderer = read('./expression-field/ExpressionField.tsx');
const relationshipField = read('./expression-field/RelationalExpressionField.tsx');
const systemField = read('./expression-field/SystemExpressionField.tsx');
const expressionCss = read('./expression-field/expression-field.css');
const v0Visual = read('./v0-visual-port.css');
const fieldCss = read('./landing-expression-field-v3.css');
const integrationCss = read('./landing-expression-field-integration.css');
const heroExtension = read('./landing-hero-field-v4.css');
const landingRefinementV5 = read('./landing-live-refinement-v5.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const seniorSystem = read('./senior-design-system-v1.css');
const demoV2 = read('./public-intelligence-demonstration-v2.css');
const main = read('./main.tsx');

describe('founder selective visual port', () => {
  it('keeps the integrated interactive 360 field at the opening with click-led inspection', () => {
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).not.toContain('<BaselineFoundation />');
    expect(field).toContain('expressionAxisRegistryById');
    expect(field).toContain('buildLandingAxes');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('onPointerDown');
    expect(field).toContain('onPointerMove');
    expect(field).toContain('onFocus={() => selectAxis(axis.id)}');
    expect(field).toContain('onClick={(event) =>');
    expect(field).toContain('setHasInspection(true)');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(field).toContain('data-field-geometry="spherical-360"');
    expect(field).toContain('buildSphereGrid');
    expect(field).toContain('TOOLTIP_WIDTH = 104');
    expect(field).toContain('TOOLTIP_HEIGHT = 26');
    expect(integrationCss).toContain('background: transparent');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
    expect(landingRefinementV5).toContain('width: 104px !important');
  });

  it('starts with broad self exploration rather than mechanics or a problem-only framing', () => {
    expect(landing).toContain('Start with yourself. Expand outward when it matters.');
    expect(landing).toContain('Explore yourself');
    expect(landing).toContain('How do I make decisions that actually fit me?');
    expect(landing).toContain('How do I know when I’m adapting too early?');
    expect(landing).not.toContain('One private reference beneath every question.');
    expect(landing).not.toContain('One private foundation.');
    expect(landing).not.toContain('calculated astronomical positions');
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
  });

  it('uses three integrated text-first product demonstrations without duplicate expression fields or workflow UI', () => {
    expect(landing).toContain('<LandingProductStories />');
    for (const marker of [
      '01 · You',
      '02 · You + your people',
      '03 · From 1:1 to the whole system',
      'Explore how you think, decide, communicate, create, connect, and grow.',
      'See why the same moment lands differently—and how to bridge the gap.',
      'See the whole system.',
      '<DecisionField />',
      '<RelationshipField />',
      '<SystemField />',
      'data-product-stories="text-first-intelligence-v2"'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('function WorkflowPanel(');
    expect(stories).not.toContain('useWorkflowProgress');
    expect(stories).not.toContain('LandingExpressionFieldPreview');
  });

  it('preserves the canonical single-room workspace and production data sources', () => {
    expect(workspace).toContain("type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'");
    expect(workspace).toContain("accept': 'application/vnd.sovereign.answer+json'");
    expect(workspace).toContain("api('/api/v1/people')");
    expect(workspace).toContain("api('/api/v1/systems')");
    expect(workspace).toContain("api('/api/v1/today')");
    expect(workspace).toContain('className="relationship-answer"');
    expect(workspace).toContain('className="system-graph"');
    expect(workspace).toContain('className="basis-strip"');
    expect(workspace).toContain('<WorkspaceExpressionField');
    expect(workspace).toContain('<ThreadExpressionField');
    expect(expressionRenderer).toContain('export function ExpressionFieldRenderer');
    expect(relationshipField).toContain('<ExpressionFieldRenderer');
    expect(systemField).toContain('<ExpressionFieldRenderer');
  });

  it('applies the mature global system with a narrow text-first demo authority', () => {
    for (const selector of ['.intelligence-workspace', '.intelligence-sidebar', '.sovereign-composer', '.surface-heading', '.account-shell', '.auth-panel']) expect(v0Visual).toContain(selector);
    expect(landingRefinementV5).not.toContain('.landing-baseline-intro');
    expect(landingRefinementV5).not.toContain('var(--font-display, Georgia, serif)');
    expect(sansAuthority).toContain('.public-approved-v8 .v0-hero h1 > em');
    expect(seniorSystem).toContain('--sds-shell: min(1180px, calc(100vw - 64px))');
    expect(demoV2).toContain('.landing-intelligence-demo');
    expect(demoV2).toContain('.landing-understanding--relationship');
    expect(demoV2).toContain('.landing-understanding--system');
    expect(expressionCss).toContain('min-height: 44px');
    expect(main).toContain("import seniorDesignSystemCss from './senior-design-system-v1.css?inline';");
    expect(main).toContain("import publicIntelligenceDemonstrationV2Css from './public-intelligence-demonstration-v2.css?inline';");
  });

  it('keeps the public demonstrations permission-safe, score-free, and source-detail quiet', () => {
    for (const marker of [
      'Both people choose what they share',
      'Only they can say what they actually felt or intended',
      'Roles and events are supplied in the example',
      '<strong>See source details</strong>',
      'Does this fit?'
    ]) expect(stories).toContain(marker);
    for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'compatibilityScore', 'compatibilityPercent']) expect(stories).not.toContain(prohibited);
  });

  it('does not introduce archive mock runtime, alternate architecture, or decorative perpetual motion', () => {
    expect(landing).not.toContain('localStorage');
    const source = `${landing}\n${stories}\n${field}\n${expressionRenderer}\n${relationshipField}\n${systemField}\n${v0Visual}\n${fieldCss}\n${heroExtension}`;
    for (const prohibited of ['Math.random', 'generateAIResponse', 'Demo User', 'dashboard-grid', 'mock-auth', 'fake-answer']) expect(source).not.toContain(prohibited);
    expect(demoV2).not.toContain('infinite');
    expect(demoV2).toContain('@media (prefers-reduced-motion: reduce)');
  });
});