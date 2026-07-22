export const DEFAULT_AI_PROVIDER = 'cloudflare-gateway';
export const DIRECT_OPENAI_PROVIDER = 'openai-direct';
export const DEFAULT_AI_MODEL = 'openai/gpt-5.6-terra';
const MAX_MODEL_LENGTH = 120;
const PROVIDERS = [DEFAULT_AI_PROVIDER, DIRECT_OPENAI_PROVIDER] as const;

export type AiProvider = typeof PROVIDERS[number];

export interface AiModelConfig {
  provider: AiProvider;
  model: string;
}

export function resolveAiProvider(value?: unknown): AiProvider {
  if (value === undefined || value === null) return DEFAULT_AI_PROVIDER;
  if (typeof value !== 'string') throw new Error('AI_PROVIDER must be a string');
  if ((PROVIDERS as readonly string[]).includes(value)) return value as AiProvider;
  throw new Error(`AI_PROVIDER must be one of: ${PROVIDERS.join(', ')}`);
}

export function resolveAiModel(value?: unknown): string {
  if (value === undefined || value === null) return DEFAULT_AI_MODEL;
  if (typeof value !== 'string') throw new Error('AI_MODEL must be a string');
  if (value.length === 0) throw new Error('AI_MODEL must not be empty');
  if (value.length > MAX_MODEL_LENGTH) throw new Error(`AI_MODEL must be ${MAX_MODEL_LENGTH} characters or fewer`);
  if (/\s/.test(value)) throw new Error('AI_MODEL must not contain whitespace');
  if (/[\x00-\x1F\x7F]/.test(value)) throw new Error('AI_MODEL must not contain control characters');
  return value;
}

export function resolveAiModelConfig(env: { AI_PROVIDER?: unknown; AI_MODEL?: unknown } = {}): AiModelConfig {
  return { provider: resolveAiProvider(env.AI_PROVIDER), model: resolveAiModel(env.AI_MODEL) };
}

export function toDirectOpenAIModel(model: string): string {
  return model.startsWith('openai/') ? model.slice('openai/'.length) : model;
}
