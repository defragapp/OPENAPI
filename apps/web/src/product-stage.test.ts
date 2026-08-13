import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const field = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const fieldStyles = readFileSync(new URL('./landing-expression-field-v3.css', import.meta.url), 'utf8');
const heroStyles = readFileSync(new URL('./landing-hero-field-v4.css', import.meta.url), 'utf8');
const storyStyles = readFileSync(new URL('./v0-restored-product-stories.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('shared Sovereign intelligence stage', () => {
  it('uses the integrated field, real-life questions, restored chats, and authenticated answer hierarchy', () => {
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).toContain('<LandingProductStories />');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('landing-expression-slice__readout');
    expect(field).toContain('data-field-geometry="spherical-360"');
    expect(stories).toContain('Sovereign — Chat');
    expect(stories).toContain('Sovereign — Shared Chat');
    expect(stories).toContain('Sovereign — Family System');
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<RelationshipAnswer');
    expect(workspace).toContain('<SystemAnswer');
    expect(workspace).toContain('<BasisStrip');
  });

  it('keeps expression, evidence, and actual experience distinct', () => {
    expect(field).toContain('Illustrative Baseline');
    expect(field).toContain('Qualitative expression emphasis · sanitized example');
    expect(field).toContain('not a diagnosis, score, or claim about anyone’s internal state');
    expect(field).toContain('line length follows relative expression reach');
    expect(stories).toContain('With permission, Sovereign keeps both people distinct');
    expect(stories).toContain('Each person controls what may be included');
    expect(stories).toContain('v0-baseline-trace');
  });

  it('is responsive, interactive, and reduced-motion safe', () => {
    expect(field).toContain('role="button"');
    expect(field).toContain('tabIndex={0}');
    expect(field).toContain('onPointerDown');
    expect(field).toContain('onPointerMove');
    expect(field).toContain('onFocus={() => selectAxis(axis.id)}');
    expect(field).toContain('onClick={(event) =>');
    expect(field).toContain('onKeyDown={(event) => handleKeyDown(event, axis.id)}');
    expect(field).toContain('prefers-reduced-motion: reduce');
    expect(stories).toContain('aria-current');
    expect(workspace).toContain('const limit = mobile ? 3 : 5');
    expect(fieldStyles).toContain('@media (max-width: 760px)');
    expect(fieldStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(heroStyles).toContain('@media (max-width: 760px)');
    expect(heroStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(storyStyles).toContain('@media (max-width: 760px)');
    expect(storyStyles).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
