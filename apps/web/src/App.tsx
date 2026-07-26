import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { sharePublicPlatform } from './ProductionRuntime';

type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';
type ApiState = 'idle' | 'loading' | 'ready' | 'error' | 'permission-denied' | 'consent-required' | 'degraded';
type ApiCall = (path: string, init?: RequestInit) => Promise<any>;
type ConsentDecision = 'granted' | 'denied';

const surfaces: Surface[] = ['Today', 'Explore', 'People', 'Systems', 'Library', 'You'];
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
    setMessage('Opening your private workspace.');
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
    setMessage('If this address can receive Sovereign.OS mail, a private sign-in link is on its way.');
  }

  return (
    <main className="account-shell">
      <a className="wordmark" href="/">SOVEREIGN.OS</a>
      <section className="auth-panel">
        <p className="eyebrow">{mode === 'signup' ? 'PRIVATE ONBOARDING' : 'PRIVATE ACCESS'}</p>
        <h1>{mode === 'signup' ? 'Begin with who you already are.' : mode === 'redeem' ? 'Opening your workspace.' : 'Return to yourself.'}</h1>
        <p className="lede">No password. One private link. We never reveal whether an account already exists.</p>
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
            <button className="primary-button">Send private link</button>
          </form>
        )}
        <div className="status-note" aria-live="polite">
          <span>{state}</span>
          {message && <p>{message}</p>}
        </div>
      </section>
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
    setState('Binding this invitation to your private account.');
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
    setState('Your identity is verified. Decide each permission separately.');
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
        <h1>You decide what may be shared.</h1>
        <p className="lede">An invitation never gives another person blanket access to you. Each requested use is separate and revocable.</p>
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
                {requestedScopes.map((scope) => <div key={scope}><span><strong>{scopeLabel(scope)}</strong><small>{scope}</small></span></div>)}
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
  const [status, setStatus] = useState('Your private context is fetched only from authenticated services.');
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
      throw new Error('Consent or a Sovereign+ entitlement is required.');
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
    setStatus('Sovereign is responding. Hidden reasoning is never shown.');
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
      setStatus('Turn complete. Save only what you choose to keep.');
      setMessage('');
    } catch (error) {
      setApiState('degraded');
      setStatus(error instanceof Error ? error.message : 'Nothing was guessed or saved as interpretation.');
    }
  }

  async function saveCorrection(correction: 'yes' | 'partly' | 'not_today') {
    await api(`/api/v1/threads/${threadId}/corrections`, { method: 'POST', body: JSON.stringify({ correction }) });
    setStatus(`Saved as “${correction.replace('_', ' ')}” for this thread. Your enduring Baseline was not rewritten.`);
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
    setStatus('Saved to Library with its context and uncertainty intact.');
  }

  return (
    <div className="app-shell">
      <aside className="side-rail" aria-label="Primary navigation">
        <button className="brand-button" onClick={() => setSurface('Today')} aria-label="Open Today">S</button>
        <nav>
          {surfaces.map((item) => (
            <button key={item} className={surface === item ? 'active' : ''} onClick={() => setSurface(item)}>
              <span>{item.slice(0, 1)}</span>{item}
            </button>
          ))}
        </nav>
        <p>Private by design</p>
      </aside>

      <div className="workspace-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">SOVEREIGN.OS · {apiState.toUpperCase()}</p>
            <h1>{surface}</h1>
            <p className="context-line">{contextLabel || 'Today · Self'}</p>
          </div>
          <button className="profile-button" onClick={() => setSurface('You')}>Your settings</button>
        </header>

        <main className="surface-main">
          {surface === 'Today' && <TodaySurface api={api} onCorrection={saveCorrection} />}
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
          {surface === 'Library' && <LibrarySurface library={library} api={api} saveToLibrary={saveToLibrary} refresh={refresh} />}
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
              <p className="eyebrow">SOVEREIGN RESPONSE</p>
              <h2>{streamedText ? 'A clearer view.' : 'Ready when you are.'}</h2>
            </div>
            <p className="result-status">{status}</p>
            {streamedText && <div className="streamed-copy">{streamedText}</div>}
          </section>
        </main>

        <form className="composer" onSubmit={submit}>
          <label htmlFor="sovereign-message">Ask Sovereign</label>
          <textarea id="sovereign-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={2} />
          <div className="composer-actions">
            <button type="button" className="quiet-button" onClick={() => { setStreamedText(''); setStatus('Cleared from this view.'); }}>Clear</button>
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

function TodaySurface({ api, onCorrection }: { api: ApiCall; onCorrection: (value: 'yes' | 'partly' | 'not_today') => void }) {
  const [today, setToday] = useState<any>(null);

  useEffect(() => {
    api('/api/v1/today').then((data) => setToday(data.today)).catch(() => setToday(null));
  }, []);

  const baseline = today?.baseline;
  const current = today?.current;
  return (
    <section className="stack">
      <article className="hero-card">
        <p className="eyebrow">TODAY · BEFORE THE STORY</p>
        <h2>Start with what is steady.</h2>
        <p className="lede">Current conditions may make something louder. They do not decide what you feel, mean, or do.</p>
        <div className="state-grid">
          <State label="Baseline tendency" value={baseline?.status === 'completed' ? 'Your reduced Baseline is ready.' : 'Not set up yet. No personal tendency is being assumed.'} tone={baseline?.status === 'completed' ? 'ready' : 'quiet'} />
          <State label="Current amplification" value={current?.status === 'ready' ? 'A permitted current-condition reading is available.' : 'No verified current condition is active.'} tone={current?.status === 'ready' ? 'ready' : 'quiet'} />
          <State label="Known observation" value="Nothing about today is treated as fact until you confirm it." tone="known" />
          <State label="Unknown actual state" value="Your actual experience remains yours to name." tone="unknown" />
        </div>
      </article>
      <article className="check-card">
        <div><p className="eyebrow">YOUR CORRECTION MATTERS</p><h3>Does this match today?</h3></div>
        <div className="choice-row">
          <button onClick={() => onCorrection('yes')}>Yes</button>
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
    <SurfaceCard eyebrow="EXPLORE" title="A map, never a label." intro="Choose a part of life to understand through Baseline, current context, what you have observed, and what remains unknown.">
      <div className="form-grid">
        <Field label="Area of focus">
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            {['identity', 'decisions', 'communication', 'learning', 'love', 'expression', 'pressure response'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="What do you want clearer?"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} /></Field>
      </div>
      <div className="action-row">
        <button className="primary-button" onClick={explore}>Explore this</button>
        <button className="secondary-button" onClick={() => saveToLibrary(`Explore: ${topic}`, result)}>Save understanding</button>
      </div>
      {result && <div className="inline-result">{result}</div>}
      <details><summary>How this stays grounded</summary><p>Baseline, current amplification, observed behavior, and unknown actual state remain visibly separate.</p></details>
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
    <SurfaceCard eyebrow="PEOPLE" title="Private entry is not consent." intro="Add someone to your own workspace, then invite them to decide exactly which reduced context may be used.">
      <div className="split-grid">
        <section className="control-group">
          <h3>Add private context</h3>
          <Field label="Person’s name"><input value={personName} onChange={(event) => setPersonName(event.target.value)} /></Field>
          <button className="primary-button" onClick={create}>Create private person</button>
        </section>
        <section className="control-group">
          <h3>Selected person</h3>
          <Field label="Choose a person">
            <select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}>
              <option value="">No person selected</option>
              {people.map((person: any) => <option key={person.id} value={person.id}>{person.displayName}</option>)}
            </select>
          </Field>
          {selected && (
            <div className="usage-card">
              <div><span>Invitation</span><strong>{selected.invitationStatus ?? 'not sent'}</strong></div>
              <div><span>Identity</span><strong>{selected.identityBound ? 'verified' : 'not bound'}</strong></div>
              <div><span>Baseline</span><strong>{selected.baselineStatus}</strong></div>
            </div>
          )}
        </section>
      </div>

      <section className="scope-panel">
        <div><p className="eyebrow">INVITE FOR SPECIFIC CONSENT</p><h3>No blanket access.</h3></div>
        <Field label="Their email address"><input type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} /></Field>
        <div className="scope-list">
          {ownerSelectableScopes.map(([scope, label]) => (
            <label key={scope}>
              <span><strong>{label}</strong><small>{scope}</small></span>
              <input type="checkbox" checked={requestedScopes.includes(scope)} onChange={() => toggleScope(scope)} />
            </label>
          ))}
        </div>
        <button className="secondary-button" disabled={!selectedPerson} onClick={invite}>Send private invitation</button>
        {notice && <p className="result-status" aria-live="polite">{notice}</p>}
      </section>

      <button className="primary-button" disabled={!selectedPerson || !selected?.identityBound} onClick={() => api(`/api/v1/people/${selectedPerson}/compare`, { method: 'POST' })}>Open consented pair context</button>
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
    <SurfaceCard eyebrow="SYSTEMS" title="No relationship exists alone." intro="Build a family, household, team, or other group only from identity-bound members whose required scopes remain active.">
      <div className="split-grid">
        <section className="control-group">
          <h3>Create a system</h3>
          <Field label="System name"><input value={systemName} onChange={(event) => setSystemName(event.target.value)} /></Field>
          <Field label="System type">
            <select value={systemType} onChange={(event) => setSystemType(event.target.value)}>
              {['family', 'household', 'friendship_group', 'team', 'workplace', 'custom'].map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
            </select>
          </Field>
          <button className="primary-button" onClick={create}>Create system</button>
        </section>
        <section className="control-group">
          <h3>Build the context</h3>
          <Field label="Selected system">
            <select value={selectedSystem} onChange={(event) => setSelectedSystem(event.target.value)}>
              <option value="">No system selected</option>
              {systems.map((system: any) => <option key={system.id} value={system.id}>{system.name}</option>)}
            </select>
          </Field>
          <Field label="Identity-bound member">
            <select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}>
              <option value="">No person selected</option>
              {eligiblePeople.map((person: any) => <option key={person.id} value={person.id}>{person.displayName}</option>)}
            </select>
          </Field>
          <button className="secondary-button" disabled={!selectedSystem || !selectedPerson} onClick={() => api(`/api/v1/systems/${selectedSystem}/members`, { method: 'POST', body: JSON.stringify({ personId: selectedPerson, metadata: { formalRole: 'member', authority: 'none assumed', responsibility: 'shared objective', constraints: [] } }) })}>Add consented member</button>
        </section>
      </div>
      <button className="primary-button" disabled={!selectedSystem} onClick={() => api(`/api/v1/systems/${selectedSystem}/alignment`)}>Review alignment</button>
    </SurfaceCard>
  );
}

