import type { Env } from './env';
import { createSessionResponse, safeReturnTo } from './auth-public';
import { requireAuth } from './security/auth';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const CHALLENGE_TTL_MINUTES = 5;
const FLAG_USER_PRESENT = 0x01;
const FLAG_USER_VERIFIED = 0x04;
const FLAG_ATTESTED_CREDENTIAL = 0x40;
const MAX_CREDENTIAL_BYTES = 1024;
const MAX_CLIENT_DATA_BYTES = 8192;
const MAX_ATTESTATION_BYTES = 16384;
const MAX_SIGNATURE_BYTES = 256;

type ChallengePurpose = 'register' | 'login';
type ChallengeRow = {
  id: string;
  account_id: string | null;
  purpose: ChallengePurpose;
  challenge_hash: string;
  origin: string;
  rp_id: string;
  return_to: string;
};
type PublicKeyCredentialInput = {
  id?: string;
  rawId?: string;
  type?: string;
  response?: {
    clientDataJSON?: string;
    attestationObject?: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string | null;
    transports?: string[];
  };
};
type PasskeyRow = {
  id: string;
  account_id: string;
  credential_id: string;
  public_key_jwk: string;
  sign_count: number;
  label: string;
  created_at: string;
  last_used_at: string | null;
};
type CborResult = { value: unknown; offset: number };
type ParsedAuthenticatorData = {
  rpIdHash: Uint8Array;
  flags: number;
  signCount: number;
  credentialId?: Uint8Array;
  publicKeyJwk?: JsonWebKey;
};

function noStore(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
}

