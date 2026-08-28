// Temporary live-model probe. Not part of the repository product surface.
// Replicates the production Sovereign answer pipeline with SYNTHETIC data only:
// real prompt, real gateway call shape, real parseSovereignAnswer + safety validators.
// No user data, no D1, no secrets. Delete after evidence capture.
import { resolveAiModelConfig } from '@sovereign/agent-contracts';
import { sovereignRuntimePromptV2 } from '../apps/sovereign-worker/src/agent/prompt-v1';
import { groundedIntelligencePrompt } from '../apps/sovereign-worker/src/agent/grounded-intelligence';
import { parseSovereignAnswer, sovereignAnswerJsonContract, composeSovereignAnswerText } from '../apps/sovereign-worker/src/agent/recognition';
import { reviewSovereignOutputSafety } from '../apps/sovereign-worker/src/agent/safety';
import {
  BASELINE_FACET_CONTRACT_VERSION,
  BASELINE_SOURCE_VERSION,
  baselineFacetIds,
  buildBaselineBasisRegistry,
  type BaselineSourceData
} from '../apps/sovereign-worker/src/baseline-contracts';

export interface Env {
  AI: Ai;
  AI_PROVIDER: string;
  AI_MODEL: string;
  AI_GATEWAY_ID: string;
}

const config = resolveAiModelConfig({ AI_PROVIDER: 'cloudflare-gateway', AI_MODEL: '@cf/zai-org/glm-4.7-flash' });

// Synthetic baseline source (same shape as the repo's own smoke fixture).
const sourceData: BaselineSourceData = {
  version: BASELINE_SOURCE_VERSION,
  computationVersion: 'live-probe-v1',
  computedAt: '2026-08-28T00:00:00.000Z',
  uncertainty: 'low',
  natalBodies: [
    { id: 'natal.sun', body: 'sun', sign: 'Cancer', longitude: 94.2, displayDegree: '04.2°', retrograde: false, uncertainty: 'low' },
    { id: 'natal.moon', body: 'moon', sign: 'Pisces', longitude: 334.1, displayDegree: '04.1°', retrograde: false, uncertainty: 'low' },
    { id: 'natal.mercury', body: 'mercury', sign: 'Leo', longitude: 124.5, displayDegree: '04.5°', retrograde: false, uncertainty: 'low' }
  ],
  aspects: [
    { id: 'aspect.sun.trine.moon', leftBody: 'sun', aspect: 'trine', rightBody: 'moon', orb: 4.1, display: 'Sun trine Moon (4.1° orb)', uncertainty: 'low' }
  ],
  humanDesign: { personalityActivations: [{ id: 'hd.personality.sun', body: 'sun', gate: 13, line: 1, uncertainty: 'low' }] },
  geneKeys: { activations: [{ id: 'gk.activation.sun', body: 'sun', activation: 13, uncertainty: 'low' }] },
  numerology: [{ id: 'numerology.lifePath', key: 'lifePath', value: 1, uncertainty: 'low' }],
  houses: null,
  provenance: {
    astronomy: 'Synthetic probe fixture', observerCenter: 'Earth geocenter', timezoneResolution: 'Synthetic probe fixture',
    birthTimeCertainty: 'exact', rawBirthInputReturned: false, exactPrivateLocationReturned: false,
    completeHumanDesignClaimed: false, completeGeneKeysClaimed: false, housesClaimed: false
  }
} as unknown as BaselineSourceData;

const registry = buildBaselineBasisRegistry(sourceData);

const facetProfile = {
  version: BASELINE_FACET_CONTRACT_VERSION,
  modelVersion: config.model,
  sourceComputationVersion: sourceData.computationVersion,
  generatedAt: '2026-08-28T00:00:01.000Z',
  interpretive: true,
  facets: baselineFacetIds.map((id) => ({
    id,
    title: id.replaceAll('_', ' '),
    description: `A synthetic authorized description for the ${id.replaceAll('_', ' ')} Baseline facet used only to test the live answer pipeline.`,
    shadowExpression: 'Under pressure, the valid capacity may narrow into overuse or responsibility taken without agreement.',
    giftExpression: 'With awareness, the same capacity can create direction while preserving consent and shared responsibility.',
    alignmentMarkers: ['Authority and responsibility are named clearly.', 'The capacity can be used without erasing personal limits.'],
    uncertainty: 'low' as const,
    basisRefs: ['natal.sun']
  }))
};

