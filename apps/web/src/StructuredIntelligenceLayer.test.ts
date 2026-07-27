import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const layer = readFileSync(new URL('./StructuredIntelligenceLayer.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./structured-intelligence.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('validated structured intelligence projection', () => {
  it('loads the persisted validated plan after a completed turn or restored thread', () => {
    expect(layer).toContain("/^\\/api\\/v1\\/threads\\/([^/]+)\\/messages$/");
    expect(layer).toContain('loadStructuredDetail');
    expect(layer).toContain("/api/v1/threads/${encodeURIComponent(threadId)}");
    expect(layer).toContain("message.role === 'assistant' && validPlan(message.plan)");
  });

  it('uses validated phase, confidence, safety mode, basis, and action fields', () => {
    for (const field of ['response_phase', 'confidence', 'safety_mode', 'recognition', 'inward_question', 'candidate_hidden_expectation', 'protected_need', 'clearer_form', 'practical_action']) {
      expect(layer).toContain(field);
    }
    expect(layer).toContain('What this response was allowed to use');
    expect(layer).toContain('No framework basis was displayed. The response remains exploratory.');
  });

  it('renders Defrag, Alignment, and Covenant as internal modes and a separate lens', () => {
    expect(layer).toContain("mode: 'defrag' | 'alignment'");
    expect(layer).toContain("surface === 'Explore' ? 'alignment' : 'defrag'");
    expect(layer).toContain('Covenant +');
    expect(layer).toContain('Scripture remains a separate lens.');
  });

  it('keeps motive, diagnosis, and future certainty outside the result', () => {
    expect(layer).toContain('does not know another person’s hidden motive, exact feeling, diagnosis, or future behavior');
    expect(layer).toContain('The user can confirm, correct, or reject the interpretation.');
  });

  it('replaces the visible keyword and response-length alignment instrument', () => {
    expect(styles).toContain('.intelligence-workspace .alignment-instrument{display:none!important}');
    expect(styles).toContain('.structured-intelligence-panel');
    expect(styles).toContain('@media(max-width:820px)');
    expect(styles).toContain('@media(prefers-contrast:more)');
    expect(styles).toContain('@media(prefers-reduced-motion:reduce)');
  });

  it('mounts only with the authenticated Sovereign experience', () => {
    expect(main).toContain("import { StructuredIntelligenceLayer, installStructuredIntelligenceRuntime } from './StructuredIntelligenceLayer'");
    expect(main).toContain('installStructuredIntelligenceRuntime()');
    expect(main).toContain('<StructuredIntelligenceLayer />');
    expect(main).toContain("import './structured-intelligence.css'");
  });
});
