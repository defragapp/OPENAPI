import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { BaselineOrbit } from './BaselineOrbit';
import { sharePublicPlatform } from './ProductionRuntime';

type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';
type ApiState = 'idle' | 'loading' | 'ready' | 'error';
type VisualPhase = 'origin' | 'shadow' | 'gift';
type VisualCard = { archetype: 'fool' | 'magician' | 'three_of_cups' | 'hermit' | 'strength' | 'tower'; title: string; phase: VisualPhase };
type VisualStoryPayload = {
  story: {
    should_show: true;
    mode: 'self' | 'interaction' | 'family';
    primary: VisualCard;
    secondary: VisualCard | null;
    tertiary: VisualCard | null;
    origin: string;
    shadow: string;
    gift: string;
    current: string;
    next_step: string;
    visual_reason: string;
  };
  basis: {
    user_confirmed: boolean;
    human_design: string[];
    gene_keys: string[];
    astrology: string[];
    relationship: string[];
    live: string[];
    numerology: string[];
  };
};
type ModuleOffer = { title: string };
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt?: string;
  context?: Record<string, unknown>;
  interfaceActions?: Record<string, unknown>;
  visualStory?: Record<string, unknown>;
  moduleOffer?: Record<string, unknown>;
};
type ThreadSummary = { id: string; title: string; contextKind: string; covenantEnabled: boolean; updatedAt: string };
type InterfaceAction =
  | { type: 'open_baseline'; args: { facet: string } }
  | { type: 'open_person'; args: { personId: string } }
  | { type: 'open_system'; args: { systemId: string } }
  | { type: 'open_decision'; args: Record<string, never> }
  | { type: 'open_optional_lens'; args: { lens: 'covenant' } }
  | { type: 'show_plan'; args: { feature: string } };
