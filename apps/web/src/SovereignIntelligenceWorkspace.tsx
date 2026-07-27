import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';
type ApiState = 'idle' | 'loading' | 'ready' | 'error';
type Json = Record<string, any>;
type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string; context?: Json; createdAt?: string };
type ThreadSummary = { id: string; title: string; updatedAt?: string; covenantEnabled?: boolean };

type WorkspaceState = {
  today: Json | null;
  people: Json[];
  systems: Json[];
  library: Json[];
  billing: Json | null;
  threads: ThreadSummary[];
};

const surfaces: Array<{ name: Surface; label: string; description: string }> = [
  { name: 'Today', label: 'Today', description: 'Your Baseline, alive today' },
  { name: 'Explore', label: 'Explore', description: 'Open any part of yourself' },
  { name: 'People', label: 'People', description: 'Two Baselines, one relationship' },
  { name: 'Systems', label: 'Systems', description: 'See the whole system' },
  { name: 'Library', label: 'Library', description: 'Keep what changes understanding' },
  { name: 'You', label: 'You', description: 'Your design and control' }
];

const promptSets: Record<Surface, string[]> = {
  Today: [
    'What remains steady in me today?',
    'What may be receiving more emphasis right now?',
    'Where could this move into shadow?',
    'What would the clearer expression look like?'
  ],
  Explore: [
    'Show me a part of my Baseline I may not recognize yet.',
    'Help me examine whether this choice fits who I am.',
    'What is this response trying to protect?',
    'What would a more integrated expression look like?'
  ],
  People: [
    'What are we each bringing into this relationship?',
    'How might this feel from the other side?',
    'Where do our communication needs differ?',
    'What belongs to me, and what belongs to them?'
  ],
  Systems: [
    'What role does each person occupy in this system?',
    'Where is responsibility concentrating?',
    'What changes if I stop carrying this role?',
    'Which perspectives are missing?'
  ],
  Library: [
    'Continue from a saved understanding.',
    'Connect two saved understandings.',
    'What has changed since I saved this?',
    'Apply this understanding to what is happening now.'
  ],
  You: [
    'Explain one Baseline quality in plain language.',
    'How does my Baseline shape communication?',
    'What do shadow and light mean for me?',
    'What can change without changing who I am?'
  ]
};

