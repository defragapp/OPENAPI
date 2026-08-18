import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const workspaceGate = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./account-journey.css', import.meta.url), 'utf8');
const structuredStyles = readFileSync(new URL('./account-journey-structured.css', import.meta.url), 'utf8');
const cohesionStyles = readFileSync(new URL('./account-journey-release-cohesion.css', import.meta.url), 'utf8');
const entry = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const auth = readFileSync(new URL('../../sovereign-worker/src/auth-public.ts', import.meta.url), 'utf8');

describe('Baseline-required account journey release', () => {
  it('lets a new user choose a plan before building the required Baseline', () => {
    expect(onboarding).toContain("fetch('/api/v1/baseline/status'");
    expect(onboarding).toContain("fetch('/api/v1/baseline/onboarding'");
    expect(onboarding).toContain("setPhase('plan')");
    expect(onboarding).toContain("setPhase('baseline')");
    expect(onboarding).toContain('label="Plan"');
    expect(onboarding).toContain('label="Baseline"');
    expect(onboarding.indexOf('label="Plan"')).toBeLessThan(onboarding.indexOf('label="Baseline"'));
    expect(onboarding).toContain('Choose a plan first. You’ll build your Baseline before the workspace opens.');
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
    expect(onboarding).toContain("baseline.uncertainty ?? 'stated in context'");
  });

  it('keeps a pending Baseline profile in real preparation until server readiness reports complete', () => {
    expect(onboarding).toContain("if (response.status === 202)");
    expect(onboarding).toContain('await pollBaselineReadiness()');
    expect(onboarding).toContain("fetch('/api/v1/baseline/status'");
    expect(onboarding).toContain("nextBaseline.readinessState === 'facet_profile_preparing'");
    expect(onboarding).toContain("setBaselineStage('preparing')");
    expect(onboarding).toContain('BASELINE_POLL_ATTEMPTS');
  });

  it('uses real request/readiness state instead of timer-driven fake calculation progress', () => {
    expect(onboarding).toContain("setBaselineStage('validating')");
    expect(onboarding).toContain("setBaselineStage('calculating')");
    expect(onboarding).toContain("setBaselineStage('preparing')");
    expect(onboarding).toContain("setBaselineStage('opening')");
    expect(onboarding).toContain("setBaselineStage('complete')");
    expect(onboarding).toContain('baselinePollDelay(BASELINE_POLL_INTERVAL_MS)');
    expect(onboarding).not.toContain('window.setInterval(');
  });

  it('does not ask an already-onboarded Free user to choose a plan again after Baseline completion', () => {
    expect(onboarding).toContain('accountAlreadyOnboarded');
    expect(onboarding).toContain('setAccountAlreadyOnboarded(completed)');
    expect(onboarding).toContain("if (accountAlreadyOnboarded)");
    expect(onboarding).toContain("location.replace('/app')");
  });

  it('keeps Free legitimate and makes paid cadence and the live-price handoff explicit', () => {
    expect(onboarding).toContain("useState<BillingInterval>('monthly')");
    expect(onboarding).toContain('Continue with Free');
    expect(onboarding).toContain('Monthly billing');
    expect(onboarding).toContain('Annual billing');
    expect(onboarding).toContain('Stripe checkout shows the current price before you confirm.');
    expect(onboarding).not.toMatch(/\$99|\$20|\$8\.25|save \$141/);
    expect(onboarding).toContain('Secure checkout is temporarily unavailable. You can continue with Free and build your Baseline now.');
    expect(onboarding).toContain("fetch('/api/v1/billing/checkout'");
  });

  it('does not complete Sovereign+ onboarding until the server-confirmed Stripe entitlement is effective', () => {
    const confirmStart = onboarding.indexOf('async function confirm(plan: Plan)');
    const completeStart = onboarding.indexOf('async function completeOnboarding', confirmStart);
    const confirmBody = onboarding.slice(confirmStart, completeStart);
    expect(confirmBody).toContain("fetch('/api/v1/billing/checkout'");
    expect(confirmBody).toContain('location.assign(data.checkout.url)');
    expect(confirmBody).not.toContain("completeOnboarding('sovereign_plus')");
    expect(onboarding).toContain("if (effectivePlan === 'sovereign_plus')");
    expect(onboarding).toContain("await completeOnboarding('sovereign_plus', controller.signal)");
  });

  it('does not mark Free onboarding complete until the required Baseline is ready', () => {
    const confirmStart = onboarding.indexOf('async function confirm(plan: Plan)');
    const completeStart = onboarding.indexOf('async function completeOnboarding', confirmStart);
    const confirmBody = onboarding.slice(confirmStart, completeStart);
    expect(confirmBody).toContain("if (plan === 'free')");
    expect(confirmBody).toContain("setPhase('baseline')");
    expect(confirmBody).not.toContain("completeOnboarding('free')");
    expect(onboarding).toContain("if (selectedPlan === 'free' || readPlanChoice() === 'free')");
    expect(onboarding).toContain("await completeOnboarding('free')");
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
    expect(workspaceGate).toContain("baselineBody.baseline.ready === true");
    expect(workspaceGate).toContain("baselineBody.baseline.facetProfileStatus === 'ready'");
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

  it('loads account cohesion and route cohesion before the final passkey authority', () => {
    const accountImports = [
      "import './account-journey.css';",
      "import './account-journey-structured.css';",
      "import './account-journey-release-cohesion.css';"
    ];
    const passkeyImportMarker = "import './passkey-auth.css';";
    const routeImport = entry.indexOf("import './deployed-route-cohesion.css';");
    const passkeyImport = entry.indexOf(passkeyImportMarker);
    const firstRuntimeCall = entry.indexOf('installV0ReleaseFingerprint();');
    for (const marker of accountImports) {
      expect(entry.indexOf(marker)).toBeGreaterThan(-1);
      expect(entry.indexOf(marker)).toBeLessThan(routeImport);
    }
    expect(routeImport).toBeGreaterThan(-1);
    expect(passkeyImport).toBeGreaterThan(routeImport);
    expect(firstRuntimeCall).toBeGreaterThan(passkeyImport);
    expect(entry.slice(passkeyImport + passkeyImportMarker.length, firstRuntimeCall)).not.toMatch(/import\s+['"].+\.css['"]/);
  });
});
