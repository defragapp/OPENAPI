import type { Env } from './env';
import { buildSovereignEmail, sendOperationalEmail } from './email';
import { resolveAccount } from './db/accounts';
import { createSignedSessionToken } from './security/auth';
import { CONSENT_SCOPES, type ConsentScope, type InvitationStatus } from './db/people';

const encoder = new TextEncoder();
const INVITATION_TTL_DAYS = 7;
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const CONSENT_POLICY_VERSION = '2026-07-24';
const DEFAULT_INVITATION_SCOPES: ConsentScope[] = ['pair.compare', 'trait.display'];

const consentScopeEmailLabels: Record<ConsentScope, string> = {
  'pair.compare': 'Compare two permitted Baselines while keeping each person distinct.',
  'system.include': 'Include this person in a family, household, friendship, or team view.',
  'trait.display': 'Use only the plain-language Baseline themes this person chooses to share.',
  'framework.display': 'Show optional supporting framework detail.',
  'current_conditions.use': 'Include temporary current context when permission remains active.',
  'library.link': 'Use a deliberately saved understanding as shared context.',
  'covenant.include': 'Include this person only when the optional Covenant lens is selected.'
};

type ConsentDecision = 'granted' | 'denied';

export interface InvitationRecord {
  id: string;
  personId: string;
  displayName: string;
  status: InvitationStatus;
  requestedScopes: ConsentScope[];
  decisions: Partial<Record<ConsentScope, ConsentDecision>>;
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

async function getOwnedPerson(env: Env, accountId: string, personId: string): Promise<{ id: string; bound_account_id: string | null; display_name: string }> {
  const row = await env.DB.prepare('SELECT id, bound_account_id, display_name FROM persons WHERE id = ? AND account_id = ?').bind(personId, accountId).first<{ id: string; bound_account_id: string | null; display_name: string }>();
  if (!row) throw new Response('Person not found', { status: 404 });
  return row;
}

export async function sendInvitation(request: Request, env: Env, accountId: string, personId: string, actor: string, input: { email: string; requestedScopes?: string[] }): Promise<{ id: string; status: InvitationStatus; requestedScopes: ConsentScope[]; expiresInDays: number }> {
  const person = await getOwnedPerson(env, accountId, personId);
  if (person.bound_account_id) throw new Response('This person is already bound to a verified account. Remove the relationship before inviting a different identity.', { status: 409 });
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

  const baseUrl = publicBaseUrl(request, env);
  const invitationUrl = new URL('/invitation', baseUrl);
  invitationUrl.searchParams.set('token', token);
  const emailTemplate = buildSovereignEmail({
    eyebrow: 'Private relationship invitation',
    title: 'You decide what this connection may use.',
    intro: `A Sovereign.OS user invited you to review a connection recorded as “${person.display_name || 'Shared relationship'}.” Accepting the invitation does not grant blanket access. You decide each requested use separately.`,
    actionLabel: 'Review the private invitation',
    actionUrl: invitationUrl.toString(),
    details: [
      ...requestedScopes.map((scope) => consentScopeEmailLabels[scope]),
      `The invitation expires in ${INVITATION_TTL_DAYS} days.`,
      'Raw birth details and exact private location are not shared with the other account.'
    ],
    footer: 'You can deny any requested use and revoke an active permission later from your own Sovereign.OS controls.'
  });
  try {
    await sendOperationalEmail(env, {
      to: email,
      subject: 'Review a private Sovereign.OS invitation',
      ...emailTemplate,
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
  if (!row.expires_at || sqliteTime(row.expires_at) <= Date.now()) {
    await env.DB.prepare("UPDATE invitations SET status = 'expired', token_hash = NULL WHERE id = ? AND status = 'pending'").bind(row.id).run();
    throw new Response('Invitation expired', { status: 410 });
  }
  return {
    id: row.id ?? '',
    personId: row.invited_person_id ?? '',
    displayName: row.display_name ?? 'Shared relationship',
    status: 'pending',
    requestedScopes: parseScopes(row.requested_scopes_json),
    decisions: {},
    expiresAt: row.expires_at,
    policyVersion: row.policy_version ?? CONSENT_POLICY_VERSION
  };
}

export async function redeemInvitation(request: Request, env: Env): Promise<Response> {
  const token = invitationToken(request);
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(`SELECT i.id, i.invited_person_id, i.invited_email_normalized, i.status, i.expires_at, i.requested_scopes_json, i.policy_version, p.display_name, p.bound_account_id
    FROM invitations i JOIN persons p ON p.id = i.invited_person_id WHERE i.token_hash = ?`).bind(tokenHash).first<Record<string, string | null>>();
  if (!row) return Response.json({ status: 'invalid' }, { status: 400 });
  if (row.status !== 'pending') return Response.json({ status: 'already used' }, { status: 409 });
  if (row.bound_account_id) return Response.json({ status: 'identity already bound' }, { status: 409 });
  if (!row.expires_at || sqliteTime(row.expires_at) <= Date.now()) {
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
  const bound = await env.DB.prepare("UPDATE persons SET bound_account_id = ?, consent_status = 'awaiting_decision', updated_at = datetime('now') WHERE id = ? AND bound_account_id IS NULL")
    .bind(account.accountId, row.invited_person_id).run();
  if ((bound.meta?.changes ?? 0) === 0) {
    await env.DB.prepare("UPDATE invitations SET status = 'revoked', revoked_at = datetime('now') WHERE id = ? AND accepted_by_account_id = ?").bind(row.id, account.accountId).run();
    return Response.json({ status: 'identity already bound' }, { status: 409 });
  }

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
      decisions: {},
      policyVersion: row.policy_version ?? CONSENT_POLICY_VERSION
    }
  }, { headers: { 'set-cookie': sessionCookie(sessionToken) } });
}

export async function listInviteeInvitations(env: Env, accountId: string): Promise<InvitationRecord[]> {
  const rows = await env.DB.prepare(`SELECT i.id, i.invited_person_id, i.status, i.expires_at, i.requested_scopes_json, i.policy_version, p.display_name
    FROM invitations i JOIN persons p ON p.id = i.invited_person_id
    WHERE i.accepted_by_account_id = ? AND i.status = 'accepted' ORDER BY i.accepted_at DESC`).bind(accountId).all<Record<string, string | null>>();
  const invitations: InvitationRecord[] = [];
  for (const row of rows.results ?? []) {
    const id = row.id ?? '';
    invitations.push({
      id,
      personId: row.invited_person_id ?? '',
      displayName: row.display_name ?? 'Shared relationship',
      status: 'accepted',
      requestedScopes: parseScopes(row.requested_scopes_json),
      decisions: await currentDecisions(env, id, accountId),
      expiresAt: row.expires_at ?? '',
      policyVersion: row.policy_version ?? CONSENT_POLICY_VERSION
    });
  }
  return invitations;
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

async function currentDecisions(env: Env, invitationId: string, accountId: string): Promise<Partial<Record<ConsentScope, ConsentDecision>>> {
  const rows = await env.DB.prepare(`SELECT cv.scope, cv.decision FROM consent_versions cv
    JOIN (
      SELECT scope, MAX(version) AS version FROM consent_versions
      WHERE invitation_id = ? AND decided_by_account_id = ? GROUP BY scope
    ) latest ON latest.scope = cv.scope AND latest.version = cv.version
    WHERE cv.invitation_id = ? AND cv.decided_by_account_id = ?`)
    .bind(invitationId, accountId, invitationId, accountId)
    .all<{ scope: string; decision: string }>();
  const decisions: Partial<Record<ConsentScope, ConsentDecision>> = {};
  for (const row of rows.results ?? []) {
    if ((CONSENT_SCOPES as readonly string[]).includes(row.scope) && (row.decision === 'granted' || row.decision === 'denied')) {
      decisions[row.scope as ConsentScope] = row.decision;
    }
  }
  return decisions;
}

function invitationToken(request: Request): string {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) throw new Response('Invitation token required', { status: 400 });
  return token;
}

function sqliteTime(value: string): number {
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  return Date.parse(normalized);
}

function parseScopes(value: string | null | undefined): ConsentScope[] {
  try {
    const parsed = JSON.parse(value ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((scope): scope is ConsentScope => typeof scope === 'string' && (CONSENT_SCOPES as readonly string[]).includes(scope));
  } catch { return []; }
}
