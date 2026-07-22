import { describe, expect, it } from 'vitest';
import { createCheckoutSession, createPortalSession, normalizeStripeFixtureEvent, priceToPlan, projectSubscriptionEvent, resolveFeatureSet } from './stripe';
import type { Env } from '../env';

function envWithRecorder() {
  const writes: unknown[][] = [];
  const env = {
    STRIPE_PRICE_STANDARD: 'price_standard_cfg',
    STRIPE_PRICE_PREMIUM: 'price_premium_cfg',
    DB: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              async run() { writes.push([sql, ...args]); return { success: true, meta: { changes: 1 } }; },
              async first() { return null; },
              async all() { return { results: [] }; }
            };
          }
        };
      }
    }
  } as unknown as Env;
  return { env, writes };
}

describe('Stripe test-mode billing adapter', () => {
  it('resolves configured and deterministic test prices to stable plans', () => {
    const { env } = envWithRecorder();
    expect(priceToPlan(env, 'price_standard_cfg')).toBe('standard');
    expect(priceToPlan(env, 'price_test_premium')).toBe('premium');
    expect(() => priceToPlan(env, 'price_live_unknown')).toThrow(Response);
  });

  it('projects plan entitlements without trusting client feature claims', async () => {
    const { env, writes } = envWithRecorder();
    const event = normalizeStripeFixtureEvent(env, { id: 'evt_test_1', type: 'customer.subscription.updated', accountId: 'acct_1', priceId: 'price_test_standard' });
    const projection = await projectSubscriptionEvent(env, event);
    expect(projection.plan).toBe('standard');
    expect(projection.features['people.compare']).toBe(true);
    expect(projection.features['covenant.lens']).toBe(false);
    expect(writes.some((write) => String(write[0]).includes('webhook_events'))).toBe(true);
    expect(writes.some((write) => String(write[0]).includes('entitlement_cache'))).toBe(true);
  });

  it('creates deterministic checkout and portal fixtures without live Stripe credentials', async () => {
    const { env } = envWithRecorder();
    const checkout = await createCheckoutSession(env, 'acct_1', 'premium', 'idem-1');
    const portal = await createPortalSession(env, 'acct_1');
    expect(checkout.url).toContain('https://test-billing.invalid/checkout/');
    expect(checkout.sessionId).toContain('premium');
    expect(portal.url).toContain('https://test-billing.invalid/portal/');
    expect(resolveFeatureSet('free')['baseline.today']).toBe(true);
    expect(resolveFeatureSet('free')['people.compare']).toBe(false);
  });
});
