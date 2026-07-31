import { describe, expect, it } from 'vitest';
import type { Env } from './env';
import { resolveGeoNamesCandidates } from './baseline-place-provider';

function env(): Env {
  return {
    APP_ENV: 'test',
    APP_VERSION: 'place-provider-test',
    DB: {} as D1Database,
    THREADS: {} as DurableObjectNamespace,
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    SESSION_SIGNING_SECRET: 'test-session-secret',
    BASELINE_PLACE_PROVIDER: 'geonames',
    BASELINE_GEONAMES_USERNAME: 'test-account',
    BASELINE_GEONAMES_URL: 'https://secure.geonames.org/',
    BASELINE_PROVIDER_TIMEOUT_MS: '8000'
  };
}

describe('GeoNames Baseline place provider', () => {
  it('returns city-level candidates with an IANA timezone and no account data in the request', async () => {
    const requests: URL[] = [];
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      requests.push(url);
      return Response.json({
        totalResultsCount: 1,
        geonames: [{
          geonameId: 5376890,
          name: 'Upland',
          toponymName: 'Upland',
          adminName1: 'California',
          adminCode1: 'CA',
          countryName: 'United States',
          countryCode: 'US',
          featureClass: 'P',
          lat: '34.09751',
          lng: '-117.64839',
          timezone: { timeZoneId: 'America/Los_Angeles' }
        }]
      });
    }) as typeof fetch;

    const candidates = await resolveGeoNamesCandidates(env(), {
      city: 'Upland',
      region: 'California',
      country: 'United States'
    }, fetchImpl);

    expect(candidates).toEqual([{
      displayName: 'Upland, California, United States',
      latitude: 34.09751,
      longitude: -117.64839,
      timezone: 'America/Los_Angeles',
      resolverSource: 'GeoNames',
      resolverVersion: 'geonames-webservices.v1',
      confidence: 'high'
    }]);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.hostname).toBe('secure.geonames.org');
    expect(requests[0]?.searchParams.get('featureClass')).toBe('P');
    expect(requests[0]?.searchParams.get('username')).toBe('test-account');
    expect(requests[0]?.toString()).not.toContain('acct_');
    expect(requests[0]?.toString()).not.toContain('birthDate');
    expect(requests[0]?.toString()).not.toContain('fullBirthName');
  });

  it('uses the timezone service when the search result does not include a timezone', async () => {
    let requests = 0;
    const fetchImpl = (async (input: RequestInfo | URL) => {
      requests += 1;
      const url = new URL(String(input));
      if (url.pathname.endsWith('/searchJSON')) {
        return Response.json({
          geonames: [{
            name: 'Paris',
            adminName1: 'Ile-de-France',
            countryName: 'France',
            countryCode: 'FR',
            featureClass: 'P',
            lat: '48.85341',
            lng: '2.3488'
          }]
        });
      }
      return Response.json({ timezoneId: 'Europe/Paris' });
    }) as typeof fetch;

    const candidates = await resolveGeoNamesCandidates(env(), {
      city: 'Paris',
      region: 'Ile-de-France',
      country: 'France'
    }, fetchImpl);

    expect(requests).toBe(2);
    expect(candidates[0]?.timezone).toBe('Europe/Paris');
  });

  it('fails with a safe provider code when the configured account is unavailable', async () => {
    await expect(resolveGeoNamesCandidates({
      ...env(),
      BASELINE_GEONAMES_USERNAME: undefined
    }, {
      city: 'Upland',
      region: 'California',
      country: 'United States'
    })).rejects.toThrow('baseline_place_provider_unconfigured');
  });
});
