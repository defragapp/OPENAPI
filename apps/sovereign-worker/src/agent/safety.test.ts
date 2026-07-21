import { describe, expect, it } from 'vitest';
import { assertSovereignOutputSafety } from './safety';

describe('Sovereign output safety guardrail', () => {
  const safe = 'Baseline tendency: steady. Current amplification: louder. Observed behavior: none confirmed. Unknown actual state: only the user can confirm.';

  it('accepts separated, non-diagnostic output', () => {
    expect(() => assertSovereignOutputSafety(safe)).not.toThrow();
  });

  it('rejects unsafe diagnostic, hidden-intent, and deterministic prediction language', () => {
    expect(() => assertSovereignOutputSafety('Baseline. Current. Observed. Unknown. This is a diagnosis.')).toThrow();
    expect(() => assertSovereignOutputSafety('Baseline. Current. Observed. Unknown. They are trying to control you.')).toThrow();
    expect(() => assertSovereignOutputSafety('Baseline. Current. Observed. Unknown. This will definitely happen.')).toThrow();
  });
});
