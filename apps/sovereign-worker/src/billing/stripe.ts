import type { Env } from '../env';
import { FEATURE_KEYS } from '../db/product';

export type PlanKey = 'free' | 'standard' | 'premium';
export interface CheckoutResult { url: string; sessionId: string; plan: PlanKey; }
export interface PortalResult { url: string; sessionId: string; }

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
  if (priceId === env.STRIPE_PRICE_STANDARD || priceId === 'price_test_standard') return 'standard';
  if (priceId === env.STRIPE_PRICE_PREMIUM || priceId === 'price_test_premium') return 'premium';
  throw new Response('Unknown Stripe price', { status: 400 });
}

export async function createCheckoutSession(env: Env, accountId: string, plan: PlanKey, idempotencyKey: string = crypto.randomUUID()): Promise<CheckoutResult> {
  if (!['standard', 'premium'].includes(plan)) throw new Response('Checkout requires a paid plan', { status: 400 });
  const sessionId = `cs_test_${accountId}_${plan}_${idempotencyKey}`.replace(/[^a-zA-Z0-9_]/g, '_');
  return { sessionId, plan, url: `https://billing.test/checkout/${sessionId}` };
}

export async function createPortalSession(accountId: string): Promise<PortalResult> {
  const sessionId = `bps_test_${accountId}_${crypto.randomUUID()}`.replace(/[^a-zA-Z0-9_]/g, '_');
  return { sessionId, url: `https://billing.test/portal/${sessionId}` };
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
