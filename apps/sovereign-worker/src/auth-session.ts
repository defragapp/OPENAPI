import type { Env } from './env';
import { createSignedSessionToken } from './security/auth';

const encoder = new TextEncoder();
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export interface IssuedSession {
  sessionId: string;
  token: string;
  cookie: string;
  expiresAt: number;
}

export async function issueAccountSession(env: Env, accountId: string, subject: string): Promise<IssuedSession> {
  const sessionId = `session_${crypto.randomUUID()}`;
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await createSignedSessionToken({ sub: subject, exp: expiresAt, sid: sessionId }, env.SESSION_SIGNING_SECRET);

  await env.DB.prepare("INSERT INTO auth_sessions (id, account_id, subject, session_hash, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+30 days'))")
    .bind(sessionId, accountId, subject, await sha256(token))
    .run();

  return {
    sessionId,
    token,
    expiresAt,
    cookie: `__Host-sovereign_session=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax; Priority=High`
  };
}

export async function revokeAccountSessions(env: Env, accountId: string): Promise<void> {
  await env.DB.prepare("UPDATE auth_sessions SET revoked_at = datetime('now') WHERE account_id = ? AND revoked_at IS NULL")
    .bind(accountId)
    .run();
}
