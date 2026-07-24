import app, { ThreadCoordinator, queue as queueHandler, scheduled as scheduledHandler } from './index';
import type { Env } from './env';
import { requireAuth, requireSameOrigin } from './security/auth';
import { decideInviteeConsent, listInviteeInvitations, previewInvitation, redeemInvitation, sendInvitation } from './invitation-service';
import { addConsentedSystemMember, buildPairComparison, buildSystemAnalysis } from './relational-context';
import { ensureThread, appendThreadEvent } from './db/threads';
import { getTurn, startTurn, updateTurnStatus } from './db/turns';
import { getEntitlements } from './db/entitlements';
import { reserveAiTurn } from './billing/usage';
import { runSovereignResult } from './agent/sovereign';
import { saveLatestInsightModule } from './db/insight-modules';
import { canUseDevelopmentFixtures } from './runtime';
import { resolveAiModelConfig } from '@sovereign/agent-contracts';

app.post('/api/v1/people/:personId/invitations/send', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ email?: string; requestedScopes?: string[] }>();
  const input: { email: string; requestedScopes?: string[] } = { email: body.email ?? '' };
  if (body.requestedScopes) input.requestedScopes = body.requestedScopes;
  const invitation = await sendInvitation(context.req.raw, context.env, auth.accountId, context.req.param('personId'), auth.subject, input);
  return context.json({ invitation }, 201);
});

app.get('/api/v1/invitations/preview', async (context) => context.json({ invitation: await previewInvitation(context.req.raw, context.env) }));

app.post('/api/v1/invitations/redeem', async (context) => {
  requireSameOrigin(context.req.raw);
  return redeemInvitation(context.req.raw, context.env);
});

app.get('/api/v1/invitations/mine', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ invitations: await listInviteeInvitations(context.env, auth.accountId) });
});

app.put('/api/v1/invitations/:invitationId/consent/:scope', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ granted?: boolean; reason?: string }>();
  const consent = await decideInviteeConsent(
    context.env,
    auth.accountId,
    context.req.param('invitationId'),
    context.req.param('scope'),
    body.granted === true,
    auth.subject,
    body.reason
  );
  return context.json({ consent });
});

app.post('/api/v1/people/:personId/comparison', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ comparison: await buildPairComparison(context.env, auth.accountId, context.req.param('personId')) });
});

app.post('/api/v1/systems/:systemId/members/consented', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ personId?: string; metadata?: Record<string, unknown> }>();
  if (!body.personId) return context.json({ error: 'personId required' }, 400);
  const membership = await addConsentedSystemMember(context.env, auth.accountId, context.req.param('systemId'), body.personId, body.metadata ?? {});
  return context.json({ membership }, 201);
});

app.get('/api/v1/systems/:systemId/analysis', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ analysis: await buildSystemAnalysis(context.env, auth.accountId, context.req.param('systemId')) });
});

const worker = {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);

      const messageMatch = url.pathname.match(/^\/api\/v1\/threads\/([^/]+)\/messages$/);
      if (request.method === 'POST' && messageMatch) return handleRecognitionMessage(request, env, decodeURIComponent(messageMatch[1]!));

      const moduleMatch = url.pathname.match(/^\/api\/v1\/threads\/([^/]+)\/modules\/latest$/);
      if (request.method === 'POST' && moduleMatch) {
        requireSameOrigin(request);
        const auth = await requireAuth(request, env);
        const body = await request.json().catch(() => ({})) as { approved?: boolean };
        if (body.approved !== true) return Response.json({ error: 'Explicit approval is required.' }, { status: 400 });
        return Response.json({ saved: await saveLatestInsightModule(env, auth.accountId, decodeURIComponent(moduleMatch[1]!)) }, { status: 201 });
      }

      const pairMatch = url.pathname.match(/^\/api\/v1\/people\/([^/]+)\/compare$/);
      if (request.method === 'POST' && pairMatch) {
        requireSameOrigin(request);
        const auth = await requireAuth(request, env);
        return Response.json({ comparison: await buildPairComparison(env, auth.accountId, decodeURIComponent(pairMatch[1]!)) });
      }

      const memberMatch = url.pathname.match(/^\/api\/v1\/systems\/([^/]+)\/members$/);
      if (request.method === 'POST' && memberMatch) {
        requireSameOrigin(request);
        const auth = await requireAuth(request, env);
        const body = await request.json().catch(() => ({})) as { personId?: string; metadata?: Record<string, unknown> };
        if (!body.personId) return Response.json({ error: 'personId required' }, { status: 400 });
        return Response.json({ membership: await addConsentedSystemMember(env, auth.accountId, decodeURIComponent(memberMatch[1]!), body.personId, body.metadata ?? {}) }, { status: 201 });
      }

      const alignmentMatch = url.pathname.match(/^\/api\/v1\/systems\/([^/]+)\/alignment$/);
      if (request.method === 'GET' && alignmentMatch) {
        const auth = await requireAuth(request, env);
        return Response.json({ analysis: await buildSystemAnalysis(env, auth.accountId, decodeURIComponent(alignmentMatch[1]!)) });
      }

      const response = await app.fetch(request, env, executionContext);
      if (request.method === 'GET' && ['/health', '/healthz', '/ready'].includes(url.pathname) && response.headers.get('content-type')?.includes('application/json')) {
        const payload = await response.json() as Record<string, unknown>;
        const headers = new Headers(response.headers);
        headers.delete('content-length');
        return Response.json({ ...payload, migrationVersion: '0008_identity_bound_invitations', recognitionContract: 'inner-recognition-v1' }, { status: response.status, headers });
      }
      return response;
    } catch (error) {
      if (error instanceof Response) return error;
      console.error('sovereign_entry_failure', { error: error instanceof Error ? error.name : 'unknown' });
      return Response.json({ error: 'Internal error' }, { status: 500 });
    }
  }
};

