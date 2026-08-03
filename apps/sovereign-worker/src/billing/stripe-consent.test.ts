import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../env';
import { createCheckoutSession } from './stripe';

function checkoutEnv(): Env {
  return {
    APP_ENV: 'test',
    STRIPE_SECRET_KEY: 'sk_fixture',
    STRIPE_SUCCESS_URL: 'https://app.test/onboarding?billing=success',
    STRIPE_CANCEL_URL: 'https://app.test/onboarding?billing=cancelled',
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: 'price_monthly',
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: 'price_annual',
    DB: {
      prepare() {
        return {
          bind() {
            return {
              async first() { return null; }
            };
          }
        };
      }
    } as unknown as D1Database
  } as Env;
}

afterEach(() => vi.restoreAllMocks());

describe('Stripe Checkout legal consent', () => {
  it.each([
    ['monthly', 'price_monthly'],
    ['annual', 'price_annual']
  ] as const)('requires Terms acceptance for %s subscriptions', async (interval, price) => {
    const requests: Array<{ url: string; body: URLSearchParams }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      requests.push({ url, body: new URLSearchParams(String(init?.body ?? '')) });
      return Response.json({ id: `cs_${interval}`, url: `https://checkout.stripe.test/${interval}` });
    }));

    await createCheckoutSession(checkoutEnv(), 'acct_terms', interval, `terms-${interval}-checkout`);

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe('https://api.stripe.com/v1/checkout/sessions');
    expect(requests[0]?.body.get('mode')).toBe('subscription');
    expect(requests[0]?.body.get('consent_collection[terms_of_service]')).toBe('required');
    expect(requests[0]?.body.get('line_items[0][price]')).toBe(price);
    expect(requests[0]?.body.get('metadata[interval]')).toBe(interval);
    expect(requests[0]?.body.get('subscription_data[metadata][plan]')).toBe('sovereign_plus');
  });
});
