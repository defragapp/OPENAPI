import type { AuthContext, Env } from '../env';
import { resolveAccount } from '../db/accounts';
import { resolveExistingIdentity } from '../adapters/sovv';

const encoder = new TextEncoder();

function unauthorized(): never {
  throw new Response('Unauthorized', { status: 401 });
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
}

function base64UrlEncode(value: Uint8Array): string {
  return btoa(String.fromCharCode(...value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacSignature(unsigned: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(unsigned)));
}

async function verifySignature(unsigned: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, base64UrlDecode(signature), encoder.encode(unsigned));
}

export async function createSignedSessionToken(payload: { sub: string; exp?: number; sid?: string }, secret: string): Promise<string> {
  const unsigned = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await hmacSignature(unsigned, secret);
  return `${unsigned}.${base64UrlEncode(signature)}`;
}

export async function requireAuth(request: Request, env: Env): Promise<AuthContext> {
  const sovvCookie = readCookie(request, '__sov_session');
  if (sovvCookie && env.SOVV_INTERNAL_BASE_URL) {
    const identity = await resolveExistingIdentity(env, `__sov_session=${sovvCookie}`);
    return { ...(await resolveAccount(env, identity.data.subject)), sovvCookieHeader: `__sov_session=${sovvCookie}` };
  }

  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : readCookie(request, '__Host-sovereign_session');
  if (!token) unauthorized();
  const [payloadPart, signaturePart] = token.split('.');
  if (!payloadPart || !signaturePart || !env.SESSION_SIGNING_SECRET) unauthorized();
  const ok = await verifySignature(payloadPart, signaturePart, env.SESSION_SIGNING_SECRET);
  if (!ok) unauthorized();
  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart))) as { sub?: string; exp?: number; sid?: string };
  if (!payload.sub || (payload.exp && payload.exp < Math.floor(Date.now() / 1000))) unauthorized();
  if (payload.sid) {
    const session = await env.DB.prepare('SELECT revoked_at, expires_at FROM auth_sessions WHERE id = ?').bind(payload.sid).first<{ revoked_at?: string | null; expires_at: string }>();
    if (!session || session.revoked_at || Date.parse(session.expires_at) < Date.now()) unauthorized();
    await env.DB.prepare("UPDATE auth_sessions SET last_seen_at = datetime('now') WHERE id = ?").bind(payload.sid).run();
  }
  return { ...(await resolveAccount(env, payload.sub)), sessionId: payload.sid };
}

function readCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get('cookie');
  if (!cookie) return undefined;
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  const url = new URL(request.url);
  if (origin && origin !== url.origin) throw new Response('Forbidden origin', { status: 403 });
}
