import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const authenticatedWorkspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const workerIndex = readFileSync(new URL('../../sovereign-worker/src/index.ts', import.meta.url), 'utf8');
const workerEntry = readFileSync(new URL('../../sovereign-worker/src/entry.ts', import.meta.url), 'utf8');

describe('production onboarding order', () => {
  it('presents Account → Plan → Baseline → Workspace', () => {
    const account = onboarding.indexOf('label="Account"');
    const plan = onboarding.indexOf('label="Plan"');
    const baseline = onboarding.indexOf('label="Baseline"');
    const workspace = onboarding.indexOf('label="Workspace"');
    expect(account).toBeGreaterThan(-1);
    expect(account).toBeLessThan(plan);
    expect(plan).toBeLessThan(baseline);
    expect(baseline).toBeLessThan(workspace);
  });

  it('lets Free be chosen before Baseline without marking onboarding complete early', () => {
    expect(onboarding).toContain("rememberPlanChoice(plan)");
    expect(onboarding).toContain("if (plan === 'free')");
    expect(onboarding).toContain("setPhase('baseline')");
    expect(onboarding).toContain("selectedPlan === 'free'");
    expect(onboarding).toContain("await completeOnboarding('free')");
  });

  it('keeps Baseline as a hard server and workspace gate', () => {
    expect(workerIndex).toContain('await requireCompletedBaseline(context.env, auth.accountId)');
    expect(workerEntry).toContain('await requireCompletedBaseline(env, auth.accountId)');
    expect(authenticatedWorkspace).toContain("baselineBody.baseline?.status === 'completed'");
    expect(authenticatedWorkspace).toContain('baselineBody.baseline.ready === true');
    expect(authenticatedWorkspace).toContain("baselineBody.baseline.facetProfileStatus === 'ready'");
  });

  it('uses the canonical plain-language Baseline explanation', () => {
    expect(onboarding).toContain('Add your birth details to create the personal foundation Sovereign uses across self, decisions, relationships, and systems.');
    expect(onboarding).not.toContain('seeing the capacity beneath patterns');
  });
});