type InterfaceActionEnvelope = { version: 1; primary: InterfaceAction | null; suggestions: InterfaceAction[]; confirmationRequired: true };

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
  const [interfaceActions, setInterfaceActions] = useState<InterfaceActionEnvelope | null>(null);
  const [visualStory, setVisualStory] = useState<VisualStoryPayload | null>(null);
  const [visualPhase, setVisualPhase] = useState<VisualPhase>('shadow');
  const [moduleOffer, setModuleOffer] = useState<ModuleOffer | null>(null);

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
    setInterfaceActions(null);
    setVisualStory(null);
    setModuleOffer(null);
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
      const restored = [...(data.messages ?? [])].reverse().find((item: ChatMessage) =>
        item.context || item.interfaceActions || item.visualStory || item.moduleOffer);
      const restoredPerson = validClientId(restored?.context?.personId) ? restored.context.personId : '';
      const restoredSystem = validClientId(restored?.context?.systemId) ? restored.context.systemId : '';
      setSelectedPerson(restoredSystem ? '' : restoredPerson);
      setSelectedSystem(restoredPerson ? '' : restoredSystem);
      setInterfaceActions(validActionEnvelope(restored?.interfaceActions));
      const restoredVisual = validVisualStoryPayload(restored?.visualStory);
      setVisualStory(restoredVisual);
      setVisualPhase(restoredVisual?.story.primary.phase ?? 'shadow');
      setModuleOffer(validModuleOffer(restored?.moduleOffer));
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
      const actions = decodeActionEnvelope(response.headers.get('x-sovereign-interface-actions'));
      const nextVisualStory = decodeVisualStoryPayload(response.headers.get('x-sovereign-visual-story'));
      const nextModuleOffer = response.headers.get('x-sovereign-module-offer') === '1'
        ? validModuleOffer({ title: decodeHeaderTitle(response.headers.get('x-sovereign-module-title')) })
        : null;
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
      setInterfaceActions(actions);
      setVisualStory(nextVisualStory);
      setVisualPhase(nextVisualStory?.story.primary.phase ?? 'shadow');
      setModuleOffer(nextModuleOffer);
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
    if (!window.confirm('Save this response to your private Library?')) return;
    const body = {
      title: threads.find((item) => item.id === threadId)?.title ?? `${surface} understanding`,
      summary: last.text,
      threadId,
      links: { personId: selectedPerson, systemId: selectedSystem },
      uncertainty: 'visible',
      basis: visualStory?.basis,
      type: surface
    };
    await api('/api/v1/library', {
      method: 'POST',
      body: JSON.stringify(body)
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

  async function saveModuleOffer() {
    if (!moduleOffer || !window.confirm(`Save “${moduleOffer.title}” to your private Library?`)) return;
    await api(`/api/v1/threads/${encodeURIComponent(threadId)}/modules/latest`, {
      method: 'POST',
      body: JSON.stringify({ approved: true })
    });
    setModuleOffer(null);
    await refreshWorkspace();
    setStatus('Insight Module saved to Library.');
  }

  async function changeCovenant(enabled: boolean) {
    if (!window.confirm(`${enabled ? 'Enable' : 'Disable'} the optional Covenant lens for this conversation?`)) return;
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

  function openInterfaceAction(action: InterfaceAction) {
    if (action.type === 'open_person') { setSelectedPerson(action.args.personId); setSelectedSystem(''); openSurface('People'); }
    else if (action.type === 'open_system') { setSelectedSystem(action.args.systemId); setSelectedPerson(''); openSurface('Systems'); }
    else if (action.type === 'open_baseline') openSurface('You');
    else if (action.type === 'open_decision') openSurface('Explore');
    else if (action.type === 'open_optional_lens' || action.type === 'show_plan') openSurface('You');
  }

  const baselineReady = today?.baseline?.status === 'completed' || today?.baseline?.status === 'partial';
  const surfacePrompts = useMemo(() => {
    if (surface === 'Today' && !baselineReady) {
      return [
        'How do I start building my Baseline?',
        'What is Baseline Design?',
        'Why does my birth date and birthplace matter?',
        'Is my private information shared with the AI?'
      ];
    }
    return prompts[surface];
  }, [surface, baselineReady]);

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
            <span className="plan-indicator">{billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free'}</span>
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

              <div className="empty-baseline-card">
                <BaselineOrbit compact />
                <div className="baseline-card-actions">
                  <button className="primary-button" onClick={() => openSurface('You')}>{baselineReady ? 'Explore my Baseline' : 'Build my Baseline'}</button>
                  {!baselineReady && <p className="nudge-text">Begin with your personal intelligence foundation.</p>}
                </div>
              </div>

              <div className="starter-grid">
                {surfacePrompts.map((prompt) => <button key={prompt} onClick={() => setDraft(prompt)}>{prompt}<span>↗</span></button>)}
              </div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((message, index) => {
                const isLatestAssistant = message.role === 'assistant' && index === messages.length - 1;
                return (
                  <div key={message.id} className="message-wrapper">
                    <article className={`chat-message ${message.role}`}>
                      <span>{message.role === 'assistant' ? 'S' : 'You'}</span>
                      <div>{message.text || <i>Thinking…</i>}</div>
                    </article>
                    {isLatestAssistant && message.text.trim() && (
                      <>
                        {visualStory && <VisualStoryCard payload={visualStory} phase={visualPhase} setPhase={setVisualPhase} />}
                        <div className="response-actions">
                          {interfaceActions?.primary && <button className="action-primary" onClick={() => openInterfaceAction(interfaceActions.primary!)}>{actionLabel(interfaceActions.primary)}</button>}
                          {interfaceActions?.suggestions.map((action) => <button key={`${action.type}-${JSON.stringify(action.args)}`} className="action-suggestion" onClick={() => openInterfaceAction(action)}>{actionLabel(action)}</button>)}
                          {moduleOffer && <button className="action-module" onClick={() => void saveModuleOffer()}>Save “{moduleOffer.title}”</button>}
                          <button onClick={() => void saveLatest()}>Save to Library</button>
                          <span className="fit-ask">Does this fit?</span>
                          <button onClick={() => void saveCorrection('yes')}>Yes</button>
                          <button onClick={() => void saveCorrection('partly')}>Partly</button>
                          <button onClick={() => void saveCorrection('not_today')}>Not today</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
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
            <PeoplePanel api={api} people={people} setPeople={setPeople} selectedPerson={selectedPerson} setSelectedPerson={(id: string) => { setSelectedPerson(id); if (id) setSelectedSystem(''); }} refresh={refreshWorkspace} />
          )}
          {surface === 'Systems' && (
            <SystemsPanel api={api} systems={systems} setSystems={setSystems} people={people} selectedSystem={selectedSystem} setSelectedSystem={(id: string) => { setSelectedSystem(id); if (id) setSelectedPerson(''); }} />
          )}
          {surface === 'Library' && <LibraryPanel library={library} api={api} refresh={refreshWorkspace} onUse={(text: string) => { setDraft(text); setPanelOpen(false); }} />}
          {surface === 'You' && (
            <YouPanel api={api} billing={billing} today={today} covenantEnabled={covenantEnabled} changeCovenant={changeCovenant} refresh={refreshWorkspace} openSurface={openSurface} />
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
  const [requestedScopes, setRequestedScopes] = useState<string[]>(['pair.compare', 'trait.display']);
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
    if (!window.confirm(`Send a private invitation to ${email.trim()}?`)) return;
    await api(`/api/v1/people/${selectedPerson}/invitations/send`, {
      method: 'POST',
      body: JSON.stringify({ email, requestedScopes })
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
        <div className="person-visual-card premium-elevation">
          <div className="person-visual-avatar-stage">
            <svg viewBox="0 0 80 80" className="avatar-svg">
              <circle cx="40" cy="40" r="38" fill="var(--clay-light)" fillOpacity="0.1" stroke="var(--clay-light)" strokeWidth="1" strokeDasharray="4 2" />
              <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="var(--clay-light)" fontSize="32" fontFamily="var(--serif)">{selected.displayName.slice(0, 1)}</text>
            </svg>
            {selected.identityBound && <div className="avatar-archetype-overlay" title="Baseline Active">B✓</div>}
          </div>
          
          <div className="relational-intelligence-box">
            <p className="eyebrow">RELATIONAL STATUS</p>
            <p>{selected.identityBound ? 'This person has connected their Baseline. Comparison and shared context are available.' : 'Private entry. Add their email to invite them to connect their own Baseline.'}</p>
            <div className="intelligence-tag-row">
              <span className="intel-tag">{selected.identityBound ? 'Connected' : 'Private'}</span>
              <span className="intel-tag">{textOr(selected.baselineStatus, 'No Baseline')}</span>
              {selected.role && <span className="intel-tag">{selected.role}</span>}
            </div>
          </div>

          {selected.identityBound && (
            <div className="person-connection-hint">
              <p>Baselines are distinct. Comparison happens only when both roles are active in a conversation.</p>
            </div>
          )}
        </div>
      )}
      {selected && !selected.identityBound && (
        <>
          <Field label="Invitation email"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
          <fieldset className="consent-purpose-fieldset">
            <legend>What may they choose to allow?</legend>
            <label><input type="checkbox" checked disabled /> Relationship comparison</label>
            <label><input type="checkbox" checked={requestedScopes.includes('system.include')} onChange={(event) => setOptionalScope(requestedScopes, setRequestedScopes, 'system.include', event.target.checked)} /> Include in a family, group, or team</label>
            <label><input type="checkbox" checked={requestedScopes.includes('covenant.include')} onChange={(event) => setOptionalScope(requestedScopes, setRequestedScopes, 'covenant.include', event.target.checked)} /> Include in the optional Covenant lens</label>
          </fieldset>
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

function SystemsPanel({ api, systems, setSystems, people, selectedSystem, setSelectedSystem }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('family');
  const [memberId, setMemberId] = useState('');
  const eligible = people.filter((person: any) => person.identityBound && person.activeScopes?.includes('system.include'));

  async function createSystem() {
    if (!name.trim()) return;
    const data = await api('/api/v1/systems', { method: 'POST', body: JSON.stringify({ name, systemType: type, metadata: { objective: 'shared clarity' } }) });
    setSystems([...systems, data.system]);
    setSelectedSystem(data.system.id);
    setName('');
  }

  async function addMember() {
    if (!selectedSystem || !memberId) return;
    await api(`/api/v1/systems/${selectedSystem}/members`, {
      method: 'POST',
      body: JSON.stringify({ personId: memberId, metadata: { formalRole: 'member', authority: 'none assumed', responsibility: 'shared objective', constraints: [] } })
    });
    setMemberId('');
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
        <div className="system-visual-card premium-elevation">
          <header>
            <div>
              <strong>{systems.find((s: any) => s.id === selectedSystem)?.name}</strong>
              <span className="system-type-badge">{type.replace('_', ' ')}</span>
            </div>
          </header>
          
          <div className="system-map-visual">
            <div className="system-map-center">⌘</div>
            <div className="system-members-orbit" style={{ '--total': eligible.length + 1 } as any}>
              <div className="member-orbit-node" style={{ '--idx': 0 } as any}>
                <div className="member-glyph" title="You (Lead)">Y</div>
              </div>
              {eligible.map((p: any, idx: number) => (
                <div key={p.id} className="member-orbit-node" style={{ '--idx': idx + 1 } as any}>
                  <div className="member-glyph" title={p.displayName}>{p.displayName.slice(0, 1)}</div>
                </div>
              ))}
            </div>
          </div>

          <Field label="Add a permitted person">
            <select value={memberId} onChange={(event) => setMemberId(event.target.value)}>
              <option value="">Choose a person</option>
              {eligible.map((person: any) => <option key={person.id} value={person.id}>{person.displayName}</option>)}
            </select>
          </Field>
          <button className="primary-button" disabled={!memberId} onClick={() => void addMember()}>Add to system</button>
        </div>
      )}
    </PanelStack>
  );
}

function LibraryPanel({ library, api, refresh, onUse }: any) {
  const groups = useMemo(() => {
    const map: Record<string, any[]> = {};
    library.forEach((item: any) => {
      const type = item.body?.type || 'Other';
      if (!map[type]) map[type] = [];
      map[type].push(item);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [library]);

  return (
    <PanelStack>
      <p className="panel-intro">Only understandings you deliberately save appear here.</p>
      {library.length === 0 && <div className="panel-empty"><strong>Nothing saved yet.</strong><p>Save a Sovereign response when it changes how you see something.</p></div>}
      {groups.map(([type, items]) => (
        <section key={type} className="library-group">
          <p className="eyebrow">{type}</p>
          <div className="library-items">
            {items.map((item: any) => (
              <article className="library-panel-item" key={item.id}>
                <button onClick={() => onUse(`Continue from this saved understanding: ${item.body?.summary ?? ''}`)}>
                  <strong>{item.body?.title || 'Saved understanding'}</strong>
                  <p>{item.body?.summary}</p>
                  <div className="intelligence-tag-row">
                    {item.body?.basis && <span className="intel-tag">Verified Basis ✓</span>}
                    {item.body?.type && <span className="intel-tag">{item.body.type}</span>}
                  </div>
                </button>
                <button aria-label="Remove saved understanding" onClick={() => api(`/api/v1/library/${item.id}`, { method: 'DELETE' }).then(refresh)}>×</button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </PanelStack>
  );
}

function YouPanel({ api, billing, today, covenantEnabled, changeCovenant, refresh, openSurface }: any) {
  const [certainty, setCertainty] = useState('unknown');
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [deletionJob, setDeletionJob] = useState<{ id: string; status: string; scheduledFor?: string } | null>(null);
  const baseline = today?.baseline;
  const isComplete = baseline?.status === 'completed' || baseline?.status === 'partial';

  useEffect(() => {
    void api('/api/v1/deletion-jobs')
      .then((data: any) => setDeletionJob(data.deletionJob ?? null))
      .catch(() => setDeletionJob(null));
  }, []);

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

  async function requestDeletion() {
    if (!window.confirm('Request deletion of this account and its private data after the 14-day grace period? You can cancel during that period.')) return;
    const data = await api('/api/v1/deletion-jobs', { method: 'POST', body: JSON.stringify({ approved: true }) });
    setDeletionJob(data.deletionJob);
  }

  async function cancelDeletion() {
    if (!deletionJob || !window.confirm('Cancel this account deletion request?')) return;
    await api(`/api/v1/deletion-jobs/${encodeURIComponent(deletionJob.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'cancel' })
    });
    setDeletionJob(null);
  }

  return (
    <PanelStack>
      <section className="panel-section">
        <p className="eyebrow">YOUR BASELINE</p>
        <div className="baseline-status-summary">
          <div className="baseline-status-indicator">
            <span className={`status-dot ${isComplete ? 'complete' : 'pending'}`} />
            <strong>{isComplete ? 'Baseline Active' : 'Baseline Pending'}</strong>
          </div>
          <p className="panel-note">{isComplete ? 'Your foundation is built. Every conversation starts here.' : 'Enter your birth details to begin. Your data stays private.'}</p>
        </div>
        
        {!isComplete && (
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
        )}

        {isComplete && (
          <div className="baseline-details-preview">
            <div className="detail-row"><span>Born</span><strong>{baseline.birthDate}</strong></div>
            <div className="detail-row"><span>Place</span><strong>{baseline.birthplace}</strong></div>
            <button className="secondary-button" onClick={() => window.confirm('Updating your Baseline will clear existing interpretations. Continue?') && isComplete && openSurface('You')}>Edit details</button>
          </div>
        )}
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
            <button className="primary-button" onClick={() => { if (window.confirm(`Continue to Stripe for the ${interval} Sovereign+ plan?`)) void handoff('/api/v1/billing/checkout', { interval }); }}>Choose Sovereign+</button>
          </>
        )}
        <button className="secondary-button" onClick={() => void handoff('/api/v1/billing/portal')}>Manage billing</button>
      </section>
      <section className="panel-section">
        <p className="eyebrow">CONTROL</p>
        <label className="setting-row"><span><strong>Covenant</strong><small>Optional Christian and biblical lens for this conversation.</small></span><input type="checkbox" checked={covenantEnabled} onChange={(event) => void changeCovenant(event.target.checked)} /></label>
        <p className="panel-note">Sharing sends the public Sovereign.OS link. No private workspace data is included.</p>
        <button className="secondary-button" onClick={() => { if (window.confirm('Open your device sharing options for the public Sovereign.OS link?')) void sharePublicPlatform(); }}>Share Sovereign.OS</button>
        {deletionJob
          ? <button className="secondary-button" onClick={() => void cancelDeletion()}>Cancel account deletion</button>
          : <button className="secondary-button danger-button" onClick={() => void requestDeletion()}>Request account deletion</button>}
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

function decodeActionEnvelope(value: string | null): InterfaceActionEnvelope | null {
  if (!value) return null;
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return validActionEnvelope(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0)))));
  } catch {
    return null;
  }
}

function validActionEnvelope(value: unknown): InterfaceActionEnvelope | null {
  if (!value || typeof value !== 'object') return null;
  const envelope = value as Record<string, unknown>;
  if (envelope.version !== 1 || envelope.confirmationRequired !== true) return null;
  const primary = validAction(envelope.primary);
  const suggestions = Array.isArray(envelope.suggestions) ? envelope.suggestions.map(validAction).filter((item): item is InterfaceAction => item !== null).slice(0, 2) : [];
  return { version: 1, primary, suggestions, confirmationRequired: true };
}

function validAction(value: unknown): InterfaceAction | null {
  if (!value || typeof value !== 'object') return null;
  const action = value as { type?: unknown; args?: unknown };
  if (!['open_baseline', 'open_person', 'open_system', 'open_decision', 'open_optional_lens', 'show_plan'].includes(String(action.type)) || !action.args || typeof action.args !== 'object') return null;
  const args = action.args as Record<string, unknown>;
  if (action.type === 'open_person' && !validClientId(args.personId)) return null;
  if (action.type === 'open_system' && !validClientId(args.systemId)) return null;
  if (action.type === 'open_optional_lens' && args.lens !== 'covenant') return null;
  return action as InterfaceAction;
}

function validClientId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function actionLabel(action: InterfaceAction): string {
  if (action.type === 'open_baseline') return 'Show Baseline detail';
  if (action.type === 'open_person') return 'Open relationship context';
  if (action.type === 'open_system') return 'Open system context';
  if (action.type === 'open_decision') return 'Open Decision Check';
  if (action.type === 'open_optional_lens') return 'Review optional Covenant lens';
  return 'View plan details';
}

function setOptionalScope(current: string[], setCurrent: (next: string[]) => void, scope: string, enabled: boolean) {
  setCurrent(enabled ? [...new Set([...current, scope])] : current.filter((item) => item !== scope));
}

function VisualStoryCard({ payload, phase, setPhase }: {
  payload: VisualStoryPayload;
  phase: VisualPhase;
  setPhase: (phase: VisualPhase) => void;
}) {
  const cards = [payload.story.primary, payload.story.secondary, payload.story.tertiary].filter((card): card is VisualCard => card !== null);
  const phaseLabels: Record<VisualPhase, string> = { origin: 'Past protection', shadow: 'Under pressure', gift: 'Clear expression' };
  return (
    <section className="visual-story-card" aria-label="Archetype in motion">
      <header>
        <div><p className="eyebrow">ARCHETYPE IN MOTION</p><h3>See how the role moves.</h3></div>
        <span>{payload.story.mode === 'self' ? 'Personal' : payload.story.mode === 'interaction' ? 'Consented relationship' : 'Permitted system'}</span>
      </header>
      <div className="visual-story-body">
        <div className="visual-story-archetypes" aria-label="Available archetypes">
          {cards.map((card) => (
            <article key={`${card.archetype}-${card.title}`} className={`visual-archetype-artwork visual-archetype-${card.archetype}`}>
              <div className="artwork-stage">
                <svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="140" rx="12" fill="currentColor" fillOpacity="0.03" />
                  <path d="M50 20 L80 120 L20 120 Z" fill="currentColor" fillOpacity="0.1" className="artwork-breath" />
                  <ArchetypeGlyph archetype={card.archetype} />
                </svg>
              </div>
              <p className="artwork-mark">{archetypeMark(card.archetype)}</p>
              <strong>{card.title}</strong>
            </article>
          ))}
        </div>
        <div>
          <div className="visual-phase-tabs" aria-label="View three expressions of this role">
            {(['origin', 'shadow', 'gift'] as const).map((item) => (
              <button key={item} className={phase === item ? 'active' : ''} aria-pressed={phase === item} onClick={() => setPhase(item)}>{phaseLabels[item]}</button>
            ))}
          </div>
          <p className="visual-phase-copy">{payload.story[phase]}</p>
          <dl>
            <div><dt>Active now</dt><dd>{payload.story.current}</dd></div>
            <div><dt>One next step</dt><dd>{payload.story.next_step}</dd></div>
          </dl>
          <details><summary>What shaped this view</summary><p>{payload.story.visual_reason}</p></details>
        </div>
      </div>
    </section>
  );
}

function ArchetypeGlyph({ archetype }: { archetype: VisualCard['archetype'] }) {
  if (archetype === 'fool') return <path d="M50 40 Q70 40 70 60 T50 80 T30 60 T50 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="artwork-float" />;
  if (archetype === 'magician') return <path d="M30 50 L70 50 L50 90 Z M30 50 L50 10 L70 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="artwork-sway" />;
  if (archetype === 'three_of_cups') return <g stroke="currentColor" strokeWidth="2" className="artwork-pulse"><circle cx="50" cy="50" r="10" /><circle cx="35" cy="75" r="10" /><circle cx="65" cy="75" r="10" /></g>;
  if (archetype === 'hermit') return <path d="M50 30 V110 M40 40 H60 M45 100 H55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="artwork-dim" />;
  if (archetype === 'strength') return <path d="M30 70 Q50 30 70 70 T30 110" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="artwork-lean" />;
  if (archetype === 'tower') return <path d="M40 120 V40 H60 V120 M35 40 H65 M45 20 L55 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="artwork-shake" />;
  return null;
}

function decodeVisualStoryPayload(value: string | null): VisualStoryPayload | null {
  return validVisualStoryPayload(decodeBase64Json(value));
}

function decodeBase64Json(value: string | null): unknown {
  if (!value) return null;
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0))));
  } catch {
    return null;
  }
}

function validVisualStoryPayload(value: unknown): VisualStoryPayload | null {
  if (!value || typeof value !== 'object') return null;
  const payload = value as Record<string, unknown>;
  if (!payload.story || typeof payload.story !== 'object' || !payload.basis || typeof payload.basis !== 'object') return null;
  const story = payload.story as Record<string, unknown>;
  const basis = payload.basis as Record<string, unknown>;
  const primary = validVisualCard(story.primary);
  const secondary = story.secondary == null ? null : validVisualCard(story.secondary);
  const tertiary = story.tertiary == null ? null : validVisualCard(story.tertiary);
  if (story.should_show !== true || !['self', 'interaction', 'family'].includes(String(story.mode)) || !primary) return null;
  if ((story.mode === 'interaction' && !secondary) || (story.mode === 'family' && (!secondary || !tertiary))) return null;
  for (const key of ['origin', 'shadow', 'gift', 'current', 'next_step', 'visual_reason']) {
    if (typeof story[key] !== 'string' || !story[key].trim()) return null;
  }
  const basisKeys = ['human_design', 'gene_keys', 'astrology', 'relationship', 'live', 'numerology'] as const;
  if (basis.user_confirmed !== true || basisKeys.some((key) => !Array.isArray(basis[key]) || !(basis[key] as unknown[]).every((item) => typeof item === 'string'))) return null;
  return {
    story: {
      should_show: true,
      mode: story.mode as VisualStoryPayload['story']['mode'],
      primary,
      secondary,
      tertiary,
      origin: story.origin as string,
      shadow: story.shadow as string,
      gift: story.gift as string,
      current: story.current as string,
      next_step: story.next_step as string,
      visual_reason: story.visual_reason as string
    },
    basis: basis as VisualStoryPayload['basis']
  };
}

function validVisualCard(value: unknown): VisualCard | null {
  if (!value || typeof value !== 'object') return null;
  const card = value as Record<string, unknown>;
  const archetypes = ['fool', 'magician', 'three_of_cups', 'hermit', 'strength', 'tower'];
  const phases = ['origin', 'shadow', 'gift'];
  if (!archetypes.includes(String(card.archetype)) || typeof card.title !== 'string' || !card.title.trim() || !phases.includes(String(card.phase))) return null;
  return card as VisualCard;
}

function validModuleOffer(value: unknown): ModuleOffer | null {
  if (!value || typeof value !== 'object') return null;
  const title = (value as Record<string, unknown>).title;
  return typeof title === 'string' && title.trim() && title.length <= 140 ? { title: title.trim() } : null;
}

function decodeHeaderTitle(value: string | null): string {
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}

function archetypeMark(archetype: VisualCard['archetype']): string {
  return ({ fool: '0', magician: 'I', three_of_cups: 'III', hermit: 'IX', strength: 'VIII', tower: 'XVI' })[archetype];
}

function textOr(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
