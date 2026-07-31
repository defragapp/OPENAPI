import { describe, expect, it } from 'vitest';
import type { Env } from '../env';
import { routeSovereignSafety } from './risk-router';
import { combineSafetyDecision, reviewSovereignSafetyRisk } from './semantic-risk-classifier';
import type { SemanticSafetySignal } from './safety-contracts';

function signal(overrides: Partial<SemanticSafetySignal> = {}): SemanticSafetySignal {
  return {
    version: 'sovereign-risk-signal.v1',
    categories: ['none'],
    disposition: 'standard',
    severity: 'low',
    imminence: 'not_indicated',
    confidence: 'high',
    ...overrides
  };
}

function envWithResult(result: unknown, capture?: { input?: unknown; options?: unknown }): Env {
  return {
    AI_PROVIDER: 'cloudflare-gateway',
    AI_MODEL: '@cf/zai-org/glm-4.7-flash',
    AI_GATEWAY_ID: 'test-gateway',
    AI: {
      async run(_model, input, options) {
        if (capture) {
          capture.input = input;
          capture.options = options;
        }
        return result;
      }
    }
  } as unknown as Env;
}

describe('semantic Sovereign safety classifier', () => {
  it('keeps a low-risk reflective question in the standard path', async () => {
    const deterministic = routeSovereignSafety('Why do I take responsibility so quickly?');
    const decision = await reviewSovereignSafetyRisk(
      'Why do I take responsibility so quickly?',
      deterministic,
      envWithResult({ output_text: JSON.stringify(signal()) })
    );

    expect(decision.disposition).toBe('standard');
    expect(decision.source).toBe('combined');
    expect(decision.requiresSemanticReview).toBe(false);
  });

  it('escalates indirect self-harm language through server policy', async () => {
    const input = 'It feels like everyone would be better if I disappeared.';
    const deterministic = routeSovereignSafety(input);
    expect(deterministic.disposition).toBe('standard');

    const decision = await reviewSovereignSafetyRisk(
      input,
      deterministic,
      envWithResult({
        output_text: JSON.stringify(signal({
          categories: ['self_harm'],
          disposition: 'urgent',
          severity: 'high',
          imminence: 'possible',
          confidence: 'high'
        }))
      })
    );

    expect(decision.disposition).toBe('urgent');
    expect(decision.categories).toContain('self_harm');
    expect(decision.suppressOrdinaryInterpretation).toBe(true);
    expect(decision.suppressActions).toContain('upsell');
  });

  it('uses a supportive response for low-confidence indirect self-harm', () => {
    const deterministic = routeSovereignSafety('I have been fading out of everything lately.');
    const decision = combineSafetyDecision(deterministic, signal({
      categories: ['self_harm'],
      disposition: 'urgent',
      severity: 'moderate',
      imminence: 'unclear',
      confidence: 'low'
    }));

    expect(decision.disposition).toBe('supportive_resources');
    expect(decision.suppressOrdinaryInterpretation).toBe(true);
  });

  it('does not let a model-provided standard disposition downgrade a high-risk category', () => {
    const deterministic = routeSovereignSafety('I cannot explain how bad this feels.');
    const decision = combineSafetyDecision(deterministic, signal({
      categories: ['harm_to_others'],
      disposition: 'standard',
      severity: 'high',
      imminence: 'possible',
      confidence: 'medium'
    }));

    expect(decision.disposition).toBe('urgent');
    expect(decision.categories).toContain('harm_to_others');
  });

  it('uses only a bounded message and privacy-safe gateway metadata', async () => {
    const capture: { input?: unknown; options?: unknown } = {};
    const input = `${'x'.repeat(5_000)} private-location-marker`;
    await reviewSovereignSafetyRisk(
      input,
      routeSovereignSafety(input),
      envWithResult({ output_text: JSON.stringify(signal()) }, capture)
    );

    const request = capture.input as { input: string; max_output_tokens: number; temperature: number };
    const options = capture.options as { gateway: { skipCache: boolean; collectLog: boolean; metadata: Record<string, string> } };
    expect(request.max_output_tokens).toBe(280);
    expect(request.temperature).toBe(0);
    expect(request.input).not.toContain('private-location-marker');
    expect(request.input).not.toMatch(/account_ref|authorized server context|exact private location/i);
    expect(options.gateway.skipCache).toBe(true);
    expect(options.gateway.collectLog).toBe(false);
    expect(options.gateway.metadata).toEqual({
      response_contract: 'sovereign-risk-signal.v1',
      classifier_version: 'semantic-risk-classifier.1'
    });
  });

  it('fails closed when production classification output is malformed', async () => {
    const promise = reviewSovereignSafetyRisk(
      'Why is this happening?',
      routeSovereignSafety('Why is this happening?'),
      envWithResult({ output_text: 'not-json' })
    );

    await expect(promise).rejects.toMatchObject({ status: 503 });
  });

  it('allows deterministic development fixtures when AI is unavailable', async () => {
    const deterministic = routeSovereignSafety('Why is this happening?');
    const decision = await reviewSovereignSafetyRisk(
      'Why is this happening?',
      deterministic,
      {} as Env,
      { allowUnavailable: true }
    );

    expect(decision).toEqual(deterministic);
  });
});
