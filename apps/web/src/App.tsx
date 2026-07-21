import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';
type ApiState = 'idle' | 'loading' | 'ready' | 'error' | 'permission-denied' | 'consent-required' | 'degraded';

const surfaces: Surface[] = ['Today', 'Explore', 'People', 'Systems', 'Library', 'You'];
const consentScopes = ['pair.compare', 'system.include', 'trait.display', 'framework.display', 'current_conditions.use', 'library.link', 'covenant.include'];

export function App() {
  const [surface, setSurface] = useState<Surface>('Today');
  const [message, setMessage] = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [status, setStatus] = useState('Ready. Private context is fetched only from authenticated APIs.');
  const [apiState, setApiState] = useState<ApiState>('idle');
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [personName, setPersonName] = useState('');
  const [systemName, setSystemName] = useState('');
  const [libraryTitle, setLibraryTitle] = useState('');
  const [librarySummary, setLibrarySummary] = useState('');
  const [covenantEnabled, setCovenantEnabled] = useState(false);
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(null);

  const contextLabel = useMemo(() => [surface, selectedPerson && `person:${selectedPerson}`, selectedSystem && `system:${selectedSystem}`].filter(Boolean).join(' · '), [surface, selectedPerson, selectedSystem]);

  async function api(path: string, init: RequestInit = {}) {
    setApiState('loading');
    try {
      const response = await fetch(path, {
        ...init,
        headers: { 'content-type': 'application/json', 'x-idempotency-key': crypto.randomUUID(), ...(init.headers ?? {}) }
      });
      if (response.status === 403) { setApiState('consent-required'); throw new Error('Consent or entitlement is required.'); }
      if (response.status === 401) { setApiState('permission-denied'); throw new Error('Please sign in again.'); }
      if (!response.ok) { setApiState(response.status >= 500 ? 'degraded' : 'error'); throw new Error('The service could not complete that request safely.'); }
      const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : await response.text();
      setApiState('ready');
      setLastResult(typeof data === 'string' ? { text: data } : data);
      return data;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'The request failed safely.');
      throw error;
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || apiState === 'loading') return;
    setStatus('Sovereign is streaming public text. Hidden reasoning is never shown.');
    setStreamedText('');
    try {
      const response = await fetch('/api/v1/threads/demo/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-idempotency-key': crypto.randomUUID() },
        body: JSON.stringify({ message: clean, context: { surface, personId: selectedPerson || undefined, systemId: selectedSystem || undefined, covenantEnabled } })
      });
      if (!response.ok || !response.body) throw new Error('Gateway unavailable. No interpretation was invented.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setStreamedText(text);
      }
      setStatus('Turn completed and public text can be saved explicitly to Library.');
      setMessage('');
    } catch {
      setApiState('degraded');
      setStatus('Gateway unavailable. Nothing was guessed or saved as interpretation.');
    }
  }

  async function saveCorrection(correction: 'yes' | 'partly' | 'not_today') {
    await api('/api/v1/threads/demo/corrections', { method: 'POST', body: JSON.stringify({ correction }) });
    setStatus(`Correction saved as ${correction}; it remains thread-local unless you save it to Library.`);
  }

  async function saveToLibrary() {
    const summary = streamedText || librarySummary || 'User-approved understanding from the current thread.';
    await api('/api/v1/library', { method: 'POST', body: JSON.stringify({ title: libraryTitle || `${surface} understanding`, summary, threadId: 'demo', links: { personId: selectedPerson, systemId: selectedSystem }, uncertainty: 'visible' }) });
    setStatus('Saved explicitly to Library with provenance and uncertainty.');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">SOVEREIGN.OS</span>
          <h1>{surface}</h1>
          <p className="context-line">Context: {contextLabel || 'Today'} · State: {apiState}</p>
        </div>
        <button className="profile-button" aria-label="Open account settings" onClick={() => setSurface('You')}>You</button>
      </header>

      <main>
        {surface === 'Today' && <TodaySurface onCorrection={saveCorrection} />}
        {surface === 'Explore' && <ExploreSurface api={api} />}
        {surface === 'People' && <PeopleSurface api={api} personName={personName} setPersonName={setPersonName} selectedPerson={selectedPerson} setSelectedPerson={setSelectedPerson} />}
        {surface === 'Systems' && <SystemsSurface api={api} systemName={systemName} setSystemName={setSystemName} selectedPerson={selectedPerson} selectedSystem={selectedSystem} setSelectedSystem={setSelectedSystem} />}
        {surface === 'Library' && <LibrarySurface api={api} libraryTitle={libraryTitle} setLibraryTitle={setLibraryTitle} librarySummary={librarySummary} setLibrarySummary={setLibrarySummary} saveToLibrary={saveToLibrary} />}
        {surface === 'You' && <YouSurface api={api} covenantEnabled={covenantEnabled} setCovenantEnabled={setCovenantEnabled} />}

        <section className="result-panel" aria-live="polite">
          <h2>Public result and recovery</h2>
          <p>{status}</p>
          {streamedText && <pre>{streamedText}</pre>}
          {lastResult && <details><summary>Safe API result</summary><pre>{JSON.stringify(lastResult, null, 2)}</pre></details>}
        </section>
      </main>

      <form className="composer" onSubmit={submit}>
        <label className="sr-only" htmlFor="sovereign-message">Ask Sovereign</label>
        <textarea id="sovereign-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask Sovereign…" rows={1} />
        <button type="submit" aria-label="Send message" disabled={apiState === 'loading'}>↑</button>
        <button type="button" onClick={() => { setStreamedText(''); setStatus('Turn cancelled locally.'); }}>Cancel</button>
      </form>

      <nav className="tabbar" aria-label="Primary navigation">
        {surfaces.map((item) => <button key={item} className={surface === item ? 'active' : ''} onClick={() => setSurface(item)}>{item}</button>)}
      </nav>
    </div>
  );
}

