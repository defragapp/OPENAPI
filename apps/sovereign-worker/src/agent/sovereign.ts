import { resolveAiModelConfig } from '@sovereign/agent-contracts';
import type { Env } from '../env';
import { getModelSafeBaselineContext } from '../baseline';
import { buildPairComparison, buildSystemAnalysis } from '../relational-context';
import { sovereignRuntimePromptV1 } from './prompt-v1';
import { assertSafeUserInput, assertSovereignOutputSafety } from './safety';

export interface SovereignContext {
  env: Env;
  accountId: string;
  threadId: string;
  traceId: string;
  covenantEnabled: boolean;
  plan: string;
}

export async function runSovereignText(input: string, context: SovereignContext): Promise<string> {
  return collectTextStream(await runSovereignStream(input, context));
}

export async function runSovereignStream(input: string, context: SovereignContext): Promise<globalThis.ReadableStream<string>> {
  assertSafeUserInput(input);
  const aiConfig = resolveAiModelConfig(context.env);
  if (aiConfig.provider !== 'cloudflare-gateway') throw new Error('Only Cloudflare AI Gateway is supported.');
  const unvalidated = await runCloudflareGatewayStream(input, context, aiConfig.model);
  const publicOutput = await collectTextStream(unvalidated);
  assertSovereignOutputSafety(publicOutput);
  return oneChunkStream(Promise.resolve(publicOutput));
}

async function runCloudflareGatewayStream(input: string, context: SovereignContext, model: string): Promise<globalThis.ReadableStream<string>> {
  if (!context.env.AI) throw new Error('Cloudflare AI binding is not configured.');
  if (!context.env.AI_GATEWAY_ID) throw new Error('AI_GATEWAY_ID is not configured.');
  const prompt = await buildCloudflareGatewayPrompt(input, context);
  const result = await context.env.AI.run(
    model,
    { input: prompt, max_output_tokens: 900, stream: true },
    {
      gateway: {
        id: context.env.AI_GATEWAY_ID,
        skipCache: true,
        collectLog: false,
        metadata: {
          plan: context.plan === 'sovereign_plus' ? 'sovereign_plus' : 'free',
          account_ref: await pseudonymousAccountRef(context)
        }
      }
    }
  );
  return normalizeAiRunResultToTextStream(result);
}

async function buildCloudflareGatewayPrompt(input: string, context: SovereignContext): Promise<string> {
  const [authorizedContext, covenantEnabled] = await Promise.all([
    resolveAuthorizedContext(context),
    isCovenantEnabledForThread(context)
  ]);
  const covenantInstruction = covenantEnabled
    ? 'Covenant was explicitly enabled for this thread. The grounded answer must remain complete first. You may add one short, clearly optional suggestion to explore the issue through Scripture, but do not invent, quote, or cite a passage that was not retrieved by the approved Scripture service.'
    : 'Covenant is off for this thread. Do not apply biblical metaphor or Scripture automatically.';
  return `${sovereignRuntimePromptV1}

Authorization-checked server context, stripped of raw birth inputs, exact private location, secrets, source paths, and private identifiers:
${JSON.stringify(authorizedContext)}

User request:
${input}

Return only a public user-facing answer. Use these headings exactly: Baseline, Current, Observed, Unknown. Keep each participant separate. Do not infer hidden motive, diagnosis, moral status, future behavior, or God’s exact intent.

${covenantInstruction}`;
}

async function resolveAuthorizedContext(context: SovereignContext): Promise<unknown> {
  const systems = await context.env.DB.prepare('SELECT id FROM systems WHERE account_id = ?').bind(context.accountId).all<{ id: string }>();
  const selectedSystem = (systems.results ?? []).find((item) => threadContainsId(context.threadId, item.id));
  if (selectedSystem) return buildSystemAnalysis(context.env, context.accountId, selectedSystem.id);

  const people = await context.env.DB.prepare("SELECT id FROM persons WHERE account_id = ? AND role <> 'self'").bind(context.accountId).all<{ id: string }>();
  const selectedPerson = (people.results ?? []).find((item) => threadContainsId(context.threadId, item.id));
  if (selectedPerson) return buildPairComparison(context.env, context.accountId, selectedPerson.id);

  return getModelSafeBaselineContext(context.env, context.accountId);
}

async function isCovenantEnabledForThread(context: SovereignContext): Promise<boolean> {
  const row = await context.env.DB.prepare('SELECT covenant_enabled FROM threads WHERE id = ? AND account_id = ?')
    .bind(context.threadId, context.accountId)
    .first<{ covenant_enabled: number }>();
  return row?.covenant_enabled === 1;
}

function threadContainsId(threadId: string, id: string): boolean {
  const normalized = id.replace(/[^a-z0-9_-]/gi, '-');
  return threadId.includes(normalized);
}

async function pseudonymousAccountRef(context: SovereignContext): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(context.env.SESSION_SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(context.accountId));
  return [...new Uint8Array(signature)].slice(0, 16).map((byte) => byte.toString(16).padStart(2, '0')).join('');
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
  return text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter((line) => line && line !== '[DONE]')
    .map((payload) => {
      try { return extractText(JSON.parse(payload)); } catch { return payload; }
    })
    .join('');
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
  return output;
}
