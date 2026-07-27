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
  covenantEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
  context?: Record<string, unknown>;
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

  return (rows.results ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title || 'Sovereign conversation'),
    contextKind: String(row.context_kind || 'personal'),
    covenantEnabled: Number(row.covenant_enabled) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  }));
}

export async function listThreadMessages(env: Env, accountId: string, threadId: string): Promise<ThreadMessage[]> {
  const owned = await getOwnedThread(env, accountId, threadId);
  if (!owned) throw new Response('Thread not found', { status: 404 });
  const rows = await env.DB.prepare(`SELECT id, event_type, payload_json, created_at
    FROM thread_events
    WHERE thread_id = ?
      AND event_type IN ('user_message', 'assistant_response', 'assistant_development_response')
    ORDER BY seq ASC`)
    .bind(threadId)
    .all<Record<string, string>>();

  let activeContext: ThreadContext = {
    version: 1,
    surface: surfaceFromContextKind(owned.context_kind),
    covenantEnabled: Number(owned.covenant_enabled) === 1
  };

  return (rows.results ?? []).flatMap((row) => {
    const payload = safeJson(row.payload_json);
    const rawText = typeof payload.text === 'string' ? payload.text : '';
    if (!rawText.trim()) return [];

    const isUser = row.event_type === 'user_message';
    activeContext = payloadContext(payload, activeContext);
    const decoded = isUser ? { text: rawText } : decodeResponseMetadata(rawText);
    const text = decoded.text.trim();
    if (!text) return [];
    const storedActions = payload.interfaceActions && typeof payload.interfaceActions === 'object'
      ? payload.interfaceActions as Record<string, unknown>
      : {};
    const interfaceActions = decoded.metadata
      ? { ...storedActions, ...decoded.metadata }
      : Object.keys(storedActions).length > 0 ? storedActions : undefined;

    return [{
      id: String(row.id),
      role: isUser ? 'user' as const : 'assistant' as const,
      text,
      createdAt: String(row.created_at),
      context: { ...activeContext },
      ...(interfaceActions ? { interfaceActions } : {}),
      ...(payload.visualStory && typeof payload.visualStory === 'object' ? { visualStory: payload.visualStory as Record<string, unknown> } : {}),
      ...(payload.moduleOffer && typeof payload.moduleOffer === 'object' ? { moduleOffer: payload.moduleOffer as Record<string, unknown> } : {})
    }];
  });
}

export async function touchThread(env: Env, accountId: string, threadId: string, title?: string): Promise<void> {
  const cleanTitle = title?.replace(/\s+/g, ' ').trim().slice(0, 72) ?? '';
  await env.DB.prepare(`UPDATE threads
    SET title = CASE
      WHEN title = 'Sovereign thread' AND ? <> '' THEN ?
      ELSE title
    END,
    updated_at = datetime('now')
    WHERE id = ? AND account_id = ?`)
    .bind(cleanTitle, cleanTitle, threadId, accountId)
    .run();
}

export async function getOwnedThread(env: Env, accountId: string, threadId: string) {
  return env.DB.prepare('SELECT id, account_id, context_kind, covenant_enabled FROM threads WHERE id = ? AND account_id = ?')
    .bind(threadId, accountId)
    .first<{ id: string; account_id: string; context_kind: string; covenant_enabled: number }>();
}

export async function setThreadCovenant(env: Env, accountId: string, threadId: string, enabled: boolean) {
  await ensureThread(env, accountId, threadId);
  await env.DB.prepare("UPDATE threads SET covenant_enabled = ?, updated_at = datetime('now') WHERE id = ? AND account_id = ?")
    .bind(enabled ? 1 : 0, threadId, accountId)
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

function safeJson(value?: string): Record<string, unknown> {
  try {
    return value ? JSON.parse(value) as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

interface ThreadContext { version: 1; surface: 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'; personId?: string; systemId?: string; covenantEnabled?: boolean }

function payloadContext(payload: Record<string, unknown>, fallback: ThreadContext): ThreadContext {
  const nested = payload.context && typeof payload.context === 'object' ? payload.context as Record<string, unknown> : {};
  const surface = normalizeSurface(nested.surface ?? payload.surface) ?? fallback.surface;
  const next: ThreadContext = { version: 1, surface, covenantEnabled: Boolean(nested.covenantEnabled ?? fallback.covenantEnabled) };
  if (validId(nested.personId)) next.personId = nested.personId;
  if (validId(nested.systemId)) next.systemId = nested.systemId;
  return next;
}

function surfaceFromContextKind(value: string): ThreadContext['surface'] {
  const normalized = value.toLowerCase();
  if (normalized === 'explore' || normalized === 'alignment') return 'Explore';
  if (normalized === 'people' || normalized === 'relationship') return 'People';
  if (normalized === 'systems' || normalized === 'system') return 'Systems';
  if (normalized === 'library') return 'Library';
  if (normalized === 'you' || normalized === 'account') return 'You';
  return 'Today';
}

function normalizeSurface(value: unknown): ThreadContext['surface'] | null {
  const match = ['Today', 'Explore', 'People', 'Systems', 'Library', 'You'].find((surface) => surface.toLowerCase() === String(value ?? '').toLowerCase());
  return (match as ThreadContext['surface'] | undefined) ?? null;
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function decodeResponseMetadata(value: string): { text: string; metadata?: Record<string, unknown> } {
  const prefix = '[[SOVEREIGN_META_V1:';
  if (!value.startsWith(prefix)) return { text: value };
  const end = value.indexOf(']]', prefix.length);
  if (end < 0) return { text: value };
  try {
    const encoded = value.slice(prefix.length, end);
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - encoded.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const metadata = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
    return { text: value.slice(end + 2).replace(/^\r?\n/, ''), metadata };
  } catch {
    return { text: value.slice(end + 2).replace(/^\r?\n/, '') };
  }
}
