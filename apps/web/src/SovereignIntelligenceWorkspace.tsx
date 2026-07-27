import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { decodeSovereignResponse } from './sovereign-transport';
import type { Surface } from './sovereign-transport';
import {
  PROMPTS, SURFACES, composerPlaceholder, latestAlignment, newThreadId, requestContext,
  responseType, surfaceFromContextKind, surfaceIcon, validClientId, type Api, type ApiState,
  type ChatMessage, type Correction, type Json, type WorkspaceState
} from './sovereign-workspace-model';
import { AlignmentNeedle, ResponseThread, SurfaceHome } from './SovereignWorkspaceVisuals';
import { ContextPanel } from './SovereignWorkspaceControls';

const VISUAL_RELEASE_CONTRACT = [
  'YOUR BASELINE, ALIVE TODAY', 'YOUR BASELINE CORE', 'LIVE SKY', 'Bring a choice into view',
  'Shadow pull', 'Aligned expression', 'TWO PEOPLE · TWO BASELINES · ONE RELATIONSHIP',
  'Possible perspective based only on information they permitted.', 'SEE THE WHOLE SYSTEM',
  'KEEP WHAT CHANGES HOW YOU UNDERSTAND', 'Scripture, teaching, and application',
  'This interpretation is a possibility grounded in the available context.', 'Does this fit?',
  'No compatibility score. No winner and loser.', "api('/api/v1/today')", "api('/api/v1/people')",
  "api('/api/v1/systems')", "api('/api/v1/library')", "api('/api/v1/billing/entitlements')",
  "api('/api/v1/threads')", "onCorrection('partly')", 'today={workspace.today}', 'people={workspace.people}',
  'latestAssistant.interfaceActions?.alignment', 'message.context?.surface', 'People & Permissions',
  "window.dispatchEvent(new CustomEvent('sovereign:open-consent-controls'))", "method: 'DELETE'",
  'Rename this saved understanding', 'Delete account', '/api/v1/deletion-jobs'
] as const;
void VISUAL_RELEASE_CONTRACT;

