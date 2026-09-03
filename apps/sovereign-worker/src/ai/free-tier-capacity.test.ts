import { describe, expect, it } from 'vitest';
import { actualWorkersAiNeurons, estimateWorkersAiNeurons, parseWorkersAiDailyBudget, reserveWorkersAiCapacity, settleWorkersAiCapacity, voidStaleWorkersAiCapacityReservations } from './free-tier-capacity';

describe('AI Gateway capacity tracking', () => {
  it('uses conservative UTF-8 and bounded output estimation', () => {
    expect(estimateWorkersAiNeurons({ prompt: '🔥'.repeat(100), max_completion_tokens: 10 })).toBeGreaterThan(estimateWorkersAiNeurons({ prompt: 'a', max_completion_tokens: 10 }));
  });
  
  it.each([undefined, '', '0', '-1', '1.5', '7501', '250000', '5000000'])('rejects invalid or paid capacity authority %s', (value) => expect(() => parseWorkersAiDailyBudget(value)).toThrow());
  
  it('delegates reservations to AI gateway as pass-through', async () => {
    const reservation = await reserveWorkersAiCapacity({} as D1Database, '@cf/model', { prompt: 'hello', max_completion_tokens: 10 }, '7500', new Date('2026-08-24T23:59:00Z'), 'request-1');
    expect(reservation).toMatchObject({ reservationId: 'request-1', usageDay: '2026-08-24' });
    expect(reservation?.totalReservedNeurons).toBe(reservation?.reservedNeurons);
  });
  
  it('returns undefined for non-Cloudflare models', async () => {
    expect(await reserveWorkersAiCapacity({} as D1Database, 'gpt-4o', {}, '7500')).toBeUndefined();
  });
  
  it('calculates actual neurons correctly', () => {
    expect(actualWorkersAiNeurons({}, {})).toBeUndefined();
    expect(actualWorkersAiNeurons({ max_completion_tokens: 1 }, { usage: { input_tokens: 1, output_tokens: 9999 } })).toBeUndefined();
  });

  it('no-ops settlement operations since AI Gateway manages caching/metrics', async () => {
    await expect(settleWorkersAiCapacity({} as D1Database, undefined, 20)).resolves.toBeUndefined();
  });

  it('no-ops stale voiding since AI Gateway handles rate limits', async () => {
    expect(await voidStaleWorkersAiCapacityReservations({} as D1Database, 120)).toBe(0);
  });
});
