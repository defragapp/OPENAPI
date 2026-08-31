import { sovereignRuntimePromptV2 } from '../apps/sovereign-worker/src/agent/prompt-v1';
import { groundedIntelligencePrompt } from '../apps/sovereign-worker/src/agent/grounded-intelligence';
import { sovereignAnswerJsonContract } from '../apps/sovereign-worker/src/agent/recognition';
import { writeFileSync } from 'node:fs';

async function main() {
  const input = 'What does my Baseline say about why I keep pulling back in conflict?';
  const prompt = `${sovereignRuntimePromptV2}\n\nAuthorization-checked server context, stripped of raw birth inputs, exact private location, secrets, source paths, and private identifiers:\n{}\n\nRecent thread continuity. Assistant text and user corrections only; no hidden reasoning:\n[]\n\nAuthorized exact Basis registry. Select IDs only in basis_refs:\n[]\n\n${groundedIntelligencePrompt(input)}\n\nRequired JSON shape:\n${sovereignAnswerJsonContract()}\n\nCurrent user message:\n${input}\n`;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN!;
  const model = '@cf/zai-org/glm-4.7-flash';
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${apiToken}`, 'content-type': 'application/json', 'cf-aig-gateway-id': 'sovereign-ai-gateway' },
    body: JSON.stringify({ prompt, max_completion_tokens: 3200, stream: false })
  });
  console.log('status', res.status);
  const body = await res.text();
  if (!res.ok) { console.log(body.slice(0, 600)); process.exit(1); }
  const data = JSON.parse(body);
  const out = data.result?.response || data.result?.output_text || JSON.stringify(data.result);
  console.log('---RAW OUTPUT---');
  console.log(out.slice(0, 2500));
  writeFileSync('/tmp/ai-probe-out.txt', out);
}
main().catch((e) => { console.error(e); process.exit(1); });
