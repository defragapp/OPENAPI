import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { PlanOnboarding } from './PlanOnboarding';
import { SovereignWorkspace } from './SovereignWorkspace';

type ConsentDecision = 'granted' | 'denied';

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
  return <SovereignWorkspace />;
}

function AccountPage({ mode }: { mode: 'login' | 'signup' | 'redeem' }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [state, setState] = useState('Ready');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (mode === 'redeem' || document.querySelector('script[data-turnstile]')) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    document.head.appendChild(script);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'redeem') return;
    void redeem(new URLSearchParams(location.search).get('token') ?? '');
  }, [mode]);

  async function redeem(token: string) {
    setState('Checking link');
    const response = await fetch(`/api/v1/auth/redeem?token=${encodeURIComponent(token)}`);
    if (response.status === 410) return setState('This link expired');
    if (response.status === 409) return setState('This link was already used');
    if (!response.ok) return setState('This link is invalid');
    const payload = await response.json().catch(() => ({})) as { next?: string };
    setState('Signed in');
    setMessage('Opening Sovereign.OS.');
    setTimeout(() => location.assign(payload.next === '/onboarding' ? '/onboarding' : '/app'), 300);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes('@') || (mode === 'signup' && (!name.trim() || !accepted))) {
      setState('Check the highlighted details');
      return;
    }
    setState('Verifying');
    const turnstileToken = (document.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value ?? '';
    const response = await fetch(`/api/v1/auth/${mode}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, name, termsAccepted: accepted, turnstileToken })
    });
    if (response.status === 429) return setState('Please wait before requesting another link');
    if (response.status === 503) return setState('Sign-in is temporarily unavailable');
    if (!response.ok) return setState('Check the details and try again');
    setState('Link sent');
    setMessage('Check your email for the private sign-in link.');
  }

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
          <p className="eyebrow">{mode === 'login' ? 'YOUR WORKSPACE' : 'START WITH YOUR BASELINE'}</p>
          <h1>
            {mode === 'signup'
              ? 'Understand your life in context.'
              : mode === 'redeem'
                ? 'Opening Sovereign.OS.'
                : 'Welcome back.'}
          </h1>
          <p className="lede">
            {mode === 'signup'
              ? 'Create your account, then build a starting map for decisions, relationships, and the groups around you.'
              : mode === 'redeem'
                ? 'Your workspace will open in a moment.'
                : 'Return to Today, your conversations, and the insights you chose to save.'}
          </p>
          {mode !== 'redeem' && (
            <ul className="account-points">
              <li>Work through a decision with your own patterns in view</li>
              <li>Prepare for a difficult conversation without guessing motives</li>
              <li>See how roles and responsibility shape a family or team</li>
            </ul>
          )}
        </section>

        <section className="auth-panel">
          <p className="eyebrow">{mode === 'signup' ? 'START FREE' : mode === 'redeem' ? 'OPENING' : 'SIGN IN'}</p>
          <h2>{mode === 'signup' ? 'Create your account.' : mode === 'redeem' ? 'One moment.' : 'Open your workspace.'}</h2>
          <p className="auth-explainer">
            {mode === 'signup'
              ? 'Create your account, choose Free or Sovereign+, then enter your private workspace.'
              : mode === 'redeem'
                ? 'This should take only a moment.'
                : 'Enter your email and we will send the link that opens your workspace.'}
          </p>
          {mode !== 'redeem' && (
            <form onSubmit={submit} className="form-stack">
              {mode === 'signup' && (
                <Field label="Your name">
                  <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                </Field>
              )}
              <Field label="Email address">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </Field>
              {mode === 'signup' && (
                <label className="check-line">
                  <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                  <span>I accept the Terms and Privacy Policy.</span>
                </label>
              )}
              <div
                className="turnstile-slot"
                data-sitekey={(window as any).__TURNSTILE_SITE_KEY__ ?? 'configured-at-runtime'}
                data-action={mode}
              >
                Protected by Cloudflare Turnstile
              </div>
              <button className="primary-button">
                {mode === 'signup' ? 'Create account' : 'Email my sign-in link'}
              </button>
            </form>
          )}
          <div className="status-note" aria-live="polite">
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
            <button className="primary-button" disabled={!completed} onClick={() => location.assign('/app')}>Open my workspace</button>
          </section>
        )}
      </section>
    </main>
  );
}

function scopeLabel(scope: string): string {
  return consentScopes.find(([value]) => value === scope)?.[1] ?? scope;
}

function scopeDescription(scope: string): string {
  return consentScopeDescriptions[scope] ?? 'Use only the context covered by this permission.';
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
