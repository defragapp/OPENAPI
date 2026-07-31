import type { Env } from './env';
import { cancelAccountSubscriptions } from './billing/stripe';
import { BASELINE_COMPILER_STAGES, runBaselineCompilerStage } from './baseline-compiler';

const ACCOUNT_TABLE_DELETES = [
  'auth_magic_links',
  'auth_sessions',
  'baseline_facet_profiles',
  'baseline_compiler_runs',
  'baseline_source_records',
  'baseline_onboarding',
  'account_privacy_settings',
  'relationships',
  'systems',
  'persons',
  'threads',
  'saved_understandings',
  'library_links',
  'export_artifacts',
  'export_jobs',
  'tool_audit_events',
  'user_corrections',
  'entitlement_cache',
  'ai_usage_windows'
];

interface JobRow {
  id: string;
  account_id: string | null;
  kind: string;
  payload_json: string;
  attempts: number;
  max_attempts: number;
  status: string;
}

export async function enqueueJob(env: Env, kind: string, accountId?: string, payload: Record<string, unknown> = {}) {
  const id = `job_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO background_jobs (id, account_id, kind, status, payload_json) VALUES (?, ?, ?, ?, ?)')
    .bind(id, accountId ?? null, kind, 'queued', JSON.stringify(payload))
    .run();
  return { id, kind, status: 'queued' };
}

export async function runDueJobs(env: Env, limit = 10, accountId?: string) {
  if (!accountId) await cleanupExpired(env);
  const scopedSql = accountId
    ? `SELECT id, account_id, kind, payload_json, attempts, max_attempts, status FROM background_jobs
       WHERE account_id = ?
         AND run_after <= datetime('now')
         AND (status = 'queued' OR (status = 'running' AND lease_expires_at <= datetime('now')))
       ORDER BY created_at LIMIT ?`
    : `SELECT id, account_id, kind, payload_json, attempts, max_attempts, status FROM background_jobs
       WHERE run_after <= datetime('now')
         AND (status = 'queued' OR (status = 'running' AND lease_expires_at <= datetime('now')))
       ORDER BY created_at LIMIT ?`;
  const statement = env.DB.prepare(scopedSql);
  const rows = accountId
    ? await statement.bind(accountId, limit).all<JobRow>()
    : await statement.bind(limit).all<JobRow>();
  const results = [];
  for (const row of rows.results ?? []) {
    results.push(await runOneJob(
      env,
      String(row.id),
      String(row.kind),
      row.account_id ? String(row.account_id) : undefined,
      safeJson(String(row.payload_json || '{}'))
    ));
  }
  return { processed: results.length, results };
}

export async function runOneJob(env: Env, id: string, expectedKind?: string, expectedAccountId?: string, expectedPayload: Record<string, unknown> = {}) {
  const row = await env.DB.prepare('SELECT id, account_id, kind, payload_json, attempts, max_attempts, status FROM background_jobs WHERE id = ?')
    .bind(id)
    .first<JobRow>();
  if (!row) return { id, status: 'missing' };
  const accountId = row.account_id ?? undefined;
  if (expectedKind && expectedKind !== row.kind) return { id, status: 'rejected' };
  if (expectedAccountId && expectedAccountId !== accountId) return { id, status: 'rejected' };
  const payload = Object.keys(expectedPayload).length ? expectedPayload : safeJson(row.payload_json);
  const leaseToken = crypto.randomUUID();

  const claimed = await env.DB.prepare(`UPDATE background_jobs
    SET status = 'running', attempts = attempts + 1, lease_token = ?,
        lease_expires_at = datetime('now', '+5 minutes'), error_code = NULL,
        updated_at = datetime('now')
    WHERE id = ?
      AND run_after <= datetime('now')
      AND (status = 'queued' OR (status = 'running' AND lease_expires_at <= datetime('now')))`)
    .bind(leaseToken, id)
    .run();
  if ((claimed.meta?.changes ?? 0) === 0) return { id, status: 'skipped' };

  try {
    if ((BASELINE_COMPILER_STAGES as readonly string[]).includes(row.kind)) {
      const runId = typeof payload.runId === 'string' ? payload.runId : '';
      if (!runId) throw new Error('baseline_run_id_missing');
      await runBaselineCompilerStage(env, runId, row.kind);
    } else {
      switch (row.kind) {
        case 'deletion.execute':
          await executeDeletion(env, requiredAccount(accountId), String(payload.deletionJobId ?? ''));
          break;
        case 'cleanup.expired':
          await cleanupExpired(env);
          break;
        case 'export.generate':
          throw new Error('private_export_disabled');
        case 'stripe.retry':
          throw new Error('stripe_retry_requires_original_signed_delivery');
        default:
          throw new Error('unsupported_background_job');
      }
    }
    await env.DB.prepare(`UPDATE background_jobs SET
      status = 'completed', last_error = NULL, error_code = NULL,
      lease_token = NULL, lease_expires_at = NULL, updated_at = datetime('now')
      WHERE id = ? AND lease_token = ?`)
      .bind(id, leaseToken)
      .run();
    return { id, status: 'completed' };
  } catch (error) {
    const code = safeJobErrorCode(error);
    await env.DB.prepare(`UPDATE background_jobs SET
      status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'queued' END,
      run_after = CASE
        WHEN attempts <= 1 THEN datetime('now', '+1 minute')
        WHEN attempts = 2 THEN datetime('now', '+5 minutes')
        ELSE datetime('now', '+15 minutes')
      END,
      last_error = ?, error_code = ?, lease_token = NULL, lease_expires_at = NULL,
      updated_at = datetime('now')
      WHERE id = ? AND lease_token = ?`)
      .bind(code, code, id, leaseToken)
      .run();
    return { id, status: 'failed', errorCode: code };
  }
}

function requiredAccount(accountId?: string) {
  if (!accountId) throw new Error('account_required');
  return accountId;
}

export async function executeDeletion(env: Env, accountId: string, deletionJobId?: string) {
  const deletion = await env.DB.prepare(`SELECT id, status FROM deletion_jobs
    WHERE account_id = ?
      AND status IN ('grace','running')
      AND scheduled_for <= datetime('now')
      AND (? = '' OR id = ?)
    ORDER BY requested_at DESC LIMIT 1`)
    .bind(accountId, deletionJobId ?? '', deletionJobId ?? '')
    .first<{ id: string; status: string }>();
  if (!deletion) throw new Error('deletion_not_due_or_cancelled');

  if (deletion.status === 'grace') {
    await cancelAccountSubscriptions(env, accountId, deletion.id);
    const claimed = await env.DB.prepare(`UPDATE deletion_jobs SET status = 'running'
      WHERE id = ? AND account_id = ? AND status = 'grace' AND scheduled_for <= datetime('now')`)
      .bind(deletion.id, accountId)
      .run();
    if ((claimed.meta?.changes ?? 0) === 0) throw new Error('deletion_claim_lost');
  }

  await env.DB.prepare(`UPDATE stripe_subscriptions SET status = 'retained_billing_record', updated_at = datetime('now')
    WHERE account_id = ?`).bind(accountId).run();
  await env.DB.prepare(`UPDATE stripe_customers SET email_normalized = NULL, updated_at = datetime('now')
    WHERE account_id = ?`).bind(accountId).run();
  await env.DB.prepare(`DELETE FROM background_jobs WHERE account_id = ? AND kind <> 'deletion.execute'`).bind(accountId).run();
  await env.DB.prepare(`UPDATE background_jobs SET payload_json = '{}', last_error = NULL, error_code = NULL WHERE account_id = ?`).bind(accountId).run();

  for (const table of ACCOUNT_TABLE_DELETES) {
    await env.DB.prepare(`DELETE FROM ${table} WHERE account_id = ?`).bind(accountId).run();
  }
  await env.DB.prepare(`UPDATE accounts SET auth_subject = 'deleted:' || id, updated_at = datetime('now') WHERE id = ?`)
    .bind(accountId)
    .run();
  await env.DB.prepare(`UPDATE deletion_jobs SET status = 'completed', completed_at = datetime('now')
    WHERE id = ? AND account_id = ? AND status = 'running'`).bind(deletion.id, accountId).run();
}

export async function cancelDeletion(env: Env, accountId: string, jobId: string) {
  const result = await env.DB.prepare(`UPDATE deletion_jobs SET status = 'cancelled'
    WHERE id = ? AND account_id = ? AND status = 'grace'`).bind(jobId, accountId).run();
  if (result.meta?.changes === 0) throw new Response('Deletion job not cancellable', { status: 409 });
}

export async function cleanupExpired(env: Env) {
  const threadDays = retentionDays(env.THREAD_RETENTION_DAYS, 30, 7, 365);
  const auditDays = retentionDays(env.AUDIT_RETENTION_DAYS, 90, threadDays, 730);
  const threadCutoff = `-${threadDays} days`;
  const auditCutoff = `-${auditDays} days`;

  const threadEvents = await env.DB.prepare("DELETE FROM thread_events WHERE created_at < datetime('now', ?)").bind(threadCutoff).run();
  const expiredThreads = await env.DB.prepare(`DELETE FROM threads
    WHERE updated_at < datetime('now', ?)
      AND id NOT IN (SELECT thread_id FROM saved_understandings WHERE thread_id IS NOT NULL)`)
    .bind(threadCutoff)
    .run();
  const correctionNotes = await env.DB.prepare("UPDATE user_corrections SET note = NULL WHERE note IS NOT NULL AND created_at < datetime('now', ?)").bind(threadCutoff).run();
  const turnStates = await env.DB.prepare("DELETE FROM thread_turn_states WHERE updated_at < datetime('now', ?) AND status IN ('completed','failed','interrupted')").bind(auditCutoff).run();
  const auditEvents = await env.DB.prepare("DELETE FROM tool_audit_events WHERE created_at < datetime('now', ?)").bind(auditCutoff).run();
  const magicLinks = await env.DB.prepare("DELETE FROM auth_magic_links WHERE created_at < datetime('now', ?)").bind(threadCutoff).run();
  const sessions = await env.DB.prepare("DELETE FROM auth_sessions WHERE revoked_at IS NOT NULL AND created_at < datetime('now', ?)").bind(auditCutoff).run();
  const oldJobs = await env.DB.prepare("DELETE FROM background_jobs WHERE status IN ('completed','failed','cancelled') AND updated_at < datetime('now', ?)").bind(auditCutoff).run();
  await env.DB.prepare("UPDATE auth_sessions SET revoked_at = datetime('now') WHERE expires_at < datetime('now') AND revoked_at IS NULL").run();
  await env.DB.prepare("DELETE FROM export_artifacts WHERE expires_at < datetime('now')").run();

  const counts = {
    threadEvents: threadEvents.meta?.changes ?? 0,
    expiredThreads: expiredThreads.meta?.changes ?? 0,
    correctionNotes: correctionNotes.meta?.changes ?? 0,
    turnStates: turnStates.meta?.changes ?? 0,
    auditEvents: auditEvents.meta?.changes ?? 0,
    magicLinks: magicLinks.meta?.changes ?? 0,
    sessions: sessions.meta?.changes ?? 0,
    oldJobs: oldJobs.meta?.changes ?? 0
  };
  console.info('retention_cleanup', { threadDays, auditDays, counts });
  return { threadDays, auditDays, counts };
}

function retentionDays(value: string | undefined, fallback: number, minimum: number, maximum: number): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) return fallback;
  return parsed;
}

function safeJson(value?: string): Record<string, unknown> {
  try { return value ? JSON.parse(value) as Record<string, unknown> : {}; } catch { return {}; }
}

function safeJobErrorCode(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'job_failed';
  if (/^[a-z0-9_]{3,80}$/.test(raw)) return raw;
  return 'job_failed';
}

export function deletionInventory(): string[] {
  return [
    ...ACCOUNT_TABLE_DELETES,
    'baseline_compiler_stage_results:cascade-via-baseline_compiler_runs',
    'current_conditions:cascade-via-persons',
    'consent_grants:cascade-via-persons',
    'system_memberships:cascade-via-persons-and-systems',
    'thread_events:cascade-via-threads',
    'stripe_subscriptions:cancelled-before-retention',
    'stripe_customers:email-removed',
    'background_jobs:minimized'
  ];
}
