import type { Env } from '../env';
import { sovereignAnswerSchema } from '../agent/recognition';
import { getEntitlements, requireFeature } from './entitlements';
import { ensureThread } from './threads';

export async function saveLatestInsightModule(env: Env, accountId: string, threadId: string): Promise<{ id: string; module: Record<string, unknown> }> {
  requireFeature(await getEntitlements(env, accountId), 'library.continuity');
  await ensureThread(env, accountId, threadId);
  const event = await env.DB.prepare(`SELECT te.id, te.payload_json
    FROM thread_events te JOIN threads t ON t.id = te.thread_id
    WHERE te.thread_id = ? AND t.account_id = ? AND te.event_type = 'assistant_plan'
    ORDER BY te.seq DESC LIMIT 1`).bind(threadId, accountId).first<{ id: string; payload_json: string }>();
  if (!event) throw new Response('No Insight Module is waiting for approval.', { status: 404 });

  const payload = safeJson(event.payload_json);
  const answer = sovereignAnswerSchema.parse(payload.answer);

  const module = {
    title: answer.headline,
    summary: answer.direct_answer,
    sections: answer.sections,
    basis_refs: answer.basis_refs,
    confidence: answer.confidence,
    safety_mode: answer.safety_mode,
    created_from_session_id: threadId,
    source_event_id: event.id,
    visibility: 'private',
    user_approved: true,
    created_at: new Date().toISOString()
  };
  const id = `module_${event.id}`;
  await env.DB.prepare('INSERT OR IGNORE INTO saved_understandings (id, account_id, thread_id, kind, body_json) VALUES (?, ?, ?, ?, ?)')
    .bind(id, accountId, threadId, 'insight_module', JSON.stringify(module)).run();
  const stored = await env.DB.prepare('SELECT body_json FROM saved_understandings WHERE id = ? AND account_id = ? AND kind = ?')
    .bind(id, accountId, 'insight_module')
    .first<{ body_json: string }>();
  if (!stored) throw new Response('The Insight Module could not be saved.', { status: 500 });
  return { id, module: safeJson(stored.body_json) };
}

function safeJson(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  } catch { return {}; }
}
