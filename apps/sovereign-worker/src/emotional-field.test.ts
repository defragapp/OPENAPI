import { describe, expect, it } from 'vitest';
import {
  EMOTIONAL_FIELD_VERSION,
  type EmotionalField,
  type EmotionalFieldInput,
  type ExpressionAxisValue
} from '@sovereign/agent-contracts';
import { buildEmotionalField } from './emotional-field';
import { buildDeterministicFacetProfile } from './baseline-facets';
import { buildExpressionAxisValues } from './expression-field';
import { baselineSourceDataSchema, buildBaselineBasisRegistry } from './baseline-contracts';
import { sovereignAnswerSchema, type SovereignAnswerV2 } from './agent/recognition';
import { longitudeToSign, reduceNumber } from './astronomy';

/**
 * EMOTIONAL FIELD INTEGRATION TESTS
 *
 * Proves: Baseline + Expression Field → Emotional Field → sovereign-answer.v2
 *
 * The Emotional Field is the dynamic pattern layer that sits between
 * the structural Baseline/Expression Field and the answer output.
 */

// ──────────────────────────────────────────────
// Test fixtures
// ──────────────────────────────────────────────

function buildTestSourceData() {
  const sunLongitude = 56.5;
  const moonLongitude = 213.7;
  const computedAt = '2026-01-15T12:00:00.000Z';

  return {
    version: 'baseline-source.v1' as const,
    computationVersion: 'test-emotional-field-v1',
    computedAt,
    uncertainty: 'low' as const,
    natalBodies: [
      { id: 'natal.sun', body: 'sun', sign: longitudeToSign(sunLongitude).sign, longitude: sunLongitude, displayDegree: `${longitudeToSign(sunLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.moon', body: 'moon', sign: longitudeToSign(moonLongitude).sign, longitude: moonLongitude, displayDegree: `${longitudeToSign(moonLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.mercury', body: 'mercury', sign: longitudeToSign(72.4).sign, longitude: 72.4, displayDegree: `${longitudeToSign(72.4).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.venus', body: 'venus', sign: longitudeToSign(38.2).sign, longitude: 38.2, displayDegree: `${longitudeToSign(38.2).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.mars', body: 'mars', sign: longitudeToSign(195.8).sign, longitude: 195.8, displayDegree: `${longitudeToSign(195.8).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.jupiter', body: 'jupiter', sign: longitudeToSign(312.4).sign, longitude: 312.4, displayDegree: `${longitudeToSign(312.4).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.saturn', body: 'saturn', sign: longitudeToSign(248.1).sign, longitude: 248.1, displayDegree: `${longitudeToSign(248.1).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.uranus', body: 'uranus', sign: longitudeToSign(325.6).sign, longitude: 325.6, displayDegree: `${longitudeToSign(325.6).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.neptune', body: 'neptune', sign: longitudeToSign(305.3).sign, longitude: 305.3, displayDegree: `${longitudeToSign(305.3).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.pluto', body: 'pluto', sign: longitudeToSign(230.9).sign, longitude: 230.9, displayDegree: `${longitudeToSign(230.9).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const }
    ],
    aspects: [
      { id: 'aspect.sun.trine.jupiter', leftBody: 'sun', aspect: 'trine', rightBody: 'jupiter', orb: 3.2, display: 'Sun trine Jupiter (3.2° orb)', uncertainty: 'low' as const },
      { id: 'aspect.moon.square.saturn', leftBody: 'moon', aspect: 'square', rightBody: 'saturn', orb: 2.8, display: 'Moon square Saturn (2.8° orb)', uncertainty: 'low' as const },
      { id: 'aspect.venus.sextile.mars', leftBody: 'venus', aspect: 'sextile', rightBody: 'mars', orb: 4.1, display: 'Venus sextile Mars (4.1° orb)', uncertainty: 'low' as const }
    ],
    humanDesign: {
      personalityActivations: [
        { id: 'hd.personality.sun', body: 'sun', gate: 13, line: 2, uncertainty: 'low' as const },
        { id: 'hd.personality.moon', body: 'moon', gate: 49, line: 4, uncertainty: 'low' as const }
      ]
    },
    geneKeys: {
      activations: [
        { id: 'gk.activation.sun', body: 'sun', activation: 13, uncertainty: 'low' as const },
        { id: 'gk.activation.moon', body: 'moon', activation: 49, uncertainty: 'low' as const }
      ]
    },
    numerology: [
      { id: 'numerology.lifePath', key: 'lifePath', value: reduceNumber(1 + 9 + 9 + 0 + 0 + 5 + 1 + 7), uncertainty: 'low' as const },
      { id: 'numerology.birthDay', key: 'birthDay', value: reduceNumber(17), uncertainty: 'low' as const }
    ],
    houses: null,
    provenance: {
      astronomy: 'Test fixture',
      observerCenter: 'Earth geocenter 500@399',
      timezoneResolution: 'User-selected IANA timezone',
      birthTimeCertainty: 'exact' as const,
      rawBirthInputReturned: false,
      exactPrivateLocationReturned: false,
      completeHumanDesignClaimed: false,
      completeGeneKeysClaimed: false,
      housesClaimed: false
    }
  };
}

function buildTestInput(): EmotionalFieldInput {
  const source = buildTestSourceData();
  const validated = baselineSourceDataSchema.parse(source);
  const profile = buildDeterministicFacetProfile(validated);
  const axes = buildExpressionAxisValues({ facets: profile.facets });

  return {
    facets: profile.facets,
    axes,
    domain: 'self'
  };
}

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe('Emotional Field', () => {
  it('produces a valid Emotional Field from Baseline + Expression Field', () => {
    const input = buildTestInput();
    const field = buildEmotionalField(input);

    expect(field.version).toBe(EMOTIONAL_FIELD_VERSION);
    expect(field.subject).toBe('self');
    expect(field.generatedAt).toBeTruthy();
    expect(field.loop).toBeDefined();
    expect(field.loop.self.length).toBeGreaterThan(0);
    expect(field.loop.expression.length).toBeGreaterThan(0);
    expect(field.loop.relationship).toBeDefined();
    expect(field.loop.return).toBeDefined();
    expect(field.loop.capacity).toBeDefined();
  });

  it('maps every Baseline facet to a pattern observation in the SELF phase', () => {
    const input = buildTestInput();
    const field = buildEmotionalField(input);

    const selfFacetIds = field.loop.self.map((obs) => obs.facetId);
    const inputFacetIds = input.facets.map((f) => f.id);
    expect(selfFacetIds).toEqual(inputFacetIds);

    for (const obs of field.loop.self) {
      expect(obs.observation.length).toBeGreaterThan(10);
      expect(obs.normalExpression.length).toBeGreaterThan(10);
      expect(obs.pressureExpression.length).toBeGreaterThan(10);
      expect(obs.capacityExpression.length).toBeGreaterThan(10);
      expect(obs.basisRefs.length).toBeGreaterThan(0);
    }
  });

  it('maps every Expression Field axis to an expression dynamic in the EXPRESSION phase', () => {
    const input = buildTestInput();
    const field = buildEmotionalField(input);

    const exprAxisIds = field.loop.expression.map((dyn) => dyn.axisId);
    const inputAxisIds = input.axes.map((a) => a.id);
    expect(exprAxisIds).toEqual(inputAxisIds);

    for (const dyn of field.loop.expression) {
      expect(dyn.loopContribution.length).toBeGreaterThan(10);
      expect(dyn.pressureResponse.length).toBeGreaterThan(10);
      expect(dyn.basisRefs.length).toBeGreaterThan(0);
    }
  });

  it('identifies dominant axes correctly', () => {
    const input = buildTestInput();
    const field = buildEmotionalField(input);

    const expectedDominant = input.axes
      .filter((a) => a.value >= 55 || a.state === 'under_pressure' || a.state === 'gift')
      .map((a) => a.id)
      .slice(0, 6);

    expect(field.dominantAxes).toEqual(expectedDominant);
    expect(field.dominantAxes.length).toBeLessThanOrEqual(6);
  });

  it('preserves basis references from input throughout the field', () => {
    const input = buildTestInput();
    const field = buildEmotionalField(input);

    const allInputBasisRefs = [
      ...input.facets.flatMap((f) => f.basisRefs),
      ...input.axes.flatMap((a) => a.basisRefs)
    ];
    const uniqueInputBasisRefs = new Set(allInputBasisRefs);

    for (const ref of field.basisRefs) {
      expect(uniqueInputBasisRefs.has(ref)).toBe(true);
    }
  });

  it('records correct provenance', () => {
    const input = buildTestInput();
    const field = buildEmotionalField(input);

    expect(field.provenance.expressionFieldVersion).toBe('expression-field.v1');
    expect(field.provenance.baselineFacetCount).toBe(input.facets.length);
    expect(field.provenance.expressionAxisCount).toBe(input.axes.length);
    expect(field.provenance.computationType).toBe('deterministic');
  });

  it('includes appropriate limitations', () => {
    const input = buildTestInput();
    const field = buildEmotionalField(input);

    expect(field.limitations.length).toBeGreaterThan(0);
    const limitationsText = field.limitations.join(' ');
    expect(limitationsText).toContain('observable patterns');
    expect(limitationsText).toContain('internal psychological states');
    expect(limitationsText).toContain('not predict');
  });

  it('produces deterministic output for identical inputs (excluding generatedAt)', () => {
    const input = buildTestInput();
    const first = buildEmotionalField(input);
    const second = buildEmotionalField(input);

    const { generatedAt: _, ...firstCore } = first;
    const { generatedAt: __, ...secondCore } = second;
    expect(firstCore).toEqual(secondCore);
  });

  it('the full pipeline: Baseline → Expression Field → Emotional Field → answer can be traced', () => {
    // Layer A: Baseline
    const source = buildTestSourceData();
    const validated = baselineSourceDataSchema.parse(source);
    const profile = buildDeterministicFacetProfile(validated);
    const registry = buildBaselineBasisRegistry(validated);

    // Layer B: Expression Field
    const axes = buildExpressionAxisValues({ facets: profile.facets });

    // Layer C: Emotional Field
    const emotionalField = buildEmotionalField({
      facets: profile.facets,
      axes,
      domain: 'self'
    });

    // Layer D: sovereign-answer.v2 can reference Emotional Field data
    const registryIds = new Set(registry.map((item) => item.id));
    const emotionalFieldRefs = emotionalField.basisRefs.filter((ref) => registryIds.has(ref));

    const answer: SovereignAnswerV2 = {
      version: 'sovereign-answer.v2',
      mode: 'baseline',
      depth: 'standard',
      headline: emotionalField.loop.relationship.mechanism.slice(0, 100),
      direct_answer: `${emotionalField.loop.relationship.manifestation} ${emotionalField.loop.return.availableShift}`.slice(0, 500),
      sections: [
        {
          id: 'steady',
          label: 'Steady pattern',
          body: emotionalField.loop.self[0]?.observation ?? 'The pattern has stable elements.'
        },
        {
          id: 'shadow',
          label: 'Under pressure',
          body: emotionalField.loop.expression[0]?.pressureResponse ?? 'Pressure may shift the expression.'
        },
        {
          id: 'gift',
          label: 'Available capacity',
          body: emotionalField.loop.capacity.availableStrengths[0] ?? 'Capacity is available.'
        }
      ],
      basis_refs: emotionalFieldRefs.slice(0, 3),
      correction_prompt: 'Does this match your experience?',
      actions: [{ type: 'explore_facet', label: 'Explore this quality' }],
      confidence: 'supported',
      safety_mode: 'standard'
    };

    const parsed = sovereignAnswerSchema.parse(answer);
    expect(parsed.version).toBe('sovereign-answer.v2');
    expect(parsed.sections.length).toBeGreaterThanOrEqual(2);
    for (const ref of parsed.basis_refs) {
      expect(registryIds.has(ref)).toBe(true);
    }
  });

  it('emotional field references the loop structure: self → expression → relationship → return → capacity', () => {
    const input = buildTestInput();
    const field = buildEmotionalField(input);

    // SELF phase has observations grounded in facets
    expect(field.loop.self.length).toBe(input.facets.length);
    for (const obs of field.loop.self) {
      expect(obs.facetId).toBeTruthy();
      expect(obs.observation).toBeTruthy();
    }

    // EXPRESSION phase has dynamics grounded in axes
    expect(field.loop.expression.length).toBe(input.axes.length);
    for (const dyn of field.loop.expression) {
      expect(dyn.axisId).toBeTruthy();
      expect(dyn.loopContribution).toBeTruthy();
    }

    // RELATIONSHIP phase has interaction dynamics
    expect(field.loop.relationship.mechanism).toBeTruthy();
    expect(field.loop.relationship.manifestation).toBeTruthy();
    expect(field.loop.relationship.sustainingConditions.length).toBeGreaterThan(0);
    expect(field.loop.relationship.interruptingConditions.length).toBeGreaterThan(0);
    expect(field.loop.relationship.ownershipDistinction).toBeTruthy();

    // RETURN phase has sustaining and changing forces
    expect(field.loop.return.sustainingForces.length).toBeGreaterThan(0);
    expect(field.loop.return.changingForces.length).toBeGreaterThan(0);
    expect(field.loop.return.availableShift).toBeTruthy();

    // CAPACITY phase has strengths, needs, and questions
    expect(field.loop.capacity.availableStrengths.length).toBeGreaterThan(0);
    expect(field.loop.capacity.openQuestions.length).toBeGreaterThan(0);
  });

  it('relationship domain produces interaction-aware dynamics', () => {
    const input = buildTestInput();
    input.domain = 'relationship';
    input.interaction = {
      partnerFacets: [
        { id: 'communication', title: 'Communication', basisRefs: ['partner.comm'] },
        { id: 'boundaries', title: 'Boundaries', basisRefs: ['partner.bound'] }
      ],
      pairContacts: [
        { leftBody: 'sun', aspect: 'trine', rightBody: 'jupiter', orb: 3.2, basisRefs: ['contact.sun.trine.jupiter'] }
      ]
    };

    const field = buildEmotionalField(input);
    expect(field.subject).toBe('relationship');
    expect(field.loop.relationship.mechanism).toBeTruthy();
    expect(field.loop.relationship.ownershipDistinction).toContain('Each person owns');
  });
});
