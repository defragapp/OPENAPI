import type { Env } from './env';
import { resolveAccount } from './db/accounts';
import { issueAccountSession } from './auth-session';

export type OAuthProvider = 'apple' | 'google';
type OAuthIntent = 'signup' | 'login';
type OAuthJwk = JsonWebKey & { kid?: string };

const encoder = new TextEncoder();
const TERMS_VERSION = '2026-07-26';
const PRIVACY_VERSION = '2026-07-26';
const STATE_TTL_MINUTES = 10;
const OAUTH_STATE_COOKIE = '__Host-sovereign_oauth_state';

interface OAuthStateRow {
  id: string;
  provider: OAuthProvider;
  intent: OAuthIntent;
  nonce_hash: string;
  return_path: string;
  plan_key?: string | null;
  billing_interval?: string | null;
  terms_accepted_at?: string | null;
  expires_at: string;
  used_at?: string | null;
}

interface IdTokenClaims {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  exp?: number;
  nonce?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validEmail(value: string): boolean {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function providerConfig(env: Env, provider: OAuthProvider) {
  if (provider === 'google') {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) throw new Response('Google sign-in is not configured.', { status: 503 });
    return {
      clientId: env.GOOGLE_CLIENT_ID,
      redirectUri: env.GOOGLE_REDIRECT_URI,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs',
      tokenUrl: 'https://oauth2.googleapis.com/token'
    };
  }
  if (!env.APPLE_CLIENT_ID || !env.APPLE_TEAM_ID || !env.APPLE_KEY_ID || !env.APPLE_PRIVATE_KEY || !env.APPLE_REDIRECT_URI) {
    throw new Response('Apple sign-in is not configured.', { status: 503 });
  }
  return {
    clientId: env.APPLE_CLIENT_ID,
    redirectUri: env.APPLE_REDIRECT_URI,
    issuer: ['https://appleid.apple.com'],
    jwksUrl: 'https://appleid.apple.com/auth/keys',
    tokenUrl: 'https://appleid.apple.com/auth/token'
  };
}

function safeIntent(value: string | null): OAuthIntent {
  return value === 'login' ? 'login' : 'signup';
}

function safePlan(value: string | null): 'free' | 'sovereign_plus' {
  return value === 'sovereign_plus' ? 'sovereign_plus' : 'free';
}

function safeInterval(value: string | null): 'monthly' | 'annual' {
  return value === 'annual' ? 'annual' : 'monthly';
}

function onboardingDestination(plan: string | null | undefined, interval: string | null | undefined): string {
  return `/onboarding?plan=${safePlan(plan ?? null)}&interval=${safeInterval(interval ?? null)}`;
}

function oauthStateCookie(state: string): string {
  return `${OAUTH_STATE_COOKIE}=${state}; Path=/; Max-Age=${STATE_TTL_MINUTES * 60}; HttpOnly; Secure; SameSite=None; Priority=High`;
}

function clearOAuthStateCookie(): string {
  return `${OAUTH_STATE_COOKIE}=deleted; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None; Priority=High`;
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}

function redirectResponse(path: string, cookies: string[] = []): Response {
  const headers = new Headers({ location: path, 'cache-control': 'private, no-store' });
  for (const cookie of cookies) headers.append('set-cookie', cookie);
  return new Response(null, { status: 303, headers });
}

function providerRedirect(url: string, state: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      location: url,
      'cache-control': 'private, no-store',
      'set-cookie': oauthStateCookie(state)
    }
  });
}

function errorRedirect(intent: OAuthIntent, code: string, plan?: string | null, interval?: string | null): Response {
  const query = new URLSearchParams({ error: code });
  if (plan) query.set('plan', safePlan(plan));
  if (interval) query.set('interval', safeInterval(interval));
  return redirectResponse(`/${intent === 'signup' ? 'signup' : 'login'}?${query.toString()}`, [clearOAuthStateCookie()]);
}

