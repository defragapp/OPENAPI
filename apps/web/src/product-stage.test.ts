import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const fieldStyles = read('./landing-expression-field-v3.css');
const heroStyles = read('./landing-hero-field-v4.css');
const demoStyles = read('./public-intelligence-demonstration-v2.css');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');

describe('shared Sovereign intelligence stage', () => {
  it('uses the integrated field, real-life questions, text-first demonstrations, and authenticated answer hierarchy', () => {
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).toContain('<LandingProductStories />');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('data-field-geometry="spherical-360"');
    expect(stories).toContain('data-product-stories="text-first-intelligence-v2"');
    expect(stories).toContain('<DecisionField />');
    expect(stories).toContain('<RelationshipField />');
    expect(stories).toContain('<SystemField />');
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<RelationshipAnswer');
    expect(workspace).toContain('<SystemAnswer');
    expect(workspace).toContain('<BasisStrip');
  });

  it('keeps expression, source detail, permission, and actual experience distinct', () => {
    expect(field).toContain('Illustrative Baseline · relative emphasis');
    expect(field).toContain('not a diagnosis, score, or claim about anyone’s internal state');
    expect(field).toContain('click a line to inspect it');
    expect(stories).toContain('Both people choose what they share');
    expect(stories).toContain('Only they can say what they actually felt or intended');
    expect(stories).toContain('Roles and events are supplied in the example');
    expect(stories).toContain('Each person controls whether their Baseline can be included');
    expect(stories).toContain('See the whole system.');
    expect(stories).toContain('What you told Sovereign');
    expect(stories).not.toContain('Illustrative permitted Baselines');
    expect(stories).not.toContain('Permitted context');
    expect(stories).toContain('className="landing-evidence"');
    expect(stories).toContain('<strong>See source details</strong>');
  });

  it('is responsive, interactive, correctable, and reduced-motion safe', () => {
    expect(field).toContain('role="button"');
    expect(field).toContain('tabIndex={0}');
    expect(field).toContain('onPointerDown');
    expect(field).toContain('onPointerMove');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(field).toContain('onFocus={() => selectAxis(axis.id)}');
    expect(field).toContain('onClick={(event) =>');
    expect(field).toContain('onKeyDown={(event) => handleKeyDown(event, axis.id)}');
    expect(stories).toContain('Does this fit?');
    expect(stories).toContain('aria-pressed={choice === value}');
    expect(demoStyles).toContain('min-width: 44px !important');
    expect(demoStyles).toContain('min-height: 44px !important');
    expect(demoStyles).toContain('@media (max-width: 760px)');
    expect(demoStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(demoStyles).not.toContain('infinite');
    expect(fieldStyles).toContain('@media (max-width: 760px)');
    expect(fieldStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(heroStyles).toContain('@media (max-width: 760px)');
    expect(heroStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(workspace).toContain('const limit = mobile ? 3 : 5');
  });
});