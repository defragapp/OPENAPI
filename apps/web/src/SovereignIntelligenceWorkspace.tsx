import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';

type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';
type ApiState = 'idle' | 'loading' | 'ready' | 'error';
type Json = Record<string, any>;

type AnswerSectionId =
  | 'steady'
  | 'active_now'
  | 'shadow'
  | 'gift'
  | 'alignment'
  | 'you'
  | 'other'
  | 'interaction'
  | 'system'
  | 'responsibility'
  | 'unknowns'
  | 'experiment';

type AnswerAction = {
  type: 'explore_facet' | 'examine_alignment' | 'open_person' | 'invite_person' | 'open_system' | 'save_to_library' | 'offer_covenant';
  label: string;
  target_id?: string;
};

type PlanAction = {
  type: 'show_plan';
  label: string;
  feature: 'people' | 'systems' | 'library' | 'covenant';
};

type InterfaceActionEnvelope = {
  version: 2;
  primary: AnswerAction | PlanAction | null;
  contextual: Array<AnswerAction | PlanAction>;
  confirmationRequired: true;
};

type SovereignAnswer = {
  version: 'sovereign-answer.v2';
  mode: 'baseline' | 'now' | 'shadow_gift' | 'alignment' | 'relationship' | 'system' | 'covenant';
  depth: 'focused' | 'standard' | 'deep';
  headline: string;
  direct_answer: string;
  sections: Array<{ id: AnswerSectionId; label: string; body: string }>;
  basis_refs: string[];
  correction_prompt: string;
  actions: AnswerAction[];
  confidence: 'confirmed' | 'supported' | 'exploratory';
  safety_mode: 'standard' | 'grounded' | 'escalate';
};

type BasisValue = {
  id: string;
  category: string;
  display: string;
  accessibleLabel: string;
  computedAt: string;
  uncertainty: 'low' | 'medium' | 'high';
  provenance: string;
  subject: 'self' | 'other' | 'relationship';
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  answer?: SovereignAnswer;
  basis?: BasisValue[];
  interfaceActions?: InterfaceActionEnvelope;
  context?: Json;
  createdAt?: string;
};

type ThreadSummary = {
  id: string;
  title: string;
  updatedAt?: string;
  covenantEnabled?: boolean;
  surface?: Surface;
};

type WorkspaceState = {
  today: Json | null;
  people: Json[];
  systems: Json[];
  library: Json[];
  billing: Json | null;
  threads: ThreadSummary[];
};

const surfaces: Array<{ name: Surface; label: string; description: string }> = [
  { name: 'Today', label: 'Today', description: 'What is active now' },
  { name: 'Explore', label: 'Explore', description: 'Understand any part of you' },
  { name: 'People', label: 'People', description: 'Understand both sides' },
  { name: 'Systems', label: 'Systems', description: 'See the whole group' },
  { name: 'Library', label: 'Library', description: 'Keep useful understanding' },
  { name: 'You', label: 'You', description: 'Baseline, plan, and control' }
];

const exploreModes = [
  ['My Baseline', 'Show me a part of my Baseline I may not recognize yet.'],
  ['Shadow & Gift', 'What is the shadow and gift of a quality in my Baseline?'],
  ['Alignment', 'Help me examine whether this choice fits who I am now.'],
  ['Decisions', 'How do I naturally reach a decision, and what changes under pressure?'],
  ['Communication', 'How do I communicate when I feel clear, and what changes under pressure?'],
  ['Love & Relationships', 'How do I tend to give, receive, and protect connection?'],
  ['Learning', 'How do I learn best, and what makes learning harder for me?'],
  ['Leadership', 'What kind of leadership is natural to me?'],
  ['Boundaries', 'How do my strengths affect the way I set boundaries?'],
  ['Pressure & Change', 'How do I respond to pressure and change?'],
  ['Family Role', 'What role may I be carrying in my family, and what remains unconfirmed?']
] as const;

const surfacePrompts: Record<Surface, string[]> = {
  Today: [
    'What remains steady in me?',
    'What may be louder right now?',
    'Which part of my Baseline is becoming more relevant?',
    'Why might an old response feel less useful now?'
  ],
  Explore: exploreModes.slice(0, 4).map(([, prompt]) => prompt),
  People: [
    'Why can the same interaction feel completely different to each of us?',
    'What is each person contributing?',
    'What belongs to me, what belongs to them, and what is created between us?'
  ],
  Systems: [
    'Who is carrying pressure in this system?',
    'Where are authority and responsibility separated?',
    'What changes when one person stops performing a familiar role?'
  ],
  Library: ['Continue from a saved understanding.', 'Apply a saved distinction to what is happening now.'],
  You: ['Explain one Baseline facet in plain language.', 'Which parts of my Baseline are limited by unknown birth time?']
};

