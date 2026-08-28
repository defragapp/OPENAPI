import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { ThreadExpressionField } from './expression-field/ThreadExpressionField';
import { WorkspaceExpressionField } from './expression-field/WorkspaceExpressionField';
import { expressionAxisIds } from './expression-field/expression-field-contract';
import type { ExpressionAxisId, ExpressionAxisValue } from './expression-field/expression-field-contract';
import type { ExpressionFieldConnection, ExpressionFieldSubject } from './expression-field/expression-field-view-contract';

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
type EntitledFeature = PlanAction['feature'];

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
  expiresAt?: string;
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
  expressionFieldContext?: Json;
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
  { name: 'Today', label: 'Today', description: 'What is active for you now' },
  { name: 'Explore', label: 'Explore', description: 'Explore yourself more deeply' },
  { name: 'People', label: 'People', description: 'See how the same moment can land differently' },
  { name: 'Systems', label: 'Systems', description: 'See the whole system' },
  { name: 'Library', label: 'Library', description: 'Keep what changes your understanding' },
  { name: 'You', label: 'You', description: 'Baseline, plan, permissions, and account' }
];

const expressionAxisIdSet = new Set<string>(expressionAxisIds);

const composerExamples: Record<Surface, string[]> = {
  Today: ['What feels different today?', 'What still feels steady underneath it?'],
  Explore: ['What capacity or pattern do I want to understand?', 'What changes in me under pressure?'],
  People: ['What keeps happening between you?'],
  Systems: ['What role do I keep ending up in?', 'What changes when the usual roles shift?'],
  Library: ['Continue from a distinction you chose to keep.'],
  You: ['What does my Baseline support here?']
};

