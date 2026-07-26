import { useEffect, useMemo, useState } from 'react';

const RELATIONAL_EVENT = 'sovereign:relational-result';
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

  useEffect(() => {
    if (!controlsOpen && !result) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (controlsOpen) setControlsOpen(false);
      else setResult(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [controlsOpen, result]);

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
        <button
          className="shared-context-trigger"
          onClick={openControls}
          aria-haspopup="dialog"
          aria-expanded={controlsOpen}
        >
          People & permissions
        </button>
      )}

      {result && <RelationalResultDialog payload={result} onClose={() => setResult(null)} />}

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

function RelationalResultDialog({ payload, onClose }: { payload: RelationalPayload; onClose: () => void }) {
  const result = payload.comparison ?? payload.analysis ?? payload;
  const participants = Array.isArray(result.participants) ? result.participants : [];
  const isSystem = result.kind === 'system';
  return (
    <div className="completion-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="completion-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="relational-result-title"
      >
        <header className="completion-dialog-header">
          <div>
            <p className="eyebrow">{isSystem ? 'GROUP CONTEXT' : 'RELATIONSHIP CONTEXT'}</p>
            <h2 id="relational-result-title">{isSystem ? result.system?.name ?? 'Group review' : 'Two people, not one story.'}</h2>
          </div>
          <button className="quiet-button" onClick={onClose} autoFocus>Close</button>
        </header>

        <div className="participant-grid">
          {participants.map((participant: any) => (
            <article key={participant.personId} className="participant-card">
              <span>{humanStatus(participant.role ?? 'participant')}</span>
              <h3>{participant.label}</h3>
              <DefinitionList value={participant.baseline ?? {}} />
              <p><strong>Uncertainty:</strong> {humanStatus(participant.uncertainty ?? 'unknown')}</p>
              <p>{participant.unknownActualState}</p>
              {participant.basis && Object.keys(participant.basis).length > 0 && (
                <details><summary>Consented source detail</summary><DefinitionList value={participant.basis} /></details>
              )}
            </article>
          ))}
        </div>

        {!isSystem && result.interaction && (
          <section className="completion-section">
            <h3>Where you may work similarly</h3>
            <StringList values={result.interaction.possibleAlignment} />
            <h3>Where timing or needs may differ</h3>
            <StringList values={result.interaction.possibleFriction} />
            <p><strong>What remains each person’s responsibility:</strong> {result.interaction.responsibilityBoundary}</p>
            <p><strong>What this comparison cannot tell you:</strong> {result.interaction.prohibitedInference}</p>
            <h3>What you still need to learn directly</h3>
            <StringList values={result.interaction.missingInformation} />
          </section>
        )}

        {isSystem && (
          <section className="completion-section">
            <h3>How the group may be interacting</h3>
            {(result.interactionEdges ?? []).map((edge: any, index: number) => (
              <p key={`${edge.from}-${edge.to}-${index}`}><strong>{edge.from} → {edge.to}:</strong> {edge.interpretation}</p>
            ))}
            <h3>Who is responsible for what</h3>
            <StringList values={result.responsibilityBoundaries} />
            <h3>What you still need to learn directly</h3>
            <StringList values={result.missingInformation} />
            <h3>Practical next steps</h3>
            <StringList values={result.supportiveNextSteps} />
          </section>
        )}

        <footer className="completion-provenance" aria-label="Privacy and consent verification">
          <strong>Privacy check for this result</strong>
          <span>Raw birth details stayed private: {yesNo(result.provenance?.rawBirthInputShared === false)}</span>
          <span>Exact private location stayed private: {yesNo(result.provenance?.exactPrivateLocationShared === false)}</span>
          <span>Permissions checked: {readableValue(result.provenance?.consentCheckedAt ?? 'during this request')}</span>
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
          <dt>{definitionLabel(key)}</dt>
          <dd>{readableValue(item)}</dd>
        </div>
      ))}
    </dl>
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

function yesNo(value: unknown): string {
  return value === true ? 'Yes' : 'No';
}

function readableValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(readableValue).join(' · ');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${plainKey(key)}: ${readableValue(item)}`)
      .join(' · ');
  }
  return String(value);
}

function plainKey(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[._-]/g, ' ').toLowerCase();
}

function definitionLabel(value: string): string {
  const labels: Record<string, string> = {
    baselineTendency: 'Your Baseline',
    currentAmplification: 'What may be louder now',
    possibleCurrentAmplification: 'What may be louder now',
    userObservation: 'What the person confirmed',
    knownObservation: 'What you confirmed',
    unknownActualState: 'What remains unknown',
    uncertainty: 'Confidence limit',
    communication: 'Communication',
    decisions: 'Decisions',
    connection: 'Connection',
    pressureResponse: 'Pressure response'
  };
  return labels[value] ?? humanStatus(value);
}