function LibrarySurface({ library, api, saveToLibrary, refresh }: any) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  return (
    <SurfaceCard eyebrow="LIBRARY" title="Keep only what helps." intro="Nothing becomes an enduring understanding unless you choose to save it.">
      <div className="form-grid">
        <Field label="Understanding title"><input value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
        <Field label="Editable summary"><textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={5} /></Field>
      </div>
      <div className="action-row">
        <button className="primary-button" onClick={() => saveToLibrary(title, summary)}>Save understanding</button>
        <button className="secondary-button" onClick={refresh}>Refresh Library</button>
      </div>
      <div className="library-grid">
        {library.length === 0 && <p className="empty-copy">No saved understandings yet.</p>}
        {library.map((item: any) => (
          <article className="library-item" key={item.id}>
            <div><strong>{item.body?.title}</strong><p>{item.body?.summary}</p></div>
            <button onClick={() => api(`/api/v1/library/${item.id}`, { method: 'DELETE' }).then(refresh)}>Delete</button>
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
      <SurfaceCard eyebrow="BASELINE" title="Private context stays yours." intro="Raw birth input goes only to the private computation boundary. Sovereign receives reduced context, never the raw details.">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            void api('/api/v1/baseline/onboarding', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) });
          }}
          className="form-grid"
        >
          <Field label="Birth date"><input type="date" name="birthDate" /></Field>
          <Field label="Birthplace"><input name="birthplace" /></Field>
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
          <button className="primary-button">Complete Baseline setup</button>
        </form>
      </SurfaceCard>

      <SurfaceCard eyebrow="PLAN & USAGE" title="Free or Sovereign+." intro="Stripe confirms access. Cloudflare meters model usage. No personal OpenAI key powers public requests.">
        <div className="usage-card">
          <div><span>Current plan</span><strong>{billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free'}</strong></div>
          <div><span>AI turns this month</span><strong>{billing?.aiUsage ? `${billing.aiUsage.used} / ${billing.aiUsage.allowance}` : 'Loading'}</strong></div>
          <p>{billing?.aiUsage?.resetsAt ? `Resets ${new Date(billing.aiUsage.resetsAt).toLocaleDateString()}` : 'Usage is enforced server-side.'}</p>
        </div>
        <Field label="Sovereign+ billing">
          <select value={billingInterval} onChange={(event) => setBillingInterval(event.target.value as 'monthly' | 'annual')}>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </Field>
        <div className="action-row">
          <button className="primary-button" onClick={() => openHandoff('/api/v1/billing/checkout', { interval: billingInterval })}>Continue to Stripe</button>
          <button className="secondary-button" onClick={() => openHandoff('/api/v1/billing/portal')}>Billing portal</button>
        </div>
      </SurfaceCard>

      <SurfaceCard eyebrow="CONTROL" title="Your data. Your permissions." intro="Share the public platform without exposing private workspace data, begin a deletion grace period, or control optional Covenant context.">
        <div className="settings-list">
          <div><span><strong>Share</strong><small>Share the public Sovereign.OS link. No private workspace data is included.</small></span><button type="button" onClick={() => void sharePublicPlatform()}>Share</button></div>
          <div><span><strong>Deletion</strong><small>Begin a cancellable grace period.</small></span><button onClick={() => api('/api/v1/deletion-jobs', { method: 'POST' })}>Begin</button></div>
          <label><span><strong>Covenant</strong><small>Off unless you enable it for this thread.</small></span><input type="checkbox" checked={covenantEnabled} onChange={(event) => setCovenantEnabled(event.target.checked)} /></label>
        </div>
        <button className="secondary-button" onClick={() => api(`/api/v1/threads/${threadId}/covenant`, { method: 'POST', body: JSON.stringify({ enabled: covenantEnabled, bibleTranslation: covenantEnabled ? 'WEB' : undefined, reference: 'James 1:5', subject: 'this question' }) })}>Apply Covenant setting</button>
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
        <p className="eyebrow">BASELINE-FIRST DECISION INTELLIGENCE</p>
        <h1>Understand what is happening without losing yourself inside it.</h1>
        <p className="lede">A private workspace for your Baseline, today’s context, people, systems, and the understandings you deliberately keep.</p>
        <div className="action-row">
          <a className="primary-button" href="/signup">Create private workspace</a>
          <a className="secondary-button" href="/login">Sign in</a>
        </div>
      </section>
      <p className="entry-note">Non-diagnostic · Consent-aware · Private by design</p>
    </main>
  );
}

