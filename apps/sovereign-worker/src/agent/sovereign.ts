import { Agent, Runner, tool } from '@openai/agents';
import { DEFAULT_AI_PROVIDER, DIRECT_OPENAI_PROVIDER, resolveAiModel, resolveAiModelConfig, toDirectOpenAIModel } from '@sovereign/agent-contracts';
import { z } from 'zod';
import type { Env } from '../env';
import { compareBaselineToCurrentConditions, getBaselineDimension, getBaselineSummary, getCurrentConditions } from '../adapters/sovv';
import { recordCorrection } from '../db/threads';
import { sovereignRuntimePromptV1 } from './prompt-v1';
import { assertSafeUserInput, assertSovereignOutputSafety } from './safety';

export interface SovereignContext {
  env: Env;
  accountId: string;
  threadId: string;
  traceId: string;
  covenantEnabled: boolean;
  sovvCookieHeader?: string | undefined;
}

const personSchema = z.object({ personId: z.string().default('self') });

const baselineTool = tool({
  name: 'get_my_baseline_summary',
  description: 'Return a reduced plain-language Baseline summary for the authenticated user without raw birth data.',
  parameters: personSchema.extend({ focus: z.string().optional() }),
  execute: async ({ personId, focus }, context) => getBaselineSummary((context?.context as SovereignContext).env, personId, focus, { cookieHeader: (context?.context as SovereignContext).sovvCookieHeader })
});

const baselineDimensionTool = tool({
  name: 'explore_my_baseline_dimension',
  description: 'Explore one Baseline dimension in plain language without deterministic claims.',
  parameters: personSchema.extend({ dimension: z.string() }),
  execute: async ({ personId, dimension }, context) => getBaselineDimension((context?.context as SovereignContext).env, personId, dimension, { cookieHeader: (context?.context as SovereignContext).sovvCookieHeader })
});

const currentConditionsTool = tool({
  name: 'get_my_current_conditions',
  description: 'Return reduced current-condition amplification. Never infer exact emotion.',
  parameters: personSchema,
  execute: async ({ personId }, context) => getCurrentConditions((context?.context as SovereignContext).env, personId)
});

const compareTool = tool({
  name: 'compare_baseline_to_current_conditions',
  description: 'Separate enduring Baseline tendency from current amplification and unknown actual state.',
  parameters: personSchema,
  execute: async ({ personId }, context) => compareBaselineToCurrentConditions((context?.context as SovereignContext).env, personId, { cookieHeader: (context?.context as SovereignContext).sovvCookieHeader })
});

const correctionTool = tool({
  name: 'record_user_correction',
  description: 'Record explicit Yes / Partly / Not today feedback for the current thread only unless separately saved.',
  parameters: z.object({ correction: z.enum(['yes', 'partly', 'not_today']), note: z.string().optional() }),
  execute: async ({ correction, note }, context) => {
    const runtime = context?.context as SovereignContext;
    await recordCorrection(runtime.env, runtime.accountId, runtime.threadId, correction, note);
    return { savedToThread: true, savedToLibrary: false, correction };
  }
});

const agentByModel = new Map<string, Agent<SovereignContext>>();

export function getSovereignAgent(configuredModel?: unknown): Agent<SovereignContext> {
  const model = toDirectOpenAIModel(resolveAiModel(configuredModel));
  const existing = agentByModel.get(model);
  if (existing) return existing;
  const agent = new Agent<SovereignContext>({
    name: 'Sovereign',
    model,
    instructions: sovereignRuntimePromptV1,
    tools: [baselineTool, baselineDimensionTool, currentConditionsTool, compareTool, correctionTool]
  });
  agentByModel.set(model, agent);
  return agent;
}

export const sovereignAgent = getSovereignAgent('openai/gpt-5.6-terra');

export const sovereignRunner = new Runner({ tracingDisabled: false, traceIncludeSensitiveData: false, workflowName: 'sovereign-os' });

export async function runSovereignText(input: string, context: SovereignContext): Promise<string> {
  assertSafeUserInput(input);
  const aiConfig = resolveAiModelConfig(context.env);
  if (aiConfig.provider === DEFAULT_AI_PROVIDER) return collectTextStream(await runCloudflareGatewayStream(input, context, aiConfig.model));
  if (aiConfig.provider !== DIRECT_OPENAI_PROVIDER) throw new Error('Unsupported AI provider for Sovereign runtime.');
  const result = await sovereignRunner.run(getSovereignAgent(aiConfig.model), input, { context, maxTurns: 6 });
  const output = String(result.finalOutput ?? 'Sovereign could not produce a response.');
  assertSovereignOutputSafety(output);
  return output;
}

