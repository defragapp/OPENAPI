import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { PlanOnboarding } from './PlanOnboarding';

type ConsentDecision = 'granted' | 'denied';
type TurnstileState = 'loading' | 'ready' | 'verified' | 'expired' | 'error' | 'unsupported';
type FieldErrors = Partial<Record<'email' | 'name' | 'terms' | 'turnstile', string | undefined>>;
type InvitationPhase = 'loading' | 'ready' | 'error';
type InvitationRecord = {
  id?: string;
  displayName?: string;
  requestedScopes?: string[];
};

const consentScopes = [
  ['pair.compare', 'Compare our Baselines'],
  ['system.include', 'Include me in a group view'],
  ['trait.display', 'Use the Baseline details I share'],
  ['framework.display', 'Show supporting source details'],
  ['current_conditions.use', 'Use my temporary current context'],
  ['library.link', 'Use an insight I saved'],
  ['covenant.include', 'Include me in a Covenant answer']
] as const;

const consentScopeDescriptions: Record<string, string> = {
  'pair.compare': 'Compare the parts of each Baseline that both people agreed to share.',
  'system.include': 'Include you in a family, household, friendship, or team view.',
  'trait.display': 'Use only the plain-language Baseline details you chose to share.',
  'framework.display': 'Show the exact source details behind shared Baseline information when requested.',
  'current_conditions.use': 'Use your temporary current context for this shared question.',
  'library.link': 'Use a saved insight as shared context for this connection.',
  'covenant.include': 'Include you only when the optional Christian Scripture perspective is turned on.'
};

export function App() {
  const path = location.pathname;
  if (path === '/login' || path === '/signup' || path === '/auth/redeem') {
    return <AccountPage mode={path === '/signup' ? 'signup' : path === '/auth/redeem' ? 'redeem' : 'login'} />;
  }
  if (path === '/invitation') return <InvitationPage />;
  if (path === '/onboarding') return <PlanOnboarding />;
  return <PublicNotFound />;
}

