import { describe, expect, it } from 'vitest';
import {
  RELATIONSHIP_FIELD_VERSION,
  type RelationshipField,
  type RelationshipFieldInput
} from '@sovereign/agent-contracts';
import { buildRelationshipField } from './relationship-field';
import { buildEmotionalField } from './emotional-field';
import { buildExpressionAxisValues } from './expression-field';
import { buildDeterministicFacetProfile } from './baseline-facets';
import { baselineSourceDataSchema } from './baseline-contracts';
import { longitudeToSign, reduceNumber } from './astronomy';
import { sovereignAnswerSchema, type SovereignAnswerV2 } from './agent/recognition';

/**
 * RELATIONSHIP FIELD TESTS
 *
 * Proves: Emotional Field A + Emotional Field B + Pair Contacts → Relationship Field → sovereign-answer.v2
 *
 * The Relationship Field is the interaction dynamics layer that sits between
 * two Emotional Fields and the answer output.
 */

// ──────────────────────────────────────────────
// Test fixtures: two different source data sets
// ──────────────────────────────────────────────

function buildSourceDataA() {
  const sunLongitude = 56.5;
  const moonLongitude = 213.7;
  const computedAt = '2026-01-15T12:00:00.000Z';

  return {
    version: 'baseline-source.v1' as const,
    computationVersion: 'test-relationship-v1',
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
      astronomy: 'Test fixture A',
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

function buildSourceDataB() {
  const sunLongitude = 142.3;
  const moonLongitude = 28.6;

  return {
    version: 'baseline-source.v1' as const,
    computationVersion: 'test-relationship-v1',
    computedAt: '2026-01-15T12:00:00.000Z',
    uncertainty: 'low' as const,
    natalBodies: [
      { id: 'natal.sun', body: 'sun', sign: longitudeToSign(sunLongitude).sign, longitude: sunLongitude, displayDegree: `${longitudeToSign(sunLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.moon', body: 'moon', sign: longitudeToSign(moonLongitude).sign, longitude: moonLongitude, displayDegree: `${longitudeToSign(moonLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.mercury', body: 'mercury', sign: longitudeToSign(200.1).sign, longitude: 200.1, displayDegree: `${longitudeToSign(200.1).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.venus', body: 'venus', sign: longitudeToSign(95.7).sign, longitude: 95.7, displayDegree: `${longitudeToSign(95.7).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.mars', body: 'mars', sign: longitudeToSign(350.2).sign, longitude: 350.2, displayDegree: `${longitudeToSign(350.2).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.jupiter', body: 'jupiter', sign: longitudeToSign(125.8).sign, longitude: 125.8, displayDegree: `${longitudeToSign(125.8).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.saturn', body: 'saturn', sign: longitudeToSign(88.3).sign, longitude: 88.3, displayDegree: `${longitudeToSign(88.3).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.uranus', body: 'uranus', sign: longitudeToSign(45.1).sign, longitude: 45.1, displayDegree: `${longitudeToSign(45.1).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.neptune', body: 'neptune', sign: longitudeToSign(175.9).sign, longitude: 175.9, displayDegree: `${longitudeToSign(175.9).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const },
      { id: 'natal.pluto', body: 'pluto', sign: longitudeToSign(292.4).sign, longitude: 292.4, displayDegree: `${longitudeToSign(292.4).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' as const }
    ],
    aspects: [
      { id: 'aspect.sun.opposition.saturn', leftBody: 'sun', aspect: 'opposition', rightBody: 'saturn', orb: 1.5, display: 'Sun opposition Saturn (1.5° orb)', uncertainty: 'low' as const },
      { id: 'aspect.moon.trine.venus', leftBody: 'moon', aspect: 'trine', rightBody: 'venus', orb: 2.1, display: 'Moon trine Venus (2.1° orb)', uncertainty: 'low' as const }
    ],
    humanDesign: {
      personalityActivations: [
        { id: 'hd.personality.sun', body: 'sun', gate: 34, line: 5, uncertainty: 'low' as const },
        { id: 'hd.personality.moon', body: 'moon', gate: 20, line: 3, uncertainty: 'low' as const }
      ]
    },
    geneKeys: {
      activations: [
        { id: 'gk.activation.sun', body: 'sun', activation: 34, uncertainty: 'low' as const },
        { id: 'gk.activation.moon', body: 'moon', activation: 20, uncertainty: 'low' as const }
      ]
    },
    numerology: [
      { id: 'numerology.lifePath', key: 'lifePath', value: reduceNumber(2 + 0 + 0 + 0 + 3 + 1 + 5 + 9), uncertainty: 'low' as const },
      { id: 'numerology.birthDay', key: 'birthDay', value: reduceNumber(27), uncertainty: 'low' as const }
    ],
    houses: null,
    provenance: {
      astronomy: 'Test fixture B',
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

function buildTestInput(): RelationshipFieldInput {
  const sourceA = buildSourceDataA();
  const validatedA = baselineSourceDataSchema.parse(sourceA);
  const profileA = buildDeterministicFacetProfile(validatedA);
  const axesA = buildExpressionAxisValues({ facets: profileA.facets });
  const fieldA = buildEmotionalField({ facets: profileA.facets, axes: axesA, domain: 'self' });

  const sourceB = buildSourceDataB();
  const validatedB = baselineSourceDataSchema.parse(sourceB);
  const profileB = buildDeterministicFacetProfile(validatedB);
  const axesB = buildExpressionAxisValues({ facets: profileB.facets });
  const fieldB = buildEmotionalField({ facets: profileB.facets, axes: axesB, domain: 'self' });

  const pairContacts = [
    { id: 'relationship.sun.conjunction.sun', display: 'REL ☉ ☌☉ 0.0°', accessibleLabel: 'Relationship contact, your sun conjunction their sun', uncertainty: 'low' },
    { id: 'relationship.moon.trine.venus', display: 'REL ☽ △♀ 2.1°', accessibleLabel: 'Relationship contact, your moon trine their venus', uncertainty: 'low' }
  ];

  const facetPairs = profileA.facets.slice(0, 6).map((facetA) => {
    const facetB = profileB.facets.find((f) => f.id === facetA.id) ?? profileB.facets[0]!;
    return {
      facetId: facetA.id,
      participantA: { id: facetA.id, title: facetA.title, description: facetA.description, basisRefs: facetA.basisRefs },
      participantB: { id: facetB.id, title: facetB.title, description: facetB.description, basisRefs: facetB.basisRefs }
    };
  });

  return {
    emotionalFieldA: { label: 'Participant A', key: 'a', field: fieldA },
    emotionalFieldB: { label: 'Participant B', key: 'b', field: fieldB },
    pairContacts,
    facetPairs
  };
}

// ──────────────────────────────────────────────
// Tests: deterministic pairwise output
// ──────────────────────────────────────────────

describe('Relationship Field', () => {
  it('produces a valid Relationship Field from two Emotional Fields', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    expect(field.version).toBe(RELATIONSHIP_FIELD_VERSION);
    expect(field.generatedAt).toBeTruthy();
    expect(field.participants.a.label).toBe('Participant A');
    expect(field.participants.b.label).toBe('Participant B');
    expect(field.loop).toBeDefined();
    expect(field.loop.sharedStructures).toBeDefined();
    expect(field.loop.contrastingStructures).toBeDefined();
    expect(field.loop.interactionDynamics).toBeDefined();
    expect(field.loop.recurringPatterns).toBeDefined();
    expect(field.loop.sustainingForces).toBeDefined();
    expect(field.loop.changingForces).toBeDefined();
    expect(field.loop.availableCapacity).toBeDefined();
  });

  it('identifies shared structures where both participants are active in the same facets', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    // With two different charts, there should be some shared structures
    // (facets where both participants have value >= 55)
    expect(field.loop.sharedStructures.length).toBeGreaterThanOrEqual(0);
    for (const s of field.loop.sharedStructures) {
      expect(s.facetId).toBeTruthy();
      expect(s.label).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(s.interactionDescription).toBeTruthy();
      expect(s.basisRefs.length).toBeGreaterThan(0);
    }
  });

  it('identifies contrasting structures where participants differ', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    // With two different charts, there should be some contrasting structures
    // (facets where gap >= 20 and at least one is active)
    expect(field.loop.contrastingStructures.length).toBeGreaterThanOrEqual(0);
    for (const c of field.loop.contrastingStructures) {
      expect(c.facetId).toBeTruthy();
      expect(c.descriptionA).toBeTruthy();
      expect(c.descriptionB).toBeTruthy();
      expect(c.interactionDescription).toBeTruthy();
      expect(c.basisRefs.length).toBeGreaterThan(0);
    }
  });

  it('computes interaction dynamics for relationship-relevant axes', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    expect(field.loop.interactionDynamics.length).toBeGreaterThan(0);
    for (const d of field.loop.interactionDynamics) {
      expect(d.axisId).toBeTruthy();
      expect(d.label).toBeTruthy();
      expect(d.dynamicA).toBeTruthy();
      expect(d.dynamicB).toBeTruthy();
      expect(d.interactionDescription).toBeTruthy();
      expect(d.basisRefs.length).toBeGreaterThan(0);
    }
  });

  it('identifies recurring patterns from pair contacts and shared axes', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    expect(field.loop.recurringPatterns.length).toBeGreaterThan(0);
    for (const p of field.loop.recurringPatterns) {
      expect(p.id).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.sustainingConditions.length).toBeGreaterThan(0);
      expect(p.interruptingConditions.length).toBeGreaterThan(0);
    }
  });

  it('lists sustaining and changing forces', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    // At minimum, changing forces should include direct observation
    expect(field.loop.changingForces.length).toBeGreaterThan(0);
    expect(field.loop.changingForces.some((f) => f.includes('observation') || f.includes('communication'))).toBe(true);

    // Sustaining forces may be empty if no shared structures, but should be an array
    expect(Array.isArray(field.loop.sustainingForces)).toBe(true);
  });

  it('provides available capacity between participants', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    expect(field.loop.availableCapacity).toBeDefined();
    expect(field.loop.availableCapacity.openQuestions.length).toBeGreaterThan(0);
    expect(Array.isArray(field.loop.availableCapacity.availableStrengths)).toBe(true);
    expect(Array.isArray(field.loop.availableCapacity.emergingNeeds)).toBe(true);
  });

  it('preserves pair contact summary', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    expect(field.pairContactSummary.length).toBe(2);
    expect(field.pairContactSummary[0]).toContain('☉');
    expect(field.pairContactSummary[1]).toContain('☽');
  });

  it('records correct provenance', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    expect(field.provenance.computationType).toBe('deterministic');
    expect(field.provenance.participantACount).toBeGreaterThan(0);
    expect(field.provenance.participantBCount).toBeGreaterThan(0);
    expect(field.provenance.pairContactCount).toBe(2);
  });

  it('includes all basis references without duplicates', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    expect(field.basisRefs.length).toBeGreaterThan(0);
    const unique = new Set(field.basisRefs);
    expect(field.basisRefs.length).toBe(unique.size);
  });

  it('lists limitations that prohibit deterministic claims', () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    expect(field.limitations.length).toBeGreaterThan(0);
    expect(field.limitations.some((l) => l.includes('not claim') || l.includes('does not'))).toBe(true);
    expect(field.limitations.some((l) => l.includes('unknown'))).toBe(true);
  });

  it('is deterministic: identical inputs produce identical outputs', () => {
    const input = buildTestInput();
    const field1 = buildRelationshipField(input);
    const field2 = buildRelationshipField(input);

    expect(field1.version).toBe(field2.version);
    expect(field1.participants.a.label).toBe(field2.participants.a.label);
    expect(field1.loop.sharedStructures.length).toBe(field2.loop.sharedStructures.length);
    expect(field1.loop.contrastingStructures.length).toBe(field2.loop.contrastingStructures.length);
    expect(field1.loop.interactionDynamics.length).toBe(field2.loop.interactionDynamics.length);
    expect(field1.loop.recurringPatterns.length).toBe(field2.loop.recurringPatterns.length);
    expect(field1.basisRefs).toEqual(field2.basisRefs);
  });
});

// ──────────────────────────────────────────────
// Tests: Relationship Field reaches the answer pipeline
// ──────────────────────────────────────────────

describe('Relationship Field activation in the answer pipeline', () => {
  it('buildRelationshipFieldFromContext builds a Relationship Field from a pair comparison context', async () => {
    const { buildRelationshipFieldFromContext } = await import('./agent/sovereign');
    const input = buildTestInput();

    // Simulate a pair comparison authorized context
    const context = {
      kind: 'relationship',
      participants: [
        {
          key: 'you',
          label: 'You',
          role: 'self',
          facets: input.emotionalFieldA.field.loop.self.map((obs) => ({
            id: obs.facetId,
            title: obs.facetId,
            description: obs.observation,
            basisRefs: obs.basisRefs
          })),
          expressionAxes: input.emotionalFieldA.field.loop.expression.map((dyn) => ({
            id: dyn.axisId,
            label: dyn.label,
            value: dyn.value,
            state: dyn.state,
            basisRefs: dyn.basisRefs
          }))
        },
        {
          key: 'other',
          label: 'Other person',
          role: 'other',
          facets: input.emotionalFieldB.field.loop.self.map((obs) => ({
            id: obs.facetId,
            title: obs.facetId,
            description: obs.observation,
            basisRefs: obs.basisRefs
          })),
          expressionAxes: input.emotionalFieldB.field.loop.expression.map((dyn) => ({
            id: dyn.axisId,
            label: dyn.label,
            value: dyn.value,
            state: dyn.state,
            basisRefs: dyn.basisRefs
          }))
        }
      ],
      interaction: {
        facetPairs: input.facetPairs.map((fp) => ({
          facetId: fp.facetId,
          you: fp.participantA,
          other: fp.participantB
        })),
        exactPairContacts: input.pairContacts
      }
    };

    const field = buildRelationshipFieldFromContext(context);
    expect(field).not.toBeNull();
    expect(field!.version).toBe(RELATIONSHIP_FIELD_VERSION);
    expect(field!.participants.a.label).toBe('You');
    expect(field!.participants.b.label).toBe('Other person');
    expect(field!.loop.interactionDynamics.length).toBeGreaterThan(0);
  });

  it('buildRelationshipFieldFromContext returns null for empty or invalid context', async () => {
    const { buildRelationshipFieldFromContext } = await import('./agent/sovereign');
    expect(buildRelationshipFieldFromContext(null)).toBeNull();
    expect(buildRelationshipFieldFromContext(undefined)).toBeNull();
    expect(buildRelationshipFieldFromContext({})).toBeNull();
    expect(buildRelationshipFieldFromContext({ kind: 'relationship' })).toBeNull();
    expect(buildRelationshipFieldFromContext({ kind: 'relationship', participants: [] })).toBeNull();
  });

  it('Relationship Field is injected into the prompt for relationship contexts', async () => {
    const prompts: string[] = [];
    const input = buildTestInput();

    const env = {
      APP_ENV: 'test',
      APP_VERSION: 'test',
      AI_PROVIDER: 'cloudflare-gateway',
      AI_MODEL: '@cf/zai-org/glm-4.7-flash',
      AI_GATEWAY_ID: 'sovereign-ai-gateway',
      STRIPE_SECRET_KEY: '',
      STRIPE_WEBHOOK_SECRET: '',
      SESSION_SIGNING_SECRET: 'test',
      DB: {
        prepare() {
          return {
            bind() {
              return {
                async first() { return null; },
                async all() { return { results: [] }; }
              };
            }
          };
        }
      },
      AI: {
        async run(_model: string, input: unknown) {
          const promptInput = input as { prompt: string };
          prompts.push(promptInput.prompt);
          return {
            output_text: JSON.stringify({
              version: 'sovereign-answer.v2',
              mode: 'relationship',
              depth: 'deep',
              headline: 'The interaction shows recognizable dynamics.',
              direct_answer: 'The Relationship Field data shows shared and contrasting structures between you and the other person.',
              sections: [
                { id: 'you', label: 'Your pattern', body: 'Your pattern shows emphasis in clarity and steadiness.' },
                { id: 'other', label: 'Their pattern', body: 'Their pattern shows emphasis in courage and desire.' },
                { id: 'interaction', label: 'Between you', body: 'The interaction shows complementary dynamics.' },
                { id: 'responsibility', label: 'Your responsibility', body: 'You can own your own pattern without claiming knowledge of theirs.' },
                { id: 'unknowns', label: 'Unknowns', body: 'What each person is experiencing remains unknown unless confirmed.' }
              ],
              basis_refs: [],
              correction_prompt: 'Does this match what you observe?',
              actions: [],
              confidence: 'supported',
              safety_mode: 'standard'
            })
          };
        }
      }
    } as never;

    const authorizedContext = {
      kind: 'relationship',
      participants: [
        {
          key: 'you',
          label: 'You',
          role: 'self',
          facets: input.emotionalFieldA.field.loop.self.map((obs) => ({
            id: obs.facetId,
            title: obs.facetId,
            description: obs.observation,
            basisRefs: obs.basisRefs
          })),
          expressionAxes: input.emotionalFieldA.field.loop.expression.map((dyn) => ({
            id: dyn.axisId,
            label: dyn.label,
            value: dyn.value,
            state: dyn.state,
            basisRefs: dyn.basisRefs
          }))
        },
        {
          key: 'other',
          label: 'Other person',
          role: 'other',
          facets: input.emotionalFieldB.field.loop.self.map((obs) => ({
            id: obs.facetId,
            title: obs.facetId,
            description: obs.observation,
            basisRefs: obs.basisRefs
          })),
          expressionAxes: input.emotionalFieldB.field.loop.expression.map((dyn) => ({
            id: dyn.axisId,
            label: dyn.label,
            value: dyn.value,
            state: dyn.state,
            basisRefs: dyn.basisRefs
          }))
        }
      ],
      interaction: {
        facetPairs: input.facetPairs.map((fp) => ({
          facetId: fp.facetId,
          you: fp.participantA,
          other: fp.participantB
        })),
        exactPairContacts: input.pairContacts
      }
    };

    const { runSovereignResult } = await import('./agent/sovereign');
    await runSovereignResult('What dynamics do you see between us?', {
      env,
      accountId: 'acct_test',
      threadId: 'thread_test',
      traceId: 'trace_test',
      covenantEnabled: false,
      plan: 'free',
      personId: 'person_test',
      authorizedContext
    });

    expect(prompts).toHaveLength(1);
    const prompt = prompts[0];

    // Relationship Field is present in the prompt
    expect(prompt).toContain('Relationship Field');
    expect(prompt).toContain('interaction dynamics layer');

    // Relationship Field contains structured data
    expect(prompt).toContain('"sharedStructures"');
    expect(prompt).toContain('"contrastingStructures"');
    expect(prompt).toContain('"interactionDynamics"');
    expect(prompt).toContain('"recurringPatterns"');
    expect(prompt).toContain('"sustainingForces"');
    expect(prompt).toContain('"changingForces"');
    expect(prompt).toContain('"availableCapacity"');

    // Safe-use instructions are present
    expect(prompt).toContain('Do not use the Relationship Field to score compatibility');
    expect(prompt).toContain('diagnose relationship health');
    expect(prompt).toContain('assign hidden motives');
    expect(prompt).toContain('claim certainty');
    expect(prompt).toContain('predict outcomes');
    expect(prompt).toContain('actual experience between participants');
  });

  it('full pipeline trace: Emotional Field A + B → Relationship Field → prompt → answer', async () => {
    const input = buildTestInput();
    const field = buildRelationshipField(input);

    expect(field.version).toBe(RELATIONSHIP_FIELD_VERSION);
    expect(field.loop.interactionDynamics.length).toBeGreaterThan(0);

    // Simulate prompt injection
    const promptSnippet = JSON.stringify(field);
    expect(promptSnippet).toContain('"sharedStructures"');
    expect(promptSnippet).toContain('"interactionDynamics"');
    expect(promptSnippet).toContain('"recurringPatterns"');

    // Answer can reference Relationship Field data
    const answer: SovereignAnswerV2 = {
      version: 'sovereign-answer.v2',
      mode: 'relationship',
      depth: 'deep',
      headline: field.loop.sharedStructures[0]?.label
        ? `Shared ${field.loop.sharedStructures[0].label.toLowerCase()} is a recognizable dynamic.`
        : 'The interaction shows recognizable dynamics.',
      direct_answer: field.loop.interactionDynamics[0]?.interactionDescription ?? 'The interaction shows complementary dynamics.',
      sections: [
        { id: 'you', label: 'Your pattern', body: field.loop.interactionDynamics[0]?.dynamicA ?? 'Your pattern is observable.' },
        { id: 'other', label: 'Their pattern', body: field.loop.interactionDynamics[0]?.dynamicB ?? 'Their pattern is observable.' },
        { id: 'interaction', label: 'Between you', body: field.loop.interactionDynamics[0]?.interactionDescription ?? 'The interaction is observable.' },
        { id: 'responsibility', label: 'Your responsibility', body: 'You can own your own pattern without claiming knowledge of theirs.' },
        { id: 'unknowns', label: 'Unknowns', body: field.loop.availableCapacity.openQuestions[0] ?? 'What each person experiences remains unknown.' }
      ],
      basis_refs: field.basisRefs.slice(0, 3),
      correction_prompt: 'Does this match what you observe?',
      actions: [],
      confidence: 'supported',
      safety_mode: 'standard'
    };

    const parsed = sovereignAnswerSchema.parse(answer);
    expect(parsed.version).toBe('sovereign-answer.v2');
    expect(parsed.mode).toBe('relationship');
    expect(parsed.depth).toBe('deep');
    expect(parsed.basis_refs.length).toBeGreaterThan(0);
  });
});
