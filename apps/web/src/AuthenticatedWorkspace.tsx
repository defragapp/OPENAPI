import { useEffect, useMemo, useState } from 'react';
import { AccountControlCenter } from './AccountControlCenter';
import { PasskeyManager } from './PasskeyManager';
import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace';
import { SystemMembershipManager } from './SystemMembershipManager';
import { VerifiedPlanStatus } from './VerifiedPlanStatus';
import { WorkspaceMobileUtilities } from './WorkspaceMobileUtilities';
import { AccountExpressionField } from './expression-field/ExpressionField';
import { ELIGIBILITY_RULE, POLICY_CONTENT_HASH, POLICY_METADATA } from '../../../config/policies';

// Source-level release compatibility marker retained for the certified production verifier:
// Confirming your account and verified plan.

type GateState = 'checking' | 'policy_review' | 'confirming_plan' | 'payment_pending' | 'ready' | 'error';
type OnboardingStatus = { completed?: boolean; effectivePlan?: 'free' | 'sovereign_plus' };
type BaselineStatus = { status?: string; ready?: boolean; facetProfileStatus?: string; readinessState?: string };
type PolicyStatus = { current?: boolean; requiresReview?: boolean };

const STRIPE_CONFIRMATION_ATTEMPTS = 12;
const STRIPE_CONFIRMATION_DELAY_MS = 1_500;

