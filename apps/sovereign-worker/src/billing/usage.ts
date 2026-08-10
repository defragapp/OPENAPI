import type { Env } from '../env';

export type UsagePlan = 'free' | 'sovereign_plus';

const DEFAULT_ALLOWANCES: Record<UsagePlan, number> = {
  free: 10,
  sovereign_plus: 300
};

export function monthlyAllowance(env: Env, plan: string): number {
  const key: UsagePlan = plan === 'sovereign_plus' ? 'sovereign_plus' : 'free';
  const configured = key === 'sovereign_plus' ? env.AI_SOVEREIGN_PLUS_MONTHLY_TURNS : env.AI_FREE_MONTHLY_TURNS;
  const parsed = Number(configured);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 100_000 ? parsed : DEFAULT_ALLOWANCES[key];
}

export function currentUsagePeriod(now = new Date()): { periodKey: string; resetsAt: string } {
  const periodKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const resetsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
  return { periodKey, resetsAt };
}

export async function getAiUsage(env: Env, accountId: string, plan: string, now = new Date()) {
  const { periodKey, resetsAt } = currentUsagePeriod(now);
  const allowance = monthlyAllowance(env, plan);
  const row = await env.DB.prepare('SELECT turns_used FROM ai_usage_windows WHERE account_id = ? AND period_key = ?')
    .bind(accountId, periodKey)
    .first<{ turns_used: number }>();
  const used = row?.turns_used ?? 0;
  return { periodKey, used, allowance, remaining: Math.max(allowance - used, 0), resetsAt };
}

export async function reserveAiTurn(env: Env, accountId: string, plan: string, now = new Date()) {
  return reserveAiTurns(env, accountId, plan, 1, now);
}

export async function reserveAiTurns(env: Env, accountId: string, plan: string, count: number, now = new Date()) {
  if (!Number.isInteger(count) || count < 1 || count > 100_000) throw new Error('invalid_ai_turn_reservation');
  const { periodKey, resetsAt } = currentUsagePeriod(now);
  const allowance = monthlyAllowance(env, plan);
  if (count > allowance) throw monthlyAllowanceResponse(allowance, resetsAt, now);
  const row = await env.DB.prepare(`INSERT INTO ai_usage_windows (account_id, period_key, turns_used, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(account_id, period_key) DO UPDATE SET
      turns_used = ai_usage_windows.turns_used + excluded.turns_used,
      updated_at = datetime('now')
    WHERE ai_usage_windows.turns_used + excluded.turns_used <= ?
    RETURNING turns_used`)
    .bind(accountId, periodKey, count, allowance)
    .first<{ turns_used: number }>();
  if (!row) throw monthlyAllowanceResponse(allowance, resetsAt, now);
  return { periodKey, used: row.turns_used, allowance, remaining: Math.max(allowance - row.turns_used, 0), resetsAt, reserved: count };
}

export async function releaseAiTurn(env: Env, accountId: string, periodKey: string): Promise<void> {
  return releaseAiTurns(env, accountId, periodKey, 1);
}

export async function releaseAiTurns(env: Env, accountId: string, periodKey: string, count: number): Promise<void> {
  if (!Number.isInteger(count) || count < 1 || count > 100_000) throw new Error('invalid_ai_turn_release');
  await env.DB.prepare(`UPDATE ai_usage_windows
    SET turns_used = MAX(0, turns_used - ?),
        updated_at = datetime('now')
    WHERE account_id = ? AND period_key = ?`)
    .bind(count, accountId, periodKey)
    .run();
}

function monthlyAllowanceResponse(allowance: number, resetsAt: string, now: Date): Response {
  const retryAfterSeconds = Math.max(1, Math.ceil((Date.parse(resetsAt) - now.getTime()) / 1000));
  return Response.json({
    error: 'monthly_allowance_reached',
    message: 'Your monthly Sovereign AI allowance has been used. Your saved workspace remains available.',
    allowance,
    resetsAt
  }, {
    status: 429,
    headers: {
      'cache-control': 'no-store',
      'retry-after': String(retryAfterSeconds)
    }
  });
}
