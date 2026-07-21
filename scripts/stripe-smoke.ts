import { createCheckoutSession, createPortalSession, normalizeStripeFixtureEvent, priceToPlan, projectSubscriptionEvent } from '../apps/sovereign-worker/src/billing/stripe';
import type { Env } from '../apps/sovereign-worker/src/env';

function fakeEnv(): Env {
  const writes: unknown[][] = [];
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return { async run() { writes.push([sql, ...args]); return { success: true, meta: { changes: 1 } }; }, async first() { return null; }, async all() { return { results: [] }; } }; } }; } } as unknown as D1Database;
  return { APP_ENV: 'test', APP_VERSION: 'stripe-smoke', AI_PROVIDER: 'fixture', AI_MODEL: 'fixture', AI_GATEWAY_ID: 'sovereign', OPENAI_API_KEY: '', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', STRIPE_PRICE_STANDARD: 'price_test_standard', STRIPE_PRICE_PREMIUM: 'price_test_premium', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', DB: db, THREADS: {} as DurableObjectNamespace } as Env;
}

async function main() {
  const env = fakeEnv();
  const checkout = await createCheckoutSession(env, 'acct_stripe_smoke', 'premium', 'smoke-1');
  const portal = await createPortalSession('acct_stripe_smoke');
  const event = normalizeStripeFixtureEvent(env, { id: 'evt_smoke_1', type: 'customer.subscription.updated', accountId: 'acct_stripe_smoke', priceId: 'price_test_premium', status: 'active' });
  const projection = await projectSubscriptionEvent(env, event);
  if (!checkout.url.startsWith('https://billing.test/checkout/')) throw new Error('checkout fixture URL missing');
  if (!portal.url.startsWith('https://billing.test/portal/')) throw new Error('portal fixture URL missing');
  if (projection.plan !== 'premium' || projection.features['covenant.lens'] !== true) throw new Error('premium entitlement projection failed');
  let unknownRejected = false;
  try { priceToPlan(env, 'price_unknown'); } catch { unknownRejected = true; }
  if (!unknownRejected) throw new Error('unknown price was not rejected');
  console.log(`Stripe smoke passed plan=${projection.plan} checkout_fixture=true portal_fixture=true features=${Object.keys(projection.features).length}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
