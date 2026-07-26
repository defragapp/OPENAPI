const SUPPORT_URL = 'https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02';
const EXPORT_POLL_INTERVAL_MS = 2_000;
const EXPORT_POLL_ATTEMPTS = 30;

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
  installSupportLinks();
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
    const method = String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

    if (requestUrl.origin === location.origin && requestUrl.pathname.startsWith('/api/')) {
      if (response.status === 401 && isWorkspaceLocation()) {
        setTimeout(() => location.assign(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`), 50);
      }

      if (response.ok && requestUrl.pathname.startsWith('/api/v1/auth/logout')) {
        setTimeout(() => location.assign('/login'), 50);
      }

      if (response.ok && method === 'POST' && requestUrl.pathname === '/api/v1/export-jobs') {
        void response.clone().json()
          .then((payload: { exportJob?: { id?: string } }) => {
            const jobId = payload.exportJob?.id;
            if (jobId) void monitorExport(nativeFetch, jobId);
          })
          .catch(() => undefined);
      }
    }

    return response;
  }) as typeof window.fetch;
}

async function monitorExport(nativeFetch: typeof window.fetch, jobId: string): Promise<void> {
  showNotice('Preparing your private export…');
  for (let attempt = 0; attempt < EXPORT_POLL_ATTEMPTS; attempt += 1) {
    await delay(EXPORT_POLL_INTERVAL_MS);
    const response = await nativeFetch(`/api/v1/export-jobs/${encodeURIComponent(jobId)}`, {
      headers: { accept: 'application/json' }
    });
    if (!response.ok) continue;
    const payload = await response.json() as { exportJob?: { status?: string; downloadUrl?: string } };
    if (payload.exportJob?.status === 'completed' && payload.exportJob.downloadUrl) {
      showNotice('Your export is ready.', payload.exportJob.downloadUrl, 'Download private export');
      return;
    }
    if (payload.exportJob?.status === 'failed') {
      showNotice('The export could not be completed. Try again later.');
      return;
    }
  }
  showNotice('Your export is still processing. You can request it again from You → Control.');
}

function installSupportLinks(): void {
  const render = () => {
    const footerNav = document.querySelector<HTMLElement>('.launch-footer nav');
    if (footerNav && !footerNav.querySelector('[data-sovereign-support]')) {
      footerNav.appendChild(createSupportLink('Support Sovereign.OS'));
    }

    document.querySelectorAll<HTMLElement>('.surface-card').forEach((card) => {
      if (card.querySelector('.eyebrow')?.textContent?.trim() !== 'PLAN & USAGE') return;
      const actions = card.querySelector<HTMLElement>('.action-row');
      if (actions && !actions.querySelector('[data-sovereign-support]')) {
        const link = createSupportLink('Support development');
        link.className = 'secondary-button';
        actions.appendChild(link);
      }
    });
  };

  new MutationObserver(render).observe(document.documentElement, { childList: true, subtree: true });
  render();
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

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
