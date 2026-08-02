import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const field = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const expressionRenderer = readFileSync(new URL('./expression-field/ExpressionField.tsx', import.meta.url), 'utf8');
const relationshipField = readFileSync(new URL('./expression-field/RelationalExpressionField.tsx', import.meta.url), 'utf8');
const systemField = readFileSync(new URL('./expression-field/SystemExpressionField.tsx', import.meta.url), 'utf8');
const expressionCss = readFileSync(new URL('./expression-field/expression-field.css', import.meta.url), 'utf8');
const v0Visual = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const fieldCss = readFileSync(new URL('./landing-expression-field-v3.css', import.meta.url), 'utf8');
const integrationCss = readFileSync(new URL('./landing-expression-field-integration.css', import.meta.url), 'utf8');
const storyCss = readFileSync(new URL('./v0-restored-product-stories.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('founder v0 selective visual port', () => {
  it('ports the integrated interactive field at the opening', () => {
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(field).toContain('LANDING_AXIS_LAYOUT');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('landing-expression-slice__hit');
    expect(field).toContain('onPointerDown');
    expect(field).toContain('onPointerMove');
    expect(field).toContain('onPointerEnter');
    expect(field).not.toContain('sphere');
    expect(integrationCss).toContain('background: transparent');
  });

  it('restores chat and workflow demonstrations without restoring expression globes', () => {
    expect(landing).toContain('<LandingProductStories />');
    for (const marker of [
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'v0-baseline-trace',
      'v0-workflow-panel',
      'v0-family-system-map'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
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

  it('applies founder language to authenticated surfaces and the complete public landing', () => {
    for (const selector of ['.intelligence-workspace', '.intelligence-sidebar', '.sovereign-composer', '.surface-heading', '.account-shell', '.auth-panel']) expect(v0Visual).toContain(selector);
    for (const selector of ['.landing-expression-slice', '.landing-expression-slice__beam', '.landing-expression-slice__tooltip']) expect(fieldCss).toContain(selector);
    for (const selector of ['.v0-restored-product-stories', '.v0-story-grid', '.v0-workflow-panel', '.v0-family-system-map']) expect(storyCss).toContain(selector);
    expect(expressionCss).toContain('min-height: 44px');
    expect(main).toContain("import './landing-expression-field-integration.css';");
    expect(main).toContain("import './v0-restored-product-stories.css';");
  });

  it('does not introduce the archive mock runtime, scores, or alternate architecture', () => {
    expect(landing).not.toContain('localStorage');
    const source = `${landing}\n${stories}\n${field}\n${expressionRenderer}\n${relationshipField}\n${systemField}\n${v0Visual}\n${fieldCss}\n${storyCss}`;
    for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'generateAIResponse', 'Demo User', 'dashboard-grid', 'mock-auth', 'fake-answer']) {
      expect(source).not.toContain(prohibited);
    }
  });
});
