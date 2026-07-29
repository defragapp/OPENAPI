import app, { ThreadCoordinator, queue as queueHandler, scheduled as scheduledHandler } from './index';
import type { Env } from './env';
import { requireAuth, requireSameOrigin } from './security/auth';
import { withSecurityHeaders } from './security/headers';
import { decideInviteeConsent, listInviteeInvitations, previewInvitation, redeemInvitation, sendInvitation } from './invitation-service';
import { addConsentedSystemMember, buildPairComparison, buildSystemAnalysis } from './relational-context';
import { removePerson } from './db/people';
import { ensureThread, appendThreadEvent, getOwnedThread, touchThread } from './db/threads';
import { getTurn, startTurn, updateTurnStatus } from './db/turns';
import { getEntitlements } from './db/entitlements';
import { reserveAiTurn } from './billing/usage';
import { runSovereignResult } from './agent/sovereign';
import { saveLatestInsightModule } from './db/insight-modules';
import { canUseDevelopmentFixtures } from './runtime';
import { clearCurrentConditions, computeCurrentConditions, parseLocationPrecision, type CurrentLocationInput, type LocationPrecision } from './baseline';
import { resolveAiModelConfig } from '@sovereign/agent-contracts';
import { authorizeConversationContext, parseConversationContext } from './conversation-context';
import { buildInterfaceActions } from './interface-actions';
import type { SovereignAnswerAction } from './agent/recognition';

app.post('/api/v1/people/:personId/invitations/send', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ email?: string; requestedScopes?: string[] }>();
  const input: { email: string; requestedScopes?: string[] } = { email: body.email ?? '' };
  if (body.requestedScopes) input.requestedScopes = body.requestedScopes;
  const invitation = await sendInvitation(context.req.raw, context.env, auth.accountId, context.req.param('personId'), auth.subject, input);
  return context.json({ invitation }, 201);
});

