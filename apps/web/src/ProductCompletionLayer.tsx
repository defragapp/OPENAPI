import { useEffect, useState } from 'react';

let runtimeInstalled = false;

const scopeCopy: Record<string, { title: string; description: string }> = {
  'pair.compare': {
    title: 'Compare together',
    description: 'Use the Baseline themes each person agreed to share in a two-person comparison.'
  },
  'system.include': {
    title: 'Include in a system',
    description: 'Include this person in a consented family, household, friendship, or team view.'
  },
  'trait.display': {
    title: 'Use shared Baseline traits',
    description: 'Use the reduced plain-language traits needed for the requested view.'
  },
  'framework.display': {
    title: 'Show optional source detail',
    description: 'Allow exact supporting framework detail to appear only when specifically requested.'
  },
  'current_conditions.use': {
    title: 'Use current conditions',
    description: 'Include current timing only for this person when permission is active.'
  },
  'library.link': {
    title: 'Link a saved understanding',
    description: 'Use a deliberately saved understanding as shared context.'
  },
  'covenant.include': {
    title: 'Include in a Scripture lens',
    description: 'Include this person only when the optional Covenant lens is explicitly enabled.'
  }
};

interface PersonRecord {
  id: string;
  displayName: string;
  role: string;
  consentStatus: string;
  baselineStatus: string;
  invitationId?: string;
  invitationStatus?: string;
  invitationExpiresAt?: string;
  identityBound: boolean;
  activeScopes: string[];
}

interface InvitationRecord {
  id: string;
  personId: string;
  displayName: string;
  status: string;
  requestedScopes: string[];
  decisions: Record<string, 'granted' | 'denied'>;
}

export function installProductRuntime(): void {
  if (runtimeInstalled || typeof window === 'undefined') return;
  runtimeInstalled = true;
  installFetchObserver();
  installTurnstileRenderer();
}

function installFetchObserver(): void {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await nativeFetch(input, init);
    const rawUrl = input instanceof Request ? input.url : String(input);
    const path = new URL(rawUrl, window.location.origin).pathname;

    if (response.ok && /^\/api\/v1\/auth\/logout(-all)?$/.test(path)) {
      window.setTimeout(() => window.location.assign('/login'), 80);
    }
    return response;
  }) as typeof window.fetch;
}

function installTurnstileRenderer(): void {
  const env = (import.meta as any).env ?? {};
  const sitekey = String(env.VITE_TURNSTILE_SITE_KEY ?? '').trim();
  const renderSlots = () => {
    const turnstile = (window as any).turnstile;
    document.querySelectorAll<HTMLElement>('.turnstile-slot:not([data-turnstile-rendered])').forEach((slot) => {
      if (!sitekey) {
        slot.dataset.turnstileRendered = 'missing-config';
        slot.textContent = 'Turnstile site key is not configured for this build.';
        return;
      }
      if (!turnstile?.render) return;
      slot.dataset.turnstileRendered = 'true';
      slot.textContent = '';
      turnstile.render(slot, {
        sitekey,
        action: slot.dataset.action || 'sovereign-auth',
        theme: 'dark',
        appearance: 'interaction-only'
      });
    });
  };

  const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
  if (existing) {
    existing.addEventListener('load', renderSlots, { once: true });
  } else {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.addEventListener('load', renderSlots, { once: true });
    document.head.appendChild(script);
  }

  new MutationObserver(renderSlots).observe(document.documentElement, { childList: true, subtree: true });
  window.setTimeout(renderSlots, 0);
}

