import type { Env } from '../env';
import { sendOperationalEmail } from '../email';
import { resolveAccount } from './accounts';
import { createSignedSessionToken } from '../security/auth';

export const CONSENT_SCOPES = ['pair.compare', 'system.include', 'trait.display', 'framework.display', 'current_conditions.use', 'library.link', 'covenant.include'] as const;
export type ConsentScope = typeof CONSENT_SCOPES[number];
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';

const encoder = new TextEncoder();
const INVITATION_TTL_DAYS = 7;
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const CONSENT_POLICY_VERSION = '2026-07-24';
const DEFAULT_INVITATION_SCOPES: ConsentScope[] = ['pair.compare', 'trait.display'];

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

export interface InvitationRecord {
  id: string;
  personId: string;
  displayName: string;
  status: InvitationStatus;
  requestedScopes: ConsentScope[];
  expiresAt: string;
  policyVersion: string;
}

function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }
function validEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
async function sha256(value: string): Promise<string> { const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value)); return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join(''); }
function base64Url(bytes: Uint8Array): string { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function newToken(): string { const bytes = new Uint8Array(32); crypto.getRandomValues(bytes); return base64Url(bytes); }
function publicBaseUrl(request: Request, env: Env): string { return env.PUBLIC_APP_URL || new URL(request.url).origin; }
function sessionCookie(value: string): string { return `__Host-sovereign_session=${value}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`; }

function assertConsentScope(scope: string): asserts scope is ConsentScope {
  if (!(CONSENT_SCOPES as readonly string[]).includes(scope)) throw new Response('Unknown consent scope', { status: 400 });
}

function normalizeScopes(scopes?: string[]): ConsentScope[] {
  const source = scopes?.length ? scopes : DEFAULT_INVITATION_SCOPES;
  const normalized = [...new Set(source)];
  for (const scope of normalized) assertConsentScope(scope);
  return normalized as ConsentScope[];
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

export async function createInvitation(request: Request, env: Env, accountId: string, personId: string, actor: string, input: { email: string; requestedScopes?: string[] }): Promise<{ id: string; status: InvitationStatus; requestedScopes: ConsentScope[]; expiresInDays: number }> {
  await assertPersonOwned(env, accountId, personId);
  const email = normalizeEmail(input.email);
  if (!validEmail(email)) throw new Response('Valid invitation email required', { status: 400 });
  if (actor === `email:${email}`) throw new Response('Invite another person, not your own account.', { status: 400 });
  const requestedScopes = normalizeScopes(input.requestedScopes);
  const existing = await env.DB.prepare("SELECT id FROM invitations WHERE invited_person_id = ? AND status = 'pending' AND expires_at > datetime('now') LIMIT 1").bind(personId).first<{ id: string }>();
  if (existing) throw new Response('A pending invitation already exists for this person.', { status: 409 });

  const token = newToken();
  const tokenHash = await sha256(token);
  const emailHash = await sha256(email);
  const id = `invite_${crypto.randomUUID()}`;
  await env.DB.prepare(`INSERT INTO invitations
      (id, account_id, invited_person_id, email_hash, status, created_by, invited_email_normalized, token_hash, expires_at, requested_scopes_json, policy_version)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, datetime('now', '+${INVITATION_TTL_DAYS} days'), ?, ?)`)
    .bind(id, accountId, personId, emailHash, actor, email, tokenHash, JSON.stringify(requestedScopes), CONSENT_POLICY_VERSION).run();

  const url = `${publicBaseUrl(request, env)}/invitation?token=${encodeURIComponent(token)}`;
  try {
    await sendOperationalEmail(env, {
      to: email,
      subject: 'A private Sovereign.OS invitation',
      text: `You were invited to share selected Baseline context in Sovereign.OS. Review the request and decide each scope yourself. This one-time link expires in ${INVITATION_TTL_DAYS} days: ${url}`,
      idempotencyKey: id
    });
  } catch (error) {
    await env.DB.prepare("UPDATE invitations SET status = 'revoked', revoked_at = datetime('now'), token_hash = NULL WHERE id = ? AND status = 'pending'").bind(id).run();
    throw error;
  }
  await env.DB.prepare("UPDATE persons SET consent_status = 'requested', updated_at = datetime('now') WHERE id = ? AND account_id = ?").bind(personId, accountId).run();
  return { id, status: 'pending', requestedScopes, expiresInDays: INVITATION_TTL_DAYS };
}

export async function previewInvitation(request: Request, env: Env): Promise<InvitationRecord> {
  const token = invitationToken(request);
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(`SELECT i.id, i.invited_person_id, i.status, i.expires_at, i.requested_scopes_json, i.policy_version, p.display_name
    FROM invitations i JOIN persons p ON p.id = i.invited_person_id WHERE i.token_hash = ?`).bind(tokenHash).first<Record<string, string | null>>();
  if (!row) throw new Response('Invitation not found', { status: 404 });
  if (row.status !== 'pending') throw new Response('Invitation is no longer active', { status: 409 });
  if (!row.expires_at || Date.parse(row.expires_at.replace(' ', 'T') + 'Z') <= Date.now()) {
    await env.DB.prepare("UPDATE invitations SET status = 'expired', token_hash = NULL WHERE id = ? AND status = 'pending'").bind(row.id).run();
    throw new Response('Invitation expired', { status: 410 });
  }
  return {
    id: row.id ?? '',
    personId: row.invited_person_id ?? '',
    displayName: row.display_name ?? 'Shared relationship',
    status: 'pending',
    requestedScopes: parseScopes(row.requested_scopes_json),
    expiresAt: row.expires_at,
    policyVersion: row.policy_version ?? CONSENT_POLICY_VERSION
  };
}

export async function redeemInvitation(request: Request, env: Env): Promise<Response> {
  const token = invitationToken(request);
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(`SELECT i.id, i.invited_person_id, i.invited_email_normalized, i.status, i.expires_at, i.requested_scopes_json, i.policy_version, p.display_name
    FROM invitations i JOIN persons p ON p.id = i.invited_person_id WHERE i.token_hash = ?`).bind(tokenHash).first<Record<string, string | null>>();
  if (!row) return Response.json({ status: 'invalid' }, { status: 400 });
  if (row.status !== 'pending') return Response.json({ status: 'already used' }, { status: 409 });
  if (!row.expires_at || Date.parse(row.expires_at.replace(' ', 'T') + 'Z') <= Date.now()) {
    await env.DB.prepare("UPDATE invitations SET status = 'expired', token_hash = NULL WHERE id = ? AND status = 'pending'").bind(row.id).run();
    return Response.json({ status: 'expired' }, { status: 410 });
  }
  const email = row.invited_email_normalized ?? '';
  if (!validEmail(email)) return Response.json({ status: 'invalid' }, { status: 400 });
  const subject = `email:${email}`;
  const account = await resolveAccount(env, subject);
  const redeemed = await env.DB.prepare(`UPDATE invitations SET status = 'accepted', accepted_at = datetime('now'), accepted_by_account_id = ?, accepted_subject = ?, token_hash = NULL
    WHERE id = ? AND token_hash = ? AND status = 'pending' AND expires_at > datetime('now')`)
    .bind(account.accountId, subject, row.id, tokenHash).run();
  if ((redeemed.meta?.changes ?? 0) === 0) return Response.json({ status: 'already used' }, { status: 409 });
  await env.DB.prepare("UPDATE persons SET bound_account_id = ?, consent_status = 'awaiting_decision', updated_at = datetime('now') WHERE id = ?")
    .bind(account.accountId, row.invited_person_id).run();

  const sessionId = `session_${crypto.randomUUID()}`;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const sessionToken = await createSignedSessionToken({ sub: subject, exp, sid: sessionId }, env.SESSION_SIGNING_SECRET);
  await env.DB.prepare("INSERT INTO auth_sessions (id, account_id, subject, session_hash, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+30 days'))")
    .bind(sessionId, account.accountId, subject, await sha256(sessionToken)).run();
  return Response.json({
    status: 'accepted',
    invitation: {
      id: row.id,
      personId: row.invited_person_id,
      displayName: row.display_name,
      requestedScopes: parseScopes(row.requested_scopes_json),
      policyVersion: row.policy_version ?? CONSENT_POLICY_VERSION
    }
  }, { headers: { 'set-cookie': sessionCookie(sessionToken) } });
}

export async function listInviteeInvitations(env: Env, accountId: string): Promise<InvitationRecord[]> {
  const rows = await env.DB.prepare(`SELECT i.id, i.invited_person_id, i.status, i.expires_at, i.requested_scopes_json, i.policy_version, p.display_name
    FROM invitations i JOIN persons p ON p.id = i.invited_person_id
    WHERE i.accepted_by_account_id = ? AND i.status = 'accepted' ORDER BY i.accepted_at DESC`).bind(accountId).all<Record<string, string | null>>();
  return (rows.results ?? []).map((row) => ({
    id: row.id ?? '',
    personId: row.invited_person_id ?? '',
    displayName: row.display_name ?? 'Shared relationship',
    status: 'accepted',
    requestedScopes: parseScopes(row.requested_scopes_json),
    expiresAt: row.expires_at ?? '',
    policyVersion: row.policy_version ?? CONSENT_POLICY_VERSION
  }));
}

export async function decideInviteeConsent(env: Env, accountId: string, invitationId: string, scope: string, granted: boolean, actor: string, reason?: string): Promise<{ scope: ConsentScope; granted: boolean; policyVersion: string }> {
  assertConsentScope(scope);
  const invitation = await env.DB.prepare(`SELECT id, invited_person_id, requested_scopes_json, policy_version FROM invitations
    WHERE id = ? AND accepted_by_account_id = ? AND accepted_subject = ? AND status = 'accepted'`).bind(invitationId, accountId, actor).first<Record<string, string | null>>();
  if (!invitation) throw new Response('Invitation not found for this account', { status: 404 });
  const requestedScopes = parseScopes(invitation.requested_scopes_json);
  if (!requestedScopes.includes(scope)) throw new Response('This scope was not requested', { status: 403 });
  const personId = invitation.invited_person_id ?? '';
  const policyVersion = invitation.policy_version ?? CONSENT_POLICY_VERSION;

  await env.DB.prepare("UPDATE consent_grants SET revoked_at = datetime('now') WHERE person_id = ? AND scope = ? AND revoked_at IS NULL").bind(personId, scope).run();
  if (granted) {
    await env.DB.prepare(`INSERT INTO consent_grants
      (id, person_id, scope, granted_at, granted_by, invitation_id, granted_by_account_id, policy_version)
      VALUES (?, ?, ?, datetime('now'), ?, ?, ?, ?)`).bind(`consent_${crypto.randomUUID()}`, personId, scope, `invitee:${actor}`, invitationId, accountId, policyVersion).run();
  }
  const previous = await env.DB.prepare('SELECT MAX(version) AS version FROM consent_versions WHERE person_id = ? AND scope = ?').bind(personId, scope).first<{ version: number | null }>();
  await env.DB.prepare(`INSERT INTO consent_versions
    (id, person_id, scope, version, decision, decided_by, reason, invitation_id, decided_by_account_id, policy_version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(`consentv_${crypto.randomUUID()}`, personId, scope, (previous?.version ?? 0) + 1, granted ? 'granted' : 'denied', actor, reason ?? null, invitationId, accountId, policyVersion).run();
  await env.DB.prepare("UPDATE persons SET consent_status = 'decision_recorded', updated_at = datetime('now') WHERE id = ? AND bound_account_id = ?").bind(personId, accountId).run();
  return { scope, granted, policyVersion };
}

export async function updateInvitationStatus(env: Env, accountId: string, invitationId: string, status: InvitationStatus): Promise<void> {
  if (status !== 'revoked') {
    throw new Response('Only the invited person may accept or decline an invitation. Invitation expiry is handled by the system.', { status: 403 });
  }
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

function invitationToken(request: Request): string {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) throw new Response('Invitation token required', { status: 400 });
  return token;
}

function parseScopes(value: string | null | undefined): ConsentScope[] {
  try {
    const parsed = JSON.parse(value ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((scope): scope is ConsentScope => typeof scope === 'string' && (CONSENT_SCOPES as readonly string[]).includes(scope));
  } catch { return []; }
}

function safeJson(value: string): RelationshipMetadataInput {
  try { return JSON.parse(value) as RelationshipMetadataInput; } catch { return {}; }
}
