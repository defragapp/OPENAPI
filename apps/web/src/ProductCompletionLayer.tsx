import { useEffect, useMemo, useState } from 'react';

const RELATIONAL_EVENT = 'sovereign:relational-result';
let runtimeInstalled = false;

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

type RelationalPayload = Record<string, any>;

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

    const relational =
      /^\/api\/v1\/people\/[^/]+\/(compare|comparison)$/.test(path) ||
      /^\/api\/v1\/systems\/[^/]+\/(alignment|analysis)$/.test(path);
    if (response.ok && relational && response.headers.get('content-type')?.includes('application/json')) {
      response.clone().json().then((detail) => {
        window.dispatchEvent(new CustomEvent(RELATIONAL_EVENT, { detail }));
      }).catch(() => undefined);
    }

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
  const [result, setResult] = useState<RelationalPayload | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [invitations, setInvitations] = useState<InvitationRecord[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const workspace = useMemo(() => window.location.pathname === '/app', []);

  useEffect(() => {
    const listener = (event: Event) => setResult((event as CustomEvent<RelationalPayload>).detail);
    window.addEventListener(RELATIONAL_EVENT, listener);
    return () => window.removeEventListener(RELATIONAL_EVENT, listener);
  }, []);

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

  function openControls() {
    setControlsOpen(true);
    void refreshControls();
  }

  return (
    <>
      {workspace && (
        <button className="shared-context-trigger" onClick={openControls}>
          Shared context
        </button>
      )}

      {result && <RelationalResultDialog payload={result} onClose={() => setResult(null)} />}

      {controlsOpen && (
        <div className="completion-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setControlsOpen(false);
        }}>
          <section className="completion-dialog consent-review-dialog" role="dialog" aria-modal="true" aria-label="Shared context controls">
            <header className="completion-dialog-header">
              <div>
                <p className="eyebrow">SHARED CONTEXT</p>
                <h2>Consent stays changeable.</h2>
              </div>
              <button className="quiet-button" onClick={() => setControlsOpen(false)}>Close</button>
            </header>
            <p className="result-status" aria-live="polite">{status}</p>

            <section className="completion-section">
              <h3>People in your workspace</h3>
              {people.length === 0 && <p className="empty-copy">No people have been added.</p>}
              {people.map((person) => (
                <article className="consent-person-card" key={person.id}>
                  <div className="consent-person-heading">
                    <div>
                      <strong>{person.displayName}</strong>
                      <small>{person.identityBound ? 'Verified identity' : 'Private entry only'} · Baseline {person.baselineStatus}</small>
                    </div>
                    <span>{person.invitationStatus ?? 'not invited'}</span>
                  </div>
                  {person.activeScopes.length > 0 ? (
                    <div className="scope-chip-list">
                      {person.activeScopes.map((scope) => (
                        <button
                          key={scope}
                          disabled={loading}
                          onClick={() => mutate(
                            `Stopping use of ${scope}…`,
                            `/api/v1/people/${encodeURIComponent(person.id)}/consent/${encodeURIComponent(scope)}`,
                            { method: 'PUT', body: JSON.stringify({ granted: false, reason: 'Workspace owner stopped using this scope.' }) }
                          )}
                        >
                          {scope} · stop using
                        </button>
                      ))}
                    </div>
                  ) : <p className="empty-copy">No active consent scopes.</p>}
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
              <h3>Permissions you granted</h3>
              {invitations.length === 0 && <p className="empty-copy">No accepted invitations are linked to this account.</p>}
              {invitations.map((invitation) => (
                <article className="consent-person-card" key={invitation.id}>
                  <div className="consent-person-heading">
                    <div><strong>{invitation.displayName}</strong><small>You control each requested use.</small></div>
                    <span>{invitation.status}</span>
                  </div>
                  <div className="invitee-decision-list">
                    {invitation.requestedScopes.map((scope) => (
                      <div key={scope}>
                        <span><strong>{scope}</strong><small>{invitation.decisions?.[scope] ?? 'no decision'}</small></span>
                        <div>
                          <button disabled={loading} onClick={() => mutate(
                            `Allowing ${scope}…`,
                            `/api/v1/invitations/${encodeURIComponent(invitation.id)}/consent/${encodeURIComponent(scope)}`,
                            { method: 'PUT', body: JSON.stringify({ granted: true }) }
                          )}>Allow</button>
                          <button disabled={loading} onClick={() => mutate(
                            `Revoking ${scope}…`,
                            `/api/v1/invitations/${encodeURIComponent(invitation.id)}/consent/${encodeURIComponent(scope)}`,
                            { method: 'PUT', body: JSON.stringify({ granted: false }) }
                          )}>Do not allow</button>
                        </div>
                      </div>
                    ))}
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

function RelationalResultDialog({ payload, onClose }: { payload: RelationalPayload; onClose: () => void }) {
  const result = payload.comparison ?? payload.analysis ?? payload;
  const participants = Array.isArray(result.participants) ? result.participants : [];
  const isSystem = result.kind === 'system';
  return (
    <div className="completion-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="completion-dialog" role="dialog" aria-modal="true" aria-label="Relational context result">
        <header className="completion-dialog-header">
          <div>
            <p className="eyebrow">{isSystem ? 'SYSTEM CONTEXT' : 'CONSENTED PAIR CONTEXT'}</p>
            <h2>{isSystem ? result.system?.name ?? 'System review' : 'Two people, kept distinct.'}</h2>
          </div>
          <button className="quiet-button" onClick={onClose}>Close</button>
        </header>

        <div className="participant-grid">
          {participants.map((participant: any) => (
            <article key={participant.personId} className="participant-card">
              <span>{participant.role}</span>
              <h3>{participant.label}</h3>
              <DefinitionList value={participant.baseline ?? {}} />
              <p><strong>Uncertainty:</strong> {participant.uncertainty ?? 'unknown'}</p>
              <p>{participant.unknownActualState}</p>
              {participant.basis && Object.keys(participant.basis).length > 0 && (
                <details><summary>Consented source detail</summary><DefinitionList value={participant.basis} /></details>
              )}
            </article>
          ))}
        </div>

        {!isSystem && result.interaction && (
          <section className="completion-section">
            <h3>What may align</h3>
            <StringList values={result.interaction.possibleAlignment} />
            <h3>What may differ</h3>
            <StringList values={result.interaction.possibleFriction} />
            <p><strong>Responsibility boundary:</strong> {result.interaction.responsibilityBoundary}</p>
            <p><strong>Unknown actual state:</strong> {result.interaction.prohibitedInference}</p>
            <StringList values={result.interaction.missingInformation} />
          </section>
        )}

        {isSystem && (
          <section className="completion-section">
            <h3>Interaction map</h3>
            {(result.interactionEdges ?? []).map((edge: any, index: number) => (
              <p key={`${edge.from}-${edge.to}-${index}`}><strong>{edge.from} → {edge.to}:</strong> {edge.interpretation}</p>
            ))}
            <h3>Responsibility boundaries</h3>
            <StringList values={result.responsibilityBoundaries} />
            <h3>What is still missing</h3>
            <StringList values={result.missingInformation} />
            <h3>Grounded next steps</h3>
            <StringList values={result.supportiveNextSteps} />
          </section>
        )}

        <footer className="completion-provenance">
          <strong>Verified boundary</strong>
          <span>Raw birth input shared: {String(result.provenance?.rawBirthInputShared ?? false)}</span>
          <span>Exact private location shared: {String(result.provenance?.exactPrivateLocationShared ?? false)}</span>
          <span>Consent checked: {result.provenance?.consentCheckedAt ?? 'during this request'}</span>
        </footer>
      </section>
    </div>
  );
}

function StringList({ values }: { values: unknown }) {
  const items = Array.isArray(values) ? values.filter((item) => typeof item === 'string') as string[] : [];
  if (!items.length) return <p className="empty-copy">No reliable statement is available.</p>;
  return <ul className="completion-list">{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
}

function DefinitionList({ value }: { value: Record<string, unknown> }) {
  return (
    <dl className="completion-definitions">
      {Object.entries(value).map(([key, item]) => (
        <div key={key}>
          <dt>{plainKey(key)}</dt>
          <dd>{typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' ? String(item) : JSON.stringify(item)}</dd>
        </div>
      ))}
    </dl>
  );
}

function plainKey(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase();
}