// Mirrors sanitizeBaselineForModel output shape.
const authorizedContext = {
  baseline: {
    status: 'completed',
    ready: true,
    facetProfileStatus: 'ready',
    uncertainty: 'low',
    providerStatus: 'computed',
    computationVersion: sourceData.computationVersion,
    provenance: { deterministicCalculation: true, engine: 'probe', rawBirthInputReturned: false, birthplaceSentToExternalProvider: false, sovvRuntimeDependency: false },
    reducedContext: {
      facetProfileStatus: 'ready',
      facetProfile,
      uncertainty: 'low',
      unknownActualState: 'Actual state remains unknown unless the user confirms it.',
      sourceData,
      basisRegistry: registry.map(({ id, display, uncertainty, subject }) => ({ id, display, uncertainty, subject }))
    }
  },
  current: { status: 'not_started', providerStatus: 'unavailable' },
  separation: [
    'Baseline tendency is enduring interpretive context, not diagnosis or proof.',
    'Current amplification is temporary context and does not determine behavior.',
    'Observed behavior must be supplied or confirmed by the user.',
    'Actual state remains unknown unless the user confirms it.'
  ]
};

const QUESTIONS = [
  'Why do I keep saying yes when I want to say no?',
  'What part of myself am I underusing?',
  'How do I make decisions that actually fit me?'
];

function buildPrompt(question: string): string {
  return `${sovereignRuntimePromptV2}

Authorization-checked server context, stripped of raw birth inputs, exact private location, secrets, source paths, and private identifiers:
${JSON.stringify(authorizedContext)}

Recent thread continuity. Assistant text and user corrections only; no hidden reasoning:
${JSON.stringify({ recentAssistantResponses: [], userCorrections: [], basisRegistry: [] })}

Authorized exact Basis registry. Select IDs only in basis_refs:
${JSON.stringify(registry.map(({ id, display, uncertainty, subject }) => ({ id, display, uncertainty, subject })))}

${groundedIntelligencePrompt(question)}

Required JSON shape:
${sovereignAnswerJsonContract()}

Current user message:
${question}

Covenant is off. Do not apply Scripture or biblical metaphor automatically.`;
}

async function extractText(result: unknown): Promise<string> {
  if (result instanceof Response) return result.text();
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>;
    if (typeof record.output_text === 'string') return record.output_text;
    if (typeof record.text === 'string') return record.text;
    if (record.response) return extractText(record.response);
    if (record.result) return extractText(record.result);
    if (Array.isArray(record.output)) return extractText(record.output);
    if (Array.isArray(record.choices)) return record.choices.map((c) => extractText(c)).join('');
    if (record.message) return extractText(record.message);
  }
  return JSON.stringify(result ?? '');
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    const model = env.AI_MODEL || config.model;
    const results: unknown[] = [];
    for (const question of QUESTIONS) {
      const prompt = buildPrompt(question);
      const started = Date.now();
      try {
        const raw = await extractText(await env.AI.run(
          model,
          { prompt, max_completion_tokens: 3_200 },
          { gateway: { id: env.AI_GATEWAY_ID, skipCache: true, collectLog: false, metadata: { response_contract: 'sovereign-answer.v2', probe: 'live-pipeline' } } }
        ));
        const parsed = parseSovereignAnswer(raw, registry);
        const text = composeSovereignAnswerText(parsed);
        const review = reviewSovereignOutputSafety(text, { allowFrameworkLabels: false });
        results.push({
          question,
          ok: true,
          latencyMs: Date.now() - started,
          mode: parsed.mode,
          depth: parsed.depth,
          headline: parsed.headline,
          sectionCount: parsed.sections.length,
          basisRefs: parsed.basis_refs,
          safetyBlocked: review.blocked ?? null,
          safetyNotes: review.notes ?? null,
          directAnswerPreview: parsed.direct_answer.slice(0, 160)
        });
      } catch (error) {
        results.push({
          question,
          ok: false,
          latencyMs: Date.now() - started,
          error: error instanceof Error ? error.message.slice(0, 300) : String(error).slice(0, 300)
        });
      }
    }
    return Response.json({ model, gateway: env.AI_GATEWAY_ID, results }, { headers: { 'cache-control': 'no-store' } });
  }
};
