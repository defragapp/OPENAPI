import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cancelAccountSubscriptions,
  createCheckoutSession,
  createPortalSession,
  normalizeStripeFixtureEvent,
  priceToPlan,
  projectSubscriptionEvent,
  resolveFeatureSet
} from './stripe';
import type { Env } from '../env';

function envWithRecorder(options: {
  customerId?: string;
  lastEventCreated?: number;
  authSubject?: string;
  subscriptions?: Array<{ stripe_subscription_id: string; status: string }>;
} = {}) {
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
                if (sql.startsWith('SELECT auth_subject FROM accounts')) {
                  return { auth_subject: options.authSubject ?? 'email:user@example.com' };
                }
                if (sql.includes("status IN ('active','trialing')")) return null;
                if (sql.startsWith('SELECT stripe_customer_id')) {
                  return options.customerId ? { stripe_customer_id: options.customerId } : null;
                }
                return null;
              },
              async all() {
                if (sql.includes('SELECT stripe_subscription_id, status FROM stripe_subscriptions')) {
                  return { results: options.subscriptions ?? [] };
                }
                return { results: [] };
              }
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
    const features = 'features' in projection ? projection.features : undefined;
    expect(features?.['people.compare']).toBe(true);
    expect(features?.['covenant.lens']).toBe(true);
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

  it('never restores entitlements for an account already deleted', async () => {
    const { env, writes } = envWithRecorder({ authSubject: 'deleted:acct_1' });
    const event = normalizeStripeFixtureEvent(env, {
      id: 'evt_delayed',
      type: 'customer.subscription.updated',
      accountId: 'acct_1',
      priceId: 'price_test_sovereign_monthly',
      status: 'active',
      created: 300
    });
    expect(await projectSubscriptionEvent(env, event)).toMatchObject({ applied: false, deletedAccount: true, plan: 'free' });
    expect(writes.some((write) => String(write[0]).includes('entitlement_cache'))).toBe(false);
    expect(writes.some((write) => String(write[0]).includes('retained_billing_record'))).toBe(true);
  });

  it('deduplicates D1 and remote subscriptions before cancellation', async () => {
    const { env, writes } = envWithRecorder({
      subscriptions: [
        { stripe_subscription_id: 'sub_active_1', status: 'active' },
        { stripe_subscription_id: 'sub_done_1', status: 'canceled' }
      ]
    });
    Object.assign(env, { STRIPE_SECRET_KEY: 'sk_fixture' });
    const requests: Array<{ url: string; method: string | undefined; idempotency: string | null }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method;
      requests.push({ url, method, idempotency: new Headers(init?.headers).get('idempotency-key') });
      if (method === 'GET') {
        return Response.json({
          data: [
            { id: 'sub_active_1', status: 'active' },
            { id: 'sub_done_1', status: 'canceled' }
          ],
          has_more: false
        });
      }
      return Response.json({ id: 'sub_active_1', status: 'canceled' });
    }));

    expect(await cancelAccountSubscriptions(env, 'acct_1', 'delete_1')).toEqual({ cancelled: 1 });
    const deletes = requests.filter((request) => request.method === 'DELETE');
    expect(deletes).toHaveLength(1);
    expect(deletes[0]?.url).toContain('/subscriptions/sub_active_1');
    expect(deletes[0]?.idempotency).toContain('delete-delete_1-sub_active_1');
    expect(writes.some((write) => String(write[0]).includes("plan = 'free'"))).toBe(true);
  });

  it('cancels a remote subscription even when its webhook never reached D1', async () => {
    const { env } = envWithRecorder();
    Object.assign(env, { STRIPE_SECRET_KEY: 'sk_fixture' });
    const requests: Array<{ url: string; method: string | undefined }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      requests.push({ url, method: init?.method });
      if (init?.method === 'GET') {
        return Response.json({ data: [{ id: 'sub_remote_1', status: 'past_due' }], has_more: false });
      }
      return Response.json({ id: 'sub_remote_1', status: 'canceled' });
    }));

    expect(await cancelAccountSubscriptions(env, 'acct_1', 'delete_remote')).toEqual({ cancelled: 1 });
    expect(requests.some((request) => request.url.includes('/subscriptions/search?'))).toBe(true);
    expect(requests.some((request) => request.method === 'DELETE' && request.url.includes('/subscriptions/sub_remote_1'))).toBe(true);
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
    const requests: Array<{ body: string; idempotency: string | null; apiVersion: string | null }> = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => {
      requests.push({
        body: String(init?.body),
        idempotency: new Headers(init?.headers).get('idempotency-key'),
        apiVersion: new Headers(init?.headers).get('stripe-version')
      });
      return Response.json({ id: 'cs_same', url: 'https://checkout.stripe.test/same' });
    }));
    await createCheckoutSession(env, 'acct_1', 'monthly', 'idem-retry-1');
    await createCheckoutSession(env, 'acct_1', 'monthly', 'idem-retry-1');
    expect(requests).toHaveLength(2);
    expect(requests[0]).toEqual(requests[1]);
    expect(requests[0]?.body).toContain('customer=cus_existing');
    expect(requests[0]?.body).toMatch(/integration_identifier=sovereign_checkout_[a-z]{8}/);
    expect(requests[0]?.body).not.toContain('payment_method_types');
    expect(requests[0]?.apiVersion).toBe('2026-06-24.dahlia');
  });
});
