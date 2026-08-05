const PUBLIC_ORIGIN = 'https://sovereign.defrag.app';

let installed = false;

export function installPublicRouteAuthorityRuntime(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const reconcile = () => {
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href="/pricing"]')) {
      anchor.href = `${PUBLIC_ORIGIN}/pricing`;
    }
  };

  reconcile();
  new MutationObserver(reconcile).observe(document.documentElement, { childList: true, subtree: true });
}
