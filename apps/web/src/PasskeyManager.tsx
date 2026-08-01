import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  decodeCreationOptions,
  passkeyErrorMessage,
  passkeysSupported,
  serializeRegistration,
  type ServerCreationOptions
} from './passkey-client';

type PasskeyRecord = {
  id: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
};

type PasskeyListResponse = { passkeys?: PasskeyRecord[] };
type RegistrationOptionsResponse = { challengeId: string; publicKey: ServerCreationOptions };
type ManagerState = 'idle' | 'loading' | 'working' | 'error';

export function PasskeyManager() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [state, setState] = useState<ManagerState>('idle');
  const [message, setMessage] = useState('Passkeys let this device sign in without opening email.');

  const loadPasskeys = useCallback(async () => {
    setState('loading');
    try {
      const response = await fetch('/api/v1/auth/passkeys', { credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error('passkey_list_failed');
      const payload = await response.json() as PasskeyListResponse;
      setPasskeys(payload.passkeys ?? []);
      setState('idle');
    } catch {
      setState('error');
      setMessage('Passkey settings are temporarily unavailable.');
    }
  }, []);

  useEffect(() => {
    let active = true;
    let currentDialog: HTMLElement | null = null;
    let currentMount: HTMLElement | null = null;
    const install = () => {
      if (!active) return;
      const dialog = document.querySelector<HTMLElement>('.account-control-dialog');
      if (!dialog || dialog === currentDialog) return;
      currentMount?.remove();
      const target = document.createElement('div');
      target.className = 'passkey-manager-mount';
      const links = dialog.querySelector('.account-control-links');
      if (links?.parentElement) links.parentElement.insertBefore(target, links);
      else dialog.append(target);
      currentDialog = dialog;
      currentMount = target;
      setMount(target);
      void loadPasskeys();
    };
    install();
    const observer = new MutationObserver(install);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      active = false;
      observer.disconnect();
      currentMount?.remove();
      setMount(null);
    };
  }, [loadPasskeys]);

  async function addPasskey() {
    if (!passkeysSupported()) {
      setState('error');
      setMessage('This browser or device cannot create a passkey.');
      return;
    }
    setState('working');
    setMessage('Confirm the new passkey on your device.');
    try {
      const optionsResponse = await fetch('/api/v1/auth/passkey/register/options', {
        method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' }
      });
      if (!optionsResponse.ok) throw new Error('passkey_options_failed');
      const options = await optionsResponse.json() as RegistrationOptionsResponse;
      const credential = await navigator.credentials.create({ publicKey: decodeCreationOptions(options.publicKey) });
      if (!(credential instanceof PublicKeyCredential)) throw new Error('passkey_cancelled');
      const verifyResponse = await fetch('/api/v1/auth/passkey/register/verify', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ challengeId: options.challengeId, label: 'This device', credential: serializeRegistration(credential) })
      });
      if (!verifyResponse.ok) throw new Error('passkey_registration_failed');
      setMessage('Passkey added. You can use it the next time you sign in.');
      await loadPasskeys();
    } catch (error) {
      setState('error');
      setMessage(passkeyErrorMessage(error));
    }
  }

  async function removePasskey(passkeyId: string) {
    setState('working');
    setMessage('Removing passkey…');
    try {
      const response = await fetch(`/api/v1/auth/passkeys/${encodeURIComponent(passkeyId)}`, {
        method: 'DELETE', credentials: 'same-origin', cache: 'no-store', headers: { accept: 'application/json' }
      });
      if (!response.ok) throw new Error('passkey_delete_failed');
      setMessage('Passkey removed. Email recovery remains available.');
      await loadPasskeys();
    } catch {
      setState('error');
      setMessage('The passkey could not be removed. Try again.');
    }
  }

  if (!mount) return null;

  return createPortal(
    <section className="account-control-section passkey-manager" aria-labelledby="passkey-manager-title">
      <div className="passkey-manager-heading">
        <div>
          <span className="eyebrow">SIGN-IN SECURITY</span>
          <h3 id="passkey-manager-title">Passkeys</h3>
          <p>Use Face ID, Touch ID, Windows Hello, or your device lock. Email stays available for recovery.</p>
        </div>
        <button type="button" onClick={() => void addPasskey()} disabled={state === 'working' || state === 'loading'}>Add passkey</button>
      </div>
      <div className="passkey-list">
        {state === 'loading' && <p>Loading passkeys…</p>}
        {state !== 'loading' && passkeys.length === 0 && <p className="passkey-empty">No passkey is connected yet.</p>}
        {passkeys.map((passkey) => (
          <article key={passkey.id}>
            <div>
              <strong>{passkey.label || 'Passkey'}</strong>
              <small>Added {new Date(passkey.created_at).toLocaleDateString()}{passkey.last_used_at ? ` · Last used ${new Date(passkey.last_used_at).toLocaleDateString()}` : ''}</small>
            </div>
            <button type="button" className="passkey-remove" onClick={() => void removePasskey(passkey.id)} disabled={state === 'working'}>Remove</button>
          </article>
        ))}
      </div>
      <p className={`passkey-manager-status ${state}`} role="status" aria-live="polite">{message}</p>
    </section>,
    mount
  );
}
