import type { Env } from './env';
import { runtimeMode } from './runtime';
import { buildSovereignEmail, sendOperationalEmail } from './email';
import { createSignedSessionToken } from './security/auth';
import { resolveAccount } from './db/accounts';

const encoder = new TextEncoder();
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const MAX_EMAIL_LENGTH = 320;
const MAX_NAME_LENGTH = 120;
const MAX_TURNSTILE_TOKEN_LENGTH = 2048;
const MAX_MAGIC_LINKS_PER_IP_WINDOW = 10;
const EMAIL_CODE_TTL_MINUTES = 10;
const EMAIL_CODE_MAX_ATTEMPTS = 5;
const TERMS_VERSION = '2026-07-26';
const PRIVACY_VERSION = '2026-07-26';

export function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }
function validEmail(email: string): boolean { return email.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
async function sha256(value: string) { const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value)); return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
async function emailCodeHash(env: Env, email: string, code: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.SESSION_SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`${email}:${code}`));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
function base64Url(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function newToken(): string { const bytes = new Uint8Array(32); crypto.getRandomValues(bytes); return base64Url(bytes); }
function newEmailCode(): string {
  const range = 900_000;
  const ceiling = Math.floor(0x1_0000_0000 / range) * range;
  const sample = new Uint32Array(1);
  do crypto.getRandomValues(sample); while (sample[0]! >= ceiling);
  return String((sample[0]! % range) + 100_000);
}
function publicBaseUrl(request: Request, env: Env): string { return env.PUBLIC_APP_URL || new URL(request.url).origin; }
function cookie(name: string, value: string, maxAge = SESSION_TTL_SECONDS) { return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax; Priority=High`; }
function parseSqliteTimestamp(value?: string | null): number {
  if (!value) return Number.NaN;
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value) ? `${value.replace(' ', 'T')}Z` : value;
  return Date.parse(normalized);
}

export function safeReturnTo(value: unknown, fallback = '/app'): string {
  if (typeof value !== 'string' || value.length > 512 || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  try {
    const parsed = new URL(value, 'https://app.defrag.app');
    const allowed = parsed.pathname === '/app' || parsed.pathname.startsWith('/app/') || parsed.pathname === '/onboarding';
    return allowed ? `${parsed.pathname}${parsed.search}` : fallback;
  } catch {
    return fallback;
  }
}

function turnstileProblem(reason: string, status = 400): Response {
  return Response.json({ status: 'verification_failed', reason }, { status, headers: { 'cache-control': 'no-store' } });
}
function invalidCodeResponse(): Response {
  return Response.json({ status: 'invalid_code' }, { status: 400, headers: { 'cache-control': 'no-store' } });
}

export async function verifyTurnstile(env: Env, token?: string, ip?: string, expectedAction?: string): Promise<void> {
  if (runtimeMode(env) === 'test' && token === 'test-turnstile-pass') return;
  if (!env.TURNSTILE_SECRET_KEY) throw turnstileProblem('unavailable', 503);
  if (!token) throw turnstileProblem('required');
  if (token.length > MAX_TURNSTILE_TOKEN_LENGTH) throw turnstileProblem('invalid');
  const body = new FormData();
  body.set('secret', env.TURNSTILE_SECRET_KEY);
  body.set('response', token);
  body.set('idempotency_key', crypto.randomUUID());
  if (ip) body.set('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(8_000) }).catch(() => undefined);
  if (!response) throw turnstileProblem('unavailable', 503);
  const result = await response.json().catch(() => ({ success: false })) as { success?: boolean; hostname?: string; action?: string; 'error-codes'?: string[] };
  if (!result.success) {
    const codes = result['error-codes'] ?? [];
    if (codes.includes('invalid-input-secret')) { console.error('turnstile_configuration_error', { invalidSecret: true }); throw turnstileProblem('unavailable', 503); }
    if (codes.includes('internal-error')) throw turnstileProblem('unavailable', 503);
    if (codes.includes('timeout-or-duplicate')) throw turnstileProblem('expired_or_used');
    throw turnstileProblem('invalid');
  }
  if (env.TURNSTILE_EXPECTED_HOSTNAME && result.hostname !== env.TURNSTILE_EXPECTED_HOSTNAME) {
    console.warn('turnstile_hostname_mismatch', { expected: env.TURNSTILE_EXPECTED_HOSTNAME, received: result.hostname ?? 'missing' });
    throw turnstileProblem('hostname_mismatch');
  }
  if (expectedAction && result.action !== expectedAction) {
    console.warn('turnstile_action_mismatch', { expected: expectedAction, received: result.action ?? 'missing' });
    throw turnstileProblem('action_mismatch');
  }
}

export async function requestMagicLink(request: Request, env: Env, kind: 'signup' | 'login'): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { email?: string; name?: string; termsAccepted?: boolean; turnstileToken?: string; returnTo?: string };
  const email = normalizeEmail(body.email ?? '');
  const name = body.name?.trim() ?? '';
  const returnTo = safeReturnTo(body.returnTo);
  if (!validEmail(email)) return Response.json({ status: 'invalid', field: 'email' }, { status: 400 });
  if (kind === 'signup' && (!name || name.length > MAX_NAME_LENGTH || body.termsAccepted !== true)) return Response.json({ status: 'invalid', field: !name || name.length > MAX_NAME_LENGTH ? 'name' : 'terms' }, { status: 400 });

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  await verifyTurnstile(env, body.turnstileToken, ip, kind);
  const [ipHash, userAgentHash] = await Promise.all([sha256(ip), sha256(request.headers.get('user-agent') ?? 'unknown')]);
  const recent = await env.DB.prepare("SELECT id FROM auth_magic_links WHERE email_normalized = ? AND created_at > datetime('now', '-2 minutes')").bind(email).first<{ id: string }>();
  const recentIp = await env.DB.prepare("SELECT COUNT(*) AS count FROM auth_magic_links WHERE requested_ip_hash = ? AND created_at > datetime('now', '-15 minutes')").bind(ipHash).first<{ count: number }>();
  if (recent || Number(recentIp?.count ?? 0) >= MAX_MAGIC_LINKS_PER_IP_WINDOW) return Response.json({ status: 'rate limited' }, { status: 429 });

  const existing = await env.DB.prepare('SELECT id FROM accounts WHERE auth_subject = ?').bind(`email:${email}`).first<{ id: string }>();
  if (kind === 'login' && !existing) return Response.json({ status: 'sent', recovery: 'link_or_code' });

  const token = newToken();
  const tokenHash = await sha256(token);
  const id = `magic_${crypto.randomUUID()}`;
  const acceptedAt = kind === 'signup' ? new Date().toISOString() : null;
  await env.DB.prepare("INSERT INTO auth_magic_links (id, email_normalized, account_id, purpose, token_hash, name, terms_accepted_at, expires_at, requested_ip_hash, user_agent_hash) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '+15 minutes'), ?, ?)")
    .bind(id, email, existing?.id ?? null, kind, tokenHash, kind === 'signup' ? name : null, acceptedAt, ipHash, userAgentHash).run();

  let emailCode: string | undefined;
  let emailCodeId: string | undefined;
  if (kind === 'login' && existing) {
    emailCode = newEmailCode();
    emailCodeId = `email_code_${crypto.randomUUID()}`;
    await env.DB.prepare("UPDATE auth_email_codes SET used_at = COALESCE(used_at, datetime('now')) WHERE email_normalized = ? AND used_at IS NULL").bind(email).run();
    await env.DB.prepare("INSERT INTO auth_email_codes (id, account_id, email_normalized, code_hash, return_to, max_attempts, expires_at, requested_ip_hash, user_agent_hash) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+10 minutes'), ?, ?)")
      .bind(emailCodeId, existing.id, email, await emailCodeHash(env, email, emailCode), returnTo, EMAIL_CODE_MAX_ATTEMPTS, ipHash, userAgentHash).run();
  }

  const redeemUrl = new URL('/auth/redeem', publicBaseUrl(request, env));
  redeemUrl.searchParams.set('token', token);
  redeemUrl.searchParams.set('returnTo', returnTo);
  const emailTemplate = buildSovereignEmail(kind === 'signup' ? {
    eyebrow: 'Start with your Baseline', title: 'Your Sovereign.OS account is ready to open.', intro: 'Use the private link below to confirm this email, choose how you want to begin, and enter your personal intelligence environment.', actionLabel: 'Continue to Sovereign.OS', actionUrl: redeemUrl.toString(), details: ['This link expires in 15 minutes.', 'It can be used only once.', 'Your raw birth details and exact private location do not enter the language model.']
  } : {
    eyebrow: 'Private sign-in', title: 'Return to your Sovereign.OS.', intro: 'Open the private Sovereign.OS where your Baseline, chosen conversations, people, systems, and saved understandings remain connected.', actionLabel: 'Open Sovereign.OS', actionUrl: redeemUrl.toString(), details: ['The private link expires in 15 minutes and can be used once.', ...(emailCode ? [`Or enter this one-time code on the sign-in page: ${emailCode}`, `The code expires in ${EMAIL_CODE_TTL_MINUTES} minutes and locks after ${EMAIL_CODE_MAX_ATTEMPTS} failed attempts.`] : []), 'No password or private Sovereign.OS information is included in this message.']
  });
  try {
    await sendOperationalEmail(env, { to: email, subject: kind === 'signup' ? 'Open your Sovereign.OS account' : 'Return to Sovereign.OS', ...emailTemplate, idempotencyKey: id });
  } catch {
    await Promise.all([
      env.DB.prepare('DELETE FROM auth_magic_links WHERE id = ? AND used_at IS NULL').bind(id).run(),
      emailCodeId ? env.DB.prepare('DELETE FROM auth_email_codes WHERE id = ? AND used_at IS NULL').bind(emailCodeId).run() : Promise.resolve()
    ]);
    throw new Response('Email delivery unavailable', { status: 503 });
  }
  return Response.json({ status: 'sent', recovery: kind === 'login' ? 'link_or_code' : 'link' });
}

export async function redeemMagicLink(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const input = request.method === 'GET' ? {} : await request.json().catch(() => ({})) as { token?: string; email?: string; code?: string };
  if (input.email || input.code) return redeemEmailCode(env, input.email, input.code);
  const token = url.searchParams.get('token') || input.token;
  const returnTo = safeReturnTo(url.searchParams.get('returnTo'));
  if (!token || token.length < 32 || token.length > 512) return Response.json({ status: 'invalid' }, { status: 400 });
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare("SELECT id, email_normalized, account_id, purpose, name, terms_accepted_at, expires_at, used_at FROM auth_magic_links WHERE token_hash = ?").bind(tokenHash).first<Record<string, string | null>>();
  if (!row || !row.email_normalized || !validEmail(row.email_normalized) || !['signup', 'login'].includes(row.purpose ?? '')) return Response.json({ status: 'invalid' }, { status: 400 });
  if (row.used_at) return Response.json({ status: 'already used' }, { status: 409 });
  if (!Number.isFinite(parseSqliteTimestamp(row.expires_at)) || parseSqliteTimestamp(row.expires_at) < Date.now()) return Response.json({ status: 'expired' }, { status: 410 });
  if (row.purpose === 'login' && !row.account_id) return Response.json({ status: 'invalid' }, { status: 400 });
  if (row.purpose === 'signup' && !row.terms_accepted_at) return Response.json({ status: 'invalid' }, { status: 400 });

  const subject = `email:${row.email_normalized}`;
  let accountId: string;
  let createdAccount = false;
  if (row.account_id) {
    const account = await env.DB.prepare('SELECT id, auth_subject FROM accounts WHERE id = ?').bind(row.account_id).first<{ id: string; auth_subject: string }>();
    if (!account || account.auth_subject !== subject) return Response.json({ status: 'invalid' }, { status: 400 });
    accountId = account.id;
  } else {
    if (row.purpose !== 'signup') return Response.json({ status: 'invalid' }, { status: 400 });
    accountId = (await resolveAccount(env, subject)).accountId;
    createdAccount = true;
  }
  const redeemed = await env.DB.prepare("UPDATE auth_magic_links SET used_at = datetime('now'), account_id = ? WHERE id = ? AND used_at IS NULL AND expires_at > datetime('now')").bind(accountId, row.id).run();
  if ((redeemed.meta?.changes ?? 0) === 0) return Response.json({ status: 'already used' }, { status: 409 });
  if (row.purpose === 'signup') {
    await env.DB.prepare("UPDATE accounts SET terms_accepted_at = ?, terms_version = ?, privacy_version = ?, updated_at = datetime('now') WHERE id = ? AND auth_subject = ?").bind(row.terms_accepted_at, TERMS_VERSION, PRIVACY_VERSION, accountId, subject).run();
    if (row.name?.trim()) await env.DB.prepare("UPDATE persons SET display_name = ?, updated_at = datetime('now') WHERE account_id = ? AND role = 'self'").bind(row.name.trim().slice(0, MAX_NAME_LENGTH), accountId).run();
  } else {
    await env.DB.prepare("UPDATE auth_email_codes SET used_at = COALESCE(used_at, datetime('now')) WHERE account_id = ? AND used_at IS NULL").bind(accountId).run();
  }
  return createSessionResponse(env, accountId, subject, createdAccount, returnTo);
}

async function redeemEmailCode(env: Env, rawEmail?: string, rawCode?: string): Promise<Response> {
  const email = normalizeEmail(rawEmail ?? '');
  const code = rawCode?.replace(/\s+/g, '') ?? '';
  if (!validEmail(email) || !/^\d{6}$/.test(code)) return invalidCodeResponse();
  const row = await env.DB.prepare("SELECT id, account_id, code_hash, return_to, attempts, max_attempts, expires_at, used_at FROM auth_email_codes WHERE email_normalized = ? ORDER BY created_at DESC LIMIT 1")
    .bind(email).first<{ id: string; account_id: string; code_hash: string; return_to: string; attempts: number; max_attempts: number; expires_at: string; used_at: string | null }>();
  if (!row || row.used_at || !Number.isFinite(parseSqliteTimestamp(row.expires_at)) || parseSqliteTimestamp(row.expires_at) < Date.now() || Number(row.attempts) >= Number(row.max_attempts)) return invalidCodeResponse();
  const submittedHash = await emailCodeHash(env, email, code);
  if (!constantTimeEqual(submittedHash, row.code_hash)) {
    await env.DB.prepare("UPDATE auth_email_codes SET attempts = attempts + 1 WHERE id = ? AND used_at IS NULL AND attempts < max_attempts").bind(row.id).run();
    return invalidCodeResponse();
  }
  const account = await env.DB.prepare('SELECT id, auth_subject FROM accounts WHERE id = ?').bind(row.account_id).first<{ id: string; auth_subject: string }>();
  const subject = `email:${email}`;
  if (!account || account.auth_subject !== subject) return invalidCodeResponse();
  const redeemed = await env.DB.prepare("UPDATE auth_email_codes SET used_at = datetime('now') WHERE id = ? AND used_at IS NULL AND attempts < max_attempts AND expires_at > datetime('now')").bind(row.id).run();
  if ((redeemed.meta?.changes ?? 0) === 0) return invalidCodeResponse();
  await env.DB.prepare("UPDATE auth_magic_links SET used_at = COALESCE(used_at, datetime('now')) WHERE account_id = ? AND purpose = 'login' AND used_at IS NULL").bind(account.id).run();
  return createSessionResponse(env, account.id, subject, false, safeReturnTo(row.return_to));
}

async function createSessionResponse(env: Env, accountId: string, subject: string, createdAccount: boolean, returnTo: string): Promise<Response> {
  const sessionId = `session_${crypto.randomUUID()}`;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const tokenValue = await createSignedSessionToken({ sub: subject, exp, sid: sessionId }, env.SESSION_SIGNING_SECRET);
  await env.DB.prepare("INSERT INTO auth_sessions (id, account_id, subject, session_hash, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+30 days'))").bind(sessionId, accountId, subject, await sha256(tokenValue)).run();
  const onboarding = await env.DB.prepare('SELECT onboarding_completed_at FROM accounts WHERE id = ?').bind(accountId).first<{ onboarding_completed_at?: string | null }>();
  return Response.json({ status: 'success', createdAccount, next: onboarding?.onboarding_completed_at ? safeReturnTo(returnTo) : '/onboarding' }, { headers: { 'set-cookie': cookie('__Host-sovereign_session', tokenValue), 'cache-control': 'no-store' } });
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export async function logout(request: Request, env: Env, all = false): Promise<Response> {
  const auth = await import('./security/auth').then((module) => module.requireAuth(request, env));
  if (all) await env.DB.prepare("UPDATE auth_sessions SET revoked_at = datetime('now') WHERE account_id = ? AND revoked_at IS NULL").bind(auth.accountId).run();
  else if (auth.sessionId) await env.DB.prepare("UPDATE auth_sessions SET revoked_at = datetime('now') WHERE id = ? AND account_id = ? AND revoked_at IS NULL").bind(auth.sessionId, auth.accountId).run();
  return Response.json({ status: 'success' }, { headers: { 'set-cookie': cookie('__Host-sovereign_session', 'deleted', 0) } });
}
