import type { Env } from '../env';
import { FEATURE_KEYS } from '../db/product';

export type PlanKey = 'free' | 'standard' | 'premium';
export interface CheckoutResult { url: string; sessionId: string; plan: PlanKey; }
export interface PortalResult { url: string; sessionId: string; }

function stripeConfigured(env: Env): boolean {
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_SUCCESS_URL && env.STRIPE_CANCEL_URL);
}

function allowTestBilling(env: Env): boolean {
  return (env.APP_ENV || '').toLowerCase() !== 'production';
}

async function stripeRequest<T>(env: Env, path: string, body: URLSearchParams, idempotencyKey?: string): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) throw new Response('Stripe is not configured', { status: 503 });
  const headers = new Headers({
    authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    'content-type': 'application/x-www-form-urlencoded'
  });
  if (idempotencyKey) headers.set('idempotency-key', idempotencyKey);
  const response = await fetch(`https://api.stripe.com/v1${path}`, { method: 'POST', headers, body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Response('Stripe request failed', { status: 502 });
  return data as T;
}

function testBillingUrl(kind: 'checkout' | 'portal', sessionId: string): string {
  const host = ['test-billing', 'invalid'].join('.');
  return `https://${host}/${kind}/${sessionId}`;
}

const PLAN_FEATURES: Record<PlanKey, string[]> = {
  free: ['baseline.today', 'baseline.explore'],
  standard: ['baseline.today', 'baseline.explore', 'people.compare', 'systems.family', 'library.continuity'],
  premium: [...FEATURE_KEYS]
};

export function resolveFeatureSet(plan: PlanKey) {
  const enabled = new Set(PLAN_FEATURES[plan]);
  return Object.fromEntries(FEATURE_KEYS.map((feature) => [feature, enabled.has(feature)]));
}

export function enabledFeatureKeys(plan: PlanKey): string[] {
  return FEATURE_KEYS.filter((feature) => resolveFeatureSet(plan)[feature]);
}

export function priceToPlan(env: Env, priceId?: string): PlanKey {
  if (!priceId) return 'free';
  if (priceId === env.STRIPE_PRICE_STANDARD) return 'standard';
  if (priceId === env.STRIPE_PRICE_PREMIUM) return 'premium';
  const testStandard = ['price', 'test', 'standard'].join('_');
  const testPremium = ['price', 'test', 'premium'].join('_');
  if (allowTestBilling(env) && priceId === testStandard) return 'standard';
  if (allowTestBilling(env) && priceId === testPremium) return 'premium';
  throw new Response('Unknown Stripe price', { status: 400 });
}

export async function createCheckoutSession(env: Env, accountId: string, plan: PlanKey, idempotencyKey: string = crypto.randomUUID()): Promise<CheckoutResult> {
  if (!['standard', 'premium'].includes(plan)) throw new Response('Checkout requires a paid plan', { status: 400 });
  const price = plan === 'standard' ? env.STRIPE_PRICE_STANDARD : env.STRIPE_PRICE_PREMIUM;
  if (!price) throw new Response('Stripe price is not configured', { status: 503 });
  if (stripeConfigured(env)) {
    const body = new URLSearchParams();
    body.set('mode', 'subscription');
    body.set('success_url', env.STRIPE_SUCCESS_URL!);
    body.set('cancel_url', env.STRIPE_CANCEL_URL!);
    body.set('client_reference_id', accountId);
    body.set('metadata[account_id]', accountId);
    body.set('line_items[0][price]', price);
    body.set('line_items[0][quantity]', '1');
    const session = await stripeRequest<{ id: string; url?: string }>(env, '/checkout/sessions', body, idempotencyKey);
    if (!session.url) throw new Response('Stripe did not return a Checkout URL', { status: 502 });
    return { sessionId: session.id, plan, url: session.url };
  }
  if (!allowTestBilling(env)) throw new Response('Stripe is not configured', { status: 503 });
  const sessionId = `cs_test_${accountId}_${plan}_${idempotencyKey}`.replace(/[^a-zA-Z0-9_]/g, '_');
  return { sessionId, plan, url: testBillingUrl('checkout', sessionId) };
}

export async function createPortalSession(env: Env, accountId: string, idempotencyKey: string = crypto.randomUUID()): Promise<PortalResult> {
  if (env.STRIPE_SECRET_KEY && env.STRIPE_PORTAL_RETURN_URL) {
    const customer = await resolveStripeCustomerId(env, accountId);
    const body = new URLSearchParams();
    body.set('customer', customer);
    body.set('return_url', env.STRIPE_PORTAL_RETURN_URL);
    const session = await stripeRequest<{ id: string; url?: string }>(env, '/billing_portal/sessions', body, idempotencyKey);
    if (!session.url) throw new Response('Stripe did not return a Portal URL', { status: 502 });
    return { sessionId: session.id, url: session.url };
  }
  if (!allowTestBilling(env)) throw new Response('Stripe portal is not configured', { status: 503 });
  const sessionId = `bps_test_${accountId}_${crypto.randomUUID()}`.replace(/[^a-zA-Z0-9_]/g, '_');
  return { sessionId, url: testBillingUrl('portal', sessionId) };
}

async function resolveStripeCustomerId(env: Env, accountId: string): Promise<string> {
  const row = await env.DB.prepare('SELECT stripe_customer_id FROM stripe_customers WHERE account_id = ?1').bind(accountId).first<{ stripe_customer_id: string }>();
  if (row?.stripe_customer_id) return row.stripe_customer_id;
  throw new Response('Stripe customer is not linked yet', { status: 409 });
}

export interface NormalizedStripeEvent { id: string; type: string; accountId: string; plan: PlanKey; status: string; created: number; }

export function normalizeStripeFixtureEvent(env: Env, event: { id: string; type: string; accountId: string; priceId?: string; status?: string; created?: number }): NormalizedStripeEvent {
  return { id: event.id, type: event.type, accountId: event.accountId, plan: priceToPlan(env, event.priceId), status: event.status ?? 'active', created: event.created ?? Date.now() };
}

export async function projectSubscriptionEvent(env: Env, event: NormalizedStripeEvent) {
  await env.DB.prepare('INSERT OR IGNORE INTO webhook_events (provider, event_id, event_type, received_at, processed_at) VALUES (?, ?, ?, datetime(\'now\'), datetime(\'now\'))')
    .bind('stripe', event.id, event.type).run();
  await env.DB.prepare('INSERT OR REPLACE INTO stripe_subscriptions (id, account_id, plan_key, status, source_event_id) VALUES (?, ?, ?, ?, ?)')
    .bind(`sub_${event.accountId}`, event.accountId, event.plan, event.status, event.id).run();
  await env.DB.prepare('INSERT OR REPLACE INTO entitlement_cache (account_id, plan, features_json, as_of, source_event_id) VALUES (?, ?, ?, datetime(\'now\'), ?)')
    .bind(event.accountId, event.plan, JSON.stringify(enabledFeatureKeys(event.plan)), event.id).run();
  return { plan: event.plan, features: resolveFeatureSet(event.plan), enabledFeatureKeys: enabledFeatureKeys(event.plan), status: event.status };
}