async function handleRecognitionMessage(request: Request, env: Env, threadId: string): Promise<Response> {
  requireSameOrigin(request);
  const auth = await requireAuth(request, env);
  const body = await request.json().catch(() => ({})) as { message?: string; context?: { surface?: string } };
  const message = body.message?.trim();
  if (!message) return Response.json({ error: 'Message required' }, { status: 400 });
  const idempotencyKey = request.headers.get('x-idempotency-key');
  if (!idempotencyKey) return Response.json({ error: 'Idempotency key required' }, { status: 400 });

  const entitlements = await getEntitlements(env, auth.accountId);
  await ensureThread(env, auth.accountId, threadId, body.context?.surface?.toLowerCase() ?? 'personal');
  const coordinator = env.THREADS.get(env.THREADS.idFromName(`${auth.accountId}:${threadId}`));
  const coordination = await coordinator.fetch('https://thread.internal/turn', {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey, accountId: auth.accountId, message })
  });
  if (!coordination.ok) return coordination;
  const turn = await coordination.json<{ sequence: number; duplicate: boolean }>();
  if (turn.duplicate) {
    const existing = await getTurn(env, auth.accountId, threadId, idempotencyKey);
    return Response.json({ duplicate: true, status: existing.status, sequence: existing.seq }, { status: existing.status === 'completed' ? 200 : 409 });
  }

  const traceId = crypto.randomUUID();
  await startTurn(env, auth.accountId, threadId, idempotencyKey, turn.sequence);
  await appendThreadEvent(env, threadId, turn.sequence, 'user_message', { redacted: true, surface: body.context?.surface ?? 'Today' }, traceId);

  const aiConfig = resolveAiModelConfig(env);
  if (aiConfig.provider !== 'cloudflare-gateway' || !env.AI || !env.AI_GATEWAY_ID) {
    if (!canUseDevelopmentFixtures(env)) {
      await updateTurnStatus(env, auth.accountId, threadId, idempotencyKey, 'failed', 'gateway_unavailable');
      return Response.json({ error: 'Sovereign is temporarily unavailable. Nothing was guessed or saved.' }, { status: 503 });
    }
    const fallback = 'WHAT I NOTICE\n\nThe private Baseline provider is not available in this development environment, so I will not guess what this moment means.\n\nLOOK INWARD\n\nWhat changed inside you when this happened?';
    await appendThreadEvent(env, threadId, turn.sequence + 2, 'assistant_development_response', { developmentFallback: true, text: fallback }, traceId);
    await updateTurnStatus(env, auth.accountId, threadId, idempotencyKey, 'completed');
    return new Response(fallback, { status: 202, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-sovereign-plan': entitlements.plan, 'x-sovereign-response-phase': 'question' } });
  }

  const usage = await reserveAiTurn(env, auth.accountId, entitlements.plan);
  try {
    const result = await runSovereignResult(message, { env, accountId: auth.accountId, threadId, traceId, covenantEnabled: false, plan: entitlements.plan });
    await appendThreadEvent(env, threadId, turn.sequence + 1, 'assistant_plan', { plan: result.plan }, traceId);
    await appendThreadEvent(env, threadId, turn.sequence + 2, 'assistant_response', { redacted: true, text: result.text }, traceId);
    await updateTurnStatus(env, auth.accountId, threadId, idempotencyKey, 'completed');
    const headers = new Headers({
      'content-type': 'text/plain; charset=utf-8',
      'x-sovereign-plan': entitlements.plan,
      'x-sovereign-ai-remaining': String(usage.remaining),
      'x-sovereign-response-phase': result.plan.response_phase,
      'x-sovereign-module-offer': result.plan.module_suggestion.should_offer ? '1' : '0'
    });
    if (result.plan.module_suggestion.should_offer && result.plan.module_suggestion.title) headers.set('x-sovereign-module-title', encodeURIComponent(result.plan.module_suggestion.title));
    return new Response(result.text, { status: 202, headers });
  } catch (error) {
    await updateTurnStatus(env, auth.accountId, threadId, idempotencyKey, 'failed', 'recognition_failed');
    throw error;
  }
}

export { ThreadCoordinator };
export const queue = queueHandler;
export const scheduled = scheduledHandler;
export default worker;
