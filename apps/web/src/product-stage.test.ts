import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readTestFile(relativePath: string): string {
  return readFileSync(resolve(__dirname, relativePath), 'utf8');
}

const landing = readTestFile('./PublicLanding.tsx');
const stories = readTestFile('./LandingProductStories.tsx');
const field = readTestFile('./expression-field/LandingExpressionSlice.tsx');
const fieldStyles = readTestFile('./landing-expression-field-v3.css');
const heroStyles = readTestFile('./landing-hero-field-v4.css');
const storyStyles = readTestFile('./v0-restored-product-stories.css');
const refinementStyles = readTestFile('./landing-refinement-v2.css');
const workspace = readTestFile('./SovereignIntelligenceWorkspace.tsx');

describe('shared Sovereign intelligence stage', () => {
  it('uses the integrated field, real-life questions, refined demonstrations, and authenticated answer hierarchy', () => {
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).toContain('<LandingProductStories />');
    expect(field).toContain('landing-expression-slice__beam');
    expect(field).toContain('landing-expression-slice__tooltip-value');
    expect(field).toContain('data-field-geometry="spherical-360"');
    expect(stories).toContain('demo-selector');
    expect(stories).toContain('demo-card');
    expect(stories).toContain('See source details');
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<RelationshipAnswer');
    expect(workspace).toContain('<SystemAnswer');
    expect(workspace).toContain('<BasisStrip');
  });

  it('keeps expression, evidence, permission, and actual experience distinct', () => {
    expect(field).toContain('Illustrative Baseline · relative emphasis');
    expect(field).toContain('line length follows relative emphasis');
    expect(field).toContain("not a diagnosis, score, or claim about anyone’s internal state");
    expect(field).toContain('click a line to inspect it');
    expect(stories).toContain('demo-selector');
    expect(stories).toContain('demo-card');
    expect(stories).toContain('See source details');
    expect(stories).toContain('Representative example · Not your Baseline Design');
    expect(stories).toContain('Why do I keep saying yes when I want to say no?');
    expect(stories).toContain("Why does my partner\\'s silence feel like punishment?");
    expect(stories).toContain('Why do I always end up managing the family crisis?');
    expect(stories).not.toContain('Illustrative permitted Baselines');
    expect(stories).not.toContain('Permitted context');
    expect(stories).toContain('className="landing-evidence"');
    expect(stories).toContain('<strong>See source details</strong>');
  });

  it('is responsive, interactive, and reduced-motion safe', () => {
    expect(field).toContain('role="button"');
    expect(field).toContain('tabIndex={0}');
    expect(field).toContain('onPointerDown');
    expect(field).toContain('onPointerMove');
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(field).toContain('onFocus={() => selectAxis(axis.id)}');
    expect(field).toContain('onClick={(event) =>');
    expect(field).toContain('onKeyDown={(event) => handleKeyDown(event, axis.id)}');
    expect(field).toContain('prefers-reduced-motion: reduce');
    expect(stories).toContain('demo-selector__tab');
    expect(stories).not.toContain('landing-workflow__progress');
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