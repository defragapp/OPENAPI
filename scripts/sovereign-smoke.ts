import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import { resolveAiModelConfig, toDirectOpenAIModel } from '../packages/agent-contracts/src/model-config';
import { sovereignRuntimePromptV1 } from '../apps/sovereign-worker/src/agent/prompt-v1';
import { runSovereignStream } from '../apps/sovereign-worker/src/agent/sovereign';
import { assertSovereignOutputSafety } from '../apps/sovereign-worker/src/agent/safety';
import type { Env } from '../apps/sovereign-worker/src/env';
import { callCloudflareGatewayResponses } from './cloudflare-gateway-smoke';

const aiConfig = resolveAiModelConfig(process.env);
const started = Date.now();

async function writeSummary(markdown: string): Promise<void> {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

function fakeDb(): D1Database {
  return { prepare() { return { bind() { return this; }, async first() { return null; }, async run() { return { success: true, meta: {}, results: [] }; }, async all() { return { success: true, meta: {}, results: [] }; }, async raw() { return []; } }; }, async batch() { return []; }, async exec() { return { count: 0, duration: 0 }; }, async dump() { return new ArrayBuffer(0); } } as unknown as D1Database;
}

function fakeThreads(): DurableObjectNamespace {
  return { idFromName() { return {} as DurableObjectId; }, idFromString() { return {} as DurableObjectId; }, newUniqueId() { return {} as DurableObjectId; }, get() { return {} as DurableObjectStub; }, jurisdiction() { return this; } } as unknown as DurableObjectNamespace;
}

function assertSovereignSafety(response: string): void {
  if (!response.trim()) throw new Error('Sovereign smoke produced an empty response');
  assertSovereignOutputSafety(response);
  const lowered = response.toLowerCase();
  for (const forbidden of ['birth date', 'birth time', 'latitude', 'longitude', 'covenant:', 'diagnosis']) {
    if (lowered.includes(forbidden)) throw new Error(`Sovereign smoke leaked or asserted forbidden content: ${forbidden}`);
  }
  if (lowered.includes('god is doing') || lowered.includes('they feel') || lowered.includes('they are trying')) throw new Error('Sovereign smoke contained forbidden certainty or hidden-state language');
}

async function runCloudflareSovereignSmoke(): Promise<{ response: string; chunks: number; requestId: string; logId: string; usage: Record<string, unknown> }> {
  const prompt = `${sovereignRuntimePromptV1}\n\nSanitized fixture context only. Baseline: fixture pressure response may make urgency louder. Current: fixture current conditions may make communication themes noticeable. Observed: no behavior has been supplied. Unknown: actual state remains unknown unless confirmed. Return a concise public answer with headings: Baseline, Current, Observed, Unknown. Covenant is unavailable.`;
  const result = await callCloudflareGatewayResponses(prompt);
  return { response: result.text, chunks: result.text.length > 0 ? 1 : 0, requestId: result.requestId, logId: result.logId, usage: result.usage };
}

async function runDirectOpenAISovereignSmoke(): Promise<{ response: string; chunks: number; requestId: string; logId: string; usage: Record<string, unknown> }> {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing; direct OpenAI smoke is development-only and production uses Cloudflare AI Gateway.');
  const env: Env = { APP_ENV: 'test', APP_VERSION: 'smoke', DB: fakeDb(), THREADS: fakeThreads(), AI_PROVIDER: 'openai-direct', AI_MODEL: toDirectOpenAIModel(aiConfig.model), OPENAI_API_KEY: process.env.OPENAI_API_KEY, STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'smoke-session-secret' };
  const stream = await runSovereignStream('Sanitized live smoke test. Use the available tools for my Baseline and current conditions. Return a concise public answer with these headings exactly: Baseline, Current, Observed, Unknown. Do not use Covenant.', { env, accountId: 'acct_smoke_sanitized', threadId: 'thread_smoke_sanitized', traceId: `trace_${crypto.randomUUID()}`, covenantEnabled: false });
  const reader = stream.getReader();
  let response = '';
  let chunks = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; chunks += 1; response += value; }
  return { response, chunks, requestId: 'openai-direct', logId: 'not-applicable', usage: {} };
}

async function main(): Promise<void> {
  const result = aiConfig.provider === 'cloudflare-gateway' ? await runCloudflareSovereignSmoke() : await runDirectOpenAISovereignSmoke();
  assertSovereignSafety(result.response);
  await mkdir('.tmp', { recursive: true });
  await writeFile('.tmp/sovereign-smoke-result.json', JSON.stringify({ status: 'completed', provider: aiConfig.provider, model: aiConfig.model, requestId: result.requestId, gatewayLogId: result.logId, latencyMs: Date.now() - started, chunks: result.chunks, responseCharacters: result.response.length, persistedPublicAnswer: true, covenantDisabled: true }, null, 2));
  console.log(`Sovereign smoke passed provider=${aiConfig.provider} model=${aiConfig.model} request_id=${result.requestId} gateway_log_id=${result.logId} latency_ms=${Date.now() - started} chunks=${result.chunks} response_chars=${result.response.length}`);
  await writeSummary(`### Sovereign smoke\n\n- status: passed\n- provider: ${aiConfig.provider}\n- model: ${aiConfig.model}\n- request_id: ${result.requestId}\n- gateway_log_id: ${result.logId}\n- latency_ms: ${Date.now() - started}\n- stream_chunks: ${result.chunks}\n- response_characters: ${result.response.length}\n- persisted_public_answer: true\n- covenant_disabled: true`);
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  const redacted = message.replace(/[a-z0-9_-]{24,}/g, '[redacted]').slice(0, 300);
  console.error(`Sovereign smoke failed: ${redacted}`);
  await writeSummary(`### Sovereign smoke\n\n- status: failed\n- provider: ${aiConfig.provider}\n- model: ${aiConfig.model}\n- sanitized_error: ${redacted}`);
  process.exit(1);
});
