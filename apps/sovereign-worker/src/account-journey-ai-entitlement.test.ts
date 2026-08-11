import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const entry = read('./entry.ts');
const sovereign = read('./agent/sovereign.ts');
const modelConfig = read('../../../packages/agent-contracts/src/model-config.ts');
const entitlements = read('./db/entitlements.ts');
const usage = read('./billing/usage.ts');
const capacity = read('./ai/free-tier-capacity.ts');
const d1Session = read('./d1-session.ts');
const product = read('./db/product.ts');
const index = read('./index.ts');
const verifiedPlan = read('../../web/src/VerifiedPlanStatus.tsx');
const publicSupport = read('../../web/src/PublicSupport.test.ts');

describe('account journey AI, Baseline, and Stripe tiering release chain', () => {
  it('uses the one supported Cloudflare Workers AI path and stable answer contract', () => {
    expect(modelConfig).toContain("DEFAULT_AI_PROVIDER = 'cloudflare-gateway'");
    expect(modelConfig).toContain("DEFAULT_AI_MODEL = '@cf/zai-org/glm-4.7-flash'");
    expect(sovereign).toContain("if (aiConfig.provider !== 'cloudflare-gateway')");
    expect(sovereign).toContain("response_contract: 'sovereign-answer.v2'");
    expect(sovereign).toContain('parseSovereignAnswer(raw, basisRegistry)');
    expect(sovereign).toContain('assertAuthorizedAnswerMode(answer, context)');
    expect(sovereign).toContain('assertSovereignOutputSafety');
  });

  it('loads only authorization-checked Baseline, relationship, or system context for the model', () => {
    expect(sovereign).toContain('getModelSafeBaselineContext(context.env, context.accountId)');
    expect(sovereign).toContain('buildPairComparison(context.env, context.accountId, context.personId)');
    expect(sovereign).toContain('buildSystemAnalysis(context.env, context.accountId, context.systemId)');
    expect(sovereign).toContain('projectModelSafeConversationContext');
    expect(sovereign).toContain('stripped of raw birth inputs, exact private location, secrets, source paths, and private identifiers');
    expect(sovereign).not.toContain('birthDate: context');
    expect(sovereign).not.toContain('latitude: context');
  });

  it('checks entitlements and consent before AI generation, then refunds failed turns', () => {
    const entitlementCheck = entry.lastIndexOf('const entitlements = await getEntitlements(env, auth.accountId)');
    const authorization = entry.indexOf('const authorizedContext = await authorizeConversationContext', entitlementCheck);
    const monthlyReservation = entry.indexOf('const usage = await reserveAiTurn(env, auth.accountId, entitlements.plan)', authorization);
    const modelRun = entry.indexOf('const result = await runSovereignResult(message', monthlyReservation);
    const refund = entry.indexOf('releaseAiTurn(env, auth.accountId, usage.periodKey)', modelRun);
    expect(entitlementCheck).toBeGreaterThan(-1);
    expect(authorization).toBeGreaterThan(entitlementCheck);
    expect(monthlyReservation).toBeGreaterThan(authorization);
    expect(modelRun).toBeGreaterThan(monthlyReservation);
    expect(refund).toBeGreaterThan(modelRun);
    expect(entry).toContain("'x-sovereign-plan': entitlements.plan");
    expect(entry).toContain("'x-sovereign-ai-remaining': String(usage.remaining)");
  });

  it('enforces permanent Free and paid Sovereign+ monthly allowances atomically in D1', () => {
    expect(usage).toContain('free: 10');
    expect(usage).toContain('sovereign_plus: 300');
    expect(usage).toContain('ON CONFLICT(account_id, period_key) DO UPDATE SET');
    expect(usage).toContain('WHERE ai_usage_windows.turns_used + excluded.turns_used <= ?');
    expect(usage).toContain("error: 'monthly_allowance_reached'");
    expect(entitlements).toContain("if (!row) return { plan: 'free', features: ['baseline.today', 'baseline.explore']");
  });

  it('keeps paid capabilities behind deterministic server feature gates', () => {
    expect(product).toContain("requireFeature(await getEntitlements(env, accountId), 'library.continuity')");
    expect(product).toContain('requireSystemAccess');
    expect(index).toContain("requireFeature(await getEntitlements(context.env, auth.accountId), 'covenant.lens')");
    expect(entry).toContain('authorizeConversationContext(env, auth.accountId, selection, entitlements)');
    expect(entry).toContain('buildInterfaceActions(message, selection, entitlements)');
  });

  it('reserves shared Workers AI capacity and disables personalized caching and prompt logging', () => {
    expect(capacity).toContain('FREE_DAILY_NEURON_BUDGET = 7_500');
    expect(capacity).toContain('workers_ai_daily_capacity');
    expect(d1Session).toContain('reserveWorkersAiCapacity(session, model, normalizedInput)');
    expect(d1Session).toContain('releaseWorkersAiCapacity(session, reservation)');
    expect(d1Session).toContain('skipCache: true');
    expect(d1Session).toContain('collectLog: false');
  });

  it('shows the same authoritative plan and monthly usage in the authenticated product', () => {
    expect(verifiedPlan).toContain("fetch('/api/v1/billing/entitlements'");
    expect(verifiedPlan).toContain('body.aiUsage');
    expect(verifiedPlan).toContain('Sovereign turns remaining this UTC month');
    expect(verifiedPlan).toContain('Server verified');
    expect(verifiedPlan).toContain('Paid capabilities remain locked until the authoritative entitlement can be read.');
  });

  it('keeps support contributions entirely outside subscription entitlement projection', () => {
    expect(publicSupport).toContain('Support payments must never enter the Sovereign+ entitlement projection path.');
    expect(publicSupport).toContain('entitlement-neutral');
    expect(index).not.toContain('donate.stripe.com');
    expect(entry).not.toContain('donate.stripe.com');
  });
});
