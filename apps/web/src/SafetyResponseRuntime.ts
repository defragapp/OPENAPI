export type SafetyPresentationMode =
  | 'emergency'
  | 'urgent'
  | 'supportive'
  | 'grounded'
  | 'secure-refusal';

interface SafetyPresentation {
  mode: SafetyPresentationMode;
  label: string;
  ariaLabel: string;
}

const SAFETY_HEADLINES = new Map<string, SafetyPresentation>([
  ['Your immediate safety comes first.', {
    mode: 'emergency',
    label: 'Sovereign · Immediate safety',
    ariaLabel: 'Emergency human support response'
  }],
  ['Pause the interpretation and check safety.', {
    mode: 'urgent',
    label: 'Sovereign · Urgent safety',
    ariaLabel: 'Urgent human support response'
  }],
  ['Bring in a grounded human point of contact.', {
    mode: 'supportive',
    label: 'Sovereign · Human support',
    ariaLabel: 'Grounded human support response'
  }],
  ['Keep meaning and evidence separate.', {
    mode: 'grounded',
    label: 'Sovereign · Grounded response',
    ariaLabel: 'Grounded safety response'
  }],
  ['That internal access is not available.', {
    mode: 'secure-refusal',
    label: 'Sovereign · Protected boundary',
    ariaLabel: 'Protected system boundary response'
  }],
  // Temporary aliases preserve presentation for already-persisted answers from the prior contract.
  ['Immediate human support matters most.', {
    mode: 'urgent',
    label: 'Sovereign · Urgent safety',
    ariaLabel: 'Urgent human support response'
  }],
  ['Separate what is happening from what it may mean.', {
    mode: 'grounded',
    label: 'Sovereign · Grounded response',
    ariaLabel: 'Grounded safety response'
  }],
  ['Private system details stay protected.', {
    mode: 'secure-refusal',
    label: 'Sovereign · Protected boundary',
    ariaLabel: 'Protected system boundary response'
  }]
]);

let observer: MutationObserver | null = null;

export function installSafetyResponseRuntime(): void {
  if (observer || typeof document === 'undefined') return;
  const apply = () => {
    document.querySelectorAll<HTMLElement>('.sovereign-answer').forEach((answer) => {
      const headline = answer.querySelector('h2')?.textContent?.trim() ?? '';
      const presentation = SAFETY_HEADLINES.get(headline);
      if (!presentation) return;

      answer.dataset.sovereignSafety = presentation.mode;
      answer.setAttribute('aria-label', presentation.ariaLabel);
      answer.setAttribute('role', presentation.mode === 'emergency' || presentation.mode === 'urgent' ? 'alert' : 'region');
      answer.setAttribute('aria-live', presentation.mode === 'emergency' ? 'assertive' : 'polite');

      const label = answer.querySelector<HTMLElement>('header > span');
      if (label) label.textContent = presentation.label;
    });
  };
  observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
}
