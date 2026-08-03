import { useEffect, useState } from 'react';
import { AccountControlCenter } from './AccountControlCenter';
import { PasskeyManager } from './PasskeyManager';
import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace';
import { SystemMembershipManager } from './SystemMembershipManager';
import { VerifiedPlanStatus } from './VerifiedPlanStatus';
import { AccountExpressionField } from './expression-field/ExpressionField';

type GateState = 'checking' | 'confirming_plan' | 'ready' | 'error';
type OnboardingStatus = { completed?: boolean; effectivePlan?: 'free' | 'sovereign_plus' };
type BaselineStatus = { status?: string };

export function AuthenticatedWorkspace() {
  const [state, setState] = useState<GateState>('checking');
  const [attempt, setAttempt] = useState(0);
  const returnTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    const controller = new AbortController();

    async function verifyAccount() {
      setState('checking');
      try {
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
        const baselineReady = baselineBody.baseline?.status === 'completed' || baselineBody.baseline?.status === 'partial';

        if (!baselineReady) {
          location.replace('/onboarding');
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
          } else {
            location.replace('/onboarding');
            return;
          }
        }

        setState('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState('error');
      }
    }

    void verifyAccount();
    return () => controller.abort();
  }, [attempt, returnTo]);

  if (state !== 'ready') {
    return (
      <main className="private-route-gate">
        <a className="private-route-brand" href="https://sovereign.defrag.app">
          <span aria-hidden="true">S</span>
          <strong>SOVEREIGN.OS</strong>
        </a>
        <section role={state === 'error' ? 'alert' : 'status'} aria-live="polite">
          <span>SOVEREIGN</span>
          <h1>{state === 'error' ? 'Sovereign.OS could not open yet.' : 'Opening Sovereign.OS.'}</h1>
          <p>
            {state === 'error'
              ? 'Your workspace was not shown. Check your connection and try again.'
              : state === 'confirming_plan'
                ? 'Connecting your verified Sovereign+ entitlement to the workspace.'
                : 'Confirming your account, Baseline, and plan before the private workspace is shown.'}
          </p>
          {state === 'error' && <button onClick={() => setAttempt((value) => value + 1)}>Try again <span aria-hidden="true">→</span></button>}
        </section>
      </main>
    );
  }

  return (
    <div className="sovereign-app-runtime" data-workspace-contract="one-room">
      <VerifiedPlanStatus />
      <SovereignIntelligenceWorkspace onboardingVerified />
      <AccountExpressionField />
      <PasskeyManager />
      <div className="sovereign-workspace-overlays" aria-label="Workspace controls">
        <AccountControlCenter />
        <SystemMembershipManager />
      </div>
    </div>
  );
}
