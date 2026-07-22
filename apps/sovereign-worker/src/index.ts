import { Hono } from 'hono';
import type { Env } from './env';
import { ThreadCoordinator } from './durable/ThreadCoordinator';
import { requireAuth, requireSameOrigin } from './security/auth';
import { withSecurityHeaders } from './security/headers';
import { getEntitlements, requireFeature } from './db/entitlements';
import { ensureThread, appendThreadEvent, recordCorrection, requireOwnedThread, setThreadCovenantEnabled } from './db/threads';
import { getTurn, startTurn, updateTurnStatus } from './db/turns';
import { assertSovereignOutputSafety } from './agent/safety';
import { runSovereignStream } from './agent/sovereign';
import { compareBaselineToCurrentConditions } from './adapters/sovv';
import { handleStripeWebhook } from './routes/stripe';
import { canUseDevelopmentFixtures, serviceUnavailable } from './runtime';
import { createInvitation, createPerson, listPeople, requireConsent, setConsent, updateInvitationStatus, type InvitationStatus, type RelationshipMetadataInput } from './db/people';
import { addSystemMember, analyzeSystem, cancelDeletionJob, createDeletionJob, createExportJob, createSystem, deleteUnderstanding, freeEntitlements, listSystems, listUnderstandings, saveUnderstanding, updateUnderstanding, type SystemType } from './db/product';
import { createCheckoutSession, createPortalSession, normalizeStripeFixtureEvent, projectSubscriptionEvent, supportLink, type PlanKey } from './billing/stripe';
import { applyBiblicalLens, assertCovenantSafe, retrieveScripture } from './covenant/scripture';
import { resolveAiModelConfig } from '@sovereign/agent-contracts';
import { beginMagicLink, beginSignup, redeemMagicLink, revokeAllSessions, revokeSession, saveBaselineOnboarding, verifyEmailToken } from './auth-public';

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (context, next) => {
  await next();
  context.res = withSecurityHeaders(context.res);
});

async function healthPayload(env: Env) {
  const db = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
  return {
    ok: db?.ok === 1,
    version: env.APP_VERSION,
    environment: env.APP_ENV,
    migrationVersion: '0003_product_completion',
    dependencies: {
      d1: db?.ok === 1 ? 'ok' : 'degraded',
      durableObjects: env.THREADS ? 'configured' : 'missing',
      assets: env.ASSETS ? 'configured' : 'missing',
      ai: aiDependencyStatus(env),
      aiGateway: env.AI_GATEWAY_ID ? 'configured' : 'missing',
      sovv: env.SOVV_INTERNAL_BASE_URL ? 'configured' : 'missing',
      stripe: env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'fixture-or-disabled',
      scripture: env.SCRIPTURE_TRANSLATION || 'WEB'
    }
  };
}

app.get('/healthz', async (context) => context.json(await healthPayload(context.env)));
app.get('/health', async (context) => context.json(await healthPayload(context.env)));
app.get('/ready', async (context) => {
  const payload = await healthPayload(context.env);
  return context.json({ ...payload, ready: payload.ok && payload.dependencies.durableObjects === 'configured' && payload.dependencies.ai !== 'missing' });
});

function aiDependencyStatus(env: Env): 'configured' | 'degraded' | 'missing' {
  const config = resolveAiModelConfig(env);
  if (config.provider === 'cloudflare-gateway') return env.AI && env.AI_GATEWAY_ID ? 'configured' : 'missing';
  return env.OPENAI_API_KEY ? 'degraded' : 'missing';
}

function isSovereignRuntimeReady(env: Env): boolean {
  const config = resolveAiModelConfig(env);
  if (config.provider === 'cloudflare-gateway') return Boolean(env.AI && env.AI_GATEWAY_ID);
  return Boolean(env.OPENAI_API_KEY);
}

app.post('/api/v1/stripe/webhook', (context) => handleStripeWebhook(context.req.raw, context.env));


app.get('/api/v1/public/config', (context) => context.json({
  product: 'Sovereign.OS',
  plans: ['free', 'sovereign_plus'],
  paidPlanName: 'Sovereign+',
  support: supportLink(context.env),
  auth: { passwordless: true, turnstileRequired: true },
  positioning: 'A private, living map of the user, their relationships, and the systems around them.'
}));

