type SafetyPresentation = 'grounded' | 'supportive_resources' | 'urgent' | 'emergency' | 'secure_refusal';

type SafetyResource = {
  id: string;
  regions: string[];
  label: string;
  description: string;
  actions: Array<{ label: string; href: string }>;
};

type SafetyMetadata = {
  version: 'sovereign-safety-response.v1';
  disposition: 'grounded' | 'supportive_resources' | 'urgent' | 'secure_refusal';
  category: string;
  presentation: SafetyPresentation;
  resource_catalog_version: 'safety-resources.2026-07-31.1';
  resources: SafetyResource[];
};

type SafetyAnswerPayload = {
  version: 'sovereign-answer.v2';
  headline: string;
  direct_answer: string;
  safety: SafetyMetadata;
};

const safetyByAnswer = new Map<string, SafetyMetadata>();
let observer: MutationObserver | null = null;
let fetchPatched = false;

export function registerSovereignSafetyPayload(payload: unknown): void {
  collectSafetyPayload(payload, new Set<object>());
  applySafetyPresentation();
}

export function installSafetyResponseRuntime(): void {
  if (typeof document === 'undefined') return;
  installFetchCapture();
  if (!observer) {
    observer = new MutationObserver(applySafetyPresentation);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  applySafetyPresentation();
}

function installFetchCapture(): void {
  if (fetchPatched || typeof window === 'undefined' || typeof globalThis.fetch !== 'function') return;
  fetchPatched = true;
  const upstream = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (...args: Parameters<typeof fetch>) => {
    const response = await upstream(...args);
    void captureResponse(response);
    return response;
  };
}

async function captureResponse(response: Response): Promise<void> {
  if (!response.headers.get('content-type')?.includes('application/json')) return;
  const payload = await response.clone().json().catch(() => null);
  if (payload) registerSovereignSafetyPayload(payload);
}

function collectSafetyPayload(value: unknown, visited: Set<object>): void {
  if (!value || typeof value !== 'object') return;
  if (visited.has(value)) return;
  visited.add(value);
  if (Array.isArray(value)) {
    value.forEach((item) => collectSafetyPayload(item, visited));
    return;
  }
  const record = value as Record<string, unknown>;
  if (isSafetyAnswerPayload(record)) {
    safetyByAnswer.set(answerFingerprint(record.headline, record.direct_answer), record.safety);
  }
  Object.values(record).forEach((item) => collectSafetyPayload(item, visited));
}

function isSafetyAnswerPayload(value: Record<string, unknown>): value is SafetyAnswerPayload & Record<string, unknown> {
  if (value.version !== 'sovereign-answer.v2' || typeof value.headline !== 'string' || typeof value.direct_answer !== 'string') return false;
  const safety = value.safety;
  if (!safety || typeof safety !== 'object') return false;
  const record = safety as Record<string, unknown>;
  return record.version === 'sovereign-safety-response.v1'
    && ['grounded', 'supportive_resources', 'urgent', 'secure_refusal'].includes(String(record.disposition))
    && ['grounded', 'supportive_resources', 'urgent', 'emergency', 'secure_refusal'].includes(String(record.presentation))
    && record.resource_catalog_version === 'safety-resources.2026-07-31.1'
    && Array.isArray(record.resources)
    && record.resources.every(isSafetyResource);
}

function isSafetyResource(value: unknown): value is SafetyResource {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === 'string'
    && Array.isArray(record.regions)
    && record.regions.every((region) => typeof region === 'string' && /^[A-Z]{2}$/.test(region))
    && typeof record.label === 'string'
    && typeof record.description === 'string'
    && Array.isArray(record.actions)
    && record.actions.every((action) => {
      if (!action || typeof action !== 'object') return false;
      const item = action as Record<string, unknown>;
      return typeof item.label === 'string'
        && typeof item.href === 'string'
        && /^(?:tel:|sms:|https:\/\/)/.test(item.href);
    });
}

function applySafetyPresentation(): void {
  if (typeof document === 'undefined') return;
  document.querySelectorAll<HTMLElement>('.sovereign-answer').forEach((answer) => {
    const headline = answer.querySelector('h2')?.textContent?.trim() ?? '';
    const directAnswer = answer.querySelector('.direct-answer')?.textContent?.trim() ?? '';
    const safety = safetyByAnswer.get(answerFingerprint(headline, directAnswer));
    if (!safety) return;

    const presentation = safety.presentation.replaceAll('_', '-');
    answer.dataset.sovereignSafety = presentation;
    answer.setAttribute('aria-label', presentationAriaLabel(safety.presentation));
    const label = answer.querySelector<HTMLElement>('header > span');
    if (label) label.textContent = presentationLabel(safety.presentation);
    renderResources(answer, safety.resources, safety.resource_catalog_version);
  });
}

function renderResources(answer: HTMLElement, resources: SafetyResource[], catalogVersion: string): void {
  const existing = answer.querySelector<HTMLElement>('[data-sovereign-safety-resources]');
  if (!resources.length) {
    existing?.remove();
    return;
  }
  if (existing || typeof document.createElement !== 'function') return;

  const section = document.createElement('section');
  section.className = 'sovereign-safety-resources';
  section.dataset.sovereignSafetyResources = catalogVersion;
  section.setAttribute('aria-label', 'Reviewed crisis and support resources');
  const heading = document.createElement('h3');
  heading.textContent = 'Choose the service that matches where you are';
  section.append(heading);

  for (const resource of resources) {
    const article = document.createElement('article');
    const title = document.createElement('strong');
    title.textContent = resource.label;
    const description = document.createElement('p');
    description.textContent = resource.description;
    const actions = document.createElement('div');
    for (const action of resource.actions) {
      const link = document.createElement('a');
      link.textContent = action.label;
      link.href = action.href;
      if (action.href.startsWith('https://')) {
        link.target = '_blank';
        link.rel = 'noreferrer';
      }
      actions.append(link);
    }
    article.append(title, description, actions);
    section.append(article);
  }

  const limit = answer.querySelector('.answer-limit');
  if (limit) answer.insertBefore(section, limit);
  else answer.append(section);
}

function answerFingerprint(headline: string, directAnswer: string): string {
  return `${headline.trim()}\n${directAnswer.trim()}`;
}

function presentationLabel(presentation: SafetyPresentation): string {
  return ({
    grounded: 'Sovereign · Grounded response',
    supportive_resources: 'Sovereign · Support resources',
    urgent: 'Sovereign · Urgent support',
    emergency: 'Sovereign · Immediate support',
    secure_refusal: 'Sovereign · Protected boundary'
  } as const)[presentation];
}

function presentationAriaLabel(presentation: SafetyPresentation): string {
  return ({
    grounded: 'Grounded safety response',
    supportive_resources: 'Support resources response',
    urgent: 'Urgent human support response',
    emergency: 'Immediate human support response',
    secure_refusal: 'Protected system boundary response'
  } as const)[presentation];
}
