import { describe, expect, it } from 'vitest';
import { sovereignRuntimePromptV1 } from './prompt-v1';
import { getSovereignAgent } from './sovereign';
import { compareBaselineToCurrentConditions } from '../adapters/sovv';

const fakeEnv = { SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '' } as never;

describe('Sovereign runtime behavior contract', () => {
  it('requires Baseline/current/observed/unknown separation without incident-first behavior', () => {
    expect(sovereignRuntimePromptV1).toContain('useful without requiring the user to describe an incident');
    expect(sovereignRuntimePromptV1).toContain('Enduring Baseline tendency');
    expect(sovereignRuntimePromptV1).toContain('Current amplification');
    expect(sovereignRuntimePromptV1).toContain('Observed behavior');
    expect(sovereignRuntimePromptV1).toContain('Unknown actual state');
  });

  it('blocks diagnosis, hidden intent, deterministic proof, and Covenant by default', () => {
    expect(sovereignRuntimePromptV1).toContain('Do not diagnose');
    expect(sovereignRuntimePromptV1).toContain('Do not claim hidden intent');
    expect(sovereignRuntimePromptV1).toContain('biblical interpretation into proof');
    expect(sovereignRuntimePromptV1).toContain('Covenant is unavailable unless explicitly enabled');
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


describe('Sovereign model configuration', () => {
  it('uses the configured model through the shared model resolver', () => {
    const agent = getSovereignAgent('openai/gpt-5.6-luna') as unknown as { model: string };
    expect(agent.model).toBe('gpt-5.6-luna');
  });

  it('rejects invalid model configuration before constructing an agent', () => {
    expect(() => getSovereignAgent('gpt 5')).toThrow(/whitespace/);
  });
});

describe('Cloudflare Gateway Worker adapter', () => {
  it('streams through the AI binding with reduced context and gateway metadata', async () => {
    const calls: Array<{ model: string; input: unknown; options: unknown }> = [];
    const { runSovereignStream } = await import('./sovereign');
    const env = {
      APP_ENV: 'test',
      APP_VERSION: 'test',
      AI_PROVIDER: 'cloudflare-gateway',
      AI_MODEL: 'openai/gpt-5.6-terra',
      AI_GATEWAY_ID: 'sovereign',
      SOVV_INTERNAL_BASE_URL: '',
      SOVV_INTERNAL_AUTH_TOKEN: '',
      OPENAI_API_KEY: '',
      STRIPE_SECRET_KEY: '',
      STRIPE_WEBHOOK_SECRET: '',
      SESSION_SIGNING_SECRET: 'test',
      AI: {
        async run(model: string, input: unknown, options: unknown) {
          calls.push({ model, input, options });
          return new ReadableStream<string>({
            start(controller) {
              controller.enqueue('Baseline: fixture tendency.\nCurrent: fixture amplification.\nObserved: nothing confirmed.\nUnknown: actual state remains unknown.');
              controller.close();
            }
          });
        }
      }
    } as never;
    const stream = await runSovereignStream('Help me start Today without an incident prompt.', { env, accountId: 'acct_test', threadId: 'thread_test', traceId: 'trace_test', covenantEnabled: false });
    const reader = stream.getReader();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += value;
    }
    expect(text).toContain('Baseline');
    expect(calls).toHaveLength(1);
    expect(calls[0]?.model).toBe('openai/gpt-5.6-terra');
    expect(calls[0]?.options).toEqual({ gateway: { id: 'sovereign', skipCache: true } });
    expect(JSON.stringify(calls[0]?.input)).toContain('Reduced server-side context');
    expect(JSON.stringify(calls[0]?.input)).not.toMatch(/birth date|birth time|latitude|longitude|workspace\/SOVV/i);
  });
});
