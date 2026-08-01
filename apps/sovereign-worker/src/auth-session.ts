import type { Env } from './env';
import { createSignedSessionToken } from './security/auth';
import { safeReturnTo } from './auth-public';

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const encoder = new TextEncoder();

async function sha256(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sessionCookie(value: string, maxAge = SESSION_TTL_SECONDS): string {
  return `__Host-sovereign_session=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax; Priority=High`;
}

export async function createAccountSessionResponse(
  env: Env,
  accountId: string,
  subject: string,
  createdAccount: boolean,
  returnTo: string
): Promise<Response> {
  const sessionId = `session_${crypto.randomUUID()}`;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const tokenValue = await createSignedSessionToken({ sub: subject, exp, sid: sessionId }, env.SESSION_SIGNING_SECRET);
  await env.DB.prepare("INSERT INTO auth_sessions (id, account_id, subject, session_hash, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+30 days'))")
    .bind(sessionId, accountId, subject, await sha256(tokenValue))
    .run();
  const onboarding = await env.DB.prepare('SELECT onboarding_completed_at FROM accounts WHERE id = ?')
    .bind(accountId)
    .first<{ onboarding_completed_at?: string | null }>();
  return Response.json(
    {
      status: 'success',
      createdAccount,
      next: onboarding?.onboarding_completed_at ? safeReturnTo(returnTo) : '/onboarding'
    },
    {
      headers: {
        'set-cookie': sessionCookie(tokenValue),
        'cache-control': 'no-store'
      }
    }
  );
}
