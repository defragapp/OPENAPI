import type { Env } from './env';

const ACCOUNT_TABLE_DELETES = [
  'auth_magic_links',
  'auth_sessions',
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
  status: string;
}

export async function enqueueJob(env: Env, kind: string, accountId?: string, payload: Record<string, unknown> = {}) {
  const id = `job_${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO background_jobs (id, account_id, kind, status, payload_json) VALUES (?, ?, ?, ?, ?)')
    .bind(id, accountId ?? null, kind, 'queued', JSON.stringify(payload))
    .run();
  await env.JOBS?.send?.({ id, kind, accountId, payload });
  return { id, kind, status: 'queued' };
}

export async function runDueJobs(env: Env, limit = 10, accountId?: string) {
  const scopedSql = accountId
    ? `SELECT id, account_id, kind, payload_json, attempts, status FROM background_jobs
       WHERE account_id = ? AND status = 'queued' AND run_after <= datetime('now')
       ORDER BY created_at LIMIT ?`
    : `SELECT id, account_id, kind, payload_json, attempts, status FROM background_jobs
       WHERE status = 'queued' AND run_after <= datetime('now')
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
      JSON.parse(String(row.payload_json || '{}'))
    ));
  }
  return { processed: results.length, results };
}

export async function runOneJob(env: Env, id: string, expectedKind?: string, expectedAccountId?: string, expectedPayload: Record<string, unknown> = {}) {
  const row = await env.DB.prepare('SELECT id, account_id, kind, payload_json, attempts, status FROM background_jobs WHERE id = ?')
    .bind(id)
    .first<JobRow>();
  if (!row) return { id, status: 'missing' };
  const accountId = row.account_id ?? undefined;
  if (expectedKind && expectedKind !== row.kind) return { id, status: 'rejected' };
  if (expectedAccountId && expectedAccountId !== accountId) return { id, status: 'rejected' };
  const payload = Object.keys(expectedPayload).length ? expectedPayload : JSON.parse(row.payload_json || '{}');

  const claimed = await env.DB.prepare(`UPDATE background_jobs
    SET status = 'running', attempts = attempts + 1, updated_at = datetime('now')
    WHERE id = ? AND status = 'queued'`)
    .bind(id)
    .run();
  if ((claimed.meta?.changes ?? 0) === 0) return { id, status: 'skipped' };

  try {
    if (row.kind === 'export.generate') await generateExport(env, requiredAccount(accountId), String(payload.exportJobId));
    if (row.kind === 'deletion.execute') await executeDeletion(env, requiredAccount(accountId));
    if (row.kind === 'cleanup.expired') await cleanupExpired(env);
    if (row.kind === 'stripe.retry') {
      await env.DB.prepare(`UPDATE webhook_events SET processed_at = COALESCE(processed_at, datetime('now'))
        WHERE provider = 'stripe' AND event_id = ?`).bind(String(payload.eventId)).run();
    }
    await env.DB.prepare(`UPDATE background_jobs SET status = 'completed', updated_at = datetime('now')
      WHERE id = ?`).bind(id).run();
    return { id, status: 'completed' };
  } catch (error) {
    await env.DB.prepare(`UPDATE background_jobs SET
      status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'queued' END,
      last_error = ?,
      updated_at = datetime('now')
      WHERE id = ?`)
      .bind(error instanceof Error ? error.message.slice(0, 160) : 'job failed', id)
      .run();
    return { id, status: 'failed' };
  }
}

function requiredAccount(accountId?: string) {
  if (!accountId) throw new Error('account required');
  return accountId;
}

async function rows<T = Record<string, unknown>>(env: Env, sql: string, ...args: unknown[]): Promise<T[]> {
  const result = await env.DB.prepare(sql).bind(...args).all<T>();
  return result.results ?? [];
}

export async function collectAccountExport(env: Env, accountId: string) {
  const artifacts = await rows<{ r2_key: string; byte_size: number; expires_at: string }>(
    env,
    'SELECT r2_key, byte_size, expires_at FROM export_artifacts WHERE account_id = ?',
    accountId
  );
  return {
    generatedAt: new Date().toISOString(),
    categories: ['account', 'sessions', 'baseline-reduced', 'current-conditions', 'people', 'consent', 'systems', 'threads', 'corrections', 'library', 'exports', 'deletion-status', 'billing-status'],
    excludes: ['secrets', 'authorization headers', 'raw birth input', 'exact private location', 'hidden reasoning', 'other accounts', 'magic-link tokens', 'session token hashes'],
    data: {
      account: await env.DB.prepare('SELECT id, created_at, updated_at FROM accounts WHERE id = ?').bind(accountId).first(),
      sessions: await rows(env, 'SELECT id, expires_at, revoked_at, created_at, last_seen_at FROM auth_sessions WHERE account_id = ?', accountId),
      baseline: await rows(env, 'SELECT status, uncertainty, reduced_context_json, computation_version, provenance_json, provider_status, last_computed_at FROM baseline_onboarding WHERE account_id = ?', accountId),
      people: await rows(env, 'SELECT id, role, display_name, source_of_truth, baseline_status, consent_status, created_at, updated_at FROM persons WHERE account_id = ?', accountId),
      relationships: await rows(env, 'SELECT id, source_person_id, target_person_id, relationship_type, directionality, system_id, metadata_json, created_at, updated_at FROM relationships WHERE account_id = ?', accountId),
      systems: await rows(env, 'SELECT id, system_type, name, metadata_json, created_at, updated_at FROM systems WHERE account_id = ?', accountId),
      threads: await rows(env, 'SELECT id, context_kind, context_ref_id, title, status, covenant_enabled, created_at, updated_at FROM threads WHERE account_id = ?', accountId),
      corrections: await rows(env, 'SELECT id, thread_id, correction, note, saved_to_library, created_at FROM user_corrections WHERE account_id = ?', accountId),
      library: await rows(env, 'SELECT id, thread_id, kind, body_json, created_at, updated_at FROM saved_understandings WHERE account_id = ?', accountId),
      exportJobs: await rows(env, 'SELECT id, status, requested_at, completed_at, expires_at FROM export_jobs WHERE account_id = ?', accountId),
      deletionJobs: await rows(env, 'SELECT id, status, requested_at, scheduled_for, completed_at FROM deletion_jobs WHERE account_id = ?', accountId),
      billing: {
        subscriptions: await rows(env, 'SELECT id, plan_key, status, current_period_end, cancel_at_period_end, created_at, updated_at FROM stripe_subscriptions WHERE account_id = ?', accountId),
        entitlements: await rows(env, 'SELECT plan, features_json, as_of, updated_at FROM entitlement_cache WHERE account_id = ?', accountId)
      },
      artifactKeys: artifacts
    }
  };
}