app.post('/api/v1/auth/signup', async (context) => {
  requireSameOrigin(context.req.raw);
  const result = await beginSignup(context.env, await context.req.json());
  return context.json(result, 202);
});

app.post('/api/v1/auth/verify', async (context) => {
  requireSameOrigin(context.req.raw);
  const body = await context.req.json<{ token?: string }>();
  const result = await verifyEmailToken(context.env, body.token);
  context.header('Set-Cookie', result.session.cookie);
  return context.json({ ok: true, next: result.next });
});

app.post('/api/v1/auth/login', async (context) => {
  requireSameOrigin(context.req.raw);
  return context.json(await beginMagicLink(context.env, await context.req.json()), 202);
});

app.post('/api/v1/auth/magic', async (context) => {
  requireSameOrigin(context.req.raw);
  const body = await context.req.json<{ token?: string }>();
  const result = await redeemMagicLink(context.env, body.token);
  context.header('Set-Cookie', result.session.cookie);
  return context.json({ ok: true });
});

app.post('/api/v1/auth/logout', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ sessionId?: string }>().catch((): { sessionId?: string } => ({}));
  if (body.sessionId) await revokeSession(context.env, body.sessionId);
  context.header('Set-Cookie', '__Host-sovereign_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0');
  return context.json({ ok: true });
});

app.post('/api/v1/auth/logout-all', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  await revokeAllSessions(context.env, auth.accountId);
  context.header('Set-Cookie', '__Host-sovereign_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0');
  return context.json({ ok: true });
});

app.post('/api/v1/baseline/onboarding', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ baseline: await saveBaselineOnboarding(context.env, auth.accountId, await context.req.json()) });
});


app.get('/api/v1/people', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ people: await listPeople(context.env, auth.accountId), consentScopes: ['pair.compare', 'system.include', 'trait.display', 'framework.display', 'current_conditions.use', 'library.link', 'covenant.include'] });
});

app.post('/api/v1/people', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ displayName?: string; role?: string; metadata?: RelationshipMetadataInput }>();
  const input: { displayName: string; role: string; metadata?: RelationshipMetadataInput } = { displayName: body.displayName ?? '', role: body.role ?? 'relationship' };
  if (body.metadata) input.metadata = body.metadata;
  const person = await createPerson(context.env, auth.accountId, input);
  return context.json({ person }, 201);
});

app.post('/api/v1/people/:personId/invitations', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const invitation = await createInvitation(context.env, auth.accountId, context.req.param('personId'), auth.subject);
  return context.json({ invitation }, 201);
});

app.patch('/api/v1/invitations/:invitationId', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ status?: InvitationStatus }>();
  await updateInvitationStatus(context.env, auth.accountId, context.req.param('invitationId'), body.status ?? 'revoked');
  return context.json({ ok: true, status: body.status });
});

app.put('/api/v1/people/:personId/consent/:scope', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ granted?: boolean; reason?: string }>();
  const result = await setConsent(context.env, auth.accountId, context.req.param('personId'), context.req.param('scope'), body.granted === true, auth.subject, body.reason);
  return context.json({ consent: result });
});

app.post('/api/v1/people/:personId/compare', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const personId = context.req.param('personId');
  await requireConsent(context.env, auth.accountId, personId, 'pair.compare');
  await requireConsent(context.env, auth.accountId, personId, 'trait.display');
  return context.json({
    personId,
    comparison: {
      individualAlignment: 'Available only as reduced, consented pattern language.',
      interactionAlignment: 'Shows possible friction without assigning hidden intent.',
      roleAlignment: 'Separates relationship role expectations from actual state.',
      twoPlausiblePerspectives: ['You may read pace as pressure.', 'They may read pace as clarity.'],
      unknownActualState: 'No exact emotion, motive, diagnosis, or future behavior is inferred.'
    }
  });
});


app.get('/api/v1/systems', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ systems: await listSystems(context.env, auth.accountId), supportedTypes: ['family', 'household', 'friendship_group', 'team', 'workplace', 'custom'] });
});

app.post('/api/v1/systems', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ name?: string; systemType?: SystemType; metadata?: Record<string, unknown> }>();
  const systemInput: { name: string; systemType: SystemType; metadata?: Record<string, unknown> } = { name: body.name ?? '', systemType: body.systemType ?? 'custom' };
  if (body.metadata) systemInput.metadata = body.metadata;
  const system = await createSystem(context.env, auth.accountId, systemInput);
  return context.json({ system }, 201);
});

