import { z } from 'zod';
import type { Env } from './env';

export const BASELINE_SOURCE_INPUT_VERSION = 'baseline-source-input.v2' as const;
export const BASELINE_SOURCE_ENVELOPE_VERSION = 'baseline-source-envelope.v1' as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
  'Invalid birth date'
);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const normalizedText = (minimum: number, maximum: number) => z.string().trim().min(minimum).max(maximum).transform((value) => value.normalize('NFC'));

export const canonicalBaselineSourceInputSchema = z.object({
  version: z.literal(BASELINE_SOURCE_INPUT_VERSION).default(BASELINE_SOURCE_INPUT_VERSION),
  fullBirthName: normalizedText(2, 200),
  preferredName: normalizedText(1, 120).optional(),
  birthDate: dateSchema,
  birthTimeCertainty: z.enum(['exact', 'approximate', 'window', 'unknown']),
  birthTime: timeSchema.optional(),
  birthTimeWindow: z.object({
    start: timeSchema,
    end: timeSchema
  }).strict().optional(),
  birthplace: z.object({
    city: normalizedText(1, 120),
    region: normalizedText(1, 120).optional(),
    country: normalizedText(2, 120)
  }).strict(),
  resolvedPlace: z.object({
    displayName: normalizedText(2, 240),
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    timezone: normalizedText(3, 100),
    resolverSource: normalizedText(2, 100),
    resolverVersion: normalizedText(1, 100),
    confidence: z.enum(['low', 'medium', 'high']),
    confirmed: z.literal(true)
  }).strict()
}).strict().superRefine((value, context) => {
  if ((value.birthTimeCertainty === 'exact' || value.birthTimeCertainty === 'approximate') && !value.birthTime) {
    context.addIssue({ code: 'custom', path: ['birthTime'], message: 'Birth time is required for exact or approximate certainty' });
  }
  if (value.birthTimeCertainty === 'window' && !value.birthTimeWindow) {
    context.addIssue({ code: 'custom', path: ['birthTimeWindow'], message: 'A birth-time window is required' });
  }
  if (value.birthTimeWindow && value.birthTimeWindow.start >= value.birthTimeWindow.end) {
    context.addIssue({ code: 'custom', path: ['birthTimeWindow'], message: 'Birth-time window must end after it starts' });
  }
  if (value.birthTimeCertainty === 'unknown' && (value.birthTime || value.birthTimeWindow)) {
    context.addIssue({ code: 'custom', path: ['birthTimeCertainty'], message: 'Unknown birth time must not include a time value' });
  }
});

export type CanonicalBaselineSourceInput = z.infer<typeof canonicalBaselineSourceInputSchema>;

export interface EncryptedBaselineSourceEnvelope {
  version: typeof BASELINE_SOURCE_ENVELOPE_VERSION;
  sourceInputVersion: typeof BASELINE_SOURCE_INPUT_VERSION;
  encryptionKeyVersion: string;
  nonceB64: string;
  ciphertextB64: string;
  normalizedInputHash: string;
}

export function parseCanonicalBaselineSourceInput(value: unknown): CanonicalBaselineSourceInput {
  return canonicalBaselineSourceInputSchema.parse(value);
}

export async function encryptBaselineSource(
  env: Env,
  accountId: string,
  value: CanonicalBaselineSourceInput
): Promise<EncryptedBaselineSourceEnvelope> {
  const keyVersion = requiredKeyVersion(env);
  const key = await importEncryptionKey(env);
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(canonicalJson(value));
  const additionalData = sourceAdditionalData(accountId, keyVersion);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData, tagLength: 128 },
    key,
    plaintext
  );
  return {
    version: BASELINE_SOURCE_ENVELOPE_VERSION,
    sourceInputVersion: BASELINE_SOURCE_INPUT_VERSION,
    encryptionKeyVersion: keyVersion,
    nonceB64: encodeBase64(nonce),
    ciphertextB64: encodeBase64(new Uint8Array(encrypted)),
    normalizedInputHash: await hashCanonicalBaselineSource(value)
  };
}

export async function decryptBaselineSource(
  env: Env,
  accountId: string,
  envelope: Pick<EncryptedBaselineSourceEnvelope, 'encryptionKeyVersion' | 'nonceB64' | 'ciphertextB64'>
): Promise<CanonicalBaselineSourceInput> {
  const activeVersion = requiredKeyVersion(env);
  if (envelope.encryptionKeyVersion !== activeVersion) {
    throw new Error('baseline_source_key_version_unavailable');
  }
  const key = await importEncryptionKey(env);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: decodeBase64(envelope.nonceB64),
      additionalData: sourceAdditionalData(accountId, envelope.encryptionKeyVersion),
      tagLength: 128
    },
    key,
    decodeBase64(envelope.ciphertextB64)
  );
  return parseCanonicalBaselineSourceInput(JSON.parse(new TextDecoder().decode(decrypted)) as unknown);
}

export async function hashCanonicalBaselineSource(value: CanonicalBaselineSourceInput): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalJson(value)));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function requiredKeyVersion(env: Env): string {
  const version = env.BASELINE_SOURCE_ENCRYPTION_KEY_VERSION?.trim();
  if (!version) throw new Error('baseline_source_encryption_key_version_missing');
  return version;
}

async function importEncryptionKey(env: Env): Promise<CryptoKey> {
  const encoded = env.BASELINE_SOURCE_ENCRYPTION_KEY?.trim();
  if (!encoded) throw new Error('baseline_source_encryption_key_missing');
  const bytes = decodeBase64(encoded);
  if (bytes.byteLength !== 32) throw new Error('baseline_source_encryption_key_invalid');
  return crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

function sourceAdditionalData(accountId: string, keyVersion: string): Uint8Array {
  return new TextEncoder().encode(canonicalJson({
    accountId,
    envelopeVersion: BASELINE_SOURCE_ENVELOPE_VERSION,
    sourceInputVersion: BASELINE_SOURCE_INPUT_VERSION,
    keyVersion
  }));
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  return Object.fromEntries(Object.keys(record).sort().map((key) => [key, sortValue(record[key])]));
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  let binary: string;
  try {
    binary = atob(padded);
  } catch {
    throw new Error('baseline_source_encryption_key_invalid');
  }
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
