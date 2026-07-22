import { describe, expect, it } from 'vitest';
import { createCheckoutSession, createPortalSession, normalizeStripeFixtureEvent, priceToPlan, projectSubscriptionEvent, resolveFeatureSet, resolveSovereignPlusPriceId } from './stripe';
import type { Env } from '../env';

function envWithRecorder() {
  const writes: unknown[][] = [];
  const env = {
    STRIPE_PRICE_SOVEREIGN_PLUS: 'price_plus_cfg',
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: 'price_plus_monthly',
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: 'price_plus_annual',
    STRIPE_PRICE_SOVEREIGN_SUPPORT: 'price_support',
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
    expect(priceToPlan(env, 'price_plus_cfg')).toBe('sovereign_plus');
    expect(priceToPlan(env, 'price_plus_monthly')).toBe('sovereign_plus');
    expect(priceToPlan(env, 'price_plus_annual')).toBe('sovereign_plus');
    expect(priceToPlan(env, 'price_test_sovereign_plus')).toBe('sovereign_plus');
    expect(resolveSovereignPlusPriceId(env, 'monthly')).toBe('price_plus_monthly');
    expect(resolveSovereignPlusPriceId(env, 'annual')).toBe('price_plus_annual');
    expect(() => priceToPlan(env, 'price_live_unknown')).toThrow(Response);
  });

  it('projects plan entitlements without trusting client feature claims', async () => {
    const { env, writes } = envWithRecorder();
    const event = normalizeStripeFixtureEvent(env, { id: 'evt_test_1', type: 'customer.subscription.updated', accountId: 'acct_1', priceId: 'price_test_sovereign_plus' });
    const projection = await projectSubscriptionEvent(env, event);
    expect(projection.plan).toBe('sovereign_plus');
    expect(projection.features['people.compare']).toBe(true);
    expect(projection.features['covenant.lens']).toBe(true);
    expect(writes.some((write) => String(write[0]).includes('webhook_events'))).toBe(true);
    expect(writes.some((write) => String(write[0]).includes('entitlement_cache'))).toBe(true);
  });

  it('ignores public support payments for entitlement projection', async () => {
    const { env, writes } = envWithRecorder();
    const event = normalizeStripeFixtureEvent(env, { id: 'evt_support_1', type: 'checkout.session.completed', accountId: 'acct_1', priceId: 'price_support', metadata: { purpose: 'support', entitlement_effect: 'none' } });
    const projection = await projectSubscriptionEvent(env, event);
    expect(projection.entitlementEffect).toBe('none');
    expect(projection.plan).toBe('free');
    expect(writes.some((write) => String(write[0]).includes('stripe_subscriptions'))).toBe(false);
    expect(writes.some((write) => String(write[0]).includes('entitlement_cache'))).toBe(false);
  });

  it('creates deterministic checkout and portal fixtures without live Stripe credentials', async () => {
    const { env } = envWithRecorder();
    const checkout = await createCheckoutSession(env, 'acct_1', 'sovereign_plus', 'idem-1');
    const annual = await createCheckoutSession(env, 'acct_1', 'sovereign_plus', 'idem-2', 'annual');
    const portal = await createPortalSession('acct_1');
    expect(checkout.url).toContain('https://billing.test/checkout/');
    expect(checkout.interval).toBe('monthly');
    expect(annual.interval).toBe('annual');
    expect(annual.priceId).toBe('price_plus_annual');
    expect(checkout.sessionId).toContain('sovereign_plus');
    expect(portal.url).toContain('https://billing.test/portal/');
    expect(resolveFeatureSet('free')['baseline.today']).toBe(true);
    expect(resolveFeatureSet('free')['people.compare']).toBe(false);
  });
});
