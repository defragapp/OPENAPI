let installed = false;

export function installReleaseRuntime(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  installPublicNavigation();
  installDocumentMetadata();
}

function installPublicNavigation(): void {
  const render = () => {
    document.querySelectorAll<HTMLElement>('.landing-nav').forEach((header) => {
      if (header.querySelector('[data-public-menu-trigger]')) return;
      const nav = header.querySelector<HTMLElement>('nav');
      if (!nav) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'public-menu-trigger';
      button.dataset.publicMenuTrigger = 'true';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open public navigation');
      button.textContent = 'Menu';
      button.addEventListener('click', () => {
        const open = header.classList.toggle('public-menu-open');
        button.setAttribute('aria-expanded', String(open));
        button.textContent = open ? 'Close' : 'Menu';
      });
      nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
        header.classList.remove('public-menu-open');
        button.setAttribute('aria-expanded', 'false');
        button.textContent = 'Menu';
      }));
      header.appendChild(button);
    });
  };
  new MutationObserver(render).observe(document.documentElement, { childList: true, subtree: true });
  render();
}

function installDocumentMetadata(): void {
  const publicOrigin = 'https://sovereign.defrag.app';
  const publicPath = ['/', '/privacy', '/terms', '/pricing.html', '/faq.html', '/how-it-works.html'].includes(location.pathname);
  if (!publicPath) return;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.head.appendChild(document.createElement('link'));
  canonical.rel = 'canonical';
  canonical.href = `${publicOrigin}${location.pathname}`;
}
