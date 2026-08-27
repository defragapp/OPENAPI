import { describe, expect, it } from 'vitest';
import {
  baselineFacetIds,
  baselineFacetProfileSchema,
  baselineSourceDataSchema,
  buildBaselineBasisRegistry,
  validateFacetProfileBasis,
  type BaselineSourceData,
  type BaselineFacetProfile,
  type BasisRegistryItem
} from './baseline-contracts';
import { buildDeterministicFacetProfile } from './baseline-facets';
import { buildExpressionAxisValues } from './expression-field';
import { expressionAxisIds } from '@sovereign/agent-contracts';
import { sovereignAnswerSchema, type SovereignAnswerV2 } from './agent/recognition';
import { reduceNumber, longitudeToSign, signedLongitudeDelta } from './astronomy';

/**
 * CANONICAL INTELLIGENCE PIPELINE TEST
 *
 * Proves the deterministic path:
 *   Raw Inputs → BaselineSourceData → FacetProfile → Expression Field [16 axes] → sovereign-answer.v2
 *
 * No downstream feature silently recreates its own Baseline.
 * Identical inputs produce identical outputs.
 * Every derived value has traceable provenance.
 */

const TEST_INPUT = {
  birthDate: '1990-05-17',
  birthTime: '14:30',
  birthTimeCertainty: 'exact' as const,
  birthplace: 'Austin, TX',
  birthTimezone: 'America/Chicago',
  locationPrecision: 'city_or_regional' as const
};

/**
 * Build a synthetic but schema-valid BaselineSourceData for deterministic testing.
 * This mirrors what baseline-engine.ts produces but without network calls.
 */
