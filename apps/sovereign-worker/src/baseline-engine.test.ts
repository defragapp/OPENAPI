import { describe, expect, it, vi } from 'vitest';
import type { Env } from './env';
import { normalizeBaselineInput } from './baseline';
import { createOpenApiBaselineProvider, localCivilTimeToUtc, parseHorizonsJson, type HorizonsPayload } from './baseline-engine';

function horizonsPayload(longitude = 123.456, latitude = -1.25): HorizonsPayload {
  return {
    signature: { source: 'NASA/JPL Horizons API', version: '1.3' },
    result: `Header\n$$SOE\n"1993-Jul-27 03:00", ${longitude}, ${latitude},\n"1993-Jul-27 09:00", ${longitude + 0.15}, ${latitude + 0.01},\n$$EOE\nFooter`
  };
}

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (url.hostname !== 'ssd.jpl.nasa.gov') return new Response('unexpected external request', { status: 500 });
    expect(url.searchParams.get('CENTER')).toBe("'500@399'");
    expect(url.searchParams.has('SITE_COORD')).toBe(false);
    const command = url.searchParams.get('COMMAND') ?? '';
    const seed = [...command].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 360;
    return Response.json(horizonsPayload(seed, -0.5));
  });
}

function environment(): Env {
  return {
    APP_ENV: 'production',
    APP_VERSION: 'test',
    BASELINE_HORIZONS_URL: 'https://ssd.jpl.nasa.gov/api/horizons.api',
    BASELINE_PROVIDER_TIMEOUT_MS: '8000'
  } as unknown as Env;
}

const exactInput = {
  birthDate: '1993-07-26',
  birthTime: '20:00',
  birthTimeCertainty: 'exact' as const,
  birthplace: 'Upland, CA',
  birthTimezone: 'America/Los_Angeles',
  locationPrecision: 'city_or_regional' as const
};

describe('OPENAPI Baseline engine', () => {
  it('parses ecliptic longitude and latitude from the official Horizons JSON result field', () => {
    expect(parseHorizonsJson(horizonsPayload())).toEqual([
      { longitude: 123.456, latitude: -1.25 },
      { longitude: 123.606, latitude: -1.24 }
    ]);
  });

  it('rejects a changed or untrusted Horizons signature', () => {
    expect(() => parseHorizonsJson({
      signature: { source: 'unexpected', version: '2.0' },
      result: '$$SOE\n"date", 120, 1\n$$EOE'
    })).toThrow('Unexpected Horizons API signature');
  });

  it('converts local civil time through the selected historical timezone', () => {
    expect(localCivilTimeToUtc('1993-07-26', '20:00', 'America/Los_Angeles').toISOString()).toBe('1993-07-27T03:00:00.000Z');
  });

  it('rejects a missing or invalid birthplace timezone', () => {
    expect(() => normalizeBaselineInput({ ...exactInput, birthTimezone: '' })).toThrow();
    expect(() => normalizeBaselineInput({ ...exactInput, birthTimezone: 'Not/A_Timezone' })).toThrow();
  });

  it('computes reduced framework data without geocoding or returning raw birth input', async () => {
    const fetcher = mockFetch();
    const provider = createOpenApiBaselineProvider(environment(), fetcher as unknown as typeof fetch);
    const output = await provider.compute(normalizeBaselineInput(exactInput));
    const serialized = JSON.stringify(output);

    expect(output.natalPlacements).toHaveProperty('sun');
    expect(output.natalPlacements).toHaveProperty('moon');
    expect(output.humanDesign).toMatchObject({ status: 'partial_personality_activations_only' });
    expect(output.geneKeys).toMatchObject({ status: 'partial_activation_numbers_only' });
    expect(output.provenance).toMatchObject({
      engine: 'openapi-cloudflare-baseline-engine-v2',
      observerCenter: 'Earth geocenter 500@399',
      birthplaceSentToExternalProvider: false,
      rawBirthInputReturned: false
    });
    expect(serialized).not.toContain('1993-07-26');
    expect(serialized).not.toContain('20:00');
    expect(serialized).not.toContain('Upland');
    expect(serialized).not.toContain('America/Los_Angeles');
    expect(fetcher).toHaveBeenCalledTimes(10);
  });

  it('withholds time-dependent framework activations when birth time is unknown', async () => {
    const provider = createOpenApiBaselineProvider(environment(), mockFetch() as unknown as typeof fetch);
    const output = await provider.compute(normalizeBaselineInput({
      birthDate: '1993-07-26',
      birthTimeCertainty: 'unknown',
      birthplace: 'Upland, CA',
      birthTimezone: 'America/Los_Angeles',
      locationPrecision: 'city_or_regional'
    }));

    expect(output.humanDesign).toBeNull();
    expect(output.geneKeys).toEqual({});
  });
});
