import type { Env } from './env';
import { verifyTurnstile } from './auth-public';
import { sendOperationalEmail } from './email';
import { issueAccountSession, revokeAccountSessions } from './auth-session';

const encoder = new TextEncoder();
const CREDENTIAL_VERSION = 'browser-key-v1';
const MIN_KDF_ITERATIONS = 600_000;
const MAX_KDF_ITERATIONS = 2_000_000;
const RESET_TTL_MINUTES = 30;
const CHALLENGE_TTL_MINUTES = 5;
const TERMS_VERSION = '2026-07-26';
const PRIVACY_VERSION = '2026-07-26';
const MAX_FAILED_EMAIL_ATTEMPTS = 8;
const MAX_FAILED_IP_ATTEMPTS = 30;
const MAX_CHALLENGES_PER_EMAIL = 12;
const MAX_CHALLENGES_PER_IP = 40;

interface PasswordEnvelopeInput {
  publicKeyJwk?: unknown;
  encryptedPrivateKey?: unknown;
  encryptionIv?: unknown;
  kdfSalt?: unknown;
  kdfIterations?: unknown;
  credentialVersion?: unknown;
}

interface PasswordEnvelope {
  publicKeyJwk: JsonWebKey;
  encryptedPrivateKey: string;
  encryptionIv: string;
  kdfSalt: string;
  kdfIterations: number;
  credentialVersion: typeof CREDENTIAL_VERSION;
}

interface StoredCredential {
  account_id: string;
  encrypted_private_key: string;
  encryption_iv: string;
  kdf_salt: string;
  kdf_iterations: number;
  credential_version: string;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validEmail(value: string): boolean {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function randomBytes(byteLength: number): Uint8Array {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytes;
}

function randomToken(byteLength = 32): string {
  return base64UrlEncode(randomBytes(byteLength));
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

function validBase64Url(value: unknown, minBytes: number, maxBytes: number): value is string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value) || value.length > maxBytes * 2) return false;
  try {
    const bytes = base64UrlDecode(value);
    return bytes.length >= minBytes && bytes.length <= maxBytes;
  } catch {
    return false;
  }
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function parsePublicKeyJwk(value: unknown): JsonWebKey | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const jwk = value as JsonWebKey & { kty?: string; crv?: string; x?: string };
  if (jwk.kty !== 'OKP' || jwk.crv !== 'Ed25519' || !validBase64Url(jwk.x, 32, 32)) return undefined;
  return {
    kty: 'OKP',
    crv: 'Ed25519',
    x: jwk.x,
    ext: true,
    key_ops: ['verify']
  } as JsonWebKey;
}

