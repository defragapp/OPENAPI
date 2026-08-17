const PUBLIC_SHARE_URL = 'https://sovereign.defrag.app';
const TERMS_URL = `${PUBLIC_SHARE_URL}/terms`;
const PRIVACY_URL = `${PUBLIC_SHARE_URL}/privacy`;
const PRODUCTION_TURNSTILE_SITE_KEY = '0x4AAAAAADhGIF8-iOLIg8MU';
const STRIPE_HANDOFF_HOSTS = new Set(['checkout.stripe.com', 'billing.stripe.com']);
const TURNSTILE_STATE_EVENT = 'sovereign:turnstile-state';
const TURNSTILE_RESET_EVENT = 'sovereign:turnstile-reset';
const D1_BOOKMARK_HEADER = 'x-d1-bookmark';
const D1_BOOKMARK_STORAGE_KEY = 'sovereign:d1-bookmark';
const MAX_D1_BOOKMARK_LENGTH = 1_024;
const CONTROL_CHARACTER = /[\u0000-\u001F\u007F]/;

type TurnstileState = 'loading' | 'ready' | 'verified' | 'expired' | 'error' | 'unsupported';
type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string | HTMLElement) => void;
  getResponse: (widgetId?: string | HTMLElement) => string | undefined;
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
  const siteKey = String(import.meta.env.VITE_TURNSTILE_SITE_KEY || PRODUCTION_TURNSTILE_SITE_KEY).trim();
  if (!siteKey) {
    if (import.meta.env.PROD) queueMicrotask(() => showNotice('Sign-in protection is not configured.'));
    return;
  }

  window.__TURNSTILE_SITE_KEY__ = siteKey;

  const updateState = (container: HTMLElement, state: TurnstileState, message: string) => {
    const frame = container.closest<HTMLElement>('.turnstile-frame');
    if (frame) frame.dataset.state = state;
    const caption = frame?.querySelector<HTMLElement>('[data-turnstile-caption]');
    if (caption) caption.textContent = message;
    const detail = { state, action: container.dataset.action || 'login' };
    window.dispatchEvent(new CustomEvent(TURNSTILE_STATE_EVENT, { detail }));
    setTimeout(() => window.dispatchEvent(new CustomEvent(TURNSTILE_STATE_EVENT, { detail })), 0);
  };

  const resetWidget = (container: HTMLElement, message = 'Refreshing the private security check…') => {
    const widgetId = container.dataset.turnstileWidgetId;
    if (!widgetId || !window.turnstile) return;
    updateState(container, 'loading', message);
    window.turnstile.reset(widgetId);
  };

  const renderWidgets = () => {
    if (!window.turnstile) return;
    document.querySelectorAll<HTMLElement>('.turnstile-slot').forEach((container) => {
      if (container.dataset.turnstileRendered === 'true') return;
      container.dataset.turnstileRendered = 'true';
      container.textContent = '';
      updateState(container, 'loading', 'Preparing the private security check…');
      try {
        const widgetId = window.turnstile?.render(container, {
          sitekey: siteKey,
          action: container.dataset.action || 'login',
          theme: 'dark',
          size: 'flexible',
          appearance: 'always',
          retry: 'auto',
          'retry-interval': 8_000,
          'response-field': true,
          'response-field-name': 'cf-turnstile-response',
          callback: () => updateState(container, 'verified', 'Security check complete.'),
          'before-interactive-callback': () => updateState(container, 'ready', 'Complete the private security check to continue.'),
          'after-interactive-callback': () => {
            const response = container.dataset.turnstileWidgetId ? window.turnstile?.getResponse(container.dataset.turnstileWidgetId) : undefined;
            if (!response) updateState(container, 'ready', 'Complete the private security check to continue.');
          },
          'expired-callback': () => {
            updateState(container, 'expired', 'The security check expired. Refreshing it now…');
            setTimeout(() => resetWidget(container), 300);
          },
          'timeout-callback': () => {
            updateState(container, 'expired', 'The security check timed out. Refreshing it now…');
            setTimeout(() => resetWidget(container), 300);
          },
          'unsupported-callback': () => updateState(container, 'unsupported', 'This browser cannot complete the security check. Update the browser or try another device.'),
          'error-callback': (errorCode: unknown) => {
            container.dataset.turnstileErrorCode = typeof errorCode === 'string' ? errorCode.slice(0, 24) : 'unknown';
            updateState(container, 'error', 'The security check could not finish. It will retry automatically.');
          }
        });
        if (widgetId) container.dataset.turnstileWidgetId = widgetId;
      } catch {
        container.dataset.turnstileRendered = 'false';
        updateState(container, 'error', 'The security check could not load. Refresh the page and try again.');
      }
    });
  };

  window.addEventListener(TURNSTILE_RESET_EVENT, (event) => {
    const action = (event as CustomEvent<{ action?: string }>).detail?.action;
    document.querySelectorAll<HTMLElement>('.turnstile-slot').forEach((container) => {
      if (!action || (container.dataset.action || 'login') === action) resetWidget(container);
    });
  });

  const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
  if (existing) {
    if (window.turnstile) renderWidgets();
    else existing.addEventListener('load', renderWidgets, { once: true });
    existing.addEventListener('error', () => {
      document.querySelectorAll<HTMLElement>('.turnstile-slot').forEach((container) => updateState(container, 'error', 'The security check could not load. Refresh the page and try again.'));
    }, { once: true });
  } else {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.addEventListener('load', renderWidgets, { once: true });
    script.addEventListener('error', () => {
      document.querySelectorAll<HTMLElement>('.turnstile-slot').forEach((container) => updateState(container, 'error', 'The security check could not load. Refresh the page and try again.'));
    }, { once: true });
    document.head.appendChild(script);
  }

  new MutationObserver(renderWidgets).observe(document.documentElement, { childList: true, subtree: true });
  renderWidgets();
}

