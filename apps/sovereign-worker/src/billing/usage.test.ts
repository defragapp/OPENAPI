import { describe, expect, it } from 'vitest';
import type { Env } from '../env';
import { currentUsagePeriod, getAiUsage, monthlyAllowance, reserveAiTurn } from './usage';

function fakeEnv(initial = 0): Env {
  let used = initial;
  const db = {
    prepare(sql: string) {
      return {
        bind(_accountId: string, _periodKey: string, limit?: number) {
          return {
            async first() {
              if (sql.startsWith('SELECT turns_used')) return used ? { turns_used: used } : null;
              if (used >= Number(limit)) return null;
              used += 1;
              return { turns_used: used };
            }
          };
        }
      };
    }
  } as unknown as D1Database;
  return { DB: db } as Env;
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
    const env = fakeEnv(9);
    const reserved = await reserveAiTurn(env, 'acct_1', 'free', new Date('2026-07-15T12:00:00Z'));
    expect(reserved.remaining).toBe(0);
    await expect(reserveAiTurn(env, 'acct_1', 'free', new Date('2026-07-15T12:00:00Z')))
      .rejects.toMatchObject({ status: 429 });
    const usage = await getAiUsage(env, 'acct_1', 'free', new Date('2026-07-15T12:00:00Z'));
    expect(usage.used).toBe(10);
  });
});
