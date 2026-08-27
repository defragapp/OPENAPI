import { describe, expect, it } from 'vitest';
import { buildEmotionalField } from '../emotional-field';
import { buildExpressionAxisValues } from '../expression-field';
import { baselineSourceDataSchema, buildBaselineBasisRegistry } from '../baseline-contracts';
import { buildDeterministicFacetProfile } from '../baseline-facets';
import { sovereignAnswerSchema, type SovereignAnswerV2 } from './recognition';
import { longitudeToSign, reduceNumber } from '../astronomy';
import { EMOTIONAL_FIELD_VERSION } from '@sovereign/agent-contracts';

/**
 * EMOTIONAL FIELD ACTIVATION TESTS
 *
 * Proves: Emotional Field reaches the live answer reasoning pipeline.
 *
 * The canonical stack:
 *   Baseline → Expression Field → Emotional Field → agent context → sovereign-answer.v2
 */

// ──────────────────────────────────────────────
// Test fixture: build a realistic authorized context
// ──────────────────────────────────────────────

function buildTestSourceData() {
  const sunLongitude = 56.5;
  const moonLongitude = 213.7;
  const computedAt = '2026-01-15T12:00:00.000Z';

  return {
    version: 'baseline-source.v1' as const,
    computationVersion: 'test-activation-v1',
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
      { id: 'aspect.moon.square.saturn', leftBody: 'moon', aspect: 'square', rightBody: 'saturn', orb: 2.8, display: 'Moon square Saturn (2.8° orb)', uncertainty: 'low' as const }
    ],
    humanDesign: {
      personalityActivations: [
        { id: 'hd.personality.sun', body: 'sun', gate: 13, line: 2, uncertainty: 'low' as const }
      ]
    },
    geneKeys: {
      activations: [
        { id: 'gk.activation.sun', body: 'sun', activation: 13, uncertainty: 'low' as const }
      ]
    },
    numerology: [
      { id: 'numerology.lifePath', key: 'lifePath', value: reduceNumber(1 + 9 + 9 + 0 + 0 + 5 + 1 + 7), uncertainty: 'low' as const }
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

function buildAuthorizedContextWithBaseline() {
  const source = buildTestSourceData();
  const validated = baselineSourceDataSchema.parse(source);
  const profile = buildDeterministicFacetProfile(validated);
  const registry = buildBaselineBasisRegistry(validated);

  return {
    selectedContext: {
      baseline: {
        status: 'completed',
        reducedContext: {
          facetProfile: profile,
          sourceData: validated,
          basisRegistry: registry,
          uncertainty: 'low',
          unknownActualState: 'Actual state remains unknown unless the user confirms it.'
        }
      },
      separation: [
        'Baseline tendency is enduring interpretive context, not diagnosis or proof.',
        'Observed behavior must be supplied or confirmed by the user.'
      ]
    },
    sovereignMode: 'defrag',
    modeInstruction: 'Clarify the user\'s own qualities, needs, response, responsibility, and next choice.'
  };
}

function buildAuthorizedContextWithoutBaseline() {
  return {
    selectedContext: {
      baseline: {
        status: 'not_started'
      }
    },
    sovereignMode: 'defrag',
    modeInstruction: 'Clarify the user\'s own qualities.'
  };
}

// ──────────────────────────────────────────────
// Tests: Emotional Field reaches the answer pipeline
// ──────────────────────────────────────────────

describe('Emotional Field activation in the answer pipeline', () => {
  it('buildEmotionalFieldFromContext extracts and computes Emotional Field from a valid authorized context', async () => {
    const { buildEmotionalFieldFromContext } = await import('./sovereign');
    const context = buildAuthorizedContextWithBaseline();
    const field = buildEmotionalFieldFromContext(context);

    expect(field).not.toBeNull();
    expect(field!.version).toBe(EMOTIONAL_FIELD_VERSION);
    expect(field!.subject).toBe('self');
    expect(field!.loop.self.length).toBeGreaterThan(0);
    expect(field!.loop.expression.length).toBeGreaterThan(0);
    expect(field!.loop.relationship.mechanism).toBeTruthy();
    expect(field!.loop.return.availableShift).toBeTruthy();
  });

  it('buildEmotionalFieldFromContext returns null when baseline is not started', async () => {
    const { buildEmotionalFieldFromContext } = await import('./sovereign');
    const context = buildAuthorizedContextWithoutBaseline();
    const field = buildEmotionalFieldFromContext(context);

    expect(field).toBeNull();
  });

  it('buildEmotionalFieldFromContext returns null for empty or invalid context', async () => {
    const { buildEmotionalFieldFromContext } = await import('./sovereign');
    expect(buildEmotionalFieldFromContext(null)).toBeNull();
    expect(buildEmotionalFieldFromContext(undefined)).toBeNull();
    expect(buildEmotionalFieldFromContext({})).toBeNull();
    expect(buildEmotionalFieldFromContext({ selectedContext: {} })).toBeNull();
  });

  it('Emotional Field is injected into the prompt when baseline data is available', async () => {
    const prompts: string[] = [];
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
              mode: 'baseline',
              depth: 'standard',
              headline: 'Your pattern has a recognizable shape.',
              direct_answer: 'The Emotional Field data in your context shows a pattern that can be observed and understood without claiming certainty about internal states.',
              sections: [
                { id: 'steady', label: 'Steady pattern', body: 'The pattern has stable elements grounded in your Baseline.' },
                { id: 'shadow', label: 'Under pressure', body: 'Under pressure, the expression may narrow.' }
              ],
              basis_refs: ['natal.sun'],
              correction_prompt: 'Does this match your experience?',
              actions: [],
              confidence: 'supported',
              safety_mode: 'standard'
            })
          };
        }
      }
    } as never;

    const { runSovereignResult } = await import('./sovereign');
    await runSovereignResult('What pattern do you see in my chart?', {
      env,
      accountId: 'acct_test',
      threadId: 'thread_test',
      traceId: 'trace_test',
      covenantEnabled: false,
      plan: 'free',
      authorizedContext: buildAuthorizedContextWithBaseline()
    });

    expect(prompts).toHaveLength(1);
    const prompt = prompts[0];

    // Emotional Field is present in the prompt
    expect(prompt).toContain('Emotional Field');
    expect(prompt).toContain('dynamic pattern layer');
    expect(prompt).toContain('loop phases');

    // Emotional Field contains structured data — each loop domain is present as a JSON key
    expect(prompt).toContain('"self"');
    expect(prompt).toContain('"expression"');
    expect(prompt).toContain('"relationship"');
    expect(prompt).toContain('"return"');
    expect(prompt).toContain('"capacity"');

    // Safe-use instructions are present
    expect(prompt).toContain('Do not use the Emotional Field to diagnose');
    expect(prompt).toContain('assign hidden motives');
    expect(prompt).toContain('claim exact emotions');
    expect(prompt).toContain('actual experience remains unknown');
  });

  it('Emotional Field is NOT injected when baseline data is absent', async () => {
    const prompts: string[] = [];
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
              mode: 'baseline',
              depth: 'standard',
              headline: 'Baseline is still being prepared.',
              direct_answer: 'Your Baseline is not yet ready, so I can answer based on what you share directly.',
              sections: [
                { id: 'steady', label: 'What is known', body: 'Your Baseline is still being prepared.' },
                { id: 'active_now', label: 'Current state', body: 'The Baseline computation has not started yet.' }
              ],
              basis_refs: [],
              correction_prompt: 'Would you like to continue onboarding?',
              actions: [],
              confidence: 'exploratory',
              safety_mode: 'standard'
            })
          };
        }
      }
    } as never;

    const { runSovereignResult } = await import('./sovereign');
    await runSovereignResult('What do you see?', {
      env,
      accountId: 'acct_test',
      threadId: 'thread_test',
      traceId: 'trace_test',
      covenantEnabled: false,
      plan: 'free',
      authorizedContext: buildAuthorizedContextWithoutBaseline()
    });

    expect(prompts).toHaveLength(1);
    const prompt = prompts[0];

    // Emotional Field section is NOT present
    expect(prompt).not.toContain('Emotional Field — the dynamic pattern layer');
  });

  it('Emotional Field basisRefs are available in the authorized basis registry for answer construction', async () => {
    const context = buildAuthorizedContextWithBaseline();
    const source = buildTestSourceData();
    const validated = baselineSourceDataSchema.parse(source);
    const profile = buildDeterministicFacetProfile(validated);
    const axes = buildExpressionAxisValues({ facets: profile.facets });
    const field = buildEmotionalField({
      facets: profile.facets,
      axes,
      domain: 'self'
    });

    const registry = buildBaselineBasisRegistry(validated);
    const registryIds = new Set(registry.map((item) => item.id));

    // Every Emotional Field basisRef that the answer might reference exists in the registry
    for (const ref of field.basisRefs) {
      if (ref.startsWith('natal.') || ref.startsWith('aspect.') || ref.startsWith('numerology.') || ref.startsWith('hd.') || ref.startsWith('gk.')) {
        expect(registryIds.has(ref)).toBe(true);
      }
    }
  });

  it('full pipeline trace: Baseline → Expression Field → Emotional Field → prompt → answer', async () => {
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

    expect(emotionalField.version).toBe(EMOTIONAL_FIELD_VERSION);
    expect(emotionalField.loop.self.length).toBe(profile.facets.length);
    expect(emotionalField.loop.expression.length).toBe(axes.length);

    // Layer D: Simulate prompt injection
    const promptSnippet = JSON.stringify(emotionalField);
    expect(promptSnippet).toContain('"self"');
    expect(promptSnippet).toContain('"expression"');
    expect(promptSnippet).toContain('"relationship"');

    // Layer E: Answer can reference Emotional Field data
    const registryIds = new Set(registry.map((item) => item.id));
    const answerRefs = emotionalField.basisRefs.filter((ref) => registryIds.has(ref));

    const answer: SovereignAnswerV2 = {
      version: 'sovereign-answer.v2',
      mode: 'baseline',
      depth: 'standard',
      headline: emotionalField.loop.relationship.mechanism.slice(0, 100),
      direct_answer: `${emotionalField.loop.relationship.manifestation} ${emotionalField.loop.return.availableShift}`.slice(0, 500),
      sections: [
        { id: 'steady', label: 'Pattern', body: emotionalField.loop.self[0]?.observation ?? 'Pattern observed.' },
        { id: 'gift', label: 'Capacity', body: emotionalField.loop.capacity.availableStrengths[0] ?? 'Capacity available.' }
      ],
      basis_refs: answerRefs.slice(0, 3),
      correction_prompt: 'Does this match?',
      actions: [],
      confidence: 'supported',
      safety_mode: 'standard'
    };

    const parsed = sovereignAnswerSchema.parse(answer);
    expect(parsed.version).toBe('sovereign-answer.v2');
    expect(parsed.basis_refs.length).toBeGreaterThan(0);
  });

  it('Emotional Field safe-use instructions prohibit psychological diagnosis in the prompt', async () => {
    const prompts: string[] = [];
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
              mode: 'baseline',
              depth: 'standard',
              headline: 'Pattern observed.',
              direct_answer: 'The Emotional Field provides structured evidence for understanding observable patterns without claiming psychological certainty.',
              sections: [
                { id: 'steady', label: 'Pattern', body: 'Observable pattern grounded in Baseline.' },
                { id: 'active_now', label: 'Under pressure', body: 'Under pressure the pattern may narrow or accelerate.' }
              ],
              basis_refs: ['natal.sun'],
              correction_prompt: 'Does this match?',
              actions: [],
              confidence: 'supported',
              safety_mode: 'standard'
            })
          };
        }
      }
    } as never;

    const { runSovereignResult } = await import('./sovereign');
    await runSovereignResult('Tell me about my emotional patterns', {
      env,
      accountId: 'acct_test',
      threadId: 'thread_test',
      traceId: 'trace_test',
      covenantEnabled: false,
      plan: 'free',
      authorizedContext: buildAuthorizedContextWithBaseline()
    });

    const prompt = prompts[0];

    // The prompt contains explicit prohibitions against misuse
    expect(prompt).toContain('Do not use the Emotional Field to diagnose');
    expect(prompt).toContain('assign hidden motives');
    expect(prompt).toContain('claim exact emotions');
    expect(prompt).toContain('make deterministic predictions');
    expect(prompt).toContain('observable patterns');
    expect(prompt).toContain('actual experience remains unknown');
  });
});