app.post('/api/v1/systems/:systemId/members', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ personId?: string; metadata?: Record<string, unknown> }>();
  if (!body.personId) return context.json({ error: 'personId required' }, 400);
  const membership = await addSystemMember(context.env, auth.accountId, context.req.param('systemId'), body.personId, body.metadata ?? {});
  return context.json({ membership }, 201);
});

app.get('/api/v1/systems/:systemId/alignment', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  const systems = await listSystems(context.env, auth.accountId);
  const system = systems.find((item) => item.id === context.req.param('systemId'));
  if (!system) return context.json({ error: 'System not found' }, 404);
  return context.json({ systemId: system.id, analysis: analyzeSystem(String(system.systemType)) });
});

app.get('/api/v1/library', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ understandings: await listUnderstandings(context.env, auth.accountId), savePolicy: 'explicit_user_approval_only' });
});

app.post('/api/v1/library', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ title?: string; summary?: string; threadId?: string; links?: Record<string, string>; uncertainty?: string }>();
  if (!body.title || !body.summary) return context.json({ error: 'title and summary required' }, 400);
  const saveInput: { title: string; summary: string; threadId?: string; links?: Record<string, string>; uncertainty?: string } = { title: body.title, summary: body.summary };
  if (body.threadId) saveInput.threadId = body.threadId;
  if (body.links) saveInput.links = body.links;
  if (body.uncertainty) saveInput.uncertainty = body.uncertainty;
  const saved = await saveUnderstanding(context.env, auth.accountId, saveInput);
  return context.json({ saved }, 201);
});

app.patch('/api/v1/library/:understandingId', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  await updateUnderstanding(context.env, auth.accountId, context.req.param('understandingId'), await context.req.json<Record<string, unknown>>());
  return context.json({ ok: true });
});

app.delete('/api/v1/library/:understandingId', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  await deleteUnderstanding(context.env, auth.accountId, context.req.param('understandingId'));
  return context.json({ ok: true });
});

app.get('/api/v1/you', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ accountId: auth.accountId, baselineStatus: 'resolved-through-sovv-adapter', locationPermission: 'configured-by-privacy-settings', people: '/api/v1/people', systems: '/api/v1/systems', privacy: { export: '/api/v1/export-jobs', deletion: '/api/v1/deletion-jobs' }, billing: '/api/v1/billing/entitlements', accessibility: { reducedMotion: 'supported', textScaling: 'supported' } });
});

app.post('/api/v1/export-jobs', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ exportJob: await createExportJob(context.env, auth.accountId) }, 202);
});

app.post('/api/v1/deletion-jobs', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  return context.json({ deletionJob: await createDeletionJob(context.env, auth.accountId) }, 202);
});

app.patch('/api/v1/deletion-jobs/:jobId', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ action?: string }>();
  if (body.action !== 'cancel') return context.json({ error: 'Only cancellation is implemented before production deletion.' }, 400);
  await cancelDeletionJob(context.env, auth.accountId, context.req.param('jobId'));
  return context.json({ ok: true, status: 'cancelled' });
});

app.get('/api/v1/billing/entitlements', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  const projected = await getEntitlements(context.env, auth.accountId);
  return context.json({ effective: projected, fallback: freeEntitlements(), support: supportLink(context.env) });
});

app.post('/api/v1/billing/checkout', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ plan?: PlanKey; idempotencyKey?: string; interval?: 'monthly' | 'annual' }>();
  const session = await createCheckoutSession(context.env, auth.accountId, body.plan ?? 'sovereign_plus', body.idempotencyKey, body.interval ?? 'monthly');
  return context.json({ checkout: session }, 201);
});

app.post('/api/v1/billing/portal', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const session = await createPortalSession(auth.accountId);
  return context.json({ portal: session }, 201);
});