function TodaySurface({ onCorrection }: { onCorrection: (value: 'yes' | 'partly' | 'not_today') => void }) {
  return <section className="stack" aria-labelledby="today-title"><article className="hero-card"><span className="eyebrow">TODAY</span><h2 id="today-title">Pressure can get louder without becoming truth.</h2><p>Your Baseline stays yours. Current conditions may change what feels urgent, visible, or difficult to ignore.</p><div className="state-grid"><State label="Baseline tendency" value="You look for the whole picture before committing." /><State label="Current amplification" value="Urgency may be louder than usual." /><State label="Known behavior / Observed behavior" value="Nothing assumed." /><State label="Actual state" value="Only you can confirm it." /></div></article><article className="check-card"><h3>Does this match today?</h3><div className="choice-row" role="group" aria-label="Does this match today?"><button onClick={() => onCorrection('yes')}>Yes</button><button onClick={() => onCorrection('partly')}>Partly</button><button onClick={() => onCorrection('not_today')}>Not today</button></div></article></section>;
}

function ExploreSurface({ api }: { api: (path: string, init?: RequestInit) => Promise<unknown> }) {
  const [topic, setTopic] = useState('identity');
  return <section className="empty-state"><span className="eyebrow">EXPLORE</span><h2>This is not a label. It is a map.</h2><p>Explore plain language first, then expand framework detail and provenance.</p><select value={topic} onChange={(event) => setTopic(event.target.value)} aria-label="Explore topic">{['identity', 'decisions', 'communication', 'learning', 'love', 'expression', 'pressure response'].map((item) => <option key={item}>{item}</option>)}</select><button onClick={() => api('/api/v1/explore', { method: 'POST', body: JSON.stringify({ topic }) })}>Explore {topic}</button><details><summary>Framework detail</summary><p>Baseline, Current, Observed, and Unknown remain separated.</p></details></section>;
}

function PeopleSurface({ api, personName, setPersonName, selectedPerson, setSelectedPerson }: { api: (path: string, init?: RequestInit) => Promise<any>; personName: string; setPersonName: (value: string) => void; selectedPerson: string; setSelectedPerson: (value: string) => void }) {
  async function create() { const data = await api('/api/v1/people', { method: 'POST', body: JSON.stringify({ displayName: personName, role: 'relationship', metadata: { source: 'private-owner-entry' } }) }); setSelectedPerson(data.person.id); }
  return <section className="empty-state"><span className="eyebrow">PEOPLE</span><h2>Different is not wrong.</h2><p>Private entries are not consent. Consent scopes are deterministic and revocable immediately.</p><input value={personName} onChange={(event) => setPersonName(event.target.value)} placeholder="Private person name" aria-label="Private person name" /><button onClick={create}>Create private person</button><input value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)} placeholder="Selected person ID" aria-label="Selected person ID" /><button onClick={() => selectedPerson && api(`/api/v1/people/${selectedPerson}/invitations`, { method: 'POST' })}>Invite</button><div className="scope-list">{consentScopes.map((scope) => <button key={scope} onClick={() => selectedPerson && api(`/api/v1/people/${selectedPerson}/consent/${scope}`, { method: 'PUT', body: JSON.stringify({ granted: true }) })}>{scope}</button>)}</div><button onClick={() => selectedPerson && api(`/api/v1/people/${selectedPerson}/compare`, { method: 'POST' })}>Open pair context</button></section>;
}

