import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

type AuthMode = 'signup' | 'login' | 'forgot' | 'reset';
type PlanKey = 'free' | 'sovereign_plus';
type BillingInterval = 'monthly' | 'annual';

interface OnboardingStatus {
  onboarding: {
    selectedPlan: PlanKey | null;
    billingInterval: BillingInterval | null;
    stage: 'plan' | 'baseline' | 'complete';
    completedAt: string | null;
  };
  baseline: { status?: string };
  effectivePlan: PlanKey;
}

interface AuthenticationModes {
  apple: boolean;
  google: boolean;
}

export function AccountFlow() {
  const path = location.pathname;
  if (path === '/onboarding') return <OnboardingPage />;
  if (path === '/forgot-password') return <AuthPage mode="forgot" />;
  if (path === '/reset-password') return <AuthPage mode="reset" />;
  if (path === '/signup') return <AuthPage mode="signup" />;
  return <AuthPage mode="login" />;
}

function AuthPage({ mode }: { mode: AuthMode }) {
  const params = useMemo(() => new URLSearchParams(location.search), []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState<AuthenticationModes>({ apple: false, google: false });
  const plan: PlanKey = params.get('plan') === 'sovereign_plus' ? 'sovereign_plus' : 'free';
  const interval: BillingInterval = params.get('interval') === 'annual' ? 'annual' : 'monthly';
  const resetToken = params.get('token') ?? '';
  const error = oauthError(params.get('error'));
  const hasOAuth = providers.apple || providers.google;

  useEffect(() => {
    if (mode !== 'signup' && mode !== 'login') return;
    fetch('/health', { headers: { accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: any) => {
        const modes = payload?.authenticationModes;
        setProviders({
          apple: modes?.apple === 'configured',
          google: modes?.google === 'configured'
        });
      })
      .catch(() => setProviders({ apple: false, google: false }));
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus('');
    try {
      if (mode === 'signup') {
        const data = await postJson('/api/v1/auth/password/signup', {
          name,
          email,
          password,
          termsAccepted: accepted,
          turnstileToken: turnstileToken(),
          plan,
          interval
        });
        location.assign(String(data.next || '/onboarding'));
        return;
      }
      if (mode === 'login') {
        const data = await postJson('/api/v1/auth/password/login', {
          email,
          password,
          turnstileToken: turnstileToken(),
          plan,
          interval
        });
        location.assign(String(data.next || '/app'));
        return;
      }
      if (mode === 'forgot') {
        await postJson('/api/v1/auth/password/forgot', { email, turnstileToken: turnstileToken() });
        setStatus('Check your email for a password reset link.');
        setBusy(false);
        return;
      }
      const data = await postJson('/api/v1/auth/password/reset', { token: resetToken, password });
      location.assign(String(data.next || '/app'));
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'That did not work. Try again.');
      setBusy(false);
    }
  }

  function beginOAuth(provider: 'apple' | 'google') {
    if (mode === 'signup' && !accepted) {
      setStatus('Accept the Terms and Privacy Policy before creating your account.');
      return;
    }
    const query = new URLSearchParams({
      intent: mode === 'signup' ? 'signup' : 'login',
      plan,
      interval
    });
    if (mode === 'signup') query.set('terms', 'accepted');
    location.assign(`/api/v1/auth/oauth/${provider}/start?${query.toString()}`);
  }

  const title = mode === 'signup'
    ? 'Create your Sovereign.OS account.'
    : mode === 'login'
      ? 'Welcome back.'
      : mode === 'forgot'
        ? 'Reset your password.'
        : 'Choose a new password.';
  const intro = mode === 'signup'
    ? 'Create your account first. Then choose Free or Sovereign+ and build your Baseline.'
    : mode === 'login'
      ? 'Open your private workspace securely.'
      : mode === 'forgot'
        ? 'Enter your email. We will send a secure reset link that expires in 30 minutes.'
        : 'Use the link from your email and choose a password of at least 10 characters.';

  return (
    <main className="account-flow-shell">
      <AccountNav />
      <div className="account-flow-layout">
        <section className="account-flow-intro">
          <p className="account-flow-kicker">{mode === 'signup' ? 'START WITH YOUR BASELINE' : 'YOUR PRIVATE WORKSPACE'}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
          {mode === 'signup' && (
            <div className="account-flow-preview">
              <span>WHAT HAPPENS NEXT</span>
              <ol>
                <li><strong>1</strong><div><b>Create your account</b><small>Apple, Google, or email and password</small></div></li>
                <li><strong>2</strong><div><b>Choose your plan</b><small>Free or Sovereign+</small></div></li>
                <li><strong>3</strong><div><b>Build your Baseline</b><small>Birth date, time, place, and timezone</small></div></li>
              </ol>
            </div>
          )}
        </section>

        <section className="account-flow-panel" aria-labelledby="account-flow-title">
          <p className="account-flow-kicker">{mode === 'signup' ? 'CREATE ACCOUNT' : mode === 'login' ? 'SIGN IN' : 'PASSWORD RECOVERY'}</p>
          <h2 id="account-flow-title">{mode === 'signup' ? 'Begin securely.' : mode === 'login' ? 'Open your workspace.' : title}</h2>
          {(error || status) && <div className="account-flow-notice" role="status">{status || error}</div>}

          {(mode === 'signup' || mode === 'login') && hasOAuth && (
            <>
              <div className="oauth-stack">
                {providers.apple && <button type="button" onClick={() => beginOAuth('apple')}><span className="oauth-mark"></span>Continue with Apple</button>}
                {providers.google && <button type="button" onClick={() => beginOAuth('google')}><span className="oauth-mark google-mark">G</span>Continue with Google</button>}
              </div>
              <div className="account-flow-divider"><span>or use email</span></div>
            </>
          )}

          <form className="account-flow-form" onSubmit={submit}>
            {mode === 'signup' && (
              <FlowField label="Your name">
                <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={120} />
              </FlowField>
            )}
            {mode !== 'reset' && (
              <FlowField label="Email address">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </FlowField>
            )}
            {(mode === 'signup' || mode === 'login' || mode === 'reset') && (
              <FlowField label={mode === 'reset' ? 'New password' : 'Password'} hint={mode === 'login' ? undefined : 'At least 10 characters'}>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={10}
                  maxLength={128}
                  required
                />
              </FlowField>
            )}
            {mode === 'signup' && (
              <label className="account-flow-check">
                <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                <span>I accept the <a href="https://sovereign.defrag.app/terms">Terms</a> and <a href="https://sovereign.defrag.app/privacy">Privacy Policy</a>.</span>
              </label>
            )}
            {mode !== 'reset' && <TurnstileSlot action={mode === 'forgot' ? 'forgot-password' : mode} />}
            <button className="account-flow-primary" disabled={busy || (mode === 'reset' && !resetToken)}>
              {busy
                ? 'Working…'
                : mode === 'signup'
                  ? 'Create account and continue'
                  : mode === 'login'
                    ? plan === 'sovereign_plus' ? 'Sign in and continue to Sovereign+' : 'Sign in'
                    : mode === 'forgot'
                      ? 'Send reset link'
                      : 'Save new password'}
            </button>
          </form>

          <div className="account-flow-links">
            {mode === 'login' && <><a href={`/forgot-password?plan=${plan}&interval=${interval}`}>Forgot password?</a><a href={`/signup?plan=${plan}&interval=${interval}`}>Create an account</a></>}
            {mode === 'signup' && <a href={`/login?plan=${plan}&interval=${interval}`}>Already have an account? Sign in</a>}
            {(mode === 'forgot' || mode === 'reset') && <a href={`/login?plan=${plan}&interval=${interval}`}>Return to sign in</a>}
          </div>
        </section>
      </div>
    </main>
  );
}

function OnboardingPage() {
  const params = useMemo(() => new URLSearchParams(location.search), []);
  const [step, setStep] = useState<'loading' | 'plan' | 'baseline'>('loading');
  const [plan, setPlan] = useState<PlanKey>(params.get('plan') === 'sovereign_plus' ? 'sovereign_plus' : 'free');
  const [interval, setInterval] = useState<BillingInterval>(params.get('interval') === 'annual' ? 'annual' : 'monthly');
  const [status, setStatus] = useState('Loading your setup…');
  const [busy, setBusy] = useState(false);
  const [baselineReady, setBaselineReady] = useState(false);
  const [birthTimeCertainty, setBirthTimeCertainty] = useState('unknown');
  const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';
  const billingCancelled = params.get('billing') === 'cancelled';

  useEffect(() => {
    fetch('/api/v1/onboarding/status', { headers: { accept: 'application/json' } })
      .then(async (response) => {
        if (response.status === 401) {
          location.assign(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`);
          return null;
        }
        if (!response.ok) throw new Error('Setup could not be loaded.');
        return response.json() as Promise<OnboardingStatus>;
      })
      .then((data) => {
        if (!data) return;
        const ready = ['completed', 'partial'].includes(String(data.baseline.status));
        setBaselineReady(ready);
        if (data.onboarding.selectedPlan) setPlan(data.onboarding.selectedPlan);
        if (data.onboarding.billingInterval) setInterval(data.onboarding.billingInterval);
        if (billingCancelled) {
          setStep('plan');
          setStatus('Checkout was canceled. No charge was made. Choose Free or try Sovereign+ again.');
          return;
        }
        if (data.onboarding.stage === 'complete' && ready) {
          location.assign('/app');
          return;
        }
        setStep(data.onboarding.stage === 'baseline' ? 'baseline' : 'plan');
        setStatus('');
      })
      .catch((caught) => {
        setStep('plan');
        setStatus(caught instanceof Error ? caught.message : 'Setup could not be loaded.');
      });
  }, [billingCancelled]);

  async function openCheckout() {
    setStatus('Opening secure Stripe checkout…');
    const checkout = await postJson('/api/v1/billing/checkout', { interval, source: 'onboarding' }, true);
    const url = checkout.checkout?.url;
    if (!url) throw new Error('Stripe checkout is temporarily unavailable.');
    location.assign(String(url));
  }

  async function savePlan() {
    setBusy(true);
    setStatus('Saving your plan…');
    try {
      await postJson('/api/v1/onboarding/plan', { plan, interval });
      if (!baselineReady) {
        setStep('baseline');
        setStatus('');
        return;
      }
      const completed = await postJson('/api/v1/onboarding/complete', {});
      if (completed.checkoutRequired) {
        await openCheckout();
        return;
      }
      location.assign('/app');
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Your plan could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  async function saveBaseline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus('Building your Baseline…');
    try {
      const form = new FormData(event.currentTarget);
      await postJson('/api/v1/baseline/onboarding', Object.fromEntries(form));
      setBaselineReady(true);
      const completed = await postJson('/api/v1/onboarding/complete', {});
      if (completed.checkoutRequired) {
        await openCheckout();
        return;
      }
      location.assign('/app');
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Your Baseline could not be built.');
      setBusy(false);
    }
  }

  const planButtonCopy = baselineReady
    ? plan === 'sovereign_plus' ? 'Continue to secure checkout' : 'Continue with Free'
    : 'Continue to my Baseline';

  return (
    <main className="account-flow-shell onboarding-shell">
      <AccountNav />
      <section className="onboarding-frame">
        <header className="onboarding-heading">
          <p className="account-flow-kicker">SET UP SOVEREIGN.OS</p>
          <div className="onboarding-progress" aria-label="Setup progress">
            <span className={step === 'plan' ? 'active' : 'complete'}><b>1</b>Plan</span>
            <i />
            <span className={step === 'baseline' ? 'active' : baselineReady ? 'complete' : ''}><b>2</b>Baseline</span>
          </div>
        </header>

        {status && <div className="account-flow-notice" role="status">{status}</div>}

        {step === 'loading' && <div className="onboarding-loading">Preparing your private workspace…</div>}

        {step === 'plan' && (
          <section className="onboarding-step">
            <div className="onboarding-title"><span>STEP 1</span><h1>Choose how far you want to begin.</h1><p>Free gives you the complete personal Baseline experience. Sovereign+ adds permission-based relationship comparisons, system mapping, saved continuity, and more conversations.</p></div>
            <div className="onboarding-plan-grid">
              <button type="button" className={plan === 'free' ? 'selected' : ''} onClick={() => setPlan('free')}>
                <header><span>FREE</span><strong>$0</strong></header>
                <h2>Understand yourself.</h2>
                <p>Your personal Baseline, shadow and light, alignment, current context, and 10 Sovereign responses each month.</p>
                <small>No card required.</small>
              </button>
              <button type="button" className={plan === 'sovereign_plus' ? 'selected' : ''} onClick={() => setPlan('sovereign_plus')}>
                <header><span>SOVEREIGN+</span><strong>{interval === 'annual' ? '$99/year' : '$20/month'}</strong></header>
                <h2>Understand relationships and systems.</h2>
                <p>Everything in Free, plus consented comparisons, family and team maps, Library continuity, Covenant, and 300 responses each month.</p>
                <div className="billing-toggle" aria-label="Billing interval">
                  <span className={interval === 'monthly' ? 'active' : ''} onClick={(event) => { event.stopPropagation(); setInterval('monthly'); }}>Monthly</span>
                  <span className={interval === 'annual' ? 'active' : ''} onClick={(event) => { event.stopPropagation(); setInterval('annual'); }}>Annual</span>
                </div>
              </button>
            </div>
            <button className="account-flow-primary onboarding-continue" onClick={savePlan} disabled={busy}>{busy ? 'Working…' : planButtonCopy}</button>
          </section>
        )}

        {step === 'baseline' && (
          <section className="onboarding-step baseline-onboarding-step">
            <div className="onboarding-title"><span>STEP 2</span><h1>Build your starting map.</h1><p>Your birth details are reduced into private Baseline themes. Raw birth data and exact private location are not sent to the AI model.</p></div>
            <form className="baseline-onboarding-form" onSubmit={saveBaseline}>
              <FlowField label="Birth date"><input type="date" name="birthDate" required /></FlowField>
              <FlowField label="Birthplace" hint="City, region, country"><input name="birthplace" placeholder="Upland, California, United States" required /></FlowField>
              <FlowField label="Birthplace timezone" hint="Use the timezone where you were born"><input name="birthTimezone" defaultValue={defaultTimezone} required /></FlowField>
              <FlowField label="Birth-time certainty">
                <select name="birthTimeCertainty" value={birthTimeCertainty} onChange={(event) => setBirthTimeCertainty(event.target.value)}>
                  <option value="exact">Exact</option>
                  <option value="approximate">Approximate</option>
                  <option value="unknown">Unknown</option>
                </select>
              </FlowField>
              {birthTimeCertainty !== 'unknown' && <FlowField label="Birth time"><input type="time" name="birthTime" required /></FlowField>}
              <input type="hidden" name="locationPrecision" value="city_or_regional" />
              <div className="baseline-form-actions">
                <button type="button" className="account-flow-secondary" onClick={() => setStep('plan')}>Back to plans</button>
                <button className="account-flow-primary" disabled={busy}>{busy ? 'Building…' : plan === 'sovereign_plus' ? 'Build Baseline and continue to Stripe' : 'Build Baseline and open Sovereign.OS'}</button>
              </div>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}

function AccountNav() {
  return (
    <header className="account-flow-nav">
      <a href="https://sovereign.defrag.app" className="account-flow-wordmark"><span>S</span><strong>SOVEREIGN.OS</strong></a>
      <a href="https://sovereign.defrag.app/how-it-works.html">How it works</a>
    </header>
  );
}

function FlowField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="account-flow-field"><span><b>{label}</b>{hint && <small>{hint}</small>}</span>{children}</label>;
}

function TurnstileSlot({ action }: { action: string }) {
  return <div className="turnstile-slot account-flow-turnstile" data-sitekey={window.__TURNSTILE_SITE_KEY__ ?? ''} data-action={action}>Loading secure verification…</div>;
}

function turnstileToken(): string {
  return document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value ?? '';
}

async function postJson(path: string, body: unknown, idempotent = false): Promise<any> {
  const headers: Record<string, string> = { 'content-type': 'application/json', accept: 'application/json' };
  if (idempotent) headers['x-idempotency-key'] = crypto.randomUUID();
  const response = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({})) as { error?: string; message?: string } & Record<string, any>;
  if (!response.ok) throw new Error(payload.message || payload.error || 'That did not work. Try again.');
  return payload;
}

function oauthError(code: string | null): string {
  const messages: Record<string, string> = {
    accept_terms: 'Accept the Terms and Privacy Policy before creating your account.',
    oauth_cancelled: 'Sign-in was cancelled. Choose a method and try again.',
    oauth_expired: 'That sign-in attempt expired. Start again.',
    oauth_invalid: 'That sign-in could not be verified. Start again.',
    email_not_verified: 'Use an Apple or Google account with a verified email address.',
    create_account_first: 'Create your Sovereign.OS account before signing in with this provider.',
    account_unavailable: 'That account is temporarily unavailable.',
    oauth_unavailable: 'Apple or Google sign-in is temporarily unavailable.'
  };
  return code ? messages[code] ?? 'Sign-in could not be completed.' : '';
}