function Policy({ kind }: { kind: 'privacy' | 'terms' }) {
  return (
    <section className="policy-copy">
      {kind === 'privacy' ? (
        <>
          <p>We process account data, reduced Baseline context, location-precision preferences, consent decisions, Cloudflare AI Gateway requests, Stripe billing status, exports, and deletion requests only to operate Sovereign.OS.</p>
          <p>Unsaved thread content and complete AI responses are scheduled for deletion after 30 days. Minimal security and operational metadata that does not contain conversation content is retained for up to 90 days. Understandings you explicitly save remain until you delete them or close the account.</p>
          <p>Raw birth inputs and exact private location are not sent to the language model or another invited account. Contact: support@defrag.app.</p>
        </>
      ) : (
        <>
          <p>Sovereign.OS is non-diagnostic software and does not establish another person’s motive, mental state, future behavior, or God’s exact intent. You remain responsible for decisions and professional support where appropriate.</p>
          <p>Free includes 10 AI turns per UTC calendar month. Sovereign+ subscriptions are managed through Stripe. Invited-person content requires identity-bound, scope-specific permission that can be denied or revoked.</p>
          <p>Covenant is an explicit optional Scripture lens. It does not automatically require contact, estrangement, reconciliation, forgiveness, submission, or continued exposure to harm. Contact: support@defrag.app.</p>
        </>
      )}
    </section>
  );
}

function scopeLabel(scope: string): string {
  return consentScopes.find(([value]) => value === scope)?.[1] ?? scope;
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
