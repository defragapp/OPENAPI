import { describe, expect, it } from 'vitest';
import type { Env } from './env';
import {
  decryptBaselineSource,
  encryptBaselineSource,
  parseCanonicalBaselineSourceInput
} from './baseline-source-crypto';

function testEnv(): Env {
  const bytes = Uint8Array.from({ length: 32 }, (_, index) => index + 1);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return {
    APP_ENV: 'test',
    APP_VERSION: 'baseline-source-crypto-test',
    DB: {} as D1Database,
    THREADS: {} as DurableObjectNamespace,
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    SESSION_SIGNING_SECRET: 'test-session-secret',
    BASELINE_SOURCE_ENCRYPTION_KEY: btoa(binary),
    BASELINE_SOURCE_ENCRYPTION_KEY_VERSION: 'test-v1'
  };
}

const sourceInput = {
  version: 'baseline-source-input.v2',
  fullBirthName: 'Sample Person',
  preferredName: 'Sample',
  birthDate: '1990-05-17',
  birthTimeCertainty: 'exact',
  birthTime: '14:30',
  birthplace: {
    city: 'Austin',
    region: 'Texas',
    country: 'United States'
  },
  resolvedPlace: {
    displayName: 'Austin, Texas, United States',
    latitude: 30.2672,
    longitude: -97.7431,
    timezone: 'America/Chicago',
    resolverSource: 'independent-test-fixture',
    resolverVersion: '1',
    confidence: 'high',
    confirmed: true
  }
} as const;

describe('encrypted Baseline source storage', () => {
  it('round-trips canonical source data without plaintext in the envelope', async () => {
    const env = testEnv();
    const source = parseCanonicalBaselineSourceInput(sourceInput);
    const envelope = await encryptBaselineSource(env, 'acct_test', source);
    const serialized = JSON.stringify(envelope);

    expect(serialized).not.toContain('Sample Person');
    expect(serialized).not.toContain('1990-05-17');
    expect(serialized).not.toContain('Austin');
    expect(serialized).not.toContain('America/Chicago');
    expect(envelope.normalizedInputHash).toMatch(/^[a-f0-9]{64}$/);

    await expect(decryptBaselineSource(env, 'acct_test', envelope)).resolves.toEqual(source);
  });

  it('binds ciphertext to the owning account through authenticated data', async () => {
    const env = testEnv();
    const source = parseCanonicalBaselineSourceInput(sourceInput);
    const envelope = await encryptBaselineSource(env, 'acct_owner', source);

    await expect(decryptBaselineSource(env, 'acct_other', envelope)).rejects.toBeTruthy();
  });

  it('requires a birth-record name before encryption or provider work', () => {
    const { fullBirthName: _omitted, ...withoutBirthName } = sourceInput;
    expect(() => parseCanonicalBaselineSourceInput(withoutBirthName)).toThrow();
    expect(() => parseCanonicalBaselineSourceInput({ ...sourceInput, fullBirthName: ' ' })).toThrow();
  });

  it('rejects calendar dates that JavaScript would otherwise normalize', () => {
    expect(() => parseCanonicalBaselineSourceInput({ ...sourceInput, birthDate: '2024-02-31' })).toThrow(
      'Invalid birth date'
    );
    expect(() => parseCanonicalBaselineSourceInput({ ...sourceInput, birthDate: '2023-02-29' })).toThrow(
      'Invalid birth date'
    );
    expect(() => parseCanonicalBaselineSourceInput({ ...sourceInput, birthDate: '2024-02-29' })).not.toThrow();
  });

  it('requires an explicit supported birth-time shape and confirmed resolved place', () => {
    expect(() => parseCanonicalBaselineSourceInput({
      ...sourceInput,
      birthTimeCertainty: 'window',
      birthTime: undefined
    })).toThrow('birth-time window');

    expect(() => parseCanonicalBaselineSourceInput({
      ...sourceInput,
      resolvedPlace: { ...sourceInput.resolvedPlace, confirmed: false }
    })).toThrow();
  });
});
