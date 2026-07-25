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

      const select = document.createElement('select');
      select.name = 'birthTimezone';
      select.required = true;
      select.autocomplete = 'off';
      select.setAttribute('aria-describedby', 'birth-timezone-help');

      const current = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const supported = supportedTimeZones();
      for (const timezone of supported) {
        const option = document.createElement('option');
        option.value = timezone;
        option.textContent = timezone.replaceAll('_', ' ');
        option.selected = timezone === current;
        select.appendChild(option);
      }
      if (!supported.includes(current)) {
        const option = document.createElement('option');
        option.value = current;
        option.textContent = current.replaceAll('_', ' ');
        option.selected = true;
        select.prepend(option);
      }

      const help = document.createElement('small');
      help.id = 'birth-timezone-help';
      help.textContent = 'Choose the timezone used at your birthplace. Your birthplace stays inside Sovereign.OS and is not sent to a public geocoder.';

      label.append(caption, select, help);
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
