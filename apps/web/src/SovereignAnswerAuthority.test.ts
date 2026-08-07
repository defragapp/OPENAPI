import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const space = readFileSync(new URL('./SovereignIntelligenceSpace.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('one authoritative intelligence response', () => {
  it('renders only the sovereign-answer.v2 contract in the main conversation', () => {
    expect(space).toContain("version: 'sovereign-answer.v2'");
    expect(space).toContain('<SovereignAnswerView');
    expect(space).toContain('Why this is personal');
    expect(space).toContain('Still unknown');
    expect(space).toContain('onCorrection');
  });

  it('does not mount the legacy structured response overlay', () => {
    expect(main).not.toContain('StructuredIntelligenceLayer');
    expect(main).not.toContain('installStructuredIntelligenceRuntime');
    expect(main).not.toContain("import './structured-intelligence.css'");
  });
});
