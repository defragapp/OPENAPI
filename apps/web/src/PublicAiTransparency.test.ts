import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const safetyRuntime = readFileSync(new URL('./SafetyResponseRuntime.ts', import.meta.url), 'utf8');

describe('public AI transparency', () => {
  it('states plan-independent safety, evidence boundaries, and correction paths', () => {
    for (const marker of [
      'SAFETY',
      'does not turn that moment into an upgrade prompt',
      'do not use one of your monthly Sovereign AI turns',
      'A framework, coincidence, current astronomical condition, or strong feeling is not treated as proof',
      'Open source details beneath an answer when you want to inspect the exact source information that materially shaped the interpretation',
      'info@sovereign.defrag.app'
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
