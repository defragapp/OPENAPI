import type { Env } from '../env';
import { buildSovereignEmail, sendOperationalEmail } from '../email';
import { notifyInvitationLifecycle } from '../invitation-notifications';
import { getEntitlements, requireFeature } from './entitlements';

export const CONSENT_SCOPES = ['pair.compare', 'system.include', 'trait.display', 'framework.display', 'current_conditions.use', 'library.link', 'covenant.include'] as const;
export type ConsentScope = typeof CONSENT_SCOPES[number];
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';

const CONSENT_POLICY_VERSION = '2026-07-24';
const INVITATION_TTL_DAYS = 7;
const INVITATION_RESEND_SECONDS = 120;
const encoder = new TextEncoder();

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
  source?: string;
}

export interface PersonRecord {
  id: string;
  role: string;
  displayName: string;
  consentStatus: string;
  baselineStatus: string;
  invitationId?: string | undefined;
  invitationStatus?: InvitationStatus | undefined;
  invitationExpiresAt?: string | undefined;
  identityBound: boolean;
  activeScopes: ConsentScope[];
  metadata: RelationshipMetadataInput;
}

function assertConsentScope(scope: string): asserts scope is ConsentScope {
  if (!(CONSENT_SCOPES as readonly string[]).includes(scope)) throw new Response('Unknown consent scope', { status: 400 });
}

async function requirePeopleFeature(env: Env, accountId: string): Promise<void> {
  requireFeature(await getEntitlements(env, accountId), 'people.compare');
}

async function requireScopeFeature(env: Env, accountId: string, scope: ConsentScope): Promise<void> {
  const feature = ({
    'pair.compare': 'people.compare',
    'trait.display': 'people.compare',
    'library.link': 'library.continuity',
    'covenant.include': 'covenant.lens'
  } as Partial<Record<ConsentScope, string>>)[scope];
  if (feature) requireFeature(await getEntitlements(env, accountId), feature);
}

async function assertPersonOwned(env: Env, accountId: string, personId: string): Promise<void> {
  const row = await env.DB.prepare('SELECT id FROM persons WHERE id = ? AND account_id = ?').bind(personId, accountId).first<{ id: string }>();
  if (!row) throw new Response('Person not found', { status: 404 });
}

export async function listPeople(env: Env, accountId: string): Promise<PersonRecord[]> {
  const rows = await env.DB.prepare(`SELECT p.id, p.role, p.display_name, p.consent_status, p.baseline_status, p.source_of_truth, p.bound_account_id,
      (SELECT i.id FROM invitations i WHERE i.invited_person_id = p.id ORDER BY i.created_at DESC LIMIT 1) AS invitation_id,
      (SELECT i.status FROM invitations i WHERE i.invited_person_id = p.id ORDER BY i.created_at DESC LIMIT 1) AS invitation_status,
      (SELECT i.expires_at FROM invitations i WHERE i.invited_person_id = p.id ORDER BY i.created_at DESC LIMIT 1) AS invitation_expires_at,
      CASE WHEN p.bound_account_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM baseline_onboarding bo WHERE bo.account_id = p.bound_account_id AND bo.status IN ('ready', 'completed')
      ) THEN 'ready' ELSE p.baseline_status END AS effective_baseline_status
    FROM persons p WHERE p.account_id = ? ORDER BY p.updated_at DESC`).bind(accountId).all<Record<string, string | null>>();

  const activeRows = await env.DB.prepare(`SELECT cg.person_id, cg.scope FROM consent_grants cg
      JOIN persons p ON p.id = cg.person_id
      JOIN invitations i ON i.id = cg.invitation_id
      WHERE p.account_id = ? AND p.bound_account_id IS NOT NULL
        AND cg.granted_by_account_id = p.bound_account_id
        AND i.accepted_by_account_id = p.bound_account_id
        AND i.status = 'accepted'
        AND cg.granted_at IS NOT NULL AND cg.revoked_at IS NULL
      ORDER BY cg.person_id, cg.scope`).bind(accountId).all<{ person_id: string; scope: string }>();
  const scopesByPerson = new Map<string, ConsentScope[]>();
  for (const grant of activeRows.results ?? []) {
    if (!(CONSENT_SCOPES as readonly string[]).includes(grant.scope)) continue;
    const current = scopesByPerson.get(grant.person_id) ?? [];
    current.push(grant.scope as ConsentScope);
    scopesByPerson.set(grant.person_id, current);
  }

  return (rows.results ?? []).map((row) => ({
    id: row.id ?? '',
    role: row.role ?? 'relationship',
    displayName: row.display_name ?? 'Unnamed person',
    consentStatus: row.consent_status ?? 'not_requested',
    baselineStatus: row.effective_baseline_status ?? row.baseline_status ?? 'pending',
    invitationId: row.invitation_id ?? undefined,
    invitationStatus: (row.invitation_status as InvitationStatus | null) ?? undefined,
    invitationExpiresAt: row.invitation_expires_at ?? undefined,
    identityBound: Boolean(row.bound_account_id),
    activeScopes: scopesByPerson.get(row.id ?? '') ?? [],
    metadata: safeJson(row.source_of_truth ?? '{}')
  }));
}