function installFetchObserver(): void {
  const nativeFetch = window.fetch.bind(window);
  let d1Bookmark = readStoredD1Bookmark();

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const requestUrl = resolveRequestUrl(input);
    const isSameOriginApi = requestUrl.origin === location.origin && requestUrl.pathname.startsWith('/api/');
    const requestPair: [RequestInfo | URL, RequestInit | undefined] = isSameOriginApi
      ? withD1Bookmark(input, init, d1Bookmark)
      : [input, init];
    const [requestInput, requestInit] = requestPair;
    const response = await nativeFetch(requestInput, requestInit);

    if (isSameOriginApi) {
      const nextBookmark = normalizeD1Bookmark(response.headers.get(D1_BOOKMARK_HEADER));
      if (nextBookmark) {
        d1Bookmark = nextBookmark;
        storeD1Bookmark(nextBookmark);
      }

      if (response.status === 401 && isWorkspaceLocation()) {
        setTimeout(() => location.assign(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`), 50);
      }

      if (response.ok && requestUrl.pathname.startsWith('/api/v1/auth/logout')) {
        d1Bookmark = undefined;
        clearStoredD1Bookmark();
        setTimeout(() => location.assign('/login'), 50);
      }

      if (response.ok && isBillingHandoffPath(requestUrl.pathname)) {
        const payload = await response.clone().json().catch(() => ({})) as {
          checkout?: { url?: unknown };
          portal?: { url?: unknown };
        };
        const handoff = payload.checkout?.url ?? payload.portal?.url;
        if (!isTrustedStripeHandoff(handoff)) {
          showNotice('Billing handoff was blocked because it did not point to Stripe.');
          return Response.json({
            error: 'untrusted_billing_handoff',
            message: 'Billing is temporarily unavailable. No payment page was opened.'
          }, { status: 502, headers: { 'cache-control': 'no-store' } });
        }
      }
    }

    return response;
  }) as typeof window.fetch;
}

function withD1Bookmark(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  bookmark: string | undefined
): [RequestInfo | URL, RequestInit | undefined] {
  if (!bookmark) return [input, init];

  if (input instanceof Request) {
    const headers = new Headers(input.headers);
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    headers.set(D1_BOOKMARK_HEADER, bookmark);
    return [new Request(input, { ...init, headers }), undefined];
  }

  const headers = new Headers(init?.headers);
  headers.set(D1_BOOKMARK_HEADER, bookmark);
  return [input, { ...init, headers }];
}

function normalizeD1Bookmark(value: string | null | undefined): string | undefined {
  const bookmark = value?.trim();
  if (!bookmark || bookmark.length > MAX_D1_BOOKMARK_LENGTH || CONTROL_CHARACTER.test(bookmark)) return undefined;
  return bookmark;
}

function readStoredD1Bookmark(): string | undefined {
  try {
    return normalizeD1Bookmark(sessionStorage.getItem(D1_BOOKMARK_STORAGE_KEY));
  } catch {
    return undefined;
  }
}

function storeD1Bookmark(bookmark: string): void {
  try {
    sessionStorage.setItem(D1_BOOKMARK_STORAGE_KEY, bookmark);
  } catch {
    // Session continuity remains correct within the current request when storage is unavailable.
  }
}

function clearStoredD1Bookmark(): void {
  try {
    sessionStorage.removeItem(D1_BOOKMARK_STORAGE_KEY);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}

function isBillingHandoffPath(pathname: string): boolean {
  return pathname === '/api/v1/billing/checkout' || pathname === '/api/v1/billing/portal';
}

function isTrustedStripeHandoff(value: unknown): boolean {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && STRIPE_HANDOFF_HOSTS.has(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function installUtilityLinks(): void {
  const render = () => {
    installAccountNavigation();
  };

  new MutationObserver(render).observe(document.documentElement, { childList: true, subtree: true });
  render();
}

function installAccountNavigation(): void {
  document.querySelectorAll<HTMLAnchorElement>('.account-shell .wordmark').forEach((link) => {
    link.href = PUBLIC_SHARE_URL;
    link.title = 'Open the public Sovereign.OS site';
  });

  document.querySelectorAll<HTMLElement>('.account-shell .check-line span').forEach((label) => {
    if (label.dataset.policyLinks === 'true') return;
    const originalLabel = label.textContent ?? '';
    if (!/\bTerms\b|\bPrivacy(?: Policy)?\b/i.test(originalLabel)) return;
    label.dataset.policyLinks = 'true';
    const terms = policyLink('Terms', TERMS_URL);
    const privacy = policyLink('Privacy Policy', PRIVACY_URL);
    label.replaceChildren(document.createTextNode('I accept the '), terms, document.createTextNode(' and '), privacy, document.createTextNode('.'));
  });
}

function policyLink(label: string, href: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  link.addEventListener('click', (event) => event.stopPropagation());
  return link;
}

export async function sharePublicPlatform(): Promise<void> {
  const data = {
    title: 'Sovereign.OS',
    text: 'Understand yourself, your relationships, and the systems around you—in context.',
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
