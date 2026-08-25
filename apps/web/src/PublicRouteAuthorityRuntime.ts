const PUBLIC_ORIGIN = 'https://sovereign.defrag.app';

let installed = false;

export function installPublicRouteAuthorityRuntime(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const EXTERNAL_PUBLIC_PATHS = ['/pricing', '/how-it-works', '/faq'];

  const reconcile = () => {
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href="/pricing"], a[href="/how-it-works"], a[href="/faq"]')) {
      const path = new URL(anchor.href, location.origin).pathname;
      if (EXTERNAL_PUBLIC_PATHS.includes(path)) {
        anchor.href = `${PUBLIC_ORIGIN}${path}`;
      }
    }
  };

  reconcile();
  new MutationObserver(reconcile).observe(document.documentElement, { childList: true, subtree: true });
}
