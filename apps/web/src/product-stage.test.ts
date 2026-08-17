import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const field = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const fieldStyles = readFileSync(new URL('./landing-expression-field-v3.css', import.meta.url), 'utf8');
const heroStyles = readFileSync(new URL('./landing-hero-field-v4.css', import.meta.url), 'utf8');
const storyStyles = readFileSync(new URL('./v0-restored-product-stories.css', import.meta.url), 'utf8');
const refinementStyles = readFileSync(new URL('./landing-refinement-v2.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('shared Sovereign intelligence stage', () => {
  it('uses the integrated field, real-life questions, refined demonstrations, and authenticated answer hierarchy', () => {
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).toContain('<LandingProductStories />');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('landing-expression-slice__tooltip-value');
    expect(field).toContain('data-field-geometry="spherical-360"');
    expect(stories).toContain('Sovereign — Personal');
    expect(stories).toContain('Sovereign — Relationship');
    expect(stories).toContain('Sovereign — Family System');
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<RelationshipAnswer');
    expect(workspace).toContain('<SystemAnswer');
    expect(workspace).toContain('<BasisStrip');
  });

  it('keeps expression, evidence, permission, and actual experience distinct', () => {
    expect(field).toContain('Illustrative Baseline · relative emphasis');
    expect(field).toContain('line length follows relative emphasis');
    expect(field).toContain('not a diagnosis, score, or claim about anyone’s internal state');
    expect(field).toContain('select a line to see its name and relative value');
    expect(stories).toContain('With permission, Sovereign keeps each person’s supplied context distinct');
    expect(stories).toContain('Illustrative shared context · Permission required · No compatibility score · No private-thought claims');
    expect(stories).toContain('Sanitized supplied system context · Each person controls what may be included');
    expect(stories).toContain('Observed route');
    expect(stories).toContain('Responsibility');
    expect(stories).toContain('Testable change');
    expect(stories).toContain('Illustrative supplied context');
    expect(stories).not.toContain('Illustrative permitted Baselines');
    expect(stories).not.toContain('Permitted context');
    expect(stories).toContain('className="landing-evidence"');
    expect(stories).toContain('<strong>Basis</strong>');
  });

  it('is responsive, interactive, and reduced-motion safe', () => {
    expect(field).toContain('role="button"');
    expect(field).toContain('tabIndex={0}');
    expect(field).toContain('onPointerDown');
    expect(field).toContain('onPointerMove');
    expect(field).toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(field).toContain('onFocus={() => selectAxis(axis.id)}');
    expect(field).toContain('onClick={(event) =>');
    expect(field).toContain('onKeyDown={(event) => handleKeyDown(event, axis.id)}');
    expect(field).toContain('prefers-reduced-motion: reduce');
    expect(stories).toContain('aria-current');
    expect(stories).toContain('landing-workflow__progress');
    expect(workspace).toContain('const limit = mobile ? 3 : 5');
    expect(fieldStyles).toContain('@media (max-width: 760px)');
    expect(fieldStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(heroStyles).toContain('@media (max-width: 760px)');
    expect(heroStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(storyStyles).toContain('@media (max-width: 760px)');
    expect(storyStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(refinementStyles).toContain('scroll-snap-type: inline mandatory !important');
    expect(refinementStyles).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
