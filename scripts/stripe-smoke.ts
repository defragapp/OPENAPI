import { createCheckoutSession, createPortalSession, normalizeStripeFixtureEvent, priceToPlan, projectSubscriptionEvent } from '../apps/sovereign-worker/src/billing/stripe';
import type { Env } from '../apps/sovereign-worker/src/env';

function fakeEnv(): Env {
  const writes: unknown[][] = [];
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return { async run() { writes.push([sql, ...args]); return { success: true, meta: { changes: 1 } }; }, async first() { return null; }, async all() { return { results: [] }; } }; } }; } } as unknown as D1Database;
  return { APP_ENV: 'test', APP_VERSION: 'stripe-smoke', AI_PROVIDER: 'cloudflare-gateway', AI_MODEL: 'openai/gpt-5.5', AI_GATEWAY_ID: 'sovereign', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: 'price_test_sovereign_monthly', STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: 'price_test_sovereign_annual', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', DB: db, THREADS: {} as DurableObjectNamespace } as Env;
}

async function main() {
  const env = fakeEnv();
  const checkout = await createCheckoutSession(env, 'acct_stripe_smoke', 'annual', 'stripe-smoke-1');
  const portal = await createPortalSession(env, 'acct_stripe_smoke', 'stripe-portal-1');
  const event = normalizeStripeFixtureEvent(env, { id: 'evt_smoke_1', type: 'customer.subscription.updated', accountId: 'acct_stripe_smoke', priceId: 'price_test_sovereign_annual', status: 'active' });
  const projection = await projectSubscriptionEvent(env, event);
  if (!checkout.url.startsWith('https://test-billing.invalid/checkout/')) throw new Error('checkout test URL missing');
  if (!portal.url.startsWith('https://test-billing.invalid/portal/')) throw new Error('portal test URL missing');
  if (projection.plan !== 'sovereign_plus' || projection.features?.['covenant.lens'] !== true) throw new Error('Sovereign+ entitlement projection failed');
  let unknownRejected = false;
  try { priceToPlan(env, 'price_unknown'); } catch { unknownRejected = true; }
  if (!unknownRejected) throw new Error('unknown price was not rejected');
  console.log(`Stripe smoke passed plan=${projection.plan} checkout_test=true portal_test=true features=${Object.keys(projection.features ?? {}).length}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
