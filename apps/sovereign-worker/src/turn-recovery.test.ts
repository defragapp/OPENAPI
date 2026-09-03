import { describe, expect, it, vi } from 'vitest';
import { recoverStaleTurns } from './jobs';
import type { Env } from './env';

function d1(routes: Record<string, () => Promise<{ results?: Array<Record<string, unknown>>; meta?: { changes?: number } }>>) {
  const prepare = vi.fn((sql: string) => {
    const handler = Object.entries(routes).find(([needle]) => sql.includes(needle))?.[1];
    return {
      bind: vi.fn((..._args: unknown[]) => ({
        all: async () => handler?.() ?? { results: [] },
        first: async () => (await handler?.())?.results?.[0] ?? null,
        run: async () => (await handler?.()) ?? { meta: { changes: 0 } }
      }))
    };
  });
  return { db: { prepare } as unknown as D1Database, prepare };
}

function env(store: ReturnType<typeof d1>): Env {
  return { DB: store.db } as unknown as Env;
}

describe('stuck-turn recovery', () => {
  it('claims a stale non-terminal turn, assesses it interrupted, and releases the monthly turn', async () => {
    const store = d1({
      'FROM thread_turn_states': async () => ({ results: [{ id: 'turn-1', account_id: 'acct-1' }] }),
      "SET status = 'interrupted'": async () => ({ results: [{ id: 'turn-1' }] }),
      "UPDATE ai_usage_windows": async () => ({ meta: { changes: 1 } }),
      'legacy_workers_ai_capacity_reservations': async () => ({ results: [] })
    });
    const result = await recoverStaleTurns(env(store), 120);
    expect(result).toEqual({ recoveredTurns: 1, releasedCapacityNeurons: 0 });
    const { prepare } = store;
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("SET status = 'interrupted'"));
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining('UPDATE ai_usage_windows'));
  });

  it('does not double-claim a turn already recovered by a concurrent run', async () => {
    const store = d1({
      'FROM thread_turn_states': async () => ({ results: [{ id: 'turn-1', account_id: 'acct-1' }] }),
      // Claim fails (returning no row) because another cron already marked it interrupted.
      "SET status = 'interrupted'": async () => ({ results: [] }),
      'legacy_workers_ai_capacity_reservations': async () => ({ results: [] })
    });
    const result = await recoverStaleTurns(env(store), 120);
    expect(result).toEqual({ recoveredTurns: 0, releasedCapacityNeurons: 0 });
  });

  it('returns zero when no stale turn exists and does not touch usage', async () => {
    const store = d1({
      'FROM thread_turn_states': async () => ({ results: [] }),
      'legacy_workers_ai_capacity_reservations': async () => ({ results: [] })
    });
    const result = await recoverStaleTurns(env(store), 120);
    expect(result).toEqual({ recoveredTurns: 0, releasedCapacityNeurons: 0 });
    const { prepare } = store;
    expect(prepare).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE ai_usage_windows'));
  });
});