export function SovereignIntelligenceWorkspace({ onboardingVerified = false }: { onboardingVerified?: boolean }) {
  const [surface, setSurface] = useState<Surface>('Today');
  const [railCollapsed, setRailCollapsed] = useState(() => localStorage.getItem('sovereign:rail-collapsed') === 'true');
  const [contextOpen, setContextOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [composerFocused, setComposerFocused] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState(() => newThreadId('Today'));
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [covenantEnabled, setCovenantEnabled] = useState(false);
  const [covenantSheetOpen, setCovenantSheetOpen] = useState(false);
  const [baselineExperience, setBaselineExperience] = useState<BaselineExperience>('idle');
  const [baselineReveal, setBaselineReveal] = useState<Json | null>(null);
  const [status, setStatus] = useState('Opening your workspace…');
  const [restoreError, setRestoreError] = useState('');
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
      throw new Error('This request could not be completed. Your information is safe. Try again when ready.');
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
      setStatus(error instanceof Error ? error.message : 'Some of your workspace context is temporarily unavailable. Your saved data is unchanged.');
    }
  }

  useEffect(() => { void refreshWorkspace(); }, []);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('billing') !== 'success') return;
    try {
      const saved = JSON.parse(sessionStorage.getItem('sovereign:upgrade-continuity') ?? 'null') as Json | null;
      if (!saved) return;
      if (validSurface(saved.surface)) setSurface(saved.surface);
      if (validId(saved.threadId)) setThreadId(saved.threadId);
      if (typeof saved.draft === 'string') setDraft(saved.draft);
      if (validId(saved.personId)) setSelectedPerson(saved.personId);
      if (validId(saved.systemId)) setSelectedSystem(saved.systemId);
      sessionStorage.removeItem('sovereign:upgrade-continuity');
    } catch {
      sessionStorage.removeItem('sovereign:upgrade-continuity');
    }
  }, []);

  useEffect(() => {
    setExampleIndex(0);
    if (composerFocused || draft || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const examples = composerExamples[surface];
    if (examples.length < 2) return;
    const timer = window.setInterval(() => setExampleIndex((value) => (value + 1) % examples.length), 7_000);
    return () => window.clearInterval(timer);
  }, [surface, composerFocused, draft]);


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
  const baselineReady = workspace.today?.baseline?.status === 'completed'
    && workspace.today?.baseline?.ready === true
    && workspace.today?.baseline?.facetProfileStatus === 'ready';
  const surfaceEntitled = !missingSurfaceEntitlement(surface, workspace.billing);

  function beginResponseProgress(assistantId: string) {
    const preparing = 'Exploring your question through your Baseline…';
    setStatus(preparing);
    setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, text: preparing } : item));
  }

  function startNewThread(nextSurface: Surface = surface) {
    setSurface(nextSurface);
    setThreadId(newThreadId(nextSurface));
    setMessages([]);
    setDraft('');
    setCovenantEnabled(false);
    setCovenantSheetOpen(false);
    setApiState('idle');
    setStatus('Ready');
    setRestoreError('');
    setContextOpen(false);
    setBaselineExperience('idle');
    setBaselineReveal(null);
    if (nextSurface !== 'People') setSelectedPerson('');
    if (nextSurface !== 'Systems') setSelectedSystem('');
  }

  function openSurface(next: Surface) {
    setRestoreError('');
    setBaselineExperience('idle');
    setBaselineReveal(null);
    setSurface(next);
    if (next !== 'People') setSelectedPerson('');
    if (next !== 'Systems') setSelectedSystem('');
    setContextOpen(false);
    setMenuOpen(false);
  }

  function toggleRail() {
    setRailCollapsed((collapsed) => {
      const next = !collapsed;
      localStorage.setItem('sovereign:rail-collapsed', String(next));
      return next;
    });
  }

  function openPlan(feature: EntitledFeature) {
    sessionStorage.setItem('sovereign:upgrade-continuity', JSON.stringify({
      feature,
      surface,
      threadId,
      draft,
      personId: selectedPerson || undefined,
      systemId: selectedSystem || undefined
    }));
    setSurface('You');
    setContextOpen(true);
    setMenuOpen(false);
    setStatus('Your unfinished question and context will be kept if you upgrade.');
  }

  function beginBaseline() {
    location.assign('/onboarding');
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

  function beginFromReveal() {
    setBaselineExperience('idle');
    setBaselineReveal(null);
    setSurface('Today');
  }

  async function openThread(id: string) {
    setApiState('loading');
    setStatus('Opening conversation…');
    try {
      setRestoreError('');
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
      setStatus('Picking up where you left off.');
    } catch (error) {
      setApiState('error');
      const message = error instanceof Error ? error.message : 'That conversation is unavailable.';
      setRestoreError(message);
      setStatus(message);
    }
  }

  async function sendMessage(message: string, covenantForTurn = false) {
    const clean = message.trim();
    if (!clean || apiState === 'loading') return;
    if (clean.length > 10_000) { setStatus('Your message must be 10,000 characters or fewer.'); return; }
    if (!baselineReady) {
      setApiState('error');
      setStatus('Finish your Baseline before asking Sovereign a question.');
      return;
    }
    const messageContext = {
      surface,
      personId: selectedPerson || undefined,
      systemId: selectedSystem || undefined,
      covenantEnabled: covenantForTurn
    };
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: clean, context: messageContext };
    const assistantId = crypto.randomUUID();
    const previousDraft = draft;
    setMessages((current) => [...current, userMessage, { id: assistantId, role: 'assistant', text: 'Exploring your question through your Baseline…', context: messageContext }]);
    setApiState('loading');
    beginResponseProgress(assistantId);
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
      setDraft('');
      setMessages((current) => current.map((item) => item.id === assistantId
        ? {
            ...item,
            text: payload.answer.direct_answer,
            answer: payload.answer,
            basis: Array.isArray(payload.basis) ? payload.basis.filter(isBasisValue) : [],
            ...(isInterfaceActionEnvelope(payload.interfaceActions) ? { interfaceActions: payload.interfaceActions } : {}),
            ...(isExpressionFieldContext(payload.expressionFieldContext) ? { expressionFieldContext: payload.expressionFieldContext } : {})
          }
        : item));
      setApiState('ready');
      setStatus('Complete');
      const threadData = await api('/api/v1/threads');
      setWorkspace((current) => ({ ...current, threads: threadData.threads ?? [] }));
    } catch (error) {
      setApiState('error');
      setDraft(previousDraft || clean);
      setMessages((current) => current.map((item) => item.id === assistantId
        ? { ...item, text: 'Sovereign could not complete this response yet. Your draft and conversation are unchanged. Try again when ready.' }
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
    try {
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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'This could not be saved to Library.');
    }
  }

  async function saveCorrection(correction: 'yes' | 'partly' | 'not_today') {
    try {
      await api(`/api/v1/threads/${encodeURIComponent(threadId)}/corrections`, {
        method: 'POST',
        body: JSON.stringify({ correction })
      });
      setStatus(correction === 'yes' ? 'Marked as fitting.' : correction === 'partly' ? 'Marked as partly fitting.' : 'Marked as not fitting today.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'That response could not be saved.');
    }
  }

  async function useCovenantForQuestion() {
    const latestQuestion = [...messages].reverse().find((message) => message.role === 'user')?.text;
    if (!latestQuestion) return;
    setCovenantSheetOpen(false);
    setStatus('Adding Covenant for this question…');
    try {
      await api(`/api/v1/threads/${encodeURIComponent(threadId)}/covenant`, {
        method: 'POST',
        body: JSON.stringify({ enabled: true, bibleTranslation: 'WEB', personId: selectedPerson || undefined, subject: 'this question' })
      });
      setCovenantEnabled(true);
      await sendMessage(`Explore this question through Covenant:\n\n${latestQuestion}`, true);
    } catch (error) {
      setCovenantEnabled(false);
      setStatus(error instanceof Error ? error.message : 'Covenant could not be added to this question.');
      return;
    }
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
      : 'Help me explore the part of my Baseline underneath this answer.');
  }

  return (
    <div className={`intelligence-workspace ${contextOpen ? 'context-open' : ''} ${railCollapsed ? 'rail-collapsed' : ''}`}>
      <aside className="intelligence-sidebar" aria-label="Sovereign navigation">
        <a className="intelligence-brand" href="/app"><span aria-hidden="true">S</span><strong>SOVEREIGN.OS</strong></a>
        <button className="rail-collapse" onClick={toggleRail} aria-label={railCollapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!railCollapsed}><span aria-hidden="true">{railCollapsed ? '›' : '‹'}</span></button>
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
          <p>Recent explorations</p>
          {workspace.threads.slice(0, 10).map((thread) => (
            <button key={thread.id} onClick={() => void openThread(thread.id)}>{thread.title}</button>
          ))}
        </section>}
        <button className="new-conversation" onClick={() => startNewThread()}>Ask something new</button>
      </aside>

      <main className="intelligence-main">
        <header className="intelligence-topbar">
          <button className="mobile-menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open workspace menu">S</button>
          <div><strong>{surface}</strong></div>
          <div className="topbar-actions">
            {(apiState === 'loading' || apiState === 'error') && <span className={`workspace-status ${apiState}`}>{status}</span>}
            <button onClick={() => setContextOpen((open) => !open)}>{contextOpen ? 'Close' : 'Adjust'}</button>
          </div>
        </header>

        <section className="intelligence-scroll">
          {!messages.length
            ? apiState === 'loading' && !workspace.today && baselineExperience === 'idle'
              ? <WorkspaceArrival />
              : apiState === 'error' && !workspace.today && baselineExperience === 'idle'
                ? <WorkspaceUnavailable message={status} onRetry={() => void refreshWorkspace()} />
                : restoreError
                  ? <EmptyState title="That conversation could not be restored." body={`${restoreError} Your Baseline, permissions, and other saved conversations remain unchanged.`} action="Start a new conversation" onAction={() => startNewThread(surface)} />
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
                    onOpenPlan={openPlan}
                    onBuildBaseline={beginBaseline}
                  />
            : <ResponseThread
                messages={messages}
                onAction={handleAnswerAction}
                onSave={(answer) => void saveAnswer(answer)}
                onCorrection={(value) => void saveCorrection(value)}
                onShowPlan={openPlan}
              />}
        </section>

        {baselineExperience === 'idle' && baselineReady && surfaceEntitled && (
          <form className="sovereign-composer" onSubmit={submit}>
            <div className="composer-context-line">
              <span>Drawing from · {contextItems.join(' · ')}</span>
              <button type="button" onClick={() => setContextOpen(true)}>Adjust who and what</button>
            </div>
            {!composerFocused && !draft && <span className="composer-example" key={`${surface}-${exampleIndex}`} aria-hidden="true">{composerExamples[surface][exampleIndex % composerExamples[surface].length]}</span>}
            <div className="composer-entry">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={10_000}
                onFocus={() => setComposerFocused(true)}
                onBlur={() => setComposerFocused(false)}
                placeholder={composerPlaceholder(surface)}
                rows={2}
                aria-label={`Message Sovereign from ${surface}`}
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
        <header><div><p>{surface === 'Today' ? 'What is active' : surface === 'Explore' ? 'Explore' : surface === 'People' ? 'People' : surface === 'Systems' ? 'Systems' : surface === 'Library' ? 'Library' : 'Your account'}</p><h2>{surface}</h2></div><button onClick={() => setContextOpen(false)} aria-label="Close context">×</button></header>
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
            onOpenPlan={openPlan}
            onBuildBaseline={beginBaseline}
          />
        </div>
      </aside>

      {menuOpen && (
        <ModalDialog className="workspace-sheet" labelledBy="account-sheet-title" onClose={() => setMenuOpen(false)}>
          <button className="sheet-backdrop" aria-label="Close workspace menu" onClick={() => setMenuOpen(false)} />
          <section>
            <header><h2 id="account-sheet-title">Sovereign.OS</h2><button onClick={() => setMenuOpen(false)} aria-label="Close">×</button></header>
            <nav aria-label="Navigate">
              {surfaces.map((item) => <button key={item.name} aria-current={surface === item.name ? 'page' : undefined} onClick={() => { openSurface(item.name); setMenuOpen(false); }}>{item.label}<small>{item.description}</small></button>)}
            </nav>
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
            <div><button className="primary-action" onClick={() => void useCovenantForQuestion()}>Use for this question</button></div>
          </section>
        </ModalDialog>
      )}

      <span className="covenant-state" aria-live="polite">{covenantEnabled ? 'Covenant is active for this question.' : ''}</span>
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
    setMessage('Sovereign is building your private Baseline…');
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
      setMessage(error instanceof Error ? error.message : 'Your Baseline could not be completed yet.');
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
          <p>These details create the private reference Sovereign uses across self, decisions, relationships, and systems.</p>

          {step === 1 && (
            <form onSubmit={continueFromDetails} className="baseline-step-form">
              <label>
                <strong>Birth date</strong>
                <span>Required for the Baseline calculation.</span>
                <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required />
              </label>
              <label>
                <strong>Birthplace</strong>
                <span>Used to resolve time and astronomical context.</span>
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
                <p>Birth-time certainty changes which time-sensitive parts can be used and how much uncertainty they carry.</p>
                {[
                  ['exact', 'Exact', 'Use this when the recorded time is known.'],
                  ['approximate', 'Approximate', 'Use this when the time is close but not exact.'],
                  ['unknown', 'Unknown', 'You can continue without a birth time. Sovereign will not guess unavailable values.']
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
                  <span>Improves time-sensitive parts of the calculation.</span>
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
              <p>Your raw birth details and exact private location stay private. You can review and correct your Baseline.</p>
              <button className="baseline-primary" disabled={state === 'submitting'}>{state === 'submitting' ? 'Building your Baseline…' : 'Build my Baseline'} <span aria-hidden="true">→</span></button>
              <button type="button" className="baseline-back" onClick={() => setStep(2)} disabled={state === 'submitting'}>Back</button>
            </form>
          )}

          {message && <p className={`baseline-builder-message ${state === 'error' ? 'error' : ''}`} role={state === 'error' ? 'alert' : 'status'}>{message}</p>}
        </div>
        <aside>
          <h2>Why this matters</h2>
          <p>Your Baseline gives Sovereign a consistent place to begin before you describe a problem.</p>
          <p>Your raw birth details and exact private location stay private.</p>
          <small>{step === 1 ? 'Next, you’ll confirm your birth-time certainty and review your details.' : step === 2 ? 'Next, you’ll review the details before anything is calculated.' : 'After this, Sovereign will reveal a small number of high-value qualities you can begin exploring.'}</small>
        </aside>
      </div>
    </section>
  );
}

function BaselineReveal({ result, today, onOpenToday, onCurrentContext }: {
  result: Json | null;
  today: Json | null;
  onOpenToday: () => void;
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
      <h1>{core?.title ?? 'Your Baseline is ready to explore.'}</h1>
      <span>{core?.description ?? 'Sovereign can now return to your stable, correctable Baseline across decisions, relationships, pressure, and change.'}</span>
      <BasisStrip values={support.filter(isBasisValue)} />
      <p className="baseline-reveal-distinction">{communication?.description ?? decisions?.description ?? pressure?.description ?? 'Your Baseline is ready beneath the situations you examine.'}</p>
      <div className="baseline-current-choice">
        <span>{currentReady ? 'Current context is available · Your stable Baseline remains separate.' : 'Current context is off · Your Baseline remains available.'}</span>
        <button onClick={onCurrentContext}>Choose whether to add it</button>
      </div>
      <button className="baseline-reveal-primary" onClick={onOpenToday}>Open Today <span aria-hidden="true">→</span></button>
      <small>Your Baseline is yours to review and correct. Keep what fits; correct or reject what does not.</small>
    </section>
  );
}

function SurfaceHome({ surface, workspace, selectedPerson, selectedSystem, api, onPrompt, onOpenContext, onOpenPlan, onBuildBaseline }: {
  surface: Surface;
  workspace: WorkspaceState;
  selectedPerson: Json | null;
  selectedSystem: Json | null;
  api: (path: string, init?: RequestInit) => Promise<Json>;
  onPrompt: (prompt: string) => void;
  onOpenContext: () => void;
  onOpenPlan: (feature: EntitledFeature) => void;
  onBuildBaseline: () => void;
}) {
  const missingFeature = missingSurfaceEntitlement(surface, workspace.billing);
  if (missingFeature) return <EntitlementRequired surface={surface} feature={missingFeature} onOpenPlan={onOpenPlan} />;
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
          ? <TodayFacetView facets={facets} current={current} registry={registry} />
          : baseline?.status === 'not_started' || !baseline
            ? <BaselineInvitation onBuild={onBuildBaseline} />
            : <BaselinePreparingState baseline={baseline} onReview={onBuildBaseline} />}
      </div>
    );
  }
  if (surface === 'Explore') return <ExploreHome workspace={workspace} />;
  if (surface === 'People') return (
    <div className="surface-home">
      <SurfaceHeading kicker="People" title="See how the same moment can land differently." body="Keep each person distinct. See what each person brings, what happens when they meet, and what may help the next conversation go differently." />
      {selectedPerson
        ? <RelationshipOverview person={selectedPerson} api={api} />
        : <EmptyState title="Choose one relationship to examine." body="A name alone does not create access. The other person connects their account and chooses what Sovereign may use." action="Invite or choose someone" onAction={onOpenContext} />}
    </div>
  );
  if (surface === 'Systems') return (
    <div className="surface-home">
      <SurfaceHeading kicker="Systems" title="See the whole system." body="See who is involved, where responsibility sits, how pressure moves, and what changes when one person responds differently." />
      {selectedSystem
        ? <SystemOverview system={selectedSystem} api={api} />
        : <EmptyState title="Choose a system to examine." body="Choose a group to see who is involved, what each person is carrying, where pressure gathers, and how the group responds." action="Choose a system" onAction={onOpenContext} />}
    </div>
  );
  if (surface === 'Library') return (
    <div className="surface-home">
      <SurfaceHeading kicker="Library" title="Keep what changes your understanding." body="Saved distinctions, relationship understandings, and system views. Library is not a journal or transcript archive — it is a collection of what was useful." />
      <LibraryGrid library={workspace.library} onPrompt={onPrompt} />
    </div>
  );
  return (
    <div className="surface-home">
      <SurfaceHeading kicker="You" title="Your Baseline, Expression Field, permissions, and account." body="Review the private reference Sovereign uses across self, decisions, relationships, and systems. Manage permissions, privacy, plan, and account controls." />
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
        <h1>Your intelligence begins with your Baseline.</h1>
        <p>Sovereign.OS uses your Baseline — the private reference grounded in who you are — to understand how you communicate, decide, connect, respond to pressure, and move through change.</p>
        <button onClick={onBuild}>Build my Baseline <span aria-hidden="true">→</span></button>
        <small>Complete it once to open Today, personal exploration, choices, relationships, and systems from the same Baseline.</small>
      </div>
      <div className="baseline-foundation-visual" aria-hidden="true"><span /><span /><span /><i /></div>
      <div className="baseline-composer-preview">
        <strong>Your Baseline stays beneath every exploration.</strong>
        <span>Future questions and saved distinctions return to the same reference.</span>
      </div>
    </section>
  );
}

