import type { Env } from './env';
import { requireAuth } from './security/auth';
import { getEntitlements } from './db/entitlements';
import { getBaselineStatus } from './baseline';
import type { BillingInterval, PlanKey } from './billing/stripe';

interface OnboardingRow {
  selected_plan: PlanKey;
  billing_interval?: BillingInterval | null;
  stage: 'plan' | 'baseline' | 'complete';
  completed_at?: string | null;
}

export async function onboardingStatus(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  const [row, baseline, entitlements] = await Promise.all([
    env.DB.prepare('SELECT selected_plan, billing_interval, stage, completed_at FROM account_onboarding WHERE account_id = ?')
      .bind(auth.accountId)
      .first<OnboardingRow>(),
    getBaselineStatus(env, auth.accountId),
    getEntitlements(env, auth.accountId)
  ]);

  return Response.json({
    onboarding: row
      ? {
        selectedPlan: row.selected_plan,
        billingInterval: row.billing_interval,
        stage: row.stage,
        completedAt: row.completed_at
      }
      : { selectedPlan: null, billingInterval: null, stage: 'plan', completedAt: null },
    baseline,
    effectivePlan: entitlements.plan
  }, { headers: { 'cache-control': 'private, no-store' } });
}

export async function selectOnboardingPlan(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  const body = await request.json().catch(() => ({})) as { plan?: string; interval?: string };
  const plan: PlanKey = body.plan === 'sovereign_plus' ? 'sovereign_plus' : body.plan === 'free' ? 'free' : (() => { throw new Response('Choose Free or Sovereign+.', { status: 400 }); })();
  const interval: BillingInterval | null = plan === 'sovereign_plus'
    ? body.interval === 'annual' ? 'annual' : body.interval === 'monthly' ? 'monthly' : (() => { throw new Response('Choose monthly or annual billing.', { status: 400 }); })()
    : null;

  await env.DB.prepare(`INSERT INTO account_onboarding (account_id, selected_plan, billing_interval, stage, updated_at)
    VALUES (?, ?, ?, 'baseline', datetime('now'))
    ON CONFLICT(account_id) DO UPDATE SET
      selected_plan = excluded.selected_plan,
      billing_interval = excluded.billing_interval,
      stage = 'baseline',
      completed_at = NULL,
      updated_at = datetime('now')`)
    .bind(auth.accountId, plan, interval)
    .run();

  return Response.json({ status: 'success', next: 'baseline', selectedPlan: plan, billingInterval: interval });
}

export async function completeOnboarding(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  const row = await env.DB.prepare('SELECT selected_plan, billing_interval, stage FROM account_onboarding WHERE account_id = ?')
    .bind(auth.accountId)
    .first<OnboardingRow>();
  if (!row) return Response.json({ error: 'Choose a plan before continuing.' }, { status: 409 });

  const baseline = await getBaselineStatus(env, auth.accountId);
  if (!['completed', 'partial'].includes(String(baseline.status))) {
    return Response.json({ error: 'Build your Baseline before finishing setup.' }, { status: 409 });
  }

  await env.DB.prepare("UPDATE account_onboarding SET stage = 'complete', completed_at = datetime('now'), updated_at = datetime('now') WHERE account_id = ?")
    .bind(auth.accountId)
    .run();

  return Response.json({
    status: 'success',
    selectedPlan: row.selected_plan,
    billingInterval: row.billing_interval,
    checkoutRequired: row.selected_plan === 'sovereign_plus',
    next: row.selected_plan === 'sovereign_plus' ? 'checkout' : '/app'
  });
}
