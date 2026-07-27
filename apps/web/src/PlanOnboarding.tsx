import { useEffect, useState } from 'react';
import { BaselineOrbit } from './BaselineOrbit';

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
        if (!response.ok) throw new Error('Your plan options are temporarily unavailable.');
        return response.json();
      })
      .then((data) => {
        if (!data) return;
        setCurrentPlan(data.effectivePlan === 'sovereign_plus' ? 'sovereign_plus' : 'free');
        setState('Choose how you want to begin.');
      })
      .catch((error) => setState(error instanceof Error ? error.message : 'Your plan options are temporarily unavailable.'));
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
      setState('That plan could not be confirmed. Please try again.');
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
            <li><span>3</span>Your workspace</li>
          </ol>
          <p className="eyebrow">CHOOSE HOW TO BEGIN</p>
          <h1>Start free—or open the full system.</h1>
          <p className="plan-intro">Your plan is confirmed before the workspace opens. You can change it later without losing your Baseline, conversations, people, systems, or saved understandings.</p>

          <div className="onboarding-plan-grid">
            <article className={currentPlan === 'free' ? 'current' : ''}>
              <header><span>FREE</span><strong>$0</strong></header>
              <h2>Your personal Baseline.</h2>
              <p>Explore yourself, shadow and light, alignment, decisions, behavior, and current emphasis.</p>
              <ul>
                <li>Complete Baseline Design</li>
                <li>Today and Explore</li>
                <li>10 Sovereign responses monthly</li>
              </ul>
              <button className="primary-button" onClick={() => void confirm('free')}>Continue with Free</button>
            </article>

            <article className="plus-plan">
              <header><span>SOVEREIGN+</span><strong>{interval === 'annual' ? '$99 / year' : '$20 / month'}</strong></header>
              <h2>Relationships and systems.</h2>
              <p>Bring permitted Baselines together and keep the wider human system in view.</p>
              <ul>
                <li>Everything in Free</li>
                <li>People, Systems, Library, and Covenant</li>
                <li>300 Sovereign responses monthly</li>
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
          <BaselineOrbit compact />
          <p>One private workspace. Your Baseline stays beneath every conversation.</p>
        </aside>
      </div>
    </main>
  );
}
