import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

type Mode = 'login' | 'signup' | 'redeem';

export function ReleaseAccountPage({ mode }: { mode: Mode }) {
  const params = useMemo(() => new URLSearchParams(location.search), []);
  const returnTo = safeReturnTo(params.get('returnTo'));
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [state, setState] = useState('Ready');
  const [message, setMessage] = useState('');

  const emailInvalid = submitted && !validEmail(email);
  const nameInvalid = submitted && mode === 'signup' && !name.trim();
  const termsInvalid = submitted && mode === 'signup' && !accepted;

  useEffect(() => {
    if (mode !== 'redeem') return;
    void redeem(params.get('token') ?? '');
  }, [mode, params]);

  async function redeem(token: string) {
    setState('Checking link');
    const query = new URLSearchParams({ token });
    if (returnTo) query.set('returnTo', returnTo);
    const response = await fetch(`/api/v1/auth/redeem?${query.toString()}`);
    if (response.status === 410) return setState('This link expired');
    if (response.status === 409) return setState('This link was already used');
    if (!response.ok) return setState('This link is invalid');
    const payload = await response.json().catch(() => ({})) as { next?: string };
    setState('Signed in');
    setMessage('Opening Sovereign.OS.');
    const next = safeReturnTo(payload.next) ?? '/app';
    setTimeout(() => location.assign(next), 300);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!validEmail(email) || (mode === 'signup' && (!name.trim() || !accepted))) {
      setState('Review the marked details');
      return;
    }
    setState('Verifying');
    const turnstileToken = (document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value ?? '';
    const response = await fetch(`/api/v1/auth/${mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, name, termsAccepted: accepted, turnstileToken, returnTo })
    });
    if (response.status === 429) return setState('Please wait before requesting another link');
    if (response.status === 503) return setState('Sign-in is temporarily unavailable');
    if (!response.ok) return setState('Review the details and try again');
    setState('Link sent');
    setMessage('Check your email for the private sign-in link. It will return you to the place you were opening.');
  }

  return (
    <main className="account-shell release-account-shell">
      <header className="account-nav">
        <a className="wordmark" href="/">SOVEREIGN.OS</a>
        {mode !== 'redeem' && <a href={accountSwitchHref(mode, returnTo)}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</a>}
      </header>
      <div className={`account-layout ${mode === 'redeem' ? 'redeem-layout' : ''}`}>
        <section className="account-intro">
          <p className="eyebrow">{mode === 'login' ? 'YOUR WORKSPACE' : 'START WITH YOUR BASELINE'}</p>
          <h1>{mode === 'signup' ? 'Understand your life in context.' : mode === 'redeem' ? 'Opening Sovereign.OS.' : 'Welcome back.'}</h1>
          <p className="lede">{mode === 'signup' ? 'Create your account, choose a plan, and build the personal foundation for decisions, relationships, and the systems around you.' : mode === 'redeem' ? 'Your workspace will open in a moment.' : 'Return to Today, your conversations, and the understandings you chose to save.'}</p>
          {mode !== 'redeem' && <ul className="account-points"><li>Explore how your Baseline expresses in everyday life</li><li>Examine a decision or relationship without guessing motives</li><li>See how roles and responsibility shape a family or team</li></ul>}
        </section>

        <section className="auth-panel">
          <p className="eyebrow">{mode === 'signup' ? 'START FREE' : mode === 'redeem' ? 'OPENING' : 'SIGN IN'}</p>
          <h2>{mode === 'signup' ? 'Create your account.' : mode === 'redeem' ? 'One moment.' : 'Open your workspace.'}</h2>
          <p className="auth-explainer">{mode === 'signup' ? 'Create your account, choose Free or Sovereign+, then enter your private workspace.' : mode === 'redeem' ? 'This should take only a moment.' : 'Enter your email and we will send the private link that opens your workspace.'}</p>
          {mode !== 'redeem' && (
            <form onSubmit={submit} className="form-stack" noValidate>
              {mode === 'signup' && <Field label="Your name" error={nameInvalid ? 'Enter the name you want Sovereign.OS to use.' : undefined}><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" aria-invalid={nameInvalid} /></Field>}
              <Field label="Email address" error={emailInvalid ? 'Enter a valid email address.' : undefined}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" aria-invalid={emailInvalid} /></Field>
              {mode === 'signup' && <label className={`check-line ${termsInvalid ? 'field-invalid' : ''}`}><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} aria-invalid={termsInvalid} /><span>I accept the Terms and Privacy Policy.</span>{termsInvalid && <small role="alert">Accept the Terms and Privacy Policy to continue.</small>}</label>}
              <div className="turnstile-slot" data-sitekey={(window as any).__TURNSTILE_SITE_KEY__ ?? 'configured-at-runtime'} data-action={mode}>Protected by Cloudflare Turnstile</div>
              <button className="primary-button">{mode === 'signup' ? 'Create account' : 'Email my sign-in link'}</button>
            </form>
          )}
          <div className="status-note" aria-live="polite"><span>{state}</span>{message && <p>{message}</p>}</div>
          {mode !== 'redeem' && <p className="account-switch">{mode === 'signup' ? 'Already use Sovereign.OS?' : 'New to Sovereign.OS?'}{' '}<a href={accountSwitchHref(mode, returnTo)}>{mode === 'signup' ? 'Sign in' : 'Create an account'}</a></p>}
        </section>
      </div>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className={`field ${error ? 'field-invalid' : ''}`}><span>{label}</span>{children}{error && <small role="alert">{error}</small>}</label>;
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function safeReturnTo(value: unknown): string | null {
  if (typeof value !== 'string' || !value || value.length > 512 || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
  try {
    const url = new URL(value, 'https://sovereign.invalid');
    if (url.origin !== 'https://sovereign.invalid') return null;
    if (['/login', '/signup', '/auth/redeem'].includes(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function accountSwitchHref(mode: Exclude<Mode, 'redeem'>, returnTo: string | null): string {
  const destination = mode === 'signup' ? '/login' : '/signup';
  return returnTo ? `${destination}?returnTo=${encodeURIComponent(returnTo)}` : destination;
}