export async function startOAuth(request: Request, env: Env, provider: OAuthProvider): Promise<Response> {
  const url = new URL(request.url);
  const intent = safeIntent(url.searchParams.get('intent'));
  const plan = safePlan(url.searchParams.get('plan'));
  const interval = safeInterval(url.searchParams.get('interval'));
  const termsAccepted = url.searchParams.get('terms') === 'accepted';
  if (intent === 'signup' && !termsAccepted) return errorRedirect(intent, 'accept_terms', plan, interval);
  const config = providerConfig(env, provider);

  const state = randomToken();
  const nonce = randomToken();
  const id = `oauth_${crypto.randomUUID()}`;
  const acceptedAt = intent === 'signup' ? new Date().toISOString() : null;
  await env.DB.prepare(`INSERT INTO auth_oauth_states
    (id, provider, intent, state_hash, nonce_hash, return_path, plan_key, billing_interval, terms_accepted_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+${STATE_TTL_MINUTES} minutes'))`)
    .bind(id, provider, intent, await sha256(state), await sha256(nonce), intent === 'signup' || plan === 'sovereign_plus' ? '/onboarding' : '/app', plan, interval, acceptedAt)
    .run();

  const authorize = provider === 'google'
    ? new URL('https://accounts.google.com/o/oauth2/v2/auth')
    : new URL('https://appleid.apple.com/auth/authorize');
  authorize.searchParams.set('client_id', config.clientId);
  authorize.searchParams.set('redirect_uri', config.redirectUri);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('scope', provider === 'google' ? 'openid email profile' : 'name email');
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('nonce', nonce);
  if (provider === 'google') {
    authorize.searchParams.set('prompt', 'select_account');
  } else {
    authorize.searchParams.set('response_mode', 'form_post');
  }
  return providerRedirect(authorize.toString(), state);
}

export async function finishOAuth(request: Request, env: Env, provider: OAuthProvider): Promise<Response> {
  try {
    const callback = await readCallback(request, provider);
    if (!callback.state || !callback.code) return errorRedirect('login', 'oauth_cancelled');
    const stateHash = await sha256(callback.state);
    const browserState = readCookie(request, OAUTH_STATE_COOKIE);
    if (!browserState || await sha256(browserState) !== stateHash) return errorRedirect('login', 'oauth_invalid');

    const state = await env.DB.prepare(`SELECT id, provider, intent, nonce_hash, return_path, plan_key, billing_interval, terms_accepted_at, expires_at, used_at
      FROM auth_oauth_states WHERE state_hash = ?`)
      .bind(stateHash)
      .first<OAuthStateRow>();
    if (!state || state.provider !== provider || state.used_at || Date.parse(state.expires_at) < Date.now()) return errorRedirect('login', 'oauth_expired');

    const claimed = await env.DB.prepare("UPDATE auth_oauth_states SET used_at = datetime('now') WHERE id = ? AND used_at IS NULL AND expires_at > datetime('now')")
      .bind(state.id)
      .run();
    if ((claimed.meta?.changes ?? 0) === 0) return errorRedirect(state.intent, 'oauth_expired', state.plan_key, state.billing_interval);

    const config = providerConfig(env, provider);
    const idToken = await exchangeCode(env, provider, callback.code, config);
    const claims = await verifyIdToken(idToken, provider, config.clientId, config.issuer, config.jwksUrl);
    if (!claims.sub || !claims.nonce || await sha256(claims.nonce) !== state.nonce_hash) return errorRedirect(state.intent, 'oauth_invalid', state.plan_key, state.billing_interval);
    const email = normalizeEmail(claims.email ?? '');
    const verified = claims.email_verified === true || claims.email_verified === 'true';
    if (!validEmail(email) || !verified) return errorRedirect(state.intent, 'email_not_verified', state.plan_key, state.billing_interval);

    const existingIdentity = await env.DB.prepare('SELECT account_id FROM auth_external_identities WHERE provider = ? AND provider_subject = ?')
      .bind(provider, claims.sub)
      .first<{ account_id: string }>();
    let accountId = existingIdentity?.account_id;
    let subject = `email:${email}`;

    if (accountId) {
      const account = await env.DB.prepare('SELECT auth_subject FROM accounts WHERE id = ?').bind(accountId).first<{ auth_subject: string }>();
      if (!account) return errorRedirect(state.intent, 'account_unavailable', state.plan_key, state.billing_interval);
      subject = account.auth_subject;
    } else {
      const accountByEmail = await env.DB.prepare('SELECT id, auth_subject FROM accounts WHERE auth_subject = ?')
        .bind(subject)
        .first<{ id: string; auth_subject: string }>();
      if (accountByEmail) {
        accountId = accountByEmail.id;
        subject = accountByEmail.auth_subject;
      } else if (state.intent === 'signup' && state.terms_accepted_at) {
        accountId = (await resolveAccount(env, subject)).accountId;
      } else {
        return errorRedirect(state.intent, 'create_account_first', state.plan_key, state.billing_interval);
      }

      await env.DB.prepare(`INSERT INTO auth_external_identities (provider, provider_subject, account_id, email_normalized)
        VALUES (?, ?, ?, ?)`)
        .bind(provider, claims.sub, accountId, email)
        .run();
    }

    if (state.intent === 'signup' && state.terms_accepted_at) {
      await env.DB.prepare(`UPDATE accounts SET terms_accepted_at = ?, terms_version = ?, privacy_version = ?, updated_at = datetime('now') WHERE id = ?`)
        .bind(state.terms_accepted_at, TERMS_VERSION, PRIVACY_VERSION, accountId)
        .run();
      const displayName = callback.name || claims.name;
      if (displayName?.trim()) {
        await env.DB.prepare("UPDATE persons SET display_name = ? WHERE account_id = ? AND role = 'self'")
          .bind(displayName.trim().slice(0, 120), accountId)
          .run();
      }
    }

    const session = await issueAccountSession(env, accountId, subject);
    const next = state.intent === 'signup' || state.plan_key === 'sovereign_plus'
      ? onboardingDestination(state.plan_key, state.billing_interval)
      : await existingAccountDestination(env, accountId);
    return redirectResponse(next, [session.cookie, clearOAuthStateCookie()]);
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) return error;
    return errorRedirect('login', 'oauth_unavailable');
  }
}

