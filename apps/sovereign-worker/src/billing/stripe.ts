import type { Env } from '../env';
import { FEATURE_KEYS } from '../db/product';

export type PlanKey = 'free' | 'sovereign_plus';
export interface CheckoutResult { url: string; sessionId: string; plan: PlanKey; publicName: string; }
export interface PortalResult { url: string; sessionId: string; }

const PLAN_FEATURES: Record<PlanKey, string[]> = {
  free: ['baseline.today', 'baseline.explore'],
  sovereign_plus: [...FEATURE_KEYS]
};

export const PLAN_LIMITS = {
  free: { sovereignTurnsPerMonth: 20, libraryItems: 5, exploreTopics: 3 },
  sovereign_plus: { sovereignTurnsPerMonth: 1000, libraryItems: 1000, exploreTopics: 9 }
} as const;

export function publicPlanName(plan: PlanKey): string {
  return plan === 'sovereign_plus' ? 'Sovereign+' : 'Free';
}

export function resolveFeatureSet(plan: PlanKey) {
  const enabled = new Set(PLAN_FEATURES[plan]);
  return Object.fromEntries(FEATURE_KEYS.map((feature) => [feature, enabled.has(feature)]));
}

export function enabledFeatureKeys(plan: PlanKey): string[] {
  return FEATURE_KEYS.filter((feature) => resolveFeatureSet(plan)[feature]);
}

export function priceToPlan(env: Env, priceId?: string): PlanKey {
  if (!priceId) return 'free';
  if (priceId === env.STRIPE_PRICE_SOVEREIGN_PLUS || priceId === 'price_test_sovereign_plus') return 'sovereign_plus';
  throw new Response('Unknown Stripe price', { status: 400 });
}

export async function createCheckoutSession(env: Env, accountId: string, plan: PlanKey, idempotencyKey: string = crypto.randomUUID()): Promise<CheckoutResult> {
  if (plan !== 'sovereign_plus') throw new Response('Checkout requires Sovereign+', { status: 400 });
  const sessionId = `cs_test_${accountId}_${plan}_${idempotencyKey}`.replace(/[^a-zA-Z0-9_]/g, '_');
  return { sessionId, plan, publicName: publicPlanName(plan), url: `https://billing.test/checkout/${sessionId}` };
}

export async function createPortalSession(accountId: string): Promise<PortalResult> {
  const sessionId = `bps_test_${accountId}_${crypto.randomUUID()}`.replace(/[^a-zA-Z0-9_]/g, '_');
  return { sessionId, url: `https://billing.test/portal/${sessionId}` };
}

export interface NormalizedStripeEvent { id: string; type: string; accountId: string; plan: PlanKey; status: string; created: number; }

export function normalizeStripeFixtureEvent(env: Env, event: { id: string; type: string; accountId: string; priceId?: string; status?: string; created?: number }): NormalizedStripeEvent {
  const status = event.status ?? 'active';
  const plan = status === 'canceled' || status === 'incomplete_expired' ? 'free' : priceToPlan(env, event.priceId);
  return { id: event.id, type: event.type, accountId: event.accountId, plan, status, created: event.created ?? Date.now() };
}

export async function projectSubscriptionEvent(env: Env, event: NormalizedStripeEvent) {
  await env.DB.prepare('INSERT OR IGNORE INTO webhook_events (provider, event_id, event_type, received_at, processed_at) VALUES (?, ?, ?, datetime(\'now\'), datetime(\'now\'))')
    .bind('stripe', event.id, event.type).run();
  await env.DB.prepare('INSERT OR REPLACE INTO stripe_subscriptions (id, account_id, plan_key, status, source_event_id) VALUES (?, ?, ?, ?, ?)')
    .bind(`sub_${event.accountId}`, event.accountId, event.plan, event.status, event.id).run();
  await env.DB.prepare('INSERT OR REPLACE INTO entitlement_cache (account_id, plan, features_json, as_of, source_event_id) VALUES (?, ?, ?, datetime(\'now\'), ?)')
    .bind(event.accountId, event.plan, JSON.stringify(enabledFeatureKeys(event.plan)), event.id).run();
  return { plan: event.plan, publicName: publicPlanName(event.plan), limits: PLAN_LIMITS[event.plan], features: resolveFeatureSet(event.plan), enabledFeatureKeys: enabledFeatureKeys(event.plan), status: event.status };
}

export function supportLink(env: Env): { configured: boolean; url?: string; label: string; entitlementEffect: 'none' } {
  const url = env.STRIPE_SUPPORT_URL || env.STRIPE_DONATION_URL;
  return url ? { configured: true, url, label: 'Support the work', entitlementEffect: 'none' } : { configured: false, label: 'Support the work', entitlementEffect: 'none' };
}