function BaselinePreparingState({ baseline, onReview }: { baseline: Json; onReview: () => void }) {
  return (
    <section className="baseline-preparing">
      <p>Today</p>
      <h1>{baseline?.readinessState === 'source_unavailable' ? 'Your Baseline source could not be calculated yet.' : 'Sovereign is preparing the parts of your Baseline you can explore.'}</h1>
      <span>{baseline?.readinessMessage ?? 'Your account and saved data remain unchanged. Sovereign is still preparing your Baseline. Try again when it is ready.'}</span>
      <button onClick={onReview}>Review my Baseline details</button>
    </section>
  );
}

function TodayFacetView({ facets, current, registry }: { facets: Json[]; current: Json; registry: Json[] }) {
  const facet = (id: string) => facets.find((item) => item.id === id);
  const core = facet('core_orientation') ?? facets[0];
  const activeIds = current?.status === 'ready' && Array.isArray(current?.reduced?.affectedBaselineFacetIds)
    ? current.reduced.affectedBaselineFacetIds
    : [];
  const active = facets.find((item) => activeIds.includes(item.id));
  const support = registry.filter((item) => Array.isArray(core?.basisRefs) && core.basisRefs.includes(item.id));
  return (
    <section className="today-facet-view">
      <header>
        <p>Today</p>
        <h1>What is active for you now?</h1>
        <span>Begin with what remains steady, then see what may be louder today. Your Baseline stays beneath every exploration.</span>
      </header>
      <p className="today-steady"><strong>What remains steady</strong>{core?.description ?? 'Your Baseline remains available beneath the conversation.'}</p>
      <p className="today-current" data-state={current?.status ?? 'not_started'}><strong>Temporary current context</strong>{active ? `${active.title} may be more relevant during this window. It does not determine your behavior.` : current?.status === 'ready' ? `On${current?.reduced?.expiresAt ? ` until ${formatCurrentExpiry(current.reduced.expiresAt)}` : ''}. No temporary factor is being elevated above your stable Baseline here.` : current?.status === 'expired' ? 'Expired. It will not be shown as live or used until you refresh it.' : current?.status === 'unavailable' ? 'Unavailable. Your stable Baseline remains unchanged.' : 'Off. Your stable Baseline remains available.'}</p>
      <BasisStrip values={support.filter(isBasisValue)} />
    </section>
  );
}

