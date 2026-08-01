import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const landing = read('./PublicLanding.tsx');
const engine = read('./engine-room.css');
const expressionField = read('./expression-field/ExpressionField.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');

describe('shared Sovereign intelligence stage', () => {
  it('demonstrates the same direct-answer authority publicly and after authentication', () => {
    expect(landing).toContain('DIRECT UNDERSTANDING');
    expect(landing).toContain('Your capacity is real.');
    expect(landing).toContain('The question is whether the responsibility is actually yours.');
    expect(landing).toContain('SUPPORTED BY / BOUNDARY RESPONSE · RESPONSIBILITY ORIENTATION · SYSTEM ROLE');
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<RelationshipAnswer');
    expect(workspace).toContain('<SystemAnswer');
    expect(workspace).toContain('<BasisStrip');
  });

  it('separates stable Baseline, temporary context, consent, and unknowns', () => {
    expect(landing).toContain('Your intelligence begins with a stable Baseline.');
    expect(landing).toContain('TEMPORARY_EMPHASIS / ACTIVE');
    expect(landing).toContain('PERMISSION /');
    expect(landing).toContain('SOURCE /');
    expect(landing).toContain('CONSENTED');
    expect(expressionField).toContain('ONE CENTER · SIXTEEN EXPRESSIONS');
    expect(expressionField).toContain('Sanitized demonstration · Illustrative values · Not your Baseline');
  });

  it('is keyboard-ready, responsive, and reduced-motion safe', () => {
    expect(landing).toContain('aria-label="Sovereign.OS intelligence engine"');
    expect(landing).toContain('aria-label="Demonstration Baseline compilation');
    expect(landing).toContain('aria-label="Self context moves into a consented relationship and then into a wider system"');
    expect(workspace).toContain('const limit = mobile ? 3 : 5');
    expect(engine).toContain('min-height: 44px');
    expect(engine).toContain('@media (max-width: 680px)');
    expect(engine).toContain('@media (prefers-reduced-motion: reduce)');
    expect(engine).toContain('@media (forced-colors: active)');
  });
});