function SystemsSurface({ api, systemName, setSystemName, selectedPerson, selectedSystem, setSelectedSystem }: { api: (path: string, init?: RequestInit) => Promise<any>; systemName: string; setSystemName: (value: string) => void; selectedPerson: string; selectedSystem: string; setSelectedSystem: (value: string) => void }) {
  const [systemType, setSystemType] = useState('family');
  async function create() { const data = await api('/api/v1/systems', { method: 'POST', body: JSON.stringify({ name: systemName, systemType, metadata: { objective: 'shared clarity' } }) }); setSelectedSystem(data.system.id); }
  return <section className="empty-state"><span className="eyebrow">SYSTEMS</span><h2>A relationship never exists alone.</h2><p>Create family, household, friendship, team, workplace, or custom systems and review consent gaps.</p><input value={systemName} onChange={(event) => setSystemName(event.target.value)} placeholder="System name" aria-label="System name" /><select value={systemType} onChange={(event) => setSystemType(event.target.value)}>{['family', 'household', 'friendship_group', 'team', 'workplace', 'custom'].map((item) => <option key={item}>{item}</option>)}</select><button onClick={create}>Create system</button><input value={selectedSystem} onChange={(event) => setSelectedSystem(event.target.value)} placeholder="Selected system ID" aria-label="Selected system ID" /><button onClick={() => selectedSystem && selectedPerson && api(`/api/v1/systems/${selectedSystem}/members`, { method: 'POST', body: JSON.stringify({ personId: selectedPerson, metadata: { formalRole: 'member', responsibility: 'shared objective' } }) })}>Add consented member</button><button onClick={() => selectedSystem && api(`/api/v1/systems/${selectedSystem}/alignment`)}>Analyze alignment</button></section>;
}

function LibrarySurface({ api, libraryTitle, setLibraryTitle, librarySummary, setLibrarySummary, saveToLibrary }: { api: (path: string, init?: RequestInit) => Promise<unknown>; libraryTitle: string; setLibraryTitle: (value: string) => void; librarySummary: string; setLibrarySummary: (value: string) => void; saveToLibrary: () => Promise<void> }) {
  return <section className="empty-state"><span className="eyebrow">LIBRARY</span><h2>Keep what helps.</h2><p>Continuity is explicit user-approved memory, never automatic hidden reasoning.</p><input value={libraryTitle} onChange={(event) => setLibraryTitle(event.target.value)} placeholder="Understanding title" aria-label="Understanding title" /><textarea value={librarySummary} onChange={(event) => setLibrarySummary(event.target.value)} placeholder="Editable public summary" aria-label="Editable public summary" /><button onClick={saveToLibrary}>Save understanding</button><button onClick={() => api('/api/v1/library')}>Refresh Library</button><details><summary>Consent implications</summary><p>Linked person content is rechecked when retrieved and hidden after revocation.</p></details></section>;
}

function YouSurface({ api, covenantEnabled, setCovenantEnabled }: { api: (path: string, init?: RequestInit) => Promise<unknown>; covenantEnabled: boolean; setCovenantEnabled: (value: boolean) => void }) {
  const [locationMode, setLocationMode] = useState('city or regional');
  return <section className="empty-state"><span className="eyebrow">YOU</span><h2>Private context stays yours.</h2><p>Control Baseline, location precision, consent, billing, export, deletion, accessibility, and Covenant.</p><label>Location precision<select value={locationMode} onChange={(event) => setLocationMode(event.target.value)}>{['unavailable', 'approximate', 'city or regional', 'ephemeral current location', 'stored permitted location'].map((item) => <option key={item}>{item}</option>)}</select></label><p>Current precision: {locationMode}. Exact private location is never sent to the model.</p><button onClick={() => api('/api/v1/export-jobs', { method: 'POST' })}>Request export</button><button onClick={() => api('/api/v1/deletion-jobs', { method: 'POST' })}>Request deletion grace state</button><button onClick={() => api('/api/v1/billing/checkout', { method: 'POST', body: JSON.stringify({ plan: 'standard' }) })}>Open Checkout fixture</button><button onClick={() => api('/api/v1/billing/portal', { method: 'POST' })}>Open Portal fixture</button><label><input type="checkbox" checked={covenantEnabled} onChange={(event) => setCovenantEnabled(event.target.checked)} /> Enable Covenant for this turn only</label><button onClick={() => api('/api/v1/threads/demo/covenant', { method: 'POST', body: JSON.stringify({ enabled: covenantEnabled, bibleTranslation: covenantEnabled ? 'WEB' : undefined, reference: 'James 1:5', subject: 'this question' }) })}>Retrieve Covenant fixture</button></section>;
}

function State({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