function PublicNotFound() {
  return (
    <main className="public-not-found">
      <a className="private-route-brand" href="https://sovereign.defrag.app">
        <span aria-hidden="true">S</span>
        <strong>SOVEREIGN.OS</strong>
      </a>
      <section>
        <span>PAGE NOT FOUND</span>
        <h1>We could not find this page.</h1>
        <p>Return to the Sovereign.OS website or sign in to open your private workspace.</p>
        <div>
          <a href="https://sovereign.defrag.app">Go to Sovereign.OS</a>
          <a href="/login">Sign in</a>
        </div>
      </section>
    </main>
  );
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
    setState('Checking your sign-in link');
    setStatusTone('neutral');
    const parameters = new URLSearchParams({ token });
    parameters.set('returnTo', safeClientReturnTo(returnTo));
    const response = await fetch(`/api/v1/auth/redeem?${parameters.toString()}`);
    if (response.status === 410) {
      setStatusTone('error');
      setMessage('Go back to sign in and request a new email link.');
      return setState('This link has expired');
    }
    if (response.status === 409) {
      setStatusTone('error');
      setMessage('Each sign-in link works once. Request a new link to continue.');
      return setState('This link has already been used');
    }
    if (!response.ok) {
      setStatusTone('error');
      setMessage('Request a new email link. Nothing in your account was changed.');
      return setState('This link is not valid');
    }
    const payload = await response.json().catch(() => ({})) as { next?: string };
    const next = safeClientReturnTo(payload.next, '/app');
    setState('Signed in');
    setStatusTone('success');
    setMessage('Opening your workspace.');
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
      : 'Complete the security check before continuing.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setState('Check the highlighted details');
      setMessage('Nothing was submitted.');
      setStatusTone('error');
      return;
    }

    setSubmitting(true);
    setState('Sending your sign-in link');
    setMessage('Keep this page open while we send the email.');
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
          setMessage('Wait two minutes, complete a new security check, and try again.');
        } else if (response.status === 503) {
          setState('Sign-in is temporarily unavailable');
          setMessage('Nothing in your account was changed. Try again in a moment.');
        } else if (problem.reason === 'expired_or_used') {
          setState('The security check expired');
          setMessage('Complete the new security check, then send the link again.');
        } else if (problem.reason === 'hostname_mismatch' || problem.reason === 'action_mismatch') {
          setState('The security check did not match this page');
          setMessage('Refresh the page before trying again.');
        } else if (problem.reason === 'required' || problem.reason === 'invalid') {
          setState('Complete a new security check');
          setMessage('The previous check could not be verified.');
        } else {
          setState('Check the details and try again');
          setMessage('Nothing in your account was changed.');
        }
        setStatusTone('error');
        resetTurnstile();
        return;
      }
      setState('Email sent');
      setMessage('Check your inbox. The link expires in 15 minutes and works once.');
      setStatusTone('success');
      setLinkSent(true);
    } catch {
      setState('We could not send the request');
      setMessage('Check your connection, complete a new security check, and try again.');
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
          <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : mode === 'signup' ? 'CREATE YOUR ACCOUNT' : 'SECURE SIGN-IN'}</p>
          <h1>
            {mode === 'signup'
              ? 'Create your Sovereign.OS account.'
              : mode === 'redeem'
                ? 'Opening your workspace.'
                : 'Sign in to Sovereign.OS.'}
          </h1>
          <p className="lede">
            {mode === 'signup'
              ? 'Start free. Verify your email, choose a plan, and build your Baseline.'
              : mode === 'redeem'
                ? 'We are checking your one-time link before opening your private workspace.'
                : 'Enter your email. We will send a one-time sign-in link.'}
          </p>
          {mode !== 'redeem' && (
            <ul className="account-points">
              <li>Ask about yourself or a decision without starting from zero</li>
              <li>Understand a relationship without guessing another person’s motives</li>
              <li>See who decides, who carries responsibility, and where pressure builds in a group</li>
            </ul>
          )}
        </section>

        <section className="auth-panel">
          <p className="eyebrow">{mode === 'redeem' ? 'CHECKING YOUR LINK' : 'EMAIL ACCESS'}</p>
          <h2>{mode === 'signup' ? 'Verify your email to begin.' : mode === 'redeem' ? 'Checking your one-time link.' : 'Get a sign-in link.'}</h2>
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
                  {turnstileState === 'verified' ? 'Security check complete.' : 'Preparing the security check…'}
                </p>
              </div>
              {fieldErrors.turnstile && <p className="field-error">{fieldErrors.turnstile}</p>}
              <button className="primary-button" disabled={buttonDisabled}>
                {submitting ? 'Sending…' : linkSent ? 'Check your inbox' : mode === 'signup' ? 'Create account' : 'Send my sign-in link'}
              </button>
            </form>
          )}
          <div className={`status-note ${statusTone}`} aria-live="polite">
            <span>{state}</span>
            {message && <p>{message}</p>}
          </div>
          {mode !== 'redeem' && (
            <p className="account-switch">
              {mode === 'signup' ? 'Already have an account?' : 'New to Sovereign.OS?'}{' '}
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
  const [invitation, setInvitation] = useState<InvitationRecord | null>(null);
  const [phase, setPhase] = useState<InvitationPhase>('loading');
  const [state, setState] = useState('Checking invitation');
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [savingScope, setSavingScope] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, ConsentDecision>>({});

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setPhase('error');
      setState('This invitation link is not valid.');
      return () => { cancelled = true; };
    }

    setPhase('loading');
    void fetch(`/api/v1/invitations/preview?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 410 ? 'This invitation has expired.' : 'This invitation is no longer available.');
        return response.json() as Promise<{ invitation?: InvitationRecord }>;
      })
      .then((data) => {
        if (cancelled || !data.invitation) return;
        setInvitation(data.invitation);
        setPhase('ready');
        setState('Review the requested permissions before accepting.');
      })
      .catch((error) => {
        if (cancelled) return;
        setPhase('error');
        setState(error instanceof Error ? error.message : 'This invitation is unavailable.');
      });

    return () => { cancelled = true; };
  }, [token]);

  async function acceptInvitation() {
    if (accepting) return;
    setAccepting(true);
    setState('Connecting this invitation to your account.');
    try {
      const response = await fetch(`/api/v1/invitations/redeem?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}'
      });
      if (!response.ok) {
        setPhase('error');
        setState(response.status === 409 ? 'This invitation has already been used.' : 'We could not accept this invitation.');
        return;
      }
      const data = await response.json() as { invitation?: InvitationRecord };
      if (data.invitation) setInvitation(data.invitation);
      setAccepted(true);
      setPhase('ready');
      setState('Choose Allow or Do not allow for each permission.');
    } catch {
      setPhase('error');
      setState('We could not reach Sovereign.OS. Check your connection and try again.');
    } finally {
      setAccepting(false);
    }
  }

  async function decide(scope: string, granted: boolean) {
    if (!invitation?.id || savingScope) return;
    setSavingScope(scope);
    setState(granted ? 'Saving permission…' : 'Saving your choice not to share…');
    try {
      const response = await fetch(`/api/v1/invitations/${invitation.id}/consent/${encodeURIComponent(scope)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ granted })
      });
      if (!response.ok) {
        setState('We could not save that choice. Nothing changed.');
        return;
      }
      setDecisions((current) => ({ ...current, [scope]: granted ? 'granted' : 'denied' }));
      setState('Choice saved. You can change it later.');
    } catch {
      setState('We could not save that choice. Nothing changed.');
    } finally {
      setSavingScope(null);
    }
  }

  const requestedScopes = invitation?.requestedScopes ?? [];
  const completed = requestedScopes.length > 0 && requestedScopes.every((scope) => Boolean(decisions[scope]));
  const invitationState = phase === 'error' ? 'error' : !invitation ? 'loading' : accepted ? 'decisions' : 'review';
  const statusTone = phase === 'error' ? 'error' : completed ? 'success' : 'neutral';

  return (
    <main className="account-shell invitation-shell">
      <a className="wordmark" href="/">SOVEREIGN.OS</a>
      <section className="auth-panel" data-invitation-state={invitationState} aria-labelledby="invitation-title">
        <p className="eyebrow">PRIVATE INVITATION</p>
        <h1 id="invitation-title">Choose what Sovereign may use about you.</h1>
        <p className="lede">Accepting connects your account. It does not share everything. Review each permission separately, and change your choices later at any time.</p>
        <div className={`status-note ${statusTone}`} role={phase === 'error' ? 'alert' : 'status'} aria-live="polite"><span>{state}</span></div>

        {!invitation && (
          <section className="invitation-state" aria-busy={phase === 'loading'}>
            <span>{phase === 'loading' ? 'Checking invitation' : 'Invitation unavailable'}</span>
            <h2>{phase === 'loading' ? 'Confirming this private invitation.' : 'This invitation cannot be opened.'}</h2>
            <p>{phase === 'loading' ? 'We are checking the link before showing any requested permission.' : 'No permission was granted and nothing in your account was changed.'}</p>
            {phase === 'error' && <a href="/login">Sign in to Sovereign.OS</a>}
          </section>
        )}

        {invitation && !accepted && (
          <div className="form-stack">
            <div className="usage-card">
              <div><span>CONNECTION</span><strong>{invitation.displayName || 'Private connection'}</strong></div>
              <p>Your raw birth details and exact private location are never shared with the other account.</p>
            </div>
            <section className="scope-panel">
              <div><p className="eyebrow">REQUESTED PERMISSIONS</p><h3>See exactly what is being requested.</h3></div>
              <div className="scope-list">
                {requestedScopes.map((scope) => <div key={scope}><span><strong>{scopeLabel(scope)}</strong><small>{scopeDescription(scope)}</small></span></div>)}
              </div>
            </section>
            <button className="primary-button" onClick={acceptInvitation} disabled={accepting}>{accepting ? 'Accepting invitation…' : 'Accept invitation and choose permissions'}</button>
          </div>
        )}

        {invitation && accepted && (
          <section className="scope-panel">
            <div><p className="eyebrow">YOUR PERMISSIONS</p><h3>Choose each one separately.</h3></div>
            <div className="scope-list">
              {requestedScopes.map((scope) => {
                const decision = decisions[scope];
                const descriptionId = `scope-${scope.replace(/[^a-z0-9]/gi, '-')}`;
                return (
                  <div key={scope} data-decision={decision ?? 'undecided'}>
                    <span><strong>{scopeLabel(scope)}</strong><small id={descriptionId}>{decision === 'granted' ? 'Allowed. You can change this later.' : decision === 'denied' ? 'Not allowed. You can change this later.' : scopeDescription(scope)}</small></span>
                    <div role="group" aria-label={`Permission for ${scopeLabel(scope)}`} aria-describedby={descriptionId}>
                      <button className="consent-choice" aria-pressed={decision === 'granted'} disabled={savingScope === scope} onClick={() => void decide(scope, true)}>Allow</button>
                      <button className="consent-choice" aria-pressed={decision === 'denied'} disabled={savingScope === scope} onClick={() => void decide(scope, false)}>Do not allow</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="consent-completion-note">Choose one option for every requested permission before opening the shared workspace.</p>
            <button className="primary-button" disabled={!completed || Boolean(savingScope)} onClick={() => location.assign('/app')}>Open Sovereign.OS</button>
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
  return consentScopeDescriptions[scope] ?? 'Use only the information covered by this specific permission.';
}

function Field({ label, children, error }: { label: string; children: ReactNode; error?: string | undefined }) {
  return <label className={`field ${error ? 'has-error' : ''}`}><span>{label}</span>{children}{error && <small className="field-error">{error}</small>}</label>;
}
