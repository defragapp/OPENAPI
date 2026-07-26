import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { sharePublicPlatform } from './ProductionRuntime';

type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';
type ApiState = 'idle' | 'loading' | 'ready' | 'error' | 'permission-denied' | 'consent-required' | 'degraded';
type ApiCall = (path: string, init?: RequestInit) => Promise<any>;
type ConsentDecision = 'granted' | 'denied';

const surfaces: Surface[] = ['Today', 'Explore', 'People', 'Systems', 'Library', 'You'];
const surfaceCopy: Record<Surface, string> = {
  Today: 'Your steady patterns, current pressure, and what only you can confirm',
  Explore: 'Use your Baseline to work through one real question',
  People: 'Understand a relationship with both people’s permission',
  Systems: 'See how roles, authority, and responsibility shape a group',
  Library: 'Return to insights you chose to save',
  You: 'Build your Baseline and manage your account'
};
const composerGuidance: Record<Surface, string> = {
  Today: 'What decision, reaction, or pressure is in front of you?',
  Explore: 'What part of your life would you like to understand more clearly?',
  People: 'What are you trying to understand about this interaction?',
  Systems: 'What feels unclear about this family, household, or team?',
  Library: 'What would you like to understand next?',
  You: 'What would you like Sovereign to help you understand?'
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
const ownerSelectableScopes = consentScopes.filter(([scope]) => scope !== 'framework.display');
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
  if (path === '/' || path === '/privacy' || path === '/terms') return <PublicPage path={path} />;
  return <Workspace />;
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
    setState('Signed in');
    setMessage('Opening Sovereign.OS.');
    setTimeout(() => location.assign('/app'), 300);
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
              ? 'Enter your name and email to begin.'
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
                Continue
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

function Workspace() {
  const [surface, setSurface] = useState<Surface>('Today');
  const [message, setMessage] = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [status, setStatus] = useState('Choose where you want to begin, or ask Sovereign below.');
  const [apiState, setApiState] = useState<ApiState>('idle');
  const [people, setPeople] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [covenantEnabled, setCovenantEnabled] = useState(false);

  const threadId = useMemo(
    () => ['thread', surface.toLowerCase(), selectedPerson || 'self', selectedSystem || 'personal'].join('-').replace(/[^a-z0-9_-]/gi, '-'),
    [surface, selectedPerson, selectedSystem]
  );
  const contextLabel = useMemo(
    () => [
      surface,
      people.find((person) => person.id === selectedPerson)?.displayName,
      systems.find((system) => system.id === selectedSystem)?.name
    ].filter(Boolean).join(' · '),
    [surface, selectedPerson, selectedSystem, people, systems]
  );

  async function api(path: string, init: RequestInit = {}) {
    setApiState('loading');
    const response = await fetch(path, {
      ...init,
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': crypto.randomUUID(),
        ...(init.headers ?? {})
      }
    });
    if (response.status === 403) {
      setApiState('consent-required');
      throw new Error('This feature needs permission from the other person or a Sovereign+ plan.');
    }
    if (response.status === 401) {
      setApiState('permission-denied');
      throw new Error('Please sign in again.');
    }
    if (!response.ok) {
      const problem = await response.json().catch(() => ({})) as { message?: string; error?: string };
      setApiState(response.status >= 500 ? 'degraded' : 'error');
      throw new Error(problem.message || problem.error || 'The service could not complete that request safely.');
    }
    const data = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.text();
    setApiState('ready');
    return data;
  }

  async function refresh() {
    try {
      const [peopleData, systemsData, libraryData] = await Promise.all([
        api('/api/v1/people'),
        api('/api/v1/systems'),
        api('/api/v1/library')
      ]);
      setPeople(peopleData.people ?? []);
      setSystems(systemsData.systems ?? []);
      setLibrary(libraryData.understandings ?? []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Some private records are unavailable.');
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || apiState === 'loading') return;
    setStatus('Sovereign is using the context available for this question.');
    setStreamedText('');
    try {
      const response = await fetch(`/api/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-idempotency-key': crypto.randomUUID() },
        body: JSON.stringify({
          message: clean,
          context: {
            surface,
            personId: selectedPerson || undefined,
            systemId: selectedSystem || undefined,
            covenantEnabled
          }
        })
      });
      if (!response.ok || !response.body) {
        const problem = await response.json().catch(() => ({})) as { message?: string; error?: string };
        throw new Error(problem.message || problem.error || 'Sovereign is temporarily unavailable.');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setStreamedText(text);
      }
      setApiState('ready');
      setStatus('Answer complete. Save it only if you want to return to it.');
      setMessage('');
    } catch (error) {
      setApiState('degraded');
      setStatus(error instanceof Error ? error.message : 'Sovereign could not complete this response.');
    }
  }

  async function saveCorrection(correction: 'yes' | 'partly' | 'not_today') {
    await api(`/api/v1/threads/${threadId}/corrections`, { method: 'POST', body: JSON.stringify({ correction }) });
    setStatus(`Marked “${correction.replace('_', ' ')}” for this conversation. Your Baseline remains unchanged.`);
  }

  async function saveToLibrary(title = `${surface} understanding`, summary = streamedText) {
    if (!summary.trim()) {
      setStatus('There is nothing to save yet.');
      return;
    }
    await api('/api/v1/library', {
      method: 'POST',
      body: JSON.stringify({
        title,
        summary,
        threadId,
        links: { personId: selectedPerson, systemId: selectedSystem },
        uncertainty: 'visible'
      })
    });
    await refresh();
    setStatus('Saved to your Library.');
  }

  return (
    <div className="app-shell">
      <aside className="side-rail" aria-label="Primary navigation">
        <button className="brand-button" onClick={() => setSurface('Today')} aria-label="Open Today">SO</button>
        <nav>
          {surfaces.map((item) => (
            <button key={item} className={surface === item ? 'active' : ''} onClick={() => setSurface(item)}>
              <span>{item.slice(0, 1)}</span>{item}
            </button>
          ))}
        </nav>
        <p>Private workspace</p>
      </aside>

      <div className="workspace-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">SOVEREIGN.OS</p>
            <h1>{surface}</h1>
            <p className="surface-description">{surfaceCopy[surface]}</p>
            <p className="context-line">{contextLabel || 'Self'}</p>
          </div>
          <div className="topbar-actions">
            <span className={`api-indicator ${apiState}`}>{workspaceStatusLabel(apiState)}</span>
            <button className="profile-button" onClick={() => setSurface('You')}>Baseline & account</button>
          </div>
        </header>

        <main className="surface-main">
          {surface === 'Today' && <TodaySurface api={api} onCorrection={saveCorrection} onOpenBaseline={() => setSurface('You')} />}
          {surface === 'Explore' && <ExploreSurface api={api} saveToLibrary={saveToLibrary} />}
          {surface === 'People' && (
            <PeopleSurface
              api={api}
              people={people}
              setPeople={setPeople}
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              refresh={refresh}
            />
          )}
          {surface === 'Systems' && (
            <SystemsSurface
              api={api}
              systems={systems}
              people={people}
              setSystems={setSystems}
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              selectedSystem={selectedSystem}
              setSelectedSystem={setSelectedSystem}
            />
          )}
          {surface === 'Library' && <LibrarySurface library={library} api={api} refresh={refresh} />}
          {surface === 'You' && (
            <YouSurface
              api={api}
              threadId={threadId}
              covenantEnabled={covenantEnabled}
              setCovenantEnabled={setCovenantEnabled}
            />
          )}

          <section className={`result-panel ${streamedText ? 'has-result' : ''}`} aria-live="polite">
            <div>
              <p className="eyebrow">SOVEREIGN</p>
              <h2>{streamedText ? 'A clearer view.' : 'Start with one real question.'}</h2>
            </div>
            <p className="result-status">{status}</p>
            {streamedText && <div className="streamed-copy">{streamedText}</div>}
          </section>
        </main>

        <form className="composer" onSubmit={submit}>
          <div className="composer-heading">
            <label htmlFor="sovereign-message">Ask Sovereign</label>
            <span>{composerGuidance[surface]}</span>
          </div>
          <textarea
            id="sovereign-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
          />
          <div className="composer-actions">
            <button type="button" className="quiet-button" onClick={() => { setStreamedText(''); setStatus('Cleared from this screen.'); }}>Clear</button>
            <button className="send-button" disabled={apiState === 'loading'}>Send</button>
          </div>
        </form>
      </div>

      <nav className="tabbar" aria-label="Primary navigation">
        {surfaces.map((item) => (
          <button key={item} className={surface === item ? 'active' : ''} onClick={() => setSurface(item)}>{item}</button>
        ))}
      </nav>
    </div>
  );
}

function TodaySurface({
  api,
  onCorrection,
  onOpenBaseline
}: {
  api: ApiCall;
  onCorrection: (value: 'yes' | 'partly' | 'not_today') => void;
  onOpenBaseline: () => void;
}) {
  const [today, setToday] = useState<any>(null);

  useEffect(() => {
    api('/api/v1/today').then((data) => setToday(data.today)).catch(() => setToday(null));
  }, []);

  const baseline = today?.baseline;
  const current = today?.current;
  const baselineReady = baseline?.status === 'completed' || baseline?.status === 'partial';
  const baselineTendency = readableText(
    baseline?.reducedContext?.baselineTendency,
    baselineReady
      ? 'Your Baseline is ready. Ask Sovereign about a real situation to use it.'
      : 'Build your Baseline to give Sovereign a consistent starting point.'
  );
  const currentAmplification = readableText(
    current?.reduced?.possibleCurrentAmplification,
    current?.status === 'ready'
      ? 'Temporary current context is available.'
      : 'No current-condition context is active.'
  );
  const knownObservation = readableText(
    current?.reduced?.knownObservation,
    'Nothing about today is treated as fact until you confirm it.'
  );
  const unknownState = readableText(
    current?.reduced?.unknownActualState,
    'Your actual experience remains yours to name.'
  );

  return (
    <section className="stack">
      <article className="hero-card">
        <div className="hero-card-heading">
          <p className="eyebrow">TODAY</p>
          <h2>Your context for today.</h2>
          <p className="lede">Start with what tends to be steady. Add what may be louder now. You confirm what is true.</p>
          {!baselineReady && <button className="primary-button compact-button" onClick={onOpenBaseline}>Build my Baseline</button>}
        </div>
        <div className="state-grid">
          <State label="Your Baseline" value={baselineTendency} tone={baselineReady ? 'ready' : 'quiet'} />
          <State label="What may be louder now" value={currentAmplification} tone={current?.status === 'ready' ? 'ready' : 'quiet'} />
          <State label="What you confirmed" value={knownObservation} tone="known" />
          <State label="What remains unknown" value={unknownState} tone="unknown" />
        </div>
      </article>
      <article className="check-card">
        <div><p className="eyebrow">CHECK THE FIT</p><h3>Does this fit today?</h3><p>Your answer helps this conversation stay grounded in your experience.</p></div>
        <div className="choice-row">
          <button onClick={() => onCorrection('yes')}>Fits</button>
          <button onClick={() => onCorrection('partly')}>Partly</button>
          <button onClick={() => onCorrection('not_today')}>Not today</button>
        </div>
      </article>
    </section>
  );
}

function ExploreSurface({ api, saveToLibrary }: { api: ApiCall; saveToLibrary: (title?: string, summary?: string) => Promise<void> }) {
  const [topic, setTopic] = useState('identity');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');

  async function explore() {
    const data = await api('/api/v1/explore', { method: 'POST', body: JSON.stringify({ topic: question || topic }) });
    setResult(data.plainLanguage ?? '');
  }

  return (
    <SurfaceCard eyebrow="EXPLORE" title="Work through one real question." intro="Choose an area and name what feels difficult or unclear. Sovereign will use your Baseline as a starting point, not a verdict.">
      <div className="form-grid">
        <Field label="Area of focus">
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            {['identity', 'decisions', 'communication', 'learning', 'love', 'expression', 'pressure response'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="What are you trying to understand?"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} /></Field>
        <p className="field-example">Example: Why does this decision feel harder than it should?</p>
      </div>
      <div className="action-row">
        <button className="primary-button" onClick={explore}>Explore this</button>
        <button className="secondary-button" disabled={!result} onClick={() => saveToLibrary(`Explore: ${topic}`, result)}>Save this understanding</button>
      </div>
      {result && <div className="inline-result">{result}</div>}
      <details><summary>How Sovereign uses context</summary><p>Your Baseline, the current moment, facts you provide, and anything still unknown remain distinct.</p></details>
    </SurfaceCard>
  );
}

function PeopleSurface({ api, people, setPeople, selectedPerson, setSelectedPerson, refresh }: any) {
  const [personName, setPersonName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [requestedScopes, setRequestedScopes] = useState<string[]>(['pair.compare', 'trait.display']);
  const [notice, setNotice] = useState('');
  const selected = people.find((person: any) => person.id === selectedPerson);

  async function create() {
    if (!personName.trim()) return;
    const data = await api('/api/v1/people', {
      method: 'POST',
      body: JSON.stringify({ displayName: personName, role: 'relationship', metadata: { source: 'private-owner-entry' } })
    });
    setPeople([...people, data.person]);
    setSelectedPerson(data.person.id);
    setPersonName('');
  }

  async function invite() {
    if (!selectedPerson || !inviteEmail.includes('@') || requestedScopes.length === 0) {
      setNotice('Choose a person, enter their email, and select at least one specific use.');
      return;
    }
    const data = await api(`/api/v1/people/${selectedPerson}/invitations/send`, {
      method: 'POST',
      body: JSON.stringify({ email: inviteEmail, requestedScopes })
    });
    setNotice(`Private invitation sent. It expires in ${data.invitation.expiresInDays} days.`);
    setInviteEmail('');
    await refresh();
  }

  function toggleScope(scope: string) {
    setRequestedScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  }

  return (
    <SurfaceCard eyebrow="PEOPLE" title="Understand the relationship—not just the latest moment." intro="Start with what you know about the interaction. If the other person joins, Sovereign can compare both perspectives using only what each of you agrees to share.">
      <ol className="surface-steps" aria-label="How relationship context works">
        <li><span>1</span><strong>Add the person</strong><small>Private to your workspace</small></li>
        <li><span>2</span><strong>Invite them</strong><small>They review each requested use</small></li>
        <li><span>3</span><strong>Explore together</strong><small>See where your perspectives differ</small></li>
      </ol>
      <div className="split-grid">
        <section className="control-group">
          <h3>1. Add someone privately</h3>
          <p>Naming a person here does not create a Baseline for them or imply their consent.</p>
          <Field label="Person’s name"><input value={personName} onChange={(event) => setPersonName(event.target.value)} /></Field>
          <button className="primary-button" onClick={create}>Add to my workspace</button>
        </section>
        <section className="control-group">
          <h3>2. Choose the relationship</h3>
          <Field label="Choose a person">
            <select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}>
              <option value="">No person selected</option>
              {people.map((person: any) => <option key={person.id} value={person.id}>{person.displayName}</option>)}
            </select>
          </Field>
          {selected && (
            <div className="usage-card">
              <div><span>Invitation</span><strong>{humanizeStatus(selected.invitationStatus ?? 'not sent')}</strong></div>
              <div><span>Connected account</span><strong>{selected.identityBound ? 'Verified' : 'Not connected'}</strong></div>
              <div><span>Shared Baseline</span><strong>{humanizeStatus(selected.baselineStatus ?? 'not available')}</strong></div>
            </div>
          )}
        </section>
      </div>

      <section className="scope-panel">
        <div><p className="eyebrow">REQUEST SPECIFIC PERMISSION</p><h3>Choose only what this relationship needs.</h3><p>These choices are shown to the invited person in ordinary language. They may allow or decline each one.</p></div>
        <Field label="Their email address"><input type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} /></Field>
        <div className="scope-list">
          {ownerSelectableScopes.map(([scope, label]) => (
            <label key={scope}>
              <span><strong>{label}</strong><small>{scopeDescription(scope)}</small></span>
              <input type="checkbox" checked={requestedScopes.includes(scope)} onChange={() => toggleScope(scope)} />
            </label>
          ))}
        </div>
        <button className="secondary-button" disabled={!selectedPerson} onClick={invite}>Send private invitation</button>
        {notice && <p className="result-status" aria-live="polite">{notice}</p>}
      </section>

      <button className="primary-button" disabled={!selectedPerson || !selected?.identityBound} onClick={() => api(`/api/v1/people/${selectedPerson}/compare`, { method: 'POST' })}>Compare our permitted context</button>
    </SurfaceCard>
  );
}

function SystemsSurface({ api, systems, people, setSystems, selectedPerson, setSelectedPerson, selectedSystem, setSelectedSystem }: any) {
  const [systemName, setSystemName] = useState('');
  const [systemType, setSystemType] = useState('family');
  const eligiblePeople = people.filter((person: any) => person.identityBound);

  async function create() {
    if (!systemName.trim()) return;
    const data = await api('/api/v1/systems', {
      method: 'POST',
      body: JSON.stringify({ name: systemName, systemType, metadata: { objective: 'shared clarity' } })
    });
    setSystems([...systems, data.system]);
    setSelectedSystem(data.system.id);
    setSystemName('');
  }

  return (
    <SurfaceCard eyebrow="SYSTEMS" title="See the structure around the group." intro="A family, household, friendship, or team is more than a set of personalities. Add roles, authority, responsibility, dependence, and shared goals to see what the situation may actually require.">
      <div className="split-grid">
        <section className="control-group">
          <h3>1. Name the group</h3>
          <Field label="System name"><input value={systemName} onChange={(event) => setSystemName(event.target.value)} /></Field>
          <Field label="System type">
            <select value={systemType} onChange={(event) => setSystemType(event.target.value)}>
              {['family', 'household', 'friendship_group', 'team', 'workplace', 'custom'].map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
            </select>
          </Field>
          <button className="primary-button" onClick={create}>Create this group</button>
        </section>
        <section className="control-group">
          <h3>2. Add permitted people</h3>
          <Field label="Selected system">
            <select value={selectedSystem} onChange={(event) => setSelectedSystem(event.target.value)}>
              <option value="">No system selected</option>
              {systems.map((system: any) => <option key={system.id} value={system.id}>{system.name}</option>)}
            </select>
          </Field>
          <Field label="Person with an active connection">
            <select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}>
              <option value="">No person selected</option>
              {eligiblePeople.map((person: any) => <option key={person.id} value={person.id}>{person.displayName}</option>)}
            </select>
          </Field>
          <button className="secondary-button" disabled={!selectedSystem || !selectedPerson} onClick={() => api(`/api/v1/systems/${selectedSystem}/members`, { method: 'POST', body: JSON.stringify({ personId: selectedPerson, metadata: { formalRole: 'member', authority: 'none assumed', responsibility: 'shared objective', constraints: [] } }) })}>Add permitted person</button>
        </section>
      </div>
      <div className="system-explainer">
        <strong>What Sovereign can help you see</strong>
        <p>Interaction patterns, role conflicts, responsibility boundaries, missing information, and one grounded next step—without pretending to know anyone’s private motives.</p>
      </div>
      <button className="primary-button" disabled={!selectedSystem} onClick={() => api(`/api/v1/systems/${selectedSystem}/alignment`)}>Review this group</button>
    </SurfaceCard>
  );
}

function LibrarySurface({ library, api, refresh }: any) {
  return (
    <SurfaceCard eyebrow="LIBRARY" title="Return to what was worth keeping." intro="Save an answer when it changes how you see a decision, relationship, or recurring pattern. It will return here with the context that made it useful.">
      <div className="library-toolbar">
        <p>Your Library is a collection of chosen insights, not a feed of every conversation.</p>
        <button className="secondary-button" onClick={refresh}>Refresh</button>
      </div>
      <div className="library-grid">
        {library.length === 0 && (
          <div className="empty-library">
            <strong>No saved understandings yet.</strong>
            <p>When an answer is worth returning to, choose “Save this understanding.” It will appear here with its original context.</p>
          </div>
        )}
        {library.map((item: any) => (
          <article className="library-item" key={item.id}>
            <div><strong>{item.body?.title}</strong><p>{item.body?.summary}</p></div>
            <button className="quiet-button" onClick={() => api(`/api/v1/library/${item.id}`, { method: 'DELETE' }).then(refresh)}>Remove</button>
          </article>
        ))}
      </div>
    </SurfaceCard>
  );
}

function YouSurface({ api, threadId, covenantEnabled, setCovenantEnabled }: any) {
  const [locationPrecision, setLocationPrecision] = useState('city_or_regional');
  const [birthTimeCertainty, setBirthTimeCertainty] = useState('unknown');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [billing, setBilling] = useState<any>(null);

  useEffect(() => {
    api('/api/v1/billing/entitlements').then(setBilling).catch(() => setBilling(null));
  }, []);

  async function openHandoff(path: string, body?: unknown) {
    const data = await api(path, { method: 'POST', body: JSON.stringify(body ?? {}) });
    const url = data.checkout?.url ?? data.portal?.url;
    if (url) location.assign(url);
  }

  return (
    <section className="you-grid">
      <SurfaceCard eyebrow="YOUR BASELINE" title="Build your starting map." intro="Your Baseline translates selected symbolic frameworks into practical themes for decisions, communication, connection, learning, expression, and pressure. Treat it as material for reflection—not a fixed label.">
        <div className="baseline-boundary">
          <div><span>YOU PROVIDE</span><p>Birth date, birthplace, birthplace timezone, and birth time if known.</p></div>
          <div><span>SOVEREIGN USES</span><p>Reduced reflection themes—not your raw birth details or exact private location.</p></div>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void api('/api/v1/baseline/onboarding', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) });
          }}
          className="form-grid"
        >
          <Field label="Birth date"><input type="date" name="birthDate" /></Field>
          <Field label="Birthplace (city, region, country)"><input name="birthplace" /></Field>
          <Field label="Birth-time certainty">
            <select name="birthTimeCertainty" value={birthTimeCertainty} onChange={(event) => setBirthTimeCertainty(event.target.value)}>
              <option value="exact">Exact</option>
              <option value="approximate">Approximate</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>
          {birthTimeCertainty !== 'unknown' && <Field label="Birth time"><input type="time" name="birthTime" /></Field>}
          <Field label="Location precision">
            <select name="locationPrecision" value={locationPrecision} onChange={(event) => setLocationPrecision(event.target.value)}>
              <option value="none">None</option>
              <option value="approximate">Approximate</option>
              <option value="city_or_regional">City or regional</option>
              <option value="ephemeral_current">Use once</option>
              <option value="stored_permitted">Store with permission</option>
            </select>
          </Field>
          <button className="primary-button">Build my Baseline</button>
        </form>
      </SurfaceCard>

      <SurfaceCard eyebrow="PLAN & USAGE" title="Choose the depth you need." intro="Free includes the complete personal Baseline experience. Sovereign+ adds more conversations, permission-based relationship comparisons, group views, and saved continuity.">
        <div className="usage-card">
          <div><span>Current plan</span><strong>{billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free'}</strong></div>
          <div><span>Sovereign responses this month</span><strong>{billing?.aiUsage ? `${billing.aiUsage.used} / ${billing.aiUsage.allowance}` : 'Loading'}</strong></div>
          <p>{billing?.aiUsage?.resetsAt ? `Resets ${new Date(billing.aiUsage.resetsAt).toLocaleDateString()}` : 'Loading your renewal date.'}</p>
        </div>
        <Field label="Sovereign+ billing">
          <select value={billingInterval} onChange={(event) => setBillingInterval(event.target.value as 'monthly' | 'annual')}>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </Field>
        <div className="action-row">
          <button className="primary-button" onClick={() => openHandoff('/api/v1/billing/checkout', { interval: billingInterval })}>Choose Sovereign+</button>
          <button className="secondary-button" onClick={() => openHandoff('/api/v1/billing/portal')}>Manage billing</button>
        </div>
      </SurfaceCard>

      <SurfaceCard eyebrow="PRIVACY & CONTROL" title="Your workspace, under your control." intro="Manage sharing, the optional Scripture lens, account access, and deletion from one place.">
        <div className="settings-list">
          <div><span><strong>Share</strong><small>Share the public Sovereign.OS link. No private workspace data is included.</small></span><button type="button" onClick={() => void sharePublicPlatform()}>Share</button></div>
          <div><span><strong>Delete account</strong><small>Begin a grace period you can cancel before deletion runs.</small></span><button onClick={() => api('/api/v1/deletion-jobs', { method: 'POST' })}>Begin deletion</button></div>
          <label><span><strong>Covenant</strong><small>Optional Scripture lens. Off unless you enable it for this thread.</small></span><input type="checkbox" checked={covenantEnabled} onChange={(event) => setCovenantEnabled(event.target.checked)} /></label>
        </div>
        <button className="secondary-button" onClick={() => api(`/api/v1/threads/${threadId}/covenant`, { method: 'POST', body: JSON.stringify({ enabled: covenantEnabled, bibleTranslation: covenantEnabled ? 'WEB' : undefined, reference: 'James 1:5', subject: 'this question' }) })}>Save Covenant choice for this thread</button>
        <div className="action-row">
          <button className="quiet-button" onClick={() => api('/api/v1/auth/logout', { method: 'POST' })}>Log out</button>
          <button className="quiet-button" onClick={() => api('/api/v1/auth/logout-all', { method: 'POST' })}>Log out everywhere</button>
        </div>
      </SurfaceCard>
    </section>
  );
}

function PublicPage({ path }: { path: string }) {
  if (path === '/privacy' || path === '/terms') {
    return (
      <main className="policy-shell">
        <a className="wordmark" href="/">SOVEREIGN.OS</a>
        <p className="eyebrow">{path === '/privacy' ? 'PRIVACY' : 'TERMS'}</p>
        <h1>{path === '/privacy' ? 'Your private context stays yours.' : 'Clear terms for a private workspace.'}</h1>
        <Policy kind={path === '/privacy' ? 'privacy' : 'terms'} />
      </main>
    );
  }
  return (
    <main className="entry-shell">
      <a className="wordmark" href="/">SOVEREIGN.OS</a>
      <section>
        <p className="eyebrow">PERSONAL · RELATIONAL · SYSTEM INTELLIGENCE</p>
        <h1>Understand your life in context.</h1>
        <p className="lede">Build your Baseline, then use it to understand decisions, relationships, and the groups around you.</p>
        <div className="action-row">
          <a className="primary-button" href="/signup">Build my Baseline</a>
          <a className="secondary-button" href="/login">Sign in</a>
        </div>
      </section>
      <p className="entry-note">Start with yourself. Add people and systems when the question needs them.</p>
    </main>
  );
}

function Policy({ kind }: { kind: 'privacy' | 'terms' }) {
  return (
    <section className="policy-copy">
      {kind === 'privacy' ? (
        <>
          <p>We process account details, Baseline themes, location-precision choices, permission decisions, subscription status, and deletion requests only to operate Sovereign.OS.</p>
          <p>Unsaved thread content and complete AI responses are scheduled for deletion after 30 days. Minimal security and operational metadata that does not contain conversation content is retained for up to 90 days. Understandings you explicitly save remain until you delete them or close the account.</p>
          <p>Raw birth inputs and exact private location are not sent to the language model or another invited account. Contact: support@defrag.app.</p>
        </>
      ) : (
        <>
          <p>Sovereign.OS is non-diagnostic software and does not establish another person’s motive, mental state, future behavior, or God’s exact intent. You remain responsible for decisions and professional support where appropriate.</p>
          <p>Free includes 10 Sovereign responses per UTC calendar month. Sovereign+ subscriptions are managed through Stripe. Another person must connect their own account and choose each permitted use separately.</p>
          <p>Covenant is an explicit optional Scripture lens. It does not automatically require contact, estrangement, reconciliation, forgiveness, submission, or continued exposure to harm. Contact: support@defrag.app.</p>
        </>
      )}
    </section>
  );
}

function scopeLabel(scope: string): string {
  return consentScopes.find(([value]) => value === scope)?.[1] ?? scope;
}

function scopeDescription(scope: string): string {
  return consentScopeDescriptions[scope] ?? 'Use only the context covered by this permission.';
}

function readableText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function humanizeStatus(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return 'Not available';
  const text = value.replace(/[._-]+/g, ' ').trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function workspaceStatusLabel(state: ApiState): string {
  if (state === 'loading') return 'Working';
  if (state === 'ready') return 'Connected';
  if (state === 'permission-denied') return 'Sign-in needed';
  if (state === 'consent-required') return 'Permission needed';
  if (state === 'degraded') return 'Temporarily unavailable';
  if (state === 'error') return 'Needs attention';
  return 'Private workspace';
}

function SurfaceCard({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section className="surface-card">
      <header><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="lede">{intro}</p></header>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function State({ label, value, tone }: { label: string; value: string; tone: 'ready' | 'quiet' | 'known' | 'unknown' }) {
  return <div className={`state-card ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}
