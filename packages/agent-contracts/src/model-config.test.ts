import { describe, expect, it } from 'vitest';
import { DEFAULT_AI_MODEL, DEFAULT_AI_PROVIDER, resolveAiModel, resolveAiModelConfig, resolveAiProvider } from './model-config';

describe('AI model configuration', () => {
  it('uses the configured Cloudflare-hosted model when present', () => {
    expect(resolveAiModelConfig({ AI_PROVIDER: DEFAULT_AI_PROVIDER, AI_MODEL: '@cf/zai-org/glm-4.7-flash' })).toEqual({
      provider: DEFAULT_AI_PROVIDER,
      model: '@cf/zai-org/glm-4.7-flash'
    });
  });

  it('uses Cloudflare Gateway and a Workers AI model by default', () => {
    expect(resolveAiProvider()).toBe(DEFAULT_AI_PROVIDER);
    expect(resolveAiModel()).toBe(DEFAULT_AI_MODEL);
    expect(resolveAiModelConfig()).toEqual({ provider: DEFAULT_AI_PROVIDER, model: DEFAULT_AI_MODEL });
    expect(DEFAULT_AI_MODEL.startsWith('@cf/')).toBe(true);
  });

  it('rejects invalid provider and model values', () => {
    expect(() => resolveAiProvider('personal-openai')).toThrow(/AI_PROVIDER/);
    expect(() => resolveAiModel('')).toThrow(/must not be empty/);
    expect(() => resolveAiModel('@cf/zai org/model')).toThrow(/whitespace/);
    expect(() => resolveAiModel('@cf/model\n')).toThrow(/whitespace/);
    expect(() => resolveAiModel('x'.repeat(121))).toThrow(/120 characters/);
  });

  it('allows explicit model injection for isolated tests while release gates enforce Workers AI', () => {
    expect(resolveAiModel('openai/gpt-5.5')).toBe('openai/gpt-5.5');
  });

  it('rejects the removed direct provider path', () => {
    expect(() => resolveAiProvider('openai-direct')).toThrow(/AI_PROVIDER/);
  });
});

describe('model configuration consumers', () => {
  it('keeps smoke scripts on the shared resolver and away from legacy model and config IDs', async () => {
    const { readFile } = await import('node:fs/promises');
    const gatewaySmoke = await readFile(new URL('../../../scripts/cloudflare-gateway-smoke.ts', import.meta.url), 'utf8');
    const sovereignSmoke = await readFile(new URL('../../../scripts/worker-gateway-smoke.ts', import.meta.url), 'utf8');
    expect(gatewaySmoke + sovereignSmoke).toContain('resolveAiModelConfig');
    expect(gatewaySmoke + sovereignSmoke).not.toContain(`gpt-${'5.1'}-mini`);
    expect(gatewaySmoke + sovereignSmoke).not.toContain(`OPENAI_${'MODEL'}`);
    expect(gatewaySmoke + sovereignSmoke).toContain('[redacted]');
  });
});