function ExploreHome({ workspace }: { workspace: WorkspaceState }) {
  const registry = Array.isArray(workspace.today?.baseline?.reducedContext?.basisRegistry)
    ? workspace.today.baseline.reducedContext.basisRegistry.filter(isBasisValue)
    : [];
  return (
    <div className="surface-home explore-home">
      <SurfaceHeading kicker="Explore" title="Explore yourself more deeply." body="See how you think, decide, create, connect, and grow. Bring in a decision, relationship, pressure point, or recurring pattern to see how it connects to your Baseline." />
      <BasisStrip values={registry} />
    </div>
  );
}

function RelationshipOverview({ person, api }: { person: Json; api: (path: string, init?: RequestInit) => Promise<Json> }) {
  const [comparison, setComparison] = useState<Json | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    void api(`/api/v1/people/${encodeURIComponent(person.id)}/comparison`, { method: 'POST', body: '{}' })
      .then((data) => setComparison(data.comparison ?? null))
      .catch((problem) => setError(problem instanceof Error ? problem.message : 'Comparison unavailable.'));
  }, [person.id]);
  if (error) return <EmptyState title="This relationship needs one more permission." body={error} action="Manage permissions" onAction={openConsentControls} />;
  if (!comparison) return <p className="loading-state" role="status">Looking at your shared Baseline…</p>;
  const participants = comparison.participants ?? [];
  const fieldSubjects: ExpressionFieldSubject[] = participants.slice(0, 2).map((participant: Json, index: number) => ({
    id: String(participant.key ?? `participant-${index}`),
    label: index === 0 ? 'You' : String(participant.label ?? person.displayName ?? 'They'),
    meta: String(participant.facets?.[0]?.title ?? 'Shared Baseline'),
    detail: String(participant.facets?.[0]?.description ?? 'This shared view is incomplete and can be corrected.'),
    axes: expressionAxes(participant.expressionAxes),
    selectedAxisId: 'clarity'
  }));
  return (
    <section className="relationship-overview">
      <div className="person-split">
        {participants.slice(0, 2).map((participant: Json, index: number) => (
          <article key={participant.key ?? index}><span>{index === 0 ? 'YOU MAY BE BRINGING' : 'THEY MAY BE BRINGING'}</span><h2>{participant.facets?.[0]?.title ?? 'Shared Baseline'}</h2><p>{participant.facets?.[0]?.description ?? 'This part of the shared Baseline is incomplete.'}</p></article>
        ))}
      </div>
      <WorkspaceExpressionField
        mode="relationship"
        subjects={fieldSubjects}
        context={{
          label: 'What happens between you',
          meta: 'Two people',
          detail: 'Sovereign keeps each person distinct, then shows the interaction, each person’s responsibility, and what still needs to be asked directly.',
          selectedAxisId: 'clarity'
        }}
        className="workspace-context-field"
      />
      <article className="relationship-field"><span>WHAT HAPPENS BETWEEN YOU</span><p>The conversation can now use the Baseline information both people chose to share, while keeping each person’s responsibility and private experience separate.</p></article>
    </section>
  );
}

function SystemOverview({ system, api }: { system: Json; api: (path: string, init?: RequestInit) => Promise<Json> }) {
  const [analysis, setAnalysis] = useState<Json | null>(null);
  const [activeConnection, setActiveConnection] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    setAnalysis(null);
    setActiveConnection(0);
    setError('');
    void api(`/api/v1/systems/${encodeURIComponent(system.id)}/analysis`)
      .then((data) => setAnalysis(data.analysis ?? null))
      .catch((problem) => setError(problem instanceof Error ? problem.message : 'System analysis unavailable.'));
  }, [system.id]);
  if (error) return <EmptyState title="This system needs more confirmed context." body={error} action="Review members" onAction={openConsentControls} />;
  if (!analysis) return <p className="loading-state" role="status">Preparing this system view…</p>;
  const participants = analysis.participants ?? [];
  const edges = analysis.relationshipGraph ?? [];
  const edge = edges[activeConnection];
  const fieldSubjects: ExpressionFieldSubject[] = participants.slice(0, 6).map((participant: Json, index: number) => ({
    id: String(participant.key ?? `participant-${index}`),
    label: String(participant.label ?? `Person ${index + 1}`),
    meta: String(participant.role ?? 'Role not confirmed'),
    detail: String(participant.facets?.[0]?.description ?? 'This person remains distinct. Only the role and Baseline context they chose to share are included.'),
    axes: expressionAxes(participant.expressionAxes),
    selectedAxisId: axisForConnectionType(String(edge?.type ?? 'responsibility'))
  }));
  const activeFieldConnection: ExpressionFieldConnection | undefined = edge ? { from: String(edge.from), to: String(edge.to) } : undefined;
  const selectParticipant = (id: string) => {
    const relatedIndex = edges.findIndex((item: Json) => String(item.from) === id || String(item.to) === id);
    if (relatedIndex >= 0) setActiveConnection(relatedIndex);
  };
  return (
    <section className="system-overview">
      <header><div><span>{String(analysis.system?.type ?? 'SYSTEM').replace('_', ' ')}</span><h2>{analysis.system?.label ?? system.name}</h2></div></header>
      <div className="system-graph" aria-label="Supported system relationships">
        <WorkspaceExpressionField
          mode="system"
          subjects={fieldSubjects}
          context={{
            label: 'System interaction',
            meta: `${fieldSubjects.length} people`,
            detail: 'Each person stays distinct while roles, responsibility, reliance, communication, and pressure remain visible across the system.',
            selectedAxisId: axisForConnectionType(String(edge?.type ?? 'responsibility'))
          }}
          {...(activeFieldConnection ? { activeConnection: activeFieldConnection } : {})}
          onSelectionChange={selectParticipant}
          className="workspace-context-field context-system-graph"
        />
      </div>
      <div className="connection-focus">
        <span>ACTIVE CONNECTION</span>
        {edge ? <p>{edge.from} → {edge.to} · {edge.type}{edge.detail ? ` · ${edge.detail}` : ''}</p> : <p>No relationship edge is shown until responsibility, reliance, or communication is supplied.</p>}
        {edges.length > 1 && <div>{edges.map((_: Json, index: number) => <button key={index} aria-pressed={activeConnection === index} onClick={() => setActiveConnection(index)}>Connection {index + 1}</button>)}</div>}
      </div>
      <aside><strong>Pressure field</strong><p>{analysis.pressureField?.observations?.[0] ?? 'Pressure stays tied to supplied observations and approved participant context.'}</p></aside>
    </section>
  );
}

