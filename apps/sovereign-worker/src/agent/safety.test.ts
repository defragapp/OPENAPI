import { describe, expect, it } from 'vitest';
import { assertSovereignOutputSafety } from './safety';

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
});
