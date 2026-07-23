import type { Env } from './env';
import { runtimeMode } from './runtime';
import { sendOperationalEmail } from './email';
import { createSignedSessionToken } from './security/auth';
import { resolveAccount } from './db/accounts';

const encoder = new TextEncoder();
const LINK_TTL_SECONDS = 15 * 60;
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }
function validEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
async function sha256(value: string) { const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value)); return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
function base64Url(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function newToken(): string { const bytes = new Uint8Array(32); crypto.getRandomValues(bytes); return base64Url(bytes); }
function publicBaseUrl(request: Request, env: Env): string { return env.PUBLIC_APP_URL || new URL(request.url).origin; }
function cookie(name: string, value: string, maxAge = SESSION_TTL_SECONDS) { return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`; }

export async function verifyTurnstile(env: Env, token?: string, ip?: string): Promise<void> {
  if (runtimeMode(env) === 'test' && token === 'test-turnstile-pass') return;
  if (!env.TURNSTILE_SECRET_KEY) throw new Response('Turnstile unavailable', { status: 503 });
  const body = new FormData();
  body.set('secret', env.TURNSTILE_SECRET_KEY);
  body.set('response', token ?? '');
  if (ip) body.set('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const result = await response.json().catch(() => ({ success: false })) as { success?: boolean; hostname?: string; action?: string };
  if (!result.success) throw new Response('Turnstile verification failed', { status: 400 });
  if (env.TURNSTILE_EXPECTED_HOSTNAME && result.hostname !== env.TURNSTILE_EXPECTED_HOSTNAME) throw new Response('Turnstile hostname mismatch', { status: 400 });
  if (env.TURNSTILE_EXPECTED_ACTION && result.action !== env.TURNSTILE_EXPECTED_ACTION) throw new Response('Turnstile action mismatch', { status: 400 });
}

export async function requestMagicLink(request: Request, env: Env, kind: 'signup' | 'login'): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { email?: string; name?: string; termsAccepted?: boolean; turnstileToken?: string };
  const email = normalizeEmail(body.email ?? '');
  if (!validEmail(email)) return Response.json({ status: 'invalid' }, { status: 400 });
  if (kind === 'signup' && (!body.name?.trim() || body.termsAccepted !== true)) return Response.json({ status: 'invalid' }, { status: 400 });
  await verifyTurnstile(env, body.turnstileToken, request.headers.get('cf-connecting-ip') ?? undefined);
  const recent = await env.DB.prepare("SELECT id FROM auth_magic_links WHERE email_normalized = ? AND created_at > datetime('now', '-2 minutes')").bind(email).first<{ id: string }>();
  if (recent) return Response.json({ status: 'rate limited' }, { status: 429 });
  const token = newToken();
  const tokenHash = await sha256(token);
  const existing = await env.DB.prepare('SELECT id FROM accounts WHERE auth_subject = ?').bind(`email:${email}`).first<{ id: string }>();
  const id = `magic_${crypto.randomUUID()}`;
  await env.DB.prepare("INSERT INTO auth_magic_links (id, email_normalized, account_id, purpose, token_hash, name, terms_accepted_at, expires_at, requested_ip_hash, user_agent_hash) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '+15 minutes'), ?, ?)").bind(id, email, existing?.id ?? null, kind, tokenHash, body.name?.trim() ?? null, kind === 'signup' ? new Date().toISOString() : null, await sha256(request.headers.get('cf-connecting-ip') ?? 'unknown'), await sha256(request.headers.get('user-agent') ?? 'unknown')).run();
  const url = `${publicBaseUrl(request, env)}/auth/redeem?token=${encodeURIComponent(token)}`;
  await sendOperationalEmail(env, { to: email, subject: 'Your Sovereign.OS sign-in link', text: `Use this private one-time link to continue. It expires in 15 minutes: ${url}`, idempotencyKey: id });
  return Response.json({ status: 'sent' });
}

export async function redeemMagicLink(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || (await request.json().catch(() => ({})) as { token?: string }).token;
  if (!token) return Response.json({ status: 'invalid' }, { status: 400 });
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare("SELECT id, email_normalized, account_id, purpose, name, expires_at, used_at FROM auth_magic_links WHERE token_hash = ?").bind(tokenHash).first<Record<string, string | null>>();
  if (!row) return Response.json({ status: 'invalid' }, { status: 400 });
  if (row.used_at) return Response.json({ status: 'already used' }, { status: 409 });
  if (Date.parse(row.expires_at!) < Date.now()) return Response.json({ status: 'expired' }, { status: 410 });
  const account = await resolveAccount(env, `email:${row.email_normalized}`);
  const redeemed = await env.DB.prepare(`UPDATE auth_magic_links
    SET used_at = datetime('now'), account_id = ?
    WHERE id = ? AND used_at IS NULL AND expires_at > datetime('now')`)
    .bind(account.accountId, row.id)
    .run();
  if ((redeemed.meta?.changes ?? 0) === 0) {
    return Response.json({ status: 'already used' }, { status: 409 });
  }
  const sessionId = `session_${crypto.randomUUID()}`;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const tokenValue = await createSignedSessionToken({ sub: `email:${row.email_normalized}`, exp, sid: sessionId }, env.SESSION_SIGNING_SECRET);
  await env.DB.prepare("INSERT INTO auth_sessions (id, account_id, subject, session_hash, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+30 days'))").bind(sessionId, account.accountId, `email:${row.email_normalized}`, await sha256(tokenValue)).run();
  return Response.json({ status: 'success' }, { headers: { 'set-cookie': cookie('__Host-sovereign_session', tokenValue) } });
}

export async function logout(request: Request, env: Env, all = false): Promise<Response> {
  const auth = await import('./security/auth').then((m) => m.requireAuth(request, env));
  if (all) await env.DB.prepare("UPDATE auth_sessions SET revoked_at = datetime('now') WHERE account_id = ? AND revoked_at IS NULL").bind(auth.accountId).run();
  else if (auth.sessionId) await env.DB.prepare("UPDATE auth_sessions SET revoked_at = datetime('now') WHERE id = ? AND account_id = ? AND revoked_at IS NULL").bind(auth.sessionId, auth.accountId).run();
  return Response.json({ status: 'success' }, { headers: { 'set-cookie': cookie('__Host-sovereign_session', 'deleted', 0) } });
}
