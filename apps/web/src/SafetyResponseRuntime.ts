type SafetyPresentation = 'grounded' | 'supportive_resources' | 'urgent' | 'emergency' | 'secure_refusal';

type SafetyAnswerContract = {
  version?: unknown;
  headline?: unknown;
  direct_answer?: unknown;
};

type SafetyResourceAction = {
  kind?: unknown;
  label?: unknown;
  value?: unknown;
};

type SafetyResource = {
  id?: unknown;
  name?: unknown;
  actions?: unknown;
  officialSource?: unknown;
  reviewedOn?: unknown;
};

type SafetyResourceCatalog = {
  version?: unknown;
  jurisdiction?: unknown;
  selectionSource?: unknown;
  selectionNotice?: unknown;
  disregardAllowed?: unknown;
  resources?: unknown;
};

type SafetyResponseContract = {
  version?: unknown;
  presentation?: unknown;
  category?: unknown;
  resourceCatalog?: unknown;
};

type RegisteredSafetyResponse = {
  presentation: SafetyPresentation;
  category: string;
  resourceCatalog: SafetyResourceCatalog | null;
};

const supportedPresentations = new Set<SafetyPresentation>([
  'grounded',
  'supportive_resources',
  'urgent',
  'emergency',
  'secure_refusal'
]);
const pendingResponses = new Map<string, RegisteredSafetyResponse>();
let observer: MutationObserver | null = null;
let fetchInstalled = false;

function answerKey(answer: SafetyAnswerContract): string | null {
  if (answer.version !== 'sovereign-answer.v2') return null;
  if (typeof answer.headline !== 'string' || typeof answer.direct_answer !== 'string') return null;
  return `${answer.headline.trim()}\u0000${answer.direct_answer.trim().slice(0, 240)}`;
}

function validateSafetyResponse(value: unknown): RegisteredSafetyResponse | null {
  if (!value || typeof value !== 'object') return null;
  const safety = value as SafetyResponseContract;
  if (safety.version !== 'sovereign-safety-response.v1') return null;
  if (typeof safety.presentation !== 'string' || !supportedPresentations.has(safety.presentation as SafetyPresentation)) return null;
  return {
    presentation: safety.presentation as SafetyPresentation,
    category: typeof safety.category === 'string' ? safety.category : 'unknown',
    resourceCatalog: safety.resourceCatalog && typeof safety.resourceCatalog === 'object'
      ? safety.resourceCatalog as SafetyResourceCatalog
      : null
  };
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
  const safety = validateSafetyResponse(record.safety);

  if (answer && safety) {
    const key = answerKey(answer);
    if (key) pendingResponses.set(key, safety);
  }

  for (const child of Object.values(record)) {
    if (child !== answer && child !== record.safety) registerSafetyResponsePayload(child);
  }
}

export function applySafetyResponsePresentation(): void {
  if (typeof document === 'undefined') return;

  document.querySelectorAll<HTMLElement>('.sovereign-answer').forEach((answer) => {
    if (answer.dataset.sovereignSafety) return;
    const headline = answer.querySelector('h2')?.textContent?.trim() ?? '';
    const directAnswer = answer.querySelector('.direct-answer')?.textContent?.trim() ?? '';
    const safety = pendingResponses.get(`${headline}\u0000${directAnswer.slice(0, 240)}`);
    if (!safety) return;

    answer.dataset.sovereignSafety = safety.presentation;
    answer.dataset.sovereignSafetyCategory = safety.category;
    answer.dataset.sovereignSafetySource = 'safety-response-contract';
    answer.setAttribute('aria-label', ariaLabel(safety.presentation));

    const label = answer.querySelector<HTMLElement>('header > span');
    if (label) label.textContent = presentationLabel(safety.presentation);
    renderSafetyResources(answer, safety.resourceCatalog);
  });
}

function presentationLabel(presentation: SafetyPresentation): string {
  switch (presentation) {
    case 'emergency': return 'Sovereign · Emergency help';
    case 'urgent': return 'Sovereign · Urgent support';
    case 'supportive_resources': return 'Sovereign · Human support';
    case 'grounded': return 'Sovereign · Grounded response';
    case 'secure_refusal': return 'Sovereign · Protected boundary';
  }
}

function ariaLabel(presentation: SafetyPresentation): string {
  switch (presentation) {
    case 'emergency': return 'Emergency human support response';
    case 'urgent': return 'Urgent human support response';
    case 'supportive_resources': return 'Support resources response';
    case 'grounded': return 'Grounded safety response';
    case 'secure_refusal': return 'Protected system boundary response';
  }
}

function renderSafetyResources(answer: HTMLElement, catalog: SafetyResourceCatalog | null): void {
  if (!catalog || answer.querySelector('[data-sovereign-safety-resources]')) return;
  if (typeof document.createElement !== 'function' || typeof answer.append !== 'function') return;

  const selectionNotice = typeof catalog.selectionNotice === 'string' ? catalog.selectionNotice : '';
  const resources = Array.isArray(catalog.resources) ? catalog.resources : [];
  if (!selectionNotice && resources.length === 0) return;

  const panel = document.createElement('section');
  panel.className = 'sovereign-safety-resources';
  panel.dataset.sovereignSafetyResources = 'server-curated';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Human support resources');

  const heading = document.createElement('h3');
  heading.textContent = resources.length > 0 ? 'Human support' : 'Local support';
  panel.append(heading);

  if (selectionNotice) {
    const notice = document.createElement('p');
    notice.className = 'sovereign-safety-resources__notice';
    notice.textContent = selectionNotice;
    panel.append(notice);
  }

  for (const candidate of resources) {
    if (!candidate || typeof candidate !== 'object') continue;
    const resource = candidate as SafetyResource;
    const name = typeof resource.name === 'string' ? resource.name : '';
    const actions = Array.isArray(resource.actions) ? resource.actions : [];
    if (!name || actions.length === 0) continue;

    const group = document.createElement('div');
    group.className = 'sovereign-safety-resource';
    const resourceHeading = document.createElement('h4');
    resourceHeading.textContent = name;
    group.append(resourceHeading);

    const actionList = document.createElement('div');
    actionList.className = 'sovereign-safety-resource__actions';
    for (const candidateAction of actions) {
      if (!candidateAction || typeof candidateAction !== 'object') continue;
      const action = candidateAction as SafetyResourceAction;
      if (typeof action.kind !== 'string' || typeof action.label !== 'string' || typeof action.value !== 'string') continue;
      const href = resourceHref(action.kind, action.value);
      if (!href) continue;
      const link = document.createElement('a');
      link.href = href;
      link.textContent = action.label;
      if (action.kind === 'link') {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      actionList.append(link);
    }
    group.append(actionList);
    panel.append(group);
  }

  answer.append(panel);
}

function resourceHref(kind: string, value: string): string | null {
  if (kind === 'call' || kind === 'text') {
    const destination = value.replace(/[^+\d]/g, '');
    if (!destination) return null;
    return `${kind === 'call' ? 'tel' : 'sms'}:${destination}`;
  }
  if (kind === 'link' && /^https:\/\//i.test(value)) return value;
  return null;
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
