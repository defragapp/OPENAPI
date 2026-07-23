import type { Env } from '../env';
import { priceToSubscription, projectSubscriptionEvent, type NormalizedStripeEvent } from '../billing/stripe';
import { verifyStripeSignature } from '../security/stripe-signature';

interface StripeEvent {
  id: string;
  type: string;
  created?: number;
  data: { object: Record<string, unknown> };
}

const SUBSCRIPTION_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

function stringValue(value: unknown): string | undefined {
  if (typeof value === 'string' && value) return value;
  if (value && typeof value === 'object' && typeof (value as { id?: unknown }).id === 'string') {
    return (value as { id: string }).id;
  }
  return undefined;
}

function metadataValue(object: Record<string, unknown>, key: string): string | undefined {
  const metadata = object.metadata;
  if (!metadata || typeof metadata !== 'object') return undefined;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' && value ? value : undefined;
}

function firstPriceId(object: Record<string, unknown>): string | undefined {
  const items = object.items;
  if (!items || typeof items !== 'object') return undefined;
  const data = (items as { data?: unknown }).data;
  if (!Array.isArray(data)) return undefined;
  const price = (data[0] as { price?: unknown } | undefined)?.price;
  return stringValue(price);
}

async function accountForSubscription(env: Env, object: Record<string, unknown>, customerId?: string): Promise<string | undefined> {
  const metadataAccount = metadataValue(object, 'account_id');
  if (metadataAccount) return metadataAccount;
  if (!customerId) return undefined;
  const row = await env.DB.prepare('SELECT account_id FROM stripe_customers WHERE stripe_customer_id = ?')
    .bind(customerId)
    .first<{ account_id: string }>();
  return row?.account_id;
}

async function normalizeSubscriptionEvent(env: Env, event: StripeEvent): Promise<NormalizedStripeEvent> {
  const object = event.data.object;
  const subscriptionId = stringValue(object.id);
  const customerId = stringValue(object.customer);
  const accountId = await accountForSubscription(env, object, customerId);
  const price = priceToSubscription(env, firstPriceId(object));
  if (!subscriptionId || !accountId) throw new Error('subscription_identity_unresolved');
  const periodEnd = typeof object.current_period_end === 'number'
    ? new Date(object.current_period_end * 1000).toISOString()
    : undefined;
  return {
    id: event.id,
    type: event.type,
    accountId,
    subscriptionId,
    customerId,
    plan: price.plan,
    interval: price.interval,
    status: typeof object.status === 'string' ? object.status : 'unknown',
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: object.cancel_at_period_end === true,
    created: event.created ?? 0
  };
}

export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';
  const valid = await verifyStripeSignature({ body, header: signature, secret: env.STRIPE_WEBHOOK_SECRET });
  if (!valid) return new Response('Invalid signature', { status: 400 });

  const event = JSON.parse(body) as StripeEvent;
  if (!event.id || !event.type || !event.data?.object) return new Response('Invalid event', { status: 400 });
  const inserted = await env.DB.prepare(
    `INSERT INTO webhook_events(provider, event_id, event_type, received_at)
     VALUES('stripe', ?, ?, datetime('now'))
     ON CONFLICT(provider, event_id) DO NOTHING`
  ).bind(event.id, event.type).run();
  if ((inserted.meta.changes ?? 0) === 0) return Response.json({ received: true, duplicate: true });

  if (!SUBSCRIPTION_EVENTS.has(event.type)) {
    await env.DB.prepare(`UPDATE webhook_events SET processed_at = datetime('now')
      WHERE provider = 'stripe' AND event_id = ?`).bind(event.id).run();
    return Response.json({ received: true, projected: false });
  }

  try {
    const projection = await projectSubscriptionEvent(env, await normalizeSubscriptionEvent(env, event));
    await env.DB.prepare(`UPDATE webhook_events SET processed_at = datetime('now'), error_code = NULL
      WHERE provider = 'stripe' AND event_id = ?`).bind(event.id).run();
    return Response.json({ received: true, projected: projection.applied, stale: projection.stale });
  } catch (error) {
    const code = error instanceof Response
      ? `stripe_projection_http_${error.status}`
      : error instanceof Error
        ? error.message.replace(/[^a-z0-9_-]/gi, '_').slice(0, 80)
        : 'stripe_projection_failed';
    await env.DB.prepare(`UPDATE webhook_events SET error_code = ?
      WHERE provider = 'stripe' AND event_id = ?`).bind(code, event.id).run();
    return Response.json({ received: true, projected: false, retryable: true }, { status: 500 });
  }
}
