import { describe, expect, it } from 'vitest';
import { parseAlignmentResult } from './alignment-contract';

describe('structured alignment contract', () => {
  it('keeps the instrument neutral when structured alignment is absent', () => {
    const result = parseAlignmentResult(JSON.stringify({ response_phase: 'question' }));
    expect(result.applicable).toBe(false);
    expect(result.direction).toBe('unclear');
    expect(result.confidence).toBe('limited');
  });

  it('validates separate direction, evidence, uncertainty, and missing context', () => {
    const result = parseAlignmentResult(JSON.stringify({
      alignment: {
        applicable: true,
        direction: 'conditional',
        confidence: 'moderate',
        supporting_factors: ['The role preserves meaningful autonomy.'],
        counter_factors: ['The timing creates avoidable pressure.'],
        missing_context: ['The actual decision deadline.'],
        explanation: 'The direction may fit, but the current timing needs clarification.'
      }
    }));
    expect(result.direction).toBe('conditional');
    expect(result.supporting_factors).toHaveLength(1);
    expect(result.counter_factors).toHaveLength(1);
    expect(result.missing_context).toEqual(['The actual decision deadline.']);
  });
});