export function ProductCompletionLayer() {
  const [controlsOpen, setControlsOpen] = useState(false);
  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const open = () => {
      setControlsOpen(true);
      void refreshControls();
    };
    window.addEventListener('sovereign:open-consent-controls', open);
    return () => window.removeEventListener('sovereign:open-consent-controls', open);
  }, []);

  useEffect(() => {
    if (!controlsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setControlsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [controlsOpen]);

  async function api(path: string, init: RequestInit = {}) {
    const response = await fetch(path, {
      ...init,
      headers: {
        'content-type': 'application/json',
        'x-idempotency-key': crypto.randomUUID(),
        ...(init.headers ?? {})
      }
    });
    const body = response.headers.get('content-type')?.includes('application/json')
      ? await response.json().catch(() => ({}))
      : {};
    if (!response.ok) throw new Error(body.message || body.error || `Request failed (${response.status})`);
    return body;
  }

  async function refreshControls() {
    setLoading(true);
    setStatus('Loading current consent state…');
    try {
      const [ownerData, inviteeData] = await Promise.all([
        api('/api/v1/people'),
        api('/api/v1/invitations/mine').catch((error) => {
          if (error instanceof Error && /401/.test(error.message)) throw error;
          return { invitations: [] };
        })
      ]);
      setPeople(ownerData.people ?? []);
      setInvitations(inviteeData.invitations ?? []);
      setStatus('Current consent state loaded.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Shared context is unavailable.');
    } finally {
      setLoading(false);
    }
  }

  async function mutate(label: string, path: string, init: RequestInit) {
    setLoading(true);
    setStatus(label);
    try {
      await api(path, init);
      await refreshControls();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'That change could not be completed safely.');
      setLoading(false);
    }
  }

  return (
    <>
      {controlsOpen && (
        <div className="completion-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setControlsOpen(false);
        }}>
          <section
            className="completion-dialog consent-review-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shared-context-title"
          >
            <header className="completion-dialog-header">
              <div>
                <p className="eyebrow">PEOPLE & PERMISSIONS</p>
                <h2 id="shared-context-title">Manage what others may use.</h2>
              </div>
              <button className="quiet-button" onClick={() => setControlsOpen(false)} autoFocus>Close</button>
            </header>
            <p className="completion-intro">A connection never creates blanket access. Review active permissions, stop a specific use, cancel a pending invitation, or remove a person from your workspace.</p>
            <p className="result-status" role="status" aria-live="polite">{status}</p>

            <section className="completion-section">
              <h3>People you added</h3>
              {people.length === 0 && <p className="empty-copy">No people have been added.</p>}
              {people.map((person) => (
                <article className="consent-person-card" key={person.id}>
                  <div className="consent-person-heading">
                    <div>
                      <strong>{person.displayName}</strong>
                      <small>{person.identityBound ? 'Connected to their own account' : 'Private name only'} · Shared Baseline {humanStatus(person.baselineStatus)}</small>
                    </div>
                    <span>{humanStatus(person.invitationStatus ?? 'not invited')}</span>
                  </div>
                  {person.activeScopes.length > 0 ? (
                    <div className="scope-chip-list" aria-label={`Active permissions for ${person.displayName}`}>
                      {person.activeScopes.map((scope) => (
                        <button
                          key={scope}
                          disabled={loading}
                          title={scopeDescription(scope)}
                          onClick={() => mutate(
                            `Stopping use of ${scopeTitle(scope)}…`,
                            `/api/v1/people/${encodeURIComponent(person.id)}/consent/${encodeURIComponent(scope)}`,
                            { method: 'PUT', body: JSON.stringify({ granted: false, reason: 'Workspace owner stopped using this scope.' }) }
                          )}
                        >
                          {scopeTitle(scope)} · stop using
                        </button>
                      ))}
                    </div>
                  ) : <p className="empty-copy">This person has not allowed any shared use.</p>}
                  <div className="completion-actions">
                    {person.invitationStatus === 'pending' && person.invitationId && (
                      <button
                        className="secondary-button"
                        disabled={loading}
                        onClick={() => mutate(
                          'Cancelling pending invitation…',
                          `/api/v1/invitations/${encodeURIComponent(person.invitationId!)}`,
                          { method: 'PATCH', body: JSON.stringify({ status: 'revoked' }) }
                        )}
                      >
                        Cancel invitation
                      </button>
                    )}
                    <button
                      className="danger-button"
                      disabled={loading}
                      onClick={() => {
                        if (!window.confirm(`Remove ${person.displayName} and all consented relationship/system links from this workspace?`)) return;
                        void mutate(
                          'Removing person and linked shared context…',
                          `/api/v1/people/${encodeURIComponent(person.id)}`,
                          { method: 'DELETE' }
                        );
                      }}
                    >
                      Remove from workspace
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <section className="completion-section">
              <h3>Invitations you accepted</h3>
              {invitations.length === 0 && <p className="empty-copy">No accepted invitations are linked to this account.</p>}
              {invitations.map((invitation) => (
                <article className="consent-person-card" key={invitation.id}>
                  <div className="consent-person-heading">
                    <div><strong>{invitation.displayName}</strong><small>You control each use independently and can change it here.</small></div>
                    <span>{humanStatus(invitation.status)}</span>
                  </div>
                  <div className="invitee-decision-list">
                    {invitation.requestedScopes.map((scope) => {
                      const decision = invitation.decisions?.[scope];
                      return (
                        <div key={scope}>
                          <span>
                            <strong>{scopeTitle(scope)}</strong>
                            <small>{scopeDescription(scope)} · {decisionLabel(decision)}</small>
                          </span>
                          <div className="decision-choice" role="group" aria-label={`${scopeTitle(scope)} decision`}>
                            <button
                              disabled={loading}
                              aria-pressed={decision === 'granted'}
                              onClick={() => mutate(
                                `Allowing ${scopeTitle(scope)}…`,
                                `/api/v1/invitations/${encodeURIComponent(invitation.id)}/consent/${encodeURIComponent(scope)}`,
                                { method: 'PUT', body: JSON.stringify({ granted: true }) }
                              )}
                            >
                              Allow
                            </button>
                            <button
                              disabled={loading}
                              aria-pressed={decision === 'denied'}
                              onClick={() => mutate(
                                `Stopping ${scopeTitle(scope)}…`,
                                `/api/v1/invitations/${encodeURIComponent(invitation.id)}/consent/${encodeURIComponent(scope)}`,
                                { method: 'PUT', body: JSON.stringify({ granted: false }) }
                              )}
                            >
                              Do not allow
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </section>
          </section>
        </div>
      )}
    </>
  );
}

function scopeTitle(scope: string): string {
  return scopeCopy[scope]?.title ?? plainKey(scope);
}

function scopeDescription(scope: string): string {
  return scopeCopy[scope]?.description ?? 'Use only the context covered by this specific permission.';
}

function decisionLabel(decision?: 'granted' | 'denied'): string {
  if (decision === 'granted') return 'Currently allowed';
  if (decision === 'denied') return 'Not allowed';
  return 'No decision yet';
}

function humanStatus(value: string): string {
  const clean = plainKey(value).trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Unknown';
}

function plainKey(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._-]/g, ' ').toLowerCase();
}
