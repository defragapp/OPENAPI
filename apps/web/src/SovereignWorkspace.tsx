import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { BaselineOrbit } from './BaselineOrbit';
import { sharePublicPlatform } from './ProductionRuntime';

type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';
type ApiState = 'idle' | 'loading' | 'ready' | 'error';
type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string; createdAt?: string };
type ThreadSummary = { id: string; title: string; contextKind: string; covenantEnabled: boolean; updatedAt: string };

const surfaces: Array<{ name: Surface; label: string }> = [
  { name: 'Today', label: 'Today' },
  { name: 'Explore', label: 'Explore' },
  { name: 'People', label: 'People' },
  { name: 'Systems', label: 'Systems' },
  { name: 'Library', label: 'Library' },
  { name: 'You', label: 'You' }
];

const prompts: Record<Surface, string[]> = {
  Today: [
    'What feels most active in my Baseline right now?',
    'Help me understand a decision I am facing.',
    'What is the shadow and light of this part of me?',
    'Is this relationship supporting who I am becoming?'
  ],
  Explore: [
    'Show me a part of my Baseline I may not recognize yet.',
    'What does alignment look like in this decision?',
    'How might this protective response become a strength?',
    'What kind of environment helps me function at my best?'
  ],
  People: [
    'What are we each bringing into this relationship?',
    'Where might our communication needs differ?',
    'What belongs to me, and what belongs to them?',
    'What still needs to be learned directly?'
  ],
  Systems: [
    'What role does each person occupy in this system?',
    'Where is responsibility unclear?',
    'What changes if I stop carrying this role?',
    'Which perspectives are missing from the group?'
  ],
  Library: [
    'Continue from an understanding I saved.',
    'Connect two saved understandings.',
    'What has changed since I saved this?',
    'Turn this understanding into one practical next step.'
  ],
  You: [
    'Explain one part of my Baseline in plain language.',
    'How does my Baseline shape communication?',
    'What do shadow and light mean for me?',
    'What can I change without changing who I am?'
  ]
};

