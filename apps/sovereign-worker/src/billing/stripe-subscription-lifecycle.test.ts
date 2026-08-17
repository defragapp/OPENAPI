import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizeStripeFixtureEvent, projectSubscriptionEvent } from './stripe';
import type { Env } from '../env';

const webhookRoute = readFileSync(new URL('../routes/stripe.ts', import.meta.url), 'utf8');

function lifecycleEnv() {
  const entitlementWrites: Array<{ plan: string; source: string }> = [];
  let lastEventCreated = -1;
  const env = {
    APP_ENV: 'test',
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: 'price_sovereign_monthly_cfg',
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: 'price_sovereign_annual_cfg',
    DB: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              async first() {
                if (sql.startsWith('SELECT auth_subject FROM accounts')) return { auth_subject: 'email:user@example.com' };
                return null;
              },
              async run() {
                if (sql.includes('INSERT INTO stripe_subscriptions')) {
                  const created = Number(args[9]);
                  if (created < lastEventCreated) return { meta: { changes: 0 } };
                  lastEventCreated = created;
                }
                if (sql.includes('INSERT INTO entitlement_cache')) {
                  entitlementWrites.push({ plan: String(args[1]), source: String(args[3]) });
                }
                return { meta: { changes: 1 } };
              }
            };
          }
        };
      }
    }
  } as unknown as Env;
  return { env, entitlementWrites };
}

function event(env: Env, status: string, created: number, cancelAtPeriodEnd = false) {
  return normalizeStripeFixtureEvent(env, {
    id: `evt_${status}_${created}`,
    type: status === 'canceled' ? 'customer.subscription.deleted' : 'customer.subscription.updated',
    accountId: 'acct_1',
    subscriptionId: 'sub_1',
    customerId: 'cus_1',
    priceId: 'price_sovereign_monthly_cfg',
    status,
    cancelAtPeriodEnd,
    created
  });
}

describe('Stripe subscription lifecycle is the entitlement source of truth', () => {
  it.each(['active', 'trialing'])('keeps Sovereign+ only for %s', async (status) => {
    const { env } = lifecycleEnv();
    const result = await projectSubscriptionEvent(env, event(env, status, 10));
    expect(result).toMatchObject({ applied: true, plan: 'sovereign_plus', status });
  });

  it.each(['past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'canceled', 'paused'])('falls back to Free for %s', async (status) => {
    const { env, entitlementWrites } = lifecycleEnv();
    const result = await projectSubscriptionEvent(env, event(env, status, 20));
    expect(result).toMatchObject({ applied: true, plan: 'free', status });
    expect(entitlementWrites.at(-1)?.plan).toBe('free');
  });

  it('keeps paid access through cancel-at-period-end while Stripe still reports active', async () => {
    const { env } = lifecycleEnv();
    const scheduled = await projectSubscriptionEvent(env, event(env, 'active', 30, true));
    expect(scheduled).toMatchObject({ applied: true, plan: 'sovereign_plus', status: 'active' });
  });

  it('returns to Free when the later cancellation event arrives', async () => {
    const { env, entitlementWrites } = lifecycleEnv();
    expect(await projectSubscriptionEvent(env, event(env, 'active', 40, true))).toMatchObject({ plan: 'sovereign_plus' });
    expect(await projectSubscriptionEvent(env, event(env, 'canceled', 50, false))).toMatchObject({ plan: 'free' });
    expect(entitlementWrites.map((item) => item.plan)).toEqual(['sovereign_plus', 'free']);
  });

  it('does not allow an older active event to restore paid access after downgrade', async () => {
    const { env, entitlementWrites } = lifecycleEnv();
    expect(await projectSubscriptionEvent(env, event(env, 'unpaid', 70))).toMatchObject({ plan: 'free' });
    expect(await projectSubscriptionEvent(env, event(env, 'active', 60))).toEqual({ applied: false, stale: true });
    expect(entitlementWrites.map((item) => item.plan)).toEqual(['free']);
  });

  it('projects the explicit paused and resumed webhook events instead of ignoring them', () => {
    expect(webhookRoute).toContain("'customer.subscription.paused'");
    expect(webhookRoute).toContain("'customer.subscription.resumed'");
    expect(webhookRoute).toContain("event.status === 'paused'");
    expect(webhookRoute).toContain("event.type === 'customer.subscription.resumed'");
  });
});
