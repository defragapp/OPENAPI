import { describe, expect, it } from 'vitest';
import { buildCurrentHorizonsEndpoint, computeReducedCurrentConditions } from './current';
import { longitudeToSign } from '../astronomy';
import type { Env } from '../env';
import { clearCurrentConditions, parseLocationPrecision } from '../baseline';

const fixtureBodies = {
  sun: { longitude: 15.25, latitude: 0.01 },
  mercury: { longitude: 72.4, latitude: -1.2, retrograde: true },
  mars: { longitude: 218.9, latitude: 0.4 }
};

describe('current-condition computation port', () => {
  it('matches the inspected SOVV longitude-to-sign normalization for sanitized fixture values', () => {
    expect(longitudeToSign(15.25)).toEqual({ sign: 'Aries', degree: 15.25 });
    expect(longitudeToSign(72.4)).toEqual({ sign: 'Gemini', degree: 12.4 });
    expect(longitudeToSign(359.9)).toEqual({ sign: 'Pisces', degree: 29.9 });
    expect(longitudeToSign(-1)).toEqual({ sign: 'Pisces', degree: 29 });
  });

  it('returns reduced, versioned, non-deterministic current-condition output without private coordinates', async () => {
    const result = await computeReducedCurrentConditions({ APP_ENV: 'test' } as Env, {
      accountId: 'acct_fixture',
      timestamp: '2026-07-21T12:00:00.000Z',
      location: { latitude: 40.7, longitude: -74.0, precision: 'city' },
      fixtureBodies,
      natalBodies: [{
        id: 'natal.sun',
        body: 'sun',
        sign: 'Cancer',
        longitude: 285.25,
        displayDegree: '15.3°',
        retrograde: false,
        uncertainty: 'low'
      }]
    });
    const serialized = JSON.stringify(result);
    expect(result.version).toBe('current-conditions.v1');
    expect(result.source).toBe('OPENAPI_SANITIZED_FIXTURE');
    expect(result.locationPrecisionUsed).toBe('city');
    expect(result.affectedBaselineFacetIds).toContain('core_orientation');
    expect(result.activeFactors.every((factor) => factor.affectedFacetIds.length === 0)).toBe(true);
    expect(result.activeFactors[0]).toHaveProperty('longitude');
    expect(result.activeFactors[0]).not.toHaveProperty('quality');
    expect(result.currentToNatalContacts.some((contact) => contact.aspect === 'square')).toBe(true);
    expect(result.separations.unknownActualState).toContain('No exact emotion');
    expect(serialized).not.toMatch(/40\.7|-74\.0|1990-01-01|12:34|private birthplace|diagnosis:/i);
  });

  it('supports an explicitly enabled Earth-geocentric context without device coordinates', async () => {
    const result = await computeReducedCurrentConditions({ APP_ENV: 'test' } as Env, {
      accountId: 'acct_fixture',
      timestamp: '2026-07-21T12:00:00.000Z',
      perspective: 'geocentric',
      fixtureBodies
    });
    expect(result.locationPrecisionUsed).toBe('geocentric');
    expect(result.uncertainty).toBe('low');
    expect(result.affectedBaselineFacetIds).toEqual([]);

    const url = buildCurrentHorizonsEndpoint(
      { APP_ENV: 'test' } as Env,
      '699',
      new Date('2026-07-21T12:00:00.000Z'),
      new Date('2026-07-22T00:00:00.000Z')
    );
    expect(url.searchParams.get('CENTER')).toBe("'500@399'");
    expect(url.searchParams.has('SITE_COORD')).toBe(false);
    expect(url.searchParams.has('COORD_TYPE')).toBe(false);
  });

  it('removes every temporary current-condition row owned by the account', async () => {
    const statements: string[] = [];
    const bindings: unknown[][] = [];
    const env = {
      DB: {
        prepare(sql: string) {
          statements.push(sql);
          return {
            bind(...values: unknown[]) {
              bindings.push(values);
              return { run: async () => ({ success: true }) };
            }
          };
        }
      }
    } as unknown as Env;
    await expect(clearCurrentConditions(env, 'acct_fixture')).resolves.toEqual({ status: 'not_started', removed: true });
    expect(statements[0]).toContain('DELETE FROM current_conditions');
    expect(statements[0]).toContain('SELECT id FROM persons WHERE account_id = ?');
    expect(bindings[0]).toEqual(['acct_fixture']);
  });

  it('rejects an unrecognized current-condition mode before provider or database work', () => {
    expect(parseLocationPrecision('geocentric')).toBe('geocentric');
    expect(() => parseLocationPrecision('device_exact')).toThrow();
  });
});
