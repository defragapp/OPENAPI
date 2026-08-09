import type { Env } from '../env';

export interface EntitlementSet {
  plan: string;
  features: string[];
  asOf: string;
}

export async function getEntitlements(env: Env, accountId: string): Promise<EntitlementSet> {
  const row = await env.DB.prepare(
    'SELECT plan, features_json, as_of FROM entitlement_cache WHERE account_id = ?1'
  ).bind(accountId).first<{ plan: string; features_json: string; as_of: string }>();

  if (!row) return { plan: 'free', features: ['baseline.today', 'baseline.explore'], asOf: new Date(0).toISOString() };
  return { plan: row.plan, features: JSON.parse(row.features_json) as string[], asOf: row.as_of };
}

export function requireFeature(entitlements: EntitlementSet, feature: string): void {
  if (!entitlements.features.includes(feature)) {
    throw Response.json({
      type: 'https://sovereign.defrag.app/problems/entitlement-required',
      error: 'entitlement_required',
      feature,
      message: 'This capability is not included in the account’s current server-confirmed plan. Your Baseline, draft, and private data remain unchanged.',
      nextAction: 'review_plan',
      retryable: false
    }, {
      status: 403,
      headers: { 'cache-control': 'private, no-store' }
    });
  }
}
