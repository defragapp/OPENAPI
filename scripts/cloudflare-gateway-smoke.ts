import { appendFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolveAiModelConfig } from '../packages/agent-contracts/src/model-config';

const started = Date.now();
const config = resolveAiModelConfig(process.env);
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const gatewayId = process.env.AI_GATEWAY_ID || 'sovereign';

async function writeSummary(markdown: string): Promise<void> {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

function requireRuntime(): void {
  if (config.provider !== 'cloudflare-gateway') throw new Error('AI_PROVIDER must be cloudflare-gateway for production live verification');
  if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is not configured');
  if (!apiToken) throw new Error('CLOUDFLARE_API_TOKEN is not configured');
  if (!gatewayId) throw new Error('AI_GATEWAY_ID is not configured');
}

function redact(value: string): string {
  return value.replace(/[a-z0-9_-]{24,}/g, '[redacted]').slice(0, 500);
}

export async function callCloudflareGatewayResponses(input: string): Promise<{ text: string; requestId: string; latencyMs: number; usage: Record<string, unknown>; logId: string }> {
  requireRuntime();
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/responses`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiToken}`,
      'content-type': 'application/json',
      'cf-aig-gateway-id': gatewayId
    },
    body: JSON.stringify({ model: config.model, input, max_output_tokens: 120 })
  });
  const latencyMs = Date.now() - started;
  const requestId = response.headers.get('x-request-id') || response.headers.get('cf-ray') || 'unavailable';
  const logId = response.headers.get('cf-aig-log-id') || 'unavailable';
  const bodyText = await response.text();
  if (!response.ok) throw new Error(`Cloudflare Gateway smoke failed status=${response.status} request_id=${requestId} model=${config.model} latency_ms=${latencyMs} error=${redact(bodyText)}`);
  const data = JSON.parse(bodyText) as { output_text?: string; output?: unknown; usage?: Record<string, unknown> };
  const text = data.output_text ?? JSON.stringify(data.output ?? '');
  return { text, requestId, latencyMs, usage: data.usage ?? {}, logId };
}

async function main(): Promise<void> {
  const result = await callCloudflareGatewayResponses('Sanitized Sovereign.OS Cloudflare AI Gateway smoke test. Reply with exactly: sovereign gateway ok');
  if (!result.text.toLowerCase().includes('sovereign gateway ok')) throw new Error('Cloudflare Gateway response did not include expected marker.');
  console.log(`Cloudflare Gateway smoke passed request_id=${result.requestId} log_id=${result.logId} model=${config.model} latency_ms=${result.latencyMs} input_tokens=${result.usage.input_tokens ?? 'unavailable'} output_tokens=${result.usage.output_tokens ?? 'unavailable'}`);
  await writeSummary(`### Cloudflare Gateway smoke\n\n- status: passed\n- request_id: ${result.requestId}\n- gateway_log_id: ${result.logId}\n- model: ${config.model}\n- latency_ms: ${result.latencyMs}\n- input_tokens: ${result.usage.input_tokens ?? 'unavailable'}\n- output_tokens: ${result.usage.output_tokens ?? 'unavailable'}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(async (error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Cloudflare Gateway smoke failed: ${redact(message)}`);
    await writeSummary(`### Cloudflare Gateway smoke\n\n- status: failed\n- model: ${config.model}\n- sanitized_error: ${redact(message)}`);
    process.exit(1);
  });
}
