import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from './env';

const mocks = vi.hoisted(() => ({
  resolveCandidates: vi.fn(),
  confirmResolution: vi.fn(),
  resolveCanonical: vi.fn(),
  startCompilation: vi.fn()
}));

vi.mock('./baseline-place-provider', () => ({
  resolveAndStoreBaselinePlaceCandidates: mocks.resolveCandidates
}));

vi.mock('./baseline-place-resolution', () => ({
  confirmServerPlaceResolution: mocks.confirmResolution,
  resolveCanonicalBaselineSubmission: mocks.resolveCanonical
}));

vi.mock('./baseline-compiler', () => ({
  startBaselineCompilation: mocks.startCompilation
}));

import { startConfirmedBaselineCompilation } from './baseline-compiler-entry';

function env(): Env {
  return {
    APP_ENV: 'test',
    APP_VERSION: 'baseline-entry-test',
    DB: {} as D1Database,
    THREADS: {} as DurableObjectNamespace,
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    SESSION_SIGNING_SECRET: 'test-session-secret'
  };
}

const canonical = {
  version: 'baseline-source-input.v2',
  fullBirthName: 'Sample Person',
  birthDate: '1993-07-26',
  birthTimeCertainty: 'exact',
  birthTime: '20:00',
  birthplace: { city: 'Upland', region: 'California', country: 'United States' },
  resolvedPlace: {
    displayName: 'Upland, California, United States',
    latitude: 34.09751,
    longitude: -117.64839,
    timezone: 'America/Los_Angeles',
    resolverSource: 'GeoNames',
    resolverVersion: 'geonames-webservices.v1',
    confidence: 'high',
    confirmed: true
  }
};

describe('Baseline compiler entry', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.resolveCandidates.mockResolvedValue([{
      resolutionId: 'place_12345678-1234-1234-1234-123456789012',
      displayName: 'Upland, California, United States',
      timezone: 'America/Los_Angeles',
      confidence: 'high',
      attribution: 'GeoNames',
      confirmed: false
    }]);
    mocks.confirmResolution.mockResolvedValue({
      id: 'place_12345678-1234-1234-1234-123456789012',
      confirmed: true
    });
    mocks.resolveCanonical.mockResolvedValue(canonical);
    mocks.startCompilation.mockResolvedValue({ accepted: true, runId: 'baseline_run_test' });
  });

  it('ignores the browser timezone and resolves the birthplace on the server', async () => {
    const result = await startConfirmedBaselineCompilation(env(), 'acct_test', {
      fullBirthName: 'Sample Person',
      birthDate: '1993-07-26',
      birthplace: 'Upland, California, United States',
      birthTimezone: 'Asia/Tokyo',
      birthTimeCertainty: 'exact',
      birthTime: '20:00',
      locationPrecision: 'city_or_regional'
    });

    expect(result).toEqual({ accepted: true, runId: 'baseline_run_test' });
    expect(mocks.resolveCandidates).toHaveBeenCalledWith(env(), 'acct_test', {
      city: 'Upland',
      region: 'California',
      country: 'United States'
    });
    expect(mocks.confirmResolution).toHaveBeenCalledWith(
      env(),
      'acct_test',
      'place_12345678-1234-1234-1234-123456789012'
    );
    expect(mocks.resolveCanonical).toHaveBeenCalledWith(env(), 'acct_test', {
      fullBirthName: 'Sample Person',
      birthDate: '1993-07-26',
      birthTimeCertainty: 'exact',
      birthTime: '20:00',
      birthplace: { city: 'Upland', region: 'California', country: 'United States' },
      placeResolutionId: 'place_12345678-1234-1234-1234-123456789012'
    });
    expect(JSON.stringify(mocks.resolveCanonical.mock.calls)).not.toContain('Asia/Tokyo');
    expect(JSON.stringify(mocks.resolveCanonical.mock.calls)).not.toContain('birthTimezone');
    expect(mocks.startCompilation).toHaveBeenCalledWith(env(), 'acct_test', canonical);
  });

  it('rejects a local time skipped by a timezone transition before queueing', async () => {
    mocks.resolveCanonical.mockResolvedValue({
      ...canonical,
      birthDate: '2024-03-10',
      birthTime: '02:30'
    });

    const response = await startConfirmedBaselineCompilation(env(), 'acct_test', {
      placeResolutionId: 'place_12345678-1234-1234-1234-123456789012'
    }).catch((error) => error as Response);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: 'baseline_birth_time_nonexistent' });
    expect(mocks.startCompilation).not.toHaveBeenCalled();
  });

  it('rejects a duplicated local time until an occurrence or offset is confirmed', async () => {
    mocks.resolveCanonical.mockResolvedValue({
      ...canonical,
      birthDate: '2024-11-03',
      birthTime: '01:30'
    });

    const response = await startConfirmedBaselineCompilation(env(), 'acct_test', {
      placeResolutionId: 'place_12345678-1234-1234-1234-123456789012'
    }).catch((error) => error as Response);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: 'baseline_birth_time_ambiguous' });
    expect(mocks.startCompilation).not.toHaveBeenCalled();
  });

  it('rejects a missing birth-record name before any provider call', async () => {
    await expect(startConfirmedBaselineCompilation(env(), 'acct_test', {
      birthDate: '1993-07-26',
      birthplace: 'Upland, California, United States',
      birthTimeCertainty: 'unknown'
    })).rejects.toThrow();

    expect(mocks.resolveCandidates).not.toHaveBeenCalled();
    expect(mocks.confirmResolution).not.toHaveBeenCalled();
    expect(mocks.startCompilation).not.toHaveBeenCalled();
  });

  it('requires explicit clarification when no unique high-confidence place exists', async () => {
    mocks.resolveCandidates.mockResolvedValue([
      {
        resolutionId: 'place_aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        displayName: 'Springfield, Illinois, United States',
        timezone: 'America/Chicago',
        confidence: 'medium',
        attribution: 'GeoNames',
        confirmed: false
      },
      {
        resolutionId: 'place_bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        displayName: 'Springfield, Missouri, United States',
        timezone: 'America/Chicago',
        confidence: 'medium',
        attribution: 'GeoNames',
        confirmed: false
      }
    ]);

    const response = await startConfirmedBaselineCompilation(env(), 'acct_test', {
      fullBirthName: 'Sample Person',
      birthDate: '1993-07-26',
      birthplace: 'Springfield, State, United States',
      birthTimeCertainty: 'unknown',
      birthTimezone: 'America/Los_Angeles',
      locationPrecision: 'city_or_regional'
    }).catch((error) => error as Response);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(409);
    const body = await response.json() as { error: string; candidates: unknown[] };
    expect(body.error).toBe('baseline_place_confirmation_required');
    expect(body.candidates).toHaveLength(2);
    expect(mocks.confirmResolution).not.toHaveBeenCalled();
    expect(mocks.startCompilation).not.toHaveBeenCalled();
  });

  it('rejects birthplace text that omits city, region, or country', async () => {
    const response = await startConfirmedBaselineCompilation(env(), 'acct_test', {
      fullBirthName: 'Sample Person',
      birthDate: '1993-07-26',
      birthplace: 'Upland, California',
      birthTimeCertainty: 'unknown'
    }).catch((error) => error as Response);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(400);
    expect(mocks.resolveCandidates).not.toHaveBeenCalled();
  });
});
