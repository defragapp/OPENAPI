import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const workspaceGate = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./account-journey.css', import.meta.url), 'utf8');
const entry = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const auth = readFileSync(new URL('../../sovereign-worker/src/auth-public.ts', import.meta.url), 'utf8');

describe('Baseline-first account journey release', () => {
  it('builds a Baseline before asking a new user to choose a plan', () => {
    expect(onboarding).toContain("fetch('/api/v1/baseline/status'");
    expect(onboarding).toContain("fetch('/api/v1/baseline/onboarding'");
    expect(onboarding).toContain("setPhase('baseline')");
    expect(onboarding).toContain("setPhase('plan')");
    expect(onboarding.indexOf("setPhase('baseline')")).toBeLessThan(onboarding.lastIndexOf("setPhase('plan')"));
    expect(onboarding).toContain('Create the personal foundation Sovereign uses.');
  });

  it('keeps raw birth data outside the language-model boundary and preserves uncertainty', () => {
    expect(onboarding).toContain('Raw birth details and exact private location are not sent to the language model.');
    expect(onboarding).toContain("birthTimeCertainty: 'unknown'");
    expect(onboarding).toContain("form.birthTimeCertainty === 'unknown'");
    expect(onboarding).toContain('Time-dependent details will remain visibly limited rather than being guessed.');
    expect(onboarding).toContain("baseline.status === 'partial'");
  });

  it('uses real request state rather than timer-driven fake calculation progress', () => {
    expect(onboarding).toContain("setBaselineStage('validating')");
    expect(onboarding).toContain("setBaselineStage('calculating')");
    expect(onboarding).toContain("setBaselineStage('complete')");
    expect(onboarding).not.toContain('setInterval(');
    expect(onboarding).not.toContain('setTimeout(');
  });

  it('keeps Free legitimate and makes paid cadence explicit before Stripe checkout', () => {
    expect(onboarding).toContain("useState<BillingInterval>('monthly')");
    expect(onboarding).toContain('Continue with Free');
    expect(onboarding).toContain('$20 / month');
    expect(onboarding).toContain('$99 / year');
    expect(onboarding).toContain('$8.25/month equivalent · save $141');
    expect(onboarding).toContain('Secure checkout is temporarily unavailable. You can continue with Free and upgrade later.');
    expect(onboarding).toContain("fetch('/api/v1/billing/checkout'");
  });

  it('requires both Baseline and onboarding completion before the private workspace renders', () => {
    expect(workspaceGate).toContain("fetch('/api/v1/account/onboarding'");
    expect(workspaceGate).toContain("fetch('/api/v1/baseline/status'");
    expect(workspaceGate).toContain("baselineBody.baseline?.status === 'completed'");
    expect(workspaceGate).toContain("baselineBody.baseline?.status === 'partial'");
    expect(workspaceGate).toContain("location.replace('/onboarding')");
    expect(workspaceGate).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
  });

  it('preserves secure account routing and avoids account enumeration', () => {
    expect(auth).toContain("if (kind === 'login' && !existing) return Response.json({ status: 'sent'");
    expect(auth).toContain("next: onboarding?.onboarding_completed_at ? safeReturnTo(returnTo) : '/onboarding'");
    expect(auth).toContain("allowed = parsed.pathname === '/app'");
    expect(auth).toContain("parsed.pathname === '/onboarding'");
  });

  it('inherits the frozen landing language on desktop and iOS without loading after passkey authority', () => {
    expect(styles).toContain('letter-spacing: 0.22em');
    expect(styles).toContain('env(safe-area-inset-top)');
    expect(styles).toContain('env(safe-area-inset-bottom)');
    expect(styles).toContain('min-height: 48px');
    expect(styles).toContain('@media (max-width: 700px)');
    expect(entry).toContain("import './account-journey.css';\nimport './passkey-auth.css';");
  });
});