export async function generateExport(env: Env, accountId: string, exportJobId: string) {
  const payload = await collectAccountExport(env, accountId);
  const key = `exports/${accountId}/${exportJobId}.json`;
  const body = JSON.stringify(payload, null, 2);
  await env.ARTIFACTS?.put(key, body, { httpMetadata: { contentType: 'application/json' } });
  await env.DB.prepare(`UPDATE export_jobs SET status = 'completed', completed_at = datetime('now'), expires_at = datetime('now', '+7 days')
    WHERE id = ? AND account_id = ?`).bind(exportJobId, accountId).run();
  await env.DB.prepare(`INSERT INTO export_artifacts (id, job_id, account_id, r2_key, byte_size, expires_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '+7 days'))`)
    .bind(`artifact_${crypto.randomUUID()}`, exportJobId, accountId, key, body.length)
    .run();
}

export async function executeDeletion(env: Env, accountId: string) {
  await env.DB.prepare(`UPDATE deletion_jobs SET status = 'running'
    WHERE account_id = ? AND status IN ('grace','queued')`).bind(accountId).run();
  const artifacts = await env.DB.prepare('SELECT r2_key FROM export_artifacts WHERE account_id = ?')
    .bind(accountId)
    .all<{ r2_key: string }>();
  for (const artifact of artifacts.results ?? []) await env.ARTIFACTS?.delete?.(artifact.r2_key);

  await env.DB.prepare(`UPDATE stripe_subscriptions SET status = 'retained_billing_record', updated_at = datetime('now')
    WHERE account_id = ?`).bind(accountId).run();
  await env.DB.prepare(`UPDATE stripe_customers SET email_normalized = NULL, updated_at = datetime('now')
    WHERE account_id = ?`).bind(accountId).run();
  await env.DB.prepare(`DELETE FROM background_jobs WHERE account_id = ? AND kind <> 'deletion.execute'`).bind(accountId).run();
  await env.DB.prepare(`UPDATE background_jobs SET payload_json = '{}', last_error = NULL WHERE account_id = ?`).bind(accountId).run();

  for (const table of ACCOUNT_TABLE_DELETES) {
    await env.DB.prepare(`DELETE FROM ${table} WHERE account_id = ?`).bind(accountId).run();
  }
  await env.DB.prepare(`UPDATE accounts SET auth_subject = 'deleted:' || id, updated_at = datetime('now') WHERE id = ?`)
    .bind(accountId)
    .run();
  await env.DB.prepare(`UPDATE deletion_jobs SET status = 'completed', completed_at = datetime('now')
    WHERE account_id = ? AND status = 'running'`).bind(accountId).run();
}

export async function cancelDeletion(env: Env, accountId: string, jobId: string) {
  const result = await env.DB.prepare(`UPDATE deletion_jobs SET status = 'cancelled'
    WHERE id = ? AND account_id = ? AND status = 'grace'`).bind(jobId, accountId).run();
  if (result.meta?.changes === 0) throw new Response('Deletion job not cancellable', { status: 409 });
}

export async function cleanupExpired(env: Env) {
  const artifacts = await env.DB.prepare(`SELECT r2_key FROM export_artifacts WHERE expires_at < datetime('now')`)
    .all<{ r2_key: string }>();
  for (const artifact of artifacts.results ?? []) await env.ARTIFACTS?.delete?.(artifact.r2_key);
  await env.DB.prepare(`DELETE FROM auth_magic_links WHERE expires_at < datetime('now') AND used_at IS NULL`).run();
  await env.DB.prepare(`UPDATE auth_sessions SET revoked_at = datetime('now')
    WHERE expires_at < datetime('now') AND revoked_at IS NULL`).run();
  await env.DB.prepare(`DELETE FROM export_artifacts WHERE expires_at < datetime('now')`).run();
}

export function deletionInventory(): string[] {
  return [
    ...ACCOUNT_TABLE_DELETES,
    'current_conditions:cascade-via-persons',
    'consent_grants:cascade-via-persons',
    'system_memberships:cascade-via-persons-and-systems',
    'thread_events:cascade-via-threads',
    'stripe_subscriptions:retained-with-opaque-account-key',
    'stripe_customers:email-removed',
    'background_jobs:minimized',
    'R2:exports/account/*'
  ];
}