export function SovereignIntelligenceWorkspace() {
  const [surface, setSurface] = useState<Surface>('Today');
  const [contextOpen, setContextOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState(() => newThreadId('Today'));
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [covenantEnabled, setCovenantEnabled] = useState(false);
  const [covenantSheetOpen, setCovenantSheetOpen] = useState(false);
  const [status, setStatus] = useState('Loading Sovereign.OS…');
  const [apiState, setApiState] = useState<ApiState>('idle');
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    today: null,
    people: [],
    systems: [],
    library: [],
    billing: null,
    threads: []
  });

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
      location.assign(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`);
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
      setApiState('ready');
      setStatus('Ready');
    } catch (error) {
      setApiState('error');
      setStatus(error instanceof Error ? error.message : 'Some context is unavailable.');
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
    workspace.today?.current?.status === 'ready' ? 'Active now' : '',
    selectedPersonRecord?.displayName ?? '',
    selectedSystemRecord?.name ?? ''
  ].filter(Boolean);

  function startNewThread(nextSurface: Surface = surface) {
    setSurface(nextSurface);
    setThreadId(newThreadId(nextSurface));
    setMessages([]);
    setDraft('');
    setCovenantEnabled(false);
    setCovenantSheetOpen(false);
    setApiState('idle');
    setStatus('Ready');
    setContextOpen(false);
    if (nextSurface !== 'People') setSelectedPerson('');
    if (nextSurface !== 'Systems') setSelectedSystem('');
  }

  function openSurface(next: Surface) {
    if (next !== surface && (messages.length || draft.trim())) startNewThread(next);
    else {
      setSurface(next);
      if (next !== 'People') setSelectedPerson('');
      if (next !== 'Systems') setSelectedSystem('');
    }
    setContextOpen(false);
    setMenuOpen(false);
  }

  async function openThread(id: string) {
    setApiState('loading');
    setStatus('Opening conversation…');
    try {
      const data = await api(`/api/v1/threads/${encodeURIComponent(id)}`);
      const restored = Array.isArray(data.messages)
        ? data.messages.map(normalizeMessage).filter(Boolean) as ChatMessage[]
        : [];
      const lastContext = [...restored].reverse().find((message) => message.context)?.context ?? {};
      const summary = workspace.threads.find((thread) => thread.id === id);
      const restoredSurface = validSurface(lastContext.surface)
        ? lastContext.surface
        : validSurface(summary?.surface)
          ? summary.surface
          : 'Today';
      setMessages(restored);
      setThreadId(id);
      setSurface(restoredSurface);
      setSelectedPerson(validId(lastContext.personId) && restoredSurface === 'People' ? lastContext.personId : '');
      setSelectedSystem(validId(lastContext.systemId) && restoredSurface === 'Systems' ? lastContext.systemId : '');
      setCovenantEnabled(false);
      setApiState('ready');
      setStatus('Conversation restored.');
    } catch (error) {
      setApiState('error');
      setStatus(error instanceof Error ? error.message : 'That conversation is unavailable.');
    }
  }

  async function sendMessage(message: string, covenantForTurn = false) {
    const clean = message.trim();
    if (!clean || apiState === 'loading') return;
    const messageContext = {
      surface,
      personId: selectedPerson || undefined,
      systemId: selectedSystem || undefined,
      covenantEnabled: covenantForTurn
    };
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: clean, context: messageContext };
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage, { id: assistantId, role: 'assistant', text: '', context: messageContext }]);
    setDraft('');
    setApiState('loading');
    setStatus('Sovereign is connecting the relevant context…');
    try {
      const response = await fetch(`/api/v1/threads/${encodeURIComponent(threadId)}/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'accept': 'application/vnd.sovereign.answer+json',
          'x-idempotency-key': crypto.randomUUID()
        },
        body: JSON.stringify({ message: clean, context: messageContext })
      });
      if (response.status === 401) {
        location.assign('/login?returnTo=%2Fapp');
        return;
      }
      const payload = await response.json().catch(() => ({})) as Json;
      if (!response.ok || !isSovereignAnswer(payload.answer)) {
        throw new Error(payload.message || payload.error || 'Sovereign is temporarily unavailable.');
      }
      setMessages((current) => current.map((item) => item.id === assistantId
        ? {
            ...item,
            text: payload.answer.direct_answer,
            answer: payload.answer,
            basis: Array.isArray(payload.basis) ? payload.basis.filter(isBasisValue) : [],
            ...(isInterfaceActionEnvelope(payload.interfaceActions) ? { interfaceActions: payload.interfaceActions } : {})
          }
        : item));
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

  async function submit(event: FormEvent) {
    event.preventDefault();
    await sendMessage(draft);
  }

  async function saveAnswer(answer: SovereignAnswer) {
    if (!window.confirm('Save this understanding to your Library?')) return;
    await api('/api/v1/library', {
      method: 'POST',
      body: JSON.stringify({
        title: answer.headline,
        summary: answer.direct_answer,
        threadId,
        type: `${answer.mode}_understanding`,
        links: { personId: selectedPerson, systemId: selectedSystem },
        uncertainty: answer.confidence
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

  async function useCovenantForQuestion() {
    const latestQuestion = [...messages].reverse().find((message) => message.role === 'user')?.text;
    if (!latestQuestion) return;
    setCovenantSheetOpen(false);
    setStatus('Adding Covenant for this question…');
    await api(`/api/v1/threads/${encodeURIComponent(threadId)}/covenant`, {
      method: 'POST',
      body: JSON.stringify({ enabled: true, bibleTranslation: 'WEB', personId: selectedPerson || undefined, subject: 'this question' })
    });
    setCovenantEnabled(true);
    await sendMessage(`Explore this question through Covenant:\n\n${latestQuestion}`, true);
    await api(`/api/v1/threads/${encodeURIComponent(threadId)}/covenant`, {
      method: 'POST',
      body: JSON.stringify({ enabled: false })
    }).catch(() => undefined);
    setCovenantEnabled(false);
  }

  function handleAnswerAction(action: AnswerAction) {
    if (action.type === 'offer_covenant') return setCovenantSheetOpen(true);
    if (action.type === 'save_to_library') {
      const answer = [...messages].reverse().find((message) => message.answer)?.answer;
      if (answer) void saveAnswer(answer);
      return;
    }
    if (action.type === 'open_person') {
      setSurface('People');
      if (action.target_id) setSelectedPerson(action.target_id);
      setContextOpen(true);
      return;
    }
    if (action.type === 'invite_person') {
      setSurface('People');
      setContextOpen(true);
      return;
    }
    if (action.type === 'open_system') {
      setSurface('Systems');
      if (action.target_id) setSelectedSystem(action.target_id);
      setContextOpen(true);
      return;
    }
    setSurface('Explore');
    setDraft(action.type === 'examine_alignment'
      ? 'Help me examine what supports this choice, what pulls against it, and the real tradeoff.'
      : 'Help me explore the Baseline facet underneath this answer.');
  }

  return (
    <div className={`intelligence-workspace ${contextOpen ? 'context-open' : ''}`}>
      <aside className="intelligence-sidebar" aria-label="Sovereign navigation">
        <a className="intelligence-brand" href="/app"><span aria-hidden="true">S</span><strong>SOVEREIGN.OS</strong></a>
        <button className="new-conversation" onClick={() => startNewThread()}>New exploration</button>
        <nav>
          <p>OPEN</p>
          {surfaces.map((item) => (
            <button key={item.name} className={surface === item.name ? 'active' : ''} onClick={() => openSurface(item.name)}>
              <span aria-hidden="true">{surfaceIcon(item.name)}</span>
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </nav>
        <section className="recent-threads">
          <p>RECENT</p>
          {!workspace.threads.length && <span>Explorations you begin will appear here.</span>}
          {workspace.threads.slice(0, 10).map((thread) => (
            <button key={thread.id} onClick={() => void openThread(thread.id)}>{thread.title}</button>
          ))}
        </section>
        <button className="plan-chip" onClick={() => openSurface('You')}>
          <span>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'S+' : 'S'}</span>
          <span><strong>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free'}</strong><small>Plan and account</small></span>
        </button>
      </aside>

      <main className="intelligence-main">
        <header className="intelligence-topbar">
          <button className="mobile-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open account menu">S</button>
          <div><strong>Sovereign</strong><span>{surface} · {surfaces.find((item) => item.name === surface)?.description}</span></div>
          <div className="topbar-actions">
            <span className={`workspace-status ${apiState}`}>{status}</span>
            <button onClick={() => setContextOpen((open) => !open)}>{contextOpen ? 'Close context' : 'Context'}</button>
          </div>
        </header>

        <section className="context-bar" aria-label="Active context">
          <strong>Considering</strong>
          {contextItems.map((item) => <span key={item}>{item}</span>)}
          {(selectedPerson || selectedSystem) && <button onClick={() => { setSelectedPerson(''); setSelectedSystem(''); }}>Clear</button>}
        </section>

        <section className="intelligence-scroll" aria-live="polite">
          {!messages.length
            ? <SurfaceHome
                surface={surface}
                workspace={workspace}
                selectedPerson={selectedPersonRecord}
                selectedSystem={selectedSystemRecord}
                api={api}
                onPrompt={setDraft}
                onOpenContext={() => setContextOpen(true)}
              />
            : <ResponseThread
                messages={messages}
                onPrompt={setDraft}
                onAction={handleAnswerAction}
                onSave={(answer) => void saveAnswer(answer)}
                onCorrection={(value) => void saveCorrection(value)}
              />}
        </section>

        <form className="sovereign-composer" onSubmit={submit}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={composerPlaceholder(surface)}
            rows={2}
            aria-label={`Ask Sovereign from ${surface}`}
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
            api={api}
            refresh={refreshWorkspace}
            setSelectedPerson={(id) => { setSelectedPerson(id); if (id) setSelectedSystem(''); }}
            setSelectedSystem={(id) => { setSelectedSystem(id); if (id) setSelectedPerson(''); }}
            setDraft={(value) => { setDraft(value); setContextOpen(false); }}
          />
        </div>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Primary navigation">
        {surfaces.filter((item) => item.name !== 'You').map((item) => (
          <button key={item.name} className={surface === item.name ? 'active' : ''} onClick={() => openSurface(item.name)}>
            <span aria-hidden="true">{surfaceIcon(item.name)}</span><small>{item.label}</small>
          </button>
        ))}
      </nav>

      {menuOpen && (
        <ModalDialog className="workspace-sheet" labelledBy="account-sheet-title" onClose={() => setMenuOpen(false)}>
          <button className="sheet-backdrop" aria-label="Close account menu" onClick={() => setMenuOpen(false)} />
          <section>
            <header><h2 id="account-sheet-title">Sovereign.OS</h2><button onClick={() => setMenuOpen(false)} aria-label="Close">×</button></header>
            <button onClick={() => { openSurface('You'); setMenuOpen(false); }}>You · Baseline, plan, permissions, and account</button>
            <button onClick={() => startNewThread()}>New exploration</button>
          </section>
        </ModalDialog>
      )}

      {contextOpen && <button className="context-backdrop" aria-label="Close context" onClick={() => setContextOpen(false)} />}

      {covenantSheetOpen && (
        <ModalDialog className="workspace-sheet" labelledBy="covenant-title" onClose={() => setCovenantSheetOpen(false)}>
          <button className="sheet-backdrop" aria-label="Cancel Covenant" onClick={() => setCovenantSheetOpen(false)} />
          <section className="covenant-confirmation">
            <header><span aria-hidden="true">✝</span><button onClick={() => setCovenantSheetOpen(false)} aria-label="Close">×</button></header>
            <h2 id="covenant-title">Explore this through Covenant?</h2>
            <p>Add Christian teaching and clearly cited Scripture to this question. The grounded Baseline answer will remain separate, and Covenant will not claim God’s exact intent.</p>
            <div><button className="primary-action" onClick={() => void useCovenantForQuestion()}>Use for this question</button><button className="secondary-action" onClick={() => setCovenantSheetOpen(false)}>Cancel</button></div>
          </section>
        </ModalDialog>
      )}

      <span className="covenant-state" aria-live="polite">{covenantEnabled ? 'Covenant is active for this question.' : ''}</span>
    </div>
  );
}

function SurfaceHome({ surface, workspace, selectedPerson, selectedSystem, api, onPrompt, onOpenContext }: {
  surface: Surface;
  workspace: WorkspaceState;
  selectedPerson: Json | null;
  selectedSystem: Json | null;
  api: (path: string, init?: RequestInit) => Promise<Json>;
  onPrompt: (prompt: string) => void;
  onOpenContext: () => void;
}) {
  if (surface === 'Today') {
    const baseline = workspace.today?.baseline;
    const facets = Array.isArray(baseline?.reducedContext?.facetProfile?.facets)
      ? baseline.reducedContext.facetProfile.facets
      : [];
    const current = workspace.today?.current;
    return (
      <div className="surface-home today-home">
        <SurfaceHeading kicker="TODAY" title="What is active for you now?" body="Begin with what remains steady in your Baseline, then see which parts may be more relevant today." />
        {facets.length
          ? <TodayFacetView facets={facets} current={current} />
          : <IncompleteState title="Your Baseline facets are not ready yet." body="Complete or refresh your Baseline before Sovereign presents personalized qualities, Shadow, Gift, or Alignment." action="Open Baseline controls" onAction={onOpenContext} />}
        <QuestionRail prompts={surfacePrompts.Today} onPrompt={onPrompt} />
      </div>
    );
  }
  if (surface === 'Explore') return (
    <div className="surface-home">
      <SurfaceHeading kicker="EXPLORE" title="What do you want to understand?" body="Choose a part of your Baseline or bring your own question. Each mode opens a real exploration." />
      <div className="explore-mode-list">
        {exploreModes.map(([label, prompt]) => <button key={label} onClick={() => onPrompt(prompt)}><span>{label}</span><small>Open exploration</small></button>)}
      </div>
    </div>
  );
  if (surface === 'People') return (
    <div className="surface-home">
      <SurfaceHeading kicker="PEOPLE" title="Understand the relationship from both sides." body="Choose someone who has connected their account and permitted comparison, or invite a person to begin." />
      {selectedPerson
        ? <RelationshipOverview person={selectedPerson} api={api} onPrompt={onPrompt} />
        : <IncompleteState title="Choose a permitted person." body="A name alone does not create access. The other person connects their account and chooses what Sovereign may use." action="Invite or choose someone" onAction={onOpenContext} />}
    </div>
  );
  if (surface === 'Systems') return (
    <div className="surface-home">
      <SurfaceHeading kicker="SYSTEMS" title="See how the whole group functions." body="Choose a family, household, team, workplace, friendship group, or custom system. Keep roles, authority, responsibility, pressure, and perspective in view." />
      {selectedSystem
        ? <SystemOverview system={selectedSystem} api={api} onPrompt={onPrompt} />
        : <IncompleteState title="Choose a system." body="Select a permitted group to see supported roles and connections." action="Choose a system" onAction={onOpenContext} />}
    </div>
  );
  if (surface === 'Library') return (
    <div className="surface-home">
      <SurfaceHeading kicker="LIBRARY" title="Keep what changes your understanding." body="Save useful Baseline insights, alignment distinctions, relationship understandings, and system views. Library is not a journal or transcript archive." />
      <LibraryGrid library={workspace.library} onPrompt={onPrompt} />
    </div>
  );
  return (
    <div className="surface-home">
      <SurfaceHeading kicker="YOU" title="Your Baseline, plan, permissions, and account." body="Use Context to manage the personal foundation and controls beneath every exploration." />
      <AccountSummary workspace={workspace} onOpenContext={onOpenContext} />
    </div>
  );
}

function SurfaceHeading({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return <header className="surface-heading"><p>{kicker}</p><h1>{title}</h1><span>{body}</span></header>;
}

function TodayFacetView({ facets, current }: { facets: Json[]; current: Json }) {
  const facet = (id: string) => facets.find((item) => item.id === id);
  const core = facet('core_orientation') ?? facets[0];
  const shadow = facet('shadow_expression') ?? core;
  const gift = facet('gift_expression') ?? core;
  const alignment = facet('alignment_markers') ?? core;
  const activeIds = current?.status === 'ready' && Array.isArray(current?.reduced?.affectedBaselineFacetIds)
    ? current.reduced.affectedBaselineFacetIds
    : [];
  const active = facets.find((item) => activeIds.includes(item.id));
  const rows = [
    ['Your Baseline', core?.description],
    ['Active now', active ? `${active.title} may be more relevant for a limited time. Current data does not establish behavior.` : 'No unexpired current contact is available.'],
    ['Shadow to notice', shadow?.shadowExpression],
    ['Gift available', gift?.giftExpression],
    ['Alignment question', Array.isArray(alignment?.alignmentMarkers) ? alignment.alignmentMarkers[0] : 'No alignment marker is available yet.']
  ];
  return <section className="today-facet-view">{rows.map(([label, value]) => <article key={label}><span>{label}</span><p>{value || 'This facet is incomplete. Refresh your Baseline to continue.'}</p></article>)}</section>;
}

function RelationshipOverview({ person, api, onPrompt }: { person: Json; api: (path: string, init?: RequestInit) => Promise<Json>; onPrompt: (value: string) => void }) {
  const [comparison, setComparison] = useState<Json | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    void api(`/api/v1/people/${encodeURIComponent(person.id)}/comparison`, { method: 'POST', body: '{}' })
      .then((data) => setComparison(data.comparison ?? null))
      .catch((problem) => setError(problem instanceof Error ? problem.message : 'Comparison unavailable.'));
  }, [person.id]);
  if (error) return <IncompleteState title="This comparison is not available yet." body={error} action="Manage permissions" onAction={openConsentControls} />;
  if (!comparison) return <p className="loading-state">Loading the permitted comparison…</p>;
  const participants = comparison.participants ?? [];
  return (
    <section className="relationship-overview">
      <div className="person-split">
        {participants.slice(0, 2).map((participant: Json, index: number) => (
          <article key={participant.key ?? index}><span>{index === 0 ? 'YOU MAY BE BRINGING' : 'THEY MAY BE BRINGING'}</span><h2>{participant.facets?.[0]?.title ?? 'Permitted Baseline'}</h2><p>{participant.facets?.[0]?.description ?? 'This permitted facet is incomplete.'}</p></article>
        ))}
      </div>
      <article className="relationship-field"><span>WHAT HAPPENS BETWEEN YOU</span><p>Ask Sovereign to synthesize the two permitted facet profiles, the interaction, each person’s responsibility, and what still needs to be asked directly.</p><button onClick={() => onPrompt(`What are ${person.displayName ?? 'this person'} and I each bringing into this relationship?`)}>Explore this relationship</button></article>
    </section>
  );
}

function SystemOverview({ system, api, onPrompt }: { system: Json; api: (path: string, init?: RequestInit) => Promise<Json>; onPrompt: (value: string) => void }) {
  const [analysis, setAnalysis] = useState<Json | null>(null);
  const [activeConnection, setActiveConnection] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    void api(`/api/v1/systems/${encodeURIComponent(system.id)}/analysis`)
      .then((data) => setAnalysis(data.analysis ?? null))
      .catch((problem) => setError(problem instanceof Error ? problem.message : 'System analysis unavailable.'));
  }, [system.id]);
  if (error) return <IncompleteState title="This system is not ready for analysis." body={error} action="Review members" onAction={openConsentControls} />;
  if (!analysis) return <p className="loading-state">Loading the permitted system…</p>;
  const participants = analysis.participants ?? [];
  const edges = analysis.relationshipGraph ?? [];
  const edge = edges[activeConnection];
  return (
    <section className="system-overview">
      <header><div><span>{String(analysis.system?.type ?? 'SYSTEM').replace('_', ' ')}</span><h2>{analysis.system?.label ?? system.name}</h2></div><button onClick={() => onPrompt(`How is ${system.name ?? 'this system'} functioning, and what is each person contributing?`)}>Explore this system</button></header>
      <div className="system-graph" aria-label="Supported system relationships">
        {participants.map((participant: Json, index: number) => {
          const relatedIndex = edges.findIndex((item: Json) => item.from === participant.key || item.to === participant.key);
          return <button
            key={participant.key ?? index}
            className={index === 0 ? 'self' : ''}
            aria-pressed={relatedIndex >= 0 && activeConnection === relatedIndex}
            disabled={relatedIndex < 0}
            onClick={() => setActiveConnection(relatedIndex)}
          ><strong>{participant.label}</strong><small>{participant.role}</small><span>{index === 0 ? 'OWNER' : 'PERMITTED'}</span></button>;
        })}
      </div>
      <div className="connection-focus">
        <span>ACTIVE CONNECTION</span>
        {edge ? <p>{edge.from} → {edge.to} · {edge.type}{edge.detail ? ` · ${edge.detail}` : ''}</p> : <p>No relationship edge is shown until authority, responsibility, reliance, or communication is supplied.</p>}
        {edges.length > 1 && <div>{edges.map((_: Json, index: number) => <button key={index} aria-pressed={activeConnection === index} onClick={() => setActiveConnection(index)}>Connection {index + 1}</button>)}</div>}
      </div>
      <aside><strong>Pressure field</strong><p>{analysis.pressureField?.responsibilityAuthorityMismatch?.[0]?.status ?? 'No responsibility and authority mismatch is confirmed yet.'}</p></aside>
    </section>
  );
}

function ResponseThread({ messages, onPrompt, onAction, onSave, onCorrection }: {
  messages: ChatMessage[];
  onPrompt: (prompt: string) => void;
  onAction: (action: AnswerAction) => void;
  onSave: (answer: SovereignAnswer) => void;
  onCorrection: (value: 'yes' | 'partly' | 'not_today') => void;
}) {
  const latestAnswerId = [...messages].reverse().find((message) => message.answer)?.id;
  return (
    <div className="response-thread">
      {messages.map((message) => message.role === 'user'
        ? <article key={message.id} className="user-question"><span>YOU</span><p>{message.text}</p></article>
        : <article key={message.id} className="sovereign-response">
            <span className="response-mark" aria-hidden="true">S</span>
            {message.answer
              ? <SovereignAnswerView
                  answer={message.answer}
                  basis={message.basis ?? []}
                  {...(message.interfaceActions ? { interfaceActions: message.interfaceActions } : {})}
                  latest={message.id === latestAnswerId}
                  onPrompt={onPrompt}
                  onAction={onAction}
                  onSave={() => onSave(message.answer!)}
                  onCorrection={onCorrection}
                />
              : <p className="thinking">{message.text || 'Connecting the relevant context…'}</p>}
          </article>)}
    </div>
  );
}

function SovereignAnswerView({ answer, basis, interfaceActions, latest, onPrompt, onAction, onSave, onCorrection }: {
  answer: SovereignAnswer;
  basis: BasisValue[];
  interfaceActions?: InterfaceActionEnvelope;
  latest: boolean;
  onPrompt: (prompt: string) => void;
  onAction: (action: AnswerAction) => void;
  onSave: () => void;
  onCorrection: (value: 'yes' | 'partly' | 'not_today') => void;
}) {
  const primaryAction = answer.actions.find((action) => ['explore_facet', 'examine_alignment', 'open_person', 'invite_person', 'open_system'].includes(action.type));
  const covenantAction = answer.actions.find((action) => action.type === 'offer_covenant');
  const saveAction = answer.actions.find((action) => action.type === 'save_to_library');
  const planActions = [interfaceActions?.primary, ...(interfaceActions?.contextual ?? [])]
    .filter((action): action is PlanAction => action?.type === 'show_plan');
  const primaryPlanAction = planActions.find((action) => !['library', 'covenant'].includes(action.feature));
  const covenantPlanAction = planActions.find((action) => action.feature === 'covenant');
  const libraryPlanAction = planActions.find((action) => action.feature === 'library');
  const openPlans = () => location.assign('/pricing.html');
  return (
    <section className={`sovereign-answer answer-${answer.mode}`} aria-label={`${answer.mode.replace('_', ' ')} answer`}>
      <header><span>{modeLabel(answer.mode)}</span><small>{answer.confidence}</small><h2>{answer.headline}</h2></header>
      <p className="direct-answer">{answer.direct_answer}</p>

      {answer.mode === 'alignment'
        ? <AlignmentView sections={answer.sections} />
        : answer.mode === 'relationship'
          ? <RelationshipAnswer sections={answer.sections} />
          : answer.mode === 'system'
            ? <SystemAnswer sections={answer.sections} />
            : answer.mode === 'covenant'
              ? <CovenantAnswer sections={answer.sections} />
              : <div className="answer-sections">{answer.sections.map((section) => <article key={`${section.id}-${section.label}`}><span>{section.label}</span><p>{section.body}</p></article>)}</div>}

      <div className="answer-meta-row">
        <BasisStrip values={basis} />
        {covenantAction && <button className="covenant-action" onClick={() => onAction(covenantAction)}><span aria-hidden="true">✝</span>{covenantAction.label}</button>}
        {!covenantAction && covenantPlanAction && <button className="covenant-action plan-action" onClick={openPlans}><span aria-hidden="true">✝</span>{covenantPlanAction.label}</button>}
      </div>

      {latest && (
        <footer className="answer-actions">
          {primaryAction && <button className="answer-primary" onClick={() => onAction(primaryAction)}>{primaryAction.label}</button>}
          {!primaryAction && primaryPlanAction && <button className="answer-primary plan-action" onClick={openPlans}>{primaryPlanAction.label}</button>}
          {saveAction
            ? <button className="answer-save" onClick={onSave}>Save to Library</button>
            : libraryPlanAction
              ? <button className="answer-save plan-action" onClick={openPlans}>{libraryPlanAction.label}</button>
              : null}
          <div className="fit-controls"><span>{answer.correction_prompt}</span><button onClick={() => onCorrection('yes')}>Yes</button><button onClick={() => onCorrection('partly')}>Partly</button><button onClick={() => onCorrection('not_today')}>Not today</button></div>
          <button className="answer-continue" onClick={() => onPrompt(`Continue from this distinction: ${answer.headline}`)}>Ask a follow-up</button>
        </footer>
      )}
    </section>
  );
}

function AlignmentView({ sections }: { sections: SovereignAnswer['sections'] }) {
  const find = (label: string) => sections.find((section) => section.label.toLowerCase().includes(label));
  const supports = find('supports the fit');
  const pulls = find('pulls against');
  const tradeoff = find('tradeoff');
  const needed = find('still needed');
  const closer = find('closer version');
  return (
    <section className="alignment-view" aria-label="Alignment factors">
      <div><article><span>Supports the fit</span><p>{supports?.body}</p></article><article><span>Pulls against it</span><p>{pulls?.body}</p></article></div>
      <article className="tradeoff-line"><span>The real tradeoff</span><p>{tradeoff?.body}</p></article>
      <div><article><span>Still needed</span><p>{needed?.body}</p></article><article><span>A closer version</span><p>{closer?.body}</p></article></div>
    </section>
  );
}

function RelationshipAnswer({ sections }: { sections: SovereignAnswer['sections'] }) {
  const byId = (id: AnswerSectionId) => sections.find((section) => section.id === id);
  return (
    <section className="relationship-answer">
      <div><article><span>{byId('you')?.label ?? 'You may be bringing'}</span><p>{byId('you')?.body}</p></article><article><span>{byId('other')?.label ?? 'They may be bringing'}</span><p>{byId('other')?.body}</p></article></div>
      <article className="interaction-field"><span>{byId('interaction')?.label ?? 'What happens between you'}</span><p>{byId('interaction')?.body}</p></article>
      {sections.filter((section) => !['you', 'other', 'interaction'].includes(section.id)).map((section) => <article key={`${section.id}-${section.label}`}><span>{section.label}</span><p>{section.body}</p></article>)}
    </section>
  );
}

function SystemAnswer({ sections }: { sections: SovereignAnswer['sections'] }) {
  return <section className="system-answer">{sections.map((section) => <article key={`${section.id}-${section.label}`}><span>{section.label}</span><p>{section.body}</p></article>)}</section>;
}

function CovenantAnswer({ sections }: { sections: SovereignAnswer['sections'] }) {
  return <section className="covenant-answer">{sections.map((section) => <article key={`${section.id}-${section.label}`}><span>{section.label}</span><p>{section.body}</p></article>)}</section>;
}

function BasisStrip({ values }: { values: BasisValue[] }) {
  const [open, setOpen] = useState(false);
  const mobile = useMediaQuery('(max-width: 640px)');
  const limit = mobile ? 3 : 5;
  const visible = values.slice(0, limit);
  if (!values.length) return <span className="basis-empty">BASIS · No exact value selected</span>;
  return (
    <>
      <button className="basis-strip" onClick={() => setOpen(true)} aria-label={`Open Basis sources. ${values.length} exact values available.`}>
        <strong>BASIS</strong>
        {visible.map((value) => <span key={value.id} aria-label={value.accessibleLabel}>{value.display}</span>)}
        {values.length > limit && <b>+{values.length - limit}</b>}
      </button>
      {open && (
        <ModalDialog className="source-drawer" labelledBy="basis-title" onClose={() => setOpen(false)}>
          <button className="sheet-backdrop" onClick={() => setOpen(false)} aria-label="Close Basis sources" />
          <section>
            <header><div><span>EXACT SUPPORT</span><h2 id="basis-title">Basis</h2></div><button onClick={() => setOpen(false)} aria-label="Close">×</button></header>
            <p>These exact values shaped the interpretation. They support reflection; they do not prove a personality or current state.</p>
            <dl>{values.map((value) => <div key={value.id}><dt>{value.display}</dt><dd><span>{value.accessibleLabel}</span><span>Calculated {formatDate(value.computedAt)} · {value.uncertainty} uncertainty</span><span>{value.provenance}</span></dd></div>)}</dl>
          </section>
        </ModalDialog>
      )}
    </>
  );
}

function QuestionRail({ prompts, onPrompt }: { prompts: string[]; onPrompt: (value: string) => void }) {
  return <section className="question-rail"><header><span>ASK FROM HERE</span><h2>Start with the question you already have.</h2></header><div>{prompts.map((prompt) => <button key={prompt} onClick={() => onPrompt(prompt)}>{prompt}</button>)}</div></section>;
}

function IncompleteState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <section className="incomplete-state"><span>INCOMPLETE</span><h2>{title}</h2><p>{body}</p><button onClick={onAction}>{action}</button></section>;
}

function AccountSummary({ workspace, onOpenContext }: { workspace: WorkspaceState; onOpenContext: () => void }) {
  return <section className="account-summary"><article><span>Baseline</span><strong>{workspace.today?.baseline?.status === 'completed' ? 'Ready' : 'Needs attention'}</strong></article><article><span>Plan and billing</span><strong>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free'}</strong></article><article><span>People and permissions</span><strong>{workspace.people.length} connected records</strong></article><button onClick={onOpenContext}>Open account controls</button></section>;
}

function ContextPanel(props: {
  surface: Surface;
  workspace: WorkspaceState;
  selectedPerson: string;
  selectedSystem: string;
  api: (path: string, init?: RequestInit) => Promise<Json>;
  refresh: () => Promise<void>;
  setSelectedPerson: (id: string) => void;
  setSelectedSystem: (id: string) => void;
  setDraft: (value: string) => void;
}) {
  if (props.surface === 'People') return <PeopleControls {...props} />;
  if (props.surface === 'Systems') return <SystemControls {...props} />;
  if (props.surface === 'Library') return <LibraryGrid library={props.workspace.library} onPrompt={props.setDraft} compact />;
  if (props.surface === 'You') return <YouControls {...props} />;
  return <div className="context-stack"><p className="context-intro">Choose a useful question. Exact source data, interpretation, current context, and what remains unknown stay separate.</p>{surfacePrompts[props.surface].map((prompt) => <button className="context-prompt" key={prompt} onClick={() => props.setDraft(prompt)}>{prompt}</button>)}</div>;
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
    await api(`/api/v1/people/${selectedPerson}/invitations/send`, {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), requestedScopes: ['pair.compare', 'trait.display', 'system.include'] })
    });
    setEmail('');
    await refresh();
  }
  return (
    <div className="context-stack">
      <p className="context-intro">Adding a name is not permission. Shared comparison begins only after the other person connects and chooses what to allow.</p>
      <button className="secondary-action" onClick={openConsentControls}>Manage permissions</button>
      <label>Add a person<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" /></label>
      <button className="secondary-action" onClick={() => void addPerson()}>Add person</button>
      <label>Choose a permitted person<select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)}><option value="">Only me</option>{workspace.people.map((person: Json) => <option key={person.id} value={person.id}>{person.displayName}</option>)}</select></label>
      {selected && <div className="permission-card"><span>Account</span><strong>{selected.identityBound ? 'Connected' : 'Not connected'}</strong><span>Baseline</span><strong>{selected.baselineStatus ?? 'Unavailable'}</strong></div>}
      {selected && !selected.identityBound && <><label>Invitation email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button className="primary-action" onClick={() => void invite()}>Send private invitation</button></>}
    </div>
  );
}

