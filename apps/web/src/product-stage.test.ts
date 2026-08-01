import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const landing = read('./PublicLanding.tsx');
const engine = read('./engine-room.css');
const expressionField = read('./expression-field/ExpressionField.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');

describe('shared Sovereign intelligence stage', () => {
  it('uses the same direct-answer hierarchy publicly and after authentication', () => {
    expect(landing).toContain('EXAMPLE ANSWER');
    expect(landing).toContain('DIRECT ANSWER');
    expect(landing).toContain('THE PERSONAL CONNECTION');
    expect(landing).toContain('A PRACTICAL NEXT STEP');
    expect(landing).toContain('Why this is personal');
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<RelationshipAnswer');
    expect(workspace).toContain('<SystemAnswer');
    expect(workspace).toContain('<BasisStrip');
  });

  it('distinguishes stable, temporary, confirmed, permitted, and unknown information', () => {
    expect(landing).toContain('YOUR BASELINE');
    expect(landing).toContain('WHAT MAY BE ACTIVE NOW');
    expect(landing).toContain('YOUR CONFIRMATION');
    expect(landing).toContain('STILL UNKNOWN');
    expect(landing).toContain('PERMISSION / CONFIRMED');
    expect(landing).toContain('SOURCE / CONSENTED');
    expect(expressionField).toContain('ONE CENTER · SIXTEEN EXPRESSIONS');
    expect(expressionField).toContain('Sanitized demonstration · Illustrative values · Not your Baseline');
  });

  it('is keyboard-ready, responsive, and reduced-motion safe', () => {
    expect(landing).toContain('onKeyDown');
    expect(landing).toContain('ArrowLeft');
    expect(landing).toContain('aria-selected');
    expect(landing).toContain('const limit = mobile ? 3 : 5');
    expect(engine).toContain('min-height: 44px');
    expect(engine).toContain('@media (max-width: 760px)');
    expect(engine).toContain('@media (max-width: 440px)');
    expect(engine).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
