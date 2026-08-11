import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('one authoritative intelligence response', () => {
  it('renders only the sovereign-answer.v2 contract in the main conversation', () => {
    expect(workspace).toContain("version: 'sovereign-answer.v2'");
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<p className="direct-answer">');
    expect(workspace).toContain('<BasisStrip values={basis} />');
    expect(workspace).toContain('Still unknown');
    expect(workspace).toContain('answer.correction_prompt');
    expect(workspace).toContain('onCorrection');
  });

  it('does not mount the legacy structured response overlay', () => {
    expect(main).not.toContain('StructuredIntelligenceLayer');
    expect(main).not.toContain('installStructuredIntelligenceRuntime');
    expect(main).not.toContain("import './structured-intelligence.css'");
  });
});
