import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  decodeRequestOptions,
  passkeyErrorMessage,
  passkeysSupported,
  serializeAssertion,
  type ServerRequestOptions
} from './passkey-client';

type LoginOptionsResponse = {
  challengeId: string;
  publicKey: ServerRequestOptions;
};

type LoginVerifyResponse = {
  status?: string;
  next?: string;
};

type LoginState = 'ready' | 'working' | 'success' | 'error' | 'unsupported';

function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/app';
  return value;
}

export function PasskeyAuthentication() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [state, setState] = useState<LoginState>(() => passkeysSupported() ? 'ready' : 'unsupported');
  const [message, setMessage] = useState('Use Face ID, Touch ID, Windows Hello, or your device passkey.');
  const returnTo = useMemo(() => safeReturnTo(new URLSearchParams(location.search).get('returnTo')), []);

  useEffect(() => {
    if (location.pathname !== '/login') return;
    let active = true;
    let currentPanel: HTMLElement | null = null;
    let currentMount: HTMLElement | null = null;

    const install = () => {
      if (!active) return;
      const panel = document.querySelector<HTMLElement>('.auth-panel');
      if (!panel || panel === currentPanel) return;
      currentMount?.remove();
      currentPanel?.classList.remove('passkey-enabled');
      const target = document.createElement('div');
      target.className = 'passkey-auth-mount';
      panel.prepend(target);
      panel.classList.add('passkey-enabled');
      currentPanel = panel;
      currentMount = target;
      setMount(target);
    };

    install();
    const observer = new MutationObserver(install);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      active = false;
      observer.disconnect();
      currentPanel?.classList.remove('passkey-enabled');
      currentMount?.remove();
      setMount(null);
    };
  }, []);

  async function signInWithPasskey() {
    if (!passkeysSupported()) {
      setState('unsupported');
      setMessage('This browser or device does not support passkeys. Use email recovery below.');
      return;
    }
    setState('working');
    setMessage('Confirm the passkey on your device.');
    try {
      const optionsResponse = await fetch('/api/v1/auth/passkey/login/options', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ returnTo })
      });
      if (!optionsResponse.ok) throw new Error('passkey_options_failed');
      const options = await optionsResponse.json() as LoginOptionsResponse;
      const credential = await navigator.credentials.get({ publicKey: decodeRequestOptions(options.publicKey) });
      if (!(credential instanceof PublicKeyCredential)) throw new Error('passkey_cancelled');
      const verifyResponse = await fetch('/api/v1/auth/passkey/login/verify', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ challengeId: options.challengeId, credential: serializeAssertion(credential) })
      });
      const verified = await verifyResponse.json().catch(() => ({})) as LoginVerifyResponse;
      if (!verifyResponse.ok || verified.status !== 'success') throw new Error('passkey_verification_failed');
      setState('success');
      setMessage('Passkey verified. Confirming your Stripe plan and opening Sovereign.OS.');
      window.setTimeout(() => location.assign(safeReturnTo(verified.next ?? returnTo)), 220);
    } catch (error) {
      setState(error instanceof DOMException && error.name === 'NotAllowedError' ? 'ready' : 'error');
      setMessage(passkeyErrorMessage(error));
    }
  }

  if (!mount) return null;

  return createPortal(
    <section className="passkey-primary" aria-labelledby="passkey-login-title">
      <p className="eyebrow">PRIVATE ACCOUNT ACCESS</p>
      <h2 id="passkey-login-title">Sign in without opening your email.</h2>
      <p className="passkey-intro">Your device verifies you. Sovereign.OS then confirms whether this account has Free or Sovereign+ access before the private workspace opens.</p>
      <button type="button" className="passkey-button" onClick={() => void signInWithPasskey()} disabled={state === 'working' || state === 'success'}>
        <span aria-hidden="true">◎</span>
        {state === 'working' ? 'Waiting for your device…' : state === 'success' ? 'Passkey verified' : 'Sign in with a passkey'}
      </button>
      <p className={`passkey-status ${state}`} role="status" aria-live="polite">{message}</p>
      <div className="passkey-recovery-divider"><span>Email recovery or first-time verification</span></div>
    </section>,
    mount
  );
}
