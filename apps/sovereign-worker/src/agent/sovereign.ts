import { resolveAiModelConfig } from '@sovereign/agent-contracts';
import type { Env } from '../env';
import { getModelSafeBaselineContext } from '../baseline';
import { buildPairComparison, buildSystemAnalysis } from '../relational-context';
import { sovereignRuntimePromptV1 } from './prompt-v1';
import { assertSafeUserInput, assertSovereignOutputSafety } from './safety';
import {
  composeRecognitionResponse,
  deriveAvailableBasis,
  parseRecognitionPlan,
  recognitionJsonContract,
  type RecognitionPlan
} from './recognition';

export interface SovereignContext {
  env: Env;
  accountId: string;
  threadId: string;
  traceId: string;
  covenantEnabled: boolean;
  plan: string;
}

export interface SovereignResult {
  text: string;
  plan: RecognitionPlan;
}

export async function runSovereignText(input: string, context: SovereignContext): Promise<string> {
  return (await runSovereignResult(input, context)).text;
}

export async function runSovereignStream(input: string, context: SovereignContext): Promise<globalThis.ReadableStream<string>> {
  return oneChunkStream(Promise.resolve((await runSovereignResult(input, context)).text));
}

export async function runSovereignResult(input: string, context: SovereignContext): Promise<SovereignResult> {
  assertSafeUserInput(input);
  const aiConfig = resolveAiModelConfig(context.env);
  if (aiConfig.provider !== 'cloudflare-gateway') throw new Error('Only Cloudflare AI Gateway is supported.');

  const { prompt, availableBasis } = await buildCloudflareGatewayPrompt(input, context);
  const raw = await runCloudflareGateway(prompt, context, aiConfig.model);
  const plan = parseRecognitionPlan(raw, availableBasis);
  const text = composeRecognitionResponse(plan);
  assertSovereignOutputSafety(text);
  return { text, plan };
}

async function runCloudflareGateway(prompt: string, context: SovereignContext, model: string): Promise<string> {
  if (!context.env.AI) throw new Error('Cloudflare AI binding is not configured.');
  if (!context.env.AI_GATEWAY_ID) throw new Error('AI_GATEWAY_ID is not configured.');
  const result = await context.env.AI.run(
    model,
    { input: prompt, max_output_tokens: 1_200 },
    {
      gateway: {
        id: context.env.AI_GATEWAY_ID,
        skipCache: true,
        collectLog: false,
        metadata: {
          plan: context.plan === 'sovereign_plus' ? 'sovereign_plus' : 'free',
          account_ref: await pseudonymousAccountRef(context),
          response_contract: 'inner-recognition-v1'
        }
      }
    }
  );
  if (result instanceof Response) return result.text();
  if (result instanceof ReadableStream) return collectTextStream(decodeTextStream(result as ReadableStream<string | Uint8Array>));
  if (isAsyncIterable(result)) return collectTextStream(asyncIterableToTextStream(result));
  return extractText(result);
}

async function buildCloudflareGatewayPrompt(input: string, context: SovereignContext): Promise<{ prompt: string; availableBasis: ReturnType<typeof deriveAvailableBasis> }> {
  const [authorizedContext, continuity, covenantEnabled] = await Promise.all([
    resolveAuthorizedContext(context),
    loadRecognitionContinuity(context),
    isCovenantEnabledForThread(context)
  ]);
  const availableBasis = deriveAvailableBasis(authorizedContext);
  const covenantInstruction = covenantEnabled
    ? 'Covenant was explicitly enabled for this thread. Keep the grounded recognition complete on its own. A module may optionally suggest a separate Scripture exploration, but do not invent or quote a passage that was not retrieved by the approved Scripture service.'
    : 'Covenant is off. Do not apply Scripture or biblical metaphor automatically.';
  const prompt = `${sovereignRuntimePromptV1}

Authorization-checked server context, stripped of raw birth inputs, exact private location, secrets, source paths, and private identifiers:
${JSON.stringify(authorizedContext)}

Recent thread continuity. Assistant text and user corrections only; no hidden reasoning:
${JSON.stringify(continuity)}

Available exact Basis values. The basis arrays in your JSON must select verbatim from these lists only:
${JSON.stringify(availableBasis)}

Required JSON shape:
${recognitionJsonContract(availableBasis)}

Current user message:
${input}

${covenantInstruction}`;
  return { prompt, availableBasis };
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

async function loadRecognitionContinuity(context: SovereignContext): Promise<unknown> {
  const events = await context.env.DB.prepare(`SELECT te.event_type, te.payload_json, te.created_at
    FROM thread_events te JOIN threads t ON t.id = te.thread_id
    WHERE te.thread_id = ? AND t.account_id = ? AND te.event_type IN ('assistant_response','assistant_development_response')
    ORDER BY te.seq DESC LIMIT 3`).bind(context.threadId, context.accountId).all<Record<string, string>>();
  const corrections = await context.env.DB.prepare(`SELECT correction, note, created_at FROM user_corrections
    WHERE thread_id = ? AND account_id = ? ORDER BY created_at DESC LIMIT 3`).bind(context.threadId, context.accountId).all<Record<string, string | null>>();
  return {
    recentAssistantResponses: (events.results ?? []).map((row) => safeJson(row.payload_json)),
    userCorrections: corrections.results ?? []
  };
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

function safeJson(value: string): unknown {
  try { return JSON.parse(value); } catch { return {}; }
}
