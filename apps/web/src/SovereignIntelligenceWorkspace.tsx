import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';

type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You';
type ApiState = 'idle' | 'loading' | 'ready' | 'error';
type BaselineExperience = 'idle' | 'building' | 'reveal';
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
  { name: 'Today', label: 'Today', description: 'See what is steady and what may matter more now' },
  { name: 'Explore', label: 'Explore', description: 'Ask about yourself or a decision' },
  { name: 'People', label: 'People', description: 'Understand a relationship with permission' },
  { name: 'Systems', label: 'Systems', description: 'See roles, authority, responsibility, and pressure' },
  { name: 'Library', label: 'Library', description: 'Return to insights you chose to save' },
  { name: 'You', label: 'You', description: 'Manage your Baseline, plan, privacy, and account' }
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
    'What stays consistent in me?',
    'What may deserve more attention right now?',
    'Which part of my Baseline may be more relevant for a limited time?',
    'Why might an old response feel less useful now?'
  ],
  Explore: exploreModes.slice(0, 4).map(([, prompt]) => prompt),
  People: [
    'Why can the same interaction feel completely different to each of us?',
    'What may each person be bringing into this relationship?',
    'What belongs to me, what belongs to them, and what happens between us?'
  ],
  Systems: [
    'Who is carrying the pressure in this group?',
    'Who has authority, and who is carrying responsibility?',
    'What changes when one person stops performing a familiar role?'
  ],
  Library: ['Continue from an insight I saved.', 'Apply a saved insight to what is happening now.'],
  You: ['Explain one part of my Baseline in plain language.', 'Which parts of my Baseline are limited by an unknown birth time?']
};

