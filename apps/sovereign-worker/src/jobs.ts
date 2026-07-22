import type { Env } from './env';

const ACCOUNT_TABLE_DELETES = [
  'auth_magic_links', 'auth_sessions', 'baseline_onboarding', 'account_privacy_settings', 'relationships', 'systems', 'persons', 'threads', 'saved_understandings', 'library_links', 'export_artifacts', 'export_jobs', 'deletion_jobs', 'tool_audit_events', 'user_corrections', 'entitlement_cache'
];

export async function enqueueJob(env: Env, kind: string, accountId?: string, payload: Record<string, unknown> = {}) {
  const id = `job_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO background_jobs (id, account_id, kind, status, payload_json) VALUES (?, ?, ?, ?, ?)').bind(id, accountId ?? null, kind, 'queued', JSON.stringify(payload)).run();
  await env.JOBS?.send?.({ id, kind, accountId, payload });
  return { id, kind, status: 'queued' };
}

export async function runDueJobs(env: Env, limit = 10) {
  const rows = await env.DB.prepare("SELECT id, account_id, kind, payload_json, attempts FROM background_jobs WHERE status = 'queued' AND run_after <= datetime('now') ORDER BY created_at LIMIT ?").bind(limit).all<Record<string, string | number | null>>();
  const results = [];
  for (const row of rows.results ?? []) results.push(await runOneJob(env, String(row.id), String(row.kind), row.account_id ? String(row.account_id) : undefined, JSON.parse(String(row.payload_json || '{}'))));
  return { processed: results.length, results };
}

export async function runOneJob(env: Env, id: string, kind: string, accountId?: string, payload: Record<string, unknown> = {}) {
  try {
    await env.DB.prepare("UPDATE background_jobs SET status = 'running', attempts = attempts + 1, updated_at = datetime('now') WHERE id = ?").bind(id).run();
    if (kind === 'export.generate') await generateExport(env, requiredAccount(accountId), String(payload.exportJobId));
    if (kind === 'deletion.execute') await executeDeletion(env, requiredAccount(accountId));
    if (kind === 'cleanup.expired') await cleanupExpired(env);
    if (kind === 'stripe.retry') await env.DB.prepare("UPDATE webhook_events SET processed_at = COALESCE(processed_at, datetime('now')) WHERE event_id = ?").bind(String(payload.eventId)).run();
    await env.DB.prepare("UPDATE background_jobs SET status = 'completed', updated_at = datetime('now') WHERE id = ?").bind(id).run();
    return { id, status: 'completed' };
  } catch (error) {
    await env.DB.prepare("UPDATE background_jobs SET status = CASE WHEN attempts + 1 >= max_attempts THEN 'failed' ELSE 'queued' END, last_error = ?, updated_at = datetime('now') WHERE id = ?").bind(error instanceof Error ? error.message.slice(0, 160) : 'job failed', id).run();
    return { id, status: 'failed' };
  }
}
function requiredAccount(accountId?: string) { if (!accountId) throw new Error('account required'); return accountId; }

export async function generateExport(env: Env, accountId: string, exportJobId: string) {
  const payload = { accountId, generatedAt: new Date().toISOString(), categories: ['account', 'sessions', 'baseline-reduced', 'current-conditions', 'people', 'relationships', 'consent', 'systems', 'memberships', 'threads', 'corrections', 'library', 'exports', 'deletion-status', 'billing-status'], excludes: ['secrets', 'authorization headers', 'raw birth input', 'exact private location', 'hidden reasoning', 'other accounts'] };
  const key = `exports/${accountId}/${exportJobId}.json`;
  const body = JSON.stringify(payload, null, 2);
  await env.ARTIFACTS?.put(key, body, { httpMetadata: { contentType: 'application/json' } });
  await env.DB.prepare("UPDATE export_jobs SET status = 'completed', completed_at = datetime('now'), expires_at = datetime('now', '+7 days') WHERE id = ? AND account_id = ?").bind(exportJobId, accountId).run();
  await env.DB.prepare("INSERT INTO export_artifacts (id, job_id, account_id, r2_key, byte_size, expires_at) VALUES (?, ?, ?, ?, ?, datetime('now', '+7 days'))").bind(`artifact_${crypto.randomUUID()}`, exportJobId, accountId, key, body.length).run();
}

export async function executeDeletion(env: Env, accountId: string) {
  await env.DB.prepare("UPDATE deletion_jobs SET status = 'running' WHERE account_id = ? AND status IN ('grace','queued')").bind(accountId).run();
  const artifacts = await env.DB.prepare('SELECT r2_key FROM export_artifacts WHERE account_id = ?').bind(accountId).all<{ r2_key: string }>();
  for (const artifact of artifacts.results ?? []) await env.ARTIFACTS?.delete?.(artifact.r2_key);
  await env.DB.prepare("UPDATE stripe_subscriptions SET account_id = 'deleted_' || account_id, status = 'retained_billing_record' WHERE account_id = ?").bind(accountId).run();
  await env.DB.prepare("UPDATE stripe_customers SET email_normalized = NULL WHERE account_id = ?").bind(accountId).run();
  for (const table of ACCOUNT_TABLE_DELETES) await env.DB.prepare(`DELETE FROM ${table} WHERE account_id = ?`).bind(accountId).run();
  await env.DB.prepare("UPDATE accounts SET auth_subject = 'deleted:' || id, updated_at = datetime('now') WHERE id = ?").bind(accountId).run();
}

export async function cancelDeletion(env: Env, accountId: string, jobId: string) {
  const result = await env.DB.prepare("UPDATE deletion_jobs SET status = 'cancelled' WHERE id = ? AND account_id = ? AND status = 'grace'").bind(jobId, accountId).run();
  if (result.meta?.changes === 0) throw new Response('Deletion job not cancellable', { status: 409 });
}

export async function cleanupExpired(env: Env) {
  const artifacts = await env.DB.prepare("SELECT r2_key FROM export_artifacts WHERE expires_at < datetime('now')").all<{ r2_key: string }>();
  for (const artifact of artifacts.results ?? []) await env.ARTIFACTS?.delete?.(artifact.r2_key);
  await env.DB.prepare("DELETE FROM auth_magic_links WHERE expires_at < datetime('now') AND used_at IS NULL").run();
  await env.DB.prepare("UPDATE auth_sessions SET revoked_at = datetime('now') WHERE expires_at < datetime('now') AND revoked_at IS NULL").run();
  await env.DB.prepare("DELETE FROM export_artifacts WHERE expires_at < datetime('now')").run();
}

export function deletionInventory(): string[] { return [...ACCOUNT_TABLE_DELETES, 'current_conditions:cascade-via-persons', 'consent_grants:cascade-via-persons', 'system_memberships:cascade-via-persons-and-systems', 'thread_events:cascade-via-threads', 'stripe_subscriptions:pseudonymized', 'stripe_customers:minimized', 'R2:exports/account/*']; }
