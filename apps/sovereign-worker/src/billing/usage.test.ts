import { describe, expect, it } from 'vitest';
import type { Env } from '../env';
import { currentUsagePeriod, getAiUsage, monthlyAllowance, releaseAiTurn, reserveAiTurn } from './usage';

function fakeUsage(initial = 0): { env: Env; used: () => number } {
  let turnsUsed = initial;
  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first() {
              if (sql.startsWith('SELECT turns_used')) return turnsUsed ? { turns_used: turnsUsed } : null;
              const count = Number(args[2]);
              const allowance = Number(args[3]);
              if (turnsUsed + count > allowance) return null;
              turnsUsed += count;
              return { turns_used: turnsUsed };
            },
            async run() {
              if (sql.startsWith('UPDATE ai_usage_windows')) turnsUsed = Math.max(0, turnsUsed - Number(args[0]));
              return { success: true };
            }
          };
        }
      };
    }
  } as unknown as D1Database;
  return { env: { DB: db } as Env, used: () => turnsUsed };
}

describe('monthly AI allowances', () => {
  it('uses conservative configurable defaults', () => {
    expect(monthlyAllowance({} as Env, 'free')).toBe(10);
    expect(monthlyAllowance({} as Env, 'sovereign_plus')).toBe(300);
    expect(monthlyAllowance({ AI_FREE_MONTHLY_TURNS: '25' } as Env, 'free')).toBe(25);
    expect(monthlyAllowance({ AI_FREE_MONTHLY_TURNS: '-1' } as Env, 'free')).toBe(10);
  });

  it('uses UTC calendar-month windows', () => {
    expect(currentUsagePeriod(new Date('2026-12-31T23:59:00Z'))).toEqual({
      periodKey: '2026-12',
      resetsAt: '2027-01-01T00:00:00.000Z'
    });
  });

  it('atomically reserves within the allowance and rejects the next turn', async () => {
    const { env } = fakeUsage(9);
    const reserved = await reserveAiTurn(env, 'acct_1', 'free', new Date('2026-07-15T12:00:00Z'));
    expect(reserved.remaining).toBe(0);
    await expect(reserveAiTurn(env, 'acct_1', 'free', new Date('2026-07-15T12:00:00Z')))
      .rejects.toMatchObject({ status: 429 });
    const usage = await getAiUsage(env, 'acct_1', 'free', new Date('2026-07-15T12:00:00Z'));
    expect(usage.used).toBe(10);
  });

  it('returns a reserved turn when generation fails', async () => {
    const { env, used } = fakeUsage(4);
    const reservation = await reserveAiTurn(env, 'acct_1', 'free', new Date('2026-07-15T12:00:00Z'));
    expect(used()).toBe(5);
    await releaseAiTurn(env, 'acct_1', reservation.periodKey);
    expect(used()).toBe(4);
  });
});
