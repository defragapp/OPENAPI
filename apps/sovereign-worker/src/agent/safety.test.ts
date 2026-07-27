import { describe, expect, it } from 'vitest';
import { assertSovereignOutputSafety, reviewSovereignOutputSafety } from './safety';

describe('Sovereign output safety guardrail', () => {
  const safe = 'WHAT I NOTICE\n\nYou may be trying to make the outcome certain.\n\nLOOK INWARD\n\nWhat feels at risk?\n\nBASIS · U✓';

  it('accepts one-question, anti-stigma recognition output', () => {
    expect(() => assertSovereignOutputSafety(safe)).not.toThrow();
  });

  it('rejects diagnosis, hidden intent, deterministic prediction, and multiple questions', () => {
    expect(() => assertSovereignOutputSafety('WHAT I NOTICE\n\nThis is a diagnosis.\n\nLOOK INWARD\n\nWhat feels at risk?')).toThrow();
    expect(() => assertSovereignOutputSafety('WHAT I NOTICE\n\nThey are trying to control you.\n\nLOOK INWARD\n\nWhat feels at risk?')).toThrow();
    expect(() => assertSovereignOutputSafety('WHAT I NOTICE\n\nThis will definitely happen.\n\nLOOK INWARD\n\nWhat feels at risk?')).toThrow();
    expect(() => assertSovereignOutputSafety('WHAT I NOTICE\n\nSomething changed.\n\nLOOK INWARD\n\nWhat happened? What feels at risk?')).toThrow();
  });

  it('rewrites unsafe relational certainty once instead of returning a generic failure', () => {
    const reviewed = reviewSovereignOutputSafety('WHAT THIS MAY BE SHOWING\n\nYour mother is projecting her insecurity onto you.\n\nA CLEARER FORM\n\nStay with what you observed.\n\nWHAT TO DO\n\nWrite down the words that were used.');
    expect(reviewed.rewritten).toBe(true);
    expect(reviewed.issues).toContain('projection_as_fact');
    expect(reviewed.text).toContain('feelings and motives are not known');
    expect(reviewed.text).not.toMatch(/projecting|insecurity/i);
    expect(() => assertSovereignOutputSafety(reviewed.text)).not.toThrow();
  });

  it('rewrites unsupported life directives while preserving agency', () => {
    const reviewed = reviewSovereignOutputSafety('WHAT THIS MAY BE SHOWING\n\nYou have a difficult choice.\n\nA CLEARER FORM\n\nYour safety matters.\n\nWHAT TO DO\n\nYou need to cut them off.');
    expect(reviewed.issues).toContain('unsupported_directive');
    expect(reviewed.text).toContain('You do not have to make that decision here');
  });

  it('rewrites implied diagnosis, family blame, Baseline proof, and excessive disclaimers', () => {
    for (const unsafe of [
      'You are avoidant.',
      'Your parents caused your fear.',
      'Your chart says they are unsafe.',
      'I cannot know their feelings. I cannot tell you what happened.'
    ]) {
      const reviewed = reviewSovereignOutputSafety(unsafe);
      expect(reviewed.rewritten).toBe(true);
      expect(reviewed.text).not.toBe(unsafe);
    }
  });
});