function ResponseThread({ messages, onAction, onSave, onCorrection, onShowPlan }: {
  messages: ChatMessage[];
  onAction: (action: AnswerAction) => void;
  onSave: (answer: SovereignAnswer) => void;
  onCorrection: (value: 'yes' | 'partly' | 'not_today') => void;
  onShowPlan: (feature: EntitledFeature) => void;
}) {
  const threadRef = useRef<HTMLDivElement>(null);
  const latestAnswerId = [...messages].reverse().find((message) => message.answer)?.id;

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    const last = el.lastElementChild;
    if (last) last.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, messages[messages.length - 1]?.text]);

  return (
    <div className="response-thread" ref={threadRef}>
      {messages.map((message) => message.role === 'user'
        ? <article key={message.id} className="user-question"><p>{message.text}</p></article>
        : <article key={message.id} className="sovereign-response">
            {message.answer
              ? <SovereignAnswerView
                  answer={message.answer}
                  basis={message.basis ?? []}
                  {...(message.expressionFieldContext ? { expressionFieldContext: message.expressionFieldContext } : {})}
                  {...(message.interfaceActions ? { interfaceActions: message.interfaceActions } : {})}
                  latest={message.id === latestAnswerId}
                  onAction={onAction}
                  onSave={() => onSave(message.answer!)}
                  onCorrection={onCorrection}
                  onShowPlan={onShowPlan}
                />
              : <><p className="thinking" aria-hidden="true">{message.text || 'Considering your question…'}</p><span className="visually-hidden" role="status">Sovereign is building the answer.</span></>}
          </article>)}
    </div>
  );
}

