import app, { ThreadCoordinator, queue as queueHandler, scheduled as scheduledHandler } from './index';
import type { Env } from './env';
import { requireAuth, requireSameOrigin } from './security/auth';
import { decideInviteeConsent, listInviteeInvitations, previewInvitation, redeemInvitation, sendInvitation } from './invitation-service';
import { addConsentedSystemMember, buildPairComparison, buildSystemAnalysis } from './relational-context';

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
        return Response.json({ ...payload, migrationVersion: '0008_identity_bound_invitations' }, { status: response.status, headers });
      }
      return response;
    } catch (error) {
      if (error instanceof Response) return error;
      console.error('identity_route_failure', { error: error instanceof Error ? error.name : 'unknown' });
      return Response.json({ error: 'Internal error' }, { status: 500 });
    }
  }
};

export { ThreadCoordinator };
export const queue = queueHandler;
export const scheduled = scheduledHandler;
export default worker;
