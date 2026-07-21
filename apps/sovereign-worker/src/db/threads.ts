import type { Env } from '../env';

export async function ensureThread(env: Env, accountId: string, threadId: string, contextKind = 'personal'): Promise<void> {
  const existing = await env.DB.prepare('SELECT account_id FROM threads WHERE id = ?').bind(threadId).first<{ account_id: string }>();
  if (existing && existing.account_id !== accountId) throw new Response('Thread not found', { status: 404 });
  if (existing) return;
  await env.DB.prepare('INSERT INTO threads (id, account_id, context_kind, title) VALUES (?, ?, ?, ?)')
    .bind(threadId, accountId, contextKind, 'Sovereign thread')
    .run();
}

export async function appendThreadEvent(env: Env, threadId: string, seq: number, eventType: string, payload: unknown, traceId?: string): Promise<void> {
  await env.DB.prepare('INSERT OR IGNORE INTO thread_events (id, thread_id, seq, event_type, payload_json, trace_id) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), threadId, seq, eventType, JSON.stringify(payload), traceId ?? null)
    .run();
}

export async function recordCorrection(env: Env, accountId: string, threadId: string, correction: string, note?: string): Promise<void> {
  await ensureThread(env, accountId, threadId);
  await env.DB.prepare('INSERT INTO user_corrections (id, account_id, thread_id, correction, note) VALUES (?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), accountId, threadId, correction, note ?? null)
    .run();
}
