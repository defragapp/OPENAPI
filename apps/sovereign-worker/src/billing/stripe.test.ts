import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createCheckoutSession,
  createPortalSession,
  normalizeStripeFixtureEvent,
  priceToPlan,
  projectSubscriptionEvent,
  resolveFeatureSet
} from './stripe';
import type { Env } from '../env';

function envWithRecorder(options: { customerId?: string; lastEventCreated?: number } = {}) {
  const writes: unknown[][] = [];
  let lastEventCreated = options.lastEventCreated ?? -1;
  const env = {
    APP_ENV: 'test',
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: 'price_sovereign_monthly_cfg',
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: 'price_sovereign_annual_cfg',
    DB: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              async run() {
                writes.push([sql, ...args]);
                if (sql.includes('INSERT INTO stripe_subscriptions')) {
                  const created = Number(args[9]);
                  if (created < lastEventCreated) return { success: true, meta: { changes: 0 } };
                  lastEventCreated = created;
                }
                return { success: true, meta: { changes: 1 } };
              },
              async first() {
                if (sql.includes("status IN ('active','trialing')")) return null;
                if (sql.startsWith('SELECT stripe_customer_id')) {
                  return options.customerId ? { stripe_customer_id: options.customerId } : null;
                }
                return null;
              },
              async all() { return { results: [] }; }
            };
          }
        };
      }
    }
  } as unknown as Env;
  return { env, writes };
}

afterEach(() => vi.restoreAllMocks());

describe('Stripe launch billing adapter', () => {
  it('maps only Free and Sovereign+ monthly or annual prices', () => {
    const { env } = envWithRecorder();
    expect(priceToPlan(env, 'price_sovereign_monthly_cfg')).toBe('sovereign_plus');
    expect(priceToPlan(env, 'price_test_sovereign_annual')).toBe('sovereign_plus');
    expect(() => priceToPlan(env, 'price_live_unknown')).toThrow(Response);
  });

  it('projects paid access only after an active subscription event', async () => {
    const { env, writes } = envWithRecorder();
    const event = normalizeStripeFixtureEvent(env, {
      id: 'evt_test_1',
      type: 'customer.subscription.updated',
      accountId: 'acct_1',
      priceId: 'price_test_sovereign_monthly',
      status: 'active',
      created: 100
    });
    const projection = await projectSubscriptionEvent(env, event);
    expect(projection).toMatchObject({ applied: true, plan: 'sovereign_plus' });
    expect(projection.features?.['people.compare']).toBe(true);
    expect(projection.features?.['covenant.lens']).toBe(true);
    expect(writes.some((write) => String(write[0]).includes('entitlement_cache'))).toBe(true);
  });

  it('does not let an older webhook overwrite a newer subscription state', async () => {
    const { env, writes } = envWithRecorder();
    const newer = normalizeStripeFixtureEvent(env, {
      id: 'evt_new',
      type: 'customer.subscription.updated',
      accountId: 'acct_1',
      priceId: 'price_test_sovereign_monthly',
      status: 'active',
      created: 200
    });
    const older = { ...newer, id: 'evt_old', status: 'canceled', created: 100 };
    expect(await projectSubscriptionEvent(env, newer)).toMatchObject({ applied: true });
    expect(await projectSubscriptionEvent(env, older)).toEqual({ applied: false, stale: true });
    const entitlementWrites = writes.filter((write) => String(write[0]).includes('entitlement_cache'));
    expect(entitlementWrites).toHaveLength(1);
  });

  it('creates deterministic local Checkout and Portal handoffs', async () => {
    const { env } = envWithRecorder();
    const checkout = await createCheckoutSession(env, 'acct_1', 'annual', 'idem-annual-1');
    const portal = await createPortalSession(env, 'acct_1', 'idem-portal-1');
    expect(checkout.url).toContain('https://test-billing.invalid/checkout/');
    expect(checkout.sessionId).toContain('annual');
    expect(portal.url).toContain('https://test-billing.invalid/portal/');
    expect(resolveFeatureSet('free')['baseline.today']).toBe(true);
    expect(resolveFeatureSet('free')['people.compare']).toBe(false);
  });

  it('sends byte-identical Stripe requests for the same idempotent Checkout retry', async () => {
    const { env } = envWithRecorder({ customerId: 'cus_existing' });
    Object.assign(env, {
      STRIPE_SECRET_KEY: 'sk_fixture',
      STRIPE_SUCCESS_URL: 'https://app.test/app?billing=success',
      STRIPE_CANCEL_URL: 'https://app.test/app?billing=cancelled'
    });
    const requests: Array<{ body: string; idempotency: string | null }> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      requests.push({
        body: String(init?.body),
        idempotency: new Headers(init?.headers).get('idempotency-key')
      });
      return Response.json({ id: 'cs_same', url: 'https://checkout.stripe.test/same' });
    }));
    await createCheckoutSession(env, 'acct_1', 'monthly', 'idem-retry-1');
    await createCheckoutSession(env, 'acct_1', 'monthly', 'idem-retry-1');
    expect(requests).toHaveLength(2);
    expect(requests[0]).toEqual(requests[1]);
    expect(requests[0]?.body).toContain('customer=cus_existing');
  });
});
