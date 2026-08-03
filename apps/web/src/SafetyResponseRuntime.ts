type SafetyPresentation = 'urgent' | 'grounded' | 'secure-refusal';

type SafetyAnswerContract = {
  version?: unknown;
  headline?: unknown;
  direct_answer?: unknown;
  safety_mode?: unknown;
  confidence?: unknown;
  basis_refs?: unknown;
  actions?: unknown;
};

const pendingPresentations = new Map<string, SafetyPresentation>();
let observer: MutationObserver | null = null;
let fetchInstalled = false;

function answerKey(answer: SafetyAnswerContract): string | null {
  if (answer.version !== 'sovereign-answer.v2') return null;
  if (typeof answer.headline !== 'string' || typeof answer.direct_answer !== 'string') return null;
  return `${answer.headline.trim()}\u0000${answer.direct_answer.trim().slice(0, 240)}`;
}

function presentationFromAnswer(answer: SafetyAnswerContract): SafetyPresentation | null {
  if (answer.safety_mode === 'escalate') return 'urgent';
  if (answer.safety_mode !== 'grounded') return null;

  const isDeterministicProtectedBoundary = answer.confidence === 'confirmed'
    && Array.isArray(answer.basis_refs)
    && answer.basis_refs.length === 0
    && Array.isArray(answer.actions)
    && answer.actions.length === 0;

  return isDeterministicProtectedBoundary ? 'secure-refusal' : 'grounded';
}

export function registerSafetyResponsePayload(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(registerSafetyResponsePayload);
    return;
  }
  if (!value || typeof value !== 'object') return;

  const record = value as Record<string, unknown>;
  const answer = record.version === 'sovereign-answer.v2'
    ? record as SafetyAnswerContract
    : record.answer && typeof record.answer === 'object'
      ? record.answer as SafetyAnswerContract
      : null;

  if (answer) {
    const key = answerKey(answer);
    const presentation = presentationFromAnswer(answer);
    if (key && presentation) pendingPresentations.set(key, presentation);
  }

  for (const child of Object.values(record)) {
    if (child !== answer) registerSafetyResponsePayload(child);
  }
}

export function applySafetyResponsePresentation(): void {
  if (typeof document === 'undefined') return;

  document.querySelectorAll<HTMLElement>('.sovereign-answer').forEach((answer) => {
    if (answer.dataset.sovereignSafety) return;
    const headline = answer.querySelector('h2')?.textContent?.trim() ?? '';
    const directAnswer = answer.querySelector('.direct-answer')?.textContent?.trim() ?? '';
    const mode = pendingPresentations.get(`${headline}\u0000${directAnswer.slice(0, 240)}`);
    if (!mode) return;

    answer.dataset.sovereignSafety = mode;
    answer.dataset.sovereignSafetySource = 'answer-contract';
    answer.setAttribute('aria-label', mode === 'urgent'
      ? 'Immediate human support response'
      : mode === 'grounded'
        ? 'Grounded safety response'
        : 'Protected system boundary response');

    const label = answer.querySelector<HTMLElement>('header > span');
    if (label) {
      label.textContent = mode === 'urgent'
        ? 'Sovereign · Immediate support'
        : mode === 'grounded'
          ? 'Sovereign · Grounded response'
          : 'Sovereign · Protected boundary';
    }
  });
}

function installFetchSafetyRegistration(): void {
  if (fetchInstalled || typeof globalThis.fetch !== 'function') return;
  fetchInstalled = true;
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.headers.get('content-type')?.includes('application/json')) {
      void response.clone().json().then((payload) => {
        registerSafetyResponsePayload(payload);
        applySafetyResponsePresentation();
      }).catch(() => undefined);
    }
    return response;
  };
}

export function installSafetyResponseRuntime(): void {
  if (typeof document === 'undefined') return;
  installFetchSafetyRegistration();
  if (observer) return;
  observer = new MutationObserver(applySafetyResponsePresentation);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  applySafetyResponsePresentation();
}
