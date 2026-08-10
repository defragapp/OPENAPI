import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

const EMAIL_CODE_READY = 'sovereign:email-code-ready';
let installed = false;

type CodeReadyDetail = { email: string; returnTo: string };
type Json = Record<string, any>;

export function installEmailCodeFallbackRuntime(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await nativeFetch(input, init);
    try {
      const rawUrl = input instanceof Request ? input.url : String(input);
      const url = new URL(rawUrl, window.location.origin);
      const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
      if (response.ok && method === 'POST' && url.pathname === '/api/v1/auth/login') {
        const payload = await response.clone().json().catch(() => ({})) as Json;
        const requestBody = readRequestBody(init);
        const email = typeof requestBody.email === 'string' ? requestBody.email.trim().toLowerCase() : '';
        if (payload.recovery === 'link_or_code' && validEmail(email)) {
          window.dispatchEvent(new CustomEvent<CodeReadyDetail>(EMAIL_CODE_READY, {
            detail: { email, returnTo: safeReturnTo(requestBody.returnTo) }
          }));
        }
      }
    } catch {
      // The original sign-in response remains authoritative.
    }
    return response;
  }) as typeof window.fetch;
}

export function EmailCodeFallback() {
  const [ready, setReady] = useState<CodeReadyDetail | null>(null);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('Enter the six-digit code from the same email.');
  const [tone, setTone] = useState<'neutral' | 'error' | 'success'>('neutral');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const receive = (event: Event) => {
      setReady((event as CustomEvent<CodeReadyDetail>).detail);
      setCode('');
      setTone('neutral');
      setStatus('Enter the six-digit code from the same email. It expires after 10 minutes.');
      window.setTimeout(() => inputRef.current?.focus(), 0);
    };
    window.addEventListener(EMAIL_CODE_READY, receive);
    return () => window.removeEventListener(EMAIL_CODE_READY, receive);
  }, []);

  if (location.pathname !== '/login' || !ready) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !ready) return;
    const cleanCode = code.replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(cleanCode)) {
      setTone('error');
      setStatus('Enter all six digits from the newest sign-in email.');
      return;
    }
    setSubmitting(true);
    setTone('neutral');
    setStatus('Checking the one-time code…');
    try {
      const response = await fetch('/api/v1/auth/redeem', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: ready.email, code: cleanCode })
      });
      const payload = await response.json().catch(() => ({})) as Json;
      if (!response.ok || payload.status !== 'success') {
        setTone('error');
        setStatus('That code is invalid or expired. Use the newest email or request a fresh sign-in email.');
        setCode('');
        window.setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }
      setTone('success');
      setStatus('Signed in. Opening Sovereign.OS…');
      window.setTimeout(() => location.assign(safeReturnTo(payload.next, ready.returnTo)), 250);
    } catch {
      setTone('error');
      setStatus('The code could not reach Sovereign.OS. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function requestFreshEmail() {
    if (!ready) return;
    const search = new URLSearchParams();
    if (ready.returnTo !== '/app') search.set('returnTo', ready.returnTo);
    const query = search.toString();
    location.assign(`/login${query ? `?${query}` : ''}`);
  }

  return (
    <aside className="email-code-fallback" aria-labelledby="email-code-title">
      <header><p>EMAIL CODE</p><h2 id="email-code-title">Use the code instead.</h2></header>
      <p className="email-code-copy">Keep this page open and enter the newest six-digit code. The private link in the email still works too.</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="sovereign-email-code">Six-digit code</label>
        <input
          ref={inputRef}
          id="sovereign-email-code"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          aria-describedby="email-code-status"
          disabled={submitting}
        />
        <button className="email-code-submit" disabled={submitting || code.length !== 6}>{submitting ? 'Checking…' : 'Open Sovereign.OS'}</button>
      </form>
      <p id="email-code-status" className={`email-code-status ${tone}`} role="status" aria-live="polite">{status}</p>
      <button className="email-code-reset" onClick={requestFreshEmail}>Use a different email or request a new code</button>
    </aside>
  );
}

function readRequestBody(init?: RequestInit): Json {
  if (typeof init?.body !== 'string') return {};
  try { return JSON.parse(init.body) as Json; } catch { return {}; }
}

function validEmail(value: string): boolean {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function safeReturnTo(value: unknown, fallback = '/app'): string {
  if (typeof value !== 'string' || value.length > 512 || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  try {
    const parsed = new URL(value, 'https://app.defrag.app');
    const allowed = parsed.pathname === '/app'
      || parsed.pathname.startsWith('/app/')
      || parsed.pathname === '/onboarding'
      || parsed.pathname === '/consent.html';
    return allowed ? `${parsed.pathname}${parsed.search}` : fallback;
  } catch {
    return fallback;
  }
}