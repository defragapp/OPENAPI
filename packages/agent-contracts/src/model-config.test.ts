import { describe, expect, it } from 'vitest';
import { DEFAULT_AI_MODEL, DEFAULT_AI_PROVIDER, DIRECT_OPENAI_PROVIDER, resolveAiModel, resolveAiModelConfig, resolveAiProvider, toDirectOpenAIModel } from './model-config';

describe('AI model configuration', () => {
  it('uses configured provider and model when present', () => {
    expect(resolveAiModelConfig({ AI_PROVIDER: DIRECT_OPENAI_PROVIDER, AI_MODEL: 'openai/gpt-5.6-luna' })).toEqual({ provider: DIRECT_OPENAI_PROVIDER, model: 'openai/gpt-5.6-luna' });
  });

  it('uses Cloudflare Gateway and Terra through Unified Billing by default', () => {
    expect(resolveAiProvider()).toBe(DEFAULT_AI_PROVIDER);
    expect(resolveAiModel()).toBe(DEFAULT_AI_MODEL);
    expect(resolveAiModelConfig()).toEqual({ provider: DEFAULT_AI_PROVIDER, model: DEFAULT_AI_MODEL });
  });

  it('rejects invalid provider and model values', () => {
    expect(() => resolveAiProvider('personal-openai')).toThrow(/AI_PROVIDER/);
    expect(() => resolveAiModel('')).toThrow(/must not be empty/);
    expect(() => resolveAiModel('openai/gpt 5')).toThrow(/whitespace/);
    expect(() => resolveAiModel('openai/gpt-5\n')).toThrow(/whitespace/);
    expect(() => resolveAiModel('x'.repeat(121))).toThrow(/120 characters/);
  });

  it('maps Cloudflare provider-prefixed OpenAI models for local direct OpenAI dev only', () => {
    expect(toDirectOpenAIModel('openai/gpt-5.6-terra')).toBe('gpt-5.6-terra');
    expect(toDirectOpenAIModel('@cf/example/model')).toBe('@cf/example/model');
  });
});

describe('model configuration consumers', () => {
  it('keeps smoke scripts on the shared resolver and away from legacy model and config IDs', async () => {
    const { readFile } = await import('node:fs/promises');
    const gatewaySmoke = await readFile(new URL('../../../scripts/cloudflare-gateway-smoke.ts', import.meta.url), 'utf8');
    const openaiSmoke = await readFile(new URL('../../../scripts/openai-smoke.ts', import.meta.url), 'utf8');
    const sovereignSmoke = await readFile(new URL('../../../scripts/sovereign-smoke.ts', import.meta.url), 'utf8');
    expect(gatewaySmoke + openaiSmoke + sovereignSmoke).toContain('resolveAiModelConfig');
    expect(gatewaySmoke + openaiSmoke + sovereignSmoke).not.toContain(`gpt-${'5.1'}-mini`);
    expect(gatewaySmoke + openaiSmoke + sovereignSmoke).not.toContain(`OPENAI_${'MODEL'}`);
    expect(gatewaySmoke + openaiSmoke + sovereignSmoke).toContain('[redacted]');
  });
});
