import type { AuthContext, Env } from '../env';

export async function resolveAccount(env: Env, subject: string): Promise<AuthContext> {
  const existing = await env.DB.prepare('SELECT id, auth_subject FROM accounts WHERE auth_subject = ?')
    .bind(subject)
    .first<{ id: string; auth_subject: string }>();
  if (existing) return { accountId: existing.id, subject: existing.auth_subject };
  const accountId = crypto.randomUUID();
  try {
    const p1 = env.DB.prepare('INSERT INTO accounts (id, auth_subject) VALUES (?, ?)').bind(accountId, subject);
    const p2 = env.DB.prepare('INSERT INTO persons (id, account_id, role, display_name, source_of_truth, baseline_status, consent_status) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), accountId, 'self', 'You', 'authenticated_account', 'pending', 'granted');
    if (typeof env.DB.batch === 'function') {
      await env.DB.batch([p1, p2]);
    } else {
      await p1.run();
      await p2.run();
    }
  } catch (error) {
    console.error('auth_d1_error', { error: error instanceof Error ? error.message : 'unknown' });
    throw new Response(JSON.stringify({ error: 'AUTH_D1_ERROR', status: 'error', message: 'Account creation failed during database transaction' }), {
      status: 500,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
    });
  }
  return { accountId, subject };
}
