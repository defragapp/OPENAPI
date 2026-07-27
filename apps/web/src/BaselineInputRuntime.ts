let installed = false;

export function installBaselineInputRuntime(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const enhance = () => {
    document.querySelectorAll<HTMLFormElement>('form').forEach((form) => {
      if (!form.querySelector('[name="birthDate"]') || !form.querySelector('[name="birthplace"]')) return;
      if (form.querySelector('[name="birthTimezone"]')) return;

      const label = document.createElement('label');
      label.className = 'field';
      label.dataset.baselineTimezone = 'true';

      const caption = document.createElement('span');
      caption.textContent = 'Birthplace timezone';

      const input = document.createElement('input');
      const listId = `birth-timezone-options-${crypto.randomUUID()}`;
      input.name = 'birthTimezone';
      input.type = 'search';
      input.required = true;
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('list', listId);
      input.setAttribute('aria-describedby', 'birth-timezone-help');
      input.setAttribute('placeholder', 'Search a city or timezone, such as Los Angeles');

      const current = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      input.value = current;

      const datalist = document.createElement('datalist');
      datalist.id = listId;
      for (const timezone of supportedTimeZones()) {
        const option = document.createElement('option');
        option.value = timezone;
        option.label = timezone.replaceAll('_', ' ').replaceAll('/', ' · ');
        datalist.appendChild(option);
      }

      const help = document.createElement('small');
      help.id = 'birth-timezone-help';
      help.textContent = 'Start typing a city or timezone, then choose the closest match. This keeps the calculation accurate without sending your birthplace to a public geocoder.';

      label.append(caption, input, datalist, help);
      const submit = form.querySelector('button[type="submit"], button.primary-button');
      form.insertBefore(label, submit ?? null);
    });
  };

  enhance();
  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
}

function supportedTimeZones(): string[] {
  const values = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone');
  if (Array.isArray(values) && values.length > 0) return values;
  return [
    'UTC',
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
}