export function SovereignWorkspace() {
  const [surface, setSurface] = useState<Surface>('Today');
  const [panelOpen, setPanelOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [threadId, setThreadId] = useState(() => newThreadId('Today'));
  const [status, setStatus] = useState('Ready');
  const [apiState, setApiState] = useState<ApiState>('idle');
  const [people, setPeople] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);
  const [billing, setBilling] = useState<any>(null);
  const [today, setToday] = useState<any>(null);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [covenantEnabled, setCovenantEnabled] = useState(false);

  const contextLabel = useMemo(() => {
    const person = people.find((item) => item.id === selectedPerson)?.displayName;
    const system = systems.find((item) => item.id === selectedSystem)?.name;
    return [surface, person, system].filter(Boolean).join(' · ');
  }, [surface, selectedPerson, selectedSystem, people, systems]);

  async function api(path: string, init: RequestInit = {}) {
    const response = await fetch(path, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init.method && init.method !== 'GET' ? { 'x-idempotency-key': crypto.randomUUID() } : {}),
        ...(init.headers ?? {})
      }
    });
    if (response.status === 401) {
      location.assign(`/login?returnTo=${encodeURIComponent(location.pathname)}`);
      throw new Error('Sign-in required');
    }
    const body = response.headers.get('content-type')?.includes('application/json')
      ? await response.json().catch(() => ({}))
      : await response.text();
    if (!response.ok) {
      const problem = typeof body === 'object' && body ? body as Record<string, string> : {};
      throw new Error(problem.message || problem.error || 'That request could not be completed.');
    }
    return body;
  }

  async function refreshWorkspace() {
    try {
      const onboarding = await api('/api/v1/account/onboarding');
      if (!onboarding.completed) {
        location.assign('/onboarding');
        return;
      }
      const [threadData, peopleData, systemData, libraryData, billingData, todayData] = await Promise.all([
        api('/api/v1/threads'),
        api('/api/v1/people'),
        api('/api/v1/systems'),
        api('/api/v1/library'),
        api('/api/v1/billing/entitlements'),
        api('/api/v1/today')
      ]);
      setThreads(threadData.threads ?? []);
      setPeople(peopleData.people ?? []);
      setSystems(systemData.systems ?? []);
      setLibrary(libraryData.understandings ?? []);
      setBilling(billingData);
      setToday(todayData.today ?? null);
      setStatus('Ready');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Some workspace context is unavailable.');
    }
  }

  useEffect(() => { void refreshWorkspace(); }, []);

  function openSurface(next: Surface) {
    setSurface(next);
    setPanelOpen(next !== 'Today');
    setNavOpen(false);
  }

  function startNewThread(nextSurface: Surface = surface) {
    setThreadId(newThreadId(nextSurface, selectedPerson, selectedSystem));
    setMessages([]);
    setDraft('');
    setCovenantEnabled(false);
    setStatus('Ready');
    setApiState('idle');
    setNavOpen(false);
  }

  async function openThread(id: string) {
    setStatus('Opening conversation…');
    try {
      const data = await api(`/api/v1/threads/${encodeURIComponent(id)}`);
      setThreadId(id);
      setMessages(data.messages ?? []);
      setCovenantEnabled(threads.find((thread) => thread.id === id)?.covenantEnabled === true);
      setPanelOpen(false);
      setStatus('Conversation restored.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'That conversation is unavailable.');
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = draft.trim();
    if (!clean || apiState === 'loading') return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: clean };
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage, { id: assistantId, role: 'assistant', text: '' }]);
    setDraft('');
    setApiState('loading');
    setStatus('Sovereign is connecting your question to the available context…');
    try {
      const response = await fetch(`/api/v1/threads/${encodeURIComponent(threadId)}/messages`, {
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
      if (response.status === 401) {
        location.assign('/login?returnTo=%2Fapp');
        return;
      }
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
        setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, text } : item));
      }
      setApiState('ready');
      setStatus('Complete');
      const threadData = await api('/api/v1/threads');
      setThreads(threadData.threads ?? []);
    } catch (error) {
      setApiState('error');
      setMessages((current) => current.map((item) => item.id === assistantId
        ? { ...item, text: error instanceof Error ? error.message : 'Sovereign could not complete this response.' }
        : item));
      setStatus('Needs attention');
    }
  }

  async function saveLatest() {
    const last = [...messages].reverse().find((item) => item.role === 'assistant' && item.text.trim());
    if (!last) return;
    await api('/api/v1/library', {
      method: 'POST',
      body: JSON.stringify({
        title: threads.find((item) => item.id === threadId)?.title ?? `${surface} understanding`,
        summary: last.text,
        threadId,
        links: { personId: selectedPerson, systemId: selectedSystem },
        uncertainty: 'visible'
      })
    });
    await refreshWorkspace();
    setStatus('Saved to Library.');
  }

  async function saveCorrection(correction: 'yes' | 'partly' | 'not_today') {
    await api(`/api/v1/threads/${encodeURIComponent(threadId)}/corrections`, {
      method: 'POST',
      body: JSON.stringify({ correction })
    });
    setStatus(correction === 'yes' ? 'Marked as fitting.' : correction === 'partly' ? 'Marked as partly fitting.' : 'Marked as not fitting today.');
  }

  async function changeCovenant(enabled: boolean) {
    await api(`/api/v1/threads/${encodeURIComponent(threadId)}/covenant`, {
      method: 'POST',
      body: JSON.stringify({
        enabled,
        bibleTranslation: enabled ? 'WEB' : undefined,
        personId: selectedPerson || undefined,
        subject: 'this conversation'
      })
    });
    setCovenantEnabled(enabled);
    setStatus(enabled ? 'Covenant is on for this conversation.' : 'Covenant is off for this conversation.');
  }

  return (
    <div className={`chat-workspace ${panelOpen ? 'has-context-panel' : ''} ${navOpen ? 'has-nav-open' : ''}`}>
      <aside className="chat-sidebar" aria-label="Workspace navigation">
        <a className="chat-brand" href="/app"><span>S</span><strong>SOVEREIGN.OS</strong></a>
        <button className="new-chat-button" onClick={() => startNewThread()}>＋ New conversation</button>
        <nav className="context-navigation">
          <p>CONTEXT</p>
          {surfaces.map((item) => (
            <button key={item.name} className={surface === item.name ? 'active' : ''} onClick={() => openSurface(item.name)}>
              <NavIcon surface={item.name} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <section className="thread-history">
          <p>RECENT</p>
          {threads.length === 0 && <span>Your conversations will appear here.</span>}
          {threads.map((thread) => (
            <button key={thread.id} className={thread.id === threadId ? 'active' : ''} onClick={() => void openThread(thread.id)}>
              {thread.title}
            </button>
          ))}
        </section>
        <button className="account-summary" onClick={() => openSurface('You')}>
          <span>{billing?.effective?.plan === 'sovereign_plus' ? 'S+' : 'S'}</span>
          <span><strong>{billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free plan'}</strong><small>Baseline & account</small></span>
        </button>
      </aside>

      <main className="conversation-shell">
        <header className="conversation-topbar">
          <button className="mobile-menu-button" onClick={() => setNavOpen(true)} aria-label="Open navigation">S</button>
          <div>
            <strong>Sovereign</strong>
            <span>{contextLabel || 'Today'}</span>
          </div>
          <div className="conversation-actions">
            <span className={`connection-dot ${apiState}`}>{status}</span>
            <button onClick={() => setPanelOpen(!panelOpen)}>{panelOpen ? 'Close context' : 'Context'}</button>
          </div>
        </header>

        <section className="conversation-scroll" aria-live="polite">
          {messages.length === 0 ? (
            <div className="conversation-empty">
              <div className="empty-intro">
                <span className="sovereign-glyph">S</span>
                <p className="eyebrow">YOUR BASELINE · AVAILABLE IN EVERY CONVERSATION</p>
                <h1>What do you want to understand?</h1>
                <p>Ask about yourself, a decision, a relationship, or the system around you. Sovereign brings in only the context that belongs.</p>
              </div>
              <div className="starter-grid">
                {prompts[surface].map((prompt) => <button key={prompt} onClick={() => setDraft(prompt)}>{prompt}<span>↗</span></button>)}
              </div>
              <div className="empty-baseline-card">
                <BaselineOrbit compact />
                <button onClick={() => openSurface('You')}>Explore my Baseline</button>
              </div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((message) => (
                <article key={message.id} className={`chat-message ${message.role}`}>
                  <span>{message.role === 'assistant' ? 'S' : 'You'}</span>
                  <div>{message.text || <i>Thinking…</i>}</div>
                </article>
              ))}
              {messages.some((item) => item.role === 'assistant' && item.text.trim()) && (
                <div className="response-actions">
                  <button onClick={() => void saveLatest()}>Save to Library</button>
                  <span>Does this fit?</span>
                  <button onClick={() => void saveCorrection('yes')}>Yes</button>
                  <button onClick={() => void saveCorrection('partly')}>Partly</button>
                  <button onClick={() => void saveCorrection('not_today')}>Not today</button>
                </div>
              )}
            </div>
          )}
        </section>

        <form className="chat-composer" onSubmit={submit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask Sovereign…"
            rows={2}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div>
            <button type="button" className="composer-context" onClick={() => setPanelOpen(true)}>{contextLabel || 'Add context'}</button>
            <span>Enter to send · Shift + Enter for a new line</span>
            <button className="composer-send" disabled={!draft.trim() || apiState === 'loading'} aria-label="Send message">↑</button>
          </div>
        </form>
      </main>

      <aside className="workspace-context-panel" aria-label={`${surface} context`}>
        <header>
          <div><p className="eyebrow">CONTEXT</p><h2>{surface}</h2></div>
          <button onClick={() => setPanelOpen(false)} aria-label="Close context">×</button>
        </header>
        <div className="context-panel-scroll">
          {surface === 'Today' && <TodayPanel today={today} onOpenBaseline={() => openSurface('You')} />}
          {surface === 'Explore' && <ExplorePanel onPrompt={(prompt) => { setDraft(prompt); setPanelOpen(false); }} />}
          {surface === 'People' && (
            <PeoplePanel api={api} people={people} setPeople={setPeople} selectedPerson={selectedPerson} setSelectedPerson={setSelectedPerson} refresh={refreshWorkspace} />
          )}
          {surface === 'Systems' && (
            <SystemsPanel api={api} systems={systems} setSystems={setSystems} people={people} selectedPerson={selectedPerson} setSelectedPerson={setSelectedPerson} selectedSystem={selectedSystem} setSelectedSystem={setSelectedSystem} />
          )}
          {surface === 'Library' && <LibraryPanel library={library} api={api} refresh={refreshWorkspace} onUse={(text: string) => { setDraft(text); setPanelOpen(false); }} />}
          {surface === 'You' && (
            <YouPanel api={api} billing={billing} covenantEnabled={covenantEnabled} changeCovenant={changeCovenant} refresh={refreshWorkspace} />
          )}
        </div>
      </aside>

      {panelOpen && <button className="context-backdrop" aria-label="Close context" onClick={() => setPanelOpen(false)} />}
      {navOpen && <button className="navigation-backdrop" aria-label="Close navigation" onClick={() => setNavOpen(false)} />}
    </div>
  );
}

function TodayPanel({ today, onOpenBaseline }: { today: any; onOpenBaseline: () => void }) {
  const baseline = today?.baseline;
  const current = today?.current;
  const baselineReady = baseline?.status === 'completed' || baseline?.status === 'partial';
  return (
    <PanelStack>
      <p className="panel-intro">Your Baseline stays steady. Current timing is a separate layer. You decide what is true today.</p>
      <ContextRow label="Baseline" value={textOr(baseline?.reducedContext?.baselineTendency, baselineReady ? 'Ready to use.' : 'Build your Baseline to begin.')} />
      <ContextRow label="Current emphasis" value={textOr(current?.reduced?.possibleCurrentAmplification, 'No current timing is active.')} />
      <ContextRow label="Your experience" value={textOr(current?.reduced?.knownObservation, 'Nothing is treated as fact until you confirm it.')} />
      <ContextRow label="Still unknown" value={textOr(current?.reduced?.unknownActualState, 'Your actual experience remains yours to name.')} />
      {!baselineReady && <button className="primary-button" onClick={onOpenBaseline}>Build my Baseline</button>}
    </PanelStack>
  );
}

function ExplorePanel({ onPrompt }: { onPrompt: (prompt: string) => void }) {
  return (
    <PanelStack>
      <p className="panel-intro">Choose a direction or ask in your own words.</p>
      {([
        ['SELF', 'Show me the shadow and light of a part of my Baseline.'],
        ['ALIGNMENT', 'Help me examine whether this choice fits who I am.'],
        ['RELATIONSHIP', 'Help me understand what this relationship brings out in me.'],
        ['GROWTH', 'What part of myself is asking to develop now?']
      ] as const).map(([label, prompt]) => <button className="prompt-row" key={label} onClick={() => onPrompt(prompt)}><span>{label}</span><strong>{prompt}</strong></button>)}
    </PanelStack>
  );
}

function PeoplePanel({ api, people, setPeople, selectedPerson, setSelectedPerson, refresh }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const selected = people.find((person: any) => person.id === selectedPerson);

  async function addPerson() {
    if (!name.trim()) return;
    const data = await api('/api/v1/people', { method: 'POST', body: JSON.stringify({ displayName: name, role: 'relationship', metadata: { source: 'private-owner-entry' } }) });
    setPeople([...people, data.person]);
    setSelectedPerson(data.person.id);
    setName('');
  }

  async function invite() {
    if (!selectedPerson || !email.includes('@')) return;
    await api(`/api/v1/people/${selectedPerson}/invitations/send`, {
      method: 'POST',
      body: JSON.stringify({ email, requestedScopes: ['pair.compare', 'trait.display'] })
    });
    setEmail('');
    setNotice('Private invitation sent. They choose what to allow.');
    await refresh();
  }

  return (
    <PanelStack>
      <p className="panel-intro">Add someone privately. A shared comparison begins only after they connect their own account and choose what to allow.</p>
      <Field label="Person"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" /></Field>
      <button className="secondary-button" onClick={() => void addPerson()}>Add person</button>
      <Field label="Use in this conversation">
        <select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}>
          <option value="">Only me</option>
          {people.map((person: any) => <option key={person.id} value={person.id}>{person.displayName}</option>)}
        </select>
      </Field>
      {selected && (
        <div className="compact-status-card">
          <span>Account</span><strong>{selected.identityBound ? 'Connected' : 'Not connected'}</strong>
          <span>Baseline</span><strong>{textOr(selected.baselineStatus, 'Unavailable')}</strong>
        </div>
      )}
      {selected && !selected.identityBound && (
        <>
          <Field label="Invitation email"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
          <button className="primary-button" onClick={() => void invite()}>Send private invitation</button>
        </>
      )}
      {people.length > 0 && (
        <button className="secondary-button" onClick={() => window.dispatchEvent(new Event('sovereign:open-consent-controls'))}>Manage permissions</button>
      )}
      {notice && <p className="panel-note">{notice}</p>}
    </PanelStack>
  );
}

function SystemsPanel({ api, systems, setSystems, people, selectedPerson, setSelectedPerson, selectedSystem, setSelectedSystem }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('family');
  const eligible = people.filter((person: any) => person.identityBound);

  async function createSystem() {
    if (!name.trim()) return;
    const data = await api('/api/v1/systems', { method: 'POST', body: JSON.stringify({ name, systemType: type, metadata: { objective: 'shared clarity' } }) });
    setSystems([...systems, data.system]);
    setSelectedSystem(data.system.id);
    setName('');
  }

  async function addMember() {
    if (!selectedSystem || !selectedPerson) return;
    await api(`/api/v1/systems/${selectedSystem}/members`, {
      method: 'POST',
      body: JSON.stringify({ personId: selectedPerson, metadata: { formalRole: 'member', authority: 'none assumed', responsibility: 'shared objective', constraints: [] } })
    });
  }

  return (
    <PanelStack>
      <p className="panel-intro">A System keeps roles, authority, pressure, and responsibility in view across a family, group, or team.</p>
      <Field label="New system"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Family, household, team…" /></Field>
      <Field label="Type">
        <select value={type} onChange={(event) => setType(event.target.value)}>
          {['family', 'household', 'friendship_group', 'team', 'workplace', 'custom'].map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
        </select>
      </Field>
      <button className="secondary-button" onClick={() => void createSystem()}>Create system</button>
      <Field label="Use in this conversation">
        <select value={selectedSystem} onChange={(event) => setSelectedSystem(event.target.value)}>
          <option value="">No system</option>
          {systems.map((system: any) => <option key={system.id} value={system.id}>{system.name}</option>)}
        </select>
      </Field>
      {selectedSystem && (
        <>
          <Field label="Add a permitted person">
            <select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}>
              <option value="">Choose a person</option>
              {eligible.map((person: any) => <option key={person.id} value={person.id}>{person.displayName}</option>)}
            </select>
          </Field>
          <button className="primary-button" disabled={!selectedPerson} onClick={() => void addMember()}>Add to system</button>
        </>
      )}
    </PanelStack>
  );
}

function LibraryPanel({ library, api, refresh, onUse }: any) {
  return (
    <PanelStack>
      <p className="panel-intro">Only understandings you deliberately save appear here.</p>
      {library.length === 0 && <div className="panel-empty"><strong>Nothing saved yet.</strong><p>Save a Sovereign response when it changes how you see something.</p></div>}
      {library.map((item: any) => (
        <article className="library-panel-item" key={item.id}>
          <button onClick={() => onUse(`Continue from this saved understanding: ${item.body?.summary ?? ''}`)}>
            <strong>{item.body?.title || 'Saved understanding'}</strong>
            <p>{item.body?.summary}</p>
          </button>
          <button aria-label="Remove saved understanding" onClick={() => api(`/api/v1/library/${item.id}`, { method: 'DELETE' }).then(refresh)}>×</button>
        </article>
      ))}
    </PanelStack>
  );
}

function YouPanel({ api, billing, covenantEnabled, changeCovenant, refresh }: any) {
  const [certainty, setCertainty] = useState('unknown');
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');

  async function buildBaseline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await api('/api/v1/baseline/onboarding', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) });
    await refresh();
  }

  async function handoff(path: string, body: unknown = {}) {
    const data = await api(path, { method: 'POST', body: JSON.stringify(body) });
    const url = data.checkout?.url ?? data.portal?.url;
    if (url) location.assign(url);
  }

  return (
    <PanelStack>
      <section className="panel-section">
        <p className="eyebrow">YOUR BASELINE</p>
        <h3>Build once. Explore continuously.</h3>
        <form className="panel-form" onSubmit={buildBaseline}>
          <Field label="Birth date"><input type="date" name="birthDate" /></Field>
          <Field label="Birthplace"><input name="birthplace" placeholder="City, region, country" /></Field>
          <Field label="Birth-time certainty">
            <select name="birthTimeCertainty" value={certainty} onChange={(event) => setCertainty(event.target.value)}>
              <option value="exact">Exact</option>
              <option value="approximate">Approximate</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>
          {certainty !== 'unknown' && <Field label="Birth time"><input type="time" name="birthTime" /></Field>}
          <input type="hidden" name="locationPrecision" value="city_or_regional" />
          <button className="primary-button">Build my Baseline</button>
        </form>
      </section>
      <section className="panel-section">
        <p className="eyebrow">PLAN</p>
        <div className="plan-summary-card">
          <strong>{billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free'}</strong>
          <span>{billing?.aiUsage ? `${billing.aiUsage.used} of ${billing.aiUsage.allowance} responses used` : 'Loading usage…'}</span>
        </div>
        {billing?.effective?.plan !== 'sovereign_plus' && (
          <>
            <div className="billing-toggle">
              <button className={interval === 'annual' ? 'active' : ''} onClick={() => setInterval('annual')}>$99 yearly</button>
              <button className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>$20 monthly</button>
            </div>
            <button className="primary-button" onClick={() => void handoff('/api/v1/billing/checkout', { interval })}>Choose Sovereign+</button>
          </>
        )}
        <button className="secondary-button" onClick={() => void handoff('/api/v1/billing/portal')}>Manage billing</button>
      </section>
      <section className="panel-section">
        <p className="eyebrow">CONTROL</p>
        <label className="setting-row"><span><strong>Covenant</strong><small>Optional Christian and biblical lens for this conversation.</small></span><input type="checkbox" checked={covenantEnabled} onChange={(event) => void changeCovenant(event.target.checked)} /></label>
        <p className="panel-note">Sharing sends the public Sovereign.OS link. No private workspace data is included.</p>
        <button className="secondary-button" onClick={() => void sharePublicPlatform()}>Share Sovereign.OS</button>
        <button className="secondary-button" onClick={() => api('/api/v1/auth/logout', { method: 'POST' })}>Log out</button>
      </section>
    </PanelStack>
  );
}

function PanelStack({ children }: { children: ReactNode }) {
  return <div className="panel-stack">{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="panel-field"><span>{label}</span>{children}</label>;
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return <article className="context-row"><span>{label}</span><p>{value}</p></article>;
}

function NavIcon({ surface }: { surface: Surface }) {
  const icons: Record<Surface, string> = { Today: '◉', Explore: '✦', People: '◇', Systems: '⌘', Library: '□', You: '○' };
  return <i aria-hidden="true">{icons[surface]}</i>;
}

function newThreadId(surface: Surface, personId = '', systemId = '') {
  return ['thread', Date.now(), surface, personId, systemId, crypto.randomUUID().slice(0, 8)]
    .filter(Boolean)
    .join('-')
    .replace(/[^a-z0-9_-]/gi, '-');
}

function textOr(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
