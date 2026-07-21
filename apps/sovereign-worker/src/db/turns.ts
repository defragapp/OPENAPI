import type { Env } from '../env';

export type TurnStatus = 'started' | 'streaming' | 'completed' | 'failed' | 'interrupted';

export interface TurnState {
  thread_id: string;
  account_id: string;
  idempotency_key: string;
  seq: number;
  status: TurnStatus;
  error_code?: string | null;
}

export async function startTurn(env: Env, accountId: string, threadId: string, idempotencyKey: string, seq: number): Promise<TurnState> {
  await env.DB.prepare('INSERT OR IGNORE INTO thread_turn_states (id, thread_id, account_id, idempotency_key, seq, status) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), threadId, accountId, idempotencyKey, seq, 'started')
    .run();
  return getTurn(env, accountId, threadId, idempotencyKey);
}

export async function updateTurnStatus(env: Env, accountId: string, threadId: string, idempotencyKey: string, status: TurnStatus, errorCode?: string): Promise<void> {
  await env.DB.prepare("UPDATE thread_turn_states SET status = ?, error_code = ?, updated_at = datetime('now'), completed_at = CASE WHEN ? = 'completed' THEN datetime('now') ELSE completed_at END WHERE account_id = ? AND thread_id = ? AND idempotency_key = ?")
    .bind(status, errorCode ?? null, status, accountId, threadId, idempotencyKey)
    .run();
}

export async function getTurn(env: Env, accountId: string, threadId: string, idempotencyKey: string): Promise<TurnState> {
  const turn = await env.DB.prepare('SELECT thread_id, account_id, idempotency_key, seq, status, error_code FROM thread_turn_states WHERE account_id = ? AND thread_id = ? AND idempotency_key = ?')
    .bind(accountId, threadId, idempotencyKey)
    .first<TurnState>();
  if (!turn) throw new Response('Turn not found', { status: 404 });
  return turn;
}
