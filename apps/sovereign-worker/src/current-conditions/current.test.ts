import { describe, expect, it } from 'vitest';
import { computeReducedCurrentConditions, eclipticLongitudeToSign } from './current';
import type { Env } from '../env';

const fixtureBodies = {
  sun: { longitude: 15.25, latitude: 0.01 },
  mercury: { longitude: 72.4, latitude: -1.2, retrograde: true },
  mars: { longitude: 218.9, latitude: 0.4 }
};

describe('current-condition computation port', () => {
  it('matches the inspected SOVV longitude-to-sign normalization for sanitized fixture values', () => {
    expect(eclipticLongitudeToSign(15.25)).toEqual({ sign: 'Aries', degree: 15.25 });
    expect(eclipticLongitudeToSign(72.4)).toEqual({ sign: 'Gemini', degree: 12.4 });
    expect(eclipticLongitudeToSign(359.9)).toEqual({ sign: 'Pisces', degree: 29.9 });
    expect(eclipticLongitudeToSign(-1)).toEqual({ sign: 'Pisces', degree: 29 });
  });

  it('returns reduced, versioned, non-deterministic current-condition output without private coordinates', async () => {
    const result = await computeReducedCurrentConditions({ APP_ENV: 'test' } as Env, {
      accountId: 'acct_fixture',
      timestamp: '2026-07-21T12:00:00.000Z',
      location: { latitude: 40.7, longitude: -74.0, precision: 'city' },
      fixtureBodies
    });
    const serialized = JSON.stringify(result);
    expect(result.version).toBe('current-conditions.v1');
    expect(result.source).toBe('OPENAPI_SANITIZED_FIXTURE');
    expect(result.locationPrecisionUsed).toBe('city');
    expect(result.affectedBaselineDimensions).toContain('communication');
    expect(result.separations.unknownActualState).toContain('No exact emotion');
    expect(serialized).not.toMatch(/40\.7|-74\.0|1990-01-01|12:34|private birthplace|diagnosis:/i);
  });
});