app.delete('/api/v1/people/:personId', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  await removePerson(context.env, auth.accountId, context.req.param('personId'));
  return context.json({ ok: true, removed: context.req.param('personId') });
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
      let response: Response;

      const messageMatch = url.pathname.match(/^\/api\/v1\/threads\/([^/]+)\/messages$/);
      if (request.method === 'POST' && messageMatch) {
        response = await handleRecognitionMessage(request, env, decodeURIComponent(messageMatch[1]!));
        return secure(response);
      }

      const moduleMatch = url.pathname.match(/^\/api\/v1\/threads\/([^/]+)\/modules\/latest$/);
      if (request.method === 'POST' && moduleMatch) {
        requireSameOrigin(request);
        const auth = await requireAuth(request, env);
        const body = await request.json().catch(() => ({})) as { approved?: boolean };
        response = body.approved === true
          ? Response.json({ saved: await saveLatestInsightModule(env, auth.accountId, decodeURIComponent(moduleMatch[1]!)) }, { status: 201 })
          : Response.json({ error: 'Explicit approval is required.' }, { status: 400 });
        return secure(response);
      }

      const pairMatch = url.pathname.match(/^\/api\/v1\/people\/([^/]+)\/compare$/);
      if (request.method === 'POST' && pairMatch) {
        requireSameOrigin(request);
        const auth = await requireAuth(request, env);
        response = Response.json({ comparison: await buildPairComparison(env, auth.accountId, decodeURIComponent(pairMatch[1]!)) });
        return secure(response);
      }

      const memberMatch = url.pathname.match(/^\/api\/v1\/systems\/([^/]+)\/members$/);
      if (request.method === 'POST' && memberMatch) {
        requireSameOrigin(request);
        const auth = await requireAuth(request, env);
        const body = await request.json().catch(() => ({})) as { personId?: string; metadata?: Record<string, unknown> };
        response = body.personId
          ? Response.json({ membership: await addConsentedSystemMember(env, auth.accountId, decodeURIComponent(memberMatch[1]!), body.personId, body.metadata ?? {}) }, { status: 201 })
          : Response.json({ error: 'personId required' }, { status: 400 });
        return secure(response);
      }

      const alignmentMatch = url.pathname.match(/^\/api\/v1\/systems\/([^/]+)\/alignment$/);
      if (request.method === 'GET' && alignmentMatch) {
        const auth = await requireAuth(request, env);
        response = Response.json({ analysis: await buildSystemAnalysis(env, auth.accountId, decodeURIComponent(alignmentMatch[1]!)) });
        return secure(response);
      }

      if (request.method === 'POST' && url.pathname === '/api/v1/current-conditions') {
        requireSameOrigin(request);
        const auth = await requireAuth(request, env);
        const body = await request.json().catch(() => ({})) as {
          locationPrecision?: LocationPrecision;
          latitude?: number;
          longitude?: number;
        };
        const location: CurrentLocationInput = {};
        if (typeof body.latitude === 'number') location.latitude = body.latitude;
        if (typeof body.longitude === 'number') location.longitude = body.longitude;
        response = Response.json({
          current: await computeCurrentConditions(
            env,
            auth.accountId,
            parseLocationPrecision(body.locationPrecision ?? 'none'),
            location
          )
        });
        return secure(response);
      }

      if (request.method === 'DELETE' && url.pathname === '/api/v1/current-conditions') {
        requireSameOrigin(request);
        const auth = await requireAuth(request, env);
        response = Response.json({ current: await clearCurrentConditions(env, auth.accountId) });
        return secure(response);
      }

      response = await app.fetch(request, env, executionContext);
      if (request.method === 'GET' && ['/health', '/healthz', '/ready'].includes(url.pathname) && response.headers.get('content-type')?.includes('application/json')) {
        const payload = await response.json() as Record<string, unknown>;
        const headers = new Headers(response.headers);
        headers.delete('content-length');
        response = Response.json({
          ...payload,
          migrationVersion: '0012_baseline_facets_and_answer_v2',
          answerContract: 'sovereign-answer.v2'
        }, { status: response.status, headers });
      }
      return secure(response);
    } catch (error) {
      if (!(error instanceof Response)) console.error('sovereign_entry_failure', { error: error instanceof Error ? error.name : 'unknown' });
      return secure(error instanceof Response ? error : Response.json({ error: 'Internal error' }, { status: 500 }));
    }
  }
};

function secure(response: Response): Response {
  return withSecurityHeaders(response);
}