export function SovereignIntelligenceWorkspace({ onboardingVerified = false }: { onboardingVerified?: boolean }) {
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
  const [baselineExperience, setBaselineExperience] = useState<BaselineExperience>('idle');
  const [baselineReveal, setBaselineReveal] = useState<Json | null>(null);
  const [status, setStatus] = useState('Loading Sovereign.OS…');
  const [apiState, setApiState] = useState<ApiState>('loading');
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
      throw new Error(problem.message || problem.error || 'We could not complete that request.');
    }
    return body as Json;
  }

  async function refreshWorkspace() {
    setApiState('loading');
    try {
      if (!onboardingVerified) {
        const onboarding = await api('/api/v1/account/onboarding');
        if (!onboarding.completed) {
          location.assign('/onboarding');
          return;
        }
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
      setStatus(error instanceof Error ? error.message : 'Some information is unavailable.');
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
    workspace.today?.current?.status === 'ready' ? 'Temporary current context' : '',
    selectedPersonRecord?.displayName ?? '',
    selectedSystemRecord?.name ?? ''
  ].filter(Boolean);
  const baselineReady = workspace.today?.baseline?.status === 'completed';

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
    setBaselineExperience('idle');
    setBaselineReveal(null);
    if (nextSurface !== 'People') setSelectedPerson('');
    if (nextSurface !== 'Systems') setSelectedSystem('');
  }

  function openSurface(next: Surface) {
    setBaselineExperience('idle');
    setBaselineReveal(null);
    if (next !== surface && (messages.length || draft.trim())) startNewThread(next);
    else {
      setSurface(next);
      if (next !== 'People') setSelectedPerson('');
      if (next !== 'Systems') setSelectedSystem('');
    }
    setContextOpen(false);
    setMenuOpen(false);
  }

  function beginBaseline() {
    setSurface('Today');
    setMessages([]);
    setDraft('');
    setContextOpen(false);
    setBaselineReveal(null);
    setBaselineExperience('building');
  }

  async function completeBaseline(result: Json) {
    setBaselineReveal(result);
    setBaselineExperience('reveal');
    setApiState('ready');
    setStatus('Your Baseline is ready.');
    try {
      const todayData = await api('/api/v1/today');
      setWorkspace((current) => ({ ...current, today: todayData.today ?? null }));
    } catch {
      // The successful Baseline response still supports the reveal while Today refreshes later.
    }
  }

  function beginFromReveal(prompt?: string) {
    setBaselineExperience('idle');
    setBaselineReveal(null);
    if (prompt) {
      setSurface('Explore');
      setDraft(prompt);
    } else {
      setSurface('Today');
    }
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
    setStatus('Sovereign is using the information selected for this question…');
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
    if (!window.confirm('Save this insight to your Library?')) return;
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
    setStatus('Adding the Christian Scripture perspective to this question…');
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
      : 'Help me explore the part of my Baseline that shaped this answer.');
  }

  return (
    <div className={`intelligence-workspace ${contextOpen ? 'context-open' : ''}`}>
      <aside className="intelligence-sidebar" aria-label="Sovereign navigation">
        <a className="intelligence-brand" href="/app"><span aria-hidden="true">S</span><strong>SOVEREIGN.OS</strong></a>
        <nav>
          {surfaces.map((item) => (
            <button
              key={item.name}
              className={surface === item.name ? 'active' : ''}
              aria-label={`${item.label}: ${item.description}`}
              onClick={() => openSurface(item.name)}
            >
              <strong>{item.label}</strong>
            </button>
          ))}
        </nav>
        {workspace.threads.length > 0 && <section className="recent-threads">
          <p>Recent conversations</p>
          {!workspace.threads.length && <span>Questions you ask will appear here.</span>}
          {workspace.threads.slice(0, 10).map((thread) => (
            <button key={thread.id} onClick={() => void openThread(thread.id)}>{thread.title}</button>
          ))}
        </section>}
        <button className="new-conversation" onClick={() => startNewThread()}>New question <span aria-hidden="true">+</span></button>
      </aside>

      <main className="intelligence-main">
        <header className="intelligence-topbar">
          <button className="mobile-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open account menu">S</button>
          <div><strong>Sovereign</strong><span aria-hidden="true" /><em>{surface}</em></div>
          <div className="topbar-actions">
            {(apiState === 'loading' || apiState === 'error') && <span className={`workspace-status ${apiState}`}>{status}</span>}
            <button onClick={() => setContextOpen((open) => !open)}>{contextOpen ? 'Close' : 'Question context'}</button>
          </div>
        </header>

        <section className="intelligence-scroll" aria-live="polite">
          {!messages.length
            ? apiState === 'loading' && !workspace.today && baselineExperience === 'idle'
              ? <WorkspaceArrival />
              : apiState === 'error' && !workspace.today && baselineExperience === 'idle'
                ? <WorkspaceUnavailable message={status} onRetry={() => void refreshWorkspace()} />
                : baselineExperience === 'building'
              ? <BaselineBuilder
                  api={api}
                  onCancel={() => setBaselineExperience('idle')}
                  onComplete={(result) => void completeBaseline(result)}
                />
              : baselineExperience === 'reveal'
                ? <BaselineReveal
                    result={baselineReveal}
                    today={workspace.today}
                    onOpenToday={() => beginFromReveal()}
                    onExplore={(prompt) => beginFromReveal(prompt)}
                    onCurrentContext={() => { setBaselineExperience('idle'); setSurface('You'); setContextOpen(true); }}
                  />
                : <SurfaceHome
                    surface={surface}
                    workspace={workspace}
                    selectedPerson={selectedPersonRecord}
                    selectedSystem={selectedSystemRecord}
                    api={api}
                    onPrompt={setDraft}
                    onOpenContext={() => setContextOpen(true)}
                    onBuildBaseline={beginBaseline}
                  />
            : <ResponseThread
                messages={messages}
                onPrompt={setDraft}
                onAction={handleAnswerAction}
                onSave={(answer) => void saveAnswer(answer)}
                onCorrection={(value) => void saveCorrection(value)}
              />}
        </section>

        {baselineExperience === 'idle' && baselineReady && (
          <form className="sovereign-composer" onSubmit={submit}>
            <div className="composer-context-line">
              <span>Using · {contextItems.join(' · ')}</span>
              <button type="button" onClick={() => setContextOpen(true)}>Change what is used</button>
            </div>
            <div className="composer-entry">
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
              <button className="composer-send" disabled={!draft.trim() || apiState === 'loading'} aria-label="Send message">→</button>
            </div>
          </form>
        )}
      </main>

      <aside className="intelligence-context" aria-label={`${surface} controls`}>
        <header><div><p>Context used for this question</p><h2>{surface}</h2></div><button onClick={() => setContextOpen(false)} aria-label="Close context">×</button></header>
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
            onBuildBaseline={beginBaseline}
          />
        </div>
      </aside>

      <nav className="mobile-bottom-nav" aria-label="Primary navigation">
        {surfaces.filter((item) => item.name !== 'You').map((item) => (
          <button key={item.name} className={surface === item.name ? 'active' : ''} onClick={() => openSurface(item.name)}>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>

      {menuOpen && (
        <ModalDialog className="workspace-sheet" labelledBy="account-sheet-title" onClose={() => setMenuOpen(false)}>
          <button className="sheet-backdrop" aria-label="Close account menu" onClick={() => setMenuOpen(false)} />
          <section>
            <header><h2 id="account-sheet-title">Sovereign.OS</h2><button onClick={() => setMenuOpen(false)} aria-label="Close">×</button></header>
            <button onClick={() => { openSurface('You'); setMenuOpen(false); }}>You · Baseline, plan, privacy, and account</button>
            <button onClick={() => startNewThread()}>New question</button>
          </section>
        </ModalDialog>
      )}

      {contextOpen && <button className="context-backdrop" aria-label="Close context" onClick={() => setContextOpen(false)} />}

      {covenantSheetOpen && (
        <ModalDialog className="workspace-sheet" labelledBy="covenant-title" onClose={() => setCovenantSheetOpen(false)}>
          <button className="sheet-backdrop" aria-label="Cancel Covenant" onClick={() => setCovenantSheetOpen(false)} />
          <section className="covenant-confirmation">
            <header><span aria-hidden="true">✝</span><button onClick={() => setCovenantSheetOpen(false)} aria-label="Close">×</button></header>
            <h2 id="covenant-title">Add a Christian Scripture perspective?</h2>
            <p>This adds Christian teaching and cited Scripture to the current question. It stays separate from the main Baseline answer and will not claim God’s exact intent.</p>
            <div><button className="primary-action" onClick={() => void useCovenantForQuestion()}>Add it to this question</button><button className="secondary-action" onClick={() => setCovenantSheetOpen(false)}>Cancel</button></div>
          </section>
        </ModalDialog>
      )}

      <span className="covenant-state" aria-live="polite">{covenantEnabled ? 'The Christian Scripture perspective is active for this question.' : ''}</span>
    </div>
  );
}

function BaselineBuilder({ api, onCancel, onComplete }: {
  api: (path: string, init?: RequestInit) => Promise<Json>;
  onCancel: () => void;
  onComplete: (result: Json) => void;
}) {
  const [step, setStep] = useState(1);
  const [birthDate, setBirthDate] = useState('');
  const [birthplace, setBirthplace] = useState('');
  const [certainty, setCertainty] = useState<'exact' | 'approximate' | 'unknown'>('unknown');
  const [birthTime, setBirthTime] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function continueFromDetails(event: FormEvent) {
    event.preventDefault();
    if (!birthDate || birthplace.trim().length < 2) {
      setState('error');
      setMessage('Add your birth date and birthplace before continuing.');
      return;
    }
    setState('idle');
    setMessage('');
    setStep(2);
  }

  function continueFromTime(event: FormEvent) {
    event.preventDefault();
    if (certainty !== 'unknown' && !birthTime) {
      setState('error');
      setMessage('Add the exact or approximate birth time, or choose Unknown.');
      return;
    }
    setState('idle');
    setMessage('');
    setStep(3);
  }

  async function build(event: FormEvent) {
    event.preventDefault();
    setState('submitting');
    setMessage('Building your private Baseline…');
    try {
      const data = await api('/api/v1/baseline/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          birthDate,
          birthplace: birthplace.trim(),
          birthTimezone: timezone,
          birthTimeCertainty: certainty,
          ...(certainty !== 'unknown' ? { birthTime } : {}),
          locationPrecision: 'city_or_regional'
        })
      });
      onComplete(data.baseline ?? data);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'We could not finish your Baseline yet.');
    }
  }

  return (
    <section className="baseline-builder" aria-labelledby="baseline-builder-title">
      <header className="baseline-progress">
        <span>{step} of 3 · {step === 1 ? 'Birth details' : step === 2 ? 'Birth-time certainty' : 'Review'}</span>
        <i aria-hidden="true"><b style={{ width: `${step * 33.333}%` }} /></i>
      </header>
      <div className="baseline-builder-layout">
        <div className="baseline-builder-main">
          <h1 id="baseline-builder-title">Build your Baseline.</h1>
          <p>Add the birth details Sovereign uses to create your private personal starting point.</p>

          {step === 1 && (
            <form onSubmit={continueFromDetails} className="baseline-step-form">
              <label>
                <strong>Birth date</strong>
                <span>Required for the Baseline calculation.</span>
                <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required />
              </label>
              <label>
                <strong>Birthplace</strong>
                <span>Used to calculate the astronomical positions for your birth date and time.</span>
                <input value={birthplace} onChange={(event) => setBirthplace(event.target.value)} placeholder="City, region, country" required />
              </label>
              <button className="baseline-primary">Continue <span aria-hidden="true">→</span></button>
              <button type="button" className="baseline-back" onClick={onCancel}>Back to Today</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={continueFromTime} className="baseline-step-form">
              <fieldset>
                <legend>How certain is your birth time?</legend>
                <p>Your answer determines which time-sensitive values can be calculated and how much uncertainty they carry.</p>
                {[
                  ['exact', 'Exact', 'Use this when the recorded time is known.'],
                  ['approximate', 'Approximate', 'Use this when the time is close but not exact.'],
                  ['unknown', 'Unknown', 'Sovereign will continue without guessing missing values.']
                ].map(([value, label, description]) => (
                  <label className="certainty-choice" key={value}>
                    <input type="radio" name="birthTimeCertainty" value={value} checked={certainty === value} onChange={() => setCertainty(value as typeof certainty)} />
                    <span><strong>{label}</strong><small>{description}</small></span>
                  </label>
                ))}
              </fieldset>
              {certainty !== 'unknown' && (
                <label>
                  <strong>Birth time</strong>
                  <span>Improves the parts of the calculation that depend on time.</span>
                  <input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} required />
                </label>
              )}
              <button className="baseline-primary">Continue <span aria-hidden="true">→</span></button>
              <button type="button" className="baseline-back" onClick={() => setStep(1)}>Back</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={(event) => void build(event)} className="baseline-step-form baseline-review">
              <dl>
                <div><dt>Birth date</dt><dd>{new Date(`${birthDate}T12:00:00`).toLocaleDateString()}</dd></div>
                <div><dt>Birthplace</dt><dd>{birthplace}</dd></div>
                <div><dt>Birth time</dt><dd>{certainty === 'unknown' ? 'Unknown · time-sensitive values will be omitted or carry higher uncertainty' : `${birthTime} · ${certainty}`}</dd></div>
              </dl>
              <p>Your raw birth details and exact private location are not sent to the language model. Your Baseline is interpretive and open to correction.</p>
              <button className="baseline-primary" disabled={state === 'submitting'}>{state === 'submitting' ? 'Building your Baseline…' : 'Build my Baseline'} <span aria-hidden="true">→</span></button>
              <button type="button" className="baseline-back" onClick={() => setStep(2)} disabled={state === 'submitting'}>Back</button>
            </form>
          )}

          {message && <p className={`baseline-builder-message ${state === 'error' ? 'error' : ''}`} role={state === 'error' ? 'alert' : 'status'}>{message}</p>}
        </div>
        <aside>
          <h2>Why Sovereign needs this</h2>
          <p>Your Baseline gives Sovereign a consistent starting point before you ask a question.</p>
          <p>Your raw birth details and exact private location are not sent to the language model.</p>
          <small>{step === 1 ? 'Next, choose how certain your birth time is.' : step === 2 ? 'Next, review the details before the calculation begins.' : 'After this, Sovereign will show a few useful parts of your Baseline to explore first.'}</small>
        </aside>
      </div>
    </section>
  );
}

