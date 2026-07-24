import app, { ThreadCoordinator, queue as queueHandler, scheduled as scheduledHandler } from './index';
import { requireAuth, requireSameOrigin } from './security/auth';
import { decideInviteeConsent, listInviteeInvitations, previewInvitation, redeemInvitation, sendInvitation } from './invitation-service';

app.post('/api/v1/people/:personId/invitations/send', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ email?: string; requestedScopes?: string[] }>();
  const invitation = await sendInvitation(context.req.raw, context.env, auth.accountId, context.req.param('personId'), auth.subject, {
    email: body.email ?? '',
    requestedScopes: body.requestedScopes
  });
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

export { ThreadCoordinator };
export const queue = queueHandler;
export const scheduled = scheduledHandler;
export default app;