async function validateEnvelope(input: PasswordEnvelopeInput): Promise<PasswordEnvelope> {
  const publicKeyJwk = parsePublicKeyJwk(input.publicKeyJwk);
  const encryptedPrivateKey = input.encryptedPrivateKey;
  const encryptionIv = input.encryptionIv;
  const kdfSalt = input.kdfSalt;
  const kdfIterations = Number(input.kdfIterations);
  const credentialVersion = input.credentialVersion;

  if (
    !publicKeyJwk
    || !validBase64Url(encryptedPrivateKey, 48, 2048)
    || !validBase64Url(encryptionIv, 12, 12)
    || !validBase64Url(kdfSalt, 16, 32)
    || !Number.isInteger(kdfIterations)
    || kdfIterations < MIN_KDF_ITERATIONS
    || kdfIterations > MAX_KDF_ITERATIONS
    || credentialVersion !== CREDENTIAL_VERSION
  ) {
    throw new Response('Password credential is invalid.', { status: 400 });
  }

  try {
    await crypto.subtle.importKey('jwk', publicKeyJwk, { name: 'Ed25519' }, false, ['verify']);
  } catch {
    throw new Response('Password credential is invalid.', { status: 400 });
  }

  return {
    publicKeyJwk,
    encryptedPrivateKey,
    encryptionIv,
    kdfSalt,
    kdfIterations,
    credentialVersion
  };
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

async function nextForExistingAccount(env: Env, accountId: string, plan?: unknown, interval?: unknown): Promise<string> {
  if (plan === 'sovereign_plus') return planDestination(plan, interval);
  const baseline = await env.DB.prepare('SELECT status FROM baseline_onboarding WHERE account_id = ?')
    .bind(accountId)
    .first<{ status: string }>();
  return baseline && ['completed', 'partial'].includes(baseline.status) ? '/app' : '/onboarding';
}

async function requestKeys(request: Request, email: string): Promise<{ emailHash: string; ipHash: string }> {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const [emailHash, ipHash] = await Promise.all([sha256(email), sha256(ip)]);
  return { emailHash, ipHash };
}

async function assertChallengeAllowed(env: Env, emailHash: string, ipHash: string): Promise<void> {
  const [emailFailures, ipFailures, emailChallenges, ipChallenges] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM auth_login_attempts WHERE email_hash = ? AND succeeded = 0 AND created_at > datetime('now', '-15 minutes')")
      .bind(emailHash)
      .first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM auth_login_attempts WHERE ip_hash = ? AND succeeded = 0 AND created_at > datetime('now', '-15 minutes')")
      .bind(ipHash)
      .first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM auth_password_challenges WHERE email_hash = ? AND created_at > datetime('now', '-15 minutes')")
      .bind(emailHash)
      .first<{ count: number }>(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM auth_password_challenges WHERE requested_ip_hash = ? AND created_at > datetime('now', '-15 minutes')")
      .bind(ipHash)
      .first<{ count: number }>()
  ]);
  if (
    Number(emailFailures?.count ?? 0) >= MAX_FAILED_EMAIL_ATTEMPTS
    || Number(ipFailures?.count ?? 0) >= MAX_FAILED_IP_ATTEMPTS
    || Number(emailChallenges?.count ?? 0) >= MAX_CHALLENGES_PER_EMAIL
    || Number(ipChallenges?.count ?? 0) >= MAX_CHALLENGES_PER_IP
  ) {
    throw new Response('Too many sign-in attempts. Wait 15 minutes and try again.', {
      status: 429,
      headers: { 'retry-after': '900' }
    });
  }
}

async function recordLoginAttempt(env: Env, emailHash: string, ipHash: string, succeeded: boolean): Promise<void> {
  await env.DB.prepare('INSERT INTO auth_login_attempts (id, email_hash, ip_hash, succeeded) VALUES (?, ?, ?, ?)')
    .bind(`login_${crypto.randomUUID()}`, emailHash, ipHash, succeeded ? 1 : 0)
    .run();
}

function genericLoginFailure(): Response {
  return Response.json({ error: 'Email or password is incorrect.' }, { status: 401, headers: { 'cache-control': 'private, no-store' } });
}

export function passwordProofMessage(email: string, challengeId: string, challenge: string): Uint8Array {
  return encoder.encode(`Sovereign.OS password proof v1\n${normalizeEmail(email)}\n${challengeId}\n${challenge}`);
}

export async function verifyPasswordSignature(publicKeyJwk: JsonWebKey, signature: string, message: Uint8Array): Promise<boolean> {
  if (!validBase64Url(signature, 64, 64)) return false;
  try {
    const key = await crypto.subtle.importKey('jwk', publicKeyJwk, { name: 'Ed25519' }, false, ['verify']);
    return crypto.subtle.verify('Ed25519', key, base64UrlDecode(signature) as BufferSource, message as BufferSource);
  } catch {
    return false;
  }
}

