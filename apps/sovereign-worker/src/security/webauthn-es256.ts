const encoder = new TextEncoder();
const decoder = new TextDecoder();

const FLAG_USER_PRESENT = 0x01;
const FLAG_USER_VERIFIED = 0x04;
const FLAG_ATTESTED_CREDENTIAL = 0x40;

export const MAX_CREDENTIAL_BYTES = 1024;
export const MAX_CLIENT_DATA_BYTES = 8192;
export const MAX_ATTESTATION_BYTES = 16384;
export const MAX_SIGNATURE_BYTES = 256;

type CborResult = { value: unknown; offset: number };
export type ClientDataResult = { challenge: string; bytes: Uint8Array };
export type RegistrationResult = { credentialId: string; publicKeyJwk: JsonWebKey; signCount: number };
export type AssertionResult = { signCount: number };

export function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]!);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeBase64Url(value: string, maxBytes: number): Uint8Array {
  if (!value || value.length > Math.ceil(maxBytes * 4 / 3) + 8 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid_base64url');
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  if (binary.length > maxBytes) throw new Error('payload_too_large');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export async function sha256Bytes(value: Uint8Array | string): Promise<Uint8Array> {
  const input = typeof value === 'string' ? encoder.encode(value) : value;
  return new Uint8Array(await crypto.subtle.digest('SHA-256', input));
}

export async function sha256Hex(value: string): Promise<string> {
  return [...await sha256Bytes(value)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index]! ^ right[index]!;
  return difference === 0;
}

export function constantTimeString(left: string, right: string): boolean {
  return constantTimeEqual(encoder.encode(left), encoder.encode(right));
}

export async function stableUserHandle(accountId: string): Promise<string> {
  return base64Url(await sha256Bytes(`sovereign-passkey:${accountId}`));
}

export async function validateClientData(encoded: string, expectedType: 'webauthn.create' | 'webauthn.get', expectedOrigin: string): Promise<ClientDataResult> {
  const bytes = decodeBase64Url(encoded, MAX_CLIENT_DATA_BYTES);
  const data = JSON.parse(decoder.decode(bytes)) as { type?: string; challenge?: string; origin?: string; crossOrigin?: boolean };
  if (data.type !== expectedType || typeof data.challenge !== 'string' || data.origin !== expectedOrigin || data.crossOrigin === true) throw new Error('client_data_invalid');
  return { challenge: data.challenge, bytes };
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

function parseAuthenticatorData(bytes: Uint8Array, requireAttestation: boolean): { rpIdHash: Uint8Array; signCount: number; credentialId?: Uint8Array; publicKeyJwk?: JsonWebKey } {
  if (bytes.length < 37) throw new Error('authenticator_data_short');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const rpIdHash = bytes.slice(0, 32);
  const flags = bytes[32]!;
  const signCount = view.getUint32(33);
  if ((flags & FLAG_USER_PRESENT) === 0 || (flags & FLAG_USER_VERIFIED) === 0) throw new Error('user_verification_required');
  if (!requireAttestation) return { rpIdHash, signCount };
  if ((flags & FLAG_ATTESTED_CREDENTIAL) === 0 || bytes.length < 55) throw new Error('attested_credential_missing');
  const credentialLength = view.getUint16(53);
  const credentialStart = 55;
  const credentialEnd = credentialStart + credentialLength;
  if (credentialLength < 16 || credentialLength > MAX_CREDENTIAL_BYTES || credentialEnd >= bytes.length) throw new Error('credential_id_invalid');
  const credentialId = bytes.slice(credentialStart, credentialEnd);
  const decodedKey = decodeCbor(bytes, credentialEnd);
  return { rpIdHash, signCount, credentialId, publicKeyJwk: coseKeyToJwk(decodedKey.value) };
}

async function verifyRpIdHash(actual: Uint8Array, rpId: string): Promise<void> {
  if (!constantTimeEqual(actual, await sha256Bytes(rpId))) throw new Error('rp_id_mismatch');
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

export async function parseRegistration(attestationEncoded: string, rawIdEncoded: string, rpId: string): Promise<RegistrationResult> {
  const attestation = requireMap(decodeCbor(decodeBase64Url(attestationEncoded, MAX_ATTESTATION_BYTES)).value);
  if (attestation.get('fmt') !== 'none') throw new Error('attestation_format_unsupported');
  const parsed = parseAuthenticatorData(requireBytes(attestation.get('authData')), true);
  await verifyRpIdHash(parsed.rpIdHash, rpId);
  if (!parsed.credentialId || !parsed.publicKeyJwk) throw new Error('credential_data_missing');
  const rawId = base64Url(decodeBase64Url(rawIdEncoded, MAX_CREDENTIAL_BYTES));
  const attestedId = base64Url(parsed.credentialId);
  if (!constantTimeString(rawId, attestedId)) throw new Error('credential_id_mismatch');
  return { credentialId: rawId, publicKeyJwk: parsed.publicKeyJwk, signCount: parsed.signCount };
}

export async function verifyAssertion(input: {
  authenticatorData: string;
  signature: string;
  clientDataBytes: Uint8Array;
  publicKeyJwk: JsonWebKey;
  rpId: string;
}): Promise<AssertionResult> {
  const authenticatorData = decodeBase64Url(input.authenticatorData, MAX_ATTESTATION_BYTES);
  const parsed = parseAuthenticatorData(authenticatorData, false);
  await verifyRpIdHash(parsed.rpIdHash, input.rpId);
  const clientHash = await sha256Bytes(input.clientDataBytes);
  const signed = new Uint8Array(authenticatorData.length + clientHash.length);
  signed.set(authenticatorData, 0);
  signed.set(clientHash, authenticatorData.length);
  const publicKey = await crypto.subtle.importKey('jwk', input.publicKeyJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
  const signature = derEcdsaToRaw(decodeBase64Url(input.signature, MAX_SIGNATURE_BYTES));
  if (!await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, signature, signed)) throw new Error('signature_invalid');
  return { signCount: parsed.signCount };
}
