import { useEffect, useState } from 'react';

type Entitlement = {
  plan?: string;
  asOf?: string;
  features?: string[];
};

type Props = {
  expanded?: boolean;
};

type VerificationState = 'loading' | 'confirming' | 'ready' | 'error';

function planLabel(plan?: string): string {
  return plan === 'sovereign_plus' ? 'Sovereign+' : 'Free';
}

export function VerifiedPlanStatus({ expanded = false }: Props) {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('Verifying your plan from the authoritative account record.');

  useEffect(() => {
    const controller = new AbortController();
    const billingReturn = new URLSearchParams(location.search).get('billing');
    let retryTimer = 0;
    let attempt = 0;

    async function verifyEntitlement() {
      try {
        const response = await fetch('/api/v1/billing/entitlements', {
          credentials: 'same-origin',
          cache: 'no-store',
          headers: { accept: 'application/json' },
          signal: controller.signal
        });
        if (!response.ok) throw new Error('plan_unavailable');
        const body = await response.json() as { effective?: Entitlement };
        const effective = body.effective ?? { plan: 'free' };
        setEntitlement(effective);

        if (billingReturn === 'success' && effective.plan !== 'sovereign_plus' && attempt < 8) {
          attempt += 1;
          setState('confirming');
          setMessage('Stripe returned successfully. Waiting for the signed webhook to confirm Sovereign+ access.');
          retryTimer = window.setTimeout(() => void verifyEntitlement(), 1_500);
          return;
        }

        if (billingReturn === 'success' && effective.plan !== 'sovereign_plus') {
          setState('confirming');
          setMessage('Payment returned successfully, but Sovereign+ access is still being confirmed. Refresh this page in a moment or continue using Free.');
          return;
        }

        setState('ready');
        setMessage(effective.plan === 'sovereign_plus'
          ? 'Sovereign+ access is verified from the latest signed Stripe event.'
          : billingReturn === 'cancelled'
            ? 'Stripe checkout was cancelled. Your Free access is unchanged.'
            : 'Free access is verified. Upgrade remains available through secure Stripe checkout.');

        if (billingReturn && effective.plan === 'sovereign_plus') {
          const url = new URL(location.href);
          url.searchParams.delete('billing');
          history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState('error');
        setMessage('Plan verification is temporarily unavailable. Paid capabilities remain locked until the authoritative entitlement can be read.');
      }
    }

    void verifyEntitlement();
    return () => {
      controller.abort();
      window.clearTimeout(retryTimer);
    };
  }, []);

  if (expanded) {
    return (
      <section className="account-plan-verification" aria-label="Verified plan">
        <div>
          <small>STRIPE ENTITLEMENT</small>
          <strong>
            {state === 'loading'
              ? 'Verifying your plan…'
              : state === 'confirming'
                ? 'Confirming your plan…'
                : state === 'error'
                  ? 'Plan verification unavailable'
                  : `${planLabel(entitlement?.plan)} verified`}
          </strong>
          <small>{message}</small>
        </div>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('sovereign:open-account-controls'))}>Billing controls</button>
      </section>
    );
  }

  return (
    <div className="verified-plan-strip" role="status" aria-live="polite" title={message}>
      <i aria-hidden="true" />
      <span>
        {state === 'loading'
          ? 'Verifying plan'
          : state === 'confirming'
            ? 'Confirming Stripe'
            : state === 'error'
              ? 'Plan unavailable'
              : 'Stripe verified'}
      </span>
      {(state === 'ready' || state === 'confirming') && <strong>{planLabel(entitlement?.plan)}</strong>}
    </div>
  );
}
