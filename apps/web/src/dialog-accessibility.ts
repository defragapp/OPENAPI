let installed = false;

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

export function installDialogAccessibility(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  let activeDialog: HTMLElement | null = null;
  let returnTarget: HTMLElement | null = null;

  const visibleDialogs = () => Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'))
    .filter((dialog) => dialog.isConnected && dialog.getClientRects().length > 0);

  const sync = () => {
    const dialogs = visibleDialogs();
    const next = dialogs.at(-1) ?? null;
    if (next === activeDialog) return;

    if (!next && activeDialog) {
      const target = returnTarget;
      activeDialog = null;
      returnTarget = null;
      if (target?.isConnected) window.setTimeout(() => target?.focus(), 0);
      return;
    }

    if (next) {
      returnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      activeDialog = next;
      window.setTimeout(() => {
        const dialog = activeDialog;
        if (!dialog?.isConnected) return;
        const preferred = dialog.querySelector<HTMLElement>('[autofocus]');
        const first = preferred ?? dialog.querySelector<HTMLElement>(focusableSelector);
        if (!dialog.hasAttribute('tabindex')) dialog.tabIndex = -1;
        (first ?? dialog).focus();
      }, 0);
    }
  };

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !activeDialog?.isConnected) return;
    const focusable = Array.from(activeDialog.querySelectorAll<HTMLElement>(focusableSelector))
      .filter((element) => element.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      activeDialog.focus();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  new MutationObserver(sync).observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  window.setTimeout(sync, 0);
}
