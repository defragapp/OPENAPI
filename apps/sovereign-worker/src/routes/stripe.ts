import type { Env } from '../env';
import { verifyStripeSignature } from '../security/stripe-signature';

interface StripeEvent { id: string; type: string; data: { object: Record<string, unknown> } }

export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';
  const valid = await verifyStripeSignature({ body, header: signature, secret: env.STRIPE_WEBHOOK_SECRET });
  if (!valid) return new Response('Invalid signature', { status: 400 });

  const event = JSON.parse(body) as StripeEvent;
  const inserted = await env.DB.prepare(
    `INSERT INTO webhook_events(provider, event_id, event_type, received_at)
     VALUES('stripe', ?1, ?2, datetime('now'))
     ON CONFLICT(provider, event_id) DO NOTHING`
  ).bind(event.id, event.type).run();

  if ((inserted.meta.changes ?? 0) === 0) return Response.json({ received: true, duplicate: true });

  // Entitlement projection is intentionally contract-based. Product/price IDs are never hard-coded here.
  await env.DB.prepare(
    `UPDATE webhook_events SET processed_at = datetime('now') WHERE provider = 'stripe' AND event_id = ?1`
  ).bind(event.id).run();

  return Response.json({ received: true });
}