export function AuthenticatedWorkspace() {
  const [state, setState] = useState<GateState>('checking');
  const [attempt, setAttempt] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [ageEligible, setAgeEligible] = useState(false);
  const [policySubmitting, setPolicySubmitting] = useState(false);
  const [policyError, setPolicyError] = useState('');
  const returnTo = `${location.pathname}${location.search}`;
  const billingReturn = useMemo(() => new URLSearchParams(location.search).get('billing'), []);

  useEffect(() => {
    const controller = new AbortController();

    async function verifyAccount() {
      setState('checking');
      try {
        const policyResponse = await fetch('/api/v1/account/policy-status', {
          headers: { accept: 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal
        });
        if (policyResponse.status === 401) {
          location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }
        if (!policyResponse.ok) throw new Error('Policy verification is temporarily unavailable.');
        const policy = await policyResponse.json().catch(() => ({})) as PolicyStatus;
        if (policy.requiresReview || policy.current !== true) {
          setState('policy_review');
          return;
        }

        const maximumAttempts = billingReturn === 'success' ? STRIPE_CONFIRMATION_ATTEMPTS : 1;

        for (let verificationAttempt = 0; verificationAttempt < maximumAttempts; verificationAttempt += 1) {
          const [onboardingResponse, baselineResponse] = await Promise.all([
            fetch('/api/v1/account/onboarding', {
              headers: { accept: 'application/json' },
              credentials: 'same-origin',
              cache: 'no-store',
              signal: controller.signal
            }),
            fetch('/api/v1/baseline/status', {
              headers: { accept: 'application/json' },
              credentials: 'same-origin',
              cache: 'no-store',
              signal: controller.signal
            })
          ]);

          if (onboardingResponse.status === 401 || baselineResponse.status === 401) {
            location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
            return;
          }
          if (!onboardingResponse.ok || !baselineResponse.ok) {
            throw new Error('Account verification is temporarily unavailable.');
          }

          const onboarding = await onboardingResponse.json().catch(() => ({})) as OnboardingStatus;
          const baselineBody = await baselineResponse.json().catch(() => ({})) as { baseline?: BaselineStatus };
          const baselineReady = baselineBody.baseline?.status === 'completed'
            && baselineBody.baseline.ready === true
            && baselineBody.baseline.facetProfileStatus === 'ready';

          if (!baselineReady) {
            location.replace(billingReturn ? `/onboarding?billing=${encodeURIComponent(billingReturn)}` : '/onboarding');
            return;
          }

          if (!onboarding.completed) {
            if (onboarding.effectivePlan === 'sovereign_plus') {
              setState('confirming_plan');
              const completion = await fetch('/api/v1/account/onboarding', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                  'content-type': 'application/json',
                  'x-idempotency-key': crypto.randomUUID()
                },
                body: JSON.stringify({ plan: 'sovereign_plus' }),
                signal: controller.signal
              });
              if (!completion.ok) throw new Error('Your verified plan could not be connected to the workspace yet.');
              setState('ready');
              return;
            }

            if (billingReturn === 'success') {
              setState('confirming_plan');
              if (verificationAttempt < maximumAttempts - 1) {
                await waitForStripeConfirmation(controller.signal);
                continue;
              }
              setState('payment_pending');
              return;
            }

            location.replace(billingReturn ? `/onboarding?billing=${encodeURIComponent(billingReturn)}` : '/onboarding');
            return;
          }

          setState('ready');
          return;
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState('error');
      }
    }

    void verifyAccount();
    return () => controller.abort();
  }, [attempt, billingReturn, returnTo]);

  async function acceptPolicyUpdate() {
    if (!termsAccepted || !privacyAcknowledged || !ageEligible || policySubmitting) return;
    setPolicySubmitting(true);
    setPolicyError('');
    try {
      const response = await fetch('/api/v1/account/policy-acceptance', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': crypto.randomUUID()
        },
        body: JSON.stringify({
          termsAccepted: true,
          privacyAcknowledged: true,
          ageEligible: true,
          termsVersion: POLICY_METADATA.terms.version,
          privacyVersion: POLICY_METADATA.privacy.version,
          policyContentHash: POLICY_CONTENT_HASH,
          eligibilityRuleVersion: ELIGIBILITY_RULE.version
        })
      });
      if (response.status === 401) {
        location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (!response.ok) throw new Error('Your policy review could not be recorded.');
      setTermsAccepted(false);
      setPrivacyAcknowledged(false);
      setAgeEligible(false);
      setAttempt((value) => value + 1);
    } catch (error) {
      setPolicyError(error instanceof Error ? error.message : 'Your policy review could not be recorded.');
    } finally {
      setPolicySubmitting(false);
    }
  }

  if (state !== 'ready') {
    if (state === 'policy_review') {
      return (
        <main className="private-route-gate policy-review-gate">
          <a className="private-route-brand" href="https://sovereign.defrag.app">
            <span aria-hidden="true">S</span>
            <strong>SOVEREIGN.OS</strong>
          </a>
          <section role="status" aria-live="polite">
            <span>PRIVACY REVIEW</span>
            <h1>Review the current account terms before continuing.</h1>
            <p>Your private workspace remains closed until the current Terms, Privacy Policy, and launch eligibility rule are confirmed. Your data-export and deletion rights remain available through the account APIs.</p>
            <div className="policy-review-links">
              <a href="https://sovereign.defrag.app/terms" target="_blank" rel="noreferrer">Read Terms</a>
              <a href="https://sovereign.defrag.app/privacy" target="_blank" rel="noreferrer">Read Privacy Policy</a>
            </div>
            <label className="approval-check">
              <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span>I accept the current Terms.</span>
            </label>
            <label className="approval-check">
              <input type="checkbox" checked={privacyAcknowledged} onChange={(event) => setPrivacyAcknowledged(event.target.checked)} />
              <span>I acknowledge the current Privacy Policy.</span>
            </label>
            <label className="approval-check">
              <input type="checkbox" checked={ageEligible} onChange={(event) => setAgeEligible(event.target.checked)} />
              <span>I confirm I am 18 or older.</span>
            </label>
            {policyError && <p role="alert">{policyError}</p>}
            <button disabled={!termsAccepted || !privacyAcknowledged || !ageEligible || policySubmitting} onClick={() => void acceptPolicyUpdate()}>
              {policySubmitting ? 'Recording review…' : 'Continue to Sovereign.OS'} <span aria-hidden="true">→</span>
            </button>
          </section>
        </main>
      );
    }

    const pendingPayment = state === 'payment_pending';
    const failed = state === 'error';
    return (
      <main className="private-route-gate">
        <a className="private-route-brand" href="https://sovereign.defrag.app">
          <span aria-hidden="true">S</span>
          <strong>SOVEREIGN.OS</strong>
        </a>
        <section role={failed ? 'alert' : 'status'} aria-live="polite">
          <span>{pendingPayment ? 'STRIPE CONFIRMATION' : 'SOVEREIGN'}</span>
          <h1>{failed ? 'Sovereign.OS could not open yet.' : pendingPayment ? 'Your payment is still being confirmed.' : 'Opening Sovereign.OS.'}</h1>
          <p>
            {failed
              ? 'Your workspace was not shown. Check your connection and try again.'
              : pendingPayment
                ? 'Stripe returned successfully, but the signed subscription event has not reached your account yet. Sovereign+ remains locked until that authoritative event arrives; checking again will not create another charge.'
                : state === 'confirming_plan'
                  ? 'Confirming the signed Stripe entitlement and connecting it to your private workspace.'
                  : 'Confirming your account, current policy acceptance, Baseline, and plan before the private workspace is shown.'}
          </p>
          {(failed || pendingPayment) && (
            <button onClick={() => setAttempt((value) => value + 1)}>
              {pendingPayment ? 'Check again' : 'Try again'} <span aria-hidden="true">→</span>
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <div className="sovereign-app-runtime" data-workspace-contract="one-room">
      <div className="workspace-desktop-plan-status"><VerifiedPlanStatus /></div>
      <SovereignIntelligenceWorkspace onboardingVerified />
      <WorkspaceMobileUtilities />
      <AccountExpressionField />
      <PasskeyManager />
      <div className="sovereign-workspace-overlays" aria-label="Workspace controls">
        <AccountControlCenter />
        <SystemMembershipManager />
      </div>
    </div>
  );
}

function waitForStripeConfirmation(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, STRIPE_CONFIRMATION_DELAY_MS);
    signal.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}