export async function passwordSignup(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({})) as PasswordEnvelopeInput & {
    name?: string;
    email?: string;
    termsAccepted?: boolean;
    turnstileToken?: string;
    plan?: string;
    interval?: string;
  };
  const name = body.name?.trim() ?? '';
  const email = normalizeEmail(body.email ?? '');
  if (!name || name.length > 120 || !validEmail(email) || body.termsAccepted !== true) {
    return Response.json({ error: 'Enter your name, a valid email, and accept the Terms and Privacy Policy.' }, { status: 400 });
  }
  await verifyTurnstile(env, body.turnstileToken, request.headers.get('cf-connecting-ip') ?? undefined, 'signup');
  const envelope = await validateEnvelope(body);

  const subject = `email:${email}`;
  const existingAccount = await env.DB.prepare('SELECT id FROM accounts WHERE auth_subject = ?').bind(subject).first<{ id: string }>();
  if (existingAccount) return Response.json({ error: 'That email is already in use. Sign in or reset your password.' }, { status: 409 });

  const accountId = crypto.randomUUID();
  const personId = crypto.randomUUID();
  const acceptedAt = new Date().toISOString();
  try {
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO accounts (id, auth_subject, terms_accepted_at, terms_version, privacy_version)
        VALUES (?, ?, ?, ?, ?)`)
        .bind(accountId, subject, acceptedAt, TERMS_VERSION, PRIVACY_VERSION),
      env.DB.prepare(`INSERT INTO persons
        (id, account_id, role, display_name, source_of_truth, baseline_status, consent_status)
        VALUES (?, ?, 'self', ?, 'authenticated_account', 'pending', 'granted')`)
        .bind(personId, accountId, name),
      env.DB.prepare(`INSERT INTO auth_password_credentials
        (account_id, email_normalized, public_key_jwk, encrypted_private_key, encryption_iv, kdf_salt, kdf_iterations, credential_version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(
          accountId,
          email,
          JSON.stringify(envelope.publicKeyJwk),
          envelope.encryptedPrivateKey,
          envelope.encryptionIv,
          envelope.kdfSalt,
          envelope.kdfIterations,
          envelope.credentialVersion
        )
    ]);
  } catch (error) {
    const collision = await env.DB.prepare(`SELECT id FROM accounts WHERE auth_subject = ?
      UNION SELECT account_id AS id FROM auth_password_credentials WHERE email_normalized = ? LIMIT 1`)
      .bind(subject, email)
      .first<{ id: string }>();
    if (collision) return Response.json({ error: 'That email is already in use. Sign in or reset your password.' }, { status: 409 });
    throw error;
  }

  const session = await issueAccountSession(env, accountId, subject);
  return responseWithSession({ status: 'success', next: planDestination(body.plan, body.interval) }, session.cookie);
}

export async function passwordChallenge(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { email?: string; turnstileToken?: string };
  const email = normalizeEmail(body.email ?? '');
  if (!validEmail(email)) return genericLoginFailure();
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const { emailHash, ipHash } = await requestKeys(request, email);
  await assertChallengeAllowed(env, emailHash, ipHash);
  await verifyTurnstile(env, body.turnstileToken, ip, 'login');

  const credential = await env.DB.prepare(`SELECT account_id, encrypted_private_key, encryption_iv, kdf_salt, kdf_iterations, credential_version
    FROM auth_password_credentials WHERE email_normalized = ?`)
    .bind(email)
    .first<StoredCredential>();

  const challengeId = `challenge_${crypto.randomUUID()}`;
  const challenge = randomToken(32);
  await env.DB.prepare(`INSERT INTO auth_password_challenges
    (id, account_id, email_hash, challenge_value, expires_at, requested_ip_hash)
    VALUES (?, ?, ?, ?, datetime('now', '+${CHALLENGE_TTL_MINUTES} minutes'), ?)`)
    .bind(challengeId, credential?.account_id ?? null, emailHash, challenge, ipHash)
    .run();

  const encryptedPrivateKey = credential?.encrypted_private_key ?? randomToken(96);
  const encryptionIv = credential?.encryption_iv ?? randomToken(12);
  const kdfSalt = credential?.kdf_salt ?? randomToken(16);
  const kdfIterations = credential?.kdf_iterations ?? MIN_KDF_ITERATIONS;
  const credentialVersion = credential?.credential_version ?? CREDENTIAL_VERSION;

  return Response.json({
    challengeId,
    challenge,
    credential: { encryptedPrivateKey, encryptionIv, kdfSalt, kdfIterations, credentialVersion }
  }, { headers: { 'cache-control': 'private, no-store' } });
}