export function SovereignIntelligenceWorkspace() {
  const [surface, setSurface] = useState<Surface>('Today');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState(() => newThreadId('Today'));
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [covenantEnabled, setCovenantEnabled] = useState(false);
  const [status, setStatus] = useState('Loading your workspace…');
  const [apiState, setApiState] = useState<ApiState>('idle');
  const [workspace, setWorkspace] = useState<WorkspaceState>({ today: null, people: [], systems: [], library: [], billing: null, threads: [] });

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
      const problem = typeof body === 'object' && body ? body as Json : {};
      throw new Error(problem.message || problem.error || 'That request could not be completed.');
    }
    return body as Json;
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
      setWorkspace({
        threads: threadData.threads ?? [],
        people: peopleData.people ?? [],
        systems: systemData.systems ?? [],
        library: libraryData.understandings ?? [],
        billing: billingData,
        today: todayData.today ?? null
      });
      setStatus('Ready');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Some workspace context is unavailable.');
    }
  }

  useEffect(() => { void refreshWorkspace(); }, []);

  const selectedPersonRecord = useMemo(
    () => workspace.people.find((person) => person.id === selectedPerson) ?? null,
    [workspace.people, selectedPerson]
  );
  const selectedSystemRecord = useMemo(
    () => workspace.systems.find((system) => system.id === selectedSystem) ?? null,
    [workspace.systems, selectedSystem]
  );
  const contextItems = [
    'Your Baseline',
    workspace.today?.current ? 'Live Sky' : '',
    selectedPersonRecord?.displayName ? selectedPersonRecord.displayName : '',
    selectedSystemRecord?.name ? selectedSystemRecord.name : '',
    covenantEnabled ? 'Covenant' : ''
  ].filter(Boolean);

  function openSurface(next: Surface) {
    setSurface(next);
    setContextOpen(true);
    setMobileNavOpen(false);
  }

  function startNewThread(nextSurface: Surface = surface) {
    setThreadId(newThreadId(nextSurface));
    setMessages([]);
    setDraft('');
    setCovenantEnabled(false);
    setApiState('idle');
    setStatus('Ready');
  }

  async function openThread(id: string) {
    setStatus('Opening conversation…');
    try {
      const data = await api(`/api/v1/threads/${encodeURIComponent(id)}`);
      const restored = data.messages ?? [];
      setMessages(restored);
      setThreadId(id);
      const lastContext = [...restored].reverse().find((message: ChatMessage) => message.context)?.context ?? {};
      setSelectedPerson(validClientId(lastContext.personId) ? lastContext.personId : '');
      setSelectedSystem(validClientId(lastContext.systemId) ? lastContext.systemId : '');
      setCovenantEnabled(workspace.threads.find((thread) => thread.id === id)?.covenantEnabled === true);
      setStatus('Conversation restored.');
      setMobileNavOpen(false);
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
    setStatus('Sovereign is connecting your question to the context that belongs…');
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
        const problem = await response.json().catch(() => ({})) as Json;
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
      setWorkspace((current) => ({ ...current, threads: threadData.threads ?? [] }));
    } catch (error) {
      setApiState('error');
      setMessages((current) => current.map((item) => item.id === assistantId
        ? { ...item, text: error instanceof Error ? error.message : 'Sovereign could not complete this response.' }
        : item));
      setStatus('Needs attention');
    }
  }

  async function saveLatest() {
    const last = [...messages].reverse().find((message) => message.role === 'assistant' && message.text.trim());
    if (!last || !window.confirm('Save this understanding to your private Library?')) return;
    await api('/api/v1/library', {
      method: 'POST',
      body: JSON.stringify({
        title: workspace.threads.find((item) => item.id === threadId)?.title ?? `${surface} understanding`,
        summary: last.text,
        threadId,
        type: responseType(surface, covenantEnabled),
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
    if (!window.confirm(`${enabled ? 'Enable' : 'Disable'} the optional Covenant lens for this conversation?`)) return;
    await api(`/api/v1/threads/${encodeURIComponent(threadId)}/covenant`, {
      method: 'POST',
      body: JSON.stringify({ enabled, bibleTranslation: enabled ? 'WEB' : undefined, personId: selectedPerson || undefined, subject: 'this conversation' })
    });
    setCovenantEnabled(enabled);
    setStatus(enabled ? 'Covenant is on for this conversation.' : 'Covenant is off for this conversation.');
  }

  const latestAssistant = [...messages].reverse().find((message) => message.role === 'assistant' && message.text.trim())?.text ?? '';

  return (
    <div className={`intelligence-workspace ${contextOpen ? 'context-open' : ''} ${mobileNavOpen ? 'nav-open' : ''}`}>
      <aside className="intelligence-sidebar" aria-label="Workspace navigation">
        <a className="intelligence-brand" href="/app"><span>S</span><strong>SOVEREIGN.OS</strong></a>
        <button className="new-conversation" onClick={() => startNewThread()}>＋ New conversation</button>
        <nav>
          <p>EXPLORE</p>
          {surfaces.map((item) => (
            <button key={item.name} className={surface === item.name ? 'active' : ''} onClick={() => openSurface(item.name)}>
              <span aria-hidden="true">{surfaceIcon(item.name)}</span>
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </nav>
        <section className="recent-threads">
          <p>RECENT</p>
          {workspace.threads.length === 0 && <span>Your conversations will appear here.</span>}
          {workspace.threads.slice(0, 12).map((thread) => (
            <button key={thread.id} onClick={() => void openThread(thread.id)}>{thread.title}</button>
          ))}
        </section>
        <button className="plan-chip" onClick={() => openSurface('You')}>
          <span>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'S+' : 'S'}</span>
          <span><strong>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free plan'}</strong><small>Baseline and account</small></span>
        </button>
      </aside>

      <main className="intelligence-main">
        <header className="intelligence-topbar">
          <button className="mobile-nav-trigger" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">S</button>
          <div><strong>Sovereign</strong><span>{surface} · {surfaces.find((item) => item.name === surface)?.description}</span></div>
          <div className="topbar-actions">
            <span className={`workspace-status ${apiState}`}>{status}</span>
            <button onClick={() => setContextOpen((open) => !open)}>{contextOpen ? 'Hide context' : 'Show context'}</button>
          </div>
        </header>

        <section className="context-bar" aria-label="Active context">
          <strong>Considering</strong>
          {contextItems.map((item) => <span key={item}>{item}</span>)}
          <button onClick={() => { setSelectedPerson(''); setSelectedSystem(''); }}>Clear people and systems</button>
        </section>

        <section className="intelligence-scroll" aria-live="polite">
          {messages.length === 0
            ? <SurfaceHome
                surface={surface}
                workspace={workspace}
                selectedPerson={selectedPersonRecord}
                selectedSystem={selectedSystemRecord}
                onPrompt={setDraft}
                onSurface={openSurface}
              />
            : <ResponseThread
                messages={messages}
                surface={surface}
                covenantEnabled={covenantEnabled}
                selectedPerson={selectedPersonRecord}
                selectedSystem={selectedSystemRecord}
                onSave={() => void saveLatest()}
                onCorrection={(value) => void saveCorrection(value)}
              />}
        </section>

        <form className="sovereign-composer" onSubmit={submit}>
          {surface === 'Explore' && <AlignmentNeedle text={latestAssistant} active={messages.length > 0} compact />}
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={composerPlaceholder(surface)}
            rows={2}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div>
            <button type="button" className="composer-context-button" onClick={() => setContextOpen(true)}>{contextItems.join(' · ')}</button>
            <span>Enter to send · Shift + Enter for a new line</span>
            <button className="composer-send" disabled={!draft.trim() || apiState === 'loading'} aria-label="Send message">↑</button>
          </div>
        </form>
      </main>

      <aside className="intelligence-context" aria-label={`${surface} controls`}>
        <header><div><p>CONTEXT</p><h2>{surface}</h2></div><button onClick={() => setContextOpen(false)} aria-label="Close context">×</button></header>
        <div className="context-scroll">
          <ContextPanel
            surface={surface}
            workspace={workspace}
            selectedPerson={selectedPerson}
            selectedSystem={selectedSystem}
            covenantEnabled={covenantEnabled}
            api={api}
            refresh={refreshWorkspace}
            setSelectedPerson={(id) => { setSelectedPerson(id); if (id) setSelectedSystem(''); }}
            setSelectedSystem={(id) => { setSelectedSystem(id); if (id) setSelectedPerson(''); }}
            setDraft={(value) => { setDraft(value); setContextOpen(false); }}
            changeCovenant={changeCovenant}
          />
        </div>
      </aside>

      {mobileNavOpen && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      {contextOpen && <button className="context-backdrop-v2" aria-label="Close context" onClick={() => setContextOpen(false)} />}
    </div>
  );
}

function SurfaceHome({ surface, workspace, selectedPerson, selectedSystem, onPrompt, onSurface }: {
  surface: Surface;
  workspace: WorkspaceState;
  selectedPerson: Json | null;
  selectedSystem: Json | null;
  onPrompt: (prompt: string) => void;
  onSurface: (surface: Surface) => void;
}) {
  const today = workspace.today;
  if (surface === 'Today') return (
    <div className="surface-home today-home">
      <div className="surface-heading"><p>YOUR BASELINE, ALIVE TODAY</p><h1>See what remains yours—and what may be louder now.</h1><span>Start with a meaningful view before you ask a question.</span></div>
      <div className="today-grid">
        <BaselineCore today={today} />
        <TodaySummary today={today} />
      </div>
      <PromptGrid prompts={promptSets.Today} onPrompt={onPrompt} />
    </div>
  );

  if (surface === 'Explore') return (
    <div className="surface-home">
      <div className="surface-heading"><p>OPEN ANY PART OF YOURSELF</p><h1>Explore your design in the life you are actually living.</h1><span>Choose a mode or ask in your own words.</span></div>
      <div className="explore-mode-grid">
        <ModeCard label="MY BASELINE" title="Understand a quality, role, strength, or tension." prompt="Show me a part of my Baseline I may not recognize yet." onPrompt={onPrompt} />
        <ModeCard label="SHADOW & LIGHT" title="See what a quality protects and what it can become." prompt="Show me the shadow and light of a part of my Baseline." onPrompt={onPrompt} />
        <ModeCard label="ALIGNMENT" title="Examine whether a choice supports you or costs you." prompt="Help me examine whether this choice fits who I am." onPrompt={onPrompt} featured />
        <ModeCard label="GROWTH" title="Understand what may be asking to develop now." prompt="What part of myself is asking to develop now?" onPrompt={onPrompt} />
      </div>
      <AlignmentNeedle text="" active={false} />
    </div>
  );

  if (surface === 'People') return (
    <div className="surface-home">
      <div className="surface-heading"><p>TWO PEOPLE · TWO BASELINES · ONE RELATIONSHIP</p><h1>See what each person brings—and what the relationship creates between you.</h1><span>No compatibility score. No winner and loser.</span></div>
      {selectedPerson
        ? <PerspectiveSplit person={selectedPerson} today={today} onPrompt={onPrompt} />
        : <EmptyState title="Choose a permitted person" body="Add or select someone in Context. Shared comparison begins only after they choose what to allow." action="Open People controls" onAction={() => onSurface('People')} />}
    </div>
  );

  if (surface === 'Systems') return (
    <div className="surface-home">
      <div className="surface-heading"><p>SEE THE WHOLE SYSTEM</p><h1>Map roles, pressure, authority, and responsibility across the group.</h1><span>A family or team is more than its loudest person.</span></div>
      {selectedSystem
        ? <SystemMap system={selectedSystem} people={workspace.people} onPrompt={onPrompt} />
        : <EmptyState title="Choose a system" body="Create or select a family, household, team, or group in Context." action="Open System controls" onAction={() => onSurface('Systems')} />}
    </div>
  );

  if (surface === 'Library') return (
    <div className="surface-home">
      <div className="surface-heading"><p>KEEP WHAT CHANGES HOW YOU UNDERSTAND</p><h1>Your saved intelligence, organized by what it helps you see.</h1><span>Only material you deliberately save appears here.</span></div>
      <LibraryGrid library={workspace.library} onPrompt={onPrompt} />
    </div>
  );

  return (
    <div className="surface-home">
      <div className="surface-heading"><p>YOUR DESIGN · YOUR PEOPLE · YOUR CONTROL</p><h1>Manage the personal foundation beneath every conversation.</h1><span>Your plan, Baseline, permissions, faith lens, and account controls remain yours.</span></div>
      <BaselineCore today={today} />
    </div>
  );
}

function BaselineCore({ today }: { today: Json | null }) {
  const baseline = today?.baseline ?? {};
  const current = today?.current ?? {};
  const tendency = firstText(
    baseline?.reducedContext?.baselineTendency,
    baseline?.reducedContext?.coreOrientation,
    baseline?.summary,
    baseline?.status === 'completed' ? 'Your Baseline is ready to explore.' : 'Build your Baseline to create your personal foundation.'
  );
  const light = firstText(baseline?.reducedContext?.lightExpression, baseline?.reducedContext?.integratedExpression, 'A clearer expression becomes visible through exploration.');
  const shadow = firstText(baseline?.reducedContext?.shadowExpression, baseline?.reducedContext?.pressureResponse, 'Pressure can change how the same quality is expressed.');
  const aligned = firstText(baseline?.reducedContext?.alignedExpression, baseline?.reducedContext?.supportiveDirection, 'Alignment preserves the quality without requiring self-abandonment.');
  const active = firstText(current?.reduced?.possibleCurrentAmplification, 'Current timing remains a separate layer around your Baseline.');
  return (
    <section className="baseline-core-card" aria-label="Your Baseline Design and current timing">
      <header><span>YOUR BASELINE CORE</span><strong>{baseline?.status === 'completed' || baseline?.status === 'partial' ? 'PERSONAL · ACTIVE' : 'READY TO BUILD'}</strong></header>
      <div className="baseline-core-visual">
        <div className="live-sky-halo"><i /><i /><i /></div>
        <div className="baseline-ring baseline-ring-one" />
        <div className="baseline-ring baseline-ring-two" />
        <div className="baseline-node node-shadow"><span>UNDER PRESSURE</span><strong>{shorten(shadow, 54)}</strong></div>
        <div className="baseline-node node-light"><span>CLEAR EXPRESSION</span><strong>{shorten(light, 54)}</strong></div>
        <div className="baseline-node node-aligned"><span>ALIGNMENT</span><strong>{shorten(aligned, 54)}</strong></div>
        <div className="baseline-center"><span>YOU</span><strong>{shorten(tendency, 72)}</strong></div>
      </div>
      <footer><span>LIVE SKY</span><p>{active}</p></footer>
    </section>
  );
}

function TodaySummary({ today }: { today: Json | null }) {
  const baseline = today?.baseline ?? {};
  const current = today?.current ?? {};
  const rows = [
    ['What remains yours', firstText(baseline?.reducedContext?.baselineTendency, 'Your stable Baseline remains the foundation.')],
    ['What is louder now', firstText(current?.reduced?.possibleCurrentAmplification, 'No current emphasis is being treated as fact.')],
    ['Your experience', firstText(current?.reduced?.knownObservation, 'You decide what fits your real experience today.')],
    ['Still unknown', firstText(current?.reduced?.unknownActualState, 'Sovereign does not claim what the available context cannot establish.')]
  ];
  return <section className="today-summary"><header><p>TODAY</p><h2>Baseline + current emphasis</h2></header>{rows.map(([label, value]) => <article key={label}><span>{label}</span><p>{value}</p></article>)}</section>;
}

function AlignmentNeedle({ text, active, compact = false }: { text: string; active: boolean; compact?: boolean }) {
  const result = alignmentFromText(text, active);
  const style = { '--alignment-position': `${result.position}%` } as CSSProperties;
  return (
    <section className={`alignment-instrument ${compact ? 'compact' : ''}`} style={style} aria-label={`Alignment view: ${result.label}`}>
      <header><div><p>ALIGNMENT</p><h3>{result.label}</h3></div><span>{result.confidence}</span></header>
      <div className="alignment-arc"><span>Shadow pull</span><i className="alignment-track"><b /></i><span>Aligned expression</span></div>
      {!compact && <p>{result.explanation}</p>}
    </section>
  );
}

function PerspectiveSplit({ person, today, onPrompt }: { person: Json; today: Json | null; onPrompt: (prompt: string) => void }) {
  const self = firstText(today?.baseline?.reducedContext?.baselineTendency, 'Your Baseline perspective');
  const other = firstText(person?.sharedBaseline?.baselineTendency, person?.baselineSummary, person?.baselineStatus === 'completed' ? 'Their permitted Baseline is available.' : 'Their permitted Baseline is still limited.');
  return (
    <section className="perspective-split">
      <article><span>YOU</span><h2>{shorten(self, 90)}</h2><p>Your experience and responsibility remain distinct.</p></article>
      <div><span>RELATIONSHIP</span><strong>What happens between two different ways of perceiving, protecting, and responding.</strong><button onClick={() => onPrompt(`What are ${person.displayName ?? 'this person'} and I each bringing into this relationship?`)}>Explore the relationship</button></div>
      <article><span>{String(person.displayName ?? 'THEM').toUpperCase()}</span><h2>{shorten(other, 90)}</h2><p>Possible perspective based only on information they permitted.</p></article>
    </section>
  );
}

function SystemMap({ system, people, onPrompt }: { system: Json; people: Json[]; onPrompt: (prompt: string) => void }) {
  const memberIds = new Set((system.members ?? []).map((member: Json) => member.personId ?? member.id));
  const members = people.filter((person) => memberIds.has(person.id));
  const visible = members.length > 0 ? members : people.filter((person) => person.identityBound).slice(0, 5);
  return (
    <section className="system-map-card">
      <header><div><p>{String(system.systemType ?? 'SYSTEM').replace('_', ' ').toUpperCase()}</p><h2>{system.name ?? 'Your system'}</h2></div><button onClick={() => onPrompt(`What role does each person occupy in ${system.name ?? 'this system'}?`)}>Explore this system</button></header>
      <div className="system-map-field">
        <div className="system-center"><span>SYSTEM</span><strong>{system.name ?? 'Shared context'}</strong></div>
        {(visible.length > 0 ? visible : [{ id: 'you', displayName: 'You' }]).map((person, index, array) => {
          const angle = (index / array.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(angle) * 36;
          const y = 50 + Math.sin(angle) * 34;
          return <article key={person.id ?? index} style={{ left: `${x}%`, top: `${y}%` }}><span>{person.identityBound ? 'PERMITTED' : 'LIMITED'}</span><strong>{person.displayName ?? person.name ?? 'You'}</strong><small>{firstText(person.role, person.metadata?.formalRole, 'Member')}</small></article>;
        })}
      </div>
      <footer><span>Roles</span><span>Pressure</span><span>Perspective</span><span>Authority</span><span>Change</span><span>Alignment</span></footer>
    </section>
  );
}

function ResponseThread({ messages, surface, covenantEnabled, selectedPerson, selectedSystem, onSave, onCorrection }: {
  messages: ChatMessage[];
  surface: Surface;
  covenantEnabled: boolean;
  selectedPerson: Json | null;
  selectedSystem: Json | null;
  onSave: () => void;
  onCorrection: (value: 'yes' | 'partly' | 'not_today') => void;
}) {
  return (
    <div className="response-thread">
      {messages.map((message) => message.role === 'user'
        ? <article key={message.id} className="user-question"><span>YOU</span><p>{message.text}</p></article>
        : <article key={message.id} className="sovereign-response"><span className="response-mark">S</span>{message.text ? <StructuredResponse text={message.text} surface={surface} /> : <p className="thinking">Connecting the relevant context…</p>}</article>)}
      {messages.some((message) => message.role === 'assistant' && message.text.trim()) && (
        <>
          {surface === 'Explore' && <AlignmentNeedle text={[...messages].reverse().find((message) => message.role === 'assistant')?.text ?? ''} active />}
          {surface === 'People' && selectedPerson && <PerspectiveSplit person={selectedPerson} today={null} onPrompt={() => undefined} />}
          {surface === 'Systems' && selectedSystem && <SystemMap system={selectedSystem} people={[]} onPrompt={() => undefined} />}
          {covenantEnabled && <ScriptureDrawer text={[...messages].reverse().find((message) => message.role === 'assistant')?.text ?? ''} />}
          <div className="response-controls"><button onClick={onSave}>Save to Library</button><span>Does this fit?</span><button onClick={() => onCorrection('yes')}>Yes</button><button onClick={() => onCorrection('partly')}>Partly</button><button onClick={() => onCorrection('not_today')}>Not today</button></div>
        </>
      )}
    </div>
  );
}

function StructuredResponse({ text, surface }: { text: string; surface: Surface }) {
  const sections = responseSections(text);
  return (
    <div className="structured-response">
      <header><p>{responseType(surface, false).replace('_', ' ').toUpperCase()}</p><h2>{sections[0]?.title ?? 'A clearer view'}</h2></header>
      {sections.map((section, index) => <section key={`${section.title}-${index}`} className={index === 0 ? 'direct-answer' : ''}><span>{section.title}</span><p>{section.body}</p></section>)}
      <aside><strong>What remains yours</strong><p>This interpretation is a possibility grounded in the available context. Your experience can confirm, correct, or reject it.</p></aside>
    </div>
  );
}

function ScriptureDrawer({ text }: { text: string }) {
  const references = Array.from(new Set(text.match(/\b(?:Genesis|Exodus|Psalms?|Proverbs|Matthew|Mark|Luke|John|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|James|Peter|Hebrews)\s+\d+(?::\d+(?:-\d+)?)?/gi) ?? [])).slice(0, 4);
  return (
    <details className="scripture-drawer" open>
      <summary><span>COVENANT</span><strong>Scripture, teaching, and application</strong></summary>
      <div><article><span>SCRIPTURE</span><p>{references.length ? references.join(' · ') : 'No passage should be treated as cited unless a clear reference appears in the response.'}</p></article><article><span>TEACHING</span><p>Christian teaching remains distinct from Baseline interpretation.</p></article><article><span>APPLICATION</span><p>The application is offered for reflection, never as a claim that God issued a direct instruction.</p></article></div>
    </details>
  );
}

function ContextPanel(props: {
  surface: Surface;
  workspace: WorkspaceState;
  selectedPerson: string;
  selectedSystem: string;
  covenantEnabled: boolean;
  api: (path: string, init?: RequestInit) => Promise<Json>;
  refresh: () => Promise<void>;
  setSelectedPerson: (id: string) => void;
  setSelectedSystem: (id: string) => void;
  setDraft: (value: string) => void;
  changeCovenant: (enabled: boolean) => Promise<void>;
}) {
  if (props.surface === 'Today') return <TodaySummary today={props.workspace.today} />;
  if (props.surface === 'Explore') return <div className="context-stack"><p className="context-intro">Choose a direction. The visual instrument will remain separate from confidence and uncertainty.</p>{promptSets.Explore.map((prompt) => <button className="context-prompt" key={prompt} onClick={() => props.setDraft(prompt)}>{prompt}</button>)}</div>;
  if (props.surface === 'People') return <PeopleControls {...props} />;
  if (props.surface === 'Systems') return <SystemControls {...props} />;
  if (props.surface === 'Library') return <LibraryGrid library={props.workspace.library} onPrompt={props.setDraft} compact />;
  return <YouControls {...props} />;
}

function PeopleControls({ workspace, selectedPerson, setSelectedPerson, api, refresh }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const selected = workspace.people.find((person: Json) => person.id === selectedPerson);
  async function addPerson() {
    if (!name.trim()) return;
    const data = await api('/api/v1/people', { method: 'POST', body: JSON.stringify({ displayName: name.trim(), role: 'relationship', metadata: { source: 'private-owner-entry' } }) });
    setName('');
    await refresh();
    if (data.person?.id) setSelectedPerson(data.person.id);
  }
  async function invite() {
    if (!selectedPerson || !email.includes('@') || !window.confirm(`Send a private invitation to ${email.trim()}?`)) return;
    await api(`/api/v1/people/${selectedPerson}/invitations/send`, { method: 'POST', body: JSON.stringify({ email: email.trim(), requestedScopes: ['pair.compare', 'trait.display', 'system.include'] }) });
    setEmail('');
    await refresh();
  }
  return <div className="context-stack"><p className="context-intro">Adding a name is not permission. Shared comparison begins only after the other person connects and chooses what to allow.</p><label>Person<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" /></label><button className="secondary-action" onClick={() => void addPerson()}>Add person</button><label>Use in this conversation<select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}><option value="">Only me</option>{workspace.people.map((person: Json) => <option key={person.id} value={person.id}>{person.displayName}</option>)}</select></label>{selected && <div className="permission-card"><span>Account</span><strong>{selected.identityBound ? 'Connected' : 'Not connected'}</strong><span>Baseline</span><strong>{firstText(selected.baselineStatus, 'Unavailable')}</strong></div>}{selected && !selected.identityBound && <><label>Invitation email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="primary-action" onClick={() => void invite()}>Send private invitation</button></>}</div>;
}

function SystemControls({ workspace, selectedSystem, setSelectedSystem, api, refresh }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('family');
  async function createSystem() {
    if (!name.trim()) return;
    const data = await api('/api/v1/systems', { method: 'POST', body: JSON.stringify({ name: name.trim(), systemType: type, metadata: { objective: 'shared clarity' } }) });
    setName('');
    await refresh();
    if (data.system?.id) setSelectedSystem(data.system.id);
  }
  return <div className="context-stack"><p className="context-intro">A System keeps roles, authority, pressure, and responsibility visible across a family, household, team, or group.</p><label>New system<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Family, household, team…" /></label><label>Type<select value={type} onChange={(event) => setType(event.target.value)}>{['family', 'household', 'friendship_group', 'team', 'workplace', 'custom'].map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}</select></label><button className="secondary-action" onClick={() => void createSystem()}>Create system</button><label>Use in this conversation<select value={selectedSystem} onChange={(event) => setSelectedSystem(event.target.value)}><option value="">No system</option>{workspace.systems.map((system: Json) => <option key={system.id} value={system.id}>{system.name}</option>)}</select></label></div>;
}

function YouControls({ workspace, covenantEnabled, changeCovenant, api, refresh }: any) {
  const [certainty, setCertainty] = useState('unknown');
  const [interval, setInterval] = useState<'annual' | 'monthly'>('annual');
  async function buildBaseline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await api('/api/v1/baseline/onboarding', { method: 'POST', body: JSON.stringify(Object.fromEntries(data)) });
    await refresh();
  }
  async function handoff(path: string, body: Json = {}) {
    const data = await api(path, { method: 'POST', body: JSON.stringify(body) });
    const url = data.checkout?.url ?? data.portal?.url;
    if (url) location.assign(url);
  }
  return <div className="context-stack"><section className="control-section"><p>YOUR BASELINE</p><h3>Build once. Explore continuously.</h3><form onSubmit={buildBaseline}><label>Birth date<input type="date" name="birthDate" /></label><label>Birthplace<input name="birthplace" placeholder="City, region, country" /></label><label>Birth-time certainty<select name="birthTimeCertainty" value={certainty} onChange={(event) => setCertainty(event.target.value)}><option value="exact">Exact</option><option value="approximate">Approximate</option><option value="unknown">Unknown</option></select></label>{certainty !== 'unknown' && <label>Birth time<input type="time" name="birthTime" /></label>}<input type="hidden" name="locationPrecision" value="city_or_regional" /><button className="primary-action">Build my Baseline</button></form></section><section className="control-section"><p>PLAN</p><h3>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free plan'}</h3>{workspace.billing?.effective?.plan !== 'sovereign_plus' && <><div className="billing-switch"><button className={interval === 'annual' ? 'active' : ''} onClick={() => setInterval('annual')}>$99 yearly</button><button className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>$20 monthly</button></div><button className="primary-action" onClick={() => void handoff('/api/v1/billing/checkout', { interval })}>Choose Sovereign+</button></>}<button className="secondary-action" onClick={() => void handoff('/api/v1/billing/portal')}>Manage billing</button></section><section className="control-section"><p>CONTROL</p><label className="toggle-row"><span><strong>Covenant</strong><small>Optional Christian and biblical lens for this conversation.</small></span><input type="checkbox" checked={covenantEnabled} onChange={(event) => void changeCovenant(event.target.checked)} /></label><button className="secondary-action" onClick={() => void api('/api/v1/auth/logout', { method: 'POST' }).then(() => location.assign('/'))}>Log out</button></section></div>;
}

function PromptGrid({ prompts, onPrompt }: { prompts: string[]; onPrompt: (prompt: string) => void }) {
  return <div className="prompt-grid">{prompts.map((prompt) => <button key={prompt} onClick={() => onPrompt(prompt)}>{prompt}<span>↗</span></button>)}</div>;
}

function ModeCard({ label, title, prompt, onPrompt, featured = false }: { label: string; title: string; prompt: string; onPrompt: (prompt: string) => void; featured?: boolean }) {
  return <button className={`mode-card ${featured ? 'featured' : ''}`} onClick={() => onPrompt(prompt)}><span>{label}</span><strong>{title}</strong><small>Open this mode →</small></button>;
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><span>NOTHING SELECTED</span><h2>{title}</h2><p>{body}</p><button onClick={onAction}>{action}</button></div>;
}

function LibraryGrid({ library, onPrompt, compact = false }: { library: Json[]; onPrompt: (prompt: string) => void; compact?: boolean }) {
  if (!library.length) return <EmptyState title="Nothing saved yet" body="Save a Sovereign response when it changes how you understand something." action="Start an exploration" onAction={() => onPrompt('Show me a part of my Baseline I may not recognize yet.')} />;
  return <div className={`library-grid ${compact ? 'compact' : ''}`}>{library.map((item) => <button key={item.id} onClick={() => onPrompt(`Continue from this saved understanding: ${item.body?.summary ?? item.summary ?? ''}`)}><span>{firstText(item.body?.type, item.type, 'Saved understanding').replace('_', ' ').toUpperCase()}</span><strong>{item.body?.title ?? item.title ?? 'Saved understanding'}</strong><p>{shorten(item.body?.summary ?? item.summary ?? '', compact ? 120 : 220)}</p><small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Private Library'}</small></button>)}</div>;
}

function responseSections(text: string) {
  const clean = text.replace(/\r/g, '').trim();
  if (!clean) return [];
  const blocks = clean.split(/\n\s*\n+/).map((block) => block.trim()).filter(Boolean);
  return blocks.slice(0, 8).map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const heading = lines[0]?.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '');
    const hasHeading = lines.length > 1 && (lines[0].startsWith('#') || lines[0].endsWith(':') || lines[0].startsWith('**'));
    return {
      title: hasHeading ? heading.replace(/:$/, '') : index === 0 ? 'Direct answer' : `What this may show`,
      body: (hasHeading ? lines.slice(1) : lines).join(' ').replace(/^[-*]\s+/gm, '')
    };
  });
}

function alignmentFromText(text: string, active: boolean) {
  if (!active || !text.trim()) return { position: 50, label: 'Bring a choice into view', confidence: 'Neutral', explanation: 'The instrument remains neutral until enough context is available.' };
  const lower = text.toLowerCase();
  const shadow = countTerms(lower, ['shadow pull', 'self-abandon', 'overextension', 'avoidance', 'reactive', 'cost you', 'conflicts with']);
  const aligned = countTerms(lower, ['aligned expression', 'supports your', 'preserve', 'clearer boundary', 'fits who you are', 'supportive']);
  const mixed = countTerms(lower, ['mixed', 'conditional', 'depends', 'needs to change', 'uncertain', 'more context']);
  const raw = aligned - shadow;
  const position = mixed > Math.max(aligned, shadow) ? 50 : Math.max(12, Math.min(88, 50 + raw * 10));
  const label = position < 30 ? 'Strong shadow pull' : position < 45 ? 'More shadow than alignment' : position < 58 ? 'Mixed or conditional' : position < 75 ? 'Potentially aligned' : 'Strong aligned expression';
  const confidence = text.length > 900 ? 'Strong context' : text.length > 420 ? 'Moderate context' : 'Limited context';
  return { position, label, confidence, explanation: 'The position reflects the response language. Confidence remains separate and uncertainty stays visible.' };
}

function countTerms(text: string, terms: string[]) { return terms.reduce((count, term) => count + (text.includes(term) ? 1 : 0), 0); }
function responseType(surface: Surface, covenant: boolean) { return covenant ? 'covenant_reflection' : surface === 'People' ? 'relationship_understanding' : surface === 'Systems' ? 'system_understanding' : surface === 'Explore' ? 'alignment_exploration' : surface === 'Today' ? 'today_understanding' : 'baseline_understanding'; }
function composerPlaceholder(surface: Surface) { return surface === 'People' ? 'Ask about this relationship…' : surface === 'Systems' ? 'Ask about this system…' : surface === 'Explore' ? 'Bring a choice, behavior, or quality into view…' : 'Ask Sovereign…'; }
function surfaceIcon(surface: Surface) { return ({ Today: '◉', Explore: '✦', People: '◇', Systems: '⌘', Library: '□', You: '○' } as Record<Surface, string>)[surface]; }
function newThreadId(surface: Surface) { return `thread-${Date.now()}-${surface}-${crypto.randomUUID().slice(0, 8)}`.replace(/[^a-z0-9_-]/gi, '-'); }
function validClientId(value: unknown): value is string { return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value); }
function firstText(...values: unknown[]) { return values.find((value) => typeof value === 'string' && value.trim()) as string ?? ''; }
function shorten(value: unknown, max: number) { const text = typeof value === 'string' ? value.trim() : ''; return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text; }
