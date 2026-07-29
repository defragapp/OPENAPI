import { describe, expect, it } from 'vitest';
import {
  BASELINE_FACET_CONTRACT_VERSION,
  BASELINE_SOURCE_VERSION,
  baselineFacetIds,
  baselineFacetProfileSchema,
  baselineSourceDataSchema,
  buildBaselineBasisRegistry,
  validateFacetProfileBasis,
  type BaselineFacetProfile,
  type BaselineSourceData
} from './baseline-contracts';

const sourceFixture: BaselineSourceData = {
  version: BASELINE_SOURCE_VERSION,
  computationVersion: 'test-engine-v1',
  computedAt: '2026-07-28T12:00:00.000Z',
  uncertainty: 'low',
  natalBodies: [{
    id: 'natal.sun',
    body: 'sun',
    sign: 'Cancer',
    longitude: 94.2,
    displayDegree: '04.2°',
    retrograde: false,
    uncertainty: 'low'
  }],
  aspects: [],
  humanDesign: {
    personalityActivations: [{
      id: 'hd.personality.sun',
      body: 'sun',
      gate: 13,
      line: 1,
      uncertainty: 'low'
    }]
  },
  geneKeys: {
    activations: [{
      id: 'gk.activation.sun',
      body: 'sun',
      activation: 13,
      uncertainty: 'low'
    }]
  },
  numerology: [{
    id: 'numerology.lifePath',
    key: 'lifePath',
    value: 1,
    uncertainty: 'low'
  }],
  houses: null,
  provenance: {
    astronomy: 'Verified astronomy fixture',
    observerCenter: 'Earth geocenter',
    timezoneResolution: 'Verified timezone fixture',
    birthTimeCertainty: 'exact',
    rawBirthInputReturned: false,
    exactPrivateLocationReturned: false,
    completeHumanDesignClaimed: false,
    completeGeneKeysClaimed: false,
    housesClaimed: false
  }
};

function facetProfile(basisRef = 'natal.sun'): BaselineFacetProfile {
  return {
    version: BASELINE_FACET_CONTRACT_VERSION,
    modelVersion: 'openai/gpt-5.5',
    sourceComputationVersion: sourceFixture.computationVersion,
    generatedAt: '2026-07-28T12:00:01.000Z',
    interpretive: true,
    facets: baselineFacetIds.map((id) => ({
      id,
      title: id.replaceAll('_', ' '),
      description: `This is a specific interpretive description for the ${id.replaceAll('_', ' ')} facet.`,
      shadowExpression: 'Under pressure, the valid capacity may narrow into overuse or responsibility taken without agreement.',
      giftExpression: 'With awareness, the same capacity can create direction while preserving consent and shared responsibility.',
      alignmentMarkers: [
        'Authority and responsibility are named clearly.',
        'The capacity can be used without erasing personal limits.'
      ],
      uncertainty: 'low',
      basisRefs: [basisRef]
    }))
  };
}

describe('Baseline information contracts', () => {
  it('normalizes exact source values into approved compact Basis entries', () => {
    const source = baselineSourceDataSchema.parse(sourceFixture);
    const registry = buildBaselineBasisRegistry(source);

    expect(registry.map(({ id, display }) => ({ id, display }))).toEqual([
      { id: 'hd.personality.sun', display: 'HD G13.1' },
      { id: 'gk.activation.sun', display: 'GK ACT13' },
      { id: 'numerology.lifePath', display: 'N LP1' },
      { id: 'natal.sun', display: '☉ CAN 04.2°' }
    ]);
    expect(JSON.stringify(registry)).not.toContain('birth');
    expect(JSON.stringify(registry)).not.toContain('location');
    expect(registry.map((item) => item.provenance).join(' ')).not.toMatch(/NASA|Horizons|provider/i);
  });

  it('requires every facet to include specific shadow, gift, alignment, and approved Basis refs', () => {
    const registry = buildBaselineBasisRegistry(sourceFixture);
    const profile = baselineFacetProfileSchema.parse(facetProfile());

    expect(validateFacetProfileBasis(profile, registry)).toBe(profile);
    expect(profile.facets).toHaveLength(baselineFacetIds.length);
    for (const facet of profile.facets) {
      expect(facet.shadowExpression.length).toBeGreaterThan(20);
      expect(facet.giftExpression.length).toBeGreaterThan(20);
      expect(facet.alignmentMarkers.length).toBeGreaterThanOrEqual(2);
      expect(facet.basisRefs).toEqual(['natal.sun']);
    }
  });

  it('rejects invented Basis refs and unsupported source claims', () => {
    const registry = buildBaselineBasisRegistry(sourceFixture);
    const invented = baselineFacetProfileSchema.parse(facetProfile('invented.ref'));
    expect(() => validateFacetProfileBasis(invented, registry)).toThrow('unverified Basis reference');

    const unsupported = {
      ...sourceFixture,
      humanDesign: {
        ...sourceFixture.humanDesign,
        type: 'Generator',
        channel: '13-33'
      },
      geneKeys: {
        ...sourceFixture.geneKeys,
        completeProfile: true
      }
    };
    expect(() => baselineSourceDataSchema.parse(unsupported)).toThrow();
  });

  it('rejects duplicated facet IDs instead of accepting an incomplete profile', () => {
    const duplicate = facetProfile();
    duplicate.facets[1] = { ...duplicate.facets[0]! };

    expect(() => validateFacetProfileBasis(
      baselineFacetProfileSchema.parse(duplicate),
      buildBaselineBasisRegistry(sourceFixture)
    )).toThrow('repeats');
  });
});