function SystemControls({ workspace, selectedSystem, setSelectedSystem, api, refresh }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('family');
  async function createSystem() {
    if (!name.trim()) return;
    const data = await api('/api/v1/systems', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim(), systemType: type, metadata: { sharedObjective: null, constraints: [], observations: [] } })
    });
    setName('');
    await refresh();
    if (data.system?.id) setSelectedSystem(data.system.id);
  }
  return (
    <div className="context-stack">
      <p className="context-intro">A System keeps roles, authority, pressure, and responsibility visible across a family, household, team, or group.</p>
      <label>New system<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Family, household, team…" /></label>
      <label>Type<select value={type} onChange={(event) => setType(event.target.value)}>{['family', 'household', 'friendship_group', 'team', 'workplace', 'custom'].map((item) => <option key={item} value={item}>{systemTypeLabel(item)}</option>)}</select></label>
      <button className="secondary-action" onClick={() => void createSystem()}>Create system</button>
      <label>Choose a system<select value={selectedSystem} onChange={(event) => setSelectedSystem(event.target.value)}><option value="">No system</option>{workspace.systems.map((system: Json) => <option key={system.id} value={system.id}>{system.name}</option>)}</select></label>
      <button className="secondary-action" onClick={openConsentControls}>Review members and permissions</button>
    </div>
  );
}

