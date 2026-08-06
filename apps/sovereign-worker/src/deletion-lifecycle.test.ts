import { describe, it, expect, vi } from 'vitest';
import { executeDeletion } from './jobs';
import type { Env } from './env';

vi.mock('./billing/stripe', () => ({
  cancelAccountSubscriptions: vi.fn().mockImplementation(async () => {
    throw new Error('stripe_subscription_cancel_401');
  })
}));

describe('executeDeletion', () => {
  it('halts data deletion if cancelAccountSubscriptions fails', async () => {
    let deletedTables = false;
    const db = {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              async first() {
                if (sql.includes('SELECT id, status FROM deletion_jobs')) {
                  return { id: 'job-1', status: 'grace' };
                }
                return null;
              },
              async run() {
                if (sql.includes('DELETE FROM auth_magic_links')) {
                  deletedTables = true;
                }
                return { meta: { changes: 1 } };
              }
            };
          }
        };
      }
    } as unknown as D1Database;
    const env = { DB: db } as Env;

    await expect(executeDeletion(env, 'acct-1', 'job-1')).rejects.toThrow('stripe_subscription_cancel_401');
    expect(deletedTables).toBe(false);
  });
});
