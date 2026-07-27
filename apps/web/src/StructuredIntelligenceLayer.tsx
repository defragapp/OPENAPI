import { useEffect, useMemo, useState } from 'react';

const STRUCTURED_RESPONSE_EVENT = 'sovereign:structured-response';
let runtimeInstalled = false;

type Basis = {
  user_confirmed: boolean;
  human_design: string[];
  gene_keys: string[];
  astrology: string[];
  relationship: string[];
  live: string[];
  numerology: string[];
};

type SovereignPlan = {
  response_phase: 'question' | 'integration';
  recognition: string;
  inward_question: string;
  candidate_hidden_expectation: string;
  protected_need: string;
  clearer_form: string;
  practical_action: string;
  confidence: 'confirmed' | 'supported' | 'exploratory';
  safety_mode: 'standard' | 'grounded' | 'escalate';
  basis: Basis;
};

type FitCorrection = { value: 'yes' | 'partly' | 'not_today'; note?: string; createdAt: string };
type StructuredDetail = {
  threadId: string;
  messageId: string;
  surface: string;
  mode: 'defrag' | 'alignment';
  covenantEnabled: boolean;
  plan: SovereignPlan;
  correction?: FitCorrection;
};

type Json = Record<string, any>;

export function installStructuredIntelligenceRuntime(): void {
  if (runtimeInstalled || typeof window === 'undefined') return;
  runtimeInstalled = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await nativeFetch(input, init);
    const rawUrl = input instanceof Request ? input.url : String(input);
    const url = new URL(rawUrl, window.location.origin);
    const messageMatch = url.pathname.match(/^\/api\/v1\/threads\/([^/]+)\/messages$/);
    const correctionMatch = url.pathname.match(/^\/api\/v1\/threads\/([^/]+)\/corrections$/);
    const threadMatch = url.pathname.match(/^\/api\/v1\/threads\/([^/]+)$/);
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();

    if (response.ok && messageMatch && method === 'POST') {
      const threadId = decodeURIComponent(messageMatch[1]!);
      window.setTimeout(() => void loadStructuredDetail(nativeFetch, threadId), 0);
    } else if (response.ok && correctionMatch && method === 'POST') {
      const threadId = decodeURIComponent(correctionMatch[1]!);
      window.setTimeout(() => void loadStructuredDetail(nativeFetch, threadId), 0);
    } else if (response.ok && threadMatch && response.headers.get('content-type')?.includes('application/json')) {
      const threadId = decodeURIComponent(threadMatch[1]!);
      void response.clone().json().then((payload) => loadCovenantAndEmit(nativeFetch, threadId, payload)).catch(() => undefined);
    }
    return response;
  }) as typeof window.fetch;
}

async function loadStructuredDetail(fetcher: typeof window.fetch, threadId: string): Promise<void> {
  try {
    const response = await fetcher(`/api/v1/threads/${encodeURIComponent(threadId)}`, { headers: { accept: 'application/json' } });
    if (!response.ok) return;
    await loadCovenantAndEmit(fetcher, threadId, await response.json());
  } catch {
    // The plain-language answer remains available when structured projection cannot load.
  }
}

async function loadCovenantAndEmit(fetcher: typeof window.fetch, threadId: string, payload: Json): Promise<void> {
  let covenantEnabled = false;
  try {
    const threadsResponse = await fetcher('/api/v1/threads', { headers: { accept: 'application/json' } });
    if (threadsResponse.ok) {
      const threads = await threadsResponse.json() as Json;
      covenantEnabled = (threads.threads ?? []).find((thread: Json) => thread.id === threadId)?.covenantEnabled === true;
    }
  } catch {
    covenantEnabled = false;
  }
  emitLatest(threadId, payload, covenantEnabled);
}

