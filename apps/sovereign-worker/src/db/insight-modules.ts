import type { Env } from '../env';
import { recognitionPlanSchema } from '../agent/recognition';
import { ensureThread } from './threads';

export async function saveLatestInsightModule(env: Env, accountId: string, threadId: string): Promise<{ id: string; module: Record<string, unknown> }> {
  await ensureThread(env, accountId, threadId);
  const event = await env.DB.prepare(`SELECT te.payload_json
    FROM thread_events te JOIN threads t ON t.id = te.thread_id
    WHERE te.thread_id = ? AND t.account_id = ? AND te.event_type = 'assistant_plan'
    ORDER BY te.seq DESC LIMIT 1`).bind(threadId, accountId).first<{ payload_json: string }>();
  if (!event) throw new Response('No Insight Module is waiting for approval.', { status: 404 });

  const payload = safeJson(event.payload_json);
  const plan = recognitionPlanSchema.parse(payload.plan);
  if (!plan.module_suggestion.should_offer || !plan.module_suggestion.title) {
    throw new Response('The latest response did not offer an Insight Module.', { status: 409 });
  }

  const module = {
    title: plan.module_suggestion.title,
    recognition: plan.recognition,
    hidden_expectation: plan.candidate_hidden_expectation,
    inward_question: plan.inward_question,
    clearer_form: plan.clearer_form,
    practice: plan.practical_action,
    example: '',
    resource: null,
    basis: plan.basis,
    confidence: plan.confidence,
    safety_mode: plan.safety_mode,
    created_from_session_id: threadId,
    visibility: 'private',
    user_approved: true,
    created_at: new Date().toISOString()
  };
  const id = `module_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO saved_understandings (id, account_id, thread_id, kind, body_json) VALUES (?, ?, ?, ?, ?)')
    .bind(id, accountId, threadId, 'insight_module', JSON.stringify(module)).run();
  return { id, module };
}

function safeJson(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  } catch { return {}; }
}
