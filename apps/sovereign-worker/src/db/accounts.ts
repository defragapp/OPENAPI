import type { AuthContext, Env } from '../env';

export async function resolveAccount(env: Env, subject: string): Promise<AuthContext> {
  const existing = await env.DB.prepare('SELECT id, auth_subject FROM accounts WHERE auth_subject = ?')
    .bind(subject)
    .first<{ id: string; auth_subject: string }>();
  if (existing) return { accountId: existing.id, subject: existing.auth_subject };
  const accountId = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO accounts (id, auth_subject) VALUES (?, ?)').bind(accountId, subject).run();
  await env.DB.prepare('INSERT INTO persons (id, account_id, role, display_name, source_of_truth, baseline_status, consent_status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), accountId, 'self', 'You', 'authenticated_account', 'pending', 'granted')
    .run();
  return { accountId, subject };
}
