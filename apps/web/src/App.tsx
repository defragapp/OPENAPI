import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ELIGIBILITY_RULE, POLICY_CONTENT_HASH, POLICY_METADATA } from '../../../config/policies';
import { PlanOnboarding } from './PlanOnboarding';

type ConsentDecision = 'granted' | 'denied';
type TurnstileState = 'loading' | 'ready' | 'verified' | 'expired' | 'error' | 'unsupported';
type FieldErrors = Partial<Record<'email' | 'name' | 'terms' | 'eligibility' | 'turnstile', string | undefined>>;
type InvitationPhase = 'loading' | 'ready' | 'error';
type InvitationRecord = {
  id?: string;
  displayName?: string;
  requestedScopes?: string[];
};

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
        <h1>This page is not part of Sovereign.OS.</h1>
        <p>Return to the public product or sign in to open your private workspace.</p>
        <div>
          <a href="https://sovereign.defrag.app">Open Sovereign.OS</a>
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
  const [ageEligible, setAgeEligible] = useState(false);
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
    if (mode === 'signup' && !accepted) nextErrors.terms = 'Review the Terms and Privacy Policy before creating your account.';
    if (mode === 'signup' && !ageEligible) nextErrors.eligibility = 'Confirm that you are 18 or older to create a Sovereign.OS account.';
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
    setState('Sending secure access email');
    setMessage('Keep this page open while the request completes.');
    setStatusTone('neutral');
    const turnstileToken = (document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value ?? '';
    try {
      const response = await fetch(`/api/v1/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          termsAccepted: accepted,
          termsVersion: POLICY_METADATA.terms.version,
          privacyVersion: POLICY_METADATA.privacy.version,
          policyContentHash: POLICY_CONTENT_HASH,
          ageEligible,
          eligibilityRuleVersion: ELIGIBILITY_RULE.version,
          turnstileToken,
          returnTo: requestedReturnTo
        })
      });
      const problem = await response.clone().json().catch(() => ({})) as { reason?: string; field?: keyof FieldErrors; status?: string };
      if (!response.ok) {
        if (problem.field) setFieldErrors((current) => ({
          ...current,
          [problem.field!]: problem.field === 'email'
            ? 'Enter a complete email address.'
            : problem.field === 'name'
              ? 'Enter the name you want Sovereign.OS to use.'
              : problem.field === 'eligibility'
                ? 'Confirm that you are 18 or older to create a Sovereign.OS account.'
                : 'Review the current Terms and Privacy Policy.'
        }));
        if (problem.status === 'policy_update_required') {
          setState('The policies changed before signup completed');
          setMessage('Refresh this page, review the current Terms and Privacy Policy, then choose again.');
        } else if (response.status === 429) {
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
      setState('One-time access email sent');
      setMessage('Check your inbox. The one-time link and six-digit code expire in 15 minutes.');
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
          <p className="eyebrow">{mode === 'login' ? 'PRIVATE ACCOUNT ACCESS' : mode === 'signup' ? 'START FREE' : 'SECURE ACCOUNT ACCESS'}</p>
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
                ? 'Your verified account will continue to the next unfinished step.'
                : 'Use your email and the secure sign-in method available for your account.'}
          </p>
          {mode === 'signup' && (
            <p className="account-intro-note">Your Baseline becomes the private personal foundation Sovereign uses across self, decisions, relationships, and systems.</p>
          )}
        </section>

        <section className="auth-panel">
          <p className="eyebrow">{mode === 'redeem' ? 'OPENING' : mode === 'signup' ? 'EMAIL VERIFICATION' : 'EMAIL LINK OR CODE'}</p>
          <h2>{mode === 'signup' ? 'Verify your email to begin.' : mode === 'redeem' ? 'Checking your secure link.' : 'Continue with email.'}</h2>
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
                <>
                  <label className={`check-line ${fieldErrors.terms ? 'has-error' : ''}`}>
                    <input type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); setFieldErrors((current) => ({ ...current, terms: undefined })); }} aria-invalid={Boolean(fieldErrors.terms)} />
                    <span>I agree to the <a href={POLICY_METADATA.terms.path}>Terms</a> and acknowledge the <a href={POLICY_METADATA.privacy.path}>Privacy Policy</a>.</span>
                  </label>
                  <label className={`check-line ${fieldErrors.eligibility ? 'has-error' : ''}`}>
                    <input type="checkbox" checked={ageEligible} onChange={(event) => { setAgeEligible(event.target.checked); setFieldErrors((current) => ({ ...current, eligibility: undefined })); }} aria-invalid={Boolean(fieldErrors.eligibility)} />
                    <span>I confirm I am 18 or older.</span>
                  </label>
                  <p className="account-policy-notice">Your name and email operate your private account. Sovereign also hashes limited request metadata for account security and abuse prevention. <a href={POLICY_METADATA.privacy.path}>See how information is handled.</a></p>
                </>
              )}
              {fieldErrors.terms && <p className="field-error">{fieldErrors.terms}</p>}
              {fieldErrors.eligibility && <p className="field-error">{fieldErrors.eligibility}</p>}
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
      setState('This invitation link is invalid.');
      return () => { cancelled = true; };
    }

    setPhase('loading');
    void fetch(`/api/v1/invitations/preview?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 410 ? 'This invitation expired.' : 'This invitation is no longer available.');
        return response.json() as Promise<{ invitation?: InvitationRecord }>;
      })
      .then((data) => {
        if (cancelled || !data.invitation) return;
        setInvitation(data.invitation);
        setPhase('ready');
        setState('Review what is being requested.');
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
        setState(response.status === 409 ? 'This invitation was already used.' : 'The invitation could not be accepted.');
        return;
      }
      const data = await response.json() as { invitation?: InvitationRecord };
      if (data.invitation) setInvitation(data.invitation);
      setAccepted(true);
      setPhase('ready');
      setState('Choose separately for each requested use.');
    } catch {
      setPhase('error');
      setState('The invitation could not reach Sovereign.OS. Check your connection and try again.');
    } finally {
      setAccepting(false);
    }
  }

  async function decide(scope: string, granted: boolean) {
    if (!invitation?.id || savingScope) return;
    setSavingScope(scope);
    setState(`Saving your ${granted ? 'permission' : 'decision not to share'}…`);
    try {
      const response = await fetch(`/api/v1/invitations/${invitation.id}/consent/${encodeURIComponent(scope)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ granted })
      });
      if (!response.ok) {
        setState('That decision could not be saved safely. Nothing changed.');
        return;
      }
      setDecisions((current) => ({ ...current, [scope]: granted ? 'granted' : 'denied' }));
      setState('Decision saved. You can change it later.');
    } catch {
      setState('That decision could not reach Sovereign.OS. Nothing changed.');
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
        <p className="eyebrow">PRIVATE CONSENT</p>
        <h1 id="invitation-title">Choose what this connection may use.</h1>
        <p className="lede">An invitation does not grant blanket access. Review each requested use separately; you can change your choices later.</p>
        <div className={`status-note ${statusTone}`} role={phase === 'error' ? 'alert' : 'status'} aria-live="polite"><span>{state}</span></div>

        {!invitation && (
          <section className="invitation-state" aria-busy={phase === 'loading'}>
            <span>{phase === 'loading' ? 'Checking invitation' : 'Invitation unavailable'}</span>
            <h2>{phase === 'loading' ? 'Opening the private request.' : 'This request cannot be opened.'}</h2>
            <p>{phase === 'loading' ? 'Sovereign.OS is confirming the invitation before showing any requested use.' : 'No permission was granted and no account information was changed.'}</p>
            {phase === 'error' && <a href="/login">Sign in to Sovereign.OS</a>}
          </section>
        )}

        {invitation && !accepted && (
          <div className="form-stack">
            <div className="usage-card">
              <div><span>Shared relationship record</span><strong>{invitation.displayName || 'Private connection'}</strong></div>
              <p>No raw birth input or exact private location is shared with the other account.</p>
            </div>
            <section className="scope-panel">
              <div><p className="eyebrow">REQUESTED USES</p><h3>Review before accepting.</h3></div>
              <div className="scope-list">
                {requestedScopes.map((scope) => <div key={scope}><span><strong>{scopeLabel(scope)}</strong><small>{scopeDescription(scope)}</small></span></div>)}
              </div>
            </section>
            <button className="primary-button" onClick={acceptInvitation} disabled={accepting}>{accepting ? 'Connecting invitation…' : 'Accept invitation and review choices'}</button>
          </div>
        )}

        {invitation && accepted && (
          <section className="scope-panel">
            <div><p className="eyebrow">YOUR DECISIONS</p><h3>Choose independently.</h3></div>
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
            <p className="consent-completion-note">Every requested use needs its own decision before the shared workspace opens.</p>
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
    const allowed = parsed.pathname === '/app'
      || parsed.pathname.startsWith('/app/')
      || parsed.pathname === '/onboarding'
      || parsed.pathname === '/consent.html';
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