export async function passwordLogin(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({})) as {
    email?: string;
    challengeId?: string;
    signature?: string;
    plan?: string;
    interval?: string;
  };
  const email = normalizeEmail(body.email ?? '');
  const challengeId = body.challengeId ?? '';
  const signature = body.signature ?? '';
  if (!validEmail(email) || !/^challenge_[A-Za-z0-9-]{20,}$/.test(challengeId) || !validBase64Url(signature, 64, 64)) return genericLoginFailure();

  const { emailHash, ipHash } = await requestKeys(request, email);
  const row = await env.DB.prepare(`SELECT ch.id, ch.account_id, ch.email_hash, ch.challenge_value, ch.expires_at, ch.used_at,
      a.auth_subject, c.public_key_jwk
    FROM auth_password_challenges ch
    LEFT JOIN accounts a ON a.id = ch.account_id
    LEFT JOIN auth_password_credentials c ON c.account_id = ch.account_id
    WHERE ch.id = ?`)
    .bind(challengeId)
    .first<{
      id: string;
      account_id?: string | null;
      email_hash: string;
      challenge_value: string;
      expires_at: string;
      used_at?: string | null;
      auth_subject?: string | null;
      public_key_jwk?: string | null;
    }>();

  if (!row || row.email_hash !== emailHash || row.used_at || Date.parse(row.expires_at) < Date.now()) {
    await recordLoginAttempt(env, emailHash, ipHash, false);
    return genericLoginFailure();
  }

  const claimed = await env.DB.prepare("UPDATE auth_password_challenges SET used_at = datetime('now') WHERE id = ? AND used_at IS NULL AND expires_at > datetime('now')")
    .bind(row.id)
    .run();
  if ((claimed.meta?.changes ?? 0) === 0 || !row.account_id || !row.auth_subject || !row.public_key_jwk) {
    await recordLoginAttempt(env, emailHash, ipHash, false);
    return genericLoginFailure();
  }

  let publicKeyJwk: JsonWebKey | undefined;
  try {
    publicKeyJwk = parsePublicKeyJwk(JSON.parse(row.public_key_jwk));
  } catch {
    publicKeyJwk = undefined;
  }
  const valid = publicKeyJwk
    ? await verifyPasswordSignature(publicKeyJwk, signature, passwordProofMessage(email, challengeId, row.challenge_value))
    : false;
  await recordLoginAttempt(env, emailHash, ipHash, valid);
  if (!valid) return genericLoginFailure();

  const session = await issueAccountSession(env, row.account_id, row.auth_subject);
  return responseWithSession({
    status: 'success',
    next: await nextForExistingAccount(env, row.account_id, body.plan, body.interval)
  }, session.cookie);
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
  const [recentIp, recentAccount] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM auth_password_resets WHERE requested_ip_hash = ? AND created_at > datetime('now', '-15 minutes')")
      .bind(ipHash)
      .first<{ count: number }>(),
    env.DB.prepare("SELECT id FROM auth_password_resets WHERE account_id = ? AND created_at > datetime('now', '-2 minutes')")
      .bind(account.id)
      .first<{ id: string }>()
  ]);
  if (Number(recentIp?.count ?? 0) >= 10 || recentAccount) return Response.json({ status: 'sent' });

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
  const body = await request.json().catch(() => ({})) as PasswordEnvelopeInput & { token?: string };
  const token = body.token ?? '';
  if (token.length < 32 || token.length > 512) return Response.json({ error: 'This reset link is invalid or expired.' }, { status: 410 });
  const envelope = await validateEnvelope(body);

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
  await env.DB.prepare(`INSERT INTO auth_password_credentials
    (account_id, email_normalized, public_key_jwk, encrypted_private_key, encryption_iv, kdf_salt, kdf_iterations, credential_version, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(account_id) DO UPDATE SET
      email_normalized = excluded.email_normalized,
      public_key_jwk = excluded.public_key_jwk,
      encrypted_private_key = excluded.encrypted_private_key,
      encryption_iv = excluded.encryption_iv,
      kdf_salt = excluded.kdf_salt,
      kdf_iterations = excluded.kdf_iterations,
      credential_version = excluded.credential_version,
      updated_at = datetime('now')`)
    .bind(
      row.account_id,
      email,
      JSON.stringify(envelope.publicKeyJwk),
      envelope.encryptedPrivateKey,
      envelope.encryptionIv,
      envelope.kdfSalt,
      envelope.kdfIterations,
      envelope.credentialVersion
    )
    .run();

  await revokeAccountSessions(env, row.account_id);
  const session = await issueAccountSession(env, row.account_id, row.auth_subject);
  return responseWithSession({ status: 'success', next: await nextForExistingAccount(env, row.account_id) }, session.cookie);
}
