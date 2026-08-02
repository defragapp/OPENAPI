import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const slice = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const releaseStyles = readFileSync(new URL('./v0-single-example-release.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('shared Sovereign intelligence stage', () => {
  it('uses one visible interactive field publicly and the real answer hierarchy after authentication', () => {
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('One place to understand what keeps happening.');
    expect(slice).toContain('See what is active before it repeats.');
    expect(slice).toContain('landing-expression-slice__beam');
    expect(slice).toContain('landing-expression-slice__tooltip');
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<RelationshipAnswer');
    expect(workspace).toContain('<SystemAnswer');
    expect(workspace).toContain('<BasisStrip');
  });

  it('keeps illustrative expression, explanation, and actual experience distinct', () => {
    expect(slice).toContain('Illustrative Baseline');
    expect(slice).toContain('relative expression in a sanitized example');
    expect(slice).toContain('not a diagnosis, score, or claim about anyone’s internal state');
    expect(landing).toContain('With permission, keep both people distinct');
    expect(landing).toContain('permitted relationship or system information');
  });

  it('is responsive, interactive, and reduced-motion safe', () => {
    expect(slice).toContain('role="button"');
    expect(slice).toContain('tabIndex={0}');
    expect(slice).toContain('onPointerEnter');
    expect(slice).toContain('onFocus');
    expect(slice).toContain('onClick');
    expect(workspace).toContain('const limit = mobile ? 3 : 5');
    expect(releaseStyles).toContain('@media (max-width: 760px)');
    expect(releaseStyles).toContain('@media (max-width: 380px)');
    expect(releaseStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(releaseStyles).toContain('stroke-width: 30');
  });
});
