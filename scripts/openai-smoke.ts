import { appendFile } from 'node:fs/promises';
import { resolveAiModelConfig, toDirectOpenAIModel } from '../packages/agent-contracts/src/model-config';

const started = Date.now();
const aiConfig = resolveAiModelConfig({ AI_PROVIDER: 'openai-direct', AI_MODEL: process.env.AI_MODEL });
const model = toDirectOpenAIModel(aiConfig.model);

async function writeSummary(markdown: string): Promise<void> {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.log('OPENAI_API_KEY missing; skipping local direct OpenAI smoke test. Production uses Cloudflare AI Gateway.');
    return;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: 'Sanitized Sovereign.OS smoke test. Reply with exactly: sovereign smoke ok',
      max_output_tokens: 20
    })
  });

  const latencyMs = Date.now() - started;
  const requestId = response.headers.get('x-request-id') || 'unavailable';
  if (!response.ok) {
    const safeError = (await response.text()).replace(/[a-z0-9_-]{24,}/g, '[redacted]').slice(0, 500);
    console.error(`OpenAI smoke failed status=${response.status} request_id=${requestId} model=${model} latency_ms=${latencyMs}`);
    console.error(safeError);
    await writeSummary(`### OpenAI smoke\n\n- status: failed\n- http_status: ${response.status}\n- request_id: ${requestId}\n- model: ${model}\n- latency_ms: ${latencyMs}`);
    process.exit(1);
  }

  const data = await response.json();
  const text = JSON.stringify(data).toLowerCase();
  if (!text.includes('sovereign smoke ok')) {
    console.error(`OpenAI smoke response missing expected marker request_id=${requestId} model=${model} latency_ms=${latencyMs}`);
    await writeSummary(`### OpenAI smoke\n\n- status: failed_missing_marker\n- request_id: ${requestId}\n- model: ${model}\n- latency_ms: ${latencyMs}`);
    process.exit(1);
  }
  const usage = data.usage || {};
  console.log(`OpenAI smoke passed request_id=${requestId} model=${model} latency_ms=${latencyMs} input_tokens=${usage.input_tokens ?? 'unavailable'} output_tokens=${usage.output_tokens ?? 'unavailable'}`);
  await writeSummary(`### OpenAI smoke\n\n- status: passed\n- request_id: ${requestId}\n- model: ${model}\n- latency_ms: ${latencyMs}\n- input_tokens: ${usage.input_tokens ?? 'unavailable'}\n- output_tokens: ${usage.output_tokens ?? 'unavailable'}`);
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`OpenAI smoke failed: ${message.replace(/[a-z0-9_-]{24,}/g, '[redacted]')}`);
  await writeSummary(`### OpenAI smoke\n\n- status: failed\n- model: ${model}\n- sanitized_error: ${message.replace(/[a-z0-9_-]{24,}/g, '[redacted]').slice(0, 300)}`);
  process.exit(1);
});
