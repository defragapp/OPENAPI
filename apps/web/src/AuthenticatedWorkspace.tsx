import { useEffect, useState } from 'react';
import { AccountControlCenter } from './AccountControlCenter';
import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace';
import { SystemMembershipManager } from './SystemMembershipManager';

type GateState = 'checking' | 'ready' | 'error';

export function AuthenticatedWorkspace() {
  const [state, setState] = useState<GateState>('checking');
  const [attempt, setAttempt] = useState(0);
  const returnTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    const controller = new AbortController();

    async function verifyAccount() {
      setState('checking');
      try {
        const response = await fetch('/api/v1/account/onboarding', {
          headers: { accept: 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal
        });

        if (response.status === 401) {
          location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }
        if (!response.ok) throw new Error('Account verification is temporarily unavailable.');

        const onboarding = await response.json().catch(() => ({})) as { completed?: boolean };
        if (!onboarding.completed) {
          location.replace('/onboarding');
          return;
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
              : 'Confirming your account before the private workspace is shown.'}
          </p>
          {state === 'error' && <button onClick={() => setAttempt((value) => value + 1)}>Try again <span aria-hidden="true">→</span></button>}
        </section>
      </main>
    );
  }

  return (
    <div className="sovereign-app-runtime" data-workspace-contract="one-room">
      <SovereignIntelligenceWorkspace onboardingVerified />
      <div className="sovereign-workspace-overlays" aria-label="Workspace controls">
        <AccountControlCenter />
        <SystemMembershipManager />
      </div>
    </div>
  );
}
