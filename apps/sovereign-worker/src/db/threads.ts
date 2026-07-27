import type { Env } from '../env';

export async function ensureThread(env: Env, accountId: string, threadId: string, contextKind = 'personal'): Promise<void> {
  const existing = await env.DB.prepare('SELECT account_id FROM threads WHERE id = ?').bind(threadId).first<{ account_id: string }>();
  if (existing && existing.account_id !== accountId) throw new Response('Thread not found', { status: 404 });
  if (existing) return;
  await env.DB.prepare('INSERT INTO threads (id, account_id, context_kind, title) VALUES (?, ?, ?, ?)')
    .bind(threadId, accountId, contextKind, 'Sovereign thread')
    .run();
}

export interface ThreadSummary {
  id: string;
  title: string;
  contextKind: string;
  surface: 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';
  covenantEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadCorrection {
  value: 'yes' | 'partly' | 'not_today';
  note?: string;
  createdAt: string;
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  context?: Record<string, unknown>;
  plan?: Record<string, unknown>;
  correction?: ThreadCorrection;
  correctionHistory?: ThreadCorrection[];
  interfaceActions?: Record<string, unknown>;
  visualStory?: Record<string, unknown>;
  moduleOffer?: Record<string, unknown>;
}

export async function listThreads(env: Env, accountId: string): Promise<ThreadSummary[]> {
  const rows = await env.DB.prepare(`SELECT t.id, t.title, t.context_kind, t.covenant_enabled, t.created_at, t.updated_at
    FROM threads t
    WHERE t.account_id = ?
      AND EXISTS (SELECT 1 FROM thread_events te WHERE te.thread_id = t.id)
    ORDER BY t.updated_at DESC
    LIMIT 50`)
    .bind(accountId)
    .all<Record<string, string | number>>();

  return (rows.results ?? []).map((row) => {
    const contextKind = String(row.context_kind || 'personal');
    return {
      id: String(row.id),
      title: String(row.title || 'Sovereign conversation'),
      contextKind,
      surface: surfaceFromContextKind(contextKind),
      covenantEnabled: Number(row.covenant_enabled) === 1,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at)
    };
  });
}

export async function listThreadMessages(env: Env, accountId: string, threadId: string): Promise<ThreadMessage[]> {
  const owned = await getOwnedThread(env, accountId, threadId);
  if (!owned) throw new Response('Thread not found', { status: 404 });
  const [rows, correctionRows] = await Promise.all([
    env.DB.prepare(`SELECT id, seq, event_type, payload_json, created_at
      FROM thread_events
      WHERE thread_id = ?
        AND event_type IN ('user_message', 'assistant_plan', 'assistant_response', 'assistant_development_response')
      ORDER BY seq ASC`)
      .bind(threadId)
      .all<Record<string, string | number>>(),
    env.DB.prepare(`SELECT correction, note, created_at FROM user_corrections
      WHERE thread_id = ? AND account_id = ? ORDER BY created_at DESC LIMIT 20`)
      .bind(threadId, accountId)
      .all<{ correction: string; note: string | null; created_at: string }>()
  ]);

  const messages: ThreadMessage[] = [];
  let pendingPlan: Record<string, unknown> | undefined;
  for (const row of rows.results ?? []) {
    const payload = safeJson(String(row.payload_json ?? ''));
    if (row.event_type === 'assistant_plan') {
      pendingPlan = payload.plan && typeof payload.plan === 'object'
        ? payload.plan as Record<string, unknown>
        : undefined;
      continue;
    }

    const text = typeof payload.text === 'string' ? payload.text.trim() : '';
    if (!text) continue;
    const role = row.event_type === 'user_message' ? 'user' as const : 'assistant' as const;
    messages.push({
      id: String(row.id),
      role,
      text,
      createdAt: String(row.created_at),
      ...(payload.context && typeof payload.context === 'object' ? { context: payload.context as Record<string, unknown> } : {}),
      ...(role === 'assistant' && pendingPlan ? { plan: pendingPlan } : {}),
      ...(payload.interfaceActions && typeof payload.interfaceActions === 'object' ? { interfaceActions: payload.interfaceActions as Record<string, unknown> } : {}),
      ...(payload.visualStory && typeof payload.visualStory === 'object' ? { visualStory: payload.visualStory as Record<string, unknown> } : {}),
      ...(payload.moduleOffer && typeof payload.moduleOffer === 'object' ? { moduleOffer: payload.moduleOffer as Record<string, unknown> } : {})
    });
    if (role === 'assistant') pendingPlan = undefined;
  }

  const correctionHistory = (correctionRows.results ?? [])
    .map((row) => normalizeCorrection(row))
    .filter((item): item is ThreadCorrection => Boolean(item));
  if (correctionHistory.length) {
    const latestAssistant = [...messages].reverse().find((message) => message.role === 'assistant');
    if (latestAssistant) {
      latestAssistant.correction = correctionHistory[0]!;
      latestAssistant.correctionHistory = correctionHistory;
    }
  }
  return messages;
}

export async function touchThread(env: Env, accountId: string, threadId: string, title?: string): Promise<void> {
  const cleanTitle = title?.replace(/\s+/g, ' ').trim().slice(0, 72);
  await env.DB.prepare(`UPDATE threads
    SET title = CASE
      WHEN title = 'Sovereign thread' AND ? <> '' THEN ?
      ELSE title
    END,
    updated_at = datetime('now')
    WHERE id = ? AND account_id = ?`)
    .bind(cleanTitle ?? '', cleanTitle ?? '', threadId, accountId)
    .run();
}

export async function getOwnedThread(env: Env, accountId: string, threadId: string) {
  return env.DB.prepare('SELECT id, account_id, covenant_enabled FROM threads WHERE id = ? AND account_id = ?').bind(threadId, accountId).first<{ id: string; account_id: string; covenant_enabled: number }>();
}

export async function setThreadCovenant(env: Env, accountId: string, threadId: string, enabled: boolean) {
  await ensureThread(env, accountId, threadId);
  await env.DB.prepare("UPDATE threads SET covenant_enabled = ?, updated_at = datetime('now') WHERE id = ? AND account_id = ?").bind(enabled ? 1 : 0, threadId, accountId).run();
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

function normalizeCorrection(row?: { correction: string; note: string | null; created_at: string } | null): ThreadCorrection | undefined {
  if (!row || !['yes', 'partly', 'not_today'].includes(row.correction)) return undefined;
  return {
    value: row.correction as ThreadCorrection['value'],
    ...(row.note?.trim() ? { note: row.note.trim().slice(0, 500) } : {}),
    createdAt: row.created_at
  };
}

function surfaceFromContextKind(value: string): ThreadSummary['surface'] {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'explore' || normalized === 'alignment') return 'Explore';
  if (normalized === 'people' || normalized === 'relationship') return 'People';
  if (normalized === 'systems' || normalized === 'system') return 'Systems';
  if (normalized === 'library') return 'Library';
  if (normalized === 'you' || normalized === 'account') return 'You';
  return 'Today';
}

function safeJson(value?: string): Record<string, unknown> {
  try {
    return value ? JSON.parse(value) as Record<string, unknown> : {};
  } catch {
    return {};
  }
}
