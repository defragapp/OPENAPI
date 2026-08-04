import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../env';
import { createCheckoutSession } from './stripe';

function checkoutEnv(linkedCustomer = false): Env {
  return {
    APP_ENV: 'test',
    STRIPE_SECRET_KEY: 'sk_fixture',
    STRIPE_SUCCESS_URL: 'https://app.test/onboarding?billing=success',
    STRIPE_CANCEL_URL: 'https://app.test/onboarding?billing=cancelled',
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: 'price_monthly',
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: 'price_annual',
    DB: {
      prepare(sql: string) {
        return {
          bind() {
            return {
              async first() {
                if (sql.includes('FROM stripe_customers') && linkedCustomer) {
                  return { stripe_customer_id: 'cus_existing' };
                }
                return null;
              }
            };
          }
        };
      }
    } as unknown as D1Database
  } as Env;
}

function captureStripeRequest() {
  const requests: Array<{ url: string; body: URLSearchParams }> = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
    requests.push({ url, body: new URLSearchParams(String(init?.body ?? '')) });
    return Response.json({ id: 'cs_checkout', url: 'https://checkout.stripe.test/session' });
  }));
  return requests;
}

afterEach(() => vi.restoreAllMocks());

describe('Stripe Checkout production readiness', () => {
  it.each([
    ['monthly', 'price_monthly'],
    ['annual', 'price_annual']
  ] as const)('requires legal consent and automatic tax for %s subscriptions', async (interval, price) => {
    const requests = captureStripeRequest();

    await createCheckoutSession(checkoutEnv(), 'acct_checkout', interval, `checkout-${interval}-ready`);

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe('https://api.stripe.com/v1/checkout/sessions');
    expect(requests[0]?.body.get('mode')).toBe('subscription');
    expect(requests[0]?.body.get('consent_collection[terms_of_service]')).toBe('required');
    expect(requests[0]?.body.get('automatic_tax[enabled]')).toBe('true');
    expect(requests[0]?.body.get('line_items[0][price]')).toBe(price);
    expect(requests[0]?.body.get('metadata[interval]')).toBe(interval);
    expect(requests[0]?.body.get('subscription_data[metadata][plan]')).toBe('sovereign_plus');
  });

  it('updates the address used for tax when an existing Stripe customer checks out', async () => {
    const requests = captureStripeRequest();

    await createCheckoutSession(checkoutEnv(true), 'acct_existing', 'monthly', 'checkout-existing-ready');

    expect(requests[0]?.body.get('customer')).toBe('cus_existing');
    expect(requests[0]?.body.get('customer_update[address]')).toBe('auto');
  });
});