app.post('/api/v1/billing/stripe-fixture-event', async (context) => {
  requireSameOrigin(context.req.raw);
  if (!canUseDevelopmentFixtures(context.env)) return serviceUnavailable('Stripe fixture events are unavailable outside non-production verification.');
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ id?: string; type?: string; priceId?: string; status?: string; created?: number; metadata?: Record<string, string> }>();
  const fixtureEvent: { id: string; type: string; accountId: string; priceId?: string; status?: string; created?: number; metadata?: Record<string, string> } = { id: body.id ?? `evt_${crypto.randomUUID()}`, type: body.type ?? 'customer.subscription.updated', accountId: auth.accountId };
  if (body.priceId) fixtureEvent.priceId = body.priceId;
  if (body.status) fixtureEvent.status = body.status;
  if (body.created) fixtureEvent.created = body.created;
  if (body.metadata) fixtureEvent.metadata = body.metadata;
  const event = normalizeStripeFixtureEvent(context.env, fixtureEvent);
  return context.json({ projection: await projectSubscriptionEvent(context.env, event) });
});

app.post('/api/v1/threads/:threadId/covenant', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ enabled?: boolean; personId?: string; bibleTranslation?: string; reference?: string; subject?: string }>();
  if (body.enabled && !body.bibleTranslation) return context.json({ error: 'Bible translation is required to enable Covenant.' }, 400);
  if (body.enabled) requireFeature(await getEntitlements(context.env, auth.accountId), 'covenant.lens');
  if (body.enabled && body.personId) await requireConsent(context.env, auth.accountId, body.personId, 'covenant.include');
  const threadId = context.req.param('threadId');
  await ensureThread(context.env, auth.accountId, threadId);
  await setThreadCovenantEnabled(context.env, auth.accountId, threadId, body.enabled === true);
  if (!body.enabled) return context.json({ covenantEnabled: false });
  const passage = retrieveScripture(body.reference ?? 'James 1:5', body.bibleTranslation);
  const lens = applyBiblicalLens(passage, body.subject ?? 'this question');
  assertCovenantSafe(JSON.stringify(lens));
  return context.json({ covenantEnabled: true, scriptureSeparateFromInterpretation: true, certaintyAboutGodsIntent: false, lens });
});

app.get('/api/v1/covenant/scripture/:reference', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  requireFeature(await getEntitlements(context.env, auth.accountId), 'covenant.lens');
  const threadId = context.req.query('threadId');
  if (!threadId) return context.json({ error: 'threadId required' }, 400);
  const thread = await requireOwnedThread(context.env, auth.accountId, threadId);
  if (thread.covenant_enabled !== 1) return context.json({ error: 'Covenant is not enabled for this thread' }, 403);
  return context.json({ passage: retrieveScripture(context.req.param('reference'), context.req.query('translation') ?? 'WEB'), threadId, threadScoped: true });
});

app.get('/api/v1/today', async (context) => {
  const auth = await requireAuth(context.req.raw, context.env);
  const baseline = await compareBaselineToCurrentConditions(context.env, 'self', { cookieHeader: auth.sovvCookieHeader });
  return context.json({ accountId: auth.accountId, today: baseline });
});

app.post('/api/v1/threads/:threadId/corrections', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const threadId = context.req.param('threadId');
  const body = await context.req.json<{ correction?: 'yes' | 'partly' | 'not_today'; note?: string }>();
  if (!body.correction || !['yes', 'partly', 'not_today'].includes(body.correction)) return context.json({ error: 'Valid correction required' }, 400);
  await ensureThread(context.env, auth.accountId, threadId);
  await recordCorrection(context.env, auth.accountId, threadId, body.correction, body.note);
  return context.json({ ok: true, savedToThread: true, savedToLibrary: false });
});

app.post('/api/v1/explore', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ topic?: string }>();
  const topic = body.topic?.trim() || 'identity';
  const baseline = await compareBaselineToCurrentConditions(context.env, 'self', { cookieHeader: auth.sovvCookieHeader });
  return context.json({
    accountId: auth.accountId,
    topic,
    plainLanguage: `Explore ${topic} through Baseline tendency, current amplification, observed behavior, and unknown actual state.`,
    frameworkDetailsDefault: 'collapsed',
    context: baseline
  });
});

