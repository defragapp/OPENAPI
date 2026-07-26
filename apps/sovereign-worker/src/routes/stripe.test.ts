import { describe, expect, it } from 'vitest';
import type { Env } from '../env';
import { handleStripeWebhook } from './stripe';

async function signature(body: string, secret: string, timestamp: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${body}`));
  const digest = [...new Uint8Array(signed)].map((value) => value.toString(16).padStart(2, '0')).join('');
  return `t=${timestamp},v1=${digest}`;
}

function webhookEnv() {
  let accountAvailable = false;
  const webhook = new Map<string, { processed_at: string | null; error_code: string | null }>();
  const writes: string[] = [];

  const env = {
    APP_ENV: 'production',
    APP_VERSION: 'test',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_retry',
    STRIPE_SECRET_KEY: 'sk_test',
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: 'price_monthly',
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: 'price_annual',
    DB: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              async run() {
                writes.push(sql);
                if (sql.includes('INSERT INTO webhook_events')) {
                  const eventId = String(args[0]);
                  if (webhook.has(eventId)) return { success: true, meta: { changes: 0 } };
                  webhook.set(eventId, { processed_at: null, error_code: null });
                  return { success: true, meta: { changes: 1 } };
                }
                if (sql.includes("UPDATE webhook_events SET processed_at = datetime('now')")) {
                  const eventId = String(args[0]);
                  webhook.set(eventId, { processed_at: new Date().toISOString(), error_code: null });
                }
                if (sql.includes('UPDATE webhook_events SET processed_at = NULL')) {
                  const eventId = String(args[1]);
                  webhook.set(eventId, { processed_at: null, error_code: String(args[0]) });
                }
                return { success: true, meta: { changes: 1 } };
              },
              async first() {
                if (sql.includes('SELECT processed_at, error_code FROM webhook_events')) {
                  return webhook.get(String(args[0])) ?? null;
                }
                if (sql.startsWith('SELECT auth_subject FROM accounts')) {
                  return accountAvailable ? { auth_subject: 'email:user@example.com' } : null;
                }
                if (sql.startsWith('SELECT account_id FROM stripe_customers')) return null;
                return null;
              },
              async all() { return { results: [] }; }
            };
          }
        };
      }
    }
  } as unknown as Env;

  return {
    env,
    writes,
    makeAccountAvailable() { accountAvailable = true; },
    state(eventId: string) { return webhook.get(eventId); }
  };
}

describe('Stripe webhook delivery recovery', () => {
  it('reprocesses a previously failed signed delivery and only deduplicates after success', async () => {
    const fixture = webhookEnv();
    const event = {
      id: 'evt_retry_1',
      type: 'customer.subscription.updated',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'sub_retry_1',
          status: 'active',
          metadata: { account_id: 'acct_retry_1' },
          items: { data: [{ price: { id: 'price_monthly' } }] }
        }
      }
    };
    const body = JSON.stringify(event);
    const timestamp = Math.floor(Date.now() / 1000);
    const stripeSignature = await signature(body, fixture.env.STRIPE_WEBHOOK_SECRET, timestamp);
    const request = () => new Request('https://app.defrag.app/api/v1/stripe/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'stripe-signature': stripeSignature },
      body
    });

    const first = await handleStripeWebhook(request(), fixture.env);
    expect(first.status).toBe(500);
    expect(await first.json()).toMatchObject({ received: true, retryable: true });
    expect(fixture.state(event.id)?.processed_at).toBeNull();

    fixture.makeAccountAvailable();
    const second = await handleStripeWebhook(request(), fixture.env);
    expect(second.status).toBe(200);
    expect(await second.json()).toMatchObject({ received: true, projected: true, retried: true });
    expect(fixture.state(event.id)?.processed_at).toBeTruthy();

    const third = await handleStripeWebhook(request(), fixture.env);
    expect(third.status).toBe(200);
    expect(await third.json()).toMatchObject({ duplicate: true, processed: true });
    expect(fixture.writes.some((sql) => sql.includes('entitlement_cache'))).toBe(true);
  });
});
