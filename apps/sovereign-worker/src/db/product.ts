import type { Env } from '../env';
import { notifyAccountDeletionChange } from '../account-notifications';
import { getEntitlements, requireFeature } from './entitlements';
import { requireConsent } from './people';

export const FEATURE_KEYS = ['baseline.today', 'baseline.explore', 'people.compare', 'systems.family', 'systems.team', 'library.continuity', 'covenant.lens'] as const;
export type SystemType = 'family' | 'household' | 'friendship_group' | 'team' | 'workplace' | 'custom';

function systemFeature(type: string): 'systems.family' | 'systems.team' {
  return ['family', 'household', 'friendship_group'].includes(type) ? 'systems.family' : 'systems.team';
}

async function requireSystemAccess(env: Env, accountId: string, type: string): Promise<void> {
  requireFeature(await getEntitlements(env, accountId), systemFeature(type));
}

async function requireLibraryAccess(env: Env, accountId: string): Promise<void> {
  requireFeature(await getEntitlements(env, accountId), 'library.continuity');
}

export async function createSystem(env: Env, accountId: string, input: { name: string; systemType: SystemType; metadata?: Record<string, unknown> }) {
  await requireSystemAccess(env, accountId, input.systemType);
  const name = input.name.trim();
  if (!name) throw new Response('System name required', { status: 400 });
  const id = `system_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO systems (id, account_id, system_type, name, metadata_json) VALUES (?, ?, ?, ?, ?)')
    .bind(id, accountId, input.systemType, name, JSON.stringify(input.metadata ?? {})).run();
  return { id, name, systemType: input.systemType, metadata: input.metadata ?? {}, members: [] };
}

export async function listSystems(env: Env, accountId: string) {
  const rows = await env.DB.prepare('SELECT id, system_type, name, metadata_json FROM systems WHERE account_id = ? ORDER BY updated_at DESC')
    .bind(accountId)
    .all<Record<string, string>>();
  const memberRows = await env.DB.prepare(`SELECT sm.system_id, sm.person_id, sm.role_label, sm.is_primary, sm.metadata_json,
      p.display_name, p.bound_account_id
    FROM system_memberships sm
    JOIN systems s ON s.id = sm.system_id
    JOIN persons p ON p.id = sm.person_id AND p.account_id = s.account_id
    WHERE s.account_id = ?
      AND p.bound_account_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM consent_grants cg
        JOIN invitations i ON i.id = cg.invitation_id AND i.invited_person_id = p.id
        WHERE cg.person_id = p.id AND cg.scope = 'system.include'
          AND cg.granted_by_account_id = p.bound_account_id
          AND i.accepted_by_account_id = p.bound_account_id
          AND i.status = 'accepted'
          AND cg.granted_at IS NOT NULL AND cg.revoked_at IS NULL
      )
    ORDER BY sm.is_primary DESC, p.display_name ASC`)
    .bind(accountId)
    .all<Record<string, string | number | null>>();

  const membersBySystem = new Map<string, Array<Record<string, unknown>>>();
  for (const row of memberRows.results ?? []) {
    const systemId = String(row.system_id ?? '');
    if (!systemId) continue;
    const members = membersBySystem.get(systemId) ?? [];
    members.push({
      personId: String(row.person_id ?? ''),
      displayName: String(row.display_name ?? 'Permitted person'),
      roleLabel: String(row.role_label ?? 'member'),
      isPrimary: Number(row.is_primary ?? 0) === 1,
      identityBound: Boolean(row.bound_account_id),
      metadata: parseJson(typeof row.metadata_json === 'string' ? row.metadata_json : null)
    });
    membersBySystem.set(systemId, members);
  }

  return (rows.results ?? [])
    .filter((row): row is Record<string, string> & { id: string } => typeof row.id === 'string' && row.id.length > 0)
    .map((row) => ({
      id: row.id,
      systemType: row.system_type,
      name: row.name,
      metadata: parseJson(row.metadata_json),
      members: membersBySystem.get(row.id) ?? []
    }));
}

export async function addSystemMember(env: Env, accountId: string, systemId: string, personId: string, metadata: Record<string, unknown>) {
  const system = await env.DB.prepare('SELECT id, system_type FROM systems WHERE id = ? AND account_id = ?').bind(systemId, accountId).first<{ id: string; system_type: string }>();
  if (!system) throw new Response('System not found', { status: 404 });
  await requireSystemAccess(env, accountId, system.system_type);
  await requireConsent(env, accountId, personId, 'system.include');
  await env.DB.prepare('INSERT OR REPLACE INTO system_memberships (system_id, person_id, role_label, is_primary, metadata_json) VALUES (?, ?, ?, ?, ?)')
    .bind(systemId, personId, String(metadata.formalRole ?? metadata.informalRole ?? 'member'), metadata.isPrimary === true ? 1 : 0, JSON.stringify(metadata)).run();
  return { systemId, personId, consentChecked: 'system.include' };
}

export function analyzeSystem(type: string) {
  const family = type === 'family' || type === 'household';
  const team = type === 'team' || type === 'workplace';
  return {
    individualAlignment: 'Reduced member context only; no diagnosis or exact inner state is inferred.',
    interactionAlignment: family ? 'Account for history, caregiving, dependence, authority, and contact expectations without defaulting to estrangement.' : 'Map communication friction without assigning hidden intent.',
    roleAlignment: team ? 'Account for formal authority, deadlines, responsibility, handoffs, pace, and decision rights.' : 'Separate informal roles and expectations from actual state.',
    systemAlignment: 'Assess shared objective, constraints, consent, and missing information before recommendations.',
    prohibitedDefaults: ['diagnosis', 'hidden intent', 'automatic estrangement', 'villain assignment']
  };
}

export async function listUnderstandings(env: Env, accountId: string) {
  const rows = await env.DB.prepare('SELECT id, thread_id, kind, body_json, created_at, updated_at FROM saved_understandings WHERE account_id = ? ORDER BY updated_at DESC').bind(accountId).all<Record<string, string>>();
  return (rows.results ?? []).map((row) => ({ id: row.id, threadId: row.thread_id, kind: row.kind, body: parseJson(row.body_json), createdAt: row.created_at, updatedAt: row.updated_at }));
}

export async function saveUnderstanding(env: Env, accountId: string, input: { title: string; summary: string; threadId?: string; links?: Record<string, string>; uncertainty?: string }) {
  await requireLibraryAccess(env, accountId);
  const id = `understanding_${crypto.randomUUID()}`;
  const body = { title: input.title, summary: input.summary, links: input.links ?? {}, uncertainty: input.uncertainty ?? 'medium', retentionStatus: 'active', savedExplicitly: true };
  await env.DB.prepare('INSERT INTO saved_understandings (id, account_id, thread_id, kind, body_json) VALUES (?, ?, ?, ?, ?)').bind(id, accountId, input.threadId ?? null, 'user_approved', JSON.stringify(body)).run();
  return { id, body };
}

export async function updateUnderstanding(env: Env, accountId: string, id: string, patch: Record<string, unknown>) {
  await requireLibraryAccess(env, accountId);
  const row = await env.DB.prepare('SELECT body_json FROM saved_understandings WHERE id = ? AND account_id = ?').bind(id, accountId).first<{ body_json: string }>();
  if (!row) throw new Response('Understanding not found', { status: 404 });
  await env.DB.prepare('UPDATE saved_understandings SET body_json = ?, updated_at = datetime(\'now\') WHERE id = ? AND account_id = ?').bind(JSON.stringify({ ...parseJson(row.body_json), ...patch }), id, accountId).run();
}

export async function deleteUnderstanding(env: Env, accountId: string, id: string) {
  const result = await env.DB.prepare('DELETE FROM saved_understandings WHERE id = ? AND account_id = ?').bind(id, accountId).run();
  if (result.meta?.changes === 0) throw new Response('Understanding not found', { status: 404 });
}

export async function createExportJob(_env: Env, _accountId: string): Promise<never> {
  throw new Response('Private export is not available', { status: 404 });
}

export async function createDeletionJob(env: Env, accountId: string, graceDays = 14) {
  const existing = await env.DB.prepare(`SELECT id FROM deletion_jobs
    WHERE account_id = ? AND status IN ('grace','queued','running')
    ORDER BY requested_at DESC LIMIT 1`)
    .bind(accountId)
    .first<{ id: string }>();
  if (existing) throw new Response('A deletion request is already active', { status: 409 });

  const id = `delete_${crypto.randomUUID()}`;
  const backgroundJobId = `job_${crypto.randomUUID()}`;
  const offset = `+${graceDays} days`;
  const payload = JSON.stringify({ deletionJobId: id });

  await env.DB.prepare('INSERT INTO deletion_jobs (id, account_id, status, scheduled_for) VALUES (?, ?, ?, datetime(\'now\', ?))')
    .bind(id, accountId, 'grace', offset)
    .run();
  await env.DB.prepare(`INSERT INTO background_jobs (id, account_id, kind, status, payload_json, run_after)
    VALUES (?, ?, 'deletion.execute', 'queued', ?, datetime('now', ?))`)
    .bind(backgroundJobId, accountId, payload, offset)
    .run();

  await notifyAccountDeletionChange(env, accountId, { jobId: id, state: 'scheduled', graceDays });
  return { id, status: 'grace', graceDays, backgroundJobId };
}

export async function getActiveDeletionJob(env: Env, accountId: string) {
  const row = await env.DB.prepare(`SELECT id, status, requested_at, scheduled_for
    FROM deletion_jobs
    WHERE account_id = ? AND status IN ('grace','queued','running')
    ORDER BY requested_at DESC LIMIT 1`)
    .bind(accountId)
    .first<{ id: string; status: string; requested_at: string; scheduled_for: string }>();
  return row ? {
    id: row.id,
    status: row.status,
    requestedAt: row.requested_at,
    scheduledFor: row.scheduled_for
  } : null;
}

export async function cancelDeletionJob(env: Env, accountId: string, id: string) {
  const result = await env.DB.prepare('UPDATE deletion_jobs SET status = ? WHERE id = ? AND account_id = ? AND status = ?')
    .bind('cancelled', id, accountId, 'grace')
    .run();
  if (result.meta?.changes === 0) throw new Response('Deletion job not cancellable', { status: 404 });

  await env.DB.prepare(`UPDATE background_jobs SET status = 'cancelled', updated_at = datetime('now')
    WHERE account_id = ? AND kind = 'deletion.execute' AND status = 'queued' AND payload_json = ?`)
    .bind(accountId, JSON.stringify({ deletionJobId: id }))
    .run();
  await notifyAccountDeletionChange(env, accountId, { jobId: id, state: 'cancelled' });
}

export function freeEntitlements() {
  return { plan: 'free', features: Object.fromEntries(FEATURE_KEYS.map((feature) => [feature, ['baseline.today', 'baseline.explore'].includes(feature)])), source: 'deterministic-free-plan' };
}

function parseJson(value?: string | null): Record<string, unknown> {
  try { return value ? JSON.parse(value) as Record<string, unknown> : {}; } catch { return {}; }
}
