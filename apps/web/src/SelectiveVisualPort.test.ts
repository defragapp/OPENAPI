import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const slice = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const expressionRenderer = readFileSync(new URL('./expression-field/ExpressionField.tsx', import.meta.url), 'utf8');
const relationshipField = readFileSync(new URL('./expression-field/RelationalExpressionField.tsx', import.meta.url), 'utf8');
const systemField = readFileSync(new URL('./expression-field/SystemExpressionField.tsx', import.meta.url), 'utf8');
const expressionCss = readFileSync(new URL('./expression-field/expression-field.css', import.meta.url), 'utf8');
const v0Visual = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const releaseCss = readFileSync(new URL('./v0-single-example-release.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('founder v0 selective visual port', () => {
  it('ports one immediate interactive public example', () => {
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v2"');
    expect(landing).toContain('One place to understand what keeps happening.');
    expect(slice).toContain('LANDING_AXIS_LAYOUT');
    expect(slice).toContain("'clarity'");
    expect(slice).toContain("'responsibility'");
    expect(slice).toContain("'repair'");
    expect(slice).toContain('landing-expression-slice__beam');
    expect(slice).toContain('landing-expression-slice__hit');
    expect(slice).toContain('onPointerEnter');
    expect(slice).toContain('onFocus');
    expect(slice).toContain('onClick');
    expect(slice).not.toContain('sphere');
  });

  it('keeps the public example distinct from actual user data', () => {
    expect(slice).toContain('Illustrative Baseline');
    expect(slice).toContain('sanitized example');
    expect(slice).toContain('not a diagnosis, score, or claim about anyone’s internal state');
    expect(landing).toContain('With permission, keep both people distinct');
    expect(landing).toContain('permitted relationship or system information');
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
    expect(relationshipField).not.toContain('<line');
    expect(systemField).not.toContain('system-center');
  });

  it('applies the founder language to authenticated surfaces and the new public field', () => {
    for (const selector of [
      '.intelligence-workspace',
      '.intelligence-sidebar',
      '.intelligence-context',
      '.sovereign-composer',
      '.surface-heading',
      '.account-shell',
      '.auth-panel',
      '.workspace-sheet'
    ]) expect(v0Visual).toContain(selector);
    for (const selector of [
      '.landing-expression-slice',
      '.landing-expression-slice__beam',
      '.landing-expression-slice__tooltip',
      '.v0-capability-summary'
    ]) expect(releaseCss).toContain(selector);
    expect(releaseCss).toContain('@media (max-width: 760px)');
    expect(releaseCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(expressionCss).toContain('min-height: 44px');
    expect(main).toContain("import './v0-visual-port.css';");
    expect(main).toContain("import './v0-single-example-release.css';");
  });

  it('does not introduce the archive mock runtime, scores, or alternate architecture', () => {
    expect(landing).not.toContain('localStorage');
    const source = `${landing}\n${slice}\n${expressionRenderer}\n${relationshipField}\n${systemField}\n${v0Visual}\n${releaseCss}`;
    for (const prohibited of [
      'Alignment Score',
      'Stability Index',
      'Growth Rate',
      'Math.random',
      'generateAIResponse',
      'Demo User',
      'dashboard-grid',
      'mock-auth',
      'fake-answer'
    ]) expect(source).not.toContain(prohibited);
  });
});
