import { z } from 'zod';
import type { Env } from './env';
import {
  BASELINE_SOURCE_INPUT_VERSION,
  parseCanonicalBaselineSourceInput,
  type CanonicalBaselineSourceInput
} from './baseline-source-crypto';

export const BASELINE_SOURCE_SUBMISSION_VERSION = 'baseline-source-submission.v1' as const;
export const BASELINE_PLACE_RESOLUTION_VERSION = 'baseline-place-resolution.v1' as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
  'Invalid birth date'
);
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const text = (minimum: number, maximum: number) => z.string().trim().min(minimum).max(maximum).transform((value) => value.normalize('NFC'));

export const baselinePlaceQuerySchema = z.object({
  city: text(1, 120),
  region: text(1, 120).optional(),
  country: text(2, 120)
}).strict();

export const resolvedBaselinePlaceSchema = z.object({
  displayName: text(2, 240),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  timezone: text(3, 100),
  resolverSource: text(2, 100),
  resolverVersion: text(1, 100),
  confidence: z.enum(['low', 'medium', 'high']),
  confirmed: z.literal(true)
}).strict();

const sourceSubmissionSchema = z.object({
  version: z.literal(BASELINE_SOURCE_SUBMISSION_VERSION).default(BASELINE_SOURCE_SUBMISSION_VERSION),
  fullBirthName: text(2, 200),
  preferredName: text(1, 120).optional(),
  birthDate: dateSchema,
  birthTimeCertainty: z.enum(['exact', 'approximate', 'window', 'unknown']),
  birthTime: timeSchema.optional(),
  birthTimeWindow: z.object({ start: timeSchema, end: timeSchema }).strict().optional(),
  birthplace: baselinePlaceQuerySchema,
  placeResolutionId: z.string().trim().regex(/^place_[a-zA-Z0-9-]{12,100}$/)
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

const placeResolutionPayloadSchema = z.object({
  version: z.literal(BASELINE_PLACE_RESOLUTION_VERSION),
  query: baselinePlaceQuerySchema,
  queryHash: z.string().regex(/^[a-f0-9]{64}$/),
  place: resolvedBaselinePlaceSchema
}).strict();

interface PlaceResolutionRow {
  id: string;
  query_hash: string;
  encryption_key_version: string;
  nonce_b64: string;
  ciphertext_b64: string;
  resolver_source: string;
  resolver_version: string;
  confidence: 'low' | 'medium' | 'high';
}

export type BaselinePlaceQuery = z.infer<typeof baselinePlaceQuerySchema>;
export type ResolvedBaselinePlace = z.infer<typeof resolvedBaselinePlaceSchema>;

export async function resolveCanonicalBaselineSubmission(
  env: Env,
  accountId: string,
  rawInput: unknown
): Promise<CanonicalBaselineSourceInput> {
  const submission = sourceSubmissionSchema.parse(rawInput);
  const place = await loadConfirmedPlaceResolution(
    env,
    accountId,
    submission.placeResolutionId,
    submission.birthplace
  );
  return parseCanonicalBaselineSourceInput({
    version: BASELINE_SOURCE_INPUT_VERSION,
    fullBirthName: submission.fullBirthName,
    ...(submission.preferredName ? { preferredName: submission.preferredName } : {}),
    birthDate: submission.birthDate,
    birthTimeCertainty: submission.birthTimeCertainty,
    ...(submission.birthTime ? { birthTime: submission.birthTime } : {}),
    ...(submission.birthTimeWindow ? { birthTimeWindow: submission.birthTimeWindow } : {}),
    birthplace: submission.birthplace,
    resolvedPlace: place
  });
}

export async function storeServerPlaceResolution(
  env: Env,
  accountId: string,
  queryInput: unknown,
  resolvedInput: unknown,
  options: { confirmed: boolean; ttlSeconds?: number } = { confirmed: false }
) {
  const query = baselinePlaceQuerySchema.parse(queryInput);
  const place = resolvedBaselinePlaceSchema.parse(resolvedInput);
  const id = `place_${crypto.randomUUID()}`;
  const queryHash = await hashPlaceQuery(query);
  const keyVersion = requiredKeyVersion(env);
  const encrypted = await encryptPayload(env, accountId, id, keyVersion, {
    version: BASELINE_PLACE_RESOLUTION_VERSION,
    query,
    queryHash,
    place
  });
  const ttlSeconds = Math.min(Math.max(options.ttlSeconds ?? 1800, 300), 86_400);
  await env.DB.prepare(`INSERT INTO baseline_place_resolutions (
      id, account_id, query_hash, encryption_key_version, nonce_b64, ciphertext_b64,
      resolver_source, resolver_version, confidence, confirmed_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))`)
    .bind(
      id,
      accountId,
      queryHash,
      keyVersion,
      encrypted.nonceB64,
      encrypted.ciphertextB64,
      place.resolverSource,
      place.resolverVersion,
      place.confidence,
      options.confirmed ? new Date().toISOString() : null,
      `+${ttlSeconds} seconds`
    )
    .run();
  return {
    id,
    displayName: place.displayName,
    timezone: place.timezone,
    resolverSource: place.resolverSource,
    resolverVersion: place.resolverVersion,
    confidence: place.confidence,
    confirmed: options.confirmed,
    expiresInSeconds: ttlSeconds
  };
}

export async function confirmServerPlaceResolution(env: Env, accountId: string, resolutionId: string) {
  const result = await env.DB.prepare(`UPDATE baseline_place_resolutions SET
    confirmed_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ? AND account_id = ? AND confirmed_at IS NULL AND expires_at > datetime('now')`)
    .bind(resolutionId, accountId)
    .run();
  if ((result.meta?.changes ?? 0) !== 1) throw new Response('Place resolution is unavailable or expired.', { status: 409 });
  return { id: resolutionId, confirmed: true };
}

async function loadConfirmedPlaceResolution(
  env: Env,
  accountId: string,
  resolutionId: string,
  expectedQuery: BaselinePlaceQuery
): Promise<ResolvedBaselinePlace> {
  const row = await env.DB.prepare(`SELECT id, query_hash, encryption_key_version, nonce_b64,
      ciphertext_b64, resolver_source, resolver_version, confidence
    FROM baseline_place_resolutions
    WHERE id = ? AND account_id = ? AND confirmed_at IS NOT NULL AND expires_at > datetime('now')`)
    .bind(resolutionId, accountId)
    .first<PlaceResolutionRow>();
  if (!row) throw new Response('A confirmed server birthplace resolution is required.', { status: 409 });
  const expectedHash = await hashPlaceQuery(expectedQuery);
  if (row.query_hash !== expectedHash) throw new Response('The confirmed birthplace no longer matches the reviewed input.', { status: 409 });
  const payload = placeResolutionPayloadSchema.parse(await decryptPayload(
    env,
    accountId,
    row.id,
    row.encryption_key_version,
    row.nonce_b64,
    row.ciphertext_b64
  ));
  if (payload.queryHash !== expectedHash) throw new Error('baseline_place_resolution_integrity_failed');
  if (
    payload.place.resolverSource !== row.resolver_source
    || payload.place.resolverVersion !== row.resolver_version
    || payload.place.confidence !== row.confidence
  ) {
    throw new Error('baseline_place_resolution_integrity_failed');
  }
  return payload.place;
}

async function hashPlaceQuery(query: BaselinePlaceQuery): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalJson(query)));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function encryptPayload(env: Env, accountId: string, id: string, keyVersion: string, payload: unknown) {
  const key = await importEncryptionKey(env);
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: placeAdditionalData(accountId, id, keyVersion), tagLength: 128 },
    key,
    new TextEncoder().encode(canonicalJson(payload))
  );
  return { nonceB64: encodeBase64(nonce), ciphertextB64: encodeBase64(new Uint8Array(encrypted)) };
}

async function decryptPayload(
  env: Env,
  accountId: string,
  id: string,
  keyVersion: string,
  nonceB64: string,
  ciphertextB64: string
): Promise<unknown> {
  if (keyVersion !== requiredKeyVersion(env)) throw new Error('baseline_source_key_version_unavailable');
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: decodeBase64(nonceB64),
      additionalData: placeAdditionalData(accountId, id, keyVersion),
      tagLength: 128
    },
    await importEncryptionKey(env),
    decodeBase64(ciphertextB64)
  );
  return JSON.parse(new TextDecoder().decode(decrypted)) as unknown;
}

function placeAdditionalData(accountId: string, id: string, keyVersion: string): Uint8Array {
  return new TextEncoder().encode(canonicalJson({ accountId, id, keyVersion, version: BASELINE_PLACE_RESOLUTION_VERSION }));
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
