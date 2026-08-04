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
      'info@sovereign.os'
    ]) {
      expect(faq).toContain(marker);
    }
  });

  it('uses the explicit safety response contract instead of answer or headline inference', () => {
    expect(safetyRuntime).toContain("safety.version !== 'sovereign-safety-response.v1'");
    for (const presentation of ['grounded', 'supportive_resources', 'urgent', 'emergency', 'secure_refusal']) {
      expect(safetyRuntime).toContain(`'${presentation}'`);
    }
    expect(safetyRuntime).toContain("dataset.sovereignSafetySource = 'safety-response-contract'");
    expect(safetyRuntime).not.toContain('SAFETY_HEADLINES');
    expect(safetyRuntime).not.toContain('presentationFromAnswer');
  });
});