function YouControls({ workspace, api, refresh }: any) {
  const [certainty, setCertainty] = useState('unknown');
  const [interval, setInterval] = useState<'annual' | 'monthly'>('annual');
  const [currentAction, setCurrentAction] = useState<'idle' | 'loading' | 'error'>('idle');
  const [currentMessage, setCurrentMessage] = useState('');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const current = workspace.today?.current ?? { status: 'not_started' };
  const currentReady = current.status === 'ready';
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
  async function enableCurrentContext() {
    setCurrentAction('loading');
    setCurrentMessage('');
    try {
      const data = await api('/api/v1/current-conditions', {
        method: 'POST',
        body: JSON.stringify({ locationPrecision: 'geocentric' })
      });
      await refresh();
      if (data.current?.providerStatus !== 'computed') {
        setCurrentAction('error');
        setCurrentMessage('Current astronomy is temporarily unavailable. Your stable Baseline remains available.');
        return;
      }
      setCurrentAction('idle');
      setCurrentMessage('Current context is available for the next six hours.');
    } catch (error) {
      setCurrentAction('error');
      setCurrentMessage(error instanceof Error ? error.message : 'Current context is unavailable.');
    }
  }
  async function removeCurrentContext() {
    setCurrentAction('loading');
    setCurrentMessage('');
    try {
      await api('/api/v1/current-conditions', { method: 'DELETE' });
      await refresh();
      setCurrentAction('idle');
      setCurrentMessage('Current context has been removed.');
    } catch (error) {
      setCurrentAction('error');
      setCurrentMessage(error instanceof Error ? error.message : 'Current context could not be removed.');
    }
  }
  return (
    <div className="context-stack account-controls">
      <section className="control-section">
        <p>BASELINE</p><h3>Build your Baseline.</h3><span>Add your birth details to create the personal foundation Sovereign uses across self, decisions, relationships, and systems.</span>
        <form onSubmit={buildBaseline}>
          <label>Birth date<small>Required for the Baseline calculation.</small><input type="date" name="birthDate" required /></label>
          <label>Birthplace<small>Used to resolve time and astronomical context.</small><input name="birthplace" placeholder="City, region, country" required /></label>
          <input type="hidden" name="birthTimezone" value={timezone} />
          <label>Birth-time certainty<small>Tell us whether the time is exact, approximate, or unknown.</small><select name="birthTimeCertainty" value={certainty} onChange={(event) => setCertainty(event.target.value)}><option value="exact">Exact</option><option value="approximate">Approximate</option><option value="unknown">Unknown</option></select></label>
          {certainty !== 'unknown' && <label>Birth time<small>Improves time-sensitive parts of the calculation.</small><input type="time" name="birthTime" required /></label>}
          {certainty === 'unknown' && <p className="field-note">Unknown time is supported. Time-sensitive activations remain unavailable or carry higher uncertainty; Sovereign will not guess them.</p>}
          <input type="hidden" name="locationPrecision" value="city_or_regional" />
          <button className="primary-action">Build my Baseline</button>
        </form>
      </section>
      <section className="control-section">
        <p>CURRENT-CONDITION PERMISSION</p><h3>Current context stays separate.</h3>
        <span>Choose whether Earth-geocentric astronomical context may be added for six hours. Sovereign does not request or store your device location, and current data never determines your behavior.</span>
        <div className="current-permission-state" data-state={currentReady ? 'ready' : current.status}>
          <strong>{currentReady ? 'Current context on' : current.status === 'expired' ? 'Current context expired' : 'Current context off'}</strong>
          <small>{currentReady && current.reduced?.expiresAt ? `Available until ${formatCurrentExpiry(current.reduced.expiresAt)}` : 'Your stable Baseline remains available.'}</small>
        </div>
        <div className="current-permission-actions">
          {!currentReady && <button className="secondary-action" disabled={currentAction === 'loading'} onClick={() => void enableCurrentContext()}>{currentAction === 'loading' ? 'Adding context…' : 'Enable for six hours'}</button>}
          {currentReady && <button className="secondary-action" disabled={currentAction === 'loading'} onClick={() => void enableCurrentContext()}>{currentAction === 'loading' ? 'Refreshing…' : 'Refresh six hours'}</button>}
          {(currentReady || current.status === 'expired') && <button className="quiet-danger-action" disabled={currentAction === 'loading'} onClick={() => void removeCurrentContext()}>Remove current context</button>}
        </div>
        {currentMessage && <span className={`current-permission-message ${currentAction === 'error' ? 'error' : ''}`} role={currentAction === 'error' ? 'alert' : 'status'}>{currentMessage}</span>}
      </section>
      <section className="control-section">
        <p>PEOPLE AND PERMISSIONS</p><h3>Each person controls what is shared.</h3><button className="secondary-action" onClick={openConsentControls}>Manage permissions</button>
      </section>
      <section className="control-section">
        <p>PLAN AND BILLING</p><h3>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free'}</h3>
        {workspace.billing?.effective?.plan !== 'sovereign_plus' && <><div className="billing-switch"><button type="button" className={interval === 'annual' ? 'active' : ''} onClick={() => setInterval('annual')}>$99 / year</button><button type="button" className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>$20 / month</button></div><button className="primary-action" onClick={() => void handoff('/api/v1/billing/checkout', { interval })}>Choose Sovereign+</button></>}
        <button className="secondary-action" onClick={() => void handoff('/api/v1/billing/portal')}>Manage billing</button>
      </section>
      <section className="control-section"><p>PRIVACY AND RETENTION</p><h3>Your controls.</h3><div className="control-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><button onClick={openConsentControls}>Permissions</button></div></section>
      <section className="control-section"><p>ACCOUNT</p><button className="secondary-action" onClick={() => void api('/api/v1/auth/logout', { method: 'POST' }).then(() => location.assign('/'))}>Log out</button></section>
    </div>
  );
}