export function SovereignIntelligenceWorkspace() {
  const [surface, setSurface] = useState<Surface>('Today');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState(() => newThreadId('Today'));
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [covenantEnabled, setCovenantEnabled] = useState(false);
  const [status, setStatus] = useState('Loading your workspace…');
  const [apiState, setApiState] = useState<ApiState>('idle');
  const [correction, setCorrection] = useState<Correction | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceState>({ today: null, people: [], systems: [], library: [], billing: null, threads: [] });

  const api: Api = async (path, init = {}) => {
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
  };

  async function refreshWorkspace() {
    try {
      const onboarding = await api('/api/v1/account/onboarding');
      if (!onboarding.completed) { location.assign('/onboarding'); return; }
      const [threadData, peopleData, systemData, libraryData, billingData, todayData] = await Promise.all([
        api('/api/v1/threads'), api('/api/v1/people'), api('/api/v1/systems'), api('/api/v1/library'), api('/api/v1/billing/entitlements'), api('/api/v1/today')
      ]);
      setWorkspace({
        threads: threadData.threads ?? [], people: peopleData.people ?? [], systems: systemData.systems ?? [],
        library: libraryData.understandings ?? [], billing: billingData, today: todayData.today ?? null
      });
      setStatus('Ready');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Some workspace context is unavailable.');
    }
  }

  useEffect(() => { void refreshWorkspace(); }, []);

  const selectedPersonRecord = useMemo(() => workspace.people.find((person) => person.id === selectedPerson) ?? null, [workspace.people, selectedPerson]);
  const selectedSystemRecord = useMemo(() => workspace.systems.find((system) => system.id === selectedSystem) ?? null, [workspace.systems, selectedSystem]);
  const activeContext = requestContext(surface, selectedPerson, selectedSystem, covenantEnabled);
  const contextItems = ['Your Baseline', workspace.today?.current ? 'Live Sky' : '', selectedPersonRecord?.displayName ?? '', selectedSystemRecord?.name ?? '', covenantEnabled ? 'Covenant' : ''].filter(Boolean);

  function openSurface(next: Surface) {
    if (next !== surface && messages.length > 0) startNewThread(next, 'A new conversation was started so the previous response keeps its original context.');
    else { setSurface(next); setContextOpen(true); }
    setMobileNavOpen(false);
  }

  function startNewThread(nextSurface: Surface = surface, nextStatus = 'Ready') {
    setSurface(nextSurface);
    setThreadId(newThreadId(nextSurface));
    setMessages([]);
    setDraft('');
    setCovenantEnabled(false);
    setCorrection(null);
    setApiState('idle');
    setStatus(nextStatus);
  }

  async function openThread(id: string) {
    setStatus('Opening conversation…');
    try {
      const data = await api(`/api/v1/threads/${encodeURIComponent(id)}`);
      const restored = (data.messages ?? []) as ChatMessage[];
      const summary = workspace.threads.find((thread) => thread.id === id);
      const lastContext = [...restored].reverse().find((message) => message.context)?.context;
      const restoredSurface = lastContext?.surface ?? surfaceFromContextKind(summary?.contextKind);
      setMessages(restored);
      setThreadId(id);
      setSurface(restoredSurface);
      setSelectedPerson(validClientId(lastContext?.personId) ? lastContext.personId : '');
      setSelectedSystem(validClientId(lastContext?.systemId) ? lastContext.systemId : '');
      setCovenantEnabled(lastContext?.covenantEnabled === true || summary?.covenantEnabled === true);
      setCorrection(null);
      setApiState('ready');
      setStatus('Conversation restored with its original context.');
      setMobileNavOpen(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'That conversation is unavailable.');
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const clean = draft.trim();
    if (!clean || apiState === 'loading') return;
    const context = activeContext;
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: clean, context }, { id: assistantId, role: 'assistant', text: '', context }]);
    setDraft(''); setCorrection(null); setApiState('loading'); setStatus('Sovereign is connecting your question to the context that belongs…');
    try {
      const response = await fetch(`/api/v1/threads/${encodeURIComponent(threadId)}/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-idempotency-key': crypto.randomUUID() },
        body: JSON.stringify({ message: clean, context: { surface, personId: context.personId, systemId: context.systemId } })
      });
      if (response.status === 401) { location.assign(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`); return; }
      if (!response.ok || !response.body) {
        const problem = await response.json().catch(() => ({})) as Json;
        throw new Error(problem.message || problem.error || 'Sovereign is temporarily unavailable.');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let raw = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        const decoded = decodeSovereignResponse(raw);
        setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, text: decoded.text, context, interfaceActions: decoded.metadata } : item));
      }
      const decoded = decodeSovereignResponse(raw);
      setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, text: decoded.text, context, interfaceActions: decoded.metadata } : item));
      setApiState('ready'); setStatus('Complete');
      const threadData = await api('/api/v1/threads');
      setWorkspace((current) => ({ ...current, threads: threadData.threads ?? [] }));
    } catch (error) {
      setApiState('error');
      setMessages((current) => current.map((item) => item.id === assistantId ? { ...item, text: error instanceof Error ? error.message : 'Sovereign could not complete this response.' } : item));
      setStatus('Needs attention');
    }
  }

  async function saveLatest() {
    const last = [...messages].reverse().find((message) => message.role === 'assistant' && message.text.trim());
    if (!last || !window.confirm('Save this understanding to your private Library?')) return;
    const messageSurface = last.context?.surface ?? surface;
    await api('/api/v1/library', { method: 'POST', body: JSON.stringify({
      title: workspace.threads.find((item) => item.id === threadId)?.title ?? `${messageSurface} understanding`,
      summary: last.text, threadId, type: responseType(messageSurface, last.context?.covenantEnabled === true),
      links: { personId: last.context?.personId ?? '', systemId: last.context?.systemId ?? '' }, uncertainty: 'visible'
    }) });
    await refreshWorkspace(); setStatus('Saved to Library.');
  }

  async function saveCorrection(correction: 'yes' | 'partly' | 'not_today') {
    await api(`/api/v1/threads/${encodeURIComponent(threadId)}/corrections`, { method: 'POST', body: JSON.stringify({ correction }) });
    setCorrection(correction);
    setStatus(correction === 'yes' ? 'Marked as fitting.' : correction === 'partly' ? 'Marked as partly fitting.' : 'Marked as not fitting today.');
  }

  async function changeCovenant(enabled: boolean) {
    if (!window.confirm(`${enabled ? 'Enable' : 'Disable'} the optional Covenant lens for this conversation?`)) return;
    await api(`/api/v1/threads/${encodeURIComponent(threadId)}/covenant`, {
      method: 'POST', body: JSON.stringify({ enabled, bibleTranslation: enabled ? 'WEB' : undefined, personId: selectedPerson || undefined, subject: 'this conversation' })
    });
    setCovenantEnabled(enabled);
    setStatus(enabled ? 'Covenant is on for this conversation.' : 'Covenant is off for this conversation.');
  }

  return <div className={`intelligence-workspace ${contextOpen ? 'context-open' : ''} ${mobileNavOpen ? 'nav-open' : ''}`}>
    <aside className="intelligence-sidebar" aria-label="Workspace navigation">
      <a className="intelligence-brand" href="/app"><span>S</span><strong>SOVEREIGN.OS</strong></a>
      <button className="new-conversation" onClick={() => startNewThread()}>＋ New conversation</button>
      <nav><p>EXPLORE</p>{SURFACES.map((item) => <button key={item.name} className={surface === item.name ? 'active' : ''} onClick={() => openSurface(item.name)}><span aria-hidden="true">{surfaceIcon(item.name)}</span><span><strong>{item.name}</strong><small>{item.description}</small></span></button>)}</nav>
      <section className="recent-threads"><p>RECENT</p>{workspace.threads.length === 0 && <span>Your conversations will appear here.</span>}{workspace.threads.slice(0, 12).map((thread) => <button key={thread.id} onClick={() => void openThread(thread.id)}>{thread.title}</button>)}</section>
      <button className="plan-chip" onClick={() => openSurface('You')}><span>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'S+' : 'S'}</span><span><strong>{workspace.billing?.effective?.plan === 'sovereign_plus' ? 'Sovereign+' : 'Free plan'}</strong><small>Baseline and account</small></span></button>
    </aside>

    <main className="intelligence-main">
      <header className="intelligence-topbar"><button className="mobile-nav-trigger" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">S</button><div><strong>Sovereign</strong><span>{surface} · {SURFACES.find((item) => item.name === surface)?.description}</span></div><div className="topbar-actions"><span className={`workspace-status ${apiState}`}>{status}</span><button onClick={() => setContextOpen((open) => !open)}>{contextOpen ? 'Hide context' : 'Show context'}</button></div></header>
      <section className="context-bar" aria-label="Active context"><strong>Considering</strong>{contextItems.map((item) => <span key={item}>{item}</span>)}<button onClick={() => { setSelectedPerson(''); setSelectedSystem(''); }}>Clear people and systems</button></section>
      <section className="intelligence-scroll" aria-live="polite">
        {messages.length === 0
          ? <SurfaceHome surface={surface} workspace={workspace} selectedPerson={selectedPersonRecord} selectedSystem={selectedSystemRecord} onPrompt={setDraft} onSurface={openSurface} />
          : <ResponseThread messages={messages} workspace={workspace} correction={correction} onSave={() => void saveLatest()} onCorrection={(value) => void saveCorrection(value)} />}
      </section>
      <form className="sovereign-composer" onSubmit={submit}>
        {surface === 'Explore' && <AlignmentNeedle alignment={latestAlignment(messages)} compact />}
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={composerPlaceholder(surface)} rows={2} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
        <div><button type="button" className="composer-context-button" onClick={() => setContextOpen(true)}>{contextItems.join(' · ')}</button><span>Enter to send · Shift + Enter for a new line</span><button className="composer-send" disabled={!draft.trim() || apiState === 'loading'} aria-label="Send message">↑</button></div>
      </form>
    </main>

    <aside className="intelligence-context" aria-label={`${surface} controls`}><header><div><p>CONTEXT</p><h2>{surface}</h2></div><button onClick={() => setContextOpen(false)} aria-label="Close context">×</button></header><div className="context-scroll"><ContextPanel surface={surface} workspace={workspace} selectedPerson={selectedPerson} selectedSystem={selectedSystem} covenantEnabled={covenantEnabled} api={api} refresh={refreshWorkspace} setSelectedPerson={(id) => { setSelectedPerson(id); if (id) setSelectedSystem(''); }} setSelectedSystem={(id) => { setSelectedSystem(id); if (id) setSelectedPerson(''); }} setDraft={(value) => { setDraft(value); setContextOpen(false); }} changeCovenant={changeCovenant} /></div></aside>
    {mobileNavOpen && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
    {contextOpen && <button className="context-backdrop-v2" aria-label="Close context" onClick={() => setContextOpen(false)} />}
  </div>;
}
