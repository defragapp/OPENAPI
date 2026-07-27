import type { Env } from './env';
import { verifyTurnstile } from './auth-public';
import { sendOperationalEmail } from './email';
import { resolveAccount } from './db/accounts';
import { issueAccountSession, revokeAccountSessions } from './auth-session';

const encoder = new TextEncoder();
const PASSWORD_ITERATIONS = 210_000;
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 128;
const RESET_TTL_MINUTES = 30;
const TERMS_VERSION = '2026-07-26';
const PRIVACY_VERSION = '2026-07-26';

interface PasswordRecord {
  hash: string;
  salt: string;
  iterations: number;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validEmail(value: string): boolean {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPassword(value: string): boolean {
  return value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;
}

function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0));
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

export async function derivePasswordRecord(password: string): Promise<PasswordRecord> {
  if (!validPassword(password)) throw new Response(`Password must be ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters.`, { status: 400 });
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return {
    hash: base64UrlEncode(await derive(password, salt, PASSWORD_ITERATIONS)),
    salt: base64UrlEncode(salt),
    iterations: PASSWORD_ITERATIONS
  };
}

export async function verifyPasswordRecord(password: string, record: PasswordRecord): Promise<boolean> {
  if (!validPassword(password) || record.iterations < 100_000 || record.iterations > 1_000_000) return false;
  let expected: Uint8Array;
  try {
    expected = base64UrlDecode(record.hash);
  } catch {
    return false;
  }
  const actual = await derive(password, base64UrlDecode(record.salt), record.iterations);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index]! ^ expected[index]!;
  return difference === 0;
}

function responseWithSession(payload: Record<string, unknown>, cookie: string): Response {
  return Response.json(payload, {
    headers: {
      'set-cookie': cookie,
      'cache-control': 'private, no-store'
    }
  });
}

function planDestination(plan: unknown, interval: unknown): string {
  const selectedPlan = plan === 'sovereign_plus' ? 'sovereign_plus' : 'free';
  const selectedInterval = interval === 'annual' ? 'annual' : 'monthly';
  return `/onboarding?plan=${selectedPlan}&interval=${selectedInterval}`;
}

async function nextForExistingAccount(env: Env, accountId: string): Promise<string> {
  const baseline = await env.DB.prepare('SELECT status FROM baseline_onboarding WHERE account_id = ?')
    .bind(accountId)
    .first<{ status: string }>();
  return baseline && ['completed', 'partial'].includes(baseline.status) ? '/app' : '/onboarding';
}

export async function passwordSignup(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({})) as {
    name?: string;
    email?: string;
    password?: string;
    termsAccepted?: boolean;
    turnstileToken?: string;
    plan?: string;
    interval?: string;
  };
  const name = body.name?.trim() ?? '';
  const email = normalizeEmail(body.email ?? '');
  const password = body.password ?? '';

  if (!name || name.length > 120 || !validEmail(email) || !validPassword(password) || body.termsAccepted !== true) {
    return Response.json({ error: 'Enter your name, a valid email, a password of at least 10 characters, and accept the Terms and Privacy Policy.' }, { status: 400 });
  }
  await verifyTurnstile(env, body.turnstileToken, request.headers.get('cf-connecting-ip') ?? undefined, 'signup');

  const subject = `email:${email}`;
  const existingAccount = await env.DB.prepare('SELECT id FROM accounts WHERE auth_subject = ?').bind(subject).first<{ id: string }>();
  if (existingAccount) {
    return Response.json({ error: 'That email is already in use. Sign in or reset your password.' }, { status: 409 });
  }

  const account = await resolveAccount(env, subject);
  const record = await derivePasswordRecord(password);
  const acceptedAt = new Date().toISOString();
  try {
    await env.DB.prepare(`INSERT INTO auth_password_credentials
      (account_id, email_normalized, password_hash, password_salt, password_iterations)
      VALUES (?, ?, ?, ?, ?)`)
      .bind(account.accountId, email, record.hash, record.salt, record.iterations)
      .run();
    await env.DB.prepare(`UPDATE accounts SET terms_accepted_at = ?, terms_version = ?, privacy_version = ?, updated_at = datetime('now') WHERE id = ?`)
      .bind(acceptedAt, TERMS_VERSION, PRIVACY_VERSION, account.accountId)
      .run();
    await env.DB.prepare("UPDATE persons SET display_name = ? WHERE account_id = ? AND role = 'self'")
      .bind(name, account.accountId)
      .run();
  } catch (error) {
    await env.DB.prepare('DELETE FROM accounts WHERE id = ?').bind(account.accountId).run().catch(() => undefined);
    throw error;
  }

  const session = await issueAccountSession(env, account.accountId, subject);
  return responseWithSession({ status: 'success', next: planDestination(body.plan, body.interval) }, session.cookie);
}

