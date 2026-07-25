import { describe, expect, it } from 'vitest';
import { sovereignRuntimePromptV1 } from './prompt-v1';
import { compareBaselineToCurrentConditions } from '../adapters/sovv';

const fakeEnv = { APP_ENV: 'test', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '' } as never;

describe('Sovereign runtime behavior contract', () => {
  it('uses authority order and asks one inward question before a long explanation', () => {
    expect(sovereignRuntimePromptV1).toContain('User-confirmed experience');
    expect(sovereignRuntimePromptV1).toContain('choose response_phase "question"');
    expect(sovereignRuntimePromptV1).toContain('exactly one inward question');
    expect(sovereignRuntimePromptV1).toContain('Symbolic data may suggest where to look. It is never proof.');
  });

  it('blocks diagnosis, hidden motive, destiny, spiritual certainty, and invented fields', () => {
    expect(sovereignRuntimePromptV1).toContain('Never diagnose');
    expect(sovereignRuntimePromptV1).toContain('Never claim hidden motives');
    expect(sovereignRuntimePromptV1).toContain('Never fill missing data');
    expect(sovereignRuntimePromptV1).toContain('Covenant is off');
  });
});

describe('SOVV adapter fallback', () => {
  it('returns reduced provenance and uncertainty without raw birth or exact location data', async () => {
    const result = await compareBaselineToCurrentConditions(fakeEnv, 'self');
    const json = JSON.stringify(result);
    expect(result.contractVersion).toBe('1');
    expect(result.uncertainty).toBe('high');
    expect(json).not.toMatch(/birth|latitude|longitude|location/i);
    expect(result.data.separation).toContain('Actual state is unknown unless the user confirms it.');
  });
});

describe('Cloudflare Gateway recognition adapter', () => {
  it('validates JSON, composes the public question, and keeps account identity pseudonymous', async () => {
    const calls: Array<{ model: string; input: unknown; options: unknown }> = [];
    const { runSovereignStream } = await import('./sovereign');
    const env = {
      APP_ENV: 'test',
      APP_VERSION: 'test',
      AI_PROVIDER: 'cloudflare-gateway',
      AI_MODEL: 'openai/gpt-5.5',
      AI_GATEWAY_ID: 'sovereign',
      SOVV_INTERNAL_BASE_URL: '',
      SOVV_INTERNAL_AUTH_TOKEN: '',
      STRIPE_SECRET_KEY: '',
      STRIPE_WEBHOOK_SECRET: '',
      SESSION_SIGNING_SECRET: 'test',
      DB: {
        prepare() {
          return { bind() { return {
            async first() { return null; },
            async all() { return { results: [] }; }
          }; } };
        }
      },
      AI: {
        async run(model: string, input: unknown, options: unknown) {
          calls.push({ model, input, options });
          return {
            response: JSON.stringify({
              response_phase: 'question',
              recognition: 'You may be trying to solve the uncertainty before you know what is actually available.',
              inward_question: 'What are you hoping the next message will make certain?',
              candidate_hidden_expectation: '',
              protected_need: '',
              clearer_form: '',
              practical_action: '',
              module_suggestion: { should_offer: false, title: '', reason: '', format: 'reflection' },
              basis: { user_confirmed: false, human_design: [], gene_keys: [], astrology: [], relationship: [], live: [], numerology: [] },
              confidence: 'exploratory',
              safety_mode: 'standard'
            })
          };
        }
      }
    } as never;
    const stream = await runSovereignStream('I already sent three messages, but I still want to explain it better.', { env, accountId: 'acct_test', threadId: 'thread_test', traceId: 'trace_test', covenantEnabled: false, plan: 'free' });
    const reader = stream.getReader();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += value;
    }
    expect(text).toContain('WHAT I NOTICE');
    expect(text).toContain('LOOK INWARD');
    expect(text.match(/\?/g)).toHaveLength(1);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.model).toBe('openai/gpt-5.5');
    expect(calls[0]?.options).toMatchObject({
      gateway: {
        id: 'sovereign',
        skipCache: true,
        collectLog: false,
        metadata: { plan: 'free', response_contract: 'inner-recognition-v1' }
      }
    });
    expect((calls[0]?.options as any).gateway.metadata.account_ref).toMatch(/^[a-f0-9]{32}$/);
    expect(JSON.stringify(calls[0]?.options)).not.toContain('acct_test');
    expect(JSON.stringify(calls[0]?.input)).toContain('Available exact Basis values');
    expect(JSON.stringify(calls[0]?.input)).not.toMatch(/birth date|birth time|latitude|longitude|workspace\/SOVV/i);
  });
});
