import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_DAILY_NEURON_BUDGET,
  estimateWorkersAiNeurons,
  releaseWorkersAiCapacity,
  reserveWorkersAiCapacity,
  resolveWorkersAiDailyNeuronBudget
} from './free-tier-capacity';

function capacityDb(row: { reserved_neurons: number; request_count: number } | null) {
  const run = vi.fn(async () => ({ success: true }));
  const first = vi.fn(async () => row);
  const bind = vi.fn(() => ({ first, run }));
  const prepare = vi.fn(() => ({ bind }));
  return { db: { prepare } as unknown as D1Database, prepare, bind, first, run };
}

describe('Workers AI Free capacity', () => {
  it('uses the safe default and validates explicit paid capacity', () => {
    expect(resolveWorkersAiDailyNeuronBudget(undefined)).toBe(DEFAULT_DAILY_NEURON_BUDGET);
    expect(resolveWorkersAiDailyNeuronBudget('5000000')).toBe(5_000_000);
    expect(() => resolveWorkersAiDailyNeuronBudget('7500.5')).toThrow(/whole number/);
    expect(() => resolveWorkersAiDailyNeuronBudget('7499')).toThrow(/at least/);
  });

  it('reserves conservatively from input and maximum output size', () => {
    const small = estimateWorkersAiNeurons({ messages: [{ role: 'user', content: 'hello' }], max_completion_tokens: 100 });
    const large = estimateWorkersAiNeurons({ messages: [{ role: 'user', content: 'x'.repeat(20_000) }], max_completion_tokens: 6_000 });
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
    expect(large).toBeLessThan(7_500);
  });

  it('records a Cloudflare-hosted model reservation against the UTC day', async () => {
    const { db, bind } = capacityDb({ reserved_neurons: 500, request_count: 3 });
    const reservation = await reserveWorkersAiCapacity(
      db,
      '@cf/zai-org/glm-4.7-flash',
      { messages: [{ role: 'user', content: 'hello' }], max_completion_tokens: 100 },
      new Date('2026-07-30T23:30:00Z')
    );
    expect(reservation).toMatchObject({ usageDay: '2026-07-30', totalReservedNeurons: 500, requestCount: 3 });
    expect(bind).toHaveBeenCalledWith('2026-07-30', reservation?.reservedNeurons, 7_500);
  });

  it('passes an explicit paid capacity budget to the atomic reservation', async () => {
    const { db, bind } = capacityDb({ reserved_neurons: 500, request_count: 3 });
    await reserveWorkersAiCapacity(
      db,
      '@cf/zai-org/glm-4.7-flash',
      { messages: [{ role: 'user', content: 'hello' }], max_completion_tokens: 100 },
      new Date('2026-07-30T23:30:00Z'),
      '5000000'
    );
    expect(bind).toHaveBeenCalledWith('2026-07-30', expect.any(Number), 5_000_000);
  });

  it('fails closed before Cloudflare reaches its daily free allocation', async () => {
    const { db } = capacityDb(null);
    await expect(reserveWorkersAiCapacity(
      db,
      '@cf/zai-org/glm-4.7-flash',
      { messages: [{ role: 'user', content: 'hello' }], max_completion_tokens: 3_200 },
      new Date('2026-07-30T23:30:00Z')
    )).rejects.toMatchObject({ status: 429 });
  });

  it('does not reserve non-Workers-AI fixtures and releases failed hosted calls', async () => {
    const skipped = await reserveWorkersAiCapacity({ prepare: vi.fn() } as unknown as D1Database, 'openai/test', {});
    expect(skipped).toBeUndefined();

    const { db, run } = capacityDb({ reserved_neurons: 500, request_count: 3 });
    await releaseWorkersAiCapacity(db, {
      usageDay: '2026-07-30',
      reservedNeurons: 150,
      totalReservedNeurons: 500,
      requestCount: 3
    });
    expect(run).toHaveBeenCalledOnce();
  });
});