export async function createPerson(env: Env, accountId: string, input: { displayName: string; role: string; metadata?: RelationshipMetadataInput }): Promise<PersonRecord> {
  await requirePeopleFeature(env, accountId);
  const displayName = input.displayName.trim();
  if (!displayName) throw new Response('Display name required', { status: 400 });
  const id = `person_${crypto.randomUUID()}`;
  const metadata = input.metadata ?? {};
  await env.DB.prepare('INSERT INTO persons (id, account_id, role, display_name, source_of_truth, consent_status, baseline_status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, accountId, input.role || 'relationship', displayName, JSON.stringify(metadata), 'not_requested', 'pending').run();
  return { id, role: input.role || 'relationship', displayName, consentStatus: 'not_requested', baselineStatus: 'pending', identityBound: false, activeScopes: [], metadata };
}

export async function removePerson(env: Env, accountId: string, personId: string): Promise<void> {
  const result = await env.DB.prepare('DELETE FROM persons WHERE id = ? AND account_id = ?').bind(personId, accountId).run();
  if ((result.meta?.changes ?? 0) === 0) throw new Response('Person not found', { status: 404 });
}

export async function createInvitation(_env: Env, _accountId: string, _personId: string, _actor: string): Promise<{ id: string; status: InvitationStatus }> {
  throw new Response('Invitation email and requested scopes are required. Use the authenticated invitation send endpoint.', { status: 400 });
}

export async function updateInvitationStatus(env: Env, accountId: string, invitationId: string, status: InvitationStatus): Promise<void> {
  if (status === 'pending') {
    await resendPendingInvitation(env, accountId, invitationId);
    return;
  }
  if (status !== 'revoked') throw new Response('Only the invited person may accept or decline an invitation. Invitation expiry is handled by the system.', { status: 403 });
  const result = await env.DB.prepare("UPDATE invitations SET status = 'revoked', revoked_at = datetime('now'), token_hash = NULL WHERE id = ? AND account_id = ? AND status = 'pending'")
    .bind(invitationId, accountId).run();
  if ((result.meta?.changes ?? 0) === 0) throw new Response('Pending invitation not found', { status: 404 });
  await notifyInvitationLifecycle(env, { invitationId, kind: 'revoked' });
}

export async function setConsent(env: Env, accountId: string, personId: string, scope: string, granted: boolean, actor: string, reason?: string): Promise<{ scope: ConsentScope; granted: false }> {
  assertConsentScope(scope);
  await assertPersonOwned(env, accountId, personId);
  if (granted) throw new Response('Only the authenticated invited person may grant consent.', { status: 403 });

  await env.DB.prepare("UPDATE consent_grants SET revoked_at = datetime('now') WHERE person_id = ? AND scope = ? AND revoked_at IS NULL").bind(personId, scope).run();
  const previous = await env.DB.prepare('SELECT MAX(version) AS version FROM consent_versions WHERE person_id = ? AND scope = ?').bind(personId, scope).first<{ version: number | null }>();
  await env.DB.prepare(`INSERT INTO consent_versions
    (id, person_id, scope, version, decision, decided_by, reason, decided_by_account_id, policy_version)
    VALUES (?, ?, ?, ?, 'owner_stopped_use', ?, ?, ?, ?)`).bind(`consentv_${crypto.randomUUID()}`, personId, scope, (previous?.version ?? 0) + 1, actor, reason ?? 'Account owner stopped using this scope.', accountId, CONSENT_POLICY_VERSION).run();
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
  await requireScopeFeature(env, accountId, scope);
  if (!(await hasConsent(env, accountId, personId, scope))) {
    throw Response.json({
      type: 'https://sovereign.app/problems/permission-denied',
      error: 'permission_denied',
      scope,
      message: 'This person has not granted the required permission, or the permission was revoked. Their private data remains unavailable.',
      nextAction: 'review_permissions',
      retryable: false
    }, {
      status: 403,
      headers: { 'cache-control': 'private, no-store' }
    });
  }
}

async function resendPendingInvitation(env: Env, accountId: string, invitationId: string): Promise<void> {
  const row = await env.DB.prepare(`SELECT i.id, i.invited_email_normalized, i.requested_scopes_json, i.created_at, i.token_hash, i.expires_at
    FROM invitations i JOIN persons p ON p.id = i.invited_person_id
    WHERE i.id = ? AND i.account_id = ? AND p.account_id = ? AND i.status = 'pending'`)
    .bind(invitationId, accountId, accountId)
    .first<{
      id: string;
      invited_email_normalized: string | null;
      requested_scopes_json: string | null;
      created_at: string;
      token_hash: string | null;
      expires_at: string;
    }>();
  if (!row) throw new Response('Pending invitation not found', { status: 404 });
  const createdAt = Date.parse(row.created_at.replace(' ', 'T') + 'Z');
  const retryAfter = Math.max(0, INVITATION_RESEND_SECONDS - Math.floor((Date.now() - createdAt) / 1000));
  if (retryAfter > 0) throw Response.json({ error: 'Invitation was sent recently.', retryAfterSeconds: retryAfter }, { status: 429, headers: { 'retry-after': String(retryAfter) } });
  const email = row.invited_email_normalized?.trim().toLowerCase() ?? '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Response('Invitation email is unavailable', { status: 409 });

  const requestedScopes = parseScopes(row.requested_scopes_json);
  const token = newToken();
  const tokenHash = await sha256(token);
  const invitationUrl = new URL('/invitation', env.PUBLIC_APP_URL || 'https://app.sovereign.app');
  invitationUrl.searchParams.set('token', token);
  const updated = await env.DB.prepare(`UPDATE invitations
    SET token_hash = ?, expires_at = datetime('now', '+${INVITATION_TTL_DAYS} days'), created_at = datetime('now'), revoked_at = NULL
    WHERE id = ? AND account_id = ? AND status = 'pending' AND created_at = ?`)
    .bind(tokenHash, invitationId, accountId, row.created_at)
    .run();
  if ((updated.meta?.changes ?? 0) !== 1) throw new Response('Invitation changed before it could be resent', { status: 409 });

  const template = buildSovereignEmail({
    eyebrow: 'Private relationship invitation',
    title: 'You decide what this connection may use.',
    intro: 'A Sovereign.OS user resent a private relationship invitation. Accepting does not grant blanket access. You decide each requested use separately.',
    actionLabel: 'Review the private invitation',
    actionUrl: invitationUrl.toString(),
    details: [
      `This new link expires in ${INVITATION_TTL_DAYS} days and replaces the previous link.`,
      'Raw birth details, exact private location, and the sender’s private notes are not included in this email.',
      ...requestedScopes.map((scope) => scope.replace(/[._]/g, ' '))
    ],
    footer: 'You can deny any requested use and revoke an active permission later from your own Sovereign.OS controls.'
  });

  try {
    await sendOperationalEmail(env, {
      to: email,
      subject: 'Review a private Sovereign.OS invitation',
      ...template,
      idempotencyKey: `${invitationId}:resend:${tokenHash.slice(0, 16)}`,
      category: 'relationship_invitation_resend'
    });
  } catch (error) {
    await env.DB.prepare(`UPDATE invitations
      SET token_hash = ?, expires_at = ?, created_at = ?
      WHERE id = ? AND account_id = ? AND status = 'pending' AND token_hash = ?`)
      .bind(row.token_hash, row.expires_at, row.created_at, invitationId, accountId, tokenHash)
      .run();
    throw error;
  }
}

function newToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function parseScopes(value?: string | null): ConsentScope[] {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((scope): scope is ConsentScope => (CONSENT_SCOPES as readonly string[]).includes(String(scope))) : [];
  } catch {
    return [];
  }
}

function safeJson(value: string): RelationshipMetadataInput {
  try { return JSON.parse(value) as RelationshipMetadataInput; } catch { return {}; }
}