function BaselineReveal({ result, today, onOpenToday, onExplore, onCurrentContext }: {
  result: Json | null;
  today: Json | null;
  onOpenToday: () => void;
  onExplore: (prompt: string) => void;
  onCurrentContext: () => void;
}) {
  const reduced = result?.reducedContext ?? today?.baseline?.reducedContext ?? {};
  const facets = Array.isArray(reduced?.facetProfile?.facets) ? reduced.facetProfile.facets as Json[] : [];
  const registry = Array.isArray(today?.baseline?.reducedContext?.basisRegistry)
    ? today.baseline.reducedContext.basisRegistry as Json[]
    : Array.isArray(reduced?.basisRegistry)
      ? reduced.basisRegistry as Json[]
      : [];
  const facet = (id: string) => facets.find((item) => item.id === id);
  const core = facet('core_orientation') ?? facets[0];
  const communication = facet('communication');
  const decisions = facet('decision_making');
  const pressure = facet('response_pressure') ?? facet('shadow_expression');
  const support = registry.filter((item) => Array.isArray(core?.basisRefs) && core.basisRefs.includes(item.id));
  const currentReady = today?.current?.status === 'ready';

  return (
    <section className="baseline-reveal">
      <p>Your Baseline is ready.</p>
      <h1>{core?.title ?? 'Your private personal starting point is ready.'}</h1>
      <span>{core?.description ?? 'Sovereign can now use the same private starting point across questions about decisions, relationships, pressure, and change.'}</span>
      <BaselineEvidence values={support} />
      <div className="baseline-reveal-facets">
        <article><small>How you communicate</small><p>{communication?.description ?? 'See how you tend to make your meaning and response clear.'}</p></article>
        <article><small>How you decide</small><p>{decisions?.description ?? 'See how you tend to reach clarity and what pressure may change.'}</p></article>
        <article><small>Under pressure</small><p>{pressure?.shadowExpression ?? pressure?.description ?? 'See how a useful quality may become narrow or overextended when pressure rises.'}</p></article>
      </div>
      <div className="baseline-current-choice">
        <span>{currentReady ? 'Temporary current context is available. Your Baseline remains separate.' : 'Temporary current context is off. Your Baseline remains available.'}</span>
        <button onClick={onCurrentContext}>Choose current context</button>
      </div>
      <button className="baseline-reveal-primary" onClick={onOpenToday}>Open Today <span aria-hidden="true">→</span></button>
      <nav aria-label="Begin exploring">
        <button onClick={() => onExplore('How do I show, receive, and protect love and connection?')}>Understand how I show love</button>
        <button onClick={() => onExplore('Help me examine whether this choice fits who I am now.')}>Examine a decision</button>
      </nav>
      <small>Your Baseline is interpretive and open to correction. Keep what fits; correct or reject what does not.</small>
    </section>
  );
}