function SovereignAnswerView({ answer, basis, expressionFieldContext, interfaceActions, latest, onAction, onSave, onCorrection, onShowPlan }: {
  answer: SovereignAnswer;
  basis: BasisValue[];
  expressionFieldContext?: Json;
  interfaceActions?: InterfaceActionEnvelope;
  latest: boolean;
  onAction: (action: AnswerAction) => void;
  onSave: () => void;
  onCorrection: (value: 'yes' | 'partly' | 'not_today') => void;
  onShowPlan: (feature: EntitledFeature) => void;
}) {
  const trustedAnswerActions = [interfaceActions?.primary, ...(interfaceActions?.contextual ?? [])]
    .filter((action): action is AnswerAction => Boolean(action && action.type !== 'show_plan'));
  const primaryAction = trustedAnswerActions.find((action) => ['explore_facet', 'examine_alignment', 'open_person', 'invite_person', 'open_system'].includes(action.type));
  const covenantAction = trustedAnswerActions.find((action) => action.type === 'offer_covenant');
  const saveAction = trustedAnswerActions.find((action) => action.type === 'save_to_library');
  const planActions = [interfaceActions?.primary, ...(interfaceActions?.contextual ?? [])]
    .filter((action): action is PlanAction => action?.type === 'show_plan');
  const primaryPlanAction = planActions.find((action) => !['library', 'covenant'].includes(action.feature));
  const covenantPlanAction = planActions.find((action) => action.feature === 'covenant');
  const libraryPlanAction = planActions.find((action) => action.feature === 'library');
  const unknown = answer.sections.find((section) => section.id === 'unknowns');
  const standardSections = answer.sections.filter((section) => section.id !== 'unknowns');

  return (
    <section className={`sovereign-answer answer-${answer.mode}`} aria-label={`${answer.mode.replace('_', ' ')} answer`}>
      <header><span>{modeLabel(answer.mode)}</span><h2>{answer.headline}</h2></header>
      <p className="direct-answer">{answer.direct_answer}</p>

      {answer.mode === 'alignment'
        ? <AlignmentView sections={standardSections} />
        : answer.mode === 'relationship'
          ? <RelationshipAnswer sections={standardSections} {...(expressionFieldContext ? { expressionFieldContext } : {})} />
          : answer.mode === 'system'
            ? <SystemAnswer sections={standardSections} {...(expressionFieldContext ? { expressionFieldContext } : {})} />
          : answer.mode === 'covenant'
              ? <CovenantAnswer sections={standardSections} />
              : <div className="answer-sections">{standardSections.map((section) => <article className={section.id === 'experiment' ? 'answer-experiment' : ''} key={`${section.id}-${section.label}`}><span>{section.label}</span><p>{section.body}</p></article>)}</div>}

      <div className="answer-evidence-row">
        <BasisStrip values={basis} />
        {covenantAction && <button className="covenant-action" onClick={() => onAction(covenantAction)}><span aria-hidden="true">✝</span>{covenantAction.label}</button>}
        {!covenantAction && covenantPlanAction && <button className="covenant-action plan-action" onClick={() => onShowPlan(covenantPlanAction.feature)}><span aria-hidden="true">✝</span>{covenantPlanAction.label}</button>}
      </div>
      <p className="answer-limit"><strong>What still needs clarity</strong>{unknown?.body ?? 'Your actual response, another person’s private experience, and the outcome can only be confirmed through what happens next or what they tell you directly.'}</p>

      {latest && (
        <footer className="answer-actions">
          <div className="fit-controls"><span>{answer.correction_prompt}</span><button onClick={() => onCorrection('yes')}>Yes</button><button onClick={() => onCorrection('partly')}>Partly</button><button onClick={() => onCorrection('not_today')}>Not today</button></div>
          <nav className="answer-continuations" aria-label="Continue this understanding">
            {primaryAction && <button onClick={() => onAction(primaryAction)}>{primaryAction.label} <span aria-hidden="true">→</span></button>}
            {!primaryAction && primaryPlanAction && <button className="plan-action" onClick={() => onShowPlan(primaryPlanAction.feature)}>{primaryPlanAction.label} <span aria-hidden="true">→</span></button>}
            {saveAction
              ? <button onClick={onSave}>Save this understanding <span aria-hidden="true">→</span></button>
              : libraryPlanAction
                ? <button className="plan-action" onClick={() => onShowPlan(libraryPlanAction.feature)}>{libraryPlanAction.label} <span aria-hidden="true">→</span></button>
                : null}
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

function RelationshipAnswer({ sections, expressionFieldContext }: { sections: SovereignAnswer['sections']; expressionFieldContext?: Json }) {
  const byId = (id: AnswerSectionId) => sections.find((section) => section.id === id);
  const you = byId('you');
  const other = byId('other');
  const interaction = byId('interaction');
  const fieldSubjects = expressionFieldSubjects(expressionFieldContext).slice(0, 2).map((subject, index) => ({
    ...subject,
    label: index === 0 ? 'You' : 'They',
    meta: index === 0 ? you?.label ?? 'You may be bringing' : other?.label ?? 'They may be bringing',
    detail: index === 0
      ? you?.body ?? 'Your part remains open to correction.'
      : other?.body ?? 'Their private experience remains theirs to confirm.',
    selectedAxisId: 'clarity' as const
  }));
  return (
    <section className="relationship-answer">
      {fieldSubjects.length === 2 && <ThreadExpressionField
        mode="relationship"
        subjects={fieldSubjects}
        context={{
          label: interaction?.label ?? 'What happens between you',
          meta: 'Two people',
          detail: interaction?.body ?? 'What happens between you remains separate from either person\'s identity.',
          selectedAxisId: 'clarity'
        }}
        className="answer-context-field"
      />}
      <div><article><span>{you?.label ?? 'You may be bringing'}</span><p>{you?.body}</p></article><article><span>{other?.label ?? 'They may be bringing'}</span><p>{other?.body}</p></article></div>
      <article className="interaction-field"><span>{interaction?.label ?? 'What happens between you'}</span><p>{interaction?.body}</p></article>
      {sections.filter((section) => !['you', 'other', 'interaction'].includes(section.id)).map((section) => <article key={`${section.id}-${section.label}`}><span>{section.label}</span><p>{section.body}</p></article>)}
    </section>
  );
}

function SystemAnswer({ sections, expressionFieldContext }: { sections: SovereignAnswer['sections']; expressionFieldContext?: Json }) {
  const system = sections.find((section) => section.id === 'system');
  const fieldSubjects = expressionFieldSubjects(expressionFieldContext).map((subject) => ({ ...subject, selectedAxisId: 'responsibility' as const }));
  return (
    <section className="system-answer">
      {fieldSubjects.length >= 2 && <ThreadExpressionField
        mode="system"
        subjects={fieldSubjects}
        context={{
          label: 'System interaction',
          meta: `${fieldSubjects.length} people`,
          detail: system?.body ?? 'Each person remains distinct. This view shows how their roles, responsibilities, and shared Baseline context interact in the system.',
          selectedAxisId: 'responsibility'
        }}
        className="answer-context-field"
      />}
      {sections.map((section) => <article key={`${section.id}-${section.label}`}><span>{section.label}</span><p>{section.body}</p></article>)}
    </section>
  );
}

function CovenantAnswer({ sections }: { sections: SovereignAnswer['sections'] }) {
  return <section className="covenant-answer">{sections.map((section) => <article key={`${section.id}-${section.label}`}><span>{section.label}</span><p>{section.body}</p></article>)}</section>;
}

function BasisStrip({ values }: { values: BasisValue[] }) {
  const [open, setOpen] = useState(false);
  const mobile = useMediaQuery('(max-width: 640px)');
  const limit = mobile ? 3 : 5;
  const available = values.filter(isDisplayableBasisValue);
  const visible = available.slice(0, limit);
  if (!available.length) return null;
  return (
    <>
      <button className="basis-strip" onClick={() => setOpen(true)} aria-label={`Sources. Open ${available.length} source details.`}>
        <strong>Sources</strong>
        <span className="basis-values">{visible.map((value, index) => <span key={value.id}>{index > 0 && <i aria-hidden="true"> · </i>}<b aria-label={value.accessibleLabel}>{value.accessibleLabel}</b></span>)}</span>
        {available.length > limit && <em>+{available.length - limit}</em>}
        <i aria-hidden="true">⌄</i>
      </button>
      {open && (
        <ModalDialog className="source-drawer" labelledBy="basis-title" onClose={() => setOpen(false)}>
          <button className="sheet-backdrop" onClick={() => setOpen(false)} aria-label="Close source details" />
          <section>
            <header><div><span>Sources</span><h2 id="basis-title">Source details</h2></div><button onClick={() => setOpen(false)} aria-label="Close">×</button></header>
            <p>These are the source values Sovereign used for this answer. They can inform reflection; they do not prove personality or current state.</p>
            <dl>{available.map((value) => <div key={value.id}><dt>{value.display}</dt><dd><span>{value.accessibleLabel}</span><span>Source · {value.provenance}</span><span>Calculated · {formatDate(value.computedAt)}</span><span>Uncertainty · {value.uncertainty}</span><span>Applies to · {value.subject === 'self' ? 'You' : value.subject === 'other' ? 'Other person' : 'Relationship'}</span>{value.expiresAt && <span>Expires · {formatDate(value.expiresAt)}</span>}</dd></div>)}</dl>
          </section>
        </ModalDialog>
      )}
    </>
  );
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <section className="empty-state"><h2>{title}</h2><p>{body}</p><button onClick={onAction}>{action} <span aria-hidden="true">→</span></button></section>;
}

function EntitlementRequired({ surface, feature, onOpenPlan }: { surface: Surface; feature: EntitledFeature; onOpenPlan: (feature: EntitledFeature) => void }) {
  return <section className="entitlement-required"><p>{surface}</p><h1>{surface} is available with Sovereign+.</h1><span>Your Baseline, current question, and existing private data remain unchanged. Review Sovereign+ only if you want to use this part of the product now.</span><button onClick={() => onOpenPlan(feature)}>Review Sovereign+</button></section>;
}

function WorkspaceArrival() {
  return <section className="workspace-arrival" role="status"><span>Sovereign</span><h1>Opening your workspace.</h1><p>Bringing your Baseline, current context, conversations, and permissions together.</p></section>;
}

function WorkspaceUnavailable({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <section className="workspace-arrival unavailable" role="alert"><span>Sovereign</span><h1>Your private workspace could not open yet.</h1><p>{message}</p><button onClick={onRetry}>Try again <span aria-hidden="true">→</span></button></section>;
}

function AccountSummary({ workspace, onOpenContext, onBuildBaseline }: { workspace: WorkspaceState; onOpenContext: () => void; onBuildBaseline: () => void }) {
  const baselineReady = workspace.today?.baseline?.status === 'completed'
    && workspace.today?.baseline?.ready === true
    && workspace.today?.baseline?.facetProfileStatus === 'ready';
  const plan = workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free';
  return (
    <nav className="account-settings-index" aria-label="You settings">
      <button onClick={onBuildBaseline}><span>Baseline</span><small>{baselineReady ? 'Ready · review or rebuild' : 'Required before conversation'}</small></button>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('sovereign:open-expression-field'))}><span>Expression Field</span><small>How your Baseline expresses across 16 dimensions — steady, active, protective, or at its best</small></button>
      <button onClick={onOpenContext}><span>Current context</span><small>{workspace.today?.current?.status === 'ready' ? 'On for a limited window' : workspace.today?.current?.status === 'expired' ? 'Expired · refresh only if you choose' : workspace.today?.current?.status === 'unavailable' ? 'Current context unavailable · Baseline unchanged' : 'Off · stable Baseline remains available'}</small></button>
      <button onClick={openConsentControls}><span>Permissions</span><small>Review, deny, or revoke each person’s specific use</small></button>
      <button onClick={openConsentControls}><span>People and invitations</span><small>{workspace.people.length ? `${workspace.people.length} private connection${workspace.people.length === 1 ? '' : 's'}` : 'No shared relationship context yet'}</small></button>
      <button onClick={() => window.dispatchEvent(new CustomEvent('sovereign:open-system-membership'))}><span>System permissions</span><small>Review members, roles, and who is currently included</small></button>
      <button onClick={openAccountControls}><span>Data and privacy</span><small>Download your data, manage saved information, or delete your account</small></button>
      <button onClick={onOpenContext}><span>Plan and billing</span><small>{plan}</small></button>
      <button onClick={openAccountControls}><span>Account</span><small>Access and account controls</small></button>
      <button onClick={onOpenContext}><span>Accessibility</span><small>Keyboard, text scaling, focus, and reduced motion</small></button>
    </nav>
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
  onOpenPlan: (feature: EntitledFeature) => void;
  onBuildBaseline: () => void;
}) {
  const missingFeature = missingSurfaceEntitlement(props.surface, props.workspace.billing);
  if (missingFeature) return <EntitlementRequired surface={props.surface} feature={missingFeature} onOpenPlan={props.onOpenPlan} />;
  if (props.surface === 'People') return <PeopleControls {...props} />;
  if (props.surface === 'Systems') return <SystemControls {...props} />;
  if (props.surface === 'Library') return <LibraryGrid library={props.workspace.library} onPrompt={props.setDraft} compact />;
  if (props.surface === 'You') return <YouControls {...props} />;
  return <div className="context-stack context-summary"><p className="context-intro">Sovereign uses the parts of your Baseline that matter to the situation you are examining.</p><small>Current context is added only while you choose to keep it on and it is still current.</small></div>;
}

function PeopleControls({ workspace, selectedPerson, setSelectedPerson, api, refresh }: any) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  const permitted = workspace.people.filter((person: Json) =>
    person.identityBound === true
    && person.baselineStatus === 'ready'
    && Array.isArray(person.activeScopes)
    && person.activeScopes.includes('pair.compare')
    && person.activeScopes.includes('trait.display')
  );

  const selected = permitted.find((person: Json) => person.id === selectedPerson);

  const [inviteStatus, setInviteStatus] = useState('');
  const [inviteError, setInviteError] = useState('');

  async function invite() {
    const displayName = name.trim();
    const relationshipRole = role.trim();
    const invitationEmail = email.trim().toLowerCase();

    if (
      !displayName
      || !relationshipRole
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitationEmail)
    ) return;

    if (!window.confirm(`Send a private Sovereign.OS invitation to ${invitationEmail}?`)) return;

    setInviteError('');
    setInviteStatus('Sending invitation…');
    try {
      await api('/api/v1/invitations/send', {
        method: 'POST',
        body: JSON.stringify({
          displayName,
          role: relationshipRole,
          email: invitationEmail,
          requestedScopes: ['pair.compare', 'trait.display', 'system.include']
        })
      });

      setName('');
      setRole('');
      setEmail('');
      setSelectedPerson('');
      setInviteStatus('Invitation sent.');
      await refresh();
    } catch (error) {
      setInviteStatus('');
      setInviteError(error instanceof Error ? error.message : 'The invitation could not be sent.');
    }
  }

  return (
    <div className="context-stack">
      <p className="context-intro">
        Shared relationship intelligence begins with an invitation. The other person signs in or creates their account, completes their own Baseline, and decides what Sovereign may use.
      </p>

      <button className="secondary-action" onClick={openConsentControls}>
        Manage invitations and permissions
      </button>

      <label>
        Invite a person
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
        />
      </label>

      <label>
        Their role in your relationship
        <input
          value={role}
          onChange={(event) => setRole(event.target.value)}
          placeholder="Partner, sibling, parent, friend, teammate…"
        />
      </label>

      <label>
        Invitation email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
        />
      </label>

      <button
        className="primary-action"
        disabled={!name.trim() || !role.trim() || !email.includes('@')}
        onClick={() => void invite()}
      >
        Send private invitation
      </button>

      {inviteStatus && <p className="context-feedback" role="status">{inviteStatus}</p>}
      {inviteError && <p className="context-feedback error" role="alert">{inviteError}</p>}

      <label>
        Choose a permitted person
        <select
          value={selectedPerson}
          onChange={(event) => setSelectedPerson(event.target.value)}
        >
          <option value="">Only me</option>
          {permitted.map((person: Json) => (
            <option key={person.id} value={person.id}>
              {person.displayName} · {person.role}
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <p className="permission-card">{selected.displayName} · {selected.role}</p>
      )}
    </div>
  );
}

function SystemControls({ workspace, selectedSystem, setSelectedSystem, api, refresh }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('family');
  const [systemError, setSystemError] = useState('');
  async function createSystem() {
    if (!name.trim()) return;
    setSystemError('');
    try {
      const data = await api('/api/v1/systems', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), systemType: type, metadata: { sharedObjective: null, constraints: [], observations: [] } })
      });
      setName('');
      await refresh();
      if (data.system?.id) setSelectedSystem(data.system.id);
    } catch (error) {
      setSystemError(error instanceof Error ? error.message : 'The system could not be created.');
    }
  }
  return (
    <div className="context-stack">
      <p className="context-intro">A System helps you see who is involved, the roles people take, where responsibility sits, and how pressure moves across a family, household, team, or group.</p>
      <label>New system<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Family, household, team…" /></label>
      <label>Type<select value={type} onChange={(event) => setType(event.target.value)}>{['family', 'household', 'friendship_group', 'team', 'workplace', 'custom'].map((item) => <option key={item} value={item}>{systemTypeLabel(item)}</option>)}</select></label>
      <button className="secondary-action" onClick={() => void createSystem()}>Create system</button>
      {systemError && <p className="context-feedback error" role="alert">{systemError}</p>}
      <label>Choose a system<select value={selectedSystem} onChange={(event) => setSelectedSystem(event.target.value)}><option value="">No system</option>{workspace.systems.map((system: Json) => <option key={system.id} value={system.id}>{system.name}</option>)}</select></label>
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
    try {
      const data = await api(path, { method: 'POST', body: JSON.stringify(body) });
      const url = data.checkout?.url ?? data.portal?.url;
      if (url) location.assign(url);
    } catch (error) {
      setCurrentAction('error');
      setCurrentMessage(error instanceof Error ? error.message : 'Billing is temporarily unavailable.');
    }
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
        <p>BASELINE</p><h3>{workspace.today?.baseline?.status === 'completed' ? 'Your Baseline is ready.' : 'Your intelligence begins here.'}</h3><span>If you rebuild your Baseline, future answers use the updated version. Saved answers keep the sources that shaped them.</span>
        <button className="primary-action" onClick={onBuildBaseline}>{workspace.today?.baseline?.status === 'completed' ? 'Review or recompute my Baseline' : 'Build my Baseline'}</button>
      </section>
      <section className="control-section">
        <p>CURRENT CONTEXT</p><h3>Current context stays separate.</h3>
        <span>Choose whether to add current astronomical context for six hours. It uses a geocentric view, does not request your device location, and never determines your behavior.</span>
        <div className="current-permission-state" data-state={currentReady ? 'ready' : current.status}>
          <strong>{currentReady ? 'Current context on' : current.status === 'expired' ? 'Current context expired' : 'Current context off'}</strong>
          <small>{currentReady && current.reduced?.expiresAt ? `${current.computedAt ? `Enabled ${formatCurrentExpiry(current.computedAt)} · ` : ''}Available until ${formatCurrentExpiry(current.reduced.expiresAt)}` : 'Your stable Baseline remains available.'}</small>
        </div>
        <div className="current-permission-actions">
          {!currentReady && <button className="secondary-action" disabled={currentAction === 'loading'} onClick={() => void enableCurrentContext()}>{currentAction === 'loading' ? 'Adding context…' : 'Enable for six hours'}</button>}
          {currentReady && <button className="secondary-action" disabled={currentAction === 'loading'} onClick={() => void enableCurrentContext()}>{currentAction === 'loading' ? 'Refreshing…' : 'Refresh six hours'}</button>}
          {(currentReady || current.status === 'expired') && <button className="quiet-danger-action" disabled={currentAction === 'loading'} onClick={() => void removeCurrentContext()}>Remove current context</button>}
        </div>
        {currentMessage && <span className={`current-permission-message ${currentAction === 'error' ? 'error' : ''}`} role={currentAction === 'error' ? 'alert' : 'status'}>{currentMessage}</span>}
      </section>
      <section className="control-section">
        <p>PERMISSIONS</p><h3>Each person and system use stays separate.</h3><span>Each person chooses separately what Sovereign may use for relationship comparisons, Systems, optional framework detail, and shared context. There is no “share everything” control.</span><div className="control-links"><button onClick={openConsentControls}>People and invitations</button><button onClick={() => window.dispatchEvent(new CustomEvent('sovereign:open-system-membership'))}>System membership</button></div>
      </section>
      <section className="control-section">
        <p>PLAN AND BILLING</p><h3>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free'}</h3>
        {workspace.billing?.effective?.plan !== 'sovereign_plus' && <><div className="billing-switch"><button type="button" className={interval === 'annual' ? 'active' : ''} onClick={() => setInterval('annual')}>Annual billing</button><button type="button" className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval('monthly')}>Monthly billing</button></div><button className="primary-action" onClick={() => void handoff('/api/v1/billing/checkout', { interval })}>Choose Sovereign+</button></>}
        {workspace.billing?.effective?.plan === 'sovereign_plus' && <button className="secondary-action" onClick={() => void handoff('/api/v1/billing/portal')}>Manage billing</button>}
      </section>
      <section className="control-section"><p>PRIVACY AND SAVED DATA</p><h3>Your controls stay together.</h3><div className="control-links"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><button onClick={openConsentControls}>Permissions</button><button onClick={openAccountControls}>Library and account data</button></div></section>
      <section className="control-section"><p>ACCOUNT</p><button className="secondary-action" onClick={async () => { try { await api('/api/v1/auth/logout', { method: 'POST' }); } catch { /* logout even if the request fails */ } location.assign('/login'); }}>Log out</button></section>
      <section className="control-section"><p>ACCESSIBILITY</p><h3>The same workspace, without relying on motion.</h3><span>Keyboard navigation, visible focus, text scaling, screen-reader names, and reduced-motion preferences are supported automatically.</span></section>
    </div>
  );
}

