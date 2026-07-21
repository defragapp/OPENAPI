import { describe, expect, it } from 'vitest';
import { getTurn, startTurn, updateTurnStatus } from './turns';
import type { Env } from '../env';

function envWithTurns(): Env {
  const turns = new Map<string, any>();
  return {
    APP_ENV: 'test', APP_VERSION: 'test', OPENAI_API_KEY: '', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', THREADS: {} as DurableObjectNamespace,
    DB: { prepare(sql: string) { return { bind(...args: unknown[]) { return { async first() { if (sql.startsWith('SELECT thread_id')) return turns.get(`${args[0]}:${args[1]}:${args[2]}`) ?? null; return null; }, async run() { if (sql.startsWith('INSERT OR IGNORE')) turns.set(`${args[2]}:${args[1]}:${args[3]}`, { thread_id: args[1], account_id: args[2], idempotency_key: args[3], seq: args[4], status: args[5] }); if (sql.startsWith('UPDATE thread_turn_states')) { const key = `${args[3]}:${args[4]}:${args[5]}`; const turn = turns.get(key); if (turn) { turn.status = args[0]; turn.error_code = args[1]; } } return { success: true }; } }; } }; } } as unknown as D1Database
  };
}

describe('turn state persistence', () => {
  it('tracks started, streaming, completed, and failed status by account/thread/idempotency', async () => {
    const env = envWithTurns();
    await startTurn(env, 'a1', 't1', 'k1', 1);
    expect((await getTurn(env, 'a1', 't1', 'k1')).status).toBe('started');
    await updateTurnStatus(env, 'a1', 't1', 'k1', 'streaming');
    expect((await getTurn(env, 'a1', 't1', 'k1')).status).toBe('streaming');
    await updateTurnStatus(env, 'a1', 't1', 'k1', 'completed');
    expect((await getTurn(env, 'a1', 't1', 'k1')).status).toBe('completed');
  });
});