async function existingAccountDestination(env: Env, accountId: string): Promise<string> {
  const baseline = await env.DB.prepare('SELECT status FROM baseline_onboarding WHERE account_id = ?')
    .bind(accountId)
    .first<{ status: string }>();
  return baseline && ['completed', 'partial'].includes(baseline.status) ? '/app' : '/onboarding';
}

async function readCallback(request: Request, provider: OAuthProvider): Promise<{ code: string; state: string; name?: string }> {
  if (provider === 'apple') {
    const form = await request.formData();
    const rawUser = String(form.get('user') ?? '');
    let name: string | undefined;
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser) as { name?: { firstName?: string; lastName?: string } };
        name = [user.name?.firstName, user.name?.lastName].filter(Boolean).join(' ') || undefined;
      } catch {
        name = undefined;
      }
    }
    return { code: String(form.get('code') ?? ''), state: String(form.get('state') ?? ''), ...(name ? { name } : {}) };
  }
  const url = new URL(request.url);
  return { code: url.searchParams.get('code') ?? '', state: url.searchParams.get('state') ?? '' };
}

async function exchangeCode(env: Env, provider: OAuthProvider, code: string, config: ReturnType<typeof providerConfig>): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    redirect_uri: config.redirectUri
  });
  if (provider === 'google') body.set('client_secret', env.GOOGLE_CLIENT_SECRET!);
  else body.set('client_secret', await createAppleClientSecret(env));

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(10_000)
  });
  const payload = await response.json().catch(() => ({})) as { id_token?: string };
  if (!response.ok || !payload.id_token) throw new Error('oauth_token_exchange_failed');
  return payload.id_token;
}

async function verifyIdToken(token: string, provider: OAuthProvider, audience: string, issuers: string[], jwksUrl: string): Promise<IdTokenClaims> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('invalid_id_token');
  const [headerPart, payloadPart, signaturePart] = parts;
  if (!headerPart || !payloadPart || !signaturePart) throw new Error('invalid_id_token');
  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerPart))) as { alg?: string; kid?: string };
  const claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart))) as IdTokenClaims;
  if (header.alg !== 'RS256' || !header.kid || !claims.iss || !issuers.includes(claims.iss)) throw new Error('invalid_id_token');
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(audience) || !claims.exp || claims.exp <= Math.floor(Date.now() / 1000)) throw new Error('invalid_id_token');

  const keysResponse = await fetch(jwksUrl, { signal: AbortSignal.timeout(8_000) });
  const keysPayload = await keysResponse.json() as { keys?: OAuthJwk[] };
  const jwk = keysPayload.keys?.find((candidate) => candidate.kid === header.kid);
  if (!keysResponse.ok || !jwk) throw new Error('oauth_jwk_unavailable');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const signed = encoder.encode(`${headerPart}.${payloadPart}`);
  const verified = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, base64UrlDecode(signaturePart) as BufferSource, signed);
  if (!verified) throw new Error('invalid_id_token');
  if (provider === 'apple' && claims.iss !== 'https://appleid.apple.com') throw new Error('invalid_id_token');
  return claims;
}

async function createAppleClientSecret(env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(encoder.encode(JSON.stringify({ alg: 'ES256', kid: env.APPLE_KEY_ID, typ: 'JWT' })));
  const payload = base64UrlEncode(encoder.encode(JSON.stringify({
    iss: env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 15 * 60,
    aud: 'https://appleid.apple.com',
    sub: env.APPLE_CLIENT_ID
  })));
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(env.APPLE_PRIVATE_KEY!),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const signature = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, encoder.encode(unsigned)));
  return `${unsigned}.${base64UrlEncode(signature)}`;
}

function pemToArrayBuffer(value: string): ArrayBuffer {
  const normalized = value.replace(/\\n/g, '\n');
  const base64 = normalized.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  return bytes.buffer as ArrayBuffer;
}
