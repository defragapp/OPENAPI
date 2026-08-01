import { useEffect, useState } from 'react';

type Entitlement = {
  plan?: string;
  asOf?: string;
  features?: string[];
};

type Props = {
  expanded?: boolean;
};

function planLabel(plan?: string): string {
  return plan === 'sovereign_plus' ? 'Sovereign+' : 'Free';
}

export function VerifiedPlanStatus({ expanded = false }: Props) {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/billing/entitlements', {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { accept: 'application/json' },
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('plan_unavailable');
        return response.json() as Promise<{ effective?: Entitlement }>;
      })
      .then((body) => {
        setEntitlement(body.effective ?? { plan: 'free' });
        setState('ready');
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState('error');
      });
    return () => controller.abort();
  }, []);

  if (expanded) {
    return (
      <section className="account-plan-verification" aria-label="Verified plan">
        <div>
          <small>STRIPE ENTITLEMENT</small>
          <strong>{state === 'loading' ? 'Verifying your plan…' : state === 'error' ? 'Plan verification unavailable' : `${planLabel(entitlement?.plan)} verified`}</strong>
          <small>
            {state === 'ready'
              ? entitlement?.asOf && entitlement.asOf !== new Date(0).toISOString()
                ? `Account access verified from the latest Stripe entitlement projection · ${new Date(entitlement.asOf).toLocaleString()}`
                : 'Free access verified. Upgrade remains available through secure Stripe checkout.'
              : 'Your workspace remains private while account status is checked.'}
          </small>
        </div>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('sovereign:open-account-controls'))}>Billing controls</button>
      </section>
    );
  }

  return (
    <div className="verified-plan-strip" role="status" aria-live="polite" title={entitlement?.asOf ? `Verified ${new Date(entitlement.asOf).toLocaleString()}` : undefined}>
      <i aria-hidden="true" />
      <span>{state === 'loading' ? 'Verifying plan' : state === 'error' ? 'Plan unavailable' : 'Stripe verified'}</span>
      {state === 'ready' && <strong>{planLabel(entitlement?.plan)}</strong>}
    </div>
  );
}
