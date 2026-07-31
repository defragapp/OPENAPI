const SAFETY_HEADLINES = new Map<string, 'urgent' | 'grounded' | 'secure-refusal'>([
  ['Immediate human support matters most.', 'urgent'],
  ['Separate what is happening from what it may mean.', 'grounded'],
  ['Private system details stay protected.', 'secure-refusal']
]);

let observer: MutationObserver | null = null;

export function installSafetyResponseRuntime(): void {
  if (observer || typeof document === 'undefined') return;
  const apply = () => {
    document.querySelectorAll<HTMLElement>('.sovereign-answer').forEach((answer) => {
      const headline = answer.querySelector('h2')?.textContent?.trim() ?? '';
      const mode = SAFETY_HEADLINES.get(headline);
      if (!mode) return;
      answer.dataset.sovereignSafety = mode;
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
  };
  observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
}