function invalidPasskey(reason = 'invalid_passkey', status = 400): Response {
  return noStore({ status: 'error', reason }, status);
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string, maxBytes: number): Uint8Array {
  if (!value || value.length > Math.ceil(maxBytes * 4 / 3) + 8 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid_base64url');
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  if (binary.length > maxBytes) throw new Error('payload_too_large');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function sha256Bytes(value: Uint8Array | string): Promise<Uint8Array> {
  const input = typeof value === 'string' ? encoder.encode(value) : value;
  return new Uint8Array(await crypto.subtle.digest('SHA-256', input));
}

async function sha256Hex(value: string): Promise<string> {
  return [...await sha256Bytes(value)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index]! ^ right[index]!;
  return difference === 0;
}

function constantTimeString(left: string, right: string): boolean {
  return constantTimeEqual(encoder.encode(left), encoder.encode(right));
}

function relyingParty(request: Request): { origin: string; rpId: string } {
  const url = new URL(request.url);
  const origin = url.origin;
  const hostname = url.hostname.toLowerCase();
  if (hostname === 'defrag.app' || hostname.endsWith('.defrag.app')) return { origin, rpId: 'defrag.app' };
  if (hostname.endsWith('.workers.dev')) return { origin, rpId: hostname };
  if (hostname === 'localhost' || hostname === '127.0.0.1') return { origin, rpId: hostname };
  throw new Response('Passkeys are unavailable on this host', { status: 400 });
}

async function stableUserHandle(accountId: string): Promise<string> {
  return base64Url(await sha256Bytes(`sovereign-passkey:${accountId}`));
}

function randomChallenge(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function issueChallenge(env: Env, accountId: string | null, purpose: ChallengePurpose, origin: string, rpId: string, returnTo = '/app') {
  const challenge = randomChallenge();
  const challengeId = `passkey_challenge_${crypto.randomUUID()}`;
  await env.DB.prepare("DELETE FROM auth_passkey_challenges WHERE expires_at <= datetime('now') OR used_at IS NOT NULL").run();
  await env.DB.prepare("INSERT INTO auth_passkey_challenges (id, account_id, purpose, challenge_hash, origin, rp_id, return_to, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '+5 minutes'))")
    .bind(challengeId, accountId, purpose, await sha256Hex(challenge), origin, rpId, safeReturnTo(returnTo))
    .run();
  return { challenge, challengeId };
}

async function loadChallenge(env: Env, challengeId: string, purpose: ChallengePurpose, challenge: string): Promise<ChallengeRow> {
  if (!/^passkey_challenge_[A-Za-z0-9-]{20,}$/.test(challengeId)) throw new Error('invalid_challenge');
  const row = await env.DB.prepare("SELECT id, account_id, purpose, challenge_hash, origin, rp_id, return_to FROM auth_passkey_challenges WHERE id = ? AND purpose = ? AND used_at IS NULL AND expires_at > datetime('now')")
    .bind(challengeId, purpose)
    .first<ChallengeRow>();
  if (!row || !constantTimeString(row.challenge_hash, await sha256Hex(challenge))) throw new Error('invalid_challenge');
  return row;
}

async function consumeChallenge(env: Env, id: string): Promise<void> {
  const result = await env.DB.prepare("UPDATE auth_passkey_challenges SET used_at = datetime('now') WHERE id = ? AND used_at IS NULL AND expires_at > datetime('now')")
    .bind(id)
    .run();
  if ((result.meta?.changes ?? 0) !== 1) throw new Error('challenge_used');
}

function readCborArgument(bytes: Uint8Array, offset: number, additional: number): { value: number; offset: number } {
  if (additional < 24) return { value: additional, offset };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (additional === 24) {
    if (offset + 1 > bytes.length) throw new Error('cbor_truncated');
    return { value: view.getUint8(offset), offset: offset + 1 };
  }
  if (additional === 25) {
    if (offset + 2 > bytes.length) throw new Error('cbor_truncated');
    return { value: view.getUint16(offset), offset: offset + 2 };
  }
  if (additional === 26) {
    if (offset + 4 > bytes.length) throw new Error('cbor_truncated');
    return { value: view.getUint32(offset), offset: offset + 4 };
  }
  if (additional === 27) {
    if (offset + 8 > bytes.length) throw new Error('cbor_truncated');
    const value = view.getBigUint64(offset);
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('cbor_number_too_large');
    return { value: Number(value), offset: offset + 8 };
  }
  throw new Error('cbor_indefinite_unsupported');
}

function decodeCbor(bytes: Uint8Array, start = 0): CborResult {
  if (start >= bytes.length) throw new Error('cbor_truncated');
  const initial = bytes[start]!;
  const major = initial >> 5;
  const additional = initial & 0x1f;
  const argument = readCborArgument(bytes, start + 1, additional);
  let offset = argument.offset;
  const length = argument.value;

  if (major === 0) return { value: length, offset };
  if (major === 1) return { value: -1 - length, offset };
  if (major === 2 || major === 3) {
    if (offset + length > bytes.length) throw new Error('cbor_truncated');
    const valueBytes = bytes.slice(offset, offset + length);
    return { value: major === 2 ? valueBytes : decoder.decode(valueBytes), offset: offset + length };
  }
  if (major === 4) {
    const values: unknown[] = [];
    for (let index = 0; index < length; index += 1) {
      const decoded = decodeCbor(bytes, offset);
      values.push(decoded.value);
      offset = decoded.offset;
    }
    return { value: values, offset };
  }
  if (major === 5) {
    const values = new Map<unknown, unknown>();
    for (let index = 0; index < length; index += 1) {
      const key = decodeCbor(bytes, offset);
      const value = decodeCbor(bytes, key.offset);
      values.set(key.value, value.value);
      offset = value.offset;
    }
    return { value: values, offset };
  }
  if (major === 6) return decodeCbor(bytes, offset);
  if (major === 7) {
    if (additional === 20) return { value: false, offset };
    if (additional === 21) return { value: true, offset };
    if (additional === 22) return { value: null, offset };
  }
  throw new Error('cbor_type_unsupported');
}

function requireMap(value: unknown): Map<unknown, unknown> {
  if (!(value instanceof Map)) throw new Error('cbor_map_required');
  return value;
}

function requireBytes(value: unknown, expectedLength?: number): Uint8Array {
  if (!(value instanceof Uint8Array) || (expectedLength !== undefined && value.length !== expectedLength)) throw new Error('cbor_bytes_required');
  return value;
}

function coseKeyToJwk(value: unknown): JsonWebKey {
  const key = requireMap(value);
  if (key.get(1) !== 2 || key.get(3) !== -7 || key.get(-1) !== 1) throw new Error('passkey_algorithm_unsupported');
  const x = requireBytes(key.get(-2), 32);
  const y = requireBytes(key.get(-3), 32);
  return { kty: 'EC', crv: 'P-256', x: base64Url(x), y: base64Url(y), ext: true, key_ops: ['verify'] };
}

function parseAuthenticatorData(bytes: Uint8Array, requireAttestation: boolean): ParsedAuthenticatorData {
  if (bytes.length < 37) throw new Error('authenticator_data_short');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const rpIdHash = bytes.slice(0, 32);
  const flags = bytes[32]!;
  const signCount = view.getUint32(33);
  if ((flags & FLAG_USER_PRESENT) === 0 || (flags & FLAG_USER_VERIFIED) === 0) throw new Error('user_verification_required');
  if (!requireAttestation) return { rpIdHash, flags, signCount };
  if ((flags & FLAG_ATTESTED_CREDENTIAL) === 0 || bytes.length < 55) throw new Error('attested_credential_missing');
  const credentialLength = view.getUint16(53);
  const credentialStart = 55;
  const credentialEnd = credentialStart + credentialLength;
  if (credentialLength < 16 || credentialLength > MAX_CREDENTIAL_BYTES || credentialEnd >= bytes.length) throw new Error('credential_id_invalid');
  const credentialId = bytes.slice(credentialStart, credentialEnd);
  const decodedKey = decodeCbor(bytes, credentialEnd);
  return { rpIdHash, flags, signCount, credentialId, publicKeyJwk: coseKeyToJwk(decodedKey.value) };
}

async function validateClientData(encoded: string, expectedType: 'webauthn.create' | 'webauthn.get', expectedOrigin: string): Promise<{ challenge: string; bytes: Uint8Array }> {
  const bytes = decodeBase64Url(encoded, MAX_CLIENT_DATA_BYTES);
  const data = JSON.parse(decoder.decode(bytes)) as { type?: string; challenge?: string; origin?: string; crossOrigin?: boolean };
  if (data.type !== expectedType || typeof data.challenge !== 'string' || data.origin !== expectedOrigin || data.crossOrigin === true) throw new Error('client_data_invalid');
  return { challenge: data.challenge, bytes };
}

function readDerLength(bytes: Uint8Array, offset: number): { length: number; offset: number } {
  if (offset >= bytes.length) throw new Error('signature_truncated');
  const initial = bytes[offset]!;
  if ((initial & 0x80) === 0) return { length: initial, offset: offset + 1 };
  const octets = initial & 0x7f;
  if (octets < 1 || octets > 2 || offset + 1 + octets > bytes.length) throw new Error('signature_length_invalid');
  let length = 0;
  for (let index = 0; index < octets; index += 1) length = (length << 8) | bytes[offset + 1 + index]!;
  return { length, offset: offset + 1 + octets };
}

function derEcdsaToRaw(signature: Uint8Array): Uint8Array {
  if (signature.length === 64) return signature;
  if (signature[0] !== 0x30) throw new Error('signature_sequence_required');
  const sequence = readDerLength(signature, 1);
  if (sequence.offset + sequence.length !== signature.length || signature[sequence.offset] !== 0x02) throw new Error('signature_invalid');
  const rLength = readDerLength(signature, sequence.offset + 1);
  const rStart = rLength.offset;
  const rEnd = rStart + rLength.length;
  if (rEnd >= signature.length || signature[rEnd] !== 0x02) throw new Error('signature_invalid');
  const sLength = readDerLength(signature, rEnd + 1);
  const sStart = sLength.offset;
  const sEnd = sStart + sLength.length;
  if (sEnd !== signature.length) throw new Error('signature_invalid');
  const normalize = (value: Uint8Array) => {
    let source = value;
    while (source.length > 32 && source[0] === 0) source = source.slice(1);
    if (source.length > 32) throw new Error('signature_integer_too_large');
    const output = new Uint8Array(32);
    output.set(source, 32 - source.length);
    return output;
  };
  const raw = new Uint8Array(64);
  raw.set(normalize(signature.slice(rStart, rEnd)), 0);
  raw.set(normalize(signature.slice(sStart, sEnd)), 32);
  return raw;
}

async function verifyRpIdHash(actual: Uint8Array, rpId: string): Promise<void> {
  const expected = await sha256Bytes(rpId);
  if (!constantTimeEqual(actual, expected)) throw new Error('rp_id_mismatch');
}

async function markCredentialUsed(env: Env, passkey: PasskeyRow, signCount: number): Promise<void> {
  if (passkey.sign_count > 0 && signCount > 0 && signCount <= passkey.sign_count) throw new Error('signature_counter_replayed');
  await env.DB.prepare("UPDATE auth_passkeys SET sign_count = ?, last_used_at = datetime('now') WHERE id = ? AND account_id = ?")
    .bind(Math.max(passkey.sign_count, signCount), passkey.id, passkey.account_id)
    .run();
}

export async function createPasskeyLoginOptions(request: Request, env: Env): Promise<Response> {
  const { origin, rpId } = relyingParty(request);
  const body = await request.json().catch(() => ({})) as { returnTo?: string };
  const issued = await issueChallenge(env, null, 'login', origin, rpId, safeReturnTo(body.returnTo));
  return noStore({
    challengeId: issued.challengeId,
    publicKey: {
      challenge: issued.challenge,
      timeout: CHALLENGE_TTL_MINUTES * 60_000,
      rpId,
      userVerification: 'required'
    }
  });
}

export async function verifyPasskeyLogin(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as { challengeId?: string; credential?: PublicKeyCredentialInput };
    const credential = body.credential;
    if (!body.challengeId || !credential || credential.type !== 'public-key' || !credential.rawId || !credential.response?.clientDataJSON || !credential.response.authenticatorData || !credential.response.signature) throw new Error('credential_incomplete');
    const clientData = await validateClientData(credential.response.clientDataJSON, 'webauthn.get', relyingParty(request).origin);
    const challenge = await loadChallenge(env, body.challengeId, 'login', clientData.challenge);
    if (challenge.origin !== relyingParty(request).origin || challenge.rp_id !== relyingParty(request).rpId) throw new Error('challenge_origin_mismatch');
    const credentialId = base64Url(decodeBase64Url(credential.rawId, MAX_CREDENTIAL_BYTES));
    const passkey = await env.DB.prepare('SELECT id, account_id, credential_id, public_key_jwk, sign_count, label, created_at, last_used_at FROM auth_passkeys WHERE credential_id = ?')
      .bind(credentialId)
      .first<PasskeyRow>();
    if (!passkey) throw new Error('credential_unknown');
    if (credential.response.userHandle) {
      const suppliedHandle = base64Url(decodeBase64Url(credential.response.userHandle, 64));
      if (!constantTimeString(suppliedHandle, await stableUserHandle(passkey.account_id))) throw new Error('user_handle_mismatch');
    }
    const authenticatorData = decodeBase64Url(credential.response.authenticatorData, MAX_ATTESTATION_BYTES);
    const parsed = parseAuthenticatorData(authenticatorData, false);
    await verifyRpIdHash(parsed.rpIdHash, challenge.rp_id);
    const clientHash = await sha256Bytes(clientData.bytes);
    const signed = new Uint8Array(authenticatorData.length + clientHash.length);
    signed.set(authenticatorData, 0);
    signed.set(clientHash, authenticatorData.length);
    const publicKey = await crypto.subtle.importKey('jwk', JSON.parse(passkey.public_key_jwk) as JsonWebKey, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const signature = derEcdsaToRaw(decodeBase64Url(credential.response.signature, MAX_SIGNATURE_BYTES));
    const verified = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, signature, signed);
    if (!verified) throw new Error('signature_invalid');
    await consumeChallenge(env, challenge.id);
    await markCredentialUsed(env, passkey, parsed.signCount);
    const account = await env.DB.prepare('SELECT auth_subject FROM accounts WHERE id = ?').bind(passkey.account_id).first<{ auth_subject: string }>();
    if (!account?.auth_subject) throw new Error('account_missing');
    return createSessionResponse(env, passkey.account_id, account.auth_subject, false, safeReturnTo(challenge.return_to));
  } catch (error) {
    console.warn('passkey_login_failed', { reason: error instanceof Error ? error.message : 'invalid' });
    return invalidPasskey();
  }
}

export async function createPasskeyRegistrationOptions(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  const { origin, rpId } = relyingParty(request);
  const account = await env.DB.prepare("SELECT a.auth_subject, p.display_name FROM accounts a LEFT JOIN persons p ON p.account_id = a.id AND p.role = 'self' WHERE a.id = ? LIMIT 1")
    .bind(auth.accountId)
    .first<{ auth_subject: string; display_name: string | null }>();
  if (!account) return invalidPasskey('account_missing', 404);
  const existing = await env.DB.prepare('SELECT credential_id FROM auth_passkeys WHERE account_id = ? ORDER BY created_at DESC')
    .bind(auth.accountId)
    .all<{ credential_id: string }>();
  const issued = await issueChallenge(env, auth.accountId, 'register', origin, rpId);
  const email = account.auth_subject.startsWith('email:') ? account.auth_subject.slice(6) : 'sovereign-user';
  return noStore({
    challengeId: issued.challengeId,
    publicKey: {
      challenge: issued.challenge,
      rp: { id: rpId, name: 'Sovereign.OS' },
      user: { id: await stableUserHandle(auth.accountId), name: email, displayName: account.display_name?.trim() || email },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: CHALLENGE_TTL_MINUTES * 60_000,
      attestation: 'none',
      authenticatorSelection: { residentKey: 'required', requireResidentKey: true, userVerification: 'required' },
      excludeCredentials: (existing.results ?? []).map((row) => ({ id: row.credential_id, type: 'public-key' }))
    }
  });
}

export async function verifyPasskeyRegistration(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  try {
    const body = await request.json() as { challengeId?: string; label?: string; credential?: PublicKeyCredentialInput };
    const credential = body.credential;
    if (!body.challengeId || !credential || credential.type !== 'public-key' || !credential.rawId || !credential.response?.clientDataJSON || !credential.response.attestationObject) throw new Error('credential_incomplete');
    const party = relyingParty(request);
    const clientData = await validateClientData(credential.response.clientDataJSON, 'webauthn.create', party.origin);
    const challenge = await loadChallenge(env, body.challengeId, 'register', clientData.challenge);
    if (challenge.account_id !== auth.accountId || challenge.origin !== party.origin || challenge.rp_id !== party.rpId) throw new Error('challenge_account_mismatch');
    const attestationObject = decodeBase64Url(credential.response.attestationObject, MAX_ATTESTATION_BYTES);
    const attestation = requireMap(decodeCbor(attestationObject).value);
    if (attestation.get('fmt') !== 'none') throw new Error('attestation_format_unsupported');
    const authData = requireBytes(attestation.get('authData'));
    const parsed = parseAuthenticatorData(authData, true);
    await verifyRpIdHash(parsed.rpIdHash, challenge.rp_id);
    if (!parsed.credentialId || !parsed.publicKeyJwk) throw new Error('credential_data_missing');
    const rawId = base64Url(decodeBase64Url(credential.rawId, MAX_CREDENTIAL_BYTES));
    const attestedId = base64Url(parsed.credentialId);
    if (!constantTimeString(rawId, attestedId)) throw new Error('credential_id_mismatch');
    await consumeChallenge(env, challenge.id);
    const transports = (credential.response.transports ?? []).filter((value) => ['internal', 'hybrid', 'usb', 'nfc', 'ble'].includes(value)).slice(0, 8);
    const label = body.label?.trim().slice(0, 80) || 'Passkey';
    await env.DB.prepare('INSERT INTO auth_passkeys (id, account_id, credential_id, public_key_jwk, sign_count, transports_json, label) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(`passkey_${crypto.randomUUID()}`, auth.accountId, rawId, JSON.stringify(parsed.publicKeyJwk), parsed.signCount, JSON.stringify(transports), label)
      .run();
    return noStore({ status: 'success', label });
  } catch (error) {
    console.warn('passkey_registration_failed', { accountId: auth.accountId, reason: error instanceof Error ? error.message : 'invalid' });
    return invalidPasskey(error instanceof Error && error.message.includes('UNIQUE') ? 'passkey_already_registered' : 'registration_failed');
  }
}

export async function listPasskeys(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  const rows = await env.DB.prepare('SELECT id, label, created_at, last_used_at FROM auth_passkeys WHERE account_id = ? ORDER BY created_at DESC')
    .bind(auth.accountId)
    .all<{ id: string; label: string; created_at: string; last_used_at: string | null }>();
  return noStore({ passkeys: rows.results ?? [] });
}

export async function deletePasskey(request: Request, env: Env, passkeyId: string): Promise<Response> {
  const auth = await requireAuth(request, env);
  if (!/^passkey_[A-Za-z0-9-]{20,}$/.test(passkeyId)) return invalidPasskey('invalid_passkey_id');
  const result = await env.DB.prepare('DELETE FROM auth_passkeys WHERE id = ? AND account_id = ?').bind(passkeyId, auth.accountId).run();
  return noStore({ status: 'success', deleted: (result.meta?.changes ?? 0) === 1 });
}