function formatCurrentExpiry(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'its recorded expiry';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function LibraryGrid({ library, onPrompt, compact = false }: { library: Json[]; onPrompt: (prompt: string) => void; compact?: boolean }) {
  if (!library.length) return <IncompleteState title="Nothing saved yet." body="Save a Sovereign answer when it changes your understanding. Library does not collect unsaved conversations." action="Start an exploration" onAction={() => onPrompt('Show me a part of my Baseline I may not recognize yet.')} />;
  return <div className={`library-grid ${compact ? 'compact' : ''}`}>{library.map((item) => <button key={item.id} onClick={() => onPrompt(`Continue from this saved understanding: ${item.body?.summary ?? item.summary ?? ''}`)}><span>{String(item.body?.type ?? item.type ?? 'Saved understanding').replaceAll('_', ' ').toUpperCase()}</span><strong>{item.body?.title ?? item.title ?? 'Saved understanding'}</strong><p>{shorten(item.body?.summary ?? item.summary ?? '', compact ? 120 : 220)}</p><small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Private Library'}</small></button>)}</div>;
}

function openConsentControls() {
  window.dispatchEvent(new CustomEvent('sovereign:open-consent-controls'));
}

function normalizeMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Json;
  if (!['user', 'assistant'].includes(row.role) || typeof row.text !== 'string') return null;
  return {
    id: typeof row.id === 'string' ? row.id : crypto.randomUUID(),
    role: row.role,
    text: row.text,
    ...(isSovereignAnswer(row.answer) ? { answer: row.answer } : {}),
    ...(Array.isArray(row.basis) ? { basis: row.basis.filter(isBasisValue) } : {}),
    ...(isInterfaceActionEnvelope(row.interfaceActions) ? { interfaceActions: row.interfaceActions } : {}),
    ...(row.context && typeof row.context === 'object' ? { context: row.context } : {}),
    ...(typeof row.createdAt === 'string' ? { createdAt: row.createdAt } : {})
  };
}

function isSovereignAnswer(value: unknown): value is SovereignAnswer {
  if (!value || typeof value !== 'object') return false;
  const answer = value as Json;
  return answer.version === 'sovereign-answer.v2'
    && typeof answer.headline === 'string'
    && typeof answer.direct_answer === 'string'
    && Array.isArray(answer.sections)
    && Array.isArray(answer.actions);
}

function isInterfaceActionEnvelope(value: unknown): value is InterfaceActionEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as Json;
  const actions = [envelope.primary, ...(Array.isArray(envelope.contextual) ? envelope.contextual : [])].filter(Boolean);
  return envelope.version === 2
    && envelope.confirmationRequired === true
    && Array.isArray(envelope.contextual)
    && actions.every((action) => {
      if (!action || typeof action !== 'object' || typeof action.type !== 'string' || typeof action.label !== 'string') return false;
      return ['explore_facet', 'examine_alignment', 'open_person', 'invite_person', 'open_system', 'save_to_library', 'offer_covenant', 'show_plan'].includes(action.type);
    });
}

function isBasisValue(value: unknown): value is BasisValue {
  if (!value || typeof value !== 'object') return false;
  const basis = value as Json;
  return typeof basis.id === 'string'
    && typeof basis.display === 'string'
    && typeof basis.accessibleLabel === 'string'
    && typeof basis.computedAt === 'string'
    && typeof basis.provenance === 'string';
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function ModalDialog({ className, labelledBy, onClose, children }: {
  className: string;
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const first = dialog.current?.querySelector<HTMLElement>('button:not(.sheet-backdrop):not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
    first?.focus();
    return () => previous?.focus();
  }, []);
  function keepFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(.sheet-backdrop):not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]') ?? [])];
    if (!focusable.length) {
      event.preventDefault();
      dialog.current?.focus();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  return <div ref={dialog} className={className} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} onKeyDown={keepFocus}>{children}</div>;
}

function modeLabel(mode: SovereignAnswer['mode']) {
  return ({
    baseline: 'MY BASELINE',
    now: 'ACTIVE NOW',
    shadow_gift: 'SHADOW & GIFT',
    alignment: 'ALIGNMENT',
    relationship: 'RELATIONSHIP',
    system: 'SYSTEM',
    covenant: 'COVENANT'
  } as const)[mode];
}

function composerPlaceholder(surface: Surface) {
  return surface === 'People' ? 'Ask about this relationship…'
    : surface === 'Systems' ? 'Ask about this system…'
      : surface === 'Explore' ? 'Ask about a quality, choice, behavior, or direction…'
        : surface === 'Library' ? 'Continue from something you saved…'
          : 'Ask Sovereign…';
}

function surfaceIcon(surface: Surface) {
  return ({ Today: '◉', Explore: '✦', People: '◇', Systems: '⌘', Library: '□', You: '○' } as Record<Surface, string>)[surface];
}

function newThreadId(surface: Surface) {
  return `thread-${Date.now()}-${surface}-${crypto.randomUUID().slice(0, 8)}`.replace(/[^a-z0-9_-]/gi, '-');
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

function validSurface(value: unknown): value is Surface {
  return typeof value === 'string' && surfaces.some((item) => item.name === value);
}

function shorten(value: unknown, max: number) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function systemTypeLabel(value: string) {
  return ({ friendship_group: 'Friendship group', workplace: 'Workplace', family: 'Family', household: 'Household', team: 'Team', custom: 'Custom system' } as Record<string, string>)[value] ?? value.replace('_', ' ');
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'time unavailable' : date.toLocaleString();
}
