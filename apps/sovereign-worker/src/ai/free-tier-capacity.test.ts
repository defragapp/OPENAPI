import { describe, expect, it, vi } from 'vitest';
import { actualWorkersAiNeurons, estimateWorkersAiNeurons, parseWorkersAiDailyBudget, reserveWorkersAiCapacity, settleWorkersAiCapacity } from './free-tier-capacity';

function db(daily: Array<object | null>, claims: Array<object | null> = [{}]) {
  const calls: Array<{ sql: string; args: unknown[] }> = [];
  const prepare = vi.fn((sql: string) => ({ bind: (...args: unknown[]) => ({
    first: async () => { calls.push({ sql, args }); return sql.includes('workers_ai_capacity_reservations SET') ? claims.shift() ?? null : daily.shift() ?? null; },
    run: async () => { calls.push({ sql, args }); return { success: true }; }
  }) }));
  return { db: { prepare } as unknown as D1Database, calls, prepare };
}

describe('atomic Workers AI capacity ledger', () => {
  it('uses conservative UTF-8 and bounded output estimation', () => {
    expect(estimateWorkersAiNeurons({ prompt: '🔥'.repeat(100), max_completion_tokens: 10 })).toBeGreaterThan(estimateWorkersAiNeurons({ prompt: 'a', max_completion_tokens: 10 }));
  });
  it.each([undefined, '', '0', '-1', '1.5', '7501', '250000', '5000000'])('rejects invalid or paid capacity authority %s', (value) => expect(() => parseWorkersAiDailyBudget(value)).toThrow());
  it('reserves atomically with a stable identifier and UTC day', async () => {
    const store = db([{ reserved_neurons: 400, request_count: 2 }]);
    const reservation = await reserveWorkersAiCapacity(store.db, '@cf/model', { prompt: 'hello', max_completion_tokens: 10 }, '7500', new Date('2026-08-24T23:59:00Z'), 'request-1');
    expect(reservation).toMatchObject({ reservationId: 'request-1', usageDay: '2026-08-24', totalReservedNeurons: 400 });
    expect(store.calls[0]?.args.at(-1)).toBe(7500);
  });
  it('fails closed on concurrent ceiling enforcement and exhaustion', async () => {
    const store = db([null]);
    await expect(reserveWorkersAiCapacity(store.db, '@cf/model', {}, '7500')).rejects.toMatchObject({ status: 429 });
  });
  it('settles a short successful response once and never refunds twice', async () => {
    const store = db([], [{ reservation_id: 'r' }, null]);
    const reservation = { reservationId: 'r', usageDay: '2026-08-24', reservedNeurons: 100, totalReservedNeurons: 100, requestCount: 1 };
    await settleWorkersAiCapacity(store.db, reservation, 20);
    await settleWorkersAiCapacity(store.db, reservation, 20);
    expect(store.calls.filter((call) => call.sql.includes('UPDATE workers_ai_daily_capacity'))).toHaveLength(1);
  });
  it('retains reservations for invalid or contradictory usage', async () => {
    expect(actualWorkersAiNeurons({}, {})).toBeUndefined();
    expect(actualWorkersAiNeurons({ max_completion_tokens: 1 }, { usage: { input_tokens: 1, output_tokens: 9999 } })).toBeUndefined();
    const store = db([]);
    await settleWorkersAiCapacity(store.db, { reservationId: 'r', usageDay: '2026-08-24', reservedNeurons: 10, totalReservedNeurons: 10, requestCount: 1 }, undefined);
    expect(store.prepare).not.toHaveBeenCalled();
  });
  it.each([-1, 11, 1.5])('rejects invalid settlement amount %s without a refund', async (actual) => {
    const store = db([]);
    await settleWorkersAiCapacity(store.db, { reservationId: 'r', usageDay: '2026-08-24', reservedNeurons: 10, totalReservedNeurons: 10, requestCount: 1 }, actual);
    expect(store.prepare).not.toHaveBeenCalled();
  });
  it('retains the conservative charge when settlement storage fails', async () => {
    const prepare = vi.fn(() => ({ bind: () => ({ first: async () => { throw new Error('storage unavailable'); } }) }));
    await expect(settleWorkersAiCapacity(
      { prepare } as unknown as D1Database,
      { reservationId: 'r', usageDay: '2026-08-24', reservedNeurons: 100, totalReservedNeurons: 100, requestCount: 1 },
      20
    )).rejects.toThrow('storage unavailable');
    expect(prepare).toHaveBeenCalledTimes(1);
  });
  it('keeps daily rollover isolated by the UTC usage key', async () => {
    const store = db([{ reserved_neurons: 1, request_count: 1 }, { reserved_neurons: 1, request_count: 1 }]);
    const one = await reserveWorkersAiCapacity(store.db, '@cf/model', {}, '7500', new Date('2026-08-24T23:59:59Z'), 'one');
    const two = await reserveWorkersAiCapacity(store.db, '@cf/model', {}, '7500', new Date('2026-08-25T00:00:00Z'), 'two');
    expect(one?.usageDay).not.toBe(two?.usageDay);
  });
});