function formatCurrentExpiry(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'its recorded expiry';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function missingSurfaceEntitlement(surface: Surface, billing: Json | null): EntitledFeature | null {
  const features = Array.isArray(billing?.effective?.features) ? billing.effective.features as string[] : [];
  if (surface === 'People' && !features.includes('people.compare')) return 'people';
  if (surface === 'Systems' && !features.some((feature) => feature === 'systems.family' || feature === 'systems.team')) return 'systems';
  if (surface === 'Library' && !features.includes('library.continuity')) return 'library';
  return null;
}

function LibraryGrid({ library, onPrompt, compact = false }: { library: Json[]; onPrompt: (prompt: string) => void; compact?: boolean }) {
  if (!library.length) return <section className="empty-state"><h2>Nothing has been kept yet.</h2><p>Save a Sovereign answer when it changes your understanding. Library does not collect unsaved conversations.</p></section>;
  return <div className={`library-list ${compact ? 'compact' : ''}`} role="list">{library.map((item) => <button role="listitem" key={item.id} onClick={() => onPrompt(`Continue from this saved understanding: ${item.body?.summary ?? item.summary ?? ''}`)}><span><strong>{item.body?.title ?? item.title ?? 'Saved understanding'}</strong><small>{String(item.body?.type ?? item.type ?? 'Saved understanding').replaceAll('_', ' ')} · {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Private Library'}</small></span><p>{shorten(item.body?.summary ?? item.summary ?? '', compact ? 120 : 220)}</p></button>)}</div>;
}

function openConsentControls() {
  window.dispatchEvent(new CustomEvent('sovereign:open-consent-controls'));
}

function openAccountControls() {
  window.dispatchEvent(new CustomEvent('sovereign:open-account-controls'));
}

function axisForConnectionType(type: string): ExpressionAxisId {
  if (type === 'communication') return 'clarity';
  if (type === 'reliance') return 'trust';
  return 'responsibility';
}

function expressionFieldSubjects(value: unknown): ExpressionFieldSubject[] {
  if (!isExpressionFieldContext(value)) return [];
  return value.subjects.map((subject: Json, index: number) => ({
    id: String(subject.id ?? `participant-${index}`),
    label: String(subject.label ?? (index === 0 ? 'You' : `Participant ${index}`)),
    meta: String(subject.meta ?? 'Shared Baseline'),
    detail: 'This view uses only Baseline information that person chose to share. What they are feeling right now is theirs to confirm.',
    axes: expressionAxes(subject.axes)
  }));
}

function expressionAxes(value: unknown): ExpressionAxisValue[] {
  if (!Array.isArray(value)) return [];
  const axes = value.filter(isExpressionAxisValue);
  if (axes.length !== expressionAxisIds.length) return [];
  if (new Set(axes.map((axis) => axis.id)).size !== expressionAxisIds.length) return [];
  return axes;
}

function isExpressionFieldContext(value: unknown): value is Json & { subjects: Json[] } {
  if (!value || typeof value !== 'object') return false;
  const context = value as Json;
  if (!['relationship', 'system'].includes(context.kind) || !Array.isArray(context.subjects)) return false;
  return context.subjects.length >= 2 && context.subjects.every((subject: unknown) => {
    if (!subject || typeof subject !== 'object') return false;
    return expressionAxes((subject as Json).axes).length === expressionAxisIds.length;
  });
}

function isExpressionAxisValue(value: unknown): value is ExpressionAxisValue {
  if (!value || typeof value !== 'object') return false;
  const axis = value as Json;
  return typeof axis.id === 'string'
    && expressionAxisIdSet.has(axis.id)
    && typeof axis.label === 'string'
    && typeof axis.baselineValue === 'number'
    && Number.isFinite(axis.baselineValue)
    && axis.baselineValue >= 0
    && axis.baselineValue <= 100
    && typeof axis.currentDelta === 'number'
    && Number.isFinite(axis.currentDelta)
    && typeof axis.value === 'number'
    && Number.isFinite(axis.value)
    && axis.value >= 0
    && axis.value <= 100
    && ['integrated', 'under_pressure', 'mixed', 'unconfirmed'].includes(axis.state)
    && ['supported', 'exploratory'].includes(axis.confidence)
    && Array.isArray(axis.facetIds)
    && Array.isArray(axis.basisRefs)
    && typeof axis.summary === 'string';
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
    ...(isExpressionFieldContext(row.expressionFieldContext) ? { expressionFieldContext: row.expressionFieldContext } : {}),
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

function isDisplayableBasisValue(value: BasisValue): boolean {
  if (value.category !== 'live') return true;
  if (!value.expiresAt) return false;
  const expiry = Date.parse(value.expiresAt);
  return Number.isFinite(expiry) && expiry > Date.now();
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
  return surface === 'People' ? 'What keeps happening between you?'
    : surface === 'Systems' ? 'What role do I keep ending up in?'
      : surface === 'Explore' ? 'What capacity or pattern do I want to understand?'
        : surface === 'Library' ? 'Continue from something you saved…'
          : surface === 'You' ? 'What does my Baseline support here?'
            : 'What feels different today?';
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
