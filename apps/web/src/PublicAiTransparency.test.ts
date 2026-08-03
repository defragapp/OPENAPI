import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const safetyRuntime = readFileSync(new URL('./SafetyResponseRuntime.ts', import.meta.url), 'utf8');

describe('public AI transparency', () => {
  it('states plan-independent safety, evidence boundaries, and correction paths', () => {
    for (const marker of [
      'SAFETY, EVIDENCE, AND LIMITS',
      'Safety responses do not become an upgrade prompt',
      'does not consume a monthly Sovereign AI turn',
      'does not turn an interpretive framework, coincidence, current astronomical condition, or strong feeling into proof',
      'Exact server-approved Basis values remain available beneath the answer',
      'info@defrag.app'
    ]) {
      expect(faq).toContain(marker);
    }
  });

  it('uses validated answer fields instead of headline classification for safety presentation', () => {
    expect(safetyRuntime).toContain("answer.safety_mode === 'escalate'");
    expect(safetyRuntime).toContain("answer.safety_mode !== 'grounded'");
    expect(safetyRuntime).toContain("dataset.sovereignSafetySource = 'answer-contract'");
    expect(safetyRuntime).not.toContain('SAFETY_HEADLINES');
  });
});
