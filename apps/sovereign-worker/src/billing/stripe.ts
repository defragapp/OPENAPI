import type { Env } from '../env';
import { FEATURE_KEYS } from '../db/product';

export type PlanKey = 'free' | 'sovereign_plus';
export type BillingInterval = 'monthly' | 'annual';
export interface CheckoutResult { url: string; sessionId: string; plan: 'sovereign_plus'; interval: BillingInterval; }
export interface PortalResult { url: string; sessionId: string; }

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);
const TERMINAL_SUBSCRIPTION_STATUSES = new Set(['canceled', 'incomplete_expired', 'retained_billing_record']);
const PRODUCTION_HANDOFF_HOSTS = new Set(['checkout.stripe.com', 'billing.stripe.com']);

function stripeConfigured(env: Env): boolean {
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_SUCCESS_URL && env.STRIPE_CANCEL_URL);
}

function allowTestBilling(env: Env): boolean {
  return ['development', 'local', 'test'].includes((env.APP_ENV || '').toLowerCase());
}

function requireIdempotencyKey(value: string): string {
  const key = value.trim();
  if (key.length < 8 || key.length > 255 || /[\x00-\x1f\x7f]/.test(key)) {
    throw new Response('A valid idempotency key is required', { status: 400 });
  }
  return key;
}

function requireAccountSearchKey(accountId: string): string {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(accountId)) throw new Error('invalid_account_search_key');
  return accountId;
}

function requireStripeHandoffUrl(env: Env, value: string | undefined, kind: 'checkout' | 'portal'): string {
  if (!value || value.length > 2048) throw new Response(`Stripe did not return a ${kind} URL`, { status: 502 });
  let url: URL;
  try { url = new URL(value); } catch { throw new Response('Stripe returned an invalid billing URL', { status: 502 }); }
  const testAllowed = allowTestBilling(env) && (url.hostname.endsWith('.stripe.test') || url.hostname === 'test-billing.invalid');
  if (url.protocol !== 'https:' || url.username || url.password || (!PRODUCTION_HANDOFF_HOSTS.has(url.hostname) && !testAllowed)) {
    throw new Response('Stripe returned an untrusted billing URL', { status: 502 });
  }
  return url.toString();
}

async function stripeRequest<T>(env: Env, path: string, body: URLSearchParams, idempotencyKey: string): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) throw new Response('Stripe is not configured', { status: 503 });
  const headers = new Headers({
    authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    'content-type': 'application/x-www-form-urlencoded',
    'idempotency-key': requireIdempotencyKey(idempotencyKey)
  });
  const response = await fetch(`https://api.stripe.com/v1${path}`, { method: 'POST', headers, body, signal: AbortSignal.timeout(10_000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Response('Stripe request failed', { status: 502 });
  return data as T;
}

async function cancelStripeSubscription(env: Env, subscriptionId: string, idempotencyKey: string): Promise<void> {
  if (!env.STRIPE_SECRET_KEY) throw new Error('stripe_secret_missing');
  if (!/^sub_[A-Za-z0-9_]+$/.test(subscriptionId)) throw new Error('invalid_stripe_subscription_id');
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'idempotency-key': requireIdempotencyKey(idempotencyKey)
    },
    signal: AbortSignal.timeout(10_000)
  });
  if (response.ok || response.status === 404) return;
  throw new Error(`stripe_subscription_cancel_${response.status}`);
}

interface StripeSubscriptionSearchRow { id: string; status: string; }
interface StripeSubscriptionSearchResult {
  data?: StripeSubscriptionSearchRow[];
  has_more?: boolean;
  next_page?: string;
}

