import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { PlanOnboarding } from './PlanOnboarding';
import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace';

type ConsentDecision = 'granted' | 'denied';
type TurnstileState = 'loading' | 'ready' | 'verified' | 'expired' | 'error' | 'unsupported';
type FieldErrors = Partial<Record<'email' | 'name' | 'terms' | 'turnstile', string | undefined>>;

const consentScopes = [
  ['pair.compare', 'Compare together'],
  ['system.include', 'Include in a system'],
  ['trait.display', 'Use shared Baseline traits'],
  ['framework.display', 'Show optional source detail'],
  ['current_conditions.use', 'Use current conditions'],
  ['library.link', 'Link a saved understanding'],
  ['covenant.include', 'Include in a Scripture lens']
] as const;

const consentScopeDescriptions: Record<string, string> = {
  'pair.compare': 'Compare the two permitted Baselines while keeping each person distinct.',
  'system.include': 'Include this person in a family, household, friendship, or team view.',
  'trait.display': 'Use the plain-language themes this person chose to share.',
  'framework.display': 'Show optional supporting framework detail.',
  'current_conditions.use': 'Include temporary current context for this person.',
  'library.link': 'Use a saved understanding as shared context.',
  'covenant.include': 'Include this person only when the optional Covenant lens is on.'
};

export function App() {
  const path = location.pathname;
  if (path === '/login' || path === '/signup' || path === '/auth/redeem') {
    return <AccountPage mode={path === '/signup' ? 'signup' : path === '/auth/redeem' ? 'redeem' : 'login'} />;
  }
  if (path === '/invitation') return <InvitationPage />;
  if (path === '/onboarding') return <PlanOnboarding />;
  return <SovereignIntelligenceWorkspace />;
}

