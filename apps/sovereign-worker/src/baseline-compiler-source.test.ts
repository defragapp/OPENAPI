import { describe, expect, it } from 'vitest';
import { sanitizeCompilerBaselineResult } from './baseline-compiler-source';

const sourceData = {
  version: 'baseline-source.v1',
  computationVersion: 'fixture-v1',
  computedAt: '2026-07-31T12:00:00.000Z',
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
    astronomy: 'Verified fixture',
    observerCenter: 'Earth geocenter',
    timezoneResolution: 'IANA fixture',
    birthTimeCertainty: 'exact',
    rawBirthInputReturned: false,
    exactPrivateLocationReturned: false,
    completeHumanDesignClaimed: false,
    completeGeneKeysClaimed: false,
    housesClaimed: false
  }
};

describe('staged compiler source sanitization', () => {
  it('removes provisional Human Design and Gene Keys values before facets or Basis', () => {
    const sanitized = sanitizeCompilerBaselineResult({
      status: 'completed',
      reducedContext: {
        sourceData,
        deterministicCalculation: {
          natalPlacements: { sun: 'Cancer 4.2°' },
          humanDesign: { personalityGates: { sun: { gate: 13, line: 1 } } },
          geneKeys: { activations: { sun: 13 } },
          numerology: { lifePath: 1 }
        },
        interpretiveFramework: {
          availability: {
            astrology: 'available',
            humanDesign: 'partial',
            geneKeys: 'partial',
            numerology: 'available'
          }
        }
      },
      provenance: {
        interpretiveFrameworks: ['astrology', 'human-design-partial', 'gene-keys-partial', 'numerology']
      }
    });

    const reduced = sanitized.reducedContext as Record<string, unknown>;
    const sanitizedSource = reduced.sourceData as typeof sourceData;
    expect(sanitizedSource.humanDesign.personalityActivations).toEqual([]);
    expect(sanitizedSource.geneKeys.activations).toEqual([]);
    expect(sanitizedSource.natalBodies).toHaveLength(1);
    expect(sanitizedSource.numerology).toHaveLength(1);

    const deterministic = reduced.deterministicCalculation as Record<string, unknown>;
    expect(deterministic.humanDesign).toBeNull();
    expect(deterministic.geneKeys).toEqual({});

    const provenance = sanitized.provenance as Record<string, unknown>;
    expect(provenance.provisionalFrameworkValuesRemoved).toBe(true);
    expect(provenance.interpretiveFrameworks).toEqual(['astrology', 'numerology']);
    expect(JSON.stringify(sanitized)).not.toContain('hd.personality.sun');
    expect(JSON.stringify(sanitized)).not.toContain('gk.activation.sun');
  });
});
