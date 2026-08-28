import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const field = readFileSync(new URL('./expression-field/LandingExpressionSlice.tsx', import.meta.url), 'utf8');
const fixture = readFileSync(new URL('./expression-field/expression-field.fixture.ts', import.meta.url), 'utf8');
const releaseCss = readFileSync(new URL('./v0-single-example-release.css', import.meta.url), 'utf8');

describe('public evidence contract', () => {
  it('uses deterministic relative-expression data rather than unsupported identity claims', () => {
    expect(field).toContain('landingExpressionFieldFixture');
    expect(field).toContain('salienceLabel');
    expect(field).toContain('expressionAxisRegistryById');
    expect(field).toContain('buildLandingAxes');
    expect(field).toContain('Math.pow(normalized, 1.32)');
    expect(fixture).toContain("measurementKind: 'relative_expression_salience'");
    expect(fixture).toContain("state: 'unconfirmed'");
    expect(fixture).toContain('basisRefs: []');
    expect(fixture).toContain('Sanitized demonstration · Illustrative values · Not your Baseline');

    for (const unsupported of ['Emotional Authority', 'Splenic Authority', 'compatibility score', 'private-thought claims']) {
      expect(`${field}\n${fixture}`).not.toContain(unsupported);
    }
  });

it('keeps relationship and system examples permission-safe while translating implementation language for users', () => {
    expect(stories).toContain('Representative example · Not your Baseline Design');
    expect(stories).toContain('What you told Sovereign');
    expect(stories).not.toContain('Illustrative permitted Baselines');
    expect(stories).not.toContain('Permitted context');
    expect(stories).not.toContain('permitted perspectives');
    expect(stories).not.toContain('confirmed responsibilities');
    expect(field).toContain("not a diagnosis, score, or claim about anyone’s internal state");
    expect(fixture).toContain('not a score or a verdict about the person');
    expect(fixture).toContain('without determining behavior');
  });

  it('keeps exact example source values available but collapsed behind plain user language', () => {
    expect(stories).toContain('<details className="landing-evidence">');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(stories).toContain('Example data used in this demonstration. These values are not visitor data.');
    expect(stories).toContain("{ code: 'clarity'");
    expect(stories).toContain("{ code: 'clarity □ steadiness'");
    expect(stories).not.toContain('<strong>Example Basis</strong>');
    expect(stories).not.toContain("chips: ['HD G13.1'");
  });

  it('keeps the outlined hero line visible at normal viewport scale', () => {
    expect(releaseCss).toContain('-webkit-text-stroke: .7px rgba(232, 221, 208, .72)');
    expect(releaseCss).toContain('color: rgba(232, 221, 208, .18) !important');
    expect(landing).toContain('Holding onto the pain is.');
  });
});