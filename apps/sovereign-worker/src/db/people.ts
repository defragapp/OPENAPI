import type { Env } from '../env';

export const CONSENT_SCOPES = ['pair.compare', 'system.include', 'trait.display', 'framework.display', 'current_conditions.use', 'library.link', 'covenant.include'] as const;
export type ConsentScope = typeof CONSENT_SCOPES[number];
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';

const CONSENT_POLICY_VERSION = '2026-07-24';

export interface RelationshipMetadataInput {
  relationshipType?: string;
  directionality?: string;
  closeness?: string;
  duration?: string;
  sharedHousehold?: boolean;
  authorityDifference?: string;
  dependence?: string;
  contactExpectations?: string;
  userNotes?: string;
}

export interface PersonRecord {
  id: string;
  role: string;
  displayName: string;
  consentStatus: string;
  baselineStatus: string;
  invitationStatus?: InvitationStatus | undefined;
  invitationExpiresAt?: string | undefined;
  identityBound: boolean;
  metadata: RelationshipMetadataInput;
}

function assertConsentScope(scope: string): asserts scope is ConsentScope {
  if (!(CONSENT_SCOPES as readonly string[]).includes(scope)) throw new Response('Unknown consent scope', { status: 400 });
}

async function assertPersonOwned(env: Env, accountId: string, personId: string): Promise<void> {
  const row = await env.DB.prepare('SELECT id FROM persons WHERE id = ? AND account_id = ?').bind(personId, accountId).first<{ id: string }>();
  if (!row) throw new Response('Person not found', { status: 404 });
}

export async function listPeople(env: Env, accountId: string): Promise<PersonRecord[]> {
  const rows = await env.DB.prepare(`SELECT p.id, p.role, p.display_name, p.consent_status, p.baseline_status, p.source_of_truth, p.bound_account_id,
      (SELECT i.status FROM invitations i WHERE i.invited_person_id = p.id ORDER BY i.created_at DESC LIMIT 1) AS invitation_status,
      (SELECT i.expires_at FROM invitations i WHERE i.invited_person_id = p.id ORDER BY i.created_at DESC LIMIT 1) AS invitation_expires_at,
      CASE WHEN p.bound_account_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM baseline_onboarding bo WHERE bo.account_id = p.bound_account_id AND bo.status = 'ready'
      ) THEN 'ready' ELSE p.baseline_status END AS effective_baseline_status
    FROM persons p WHERE p.account_id = ? ORDER BY p.updated_at DESC`).bind(accountId).all<Record<string, string | null>>();
  return (rows.results ?? []).map((row) => ({
    id: row.id ?? '',
    role: row.role ?? 'relationship',
    displayName: row.display_name ?? 'Unnamed person',
    consentStatus: row.consent_status ?? 'not_requested',
    baselineStatus: row.effective_baseline_status ?? row.baseline_status ?? 'pending',
    invitationStatus: (row.invitation_status as InvitationStatus | null) ?? undefined,
    invitationExpiresAt: row.invitation_expires_at ?? undefined,
    identityBound: Boolean(row.bound_account_id),
    metadata: safeJson(row.source_of_truth ?? '{}')
  }));
}

export async function createPerson(env: Env, accountId: string, input: { displayName: string; role: string; metadata?: RelationshipMetadataInput }): Promise<PersonRecord> {
  const displayName = input.displayName.trim();
  if (!displayName) throw new Response('Display name required', { status: 400 });
  const id = `person_${crypto.randomUUID()}`;
  const metadata = input.metadata ?? {};
  await env.DB.prepare('INSERT INTO persons (id, account_id, role, display_name, source_of_truth, consent_status, baseline_status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, accountId, input.role || 'relationship', displayName, JSON.stringify(metadata), 'not_requested', 'pending').run();
  return { id, role: input.role || 'relationship', displayName, consentStatus: 'not_requested', baselineStatus: 'pending', identityBound: false, metadata };
}

export async function createInvitation(_env: Env, _accountId: string, _personId: string, _actor: string): Promise<{ id: string; status: InvitationStatus }> {
  throw new Response('Invitation email and requested scopes are required. Use the authenticated invitation send endpoint.', { status: 400 });
}

export async function updateInvitationStatus(env: Env, accountId: string, invitationId: string, status: InvitationStatus): Promise<void> {
  if (status !== 'revoked') throw new Response('Only the invited person may accept or decline an invitation. Invitation expiry is handled by the system.', { status: 403 });
  const result = await env.DB.prepare("UPDATE invitations SET status = 'revoked', revoked_at = datetime('now'), token_hash = NULL WHERE id = ? AND account_id = ? AND status = 'pending'")
    .bind(invitationId, accountId).run();
  if (result.meta?.changes === 0) throw new Response('Pending invitation not found', { status: 404 });
}

export async function setConsent(env: Env, accountId: string, personId: string, scope: string, granted: boolean, actor: string, reason?: string): Promise<{ scope: ConsentScope; granted: false }> {
  assertConsentScope(scope);
  await assertPersonOwned(env, accountId, personId);
  if (granted) throw new Response('Only the authenticated invited person may grant consent.', { status: 403 });

  await env.DB.prepare("UPDATE consent_grants SET revoked_at = datetime('now') WHERE person_id = ? AND scope = ? AND revoked_at IS NULL").bind(personId, scope).run();
  const previous = await env.DB.prepare('SELECT MAX(version) AS version FROM consent_versions WHERE person_id = ? AND scope = ?').bind(personId, scope).first<{ version: number | null }>();
  await env.DB.prepare(`INSERT INTO consent_versions
    (id, person_id, scope, version, decision, decided_by, reason, decided_by_account_id, policy_version)
    VALUES (?, ?, ?, ?, 'owner_stopped_use', ?, ?, ?, ?)`).bind(`consentv_${crypto.randomUUID()}`, personId, scope, (previous?.version ?? 0) + 1, actor, reason ?? 'Workspace owner stopped using this scope.', accountId, CONSENT_POLICY_VERSION).run();
  await env.DB.prepare("UPDATE persons SET consent_status = 'owner_stopped_use', updated_at = datetime('now') WHERE id = ? AND account_id = ?").bind(personId, accountId).run();
  return { scope, granted: false };
}

export async function hasConsent(env: Env, accountId: string, personId: string, scope: string): Promise<boolean> {
  assertConsentScope(scope);
  await assertPersonOwned(env, accountId, personId);
  const row = await env.DB.prepare(`SELECT cg.id FROM consent_grants cg
    JOIN persons p ON p.id = cg.person_id
    JOIN invitations i ON i.id = cg.invitation_id AND i.invited_person_id = cg.person_id
    WHERE p.account_id = ? AND cg.person_id = ? AND cg.scope = ?
      AND p.bound_account_id IS NOT NULL
      AND cg.granted_by_account_id = p.bound_account_id
      AND i.accepted_by_account_id = p.bound_account_id
      AND i.status = 'accepted'
      AND cg.granted_at IS NOT NULL AND cg.revoked_at IS NULL
    LIMIT 1`).bind(accountId, personId, scope).first<{ id: string }>();
  return Boolean(row);
}

export async function requireConsent(env: Env, accountId: string, personId: string, scope: ConsentScope): Promise<void> {
  if (!(await hasConsent(env, accountId, personId, scope))) throw new Response('Consent denied', { status: 403 });
}

function safeJson(value: string): RelationshipMetadataInput {
  try { return JSON.parse(value) as RelationshipMetadataInput; } catch { return {}; }
}
