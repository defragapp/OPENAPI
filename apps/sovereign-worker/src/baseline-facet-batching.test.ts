import { describe, expect, it } from 'vitest';
import { baselineFacetIds, baselineSourceDataSchema, buildBaselineBasisRegistry } from './baseline-contracts';
import {
  DETERMINISTIC_FACET_MODEL_VERSION,
  FACET_BATCH_ATTEMPTS,
  FACET_BATCH_SIZE,
  FACET_BATCH_TIMEOUT_MS,
  baselineFacetBatches,
  buildDeterministicFacetProfile,
  parseFacetBatch
} from './baseline-facets';

describe('Baseline facet batch preparation', () => {
  it('splits all required facets into bounded batches without loss or duplication', () => {
    const batches = baselineFacetBatches();
    expect(FACET_BATCH_SIZE).toBe(6);
    expect(FACET_BATCH_ATTEMPTS).toBe(2);
    expect(FACET_BATCH_TIMEOUT_MS).toBe(12_000);
    expect(batches.map((batch) => batch.length)).toEqual([6, 6, 5]);
    expect(batches.flat()).toEqual([...baselineFacetIds]);
    expect(new Set(batches.flat()).size).toBe(baselineFacetIds.length);
  });

  it('accepts only the exact requested facet order for a batch', () => {
    const expected = baselineFacetIds.slice(0, 2);
    const facet = (id: (typeof baselineFacetIds)[number]) => ({
      id,
      title: id === 'core_orientation' ? 'Core orientation' : 'Identity and purpose',
      description: 'A specific interpretive description long enough for the contract.',
      shadowExpression: 'Under pressure this quality can narrow into an observable overreach.',
      giftExpression: 'With awareness this quality can become a useful and observable strength.',
      alignmentMarkers: ['The pattern is visible in behavior.', 'The person can choose a different response.'],
      uncertainty: 'low',
      basisRefs: ['natal.sun']
    });

    const valid = JSON.stringify({ facets: expected.map(facet) });
    expect(parseFacetBatch(valid, expected).map((item) => item.id)).toEqual(expected);

    const reversed = JSON.stringify({ facets: [...expected].reverse().map(facet) });
    expect(() => parseFacetBatch(reversed, expected)).toThrow(/expected core_orientation at position 1/i);
  });

  it('builds a complete validated deterministic profile when AI prose cannot gate onboarding', () => {
    const source = baselineSourceDataSchema.parse({
      version: 'baseline-source.v1',
      computationVersion: 'test-source-v1',
      computedAt: '2026-08-18T05:00:00.000Z',
      uncertainty: 'low',
      natalBodies: [{
        id: 'natal.sun',
        body: 'sun',
        sign: 'Leo',
        longitude: 123.4,
        displayDegree: '3.4°',
        retrograde: false,
        uncertainty: 'low'
      }],
      aspects: [],
      humanDesign: { personalityActivations: [] },
      geneKeys: { activations: [] },
      numerology: [{ id: 'numerology.lifePath', key: 'lifePath', value: 1, uncertainty: 'low' }],
      houses: null,
      provenance: {
        astronomy: 'test',
        observerCenter: 'test',
        timezoneResolution: 'test',
        birthTimeCertainty: 'exact',
        rawBirthInputReturned: false,
        exactPrivateLocationReturned: false,
        completeHumanDesignClaimed: false,
        completeGeneKeysClaimed: false,
        housesClaimed: false
      }
    });

    const profile = buildDeterministicFacetProfile(source);
    const allowed = new Set(buildBaselineBasisRegistry(source).map((item) => item.id));

    expect(profile.modelVersion).toBe(DETERMINISTIC_FACET_MODEL_VERSION);
    expect(profile.facets.map((facet) => facet.id)).toEqual([...baselineFacetIds]);
    expect(profile.facets).toHaveLength(17);
    expect(profile.facets.every((facet) => facet.basisRefs.length > 0)).toBe(true);
    expect(profile.facets.flatMap((facet) => facet.basisRefs).every((id) => allowed.has(id))).toBe(true);
  });
});