import { useEffect, useState } from 'react';

type Plan = 'free' | 'sovereign_plus';

export function PlanOnboarding() {
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [currentPlan, setCurrentPlan] = useState<Plan>('free');
  const [state, setState] = useState('Loading your account…');

  useEffect(() => {
    fetch('/api/v1/account/onboarding')
      .then(async (response) => {
        if (response.status === 401) {
          location.assign('/login?returnTo=%2Fonboarding');
          return null;
        }
        if (!response.ok) throw new Error('Plan options are temporarily unavailable.');
        return response.json();
      })
      .then((data) => {
        if (!data) return;
        setCurrentPlan(data.effectivePlan === 'sovereign_plus' ? 'sovereign_plus' : 'free');
        setState('Choose Free or Sovereign+.');
      })
      .catch((error) => setState(error instanceof Error ? error.message : 'Plan options are temporarily unavailable.'));
  }, []);

  async function confirm(plan: Plan) {
    setState(plan === 'free' ? 'Opening your Free workspace…' : 'Opening secure Stripe checkout…');
    const response = await fetch('/api/v1/account/onboarding', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': crypto.randomUUID()
      },
      body: JSON.stringify({ plan })
    });
    if (!response.ok) {
      setState('We could not confirm that plan. Try again.');
      return;
    }
    if (plan === 'free') {
      location.assign('/app');
      return;
    }
    const checkout = await fetch('/api/v1/billing/checkout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': crypto.randomUUID()
      },
      body: JSON.stringify({ interval })
    });
    const data = await checkout.json().catch(() => ({})) as { checkout?: { url?: string }; error?: string };
    if (!checkout.ok || !data.checkout?.url) {
      setState(data.error || 'Secure checkout is temporarily unavailable. You can continue with Free.');
      return;
    }
    location.assign(data.checkout.url);
  }

  return (
    <main className="plan-onboarding">
      <header className="plan-nav">
        <a href="/">SOVEREIGN.OS</a>
        <span>Account created</span>
      </header>
      <div className="plan-layout">
        <section className="plan-choice">
          <ol className="onboarding-progress" aria-label="Account setup progress">
            <li className="complete"><span>1</span>Account</li>
            <li className="active"><span>2</span>Choose a plan</li>
            <li><span>3</span>Open workspace</li>
          </ol>
          <p className="eyebrow">CHOOSE YOUR PLAN</p>
          <h1>Choose Free or Sovereign+.</h1>
          <p className="plan-intro">Free covers personal questions and decisions. Sovereign+ adds permission-based relationships, families, teams, saved insights, and more monthly AI turns. You can change plans later without losing your Baseline or saved information.</p>

          <div className="onboarding-plan-grid">
            <article className={currentPlan === 'free' ? 'current' : ''}>
              <header><span>FREE</span><strong>$0</strong></header>
              <h2>Personal questions and decisions.</h2>
              <p>Build your Baseline and ask about yourself, what may matter more right now, and the choices in front of you.</p>
              <ul>
                <li>Complete private Baseline</li>
                <li>Today and personal exploration</li>
                <li>10 Sovereign AI turns each month</li>
              </ul>
              <button className="primary-button" onClick={() => void confirm('free')}>Continue with Free</button>
            </article>

            <article className="plus-plan">
              <header><span>SOVEREIGN+</span><strong>{interval === 'annual' ? '$99 / year' : '$20 / month'}</strong></header>
              <h2>Relationships, families, and teams.</h2>
              <p>Use permission-based information from other people, understand group roles and responsibility, and save useful insights for later.</p>
              <ul>
                <li>Everything in Free</li>
                <li>People, Systems, Library, and optional Covenant</li>
                <li>300 Sovereign AI turns each month</li>
              </ul>
              <div className="billing-toggle" role="group" aria-label="Billing interval">
                <button className={interval === 'annual' ? 'active' : ''} onClick={() => setInterval('annual')}>Annual · $99</button>
                <button className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>Monthly · $20</button>
              </div>
              <button className="primary-button" onClick={() => void confirm('sovereign_plus')}>Choose Sovereign+</button>
            </article>
          </div>
          <p className="plan-status" role="status" aria-live="polite">{state}</p>
        </section>
        <aside className="plan-visual">
          <div className="onboarding-baseline-preview">
            <span>YOUR BASELINE</span>
            <h2>One private starting point for every personal question.</h2>
            <p>Sovereign uses your Baseline to keep answers consistent across decisions, pressure, relationships, and change.</p>
            <div><strong>Direct answer first</strong><small>Supporting source details stay available underneath</small></div>
          </div>
          <p>You can review, correct, or reject any interpretation.</p>
        </aside>
      </div>
    </main>
  );
}
