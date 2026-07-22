import type { Env } from '../env';
import { requireConsent } from './people';

export const FEATURE_KEYS = ['baseline.today', 'baseline.explore', 'people.compare', 'systems.family', 'systems.team', 'library.continuity', 'covenant.lens', 'export.full'] as const;
export type SystemType = 'family' | 'household' | 'friendship_group' | 'team' | 'workplace' | 'custom';

export async function createSystem(env: Env, accountId: string, input: { name: string; systemType: SystemType; metadata?: Record<string, unknown> }) {
  const name = input.name.trim();
  if (!name) throw new Response('System name required', { status: 400 });
  const id = `system_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO systems (id, account_id, system_type, name, metadata_json) VALUES (?, ?, ?, ?, ?)')
    .bind(id, accountId, input.systemType, name, JSON.stringify(input.metadata ?? {})).run();
  return { id, name, systemType: input.systemType, metadata: input.metadata ?? {} };
}

export async function listSystems(env: Env, accountId: string) {
  const rows = await env.DB.prepare('SELECT id, system_type, name, metadata_json FROM systems WHERE account_id = ? ORDER BY updated_at DESC').bind(accountId).all<Record<string, string>>();
  return (rows.results ?? []).map((row) => ({ id: row.id, systemType: row.system_type, name: row.name, metadata: parseJson(row.metadata_json) }));
}

export async function addSystemMember(env: Env, accountId: string, systemId: string, personId: string, metadata: Record<string, unknown>) {
  const system = await env.DB.prepare('SELECT id FROM systems WHERE id = ? AND account_id = ?').bind(systemId, accountId).first<{ id: string }>();
  if (!system) throw new Response('System not found', { status: 404 });
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
  const linkedPersonId = input.links?.personId;
  if (linkedPersonId) await requireConsent(env, accountId, linkedPersonId, 'library.link');
  const id = `understanding_${crypto.randomUUID()}`;
  const body = { title: input.title, summary: input.summary, links: input.links ?? {}, uncertainty: input.uncertainty ?? 'medium', retentionStatus: 'active', savedExplicitly: true };
  await env.DB.prepare('INSERT INTO saved_understandings (id, account_id, thread_id, kind, body_json) VALUES (?, ?, ?, ?, ?)').bind(id, accountId, input.threadId ?? null, 'user_approved', JSON.stringify(body)).run();
  return { id, body };
}

export async function updateUnderstanding(env: Env, accountId: string, id: string, patch: Record<string, unknown>) {
  const row = await env.DB.prepare('SELECT body_json FROM saved_understandings WHERE id = ? AND account_id = ?').bind(id, accountId).first<{ body_json: string }>();
  if (!row) throw new Response('Understanding not found', { status: 404 });
  await env.DB.prepare('UPDATE saved_understandings SET body_json = ?, updated_at = datetime(\'now\') WHERE id = ? AND account_id = ?').bind(JSON.stringify({ ...parseJson(row.body_json), ...patch }), id, accountId).run();
}

export async function deleteUnderstanding(env: Env, accountId: string, id: string) {
  const result = await env.DB.prepare('DELETE FROM saved_understandings WHERE id = ? AND account_id = ?').bind(id, accountId).run();
  if (result.meta?.changes === 0) throw new Response('Understanding not found', { status: 404 });
}

export async function createExportJob(env: Env, accountId: string) {
  const id = `export_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO export_jobs (id, account_id, status, expires_at) VALUES (?, ?, ?, datetime(\'now\', \'+7 days\'))').bind(id, accountId, 'queued').run();
  return { id, status: 'queued', excludes: ['secrets', 'authorization material', 'hidden reasoning', 'unconsented protected data', 'raw provider payloads', 'exact private location'] };
}

export async function createDeletionJob(env: Env, accountId: string, graceDays = 14) {
  const id = `delete_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO deletion_jobs (id, account_id, status, scheduled_for) VALUES (?, ?, ?, datetime(\'now\', ?))').bind(id, accountId, 'grace', `+${graceDays} days`).run();
  return { id, status: 'grace', graceDays };
}

export async function cancelDeletionJob(env: Env, accountId: string, id: string) {
  const result = await env.DB.prepare('UPDATE deletion_jobs SET status = ? WHERE id = ? AND account_id = ? AND status = ?').bind('cancelled', id, accountId, 'grace').run();
  if (result.meta?.changes === 0) throw new Response('Deletion job not cancellable', { status: 404 });
}

export function freeEntitlements() {
  return { plan: 'free', features: Object.fromEntries(FEATURE_KEYS.map((feature) => [feature, ['baseline.today', 'baseline.explore'].includes(feature)])), limits: { sovereignTurnsPerMonth: 20, libraryItems: 5, exploreTopics: 3 }, source: 'deterministic-free-plan' };
}

function parseJson(value?: string | null): Record<string, unknown> {
  try { return value ? JSON.parse(value) as Record<string, unknown> : {}; } catch { return {}; }
}
