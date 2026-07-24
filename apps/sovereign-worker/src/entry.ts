import app, { ThreadCoordinator, queue as queueHandler, scheduled as scheduledHandler } from './index';
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

export { ThreadCoordinator };
export const queue = queueHandler;
export const scheduled = scheduledHandler;
export default app;