function SurfaceHome({ surface, workspace, selectedPerson, selectedSystem, api, onPrompt, onOpenContext, onBuildBaseline }: {
  surface: Surface;
  workspace: WorkspaceState;
  selectedPerson: Json | null;
  selectedSystem: Json | null;
  api: (path: string, init?: RequestInit) => Promise<Json>;
  onPrompt: (prompt: string) => void;
  onOpenContext: () => void;
  onBuildBaseline: () => void;
}) {
  if (surface === 'Today') {
    const baseline = workspace.today?.baseline;
    const facets = Array.isArray(baseline?.reducedContext?.facetProfile?.facets)
      ? baseline.reducedContext.facetProfile.facets
      : [];
    const current = workspace.today?.current;
    const registry = Array.isArray(baseline?.reducedContext?.basisRegistry)
      ? baseline.reducedContext.basisRegistry
      : [];
    return (
      <div className="surface-home today-home">
        {facets.length
          ? <TodayFacetView facets={facets} current={current} registry={registry} onPrompt={onPrompt} />
          : baseline?.status === 'not_started' || !baseline
            ? <BaselineInvitation onBuild={onBuildBaseline} />
            : <BaselinePreparingState onReview={onBuildBaseline} />}
      </div>
    );
  }
  if (surface === 'Explore') return <ExploreHome onPrompt={onPrompt} />;
  if (surface === 'People') return (
    <div className="surface-home">
      <SurfaceHeading kicker="People" title="See what each person may be bringing and what happens between you." body="Choose someone who connected their account and permitted comparison, or send an invitation." />
      {selectedPerson
        ? <RelationshipOverview person={selectedPerson} api={api} onPrompt={onPrompt} />
        : <EmptyState title="Choose a person or send an invitation." body="Adding a name does not give you access to their information. The other person connects their account and chooses what Sovereign may use." action="Invite or choose someone" onAction={onOpenContext} />}
    </div>
  );
  if (surface === 'Systems') return (
    <div className="surface-home">
      <SurfaceHeading kicker="Systems" title="See who decides, who carries responsibility, and where pressure builds." body="Choose a family, household, team, workplace, friendship group, or custom group." />
      {selectedSystem
        ? <SystemOverview system={selectedSystem} api={api} onPrompt={onPrompt} />
        : <EmptyState title="Choose or create a group." body="A group view can show confirmed roles, authority, responsibility, reliance, pressure, and missing perspectives." action="Choose a group" onAction={onOpenContext} />}
    </div>
  );
  if (surface === 'Library') return (
    <div className="surface-home">
      <SurfaceHeading kicker="Library" title="Return to insights you chose to save." body="Library contains selected insights, not every conversation. Rename, continue from, or delete an item at any time." />
      <LibraryGrid library={workspace.library} onPrompt={onPrompt} />
    </div>
  );
  return (
    <div className="surface-home">
      <SurfaceHeading kicker="You" title="Manage your Baseline, privacy, plan, and account." body="Review your Baseline, temporary current context, people, permissions, billing, saved data, and account controls." />
      <AccountSummary workspace={workspace} onOpenContext={onOpenContext} onBuildBaseline={onBuildBaseline} />
    </div>
  );
}