function buildTestSourceData(): BaselineSourceData {
  const sunLongitude = 56.5;
  const moonLongitude = 213.7;
  const mercuryLongitude = 72.4;
  const venusLongitude = 38.2;
  const marsLongitude = 195.8;
  const jupiterLongitude = 312.4;
  const saturnLongitude = 248.1;
  const uranusLongitude = 325.6;
  const neptuneLongitude = 305.3;
  const plutoLongitude = 230.9;

  const sunSign = longitudeToSign(sunLongitude);
  const moonSign = longitudeToSign(moonLongitude);

  const computedAt = '2026-01-15T12:00:00.000Z';
  const certainty = 'exact' as const;

  return {
    version: 'baseline-source.v1',
    computationVersion: 'test-pipeline-v1',
    computedAt,
    uncertainty: 'low',
    natalBodies: [
      { id: 'natal.sun', body: 'sun', sign: sunSign.sign, longitude: sunLongitude, displayDegree: `${sunSign.degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.moon', body: 'moon', sign: moonSign.sign, longitude: moonLongitude, displayDegree: `${moonSign.degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.mercury', body: 'mercury', sign: longitudeToSign(mercuryLongitude).sign, longitude: mercuryLongitude, displayDegree: `${longitudeToSign(mercuryLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.venus', body: 'venus', sign: longitudeToSign(venusLongitude).sign, longitude: venusLongitude, displayDegree: `${longitudeToSign(venusLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.mars', body: 'mars', sign: longitudeToSign(marsLongitude).sign, longitude: marsLongitude, displayDegree: `${longitudeToSign(marsLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.jupiter', body: 'jupiter', sign: longitudeToSign(jupiterLongitude).sign, longitude: jupiterLongitude, displayDegree: `${longitudeToSign(jupiterLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.saturn', body: 'saturn', sign: longitudeToSign(saturnLongitude).sign, longitude: saturnLongitude, displayDegree: `${longitudeToSign(saturnLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.uranus', body: 'uranus', sign: longitudeToSign(uranusLongitude).sign, longitude: uranusLongitude, displayDegree: `${longitudeToSign(uranusLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.neptune', body: 'neptune', sign: longitudeToSign(neptuneLongitude).sign, longitude: neptuneLongitude, displayDegree: `${longitudeToSign(neptuneLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.pluto', body: 'pluto', sign: longitudeToSign(plutoLongitude).sign, longitude: plutoLongitude, displayDegree: `${longitudeToSign(plutoLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' }
    ],
    aspects: [
      { id: 'aspect.sun.trine.jupiter', leftBody: 'sun', aspect: 'trine', rightBody: 'jupiter', orb: 3.2, display: 'Sun trine Jupiter (3.2° orb)', uncertainty: 'low' },
      { id: 'aspect.moon.square.saturn', leftBody: 'moon', aspect: 'square', rightBody: 'saturn', orb: 2.8, display: 'Moon square Saturn (2.8° orb)', uncertainty: 'low' },
      { id: 'aspect.venus.sextile.mars', leftBody: 'venus', aspect: 'sextile', rightBody: 'mars', orb: 4.1, display: 'Venus sextile Mars (4.1° orb)', uncertainty: 'low' }
    ],
    humanDesign: {
      personalityActivations: [
        { id: 'hd.personality.sun', body: 'sun', gate: 13, line: 2, uncertainty: 'low' },
        { id: 'hd.personality.moon', body: 'moon', gate: 49, line: 4, uncertainty: 'low' },
        { id: 'hd.personality.mercury', body: 'mercury', gate: 30, line: 1, uncertainty: 'low' }
      ]
    },
    geneKeys: {
      activations: [
        { id: 'gk.activation.sun', body: 'sun', activation: 13, uncertainty: 'low' },
        { id: 'gk.activation.moon', body: 'moon', activation: 49, uncertainty: 'low' },
        { id: 'gk.activation.mercury', body: 'mercury', activation: 30, uncertainty: 'low' }
      ]
    },
    numerology: [
      { id: 'numerology.lifePath', key: 'lifePath', value: reduceNumber(1 + 9 + 9 + 0 + 0 + 5 + 1 + 7), uncertainty: 'low' },
      { id: 'numerology.birthDay', key: 'birthDay', value: reduceNumber(17), uncertainty: 'low' }
    ],
    houses: null,
    provenance: {
      astronomy: 'Test fixture',
      observerCenter: 'Earth geocenter 500@399',
      timezoneResolution: 'User-selected IANA timezone',
      birthTimeCertainty: certainty,
      rawBirthInputReturned: false,
      exactPrivateLocationReturned: false,
      completeHumanDesignClaimed: false,
      completeGeneKeysClaimed: false,
      housesClaimed: false
    }
  };
}

describe('Canonical Intelligence Pipeline', () => {
  it('produces a schema-valid BaselineSourceData from synthetic inputs', () => {
    const source = buildTestSourceData();
    const parsed = baselineSourceDataSchema.parse(source);
    expect(parsed.version).toBe('baseline-source.v1');
    expect(parsed.natalBodies.length).toBeGreaterThanOrEqual(10);
    expect(parsed.aspects.length).toBeGreaterThanOrEqual(1);
    expect(parsed.humanDesign.personalityActivations.length).toBeGreaterThanOrEqual(1);
    expect(parsed.geneKeys.activations.length).toBeGreaterThanOrEqual(1);
    expect(parsed.numerology.length).toBe(2);
    expect(parsed.provenance.rawBirthInputReturned).toBe(false);
    expect(parsed.provenance.exactPrivateLocationReturned).toBe(false);
  });

  it('builds a deterministic BasisRegistry from BaselineSourceData', () => {
    const source = buildTestSourceData();
    const registry = buildBaselineBasisRegistry(source);
    expect(registry.length).toBeGreaterThan(0);
    for (const item of registry) {
      expect(item.id).toBeTruthy();
      expect(item.display).toBeTruthy();
      expect(item.accessibleLabel).toBeTruthy();
      expect(item.computedAt).toBe(source.computedAt);
      expect(item.subject).toBe('self');
    }
    const categories = new Set(registry.map((item) => item.category));
    expect(categories.has('natal')).toBe(true);
    expect(categories.has('aspect')).toBe(true);
    expect(categories.has('human_design')).toBe(true);
    expect(categories.has('gene_keys')).toBe(true);
    expect(categories.has('numerology')).toBe(true);
  });

  it('generates a deterministic BaselineFacetProfile from BaselineSourceData', () => {
    const source = buildTestSourceData();
    const profile = buildDeterministicFacetProfile(source);
    expect(profile.version).toBe('baseline-facets.v1');
    expect(profile.interpretive).toBe(true);
    expect(profile.facets.length).toBe(baselineFacetIds.length);
    const facetIds = profile.facets.map((f) => f.id);
    expect(facetIds).toEqual(baselineFacetIds);
    for (const facet of profile.facets) {
      expect(facet.basisRefs.length).toBeGreaterThan(0);
      expect(facet.description.length).toBeGreaterThan(20);
      expect(facet.shadowExpression.length).toBeGreaterThan(20);
      expect(facet.giftExpression.length).toBeGreaterThan(20);
    }
    const registry = buildBaselineBasisRegistry(source);
    validateFacetProfileBasis(profile, registry);
  });

  it('produces identical BaselineFacetProfile for identical inputs (determinism)', () => {
    const source = buildTestSourceData();
    const first = buildDeterministicFacetProfile(source);
    const second = buildDeterministicFacetProfile(source);
    const { generatedAt: _, ...firstCore } = first;
    const { generatedAt: __, ...secondCore } = second;
    expect(firstCore).toEqual(secondCore);
  });

  it('builds a deterministic 16-axis Expression Field from BaselineFacetProfile', () => {
    const source = buildTestSourceData();
    const profile = buildDeterministicFacetProfile(source);
    const axes = buildExpressionAxisValues({ facets: profile.facets });
    expect(axes).toHaveLength(expressionAxisIds.length);
    expect(new Set(axes.map((a) => a.id))).toEqual(new Set(expressionAxisIds));
    for (const axis of axes) {
      expect(axis.baselineValue).toBeGreaterThanOrEqual(28);
      expect(axis.baselineValue).toBeLessThanOrEqual(76);
      expect(axis.currentDelta).toBe(0);
      expect(axis.value).toBe(axis.baselineValue);
      expect(axis.state).toBe('unconfirmed');
      expect(axis.label).toBeTruthy();
      expect(axis.summary).toBeTruthy();
    }
  });

  it('produces identical Expression Field for identical facet profiles (determinism)', () => {
    const source = buildTestSourceData();
    const profile = buildDeterministicFacetProfile(source);
    const first = buildExpressionAxisValues({ facets: profile.facets });
    const second = buildExpressionAxisValues({ facets: profile.facets });
    expect(first).toEqual(second);
  });

  it('every Expression Field axis traces back to at least one Baseline facet', () => {
    const source = buildTestSourceData();
    const profile = buildDeterministicFacetProfile(source);
    const axes = buildExpressionAxisValues({ facets: profile.facets });
    const facetIdSet = new Set<string>(profile.facets.map((f) => f.id));
    for (const axis of axes) {
      expect(axis.facetIds.length).toBeGreaterThan(0);
      for (const facetId of axis.facetIds) {
        expect(facetIdSet.has(facetId)).toBe(true);
      }
    }
  });

  it('every Expression Field axis has basisRefs that exist in the BasisRegistry', () => {
    const source = buildTestSourceData();
    const profile = buildDeterministicFacetProfile(source);
    const registry = buildBaselineBasisRegistry(source);
    const registryIds = new Set(registry.map((item) => item.id));
    const axes = buildExpressionAxisValues({ facets: profile.facets });
    for (const axis of axes) {
      for (const ref of axis.basisRefs) {
        expect(registryIds.has(ref)).toBe(true);
      }
    }
  });

  it('a sovereign-answer.v2 can be constructed with basisRefs traced through the full pipeline', () => {
    const source = buildTestSourceData();
    const profile = buildDeterministicFacetProfile(source);
    const registry = buildBaselineBasisRegistry(source);
    const axes = buildExpressionAxisValues({ facets: profile.facets });
    const basisRefIds = axes.flatMap((a) => a.basisRefs);
    const registryIds = new Set(registry.map((item) => item.id));

    const answer: SovereignAnswerV2 = {
      version: 'sovereign-answer.v2',
      mode: 'baseline',
      depth: 'standard',
      headline: 'Direction and responsibility are closely linked in your Baseline.',
      direct_answer: 'Your Baseline shows a pattern where taking initiative and accepting responsibility may activate together, which can be useful when ownership is clear and limiting when it is not.',
      sections: [
        {
          id: 'steady',
          label: 'Steady capacity',
          body: 'The capacity to create direction appears stable in your Baseline and is supported by multiple source frameworks.'
        },
        {
          id: 'shadow',
          label: 'Under pressure',
          body: 'Under pressure, the same capacity may narrow into taking over decisions before responsibility is shared.'
        }
      ],
      basis_refs: basisRefIds.slice(0, 3),
      correction_prompt: 'Does this match your experience?',
      actions: [{ type: 'explore_facet', label: 'Explore this quality' }],
      confidence: 'supported',
      safety_mode: 'standard'
    };

    const parsed = sovereignAnswerSchema.parse(answer);
    expect(parsed.version).toBe('sovereign-answer.v2');
    for (const ref of parsed.basis_refs) {
      expect(registryIds.has(ref)).toBe(true);
    }
  });

  it('traceability: the complete path from input to answer is provable', () => {
    const source = buildTestSourceData();

    // Layer A: BaselineSourceData
    const validatedSource = baselineSourceDataSchema.parse(source);
    const registry = buildBaselineBasisRegistry(validatedSource);

    // Layer B: BaselineFacetProfile
    const profile = buildDeterministicFacetProfile(validatedSource);
    const validatedProfile = validateFacetProfileBasis(profile, registry);

    // Expression Field: 16 axes from facets
    const axes = buildExpressionAxisValues({ facets: validatedProfile.facets });
    expect(axes).toHaveLength(16);

    // Traceable basis: every axis's basisRefs exist in the registry
    const registryIds = new Set(registry.map((i) => i.id));
    for (const axis of axes) {
      for (const ref of axis.basisRefs) {
        expect(registryIds.has(ref)).toBe(true);
      }
    }

    // Traceable facets: every axis maps to known facets
    const facetIdSet = new Set<string>(validatedProfile.facets.map((f) => f.id));
    for (const axis of axes) {
      for (const fid of axis.facetIds) {
        expect(facetIdSet.has(fid)).toBe(true);
      }
    }

    // Traceable source: every facet's basisRefs exist in the registry
    for (const facet of validatedProfile.facets) {
      for (const ref of facet.basisRefs) {
        expect(registryIds.has(ref)).toBe(true);
      }
    }
  });

  it('astronomy utilities are deterministic and shared', () => {
    expect(longitudeToSign(0)).toEqual({ sign: 'Aries', degree: 0 });
    expect(longitudeToSign(30)).toEqual({ sign: 'Taurus', degree: 0 });
    expect(longitudeToSign(360)).toEqual({ sign: 'Aries', degree: 0 });
    expect(longitudeToSign(-1)).toEqual({ sign: 'Pisces', degree: 29 });
    expect(signedLongitudeDelta(10, 20)).toBe(10);
    expect(signedLongitudeDelta(350, 10)).toBe(20);
    expect(signedLongitudeDelta(10, 350)).toBe(-20);
    expect(reduceNumber(11)).toBe(11);
    expect(reduceNumber(22)).toBe(22);
    expect(reduceNumber(33)).toBe(33);
    expect(reduceNumber(123)).toBe(6);
    expect(reduceNumber(999)).toBe(9);
  });
});
