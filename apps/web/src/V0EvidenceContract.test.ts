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

  it('keeps relationship and system evidence permission-safe and confirmable', () => {
    expect(stories).toContain('With permission, Sovereign keeps each person’s supplied context distinct');
    expect(stories).toContain('Illustrative permitted Baselines · No compatibility score · No private-thought claims');
    expect(stories).toContain('Sanitized system demonstration · Each person controls what may be included');
    expect(stories).toContain('Keeping both people distinct');
    expect(stories).toContain('Permitted context');
    expect(field).toContain('not a diagnosis, score, or claim about anyone’s internal state');
    expect(fixture).toContain('not a score or a verdict about the person');
    expect(fixture).toContain('without determining behavior');
  });

  it('keeps the outlined hero line visible at normal viewport scale', () => {
    expect(releaseCss).toContain('-webkit-text-stroke: .7px rgba(232, 221, 208, .72)');
    expect(releaseCss).toContain('color: rgba(232, 221, 208, .18) !important');
    expect(landing).toContain('Holding onto the pain is.');
  });
});
