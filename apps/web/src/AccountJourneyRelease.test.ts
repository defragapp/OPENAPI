import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const workspaceGate = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./account-journey.css', import.meta.url), 'utf8');
const structuredStyles = readFileSync(new URL('./account-journey-structured.css', import.meta.url), 'utf8');
const cohesionStyles = readFileSync(new URL('./account-journey-release-cohesion.css', import.meta.url), 'utf8');
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

  it('captures structured birthplace context and explicit timezone confirmation', () => {
    expect(onboarding).toContain('birthplaceCity');
    expect(onboarding).toContain('birthplaceRegion');
    expect(onboarding).toContain('birthplaceCountry');
    expect(onboarding).toContain('timezoneConfirmed');
    expect(onboarding).toContain('I confirm this timezone for the birthplace and date.');
    expect(onboarding).toContain("[form.birthplaceCity, form.birthplaceRegion, form.birthplaceCountry]");
    expect(onboarding).toContain("locationPrecision: 'city_or_regional'");
  });

  it('keeps raw birth data outside the language-model boundary and preserves uncertainty', () => {
    expect(onboarding).toContain('Raw birth details and exact private location are not sent to the language model.');
    expect(onboarding).toContain("birthTimeCertainty: 'unknown'");
    expect(onboarding).toContain("form.birthTimeCertainty === 'unknown'");
    expect(onboarding).toContain('Time-dependent details will remain visibly limited rather than being guessed.');
    expect(onboarding).toContain("baseline.status === 'partial'");
  });

  it('uses request state rather than timer-driven fake calculation progress', () => {
    expect(onboarding).toContain("setBaselineStage('validating')");
    expect(onboarding).toContain("setBaselineStage('calculating')");
    expect(onboarding).toContain("setBaselineStage('complete')");
    expect(onboarding).not.toContain('window.setInterval(');
    expect(onboarding).not.toContain('window.setTimeout(');
  });

  it('does not ask an already-onboarded Free user to choose a plan again after Baseline completion', () => {
    expect(onboarding).toContain('accountAlreadyOnboarded');
    expect(onboarding).toContain('setAccountAlreadyOnboarded(completed)');
    expect(onboarding).toContain("if (accountAlreadyOnboarded)");
    expect(onboarding).toContain("location.replace('/app')");
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

  it('does not complete Sovereign+ onboarding until the signed Stripe entitlement is effective', () => {
    const confirmStart = onboarding.indexOf('async function confirm(plan: Plan)');
    const completeStart = onboarding.indexOf('async function completeOnboarding', confirmStart);
    const confirmBody = onboarding.slice(confirmStart, completeStart);
    expect(confirmBody).toContain("fetch('/api/v1/billing/checkout'");
    expect(confirmBody).toContain('location.assign(data.checkout.url)');
    expect(confirmBody).not.toContain("completeOnboarding('sovereign_plus')");
    expect(onboarding).toContain("if (effectivePlan === 'sovereign_plus')");
    expect(onboarding).toContain("await completeOnboarding('sovereign_plus', controller.signal)");
  });

  it('waits through a delayed Stripe webhook without opening paid access or starting checkout again', () => {
    expect(workspaceGate).toContain("billingReturn === 'success'");
    expect(workspaceGate).toContain('STRIPE_CONFIRMATION_ATTEMPTS = 12');
    expect(workspaceGate).toContain('await waitForStripeConfirmation(controller.signal)');
    expect(workspaceGate).toContain("setState('payment_pending')");
    expect(workspaceGate).toContain('the signed subscription event has not reached your account yet');
    expect(workspaceGate).toContain('checking again will not create another charge');
    expect(workspaceGate).not.toContain("fetch('/api/v1/billing/checkout'");
  });

  it('requires both Baseline and onboarding completion before the private workspace renders', () => {
    expect(workspaceGate).toContain("fetch('/api/v1/account/onboarding'");
    expect(workspaceGate).toContain("fetch('/api/v1/baseline/status'");
    expect(workspaceGate).toContain("baselineBody.baseline?.status === 'completed'");
    expect(workspaceGate).toContain("baselineBody.baseline?.status === 'partial'");
    expect(workspaceGate).toContain("location.replace(billingReturn ? `/onboarding?billing=${encodeURIComponent(billingReturn)}` : '/onboarding')");
    expect(workspaceGate).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
  });

  it('preserves secure account routing and avoids account enumeration', () => {
    expect(auth).toContain("if (kind === 'login' && !existing) return Response.json({ status: 'sent'");
    expect(auth).toContain("next: onboarding?.onboarding_completed_at ? safeReturnTo(returnTo) : '/onboarding'");
    expect(auth).toContain("allowed = parsed.pathname === '/app'");
    expect(auth).toContain("parsed.pathname === '/onboarding'");
  });

  it('inherits the frozen landing language across desktop, iOS, account, and workspace surfaces', () => {
    expect(styles).toContain('letter-spacing: 0.22em');
    expect(styles).toContain('env(safe-area-inset-top)');
    expect(styles).toContain('env(safe-area-inset-bottom)');
    expect(styles).toContain('min-height: 48px');
    expect(styles).toContain('@media (max-width: 700px)');
    expect(structuredStyles).toContain('.baseline-timezone-confirmation');
    expect(cohesionStyles).toContain('.verified-plan-strip');
    expect(cohesionStyles).toContain('.sovereign-app-runtime');
    expect(cohesionStyles).toContain('.invitation-shell');
    expect(cohesionStyles).toContain('.private-route-gate');
    expect(cohesionStyles).toContain('env(safe-area-inset-bottom)');
    expect(cohesionStyles).toContain('@supports (-webkit-touch-callout: none)');
  });

  it('loads the final cohesion layer directly before passkey authority and nothing after it', () => {
    const sequence = "import './account-journey.css';\nimport './account-journey-structured.css';\nimport './account-journey-release-cohesion.css';\nimport './passkey-auth.css';";
    expect(entry).toContain(sequence);
    const passkeyImport = entry.indexOf("import './passkey-auth.css';");
    const firstRuntimeCall = entry.indexOf('installV0ReleaseFingerprint();');
    expect(passkeyImport).toBeGreaterThan(-1);
    expect(firstRuntimeCall).toBeGreaterThan(passkeyImport);
    expect(entry.slice(passkeyImport + "import './passkey-auth.css';".length, firstRuntimeCall)).not.toMatch(/import\s+['"].+\.css['"]/);
  });
});