function encodeMetadataHeader(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function handleRecognitionMessage(request: Request, env: Env, threadId: string): Promise<Response> {
  requireSameOrigin(request);
  const auth = await requireAuth(request, env);
  const body = await request.json().catch(() => ({})) as { message?: string; context?: unknown };
  const message = body.message?.trim();
  if (!message) return Response.json({ error: 'Message required' }, { status: 400 });
  const idempotencyKey = request.headers.get('x-idempotency-key');
  if (!idempotencyKey) return Response.json({ error: 'Idempotency key required' }, { status: 400 });

  const entitlements = await getEntitlements(env, auth.accountId);
  const selection = parseConversationContext(body.context);
  const authorizedContext = await authorizeConversationContext(env, auth.accountId, selection, entitlements);
  await ensureThread(env, auth.accountId, threadId, selection.surface?.toLowerCase() ?? 'personal');
  await touchThread(env, auth.accountId, threadId, message);
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
  await appendThreadEvent(env, threadId, turn.sequence, 'user_message', { text: message, context: selection }, traceId);

  const aiConfig = resolveAiModelConfig(env);
  if (aiConfig.provider !== 'cloudflare-gateway' || !env.AI || !env.AI_GATEWAY_ID) {
    if (!canUseDevelopmentFixtures(env)) {
      await updateTurnStatus(env, auth.accountId, threadId, idempotencyKey, 'failed', 'gateway_unavailable');
      return Response.json({ error: 'Sovereign is temporarily unavailable. Your message remains in this private conversation, but no response was generated.' }, { status: 503 });
    }
    const fallback = {
      version: 'sovereign-answer.v2' as const,
      mode: 'baseline' as const,
      depth: 'focused' as const,
      headline: 'Your Baseline is still being prepared.',
      direct_answer: 'The development fixture cannot provide a personalized interpretation until the structured Baseline facets are available. No quality or current state is being guessed.',
      sections: [
        { id: 'unknowns' as const, label: 'Still needed', body: 'Complete the Baseline calculation, then ask this question again.' }
      ],
      basis_refs: [],
      correction_prompt: 'Nothing has been saved as an interpretation.',
      actions: [],
      confidence: 'exploratory' as const,
      safety_mode: 'standard' as const
    };
    const fallbackText = `${fallback.headline}\n\n${fallback.direct_answer}\n\nSTILL NEEDED\n\n${fallback.sections[0]!.body}`;
    await appendThreadEvent(env, threadId, turn.sequence + 2, 'assistant_development_response', {
      developmentFallback: true,
      text: fallbackText,
      answer: fallback,
      basis: []
    }, traceId);
    await updateTurnStatus(env, auth.accountId, threadId, idempotencyKey, 'completed');
    return request.headers.get('accept')?.includes('application/vnd.sovereign.answer+json')
      ? Response.json({ answer: fallback, basis: [], interfaceActions: { version: 2, primary: null, contextual: [], confirmationRequired: true } }, {
          status: 202,
          headers: { 'cache-control': 'private, no-store', 'x-sovereign-plan': entitlements.plan, 'x-sovereign-answer-version': 'sovereign-answer.v2' }
        })
      : new Response(fallbackText, {
          status: 202,
          headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'private, no-store', 'x-sovereign-plan': entitlements.plan, 'x-sovereign-answer-version': 'sovereign-answer.v2' }
        });
  }

  const usage = await reserveAiTurn(env, auth.accountId, entitlements.plan);
  try {
    const thread = await getOwnedThread(env, auth.accountId, threadId);
    const result = await runSovereignResult(message, {
      env, accountId: auth.accountId, threadId, traceId,
      covenantEnabled: thread?.covenant_enabled === 1,
      plan: entitlements.plan,
      ...(selection.personId ? { personId: selection.personId } : {}),
      ...(selection.systemId ? { systemId: selection.systemId } : {}),
      ...(authorizedContext !== undefined ? { authorizedContext } : {})
    });
    const interfaceActions = buildInterfaceActions(message, selection, entitlements);
    const trustedActions: SovereignAnswerAction[] = [interfaceActions.primary, ...interfaceActions.contextual]
      .flatMap((action) => {
        if (!action || action.type === 'show_plan') return [];
        return [{
          type: action.type,
          label: action.label,
          ...(action.target_id ? { target_id: action.target_id } : {})
        }];
      });
    result.answer.actions = trustedActions;
    await appendThreadEvent(env, threadId, turn.sequence + 1, 'assistant_plan', { answer: result.answer }, traceId);
    await appendThreadEvent(env, threadId, turn.sequence + 2, 'assistant_response', {
      text: result.text,
      answer: result.answer,
      basis: result.basis,
      context: selection,
      interfaceActions
    }, traceId);
    await updateTurnStatus(env, auth.accountId, threadId, idempotencyKey, 'completed');
    const headers = new Headers({
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'private, no-store',
      'x-sovereign-plan': entitlements.plan,
      'x-sovereign-ai-remaining': String(usage.remaining),
      'x-sovereign-answer-version': 'sovereign-answer.v2',
      'x-sovereign-answer-mode': result.answer.mode,
      'x-sovereign-answer-depth': result.answer.depth,
      'x-sovereign-interface-actions': encodeMetadataHeader(interfaceActions)
    });
    return request.headers.get('accept')?.includes('application/vnd.sovereign.answer+json')
      ? Response.json({
          answer: result.answer,
          basis: result.basis,
          interfaceActions
        }, { status: 202, headers })
      : new Response(result.text, { status: 202, headers });
  } catch (error) {
    await updateTurnStatus(env, auth.accountId, threadId, idempotencyKey, 'failed', 'recognition_failed');
    throw error;
  }
}

export { ThreadCoordinator };
export const queue = queueHandler;
export const scheduled = scheduledHandler;
export default worker;