function SurfaceHeading({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return <header className="surface-heading"><p>{kicker}</p><h1>{title}</h1><span>{body}</span></header>;
}

function BaselineInvitation({ onBuild }: { onBuild: () => void }) {
  return (
    <section className="baseline-invitation">
      <div>
        <h1>Build your Baseline before you ask.</h1>
        <p>Your Baseline is the private personal starting point Sovereign uses across questions about communication, decisions, relationships, pressure, and change.</p>
        <button onClick={onBuild}>Build my Baseline <span aria-hidden="true">→</span></button>
        <small>Complete it once so you do not have to explain yourself from scratch every time.</small>
      </div>
      <div className="baseline-foundation-visual" aria-hidden="true"><span /><span /><span /><i /></div>
      <div className="baseline-composer-preview">
        <strong>Ask a question built around your Baseline…</strong>
        <span>Future questions can use the same private personal starting point.</span>
      </div>
    </section>
  );
}

function BaselinePreparingState({ onReview }: { onReview: () => void }) {
  return (
    <section className="baseline-preparing">
      <p>Today</p>
      <h1>Your Baseline is still being prepared.</h1>
      <span>Your birth details are saved. Sovereign is still creating the plain-language Baseline sections used for Today, Shadow, Gift, and Alignment.</span>
      <button onClick={onReview}>Review my Baseline details</button>
    </section>
  );
}

function TodayFacetView({ facets, current, registry, onPrompt }: { facets: Json[]; current: Json; registry: Json[]; onPrompt: (prompt: string) => void }) {
  const facet = (id: string) => facets.find((item) => item.id === id);
  const core = facet('core_orientation') ?? facets[0];
  const gift = facet('gift_expression') ?? core;
  const alignment = facet('alignment_markers') ?? core;
  const activeIds = current?.status === 'ready' && Array.isArray(current?.reduced?.affectedBaselineFacetIds)
    ? current.reduced.affectedBaselineFacetIds
    : [];
  const active = facets.find((item) => activeIds.includes(item.id));
  const support = registry.filter((item) => Array.isArray(core?.basisRefs) && core.basisRefs.includes(item.id));
  const alignmentMarker = Array.isArray(alignment?.alignmentMarkers) ? alignment.alignmentMarkers[0] : '';
  return (
    <section className="today-facet-view">
      <header>
        <p>Today</p>
        <h1>{core?.title ?? 'See what is steady and what may matter more right now.'}</h1>
        <span>{core?.description ?? 'Your Baseline is ready to explore.'}</span>
      </header>
      <div className="today-insight-lines">
        <article>
          <span>Your Baseline</span>
          <p>{core?.description}</p>
          <BaselineEvidence values={support} />
        </article>
        <article>
          <span>May deserve more attention now</span>
          <p>{active ? `${active.title} may be more relevant for a limited time. Temporary current context does not determine your behavior.` : 'Temporary current context is off, expired, or has no matching contact. Your Baseline remains available.'}</p>
        </article>
        <article>
          <span>Where this may matter</span>
          <p>{alignmentMarker || 'Notice whether responsibility, authority, and exposure to the outcome belong to the same person.'}</p>
        </article>
      </div>
      <nav className="today-continuations" aria-label="Continue this insight">
        <button onClick={() => onPrompt(`How does ${core?.title ?? 'this quality'} change under pressure?`)}>What changes under pressure? <span aria-hidden="true">→</span></button>
        <button onClick={() => onPrompt(gift?.giftExpression ? `Show me what this quality makes possible at its best: ${gift.giftExpression}` : 'What does this quality make possible at its best?')}>What does this make possible at its best? <span aria-hidden="true">→</span></button>
        <button onClick={() => onPrompt(`What exact supporting details shaped this quality: ${core?.title ?? 'the quality shown today'}?`)}>What supporting details shaped this? <span aria-hidden="true">→</span></button>
      </nav>
    </section>
  );
}

function BaselineEvidence({ values }: { values: Json[] }) {
  if (!values.length) return null;
  return (
    <details className="baseline-evidence">
      <summary>Open supporting details</summary>
      <p>{values.slice(0, 4).map((value) => value.accessibleLabel).filter(Boolean).join(' · ')}</p>
    </details>
  );
}

function ExploreHome({ onPrompt }: { onPrompt: (prompt: string) => void }) {
  const [selected, setSelected] = useState(0);
  const [label, prompt] = exploreModes[selected]!;
  const descriptions: Record<string, string> = {
    'My Baseline': 'Understand one stable part of the private starting point Sovereign uses across your questions.',
    'Shadow & Gift': 'See how a useful quality may become narrow under pressure and what it can make possible when used with awareness.',
    Alignment: 'Compare what supports a choice, what works against it, the tradeoff involved, and what information is still missing.',
    Decisions: 'Understand how you tend to reach clarity and what pressure may change.',
    Communication: 'See how you tend to make your meaning clear and how that may change under pressure.',
    'Love & Relationships': 'Explore how you tend to give, receive, protect, and repair connection.',
    Learning: 'Understand what helps information become useful and what makes learning harder.',
    Leadership: 'See how you may naturally provide direction and take responsibility.',
    Boundaries: 'See when a strength becomes overextension and when a limit protects what matters.',
    'Pressure & Change': 'Separate what stays steady from what may narrow when urgency rises.',
    'Family Role': 'Explore a possible family role while keeping facts, interpretation, and unknowns separate.'
  };
  return (
    <div className="surface-home explore-home">
      <SurfaceHeading kicker="Explore" title="Ask about yourself or a decision." body="Choose an area below or write your own question. Sovereign will use your Baseline as the starting point." />
      <div className="explore-editorial">
        <nav aria-label="Baseline areas">
          {exploreModes.map(([itemLabel], index) => (
            <button key={itemLabel} aria-pressed={selected === index} onClick={() => setSelected(index)}>{itemLabel}</button>
          ))}
        </nav>
        <section>
          <p>Selected area</p>
          <h2>{label}</h2>
          <span>{descriptions[label]}</span>
          <button onClick={() => onPrompt(prompt)}>Ask about {label.toLowerCase()} <i aria-hidden="true">→</i></button>
        </section>
      </div>
    </div>
  );
}

function RelationshipOverview({ person, api, onPrompt }: { person: Json; api: (path: string, init?: RequestInit) => Promise<Json>; onPrompt: (value: string) => void }) {
  const [comparison, setComparison] = useState<Json | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    void api(`/api/v1/people/${encodeURIComponent(person.id)}/comparison`, { method: 'POST', body: '{}' })
      .then((data) => setComparison(data.comparison ?? null))
      .catch((problem) => setError(problem instanceof Error ? problem.message : 'Comparison unavailable.'));
  }, [person.id]);
  if (error) return <EmptyState title="One more permission is required." body={error} action="Manage permissions" onAction={openConsentControls} />;
  if (!comparison) return <p className="loading-state">Loading the permitted relationship information…</p>;
  const participants = comparison.participants ?? [];
  return (
    <section className="relationship-overview">
      <div className="person-split">
        {participants.slice(0, 2).map((participant: Json, index: number) => (
          <article key={participant.key ?? index}><span>{index === 0 ? 'YOU MAY BE BRINGING' : 'THEY MAY BE BRINGING'}</span><h2>{participant.facets?.[0]?.title ?? 'Permitted Baseline information'}</h2><p>{participant.facets?.[0]?.description ?? 'The permitted information is incomplete.'}</p></article>
        ))}
      </div>
      <article className="relationship-field"><span>WHAT HAPPENS BETWEEN YOU</span><p>Ask Sovereign to explain what each person may be bringing, how the interaction works, what each person can own, and what still needs to be asked directly.</p><button onClick={() => onPrompt(`What are ${person.displayName ?? 'this person'} and I each bringing into this relationship?`)}>Ask about this relationship</button></article>
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
      .catch((problem) => setError(problem instanceof Error ? problem.message : 'Group analysis unavailable.'));
  }, [system.id]);
  if (error) return <EmptyState title="This group needs more confirmed information." body={error} action="Review members" onAction={openConsentControls} />;
  if (!analysis) return <p className="loading-state">Loading the permitted group information…</p>;
  const participants = analysis.participants ?? [];
  const edges = analysis.relationshipGraph ?? [];
  const edge = edges[activeConnection];
  return (
    <section className="system-overview">
      <header><div><span>{String(analysis.system?.type ?? 'GROUP').replace('_', ' ')}</span><h2>{analysis.system?.label ?? system.name}</h2></div><button onClick={() => onPrompt(`How is ${system.name ?? 'this group'} functioning, and what is each person contributing?`)}>Ask about this group</button></header>
      <div className="system-graph" aria-label="Supported group relationships">
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
        <span>SELECTED CONNECTION</span>
        {edge ? <p>{edge.from} → {edge.to} · {edge.type}{edge.detail ? ` · ${edge.detail}` : ''}</p> : <p>No connection appears until authority, responsibility, reliance, or communication has been supplied.</p>}
        {edges.length > 1 && <div>{edges.map((_: Json, index: number) => <button key={index} aria-pressed={activeConnection === index} onClick={() => setActiveConnection(index)}>Connection {index + 1}</button>)}</div>}
      </div>
      <aside><strong>Where pressure builds</strong><p>{analysis.pressureField?.responsibilityAuthorityMismatch?.[0]?.status ?? 'No mismatch between responsibility and authority has been confirmed yet.'}</p></aside>
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
        ? <article key={message.id} className="user-question"><span>You asked</span><p>{message.text}</p></article>
        : <article key={message.id} className="sovereign-response">
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
              : <p className="thinking">{message.text || 'Using the information selected for this question…'}</p>}
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
  const openPlans = () => location.assign('/pricing');
  const unknown = answer.sections.find((section) => section.id === 'unknowns');
  const standardSections = answer.sections.filter((section) => section.id !== 'unknowns');
  return (
    <section className={`sovereign-answer answer-${answer.mode}`} aria-label={`${answer.mode.replace('_', ' ')} answer`}>
      <header><span>Sovereign · {modeLabel(answer.mode)}</span><h2>{answer.headline}</h2></header>
      <p className="direct-answer">{answer.direct_answer}</p>

      {answer.mode === 'alignment'
        ? <AlignmentView sections={standardSections} />
        : answer.mode === 'relationship'
          ? <RelationshipAnswer sections={standardSections} />
          : answer.mode === 'system'
            ? <SystemAnswer sections={standardSections} />
          : answer.mode === 'covenant'
              ? <CovenantAnswer sections={standardSections} />
              : <div className="answer-sections">{standardSections.map((section) => <article className={section.id === 'experiment' ? 'answer-experiment' : ''} key={`${section.id}-${section.label}`}><span>{section.label}</span><p>{section.body}</p></article>)}</div>}

      <div className="answer-evidence-row">
        <BasisStrip values={basis} />
        {covenantAction && <button className="covenant-action" onClick={() => onAction(covenantAction)}><span aria-hidden="true">✝</span>{covenantAction.label}</button>}
        {!covenantAction && covenantPlanAction && <button className="covenant-action plan-action" onClick={openPlans}><span aria-hidden="true">✝</span>{covenantPlanAction.label}</button>}
      </div>
      <p className="answer-limit"><strong>Still unknown</strong>{unknown?.body ?? `This is an ${answer.confidence} interpretation. Your actual response, another person’s private experience, and the outcome still need to be confirmed.`}</p>

      {latest && (
        <footer className="answer-actions">
          <div className="fit-controls"><span>{answer.correction_prompt}</span><button onClick={() => onCorrection('yes')}>Yes</button><button onClick={() => onCorrection('partly')}>Partly</button><button onClick={() => onCorrection('not_today')}>Not today</button></div>
          <nav className="answer-continuations" aria-label="Continue this answer">
            {primaryAction && <button onClick={() => onAction(primaryAction)}>{primaryAction.label} <span aria-hidden="true">→</span></button>}
            {!primaryAction && primaryPlanAction && <button className="plan-action" onClick={openPlans}>{primaryPlanAction.label} <span aria-hidden="true">→</span></button>}
            {saveAction
              ? <button onClick={onSave}>Save this insight <span aria-hidden="true">→</span></button>
              : libraryPlanAction
                ? <button className="plan-action" onClick={openPlans}>{libraryPlanAction.label} <span aria-hidden="true">→</span></button>
                : null}
            <button onClick={() => onPrompt(`Ask a follow-up about this answer: ${answer.headline}`)}>Ask a follow-up <span aria-hidden="true">→</span></button>
          </nav>
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
  if (!values.length) return null;
  return (
    <>
      <button className="basis-strip" onClick={() => setOpen(true)} aria-label={`Open ${values.length} exact supporting values that shaped this answer.`}>
        <strong>Supporting details</strong>
        <span>{visible.map((value) => value.accessibleLabel).join(' · ')}</span>
        {values.length > limit && <b>+{values.length - limit} more</b>}
        <i aria-hidden="true">⌄</i>
      </button>
      {open && (
        <ModalDialog className="source-drawer" labelledBy="basis-title" onClose={() => setOpen(false)}>
          <button className="sheet-backdrop" onClick={() => setOpen(false)} aria-label="Close supporting details" />
          <section>
            <header><div><span>EXACT SOURCE VALUES</span><h2 id="basis-title">What shaped this answer</h2></div><button onClick={() => setOpen(false)} aria-label="Close">×</button></header>
            <p>These server-approved values shaped the interpretation. They support reflection; they do not prove personality, behavior, or current state.</p>
            <dl>{values.map((value) => <div key={value.id}><dt>{value.display}</dt><dd><span>{value.accessibleLabel}</span><span>Calculated {formatDate(value.computedAt)} · {value.uncertainty} uncertainty</span><span>{value.provenance}</span></dd></div>)}</dl>
          </section>
        </ModalDialog>
      )}
    </>
  );
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <section className="empty-state"><h2>{title}</h2><p>{body}</p><button onClick={onAction}>{action} <span aria-hidden="true">→</span></button></section>;
}

function WorkspaceArrival() {
  return <section className="workspace-arrival" role="status"><span>Sovereign</span><h1>Opening your workspace.</h1><p>Loading your Baseline, conversations, permissions, plan, and saved insights.</p></section>;
}

function WorkspaceUnavailable({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <section className="workspace-arrival unavailable" role="alert"><span>Sovereign</span><h1>Your private workspace could not open.</h1><p>{message}</p><button onClick={onRetry}>Try again <span aria-hidden="true">→</span></button></section>;
}

function AccountSummary({ workspace, onOpenContext, onBuildBaseline }: { workspace: WorkspaceState; onOpenContext: () => void; onBuildBaseline: () => void }) {
  const baselineReady = workspace.today?.baseline?.status === 'completed';
  const plan = workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free';
  return (
    <section className="account-summary">
      <article><span>My Baseline</span><strong>{baselineReady ? 'Ready for personal questions' : 'Not built yet'}</strong><button onClick={onBuildBaseline}>{baselineReady ? 'Review or rebuild' : 'Build my Baseline'}</button></article>
      <article><span>Temporary current context</span><strong>{workspace.today?.current?.status === 'ready' ? 'Available for a limited time' : 'Off · your Baseline remains available'}</strong><button onClick={onOpenContext}>Choose current context</button></article>
      <article><span>People and permissions</span><strong>{workspace.people.length ? `${workspace.people.length} private connection${workspace.people.length === 1 ? '' : 's'}` : 'No permission-based relationship information yet'}</strong><button onClick={openConsentControls}>Manage permissions</button></article>
      <article><span>Plan and billing</span><strong>{plan}</strong><button onClick={onOpenContext}>Review plan</button></article>
      <article><span>Privacy and saved data</span><strong>Library, retention, account access, and deletion</strong><button onClick={openAccountControls}>Open account controls</button></article>
    </section>
  );
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
  onBuildBaseline: () => void;
}) {
  if (props.surface === 'People') return <PeopleControls {...props} />;
  if (props.surface === 'Systems') return <SystemControls {...props} />;
  if (props.surface === 'Library') return <LibraryGrid library={props.workspace.library} onPrompt={props.setDraft} compact />;
  if (props.surface === 'You') return <YouControls {...props} />;
  return <div className="context-stack"><p className="context-intro">Choose a question below or write your own. Exact source data, interpretation, temporary current context, and what remains unknown stay separate.</p>{surfacePrompts[props.surface].map((prompt) => <button className="context-prompt" key={prompt} onClick={() => props.setDraft(prompt)}>{prompt}</button>)}</div>;
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
      <p className="context-intro">Adding a name does not give you access to their information. Shared comparison begins only after the other person connects their account and chooses what to allow.</p>
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
      <p className="context-intro">A group view shows confirmed roles, decision authority, responsibility, reliance, communication, and where pressure builds.</p>
      <label>New group<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Family, household, team…" /></label>
      <label>Type<select value={type} onChange={(event) => setType(event.target.value)}>{['family', 'household', 'friendship_group', 'team', 'workplace', 'custom'].map((item) => <option key={item} value={item}>{systemTypeLabel(item)}</option>)}</select></label>
      <button className="secondary-action" onClick={() => void createSystem()}>Create group</button>
      <label>Choose a group<select value={selectedSystem} onChange={(event) => setSelectedSystem(event.target.value)}><option value="">No group</option>{workspace.systems.map((system: Json) => <option key={system.id} value={system.id}>{system.name}</option>)}</select></label>
      <button className="secondary-action" onClick={openConsentControls}>Review members and permissions</button>
    </div>
  );
}

function YouControls({ workspace, api, refresh, onBuildBaseline }: any) {
  const [interval, setInterval] = useState<'annual' | 'monthly'>('annual');
  const [currentAction, setCurrentAction] = useState<'idle' | 'loading' | 'error'>('idle');
  const [currentMessage, setCurrentMessage] = useState('');
  const current = workspace.today?.current ?? { status: 'not_started' };
  const currentReady = current.status === 'ready';
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
        setCurrentMessage('Current astronomical data is temporarily unavailable. Your Baseline remains available.');
        return;
      }
      setCurrentAction('idle');
      setCurrentMessage('Temporary current context is available for the next six hours.');
    } catch (error) {
      setCurrentAction('error');
      setCurrentMessage(error instanceof Error ? error.message : 'Temporary current context is unavailable.');
    }
  }
  async function removeCurrentContext() {
    setCurrentAction('loading');
    setCurrentMessage('');
    try {
      await api('/api/v1/current-conditions', { method: 'DELETE' });
      await refresh();
      setCurrentAction('idle');
      setCurrentMessage('Temporary current context has been removed.');
    } catch (error) {
      setCurrentAction('error');
      setCurrentMessage(error instanceof Error ? error.message : 'Temporary current context could not be removed.');
    }
  }
  return (
    <div className="context-stack account-controls">
      <section className="control-section">
        <p>MY BASELINE</p><h3>{workspace.today?.baseline?.status === 'completed' ? 'Your Baseline is ready.' : 'Build your Baseline to begin.'}</h3><span>Your Baseline is the private personal starting point Sovereign uses across questions about yourself, decisions, relationships, and groups.</span>
        <button className="primary-action" onClick={onBuildBaseline}>{workspace.today?.baseline?.status === 'completed' ? 'Review or rebuild my Baseline' : 'Build my Baseline'}</button>
      </section>
      <section className="control-section">
        <p>TEMPORARY CURRENT CONTEXT</p><h3>Choose whether to add it.</h3>
        <span>Add Earth-geocentric astronomical context for six hours. Sovereign does not request or store your device location, and temporary current context never determines your behavior.</span>
        <div className="current-permission-state" data-state={currentReady ? 'ready' : current.status}>
          <strong>{currentReady ? 'Current context on' : current.status === 'expired' ? 'Current context expired' : 'Current context off'}</strong>
          <small>{currentReady && current.reduced?.expiresAt ? `Available until ${formatCurrentExpiry(current.reduced.expiresAt)}` : 'Your Baseline remains available.'}</small>
        </div>
        <div className="current-permission-actions">
          {!currentReady && <button className="secondary-action" disabled={currentAction === 'loading'} onClick={() => void enableCurrentContext()}>{currentAction === 'loading' ? 'Adding context…' : 'Enable for six hours'}</button>}
          {currentReady && <button className="secondary-action" disabled={currentAction === 'loading'} onClick={() => void enableCurrentContext()}>{currentAction === 'loading' ? 'Refreshing…' : 'Refresh six hours'}</button>}
          {(currentReady || current.status === 'expired') && <button className="quiet-danger-action" disabled={currentAction === 'loading'} onClick={() => void removeCurrentContext()}>Remove current context</button>}
        </div>
        {currentMessage && <span className={`current-permission-message ${currentAction === 'error' ? 'error' : ''}`} role={currentAction === 'error' ? 'alert' : 'status'}>{currentMessage}</span>}
      </section>
      <section className="control-section">
        <p>PEOPLE AND PERMISSIONS</p><h3>Each person chooses what Sovereign may use.</h3><button className="secondary-action" onClick={openConsentControls}>Manage permissions</button>
      </section>
      <section className="control-section">
        <p>PLAN AND BILLING</p><h3>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free'}</h3>
        {workspace.billing?.effective?.plan !== 'sovereign_plus' && <><div className="billing-switch"><button type="button" className={interval === 'annual' ? 'active' : ''} onClick={() => setInterval('annual')}>$99 / year</button><button type="button" className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>$20 / month</button></div><button className="primary-action" onClick={() => void handoff('/api/v1/billing/checkout', { interval })}>Choose Sovereign+</button></>}
        <button className="secondary-action" onClick={() => void handoff('/api/v1/billing/portal')}>Manage billing</button>
      </section>
      <section className="control-section"><p>PRIVACY AND SAVED DATA</p><h3>Manage permissions, saved insights, and account data.</h3><div className="control-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><button onClick={openConsentControls}>Permissions</button><button onClick={openAccountControls}>Library and account data</button></div></section>
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
  if (!library.length) return <EmptyState title="Nothing saved yet." body="Save an insight when you want to use it later. Library does not collect unsaved conversations." action="Ask a personal question" onAction={() => onPrompt('Show me a part of my Baseline I may not recognize yet.')} />;
  return <div className={`library-grid ${compact ? 'compact' : ''}`}>{library.map((item) => <button key={item.id} onClick={() => onPrompt(`Continue from this saved insight: ${item.body?.summary ?? item.summary ?? ''}`)}><span>{String(item.body?.type ?? item.type ?? 'Saved insight').replaceAll('_', ' ').toUpperCase()}</span><strong>{item.body?.title ?? item.title ?? 'Saved insight'}</strong><p>{shorten(item.body?.summary ?? item.summary ?? '', compact ? 120 : 220)}</p><small>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Private Library'}</small></button>)}</div>;
}

function openConsentControls() {
  window.dispatchEvent(new CustomEvent('sovereign:open-consent-controls'));
}

function openAccountControls() {
  window.dispatchEvent(new CustomEvent('sovereign:open-account-controls'));
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
    now: 'CURRENT CONTEXT',
    shadow_gift: 'UNDER PRESSURE & AT YOUR BEST',
    alignment: 'WHAT FITS',
    relationship: 'RELATIONSHIP',
    system: 'GROUP',
    covenant: 'COVENANT'
  } as const)[mode];
}

function composerPlaceholder(surface: Surface) {
  return surface === 'People' ? 'Ask about this relationship…'
    : surface === 'Systems' ? 'Ask about this group…'
      : surface === 'Explore' ? 'Ask about yourself, a quality, or a decision…'
        : surface === 'Library' ? 'Continue from an insight you saved…'
          : surface === 'You' ? 'Ask about your Baseline or account context…'
            : 'Ask about what may matter more right now…';
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
  return ({ friendship_group: 'Friendship group', workplace: 'Workplace', family: 'Family', household: 'Household', team: 'Team', custom: 'Custom group' } as Record<string, string>)[value] ?? value.replace('_', ' ');
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'time unavailable' : date.toLocaleString();
}