export async function runSovereignStream(input: string, context: SovereignContext): Promise<globalThis.ReadableStream<string>> {
  assertSafeUserInput(input);
  const aiConfig = resolveAiModelConfig(context.env);
  if (aiConfig.provider === DEFAULT_AI_PROVIDER) return runCloudflareGatewayStream(input, context, aiConfig.model);
  if (aiConfig.provider !== DIRECT_OPENAI_PROVIDER) throw new Error('Unsupported AI provider for Sovereign runtime.');
  const result = await sovereignRunner.run(getSovereignAgent(aiConfig.model), input, { context, maxTurns: 6, stream: true });
  return result.toTextStream() as unknown as globalThis.ReadableStream<string>;
}

async function runCloudflareGatewayStream(input: string, context: SovereignContext, model: string): Promise<globalThis.ReadableStream<string>> {
  if (!context.env.AI) throw new Error('Cloudflare AI binding is not configured.');
  if (!context.env.AI_GATEWAY_ID) throw new Error('AI_GATEWAY_ID is not configured.');
  const prompt = await buildCloudflareGatewayPrompt(input, context);
  const result = await context.env.AI.run(
    model,
    { input: prompt, max_output_tokens: 700, stream: true },
    { gateway: { id: context.env.AI_GATEWAY_ID, skipCache: true } }
  );
  return normalizeAiRunResultToTextStream(result);
}

async function buildCloudflareGatewayPrompt(input: string, context: SovereignContext): Promise<string> {
  const reducedContext = await compareBaselineToCurrentConditions(context.env, 'self', { cookieHeader: context.sovvCookieHeader });
  return `${sovereignRuntimePromptV1}\n\nReduced server-side context, already consent-checked and stripped of sensitive computation inputs, exact location, secrets, source file paths, and private identifiers:\n${JSON.stringify({ contractVersion: reducedContext.contractVersion, provenance: reducedContext.provenance, uncertainty: reducedContext.uncertainty, separation: reducedContext.data.separation, baseline: stripModelPrivateFields(reducedContext.data.baseline), current: stripModelPrivateFields(reducedContext.data.current) })}\n\nUser request:\n${input}\n\nReturn only a public user-facing answer. Use these headings exactly: Baseline, Current, Observed, Unknown. Covenant is unavailable unless explicitly enabled, and it is not enabled for this turn.`;
}

function stripModelPrivateFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripModelPrivateFields);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .filter(([key]) => !['sourceRefs', 'requestId'].includes(key))
    .map(([key, item]) => [key, stripModelPrivateFields(item)]));
}

function normalizeAiRunResultToTextStream(result: unknown): globalThis.ReadableStream<string> {
  if (result instanceof ReadableStream) return decodeTextStream(result as ReadableStream<string | Uint8Array>);
  if (result instanceof Response) {
    if (result.body) return decodeTextStream(result.body as ReadableStream<Uint8Array>);
    return oneChunkStream(result.text());
  }
  if (isAsyncIterable(result)) return asyncIterableToTextStream(result);
  return oneChunkStream(Promise.resolve(extractText(result)));
}

function decodeTextStream(stream: ReadableStream<string | Uint8Array>): globalThis.ReadableStream<string> {
  const decoder = new TextDecoder();
  return stream.pipeThrough(new TransformStream<string | Uint8Array, string>({
    transform(chunk, controller) {
      const text = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      const publicText = extractStreamChunkText(text);
      if (publicText) controller.enqueue(publicText);
    }
  }));
}

function asyncIterableToTextStream(iterable: AsyncIterable<unknown>): globalThis.ReadableStream<string> {
  return new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of iterable) controller.enqueue(extractText(chunk));
      controller.close();
    }
  });
}

function oneChunkStream(text: Promise<string>): globalThis.ReadableStream<string> {
  return new ReadableStream<string>({
    async start(controller) {
      controller.enqueue(await text);
      controller.close();
    }
  });
}

function extractText(value: unknown): string {
  if (typeof value === 'string') return extractStreamChunkText(value);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.output_text === 'string') return record.output_text;
    if (typeof record.response === 'string') return record.response;
    if (typeof record.text === 'string') return record.text;
    if (Array.isArray(record.choices)) return record.choices.map(extractText).join('');
    if (record.delta) return extractText(record.delta);
    if (record.message) return extractText(record.message);
    if (record.content) return extractText(record.content);
  }
  return JSON.stringify(value ?? '');
}

function extractStreamChunkText(text: string): string {
  if (!text.includes('data:')) return text;
  return text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim()).filter((line) => line && line !== '[DONE]')
    .map((payload) => {
      try { return extractText(JSON.parse(payload)); } catch { return payload; }
    }).join('');
}

function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  return Boolean(value && typeof (value as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === 'function');
}

async function collectTextStream(stream: ReadableStream<string>): Promise<string> {
  const reader = stream.getReader();
  let output = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    output += value;
  }
  assertSovereignOutputSafety(output);
  return output;
}