async function searchStripeSubscriptionsByAccount(env: Env, accountId: string): Promise<StripeSubscriptionSearchRow[]> {
  if (!env.STRIPE_SECRET_KEY) throw new Error('stripe_secret_missing');
  const safeAccountId = requireAccountSearchKey(accountId);
  const found = new Map<string, StripeSubscriptionSearchRow>();
  let page: string | undefined;

  for (let requestNumber = 0; requestNumber < 10; requestNumber += 1) {
    const params = new URLSearchParams({
      query: `metadata["account_id"]:"${safeAccountId}"`,
      limit: '100'
    });
    if (page) params.set('page', page);
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/search?${params.toString()}`, {
      method: 'GET',
      headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
      signal: AbortSignal.timeout(10_000)
    });
    const payload = await response.json().catch(() => ({})) as StripeSubscriptionSearchResult;
    if (!response.ok) throw new Error(`stripe_subscription_search_${response.status}`);
    for (const row of payload.data ?? []) {
      if (/^sub_[A-Za-z0-9_]+$/.test(row.id) && typeof row.status === 'string') found.set(row.id, row);
    }
    if (!payload.has_more) return [...found.values()];
    if (!payload.next_page) throw new Error('stripe_subscription_search_cursor_missing');
    page = payload.next_page;
  }

  throw new Error('stripe_subscription_search_page_limit');
}

function testBillingUrl(kind: 'checkout' | 'portal', sessionId: string): string {
  const host = ['test-billing', 'invalid'].join('.');
  return `https://${host}/${kind}/${sessionId}`;
}

const PLAN_FEATURES: Record<PlanKey, string[]> = {
  free: ['baseline.today', 'baseline.explore'],
  sovereign_plus: [...FEATURE_KEYS]
};

export function resolveFeatureSet(plan: PlanKey) {
  const enabled = new Set(PLAN_FEATURES[plan]);
  return Object.fromEntries(FEATURE_KEYS.map((feature) => [feature, enabled.has(feature)]));
}

export function enabledFeatureKeys(plan: PlanKey): string[] {
  return FEATURE_KEYS.filter((feature) => resolveFeatureSet(plan)[feature]);
}

export function priceToSubscription(env: Env, priceId?: string): { plan: PlanKey; interval?: BillingInterval } {
  if (!priceId) return { plan: 'free' };
  if (priceId === env.STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY) return { plan: 'sovereign_plus', interval: 'monthly' };
  if (priceId === env.STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL) return { plan: 'sovereign_plus', interval: 'annual' };
  const testMonthly = ['price', 'test', 'sovereign', 'monthly'].join('_');
  const testAnnual = ['price', 'test', 'sovereign', 'annual'].join('_');
  if (allowTestBilling(env) && priceId === testMonthly) return { plan: 'sovereign_plus', interval: 'monthly' };
  if (allowTestBilling(env) && priceId === testAnnual) return { plan: 'sovereign_plus', interval: 'annual' };
  throw new Response('Unknown Stripe price', { status: 400 });
}

export function priceToPlan(env: Env, priceId?: string): PlanKey {
  return priceToSubscription(env, priceId).plan;
}

function configuredPrice(env: Env, interval: BillingInterval): string | undefined {
  return interval === 'monthly' ? env.STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY : env.STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL;
}

async function activeSubscription(env: Env, accountId: string) {
  return env.DB.prepare(`SELECT id, status FROM stripe_subscriptions
    WHERE account_id = ? AND plan_key = 'sovereign_plus' AND status IN ('active','trialing')
    ORDER BY updated_at DESC LIMIT 1`)
    .bind(accountId)
    .first<{ id: string; status: string }>();
}

async function linkedStripeCustomerId(env: Env, accountId: string): Promise<string | undefined> {
  const row = await env.DB.prepare('SELECT stripe_customer_id FROM stripe_customers WHERE account_id = ?')
    .bind(accountId)
    .first<{ stripe_customer_id: string }>();
  return row?.stripe_customer_id;
}

export async function createCheckoutSession(env: Env, accountId: string, interval: BillingInterval, idempotencyKey: string): Promise<CheckoutResult> {
  const stableKey = requireIdempotencyKey(idempotencyKey);
  if (!['monthly', 'annual'].includes(interval)) throw new Response('Billing interval must be monthly or annual', { status: 400 });
  if (await activeSubscription(env, accountId)) throw new Response('A Sovereign+ subscription is already active', { status: 409 });
  const price = configuredPrice(env, interval);
  if (!price) throw new Response('Stripe price is not configured', { status: 503 });

  if (stripeConfigured(env)) {
    const body = new URLSearchParams();
    body.set('mode', 'subscription');
    body.set('success_url', env.STRIPE_SUCCESS_URL!);
    body.set('cancel_url', env.STRIPE_CANCEL_URL!);
    body.set('client_reference_id', accountId);
    body.set('metadata[account_id]', accountId);
    body.set('metadata[plan]', 'sovereign_plus');
    body.set('metadata[interval]', interval);
    body.set('subscription_data[metadata][account_id]', accountId);
    body.set('subscription_data[metadata][plan]', 'sovereign_plus');
    body.set('line_items[0][price]', price);
    body.set('line_items[0][quantity]', '1');
    body.set('allow_promotion_codes', 'true');
    const customer = await linkedStripeCustomerId(env, accountId);
    if (customer) body.set('customer', customer);
    const session = await stripeRequest<{ id: string; url?: string }>(env, '/checkout/sessions', body, stableKey);
    return {
      sessionId: session.id,
      plan: 'sovereign_plus',
      interval,
      url: requireStripeHandoffUrl(env, session.url, 'checkout')
    };
  }

  if (!allowTestBilling(env)) throw new Response('Stripe is not configured', { status: 503 });
  const sessionId = `cs_test_${accountId}_${interval}_${stableKey}`.replace(/[^a-zA-Z0-9_]/g, '_');
  return { sessionId, plan: 'sovereign_plus', interval, url: testBillingUrl('checkout', sessionId) };
}

export async function createPortalSession(env: Env, accountId: string, idempotencyKey: string): Promise<PortalResult> {
  const stableKey = requireIdempotencyKey(idempotencyKey);
  const customer = await linkedStripeCustomerId(env, accountId);
  if (env.STRIPE_SECRET_KEY && env.STRIPE_PORTAL_RETURN_URL) {
    if (!customer) throw new Response('Stripe customer is not linked yet', { status: 409 });
    const body = new URLSearchParams();
    body.set('customer', customer);
    body.set('return_url', env.STRIPE_PORTAL_RETURN_URL);
    const session = await stripeRequest<{ id: string; url?: string }>(env, '/billing_portal/sessions', body, stableKey);
    return { sessionId: session.id, url: requireStripeHandoffUrl(env, session.url, 'portal') };
  }
  if (!allowTestBilling(env)) throw new Response('Stripe portal is not configured', { status: 503 });
  const sessionId = `bps_test_${accountId}_${stableKey}`.replace(/[^a-zA-Z0-9_]/g, '_');
  return { sessionId, url: testBillingUrl('portal', sessionId) };
}

export async function cancelAccountSubscriptions(env: Env, accountId: string, deletionJobId: string): Promise<{ cancelled: number }> {
  const local = await env.DB.prepare(`SELECT stripe_subscription_id, status FROM stripe_subscriptions
    WHERE account_id = ? AND stripe_subscription_id IS NOT NULL
    ORDER BY updated_at DESC`)
    .bind(accountId)
    .all<{ stripe_subscription_id: string; status: string }>();

  const candidates = new Map<string, string>();
  for (const row of local.results ?? []) candidates.set(row.stripe_subscription_id, row.status);
  for (const row of await searchStripeSubscriptionsByAccount(env, accountId)) {
    if (!candidates.has(row.id)) candidates.set(row.id, row.status);
  }
  const cancellable = [...candidates.entries()].filter(([, status]) => !TERMINAL_SUBSCRIPTION_STATUSES.has(status));

  for (const [subscriptionId] of cancellable) {
    const key = `delete-${deletionJobId}-${subscriptionId}`.slice(0, 255);
    await cancelStripeSubscription(env, subscriptionId, key);
    await env.DB.prepare(`UPDATE stripe_subscriptions
      SET status = 'canceled', cancel_at_period_end = 0, updated_at = datetime('now')
      WHERE account_id = ? AND stripe_subscription_id = ?`)
      .bind(accountId, subscriptionId)
      .run();
  }

  if (cancellable.length > 0) {
    await env.DB.prepare(`INSERT INTO entitlement_cache (account_id, plan, features_json, as_of, source_event_id, updated_at)
      VALUES (?, 'free', ?, datetime('now'), ?, datetime('now'))
      ON CONFLICT(account_id) DO UPDATE SET
        plan = 'free', features_json = excluded.features_json, as_of = excluded.as_of,
        source_event_id = excluded.source_event_id, updated_at = excluded.updated_at`)
      .bind(accountId, JSON.stringify(enabledFeatureKeys('free')), `deletion:${deletionJobId}`)
      .run();
  }

  return { cancelled: cancellable.length };
}

export interface NormalizedStripeEvent {
  id: string;
  type: string;
  accountId: string;
  subscriptionId: string;
  customerId?: string | undefined;
  plan: PlanKey;
  interval?: BillingInterval | undefined;
  status: string;
  currentPeriodEnd?: string | undefined;
  cancelAtPeriodEnd: boolean;
  created: number;
}

export function normalizeStripeFixtureEvent(env: Env, event: {
  id: string;
  type: string;
  accountId: string;
  subscriptionId?: string;
  customerId?: string;
  priceId?: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  created?: number;
}): NormalizedStripeEvent {
  const subscription = priceToSubscription(env, event.priceId);
  return {
    id: event.id,
    type: event.type,
    accountId: event.accountId,
    subscriptionId: event.subscriptionId ?? `sub_${event.accountId}`,
    customerId: event.customerId,
    plan: subscription.plan,
    interval: subscription.interval,
    status: event.status ?? 'active',
    currentPeriodEnd: event.currentPeriodEnd,
    cancelAtPeriodEnd: event.cancelAtPeriodEnd ?? false,
    created: event.created ?? Math.floor(Date.now() / 1000)
  };
}

export async function projectSubscriptionEvent(env: Env, event: NormalizedStripeEvent) {
  const account = await env.DB.prepare('SELECT auth_subject FROM accounts WHERE id = ?')
    .bind(event.accountId)
    .first<{ auth_subject: string }>();
  if (!account) throw new Error('subscription_account_missing');
  if (account.auth_subject.startsWith('deleted:')) {
    await env.DB.prepare(`UPDATE stripe_subscriptions SET
      status = 'retained_billing_record', source_event_id = ?, last_event_created = ?, last_event_id = ?, updated_at = datetime('now')
      WHERE account_id = ? AND stripe_subscription_id = ?`)
      .bind(event.id, event.created, event.id, event.accountId, event.subscriptionId)
      .run();
    return { applied: false, stale: false, deletedAccount: true, plan: 'free' as const };
  }

  if (event.customerId) {
    await env.DB.prepare(`INSERT INTO stripe_customers (account_id, stripe_customer_id, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(account_id) DO UPDATE SET stripe_customer_id = excluded.stripe_customer_id, updated_at = datetime('now')`)
      .bind(event.accountId, event.customerId)
      .run();
  }

  const result = await env.DB.prepare(`INSERT INTO stripe_subscriptions
    (id, account_id, stripe_subscription_id, stripe_customer_id, plan_key, status, current_period_end, cancel_at_period_end, source_event_id, last_event_created, last_event_id, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      stripe_customer_id = excluded.stripe_customer_id,
      plan_key = excluded.plan_key,
      status = excluded.status,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      source_event_id = excluded.source_event_id,
      last_event_created = excluded.last_event_created,
      last_event_id = excluded.last_event_id,
      updated_at = datetime('now')
    WHERE excluded.last_event_created > stripe_subscriptions.last_event_created
      OR (excluded.last_event_created = stripe_subscriptions.last_event_created
        AND excluded.last_event_id > COALESCE(stripe_subscriptions.last_event_id, ''))`)
    .bind(
      event.subscriptionId,
      event.accountId,
      event.subscriptionId,
      event.customerId ?? null,
      event.plan,
      event.status,
      event.currentPeriodEnd ?? null,
      event.cancelAtPeriodEnd ? 1 : 0,
      event.id,
      event.created,
      event.id
    )
    .run();

  const applied = (result.meta?.changes ?? 0) > 0;
  if (!applied) return { applied: false, stale: true };

  const effectivePlan: PlanKey = event.plan === 'sovereign_plus' && ACTIVE_SUBSCRIPTION_STATUSES.has(event.status)
    ? 'sovereign_plus'
    : 'free';
  await env.DB.prepare(`INSERT INTO entitlement_cache (account_id, plan, features_json, as_of, source_event_id, updated_at)
    VALUES (?, ?, ?, datetime('now'), ?, datetime('now'))
    ON CONFLICT(account_id) DO UPDATE SET
      plan = excluded.plan,
      features_json = excluded.features_json,
      as_of = excluded.as_of,
      source_event_id = excluded.source_event_id,
      updated_at = excluded.updated_at`)
    .bind(event.accountId, effectivePlan, JSON.stringify(enabledFeatureKeys(effectivePlan)), event.id)
    .run();
  return {
    applied: true,
    stale: false,
    plan: effectivePlan,
    features: resolveFeatureSet(effectivePlan),
    enabledFeatureKeys: enabledFeatureKeys(effectivePlan),
    status: event.status
  };
}