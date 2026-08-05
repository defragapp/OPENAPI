const STORAGE_KEY = 'sovereign-baseline-birth-timezone';
const BASELINE_ENDPOINT = '/api/v1/baseline/onboarding';

let installed = false;
let selectedBirthTimezone = readStoredTimezone();

export function installBaselineInputRuntime(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  installBaselineFetchCorrection();

  const enhance = () => {
    enhanceDetailsForm();
    enhanceReviewStep();
  };

  enhance();
  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
}

function installBaselineFetchCorrection(): void {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const path = requestPath(input);
    if (method !== 'POST' || path !== BASELINE_ENDPOINT || typeof init?.body !== 'string') {
      return nativeFetch(input, init);
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(init.body) as Record<string, unknown>;
    } catch {
      return nativeFetch(input, init);
    }

    const timezone = selectedBirthTimezone.trim();
    if (!isValidTimeZone(timezone)) {
      throw new Error('Choose a valid birthplace time zone before building your Baseline.');
    }

    payload.birthTimezone = timezone;
    return nativeFetch(input, { ...init, body: JSON.stringify(payload) });
  }) as typeof window.fetch;
}

function enhanceDetailsForm(): void {
  for (const form of document.querySelectorAll<HTMLFormElement>('form.baseline-step-form')) {
    const birthDate = form.querySelector<HTMLInputElement>('input[type="date"]');
    const birthplace = [...form.querySelectorAll<HTMLInputElement>('input')]
      .find((input) => input.placeholder === 'City, region, country');
    if (!birthDate || !birthplace) continue;

    birthDate.name ||= 'birthDate';
    birthplace.name ||= 'birthplace';
    if (form.querySelector('[name="birthTimezone"]')) continue;

    const label = document.createElement('label');
    label.dataset.baselineTimezone = 'true';

    const caption = document.createElement('strong');
    caption.textContent = 'Birthplace time zone';

    const description = document.createElement('span');
    description.textContent = 'Use the civil time zone for your birthplace, not necessarily where you live now.';

    const input = document.createElement('input');
    const listId = `birth-timezone-options-${crypto.randomUUID()}`;
    const helpId = `birth-timezone-help-${crypto.randomUUID()}`;
    input.name = 'birthTimezone';
    input.type = 'search';
    input.required = true;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('list', listId);
    input.setAttribute('aria-describedby', helpId);
    input.setAttribute('placeholder', 'America/Los_Angeles');
    input.value = selectedBirthTimezone;

    const datalist = document.createElement('datalist');
    datalist.id = listId;
    for (const timezone of supportedTimeZones()) {
      const option = document.createElement('option');
      option.value = timezone;
      option.label = timezone.replaceAll('_', ' ').replaceAll('/', ' · ');
      datalist.appendChild(option);
    }

    const help = document.createElement('small');
    help.id = helpId;
    help.textContent = 'Start typing and choose an IANA time zone. The suggested value is your current device time zone; change it when your birthplace used a different one.';

    const validate = () => {
      selectedBirthTimezone = input.value.trim();
      const valid = isValidTimeZone(selectedBirthTimezone);
      input.setCustomValidity(valid ? '' : 'Enter a valid IANA time zone, such as America/Los_Angeles.');
      if (valid) storeTimezone(selectedBirthTimezone);
    };
    input.addEventListener('input', validate);
    input.addEventListener('change', validate);
    input.addEventListener('blur', validate);
    validate();

    label.append(caption, description, input, datalist, help);
    const birthplaceLabel = birthplace.closest('label');
    birthplaceLabel?.insertAdjacentElement('afterend', label);
  }
}

function enhanceReviewStep(): void {
  for (const list of document.querySelectorAll<HTMLElement>('.baseline-review dl')) {
    if (list.querySelector('[data-baseline-timezone-review]')) continue;
    const row = document.createElement('div');
    row.dataset.baselineTimezoneReview = 'true';
    const term = document.createElement('dt');
    term.textContent = 'Birthplace time zone';
    const value = document.createElement('dd');
    value.textContent = selectedBirthTimezone;
    row.append(term, value);
    list.appendChild(row);
  }
}

function requestPath(input: RequestInfo | URL): string {
  const raw = input instanceof Request ? input.url : String(input);
  try {
    return new URL(raw, window.location.origin).pathname;
  } catch {
    return raw.split('?')[0] || '';
  }
}

function readStoredTimezone(): string {
  const fallback = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    : 'UTC';
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY) || '';
    return isValidTimeZone(stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

function storeTimezone(timezone: string): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, timezone);
  } catch {
    // The in-memory value remains authoritative when storage is unavailable.
  }
}

function isValidTimeZone(value: string): boolean {
  if (!value || value.length > 80 || !/^[A-Za-z0-9_+\-/]+$/.test(value)) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

function supportedTimeZones(): string[] {
  const values = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone');
  const timezones = Array.isArray(values) && values.length > 0
    ? values
    : [
        'America/Los_Angeles',
        'America/Denver',
        'America/Chicago',
        'America/New_York',
        'America/Phoenix',
        'America/Anchorage',
        'Pacific/Honolulu',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Asia/Kolkata',
        'Australia/Sydney'
      ];
  return [...new Set(['UTC', ...timezones])].sort((left, right) => left.localeCompare(right));
}