function emitLatest(threadId: string, payload: Json, covenantEnabled: boolean): void {
  const messages = Array.isArray(payload.messages) ? payload.messages as Json[] : [];
  const latest = [...messages].reverse().find((message) => message.role === 'assistant' && validPlan(message.plan));
  if (!latest) return;
  const surface = validSurface(latest.context?.surface) ? latest.context.surface : 'Today';
  const mode = latest.context?.mode === 'alignment' || surface === 'Explore' ? 'alignment' : 'defrag';
  const correction = validCorrection(latest.correction) ? latest.correction : undefined;
  const detail: StructuredDetail = {
    threadId,
    messageId: String(latest.id ?? `${threadId}-latest`),
    surface,
    mode,
    covenantEnabled,
    plan: latest.plan,
    ...(correction ? { correction } : {})
  };
  window.dispatchEvent(new CustomEvent<StructuredDetail>(STRUCTURED_RESPONSE_EVENT, { detail }));
}

export function StructuredIntelligenceLayer() {
  const [detail, setDetail] = useState<StructuredDetail | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const receive = (event: Event) => {
      setDetail((event as CustomEvent<StructuredDetail>).detail);
      setOpen(true);
    };
    window.addEventListener(STRUCTURED_RESPONSE_EVENT, receive);
    return () => window.removeEventListener(STRUCTURED_RESPONSE_EVENT, receive);
  }, []);

  const basis = useMemo(() => detail ? basisItems(detail.plan.basis) : [], [detail]);
  if (!detail) return null;
  const plan = detail.plan;
  const title = detail.covenantEnabled
    ? `Covenant + ${detail.mode === 'alignment' ? 'Alignment' : 'Defrag'}`
    : detail.mode === 'alignment'
      ? 'Alignment'
      : 'Defrag';

  return (
    <>
      <button className={`structured-intelligence-trigger ${open ? 'is-open' : ''}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="structured-intelligence-panel">
        <span>S</span><strong>{detail.correction ? `Fit: ${fitLabel(detail.correction.value)}` : 'Structured view'}</strong>
      </button>
      <aside id="structured-intelligence-panel" className={`structured-intelligence-panel ${open ? 'is-open' : ''}`} aria-label="Validated Sovereign response structure" aria-hidden={!open}>
        <header>
          <div><p>{title.toUpperCase()} · {detail.surface.toUpperCase()}</p><h2>{plan.response_phase === 'integration' ? 'A clearer view' : 'One question before interpretation'}</h2></div>
          <button onClick={() => setOpen(false)} aria-label="Close structured view">×</button>
        </header>
        <div className="structured-plan-badges">
          <span>{confidenceLabel(plan.confidence)}</span><span>{safetyLabel(plan.safety_mode)}</span><span>{plan.response_phase === 'integration' ? 'Integrated response' : 'Clarifying phase'}</span>{detail.correction && <span>Your fit: {fitLabel(detail.correction.value)}</span>}
        </div>

        <div className="structured-plan-scroll">
          {detail.correction && <section className="structured-fit"><p>YOUR SAVED FIT</p><h3>{fitTitle(detail.correction.value)}</h3><span>Saved {new Date(detail.correction.createdAt).toLocaleString()}.{detail.correction.note ? ` ${detail.correction.note}` : ' You can choose a different fit below the conversation whenever your experience changes.'}</span></section>}
          <PlanSection label="WHAT SOVEREIGN NOTICED" value={plan.recognition} />
          {plan.response_phase === 'question' ? <PlanSection label="LOOK INWARD" value={plan.inward_question} featured /> : <><PlanSection label="WHAT THIS MAY BE SHOWING" value={plan.candidate_hidden_expectation || plan.recognition} /><PlanSection label="WHAT MAY BE PROTECTED" value={plan.protected_need} /><PlanSection label="A CLEARER FORM" value={plan.clearer_form} featured /><PlanSection label="PRACTICAL NEXT ACTION" value={plan.practical_action} /></>}

          <section className="structured-basis"><header><p>BASIS</p><h3>What this response was allowed to use</h3></header>{basis.length ? <div>{basis.map((item) => <span key={item}>{item}</span>)}</div> : <p>No framework basis was displayed. The response remains exploratory.</p>}</section>
          <section className="structured-limits"><p>LIMITS</p><h3>{limitTitle(plan)}</h3><span>{limitCopy(plan)}</span></section>
          {detail.covenantEnabled && <section className="structured-covenant"><p>COVENANT IS ACTIVE</p><h3>Scripture remains a separate lens.</h3><span>Christian teaching and retrieved biblical references may support reflection, but they do not establish God’s exact intent or override consent, safety, responsibility, or the user’s judgment.</span></section>}
        </div>
      </aside>
    </>
  );
}

function PlanSection({ label, value, featured = false }: { label: string; value: string; featured?: boolean }) {
  if (!value.trim()) return null;
  return <section className={`structured-plan-section ${featured ? 'featured' : ''}`}><p>{label}</p><h3>{value}</h3></section>;
}

function validPlan(value: unknown): value is SovereignPlan {
  if (!value || typeof value !== 'object') return false;
  const plan = value as Record<string, unknown>;
  const basis = plan.basis as Record<string, unknown> | undefined;
  return ['question', 'integration'].includes(String(plan.response_phase)) && ['confirmed', 'supported', 'exploratory'].includes(String(plan.confidence)) && ['standard', 'grounded', 'escalate'].includes(String(plan.safety_mode)) && typeof plan.recognition === 'string' && typeof plan.inward_question === 'string' && typeof plan.candidate_hidden_expectation === 'string' && typeof plan.protected_need === 'string' && typeof plan.clearer_form === 'string' && typeof plan.practical_action === 'string' && Boolean(basis) && typeof basis?.user_confirmed === 'boolean' && ['human_design', 'gene_keys', 'astrology', 'relationship', 'live', 'numerology'].every((key) => Array.isArray(basis?.[key]));
}

function validCorrection(value: unknown): value is FitCorrection {
  if (!value || typeof value !== 'object') return false;
  const correction = value as Record<string, unknown>;
  return ['yes', 'partly', 'not_today'].includes(String(correction.value)) && typeof correction.createdAt === 'string';
}

function validSurface(value: unknown): value is string { return typeof value === 'string' && ['Today', 'Explore', 'People', 'Systems', 'Library', 'You'].includes(value); }
function basisItems(basis: Basis): string[] {
  const output: string[] = [];
  if (basis.user_confirmed) output.push('User-confirmed experience');
  for (const [label, values] of [['Human Design', basis.human_design], ['Gene Keys', basis.gene_keys], ['Astrology', basis.astrology], ['Relationship', basis.relationship], ['Current conditions', basis.live], ['Numerology', basis.numerology]] as const) for (const value of values.slice(0, 3)) output.push(`${label}: ${value}`);
  return output.slice(0, 14);
}
function confidenceLabel(value: SovereignPlan['confidence']): string { return value === 'confirmed' ? 'Confirmed by the user' : value === 'supported' ? 'Supported by selected context' : 'Exploratory'; }
function safetyLabel(value: SovereignPlan['safety_mode']): string { return value === 'escalate' ? 'Safety support needed' : value === 'grounded' ? 'Grounded response' : 'Standard reflection'; }
function fitLabel(value: FitCorrection['value']): string { return value === 'yes' ? 'Yes' : value === 'partly' ? 'Partly' : 'Not today'; }
function fitTitle(value: FitCorrection['value']): string { return value === 'yes' ? 'This fits your experience.' : value === 'partly' ? 'Part of this fits; part needs correction.' : 'This does not fit your experience today.'; }
function limitTitle(plan: SovereignPlan): string { if (plan.safety_mode === 'escalate') return 'This response should not carry the situation alone.'; if (plan.safety_mode === 'grounded') return 'Only grounded, immediately supportable claims are shown.'; if (plan.confidence === 'confirmed') return 'Confirmed experience is not the same as certainty about cause.'; if (plan.confidence === 'supported') return 'The available context supports this view, but does not prove it.'; return 'Treat this as a possibility to test against real experience.'; }
function limitCopy(plan: SovereignPlan): string { return plan.safety_mode === 'escalate' ? 'Use qualified or emergency support appropriate to the situation. Sovereign does not diagnose, investigate, or replace professional help.' : 'Sovereign does not know another person’s hidden motive, exact feeling, diagnosis, or future behavior. The user can confirm, correct, or reject the interpretation.'; }