export async function passwordLogin(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { email?: string; password?: string; turnstileToken?: string };
  const email = normalizeEmail(body.email ?? '');
  const password = body.password ?? '';
  if (!validEmail(email) || !validPassword(password)) return Response.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  await verifyTurnstile(env, body.turnstileToken, request.headers.get('cf-connecting-ip') ?? undefined, 'login');

  const credential = await env.DB.prepare(`SELECT c.account_id, c.password_hash, c.password_salt, c.password_iterations, a.auth_subject
    FROM auth_password_credentials c
    JOIN accounts a ON a.id = c.account_id
    WHERE c.email_normalized = ?`)
    .bind(email)
    .first<{ account_id: string; password_hash: string; password_salt: string; password_iterations: number; auth_subject: string }>();

  const valid = credential
    ? await verifyPasswordRecord(password, {
      hash: credential.password_hash,
      salt: credential.password_salt,
      iterations: credential.password_iterations
    })
    : false;
  if (!credential || !valid) return Response.json({ error: 'Email or password is incorrect.' }, { status: 401 });

  const session = await issueAccountSession(env, credential.account_id, credential.auth_subject);
  return responseWithSession({ status: 'success', next: await nextForExistingAccount(env, credential.account_id) }, session.cookie);
}

export async function requestPasswordReset(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { email?: string; turnstileToken?: string };
  const email = normalizeEmail(body.email ?? '');
  if (!validEmail(email)) return Response.json({ status: 'sent' });
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  await verifyTurnstile(env, body.turnstileToken, ip, 'forgot-password');

  const account = await env.DB.prepare('SELECT id FROM accounts WHERE auth_subject = ?').bind(`email:${email}`).first<{ id: string }>();
  if (!account) return Response.json({ status: 'sent' });

  const ipHash = await sha256(ip);
  const recent = await env.DB.prepare("SELECT COUNT(*) AS count FROM auth_password_resets WHERE requested_ip_hash = ? AND created_at > datetime('now', '-15 minutes')")
    .bind(ipHash)
    .first<{ count: number }>();
  if (Number(recent?.count ?? 0) >= 10) return Response.json({ status: 'sent' });

  const token = randomToken();
  const id = `reset_${crypto.randomUUID()}`;
  await env.DB.prepare(`INSERT INTO auth_password_resets (id, account_id, token_hash, expires_at, requested_ip_hash)
    VALUES (?, ?, ?, datetime('now', '+${RESET_TTL_MINUTES} minutes'), ?)`)
    .bind(id, account.id, await sha256(token), ipHash)
    .run();

  const baseUrl = env.PUBLIC_APP_URL || new URL(request.url).origin;
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  try {
    await sendOperationalEmail(env, {
      to: email,
      subject: 'Reset your Sovereign.OS password',
      text: `Reset your Sovereign.OS password using this link: ${resetUrl}\n\nThe link expires in ${RESET_TTL_MINUTES} minutes. If you did not request this, you can ignore this email.`,
      idempotencyKey: id
    });
  } catch {
    await env.DB.prepare('DELETE FROM auth_password_resets WHERE id = ?').bind(id).run();
    throw new Response('Password recovery email is temporarily unavailable.', { status: 503 });
  }

  return Response.json({ status: 'sent' });
}

export async function resetPassword(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { token?: string; password?: string };
  const token = body.token ?? '';
  const password = body.password ?? '';
  if (token.length < 32 || token.length > 512 || !validPassword(password)) {
    return Response.json({ error: 'Use a valid reset link and a password of at least 10 characters.' }, { status: 400 });
  }

  const row = await env.DB.prepare(`SELECT r.id, r.account_id, r.expires_at, r.used_at, a.auth_subject
    FROM auth_password_resets r
    JOIN accounts a ON a.id = r.account_id
    WHERE r.token_hash = ?`)
    .bind(await sha256(token))
    .first<{ id: string; account_id: string; expires_at: string; used_at?: string | null; auth_subject: string }>();
  if (!row || row.used_at || Date.parse(row.expires_at) < Date.now()) {
    return Response.json({ error: 'This reset link is invalid or expired.' }, { status: 410 });
  }

  const updated = await env.DB.prepare("UPDATE auth_password_resets SET used_at = datetime('now') WHERE id = ? AND used_at IS NULL AND expires_at > datetime('now')")
    .bind(row.id)
    .run();
  if ((updated.meta?.changes ?? 0) === 0) return Response.json({ error: 'This reset link is invalid or expired.' }, { status: 410 });

  const email = row.auth_subject.startsWith('email:') ? row.auth_subject.slice('email:'.length) : '';
  if (!validEmail(email)) throw new Response('This account cannot use password recovery.', { status: 400 });
  const record = await derivePasswordRecord(password);
  await env.DB.prepare(`INSERT INTO auth_password_credentials
    (account_id, email_normalized, password_hash, password_salt, password_iterations, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(account_id) DO UPDATE SET
      email_normalized = excluded.email_normalized,
      password_hash = excluded.password_hash,
      password_salt = excluded.password_salt,
      password_iterations = excluded.password_iterations,
      updated_at = datetime('now')`)
    .bind(row.account_id, email, record.hash, record.salt, record.iterations)
    .run();

  await revokeAccountSessions(env, row.account_id);
  const session = await issueAccountSession(env, row.account_id, row.auth_subject);
  return responseWithSession({ status: 'success', next: await nextForExistingAccount(env, row.account_id) }, session.cookie);
}
