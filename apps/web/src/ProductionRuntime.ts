const SUPPORT_URL = 'https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02';
const PUBLIC_SHARE_URL = 'https://sovereign.defrag.app';

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
};

declare global {
  interface Window {
    __TURNSTILE_SITE_KEY__?: string;
    turnstile?: TurnstileApi;
  }
}

export function installProductionRuntime(): void {
  installTurnstile();
  installFetchObserver();
  installUtilityLinks();
}

function installTurnstile(): void {
  const siteKey = String(import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
  if (!siteKey) {
    if (import.meta.env.PROD) queueMicrotask(() => showNotice('Sign-in protection is not configured.'));
    return;
  }

  window.__TURNSTILE_SITE_KEY__ = siteKey;

  const renderWidgets = () => {
    if (!window.turnstile) return;
    document.querySelectorAll<HTMLElement>('.turnstile-slot').forEach((container) => {
      if (container.dataset.turnstileRendered === 'true') return;
      container.dataset.turnstileRendered = 'true';
      container.textContent = '';
      try {
        window.turnstile?.render(container, {
          sitekey: siteKey,
          action: container.dataset.action || 'login',
          theme: 'auto',
          'response-field': true,
          'response-field-name': 'cf-turnstile-response',
          'error-callback': () => {
            container.dataset.turnstileRendered = 'false';
            container.textContent = 'Verification could not load. Refresh and try again.';
          }
        });
      } catch {
        container.dataset.turnstileRendered = 'false';
        container.textContent = 'Verification could not load. Refresh and try again.';
      }
    });
  };

  const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
  if (existing) {
    existing.addEventListener('load', renderWidgets, { once: true });
  } else {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.addEventListener('load', renderWidgets, { once: true });
    document.head.appendChild(script);
  }

  new MutationObserver(renderWidgets).observe(document.documentElement, { childList: true, subtree: true });
  renderWidgets();
}

function installFetchObserver(): void {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await nativeFetch(input, init);
    const requestUrl = resolveRequestUrl(input);

    if (requestUrl.origin === location.origin && requestUrl.pathname.startsWith('/api/')) {
      if (response.status === 401 && isWorkspaceLocation()) {
        setTimeout(() => location.assign(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`), 50);
      }

      if (response.ok && requestUrl.pathname.startsWith('/api/v1/auth/logout')) {
        setTimeout(() => location.assign('/login'), 50);
      }
    }

    return response;
  }) as typeof window.fetch;
}

function installUtilityLinks(): void {
  const render = () => {
    const footerNav = document.querySelector<HTMLElement>('.launch-footer nav');
    if (footerNav && !footerNav.querySelector('[data-sovereign-support]')) {
      footerNav.appendChild(createSupportLink('Support Sovereign.OS'));
    }

    document.querySelectorAll<HTMLElement>('.surface-card').forEach((card) => {
      const eyebrow = card.querySelector('.eyebrow')?.textContent?.trim();
      if (eyebrow === 'PLAN & USAGE') installWorkspaceSupportLink(card);
      if (eyebrow === 'CONTROL') replaceExportWithShare(card);
    });
  };

  new MutationObserver(render).observe(document.documentElement, { childList: true, subtree: true });
  render();
}

function installWorkspaceSupportLink(card: HTMLElement): void {
  const actions = card.querySelector<HTMLElement>('.action-row');
  if (!actions || actions.querySelector('[data-sovereign-support]')) return;
  const link = createSupportLink('Support development');
  link.className = 'secondary-button';
  actions.appendChild(link);
}

function replaceExportWithShare(card: HTMLElement): void {
  if (card.querySelector('[data-sovereign-share]')) return;
  const rows = [...card.querySelectorAll<HTMLElement>('.settings-list > div')];
  const exportRow = rows.find((row) => row.querySelector('strong')?.textContent?.trim() === 'Export');
  if (!exportRow) return;

  const row = document.createElement('div');
  row.dataset.sovereignShare = 'true';

  const description = document.createElement('span');
  const title = document.createElement('strong');
  const detail = document.createElement('small');
  title.textContent = 'Share';
  detail.textContent = 'Share the public Sovereign.OS link. No private workspace data is included.';
  description.append(title, detail);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Share';
  button.addEventListener('click', () => void sharePublicPlatform());

  row.append(description, button);
  exportRow.replaceWith(row);
}

async function sharePublicPlatform(): Promise<void> {
  const data = {
    title: 'Sovereign.OS',
    text: 'See what is really happening without losing yourself inside it.',
    url: PUBLIC_SHARE_URL
  };

  try {
    if (navigator.share) {
      await navigator.share(data);
      showNotice('Sovereign.OS shared. No private workspace data was included.');
      return;
    }
    await navigator.clipboard.writeText(PUBLIC_SHARE_URL);
    showNotice('Public Sovereign.OS link copied. No private workspace data was included.');
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    showNotice('Sharing is unavailable in this browser.', PUBLIC_SHARE_URL, 'Open public site');
  }
}

function createSupportLink(label: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = SUPPORT_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.dataset.sovereignSupport = 'true';
  link.textContent = label;
  link.title = 'Voluntary support does not grant subscription access.';
  return link;
}

function showNotice(message: string, href?: string, linkLabel?: string): void {
  let notice = document.querySelector<HTMLElement>('[data-production-notice]');
  if (!notice) {
    notice = document.createElement('aside');
    notice.dataset.productionNotice = 'true';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    Object.assign(notice.style, {
      position: 'fixed',
      right: '1rem',
      bottom: '1rem',
      zIndex: '9999',
      maxWidth: '22rem',
      padding: '0.9rem 1rem',
      border: '1px solid rgba(255,255,255,.2)',
      borderRadius: '0.8rem',
      background: 'rgba(10,10,12,.96)',
      color: '#fff',
      boxShadow: '0 1rem 3rem rgba(0,0,0,.35)'
    });
    document.body.appendChild(notice);
  }

  notice.replaceChildren(document.createTextNode(message));
  if (href && linkLabel) {
    const separator = document.createTextNode(' ');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = linkLabel;
    link.style.color = 'inherit';
    link.style.textDecoration = 'underline';
    notice.append(separator, link);
  }
}

function resolveRequestUrl(input: RequestInfo | URL): URL {
  if (input instanceof URL) return input;
  if (input instanceof Request) return new URL(input.url);
  return new URL(input, location.href);
}

function isWorkspaceLocation(): boolean {
  return location.pathname === '/app'
    || location.pathname.startsWith('/app/')
    || !['/', '/login', '/signup', '/auth/redeem', '/invitation', '/privacy', '/terms'].includes(location.pathname);
}
