import { describe, expect, it } from 'vitest';
import { requireUniqueHistoricalCivilTime, resolveHistoricalCivilTime } from './historical-timezone';

describe('historical IANA civil-time resolution', () => {
  it('resolves a unique historical local time', () => {
    const result = resolveHistoricalCivilTime('1993-07-26', '20:00', 'America/Los_Angeles');
    expect(result.status).toBe('unique');
    if (result.status !== 'unique') throw new Error('expected unique result');
    expect(result.instant.toISOString()).toBe('1993-07-27T03:00:00.000Z');
    expect(result.offsetMinutes).toBe(-420);
  });

  it('rejects a local time skipped by the spring transition', () => {
    expect(resolveHistoricalCivilTime('2024-03-10', '02:30', 'America/Los_Angeles')).toEqual({
      status: 'nonexistent'
    });
    expect(() => requireUniqueHistoricalCivilTime(
      '2024-03-10',
      '02:30',
      'America/Los_Angeles'
    )).toThrow('baseline_birth_time_nonexistent');
  });

  it('returns both instants for a duplicated autumn local time', () => {
    const result = resolveHistoricalCivilTime('2024-11-03', '01:30', 'America/Los_Angeles');
    expect(result.status).toBe('ambiguous');
    if (result.status !== 'ambiguous') throw new Error('expected ambiguous result');
    expect(result.candidates.map((candidate) => ({
      instant: candidate.instant.toISOString(),
      offsetMinutes: candidate.offsetMinutes
    }))).toEqual([
      { instant: '2024-11-03T08:30:00.000Z', offsetMinutes: -420 },
      { instant: '2024-11-03T09:30:00.000Z', offsetMinutes: -480 }
    ]);
  });

  it('rejects invalid calendar dates and timezone identifiers', () => {
    expect(() => resolveHistoricalCivilTime('2024-02-31', '12:00', 'UTC')).toThrow(
      'baseline_birth_civil_time_invalid'
    );
    expect(() => resolveHistoricalCivilTime('2024-02-01', '12:00', 'Not/A_Timezone')).toThrow(
      'baseline_birth_timezone_invalid'
    );
  });
});
