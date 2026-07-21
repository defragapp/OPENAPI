import type { Env } from '../env';

export const CONSENT_SCOPES = ['pair.compare', 'system.include', 'trait.display', 'framework.display', 'current_conditions.use', 'library.link', 'covenant.include'] as const;
export type ConsentScope = typeof CONSENT_SCOPES[number];
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';

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
  const rows = await env.DB.prepare('SELECT id, role, display_name, consent_status, baseline_status, source_of_truth FROM persons WHERE account_id = ? ORDER BY updated_at DESC').bind(accountId).all<Record<string, string>>();
  return (rows.results ?? []).map((row) => ({ id: row.id ?? '', role: row.role ?? 'relationship', displayName: row.display_name ?? 'Unnamed person', consentStatus: row.consent_status ?? 'not_requested', baselineStatus: row.baseline_status ?? 'pending', metadata: safeJson(row.source_of_truth ?? '{}') }));
}

export async function createPerson(env: Env, accountId: string, input: { displayName: string; role: string; metadata?: RelationshipMetadataInput }): Promise<PersonRecord> {
  const displayName = input.displayName.trim();
  if (!displayName) throw new Response('Display name required', { status: 400 });
  const id = `person_${crypto.randomUUID()}`;
  const metadata = input.metadata ?? {};
  await env.DB.prepare('INSERT INTO persons (id, account_id, role, display_name, source_of_truth, consent_status, baseline_status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, accountId, input.role || 'relationship', displayName, JSON.stringify(metadata), 'not_requested', 'pending').run();
  return { id, role: input.role || 'relationship', displayName, consentStatus: 'not_requested', baselineStatus: 'pending', metadata };
}

export async function createInvitation(env: Env, accountId: string, personId: string, actor: string): Promise<{ id: string; status: InvitationStatus }> {
  await assertPersonOwned(env, accountId, personId);
  const id = `invite_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO invitations (id, account_id, invited_person_id, status, created_by) VALUES (?, ?, ?, ?, ?)')
    .bind(id, accountId, personId, 'pending', actor).run();
  return { id, status: 'pending' };
}

export async function updateInvitationStatus(env: Env, accountId: string, invitationId: string, status: InvitationStatus): Promise<void> {
  if (!['accepted', 'declined', 'expired', 'revoked'].includes(status)) throw new Response('Invalid invitation status', { status: 400 });
  const column = status === 'accepted' ? 'accepted_at' : 'revoked_at';
  const result = await env.DB.prepare(`UPDATE invitations SET status = ?, ${column} = datetime('now') WHERE id = ? AND account_id = ?`).bind(status, invitationId, accountId).run();
  if (result.meta?.changes === 0) throw new Response('Invitation not found', { status: 404 });
}

export async function setConsent(env: Env, accountId: string, personId: string, scope: string, granted: boolean, actor: string, reason?: string): Promise<{ scope: ConsentScope; granted: boolean }> {
  assertConsentScope(scope);
  await assertPersonOwned(env, accountId, personId);
  await env.DB.prepare('UPDATE consent_grants SET revoked_at = datetime(\'now\') WHERE person_id = ? AND scope = ? AND revoked_at IS NULL').bind(personId, scope).run();
  if (granted) await env.DB.prepare('INSERT INTO consent_grants (id, person_id, scope, granted_at, granted_by) VALUES (?, ?, ?, datetime(\'now\'), ?)').bind(`consent_${crypto.randomUUID()}`, personId, scope, actor).run();
  const previous = await env.DB.prepare('SELECT MAX(version) AS version FROM consent_versions WHERE person_id = ? AND scope = ?').bind(personId, scope).first<{ version: number | null }>();
  await env.DB.prepare('INSERT INTO consent_versions (id, person_id, scope, version, decision, decided_by, reason) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(`consentv_${crypto.randomUUID()}`, personId, scope, (previous?.version ?? 0) + 1, granted ? 'granted' : 'revoked', actor, reason ?? null).run();
  await env.DB.prepare('UPDATE persons SET consent_status = ?, updated_at = datetime(\'now\') WHERE id = ? AND account_id = ?').bind(granted ? 'granted_partial' : 'revoked', personId, accountId).run();
  return { scope, granted };
}

export async function hasConsent(env: Env, accountId: string, personId: string, scope: string): Promise<boolean> {
  assertConsentScope(scope);
  await assertPersonOwned(env, accountId, personId);
  const row = await env.DB.prepare('SELECT cg.id FROM consent_grants cg JOIN persons p ON p.id = cg.person_id WHERE p.account_id = ? AND cg.person_id = ? AND cg.scope = ? AND cg.granted_at IS NOT NULL AND cg.revoked_at IS NULL LIMIT 1').bind(accountId, personId, scope).first<{ id: string }>();
  return Boolean(row);
}

export async function requireConsent(env: Env, accountId: string, personId: string, scope: ConsentScope): Promise<void> {
  if (!(await hasConsent(env, accountId, personId, scope))) throw new Response('Consent denied', { status: 403 });
}

function safeJson(value: string): RelationshipMetadataInput {
  try { return JSON.parse(value) as RelationshipMetadataInput; } catch { return {}; }
}
