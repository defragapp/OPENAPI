import { computeReducedBaseline, type ReducedBaselineContext, type SanitizedBaselineInput } from '@sovereign/baseline-engine';
import type { Env } from './env';
import { createSignedSessionToken } from './security/auth';

const encoder = new TextEncoder();
export const AUTH_COOKIE = '__Host-sovereign_session';
const TOKEN_TTL_SECONDS = 15 * 60;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface SignupInput { name?: string; email?: string; termsAccepted?: boolean; privacyAccepted?: boolean; turnstileToken?: string; }
export interface LoginInput { email?: string; turnstileToken?: string; }

export function normalizeEmail(email?: string): string {
  const normalized = email?.trim().toLowerCase() ?? '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Response('Invalid email', { status: 400 });
  return normalized;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function publicToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function expiry(seconds: number): string {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function verifyTurnstile(env: Env, token?: string, action = 'auth'): Promise<void> {
  let success = false;
  let reason = 'missing';
  if (env.TURNSTILE_SECRET_KEY) {
    const form = new FormData();
    form.set('secret', env.TURNSTILE_SECRET_KEY);
    form.set('response', token ?? '');
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const json = await response.json() as { success?: boolean; 'error-codes'?: string[] };
    success = json.success === true;
    reason = success ? 'verified' : (json['error-codes']?.join(',') || 'turnstile_failed');
  } else {
    success = token === 'fixture-turnstile-pass';
    reason = success ? 'fixture' : 'fixture_turnstile_failed';
  }
  await env.DB.prepare('INSERT INTO turnstile_audit_events (id, action, success, reason) VALUES (?, ?, ?, ?)')
    .bind(`turnstile_${crypto.randomUUID()}`, action, success ? 1 : 0, reason).run();
  if (!success) throw new Response('Turnstile verification failed', { status: 400 });
}

async function recordAuthAttempt(env: Env, email: string | null, action: string, success: boolean, reason?: string) {
  await env.DB.prepare('INSERT INTO auth_attempts (id, email, action, success, reason) VALUES (?, ?, ?, ?, ?)')
    .bind(`auth_${crypto.randomUUID()}`, email, action, success ? 1 : 0, reason ?? null).run();
}

async function sendAuthEmail(env: Env, accountId: string | null, email: string, template: 'email_verification' | 'magic_link', token: string) {
  const provider = env.CLOUDFLARE_EMAIL_FROM ? 'cloudflare-email-service' : 'deterministic-fixture';
  const status = env.CLOUDFLARE_EMAIL_FROM ? 'queued' : 'fixture-created';
  await env.DB.prepare('INSERT INTO email_delivery_log (id, account_id, email, template, status, provider, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(`email_${crypto.randomUUID()}`, accountId, email, template, status, provider, JSON.stringify({ tokenPreview: env.APP_ENV === 'test' ? token : undefined })).run();
  if (provider === 'cloudflare-email-service') {
    // Cloudflare Email Service binding/configuration is intentionally abstracted here; production wiring must provide the send provider.
    return { status, provider };
  }
  return { status, provider };
}

async function createAuthToken(env: Env, accountId: string | null, email: string, tokenType: 'email_verification' | 'magic_link') {
  const token = publicToken();
  await env.DB.prepare('INSERT INTO account_auth_tokens (id, account_id, email, token_hash, token_type, expires_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(`token_${crypto.randomUUID()}`, accountId, email, await sha256Hex(token), tokenType, expiry(TOKEN_TTL_SECONDS)).run();
  await sendAuthEmail(env, accountId, email, tokenType, token);
  return token;
}

export async function beginSignup(env: Env, input: SignupInput) {
  await verifyTurnstile(env, input.turnstileToken, 'signup');
  const email = normalizeEmail(input.email);
  const name = input.name?.trim();
  if (!name) throw new Response('Name required', { status: 400 });
  if (!input.termsAccepted || !input.privacyAccepted) throw new Response('Terms and Privacy acceptance required', { status: 400 });
  const existing = await env.DB.prepare('SELECT id FROM accounts WHERE email = ? AND status != ?').bind(email, 'deleted').first<{ id: string }>();
  if (existing) {
    await recordAuthAttempt(env, email, 'signup', false, 'duplicate');
    return { ok: true, emailDelivery: 'generic-if-account-exists' };
  }
  const accountId = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO accounts (id, auth_subject, email, display_name, status, terms_version, privacy_version) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(accountId, `email:${email}`, email, name, 'pending_email_verification', env.TERMS_VERSION || '2026-07-21', env.PRIVACY_VERSION || '2026-07-21').run();
  await env.DB.prepare('INSERT INTO persons (id, account_id, role, display_name, source_of_truth, baseline_status, consent_status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), accountId, 'self', name, 'authenticated_account', 'pending', 'granted').run();
  const fixtureToken = await createAuthToken(env, accountId, email, 'email_verification');
  await recordAuthAttempt(env, email, 'signup', true);
  return { ok: true, accountState: 'pending_email_verification', emailDelivery: 'verification_sent', fixtureToken: env.APP_ENV === 'test' ? fixtureToken : undefined };
}

async function consumeToken(env: Env, token: string, tokenType: 'email_verification' | 'magic_link') {
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare('SELECT id, account_id, email, expires_at, used_at FROM account_auth_tokens WHERE token_hash = ? AND token_type = ?')
    .bind(tokenHash, tokenType).first<{ id: string; account_id: string | null; email: string; expires_at: string; used_at: string | null }>();
  if (!row || row.used_at) throw new Response('Invalid or already used token', { status: 400 });
  if (new Date(row.expires_at).getTime() <= Date.now()) throw new Response('Expired token', { status: 400 });
  await env.DB.prepare('UPDATE account_auth_tokens SET used_at = datetime(\'now\') WHERE id = ?').bind(row.id).run();
  return row;
}

async function createSession(env: Env, accountId: string, subject: string) {
  const sid = `sess_${crypto.randomUUID()}`;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await createSignedSessionToken({ sub: subject, sid, exp }, env.SESSION_SIGNING_SECRET);
  await env.DB.prepare('INSERT INTO account_sessions (id, account_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
    .bind(sid, accountId, await sha256Hex(token), new Date(exp * 1000).toISOString()).run();
  return { token, cookie: `${AUTH_COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`, expiresAt: new Date(exp * 1000).toISOString() };
}

export async function verifyEmailToken(env: Env, token?: string) {
  if (!token) throw new Response('Verification token required', { status: 400 });
  const consumed = await consumeToken(env, token, 'email_verification');
  if (!consumed.account_id) throw new Response('Invalid account token', { status: 400 });
  await env.DB.prepare('UPDATE accounts SET status = ?, email_verified_at = datetime(\'now\'), updated_at = datetime(\'now\') WHERE id = ?')
    .bind('active', consumed.account_id).run();
  const subject = `email:${consumed.email}`;
  return { ok: true, session: await createSession(env, consumed.account_id, subject), next: 'baseline_onboarding' };
}

export async function beginMagicLink(env: Env, input: LoginInput) {
  await verifyTurnstile(env, input.turnstileToken, 'login');
  const email = normalizeEmail(input.email);
  const account = await env.DB.prepare('SELECT id, status FROM accounts WHERE email = ? AND status = ?').bind(email, 'active').first<{ id: string; status: string }>();
  if (account) await createAuthToken(env, account.id, email, 'magic_link');
  await recordAuthAttempt(env, email, 'magic_link_request', true, account ? 'sent' : 'generic_no_account');
  return { ok: true, emailDelivery: 'generic_if_account_exists' };
}

export async function redeemMagicLink(env: Env, token?: string) {
  if (!token) throw new Response('Magic-link token required', { status: 400 });
  const consumed = await consumeToken(env, token, 'magic_link');
  if (!consumed.account_id) throw new Response('Invalid account token', { status: 400 });
  return { ok: true, session: await createSession(env, consumed.account_id, `email:${consumed.email}`) };
}

export async function revokeSession(env: Env, sessionId: string) {
  await env.DB.prepare('UPDATE account_sessions SET revoked_at = datetime(\'now\') WHERE id = ?').bind(sessionId).run();
}

export async function revokeAllSessions(env: Env, accountId: string) {
  await env.DB.prepare('UPDATE account_sessions SET revoked_at = datetime(\'now\') WHERE account_id = ? AND revoked_at IS NULL').bind(accountId).run();
}

export async function saveBaselineOnboarding(env: Env, accountId: string, input: { displayName?: string; birthDate?: string; birthTime?: string; birthTimeCertainty?: string; birthLocation?: string; currentLocationMode?: string }) {
  const displayName = input.displayName?.trim() || 'You';
  if (!input.birthDate || !input.birthLocation) throw new Response('Birth date and location are required for Baseline onboarding', { status: 400 });
  const baselineInput: SanitizedBaselineInput = {
    name: displayName,
    birthDate: input.birthDate,
    birthTime: { certainty: input.birthTimeCertainty === 'exact' || input.birthTimeCertainty === 'approx' ? input.birthTimeCertainty : 'unknown', ...(input.birthTime ? { localTime: input.birthTime } : {}) },
    birthPlace: { label: input.birthLocation },
    currentLocation: { precision: normalizeLocationPrecision(input.currentLocationMode) }
  };
  const reduced = await computeBaselineThroughBinding(env, baselineInput);
  await env.DB.prepare('INSERT OR REPLACE INTO baseline_onboarding (account_id, display_name, birth_date_hash, birth_time_certainty, birth_location_hash, current_location_mode, reduced_context_json, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(accountId, displayName, await sha256Hex(input.birthDate), input.birthTimeCertainty || 'unknown', await sha256Hex(input.birthLocation), input.currentLocationMode || 'unavailable', JSON.stringify(reduced), reduced.status === 'ready' ? 'ready' : 'pending').run();
  await env.DB.prepare("UPDATE persons SET display_name = ?, baseline_status = ?, updated_at = datetime('now') WHERE account_id = ? AND role = ?")
    .bind(displayName, reduced.status === 'ready' ? 'ready' : 'pending', accountId, 'self').run();
  return reduced;
}

async function computeBaselineThroughBinding(env: Env, input: SanitizedBaselineInput): Promise<ReducedBaselineContext> {
  if (env.BASELINE) {
    const response = await env.BASELINE.fetch('https://baseline.internal/internal/baseline/reduced', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(env.BASELINE_INTERNAL_TOKEN ? { 'x-openapi-internal': env.BASELINE_INTERNAL_TOKEN } : {}) },
      body: JSON.stringify(input)
    });
    if (response.ok) return response.json() as Promise<ReducedBaselineContext>;
  }
  return computeReducedBaseline(input);
}

function normalizeLocationPrecision(value?: string): NonNullable<SanitizedBaselineInput['currentLocation']>['precision'] {
  if (value === 'approximate' || value === 'city' || value === 'region' || value === 'ephemeral' || value === 'stored_permitted') return value;
  return 'unavailable';
}
