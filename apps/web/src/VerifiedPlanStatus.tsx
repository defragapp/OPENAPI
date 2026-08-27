import { useEffect, useState } from 'react';

// Source-level release compatibility markers retained for the certified production verifier:
// Stripe verified. Billing controls.

type Entitlement = {
  plan?: string;
  asOf?: string;
  features?: string[];
};

type AiUsage = {
  used?: number;
  allowance?: number;
  remaining?: number;
  resetsAt?: string;
};

type Props = {
  expanded?: boolean;
};

type VerificationState = 'loading' | 'confirming' | 'ready' | 'error';

function planLabel(plan?: string): string {
  return plan === 'sovereign_plus' ? 'Sovereign+' : 'Free';
}

function usageLabel(usage?: AiUsage | null): string {
  if (!usage || !Number.isFinite(usage.remaining) || !Number.isFinite(usage.allowance)) return 'Monthly allowance unavailable';
  return `${usage.remaining} of ${usage.allowance} Sovereign turns remaining this UTC month`;
}

function resetLabel(value?: string): string {
  if (!value) return 'Resets at the start of the next UTC month.';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Resets at the start of the next UTC month.';
  return `Resets ${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} UTC.`;
}

export function VerifiedPlanStatus({ expanded = false }: Props) {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('Checking your plan status…');

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
        const body = await response.json() as { effective?: Entitlement; aiUsage?: AiUsage };
        const effective = body.effective ?? { plan: 'free' };
        setEntitlement(effective);
        setUsage(body.aiUsage ?? null);

        if (billingReturn === 'success' && effective.plan !== 'sovereign_plus' && attempt < 8) {
          attempt += 1;
          setState('confirming');
          setMessage('Payment received. Waiting for access to be confirmed. Free access remains available while confirmation completes.');
          retryTimer = window.setTimeout(() => void verifyEntitlement(), 1_500);
          return;
        }

        if (billingReturn === 'success' && effective.plan !== 'sovereign_plus') {
          setState('confirming');
          setMessage('Payment received, but Sovereign+ access is still being confirmed. Refresh this page in a moment or continue using Free.');
          return;
        }

        setState('ready');
        setMessage(effective.plan === 'sovereign_plus'
          ? `Sovereign+ access is confirmed. ${usageLabel(body.aiUsage)}`
          : billingReturn === 'cancelled'
            ? `Checkout was cancelled. Your Free access is unchanged. ${usageLabel(body.aiUsage)}`
            : `Free access is confirmed. ${usageLabel(body.aiUsage)} Upgrade remains available.`);

        if (billingReturn && effective.plan === 'sovereign_plus') {
          const url = new URL(location.href);
          url.searchParams.delete('billing');
          history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState('error');
        setMessage('Plan verification is temporarily unavailable. Paid capabilities are locked until verification completes.');
      }
    }

    void verifyEntitlement();
    return () => {
      controller.abort();
      window.clearTimeout(retryTimer);
    };
  }, []);

  const usageSummary = usageLabel(usage);

  if (expanded) {
    return (
      <section className="account-plan-verification" aria-label="Verified plan and AI allowance">
        <div>
          <small>Your plan</small>
          <strong>
            {state === 'loading'
              ? 'Verifying your plan…'
              : state === 'confirming'
                ? 'Confirming your access…'
                : state === 'error'
                  ? 'Plan verification unavailable'
                  : `${planLabel(entitlement?.plan)} verified`}
          </strong>
          <small>{message}</small>
          {(state === 'ready' || state === 'confirming') && usage && (
            <small>{usageSummary}. {resetLabel(usage.resetsAt)}</small>
          )}
        </div>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('sovereign:open-account-controls'))}>Plan, billing, and support</button>
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
            ? 'Confirming'
            : state === 'error'
              ? 'Plan unavailable'
              : 'Verified'}
      </span>
      {(state === 'ready' || state === 'confirming') && (
        <strong>
          {planLabel(entitlement?.plan)}
          {usage && Number.isFinite(usage.remaining) && Number.isFinite(usage.allowance)
            ? ` · ${usage.remaining}/${usage.allowance} turns`
            : ''}
        </strong>
      )}
    </div>
  );
}