function AccountPage({ mode }: { mode: 'login' | 'signup' | 'redeem' }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [state, setState] = useState('Ready');
  const [message, setMessage] = useState('');
  const [statusTone, setStatusTone] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [turnstileState, setTurnstileState] = useState<TurnstileState>('loading');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const requestedReturnTo = useMemo(() => safeClientReturnTo(new URLSearchParams(location.search).get('returnTo')), []);

  useEffect(() => {
    if (mode === 'redeem') return;
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ state?: TurnstileState; action?: string }>).detail;
      if (detail?.action === mode && detail.state) {
        setTurnstileState(detail.state);
        if (detail.state === 'verified') setFieldErrors((current) => ({ ...current, turnstile: undefined }));
      }
    };
    window.addEventListener('sovereign:turnstile-state', listener);
    return () => window.removeEventListener('sovereign:turnstile-state', listener);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'redeem') return;
    const parameters = new URLSearchParams(location.search);
    void redeem(parameters.get('token') ?? '', parameters.get('returnTo'));
  }, [mode]);

  async function redeem(token: string, returnTo: string | null) {
    setState('Checking link');
    setStatusTone('neutral');
    const parameters = new URLSearchParams({ token });
    parameters.set('returnTo', safeClientReturnTo(returnTo));
    const response = await fetch(`/api/v1/auth/redeem?${parameters.toString()}`);
    if (response.status === 410) {
      setStatusTone('error');
      setMessage('Request a new one-time email link from the sign-in page.');
      return setState('This link expired');
    }
    if (response.status === 409) {
      setStatusTone('error');
      setMessage('For your protection, each link can open Sovereign.OS only once.');
      return setState('This link was already used');
    }
    if (!response.ok) {
      setStatusTone('error');
      setMessage('Request a new one-time email link. Nothing was changed in your account.');
      return setState('This link is invalid');
    }
    const payload = await response.json().catch(() => ({})) as { next?: string };
    const next = safeClientReturnTo(payload.next, '/app');
    setState('Signed in');
    setStatusTone('success');
    setMessage('Opening Sovereign.OS.');
    setTimeout(() => location.assign(next), 300);
  }

  function resetTurnstile() {
    setTurnstileState('loading');
    window.dispatchEvent(new CustomEvent('sovereign:turnstile-reset', { detail: { action: mode } }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting || linkSent) return;

    const nextErrors: FieldErrors = {};
    if (!email.includes('@')) nextErrors.email = 'Enter a complete email address.';
    if (mode === 'signup' && !name.trim()) nextErrors.name = 'Enter the name you want Sovereign.OS to use.';
    if (mode === 'signup' && !accepted) nextErrors.terms = 'Review and accept the Terms and Privacy Policy.';
    if (turnstileState !== 'verified') nextErrors.turnstile = turnstileState === 'error' || turnstileState === 'unsupported'
      ? 'The security check is unavailable. Refresh the page or try another browser.'
      : 'Complete the private security check before continuing.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setState('Review the details below');
      setMessage('Your account was not changed.');
      setStatusTone('error');
      return;
    }

    setSubmitting(true);
    setState('Sending one-time email link');
    setMessage('Keep this page open while the request completes.');
    setStatusTone('neutral');
    const turnstileToken = (document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value ?? '';
    try {
      const response = await fetch(`/api/v1/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, name, termsAccepted: accepted, turnstileToken, returnTo: requestedReturnTo })
      });
      const problem = await response.clone().json().catch(() => ({})) as { reason?: string; field?: keyof FieldErrors };
      if (!response.ok) {
        if (problem.field) setFieldErrors((current) => ({ ...current, [problem.field!]: problem.field === 'email' ? 'Enter a complete email address.' : problem.field === 'name' ? 'Enter the name you want Sovereign.OS to use.' : 'Review and accept the Terms and Privacy Policy.' }));
        if (response.status === 429) {
          setState('A link was requested recently');
          setMessage('Wait two minutes, then complete a fresh security check and try again.');
        } else if (response.status === 503) {
          setState('Sign-in is temporarily unavailable');
          setMessage('No account change was made. Try again in a moment.');
        } else if (problem.reason === 'expired_or_used') {
          setState('The security check expired');
          setMessage('A fresh check is loading now. Complete it, then send the link again.');
        } else if (problem.reason === 'hostname_mismatch' || problem.reason === 'action_mismatch') {
          setState('The security check did not match this page');
          setMessage('Refresh this page before trying again.');
        } else if (problem.reason === 'required' || problem.reason === 'invalid') {
          setState('Complete a fresh security check');
          setMessage('The previous check could not be verified.');
        } else {
          setState('Review the details and try again');
          setMessage('No account change was made.');
        }
        setStatusTone('error');
        resetTurnstile();
        return;
      }
      setState('One-time email link sent');
      setMessage('Check your inbox. The link expires in 15 minutes and can be used once.');
      setStatusTone('success');
      setLinkSent(true);
    } catch {
      setState('The request could not reach Sovereign.OS');
      setMessage('Check your connection, then complete a fresh security check and try again.');
      setStatusTone('error');
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  }

  const buttonDisabled = submitting || linkSent || turnstileState !== 'verified';

  return (
    <main className="account-shell">
      <header className="account-nav">
        <a className="wordmark" href="/">SOVEREIGN.OS</a>
        {mode !== 'redeem' && (
          <a href={mode === 'signup' ? '/login' : '/signup'}>
            {mode === 'signup' ? 'Sign in' : 'Create an account'}
          </a>
        )}
      </header>
      <div className={`account-layout ${mode === 'redeem' ? 'redeem-layout' : ''}`}>
        <section className="account-intro">
          <p className="eyebrow">{mode === 'login' ? 'YOUR SOVEREIGN.OS' : 'START WITH YOUR BASELINE'}</p>
          <h1>
            {mode === 'signup'
              ? 'Create your Sovereign.OS account.'
              : mode === 'redeem'
                ? 'Opening Sovereign.OS.'
                : 'Sign in to Sovereign.OS.'}
          </h1>
          <p className="lede">
            {mode === 'signup'
              ? 'Start free. Verify your email, then build your Baseline.'
              : mode === 'redeem'
                ? 'Your Sovereign.OS workspace will open in a moment.'
                : 'Use your email and the available secure sign-in method for your account.'}
          </p>
          {mode !== 'redeem' && (
            <ul className="account-points">
              <li>Bring a decision into view with your Baseline underneath it</li>
              <li>Understand a relationship without guessing another person’s motives</li>
              <li>See roles and responsibility across a family, household, or team</li>
            </ul>
          )}
        </section>

        <section className="auth-panel">
          <p className="eyebrow">{mode === 'signup' ? 'START FREE' : mode === 'redeem' ? 'OPENING' : 'SIGN IN'}</p>
          <h2>{mode === 'signup' ? 'Create your Sovereign.OS account.' : mode === 'redeem' ? 'One moment.' : 'Sign in to Sovereign.OS.'}</h2>
          <p className="auth-explainer">
            {mode === 'signup'
              ? 'Start free. Verify your email, then build your Baseline.'
              : mode === 'redeem'
                ? 'This should take only a moment.'
                : 'Use your email and the available secure sign-in method for your account.'}
          </p>
          {mode !== 'redeem' && (
            <form onSubmit={submit} className="form-stack" noValidate>
              {mode === 'signup' && (
                <Field label="Your name" error={fieldErrors.name}>
                  <input value={name} onChange={(event) => { setName(event.target.value); setFieldErrors((current) => ({ ...current, name: undefined })); }} autoComplete="name" aria-invalid={Boolean(fieldErrors.name)} />
                </Field>
              )}
              <Field label="Email address" error={fieldErrors.email}>
                <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFieldErrors((current) => ({ ...current, email: undefined })); }} autoComplete="email" inputMode="email" aria-invalid={Boolean(fieldErrors.email)} />
              </Field>
              {mode === 'signup' && (
                <label className={`check-line ${fieldErrors.terms ? 'has-error' : ''}`}>
                  <input type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); setFieldErrors((current) => ({ ...current, terms: undefined })); }} aria-invalid={Boolean(fieldErrors.terms)} />
                  <span>I accept the Terms and Privacy Policy.</span>
                </label>
              )}
              {fieldErrors.terms && <p className="field-error">{fieldErrors.terms}</p>}
              <div className="turnstile-frame" data-state={turnstileState}>
                <div
                  className="turnstile-slot"
                  data-sitekey={(window as any).__TURNSTILE_SITE_KEY__ ?? 'configured-at-runtime'}
                  data-action={mode}
                />
                <p data-turnstile-caption aria-live="polite">
                  {turnstileState === 'verified' ? 'Security check complete.' : 'Preparing the private security check…'}
                </p>
              </div>
              {fieldErrors.turnstile && <p className="field-error">{fieldErrors.turnstile}</p>}
              <button className="primary-button" disabled={buttonDisabled}>
                {submitting ? 'Sending…' : linkSent ? 'Check your inbox' : mode === 'signup' ? 'Create account' : 'Email my sign-in link'}
              </button>
            </form>
          )}
          <div className={`status-note ${statusTone}`} aria-live="polite">
            <span>{state}</span>
            {message && <p>{message}</p>}
          </div>
          {mode !== 'redeem' && (
            <p className="account-switch">
              {mode === 'signup' ? 'Already use Sovereign.OS?' : 'New to Sovereign.OS?'}{' '}
              <a href={mode === 'signup' ? '/login' : '/signup'}>
                {mode === 'signup' ? 'Sign in' : 'Create an account'}
              </a>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function InvitationPage() {
  const token = useMemo(() => new URLSearchParams(location.search).get('token') ?? '', []);
  const [invitation, setInvitation] = useState<any>(null);
  const [state, setState] = useState('Checking invitation');
  const [accepted, setAccepted] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, ConsentDecision>>({});

  useEffect(() => {
    if (!token) {
      setState('This invitation link is invalid.');
      return;
    }
    fetch(`/api/v1/invitations/preview?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 410 ? 'This invitation expired.' : 'This invitation is no longer available.');
        return response.json();
      })
      .then((data) => { setInvitation(data.invitation); setState('Review what is being requested.'); })
      .catch((error) => setState(error instanceof Error ? error.message : 'This invitation is unavailable.'));
  }, [token]);

  async function acceptInvitation() {
    setState('Connecting this invitation to your account.');
    const response = await fetch(`/api/v1/invitations/redeem?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}'
    });
    if (!response.ok) {
      setState(response.status === 409 ? 'This invitation was already used.' : 'The invitation could not be accepted.');
      return;
    }
    const data = await response.json();
    setInvitation(data.invitation);
    setAccepted(true);
    setState('You can now review each requested use.');
  }

  async function decide(scope: string, granted: boolean) {
    if (!invitation?.id) return;
    setState(`Saving your ${granted ? 'permission' : 'decision not to share'}…`);
    const response = await fetch(`/api/v1/invitations/${invitation.id}/consent/${encodeURIComponent(scope)}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ granted })
    });
    if (!response.ok) {
      setState('That decision could not be saved safely.');
      return;
    }
    setDecisions((current) => ({ ...current, [scope]: granted ? 'granted' : 'denied' }));
    setState('Decision saved. You can change it later.');
  }

  const requestedScopes: string[] = invitation?.requestedScopes ?? [];
  const completed = requestedScopes.length > 0 && requestedScopes.every((scope) => decisions[scope]);

  return (
    <main className="account-shell">
      <a className="wordmark" href="/">SOVEREIGN.OS</a>
      <section className="auth-panel">
        <p className="eyebrow">PRIVATE CONSENT</p>
        <h1>Choose what this connection may use.</h1>
        <p className="lede">Accepting an invitation does not give another person blanket access. Review each requested use separately; you can change your choices later.</p>
        <div className="status-note" aria-live="polite"><span>{state}</span></div>
        {invitation && !accepted && (
          <div className="form-stack">
            <div className="usage-card">
              <div><span>Shared relationship record</span><strong>{invitation.displayName}</strong></div>
              <p>No raw birth input or exact private location is shared with the other account.</p>
            </div>
            <section className="scope-panel">
              <div><p className="eyebrow">REQUESTED USES</p><h3>Review before accepting.</h3></div>
              <div className="scope-list">
                {requestedScopes.map((scope) => <div key={scope}><span><strong>{scopeLabel(scope)}</strong><small>{scopeDescription(scope)}</small></span></div>)}
              </div>
            </section>
            <button className="primary-button" onClick={acceptInvitation}>Verify me and review each choice</button>
          </div>
        )}
        {invitation && accepted && (
          <section className="scope-panel">
            <div><p className="eyebrow">YOUR DECISIONS</p><h3>Choose independently.</h3></div>
            <div className="scope-list">
              {requestedScopes.map((scope) => (
                <div key={scope}>
                  <span><strong>{scopeLabel(scope)}</strong><small>{decisions[scope] ? `Saved: ${decisions[scope]}` : 'No decision yet'}</small></span>
                  <div>
                    <button onClick={() => decide(scope, true)}>Allow</button>
                    <button onClick={() => decide(scope, false)}>Do not allow</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="primary-button" disabled={!completed} onClick={() => location.assign('/app')}>Open Sovereign.OS</button>
          </section>
        )}
      </section>
    </main>
  );
}

function safeClientReturnTo(value: unknown, fallback = '/app'): string {
  if (typeof value !== 'string' || value.length > 512 || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  try {
    const parsed = new URL(value, location.origin);
    const allowed = parsed.pathname === '/app' || parsed.pathname.startsWith('/app/') || parsed.pathname === '/onboarding';
    return allowed ? `${parsed.pathname}${parsed.search}` : fallback;
  } catch {
    return fallback;
  }
}

function scopeLabel(scope: string): string {
  return consentScopes.find(([value]) => value === scope)?.[1] ?? scope;
}

function scopeDescription(scope: string): string {
  return consentScopeDescriptions[scope] ?? 'Use only the context covered by this permission.';
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: string | undefined }) {
  return <label className={`field ${error ? 'has-error' : ''}`}><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>;
}