app.post('/api/v1/threads/:threadId/messages', async (context) => {
  requireSameOrigin(context.req.raw);
  const auth = await requireAuth(context.req.raw, context.env);
  const body = await context.req.json<{ message?: string; context?: { surface?: string } }>();
  const message = body.message?.trim();
  if (!message) return context.json({ error: 'Message required' }, 400);

  const idempotencyKey = context.req.header('x-idempotency-key');
  if (!idempotencyKey) return context.json({ error: 'Idempotency key required' }, 400);

  const entitlements = await getEntitlements(context.env, auth.accountId);
  const threadId = context.req.param('threadId');
  await ensureThread(context.env, auth.accountId, threadId, body.context?.surface?.toLowerCase() ?? 'personal');
  const coordinator = context.env.THREADS.get(context.env.THREADS.idFromName(`${auth.accountId}:${threadId}`));
  const coordination = await coordinator.fetch('https://thread.internal/turn', {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey, accountId: auth.accountId, message })
  });
  if (!coordination.ok) return coordination;
  const turn = await coordination.json<{ sequence: number; userSequence?: number; assistantSequence?: number; duplicate: boolean }>();
  if (turn.duplicate) {
    const existing = await getTurn(context.env, auth.accountId, threadId, idempotencyKey);
    return context.json({ duplicate: true, status: existing.status, sequence: existing.seq }, existing.status === 'completed' ? 200 : 409);
  }
  await startTurn(context.env, auth.accountId, threadId, idempotencyKey, turn.sequence);
  const traceId = crypto.randomUUID();
  const userSequence = turn.userSequence ?? turn.sequence;
  const assistantSequence = turn.assistantSequence ?? userSequence + 1;
  await appendThreadEvent(context.env, threadId, userSequence, 'user_message', { redacted: true, surface: body.context?.surface ?? 'Today' }, traceId);

  if (!isSovereignRuntimeReady(context.env)) {
    if (!canUseDevelopmentFixtures(context.env)) return serviceUnavailable('Sovereign is temporarily unavailable. Cloudflare AI Gateway is not configured, and nothing was guessed or saved as an interpretation.');
    const fallbackText = 'Development fixture only. Baseline tendency: your enduring design needs the verified SOVV adapter before personalization.\n\nCurrent amplification: no live current-condition contract is configured here, so nothing is treated as certainty.\n\nObserved behavior: nothing has been confirmed in this turn.\n\nUnknown actual state: only you can confirm what is true today. Does this match today?';
    assertSovereignOutputSafety(fallbackText);
    await appendThreadEvent(context.env, threadId, assistantSequence, 'assistant_fixture_response', { developmentFixture: true, text: fallbackText }, traceId);
    await updateTurnStatus(context.env, auth.accountId, threadId, idempotencyKey, 'completed');
    return new Response(encodeTextStream(new ReadableStream<string>({
      start(controller) {
        controller.enqueue(fallbackText);
        controller.close();
      }
    })), { status: 202, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-sovereign-plan': entitlements.plan } });
  }

  const stream = await runSovereignStream(message, { env: context.env, accountId: auth.accountId, threadId, traceId, covenantEnabled: false, sovvCookieHeader: auth.sovvCookieHeader });
  await updateTurnStatus(context.env, auth.accountId, threadId, idempotencyKey, 'streaming');
  const persistedStream = persistAssistantStream(stream, async (text) => {
    assertSovereignOutputSafety(text);
    await appendThreadEvent(context.env, threadId, assistantSequence, 'assistant_response', { redacted: true, text }, traceId);
    await updateTurnStatus(context.env, auth.accountId, threadId, idempotencyKey, 'completed');
  }, async () => {
    await updateTurnStatus(context.env, auth.accountId, threadId, idempotencyKey, 'failed', 'stream_failed');
  });
  return new Response(encodeTextStream(persistedStream), { status: turn.duplicate ? 200 : 202, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-sovereign-plan': entitlements.plan } });
});

function encodeTextStream(stream: ReadableStream<string>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return stream.pipeThrough(new TransformStream<string, Uint8Array>({
    transform(chunk, controller) {
      controller.enqueue(encoder.encode(chunk));
    }
  }));
}

function persistAssistantStream(stream: ReadableStream<string>, onComplete: (text: string) => Promise<void>, onFailure: () => Promise<void>): ReadableStream<string> {
  let collected = '';
  return stream.pipeThrough(new TransformStream<string, string>({
    transform(chunk, controller) {
      collected += chunk;
      controller.enqueue(chunk);
    },
    async flush() {
      try {
        await onComplete(collected.slice(0, 8000));
      } catch {
        await onFailure();
      }
    }
  }));
}

app.onError((error, context) => {
  if (error instanceof Response) return error;
  return context.json({ error: 'Internal error' }, 500);
});

app.notFound((context) => context.json({ error: 'Not found' }, 404));

export { ThreadCoordinator };
export default app;
