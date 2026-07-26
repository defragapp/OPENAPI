import { readFileSync } from 'node:fs';

const prompt = readFileSync('docs/cloudflare-dashboard-preview-prompt.md', 'utf8');

for (const required of [
  'defragapp/OPENAPI',
  'sovereign-openapi-preview',
  'https://sovereign-openapi-preview.sovereign-os-api.workers.dev',
  'corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build',
  'pnpm preview:bootstrap',
  'Non-production branch builds: disabled',
  'AI_PROVIDER=cloudflare-gateway',
  'AI_MODEL=openai/gpt-5.5',
  'AI_GATEWAY_ID=sovereign',
  'Do not request, store, or use a personal OpenAI API key.',
  'Enable Zero Data Retention',
  'Keep request and response logging disabled',
  'Keep cache bypass enabled',
  'Cloudflare Unified Billing',
  'Protect the entire preview hostname with Cloudflare Access.',
  'Stripe test mode only for preview',
  'Do not deploy production traffic.',
  'exact Git commit SHA',
  'Cloudflare build UUID',
  'deployed Worker version ID'
]) {
  if (!prompt.includes(required)) throw new Error(`Cloudflare dashboard prompt is missing: ${required}`);
}

for (const forbidden of [
  /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/,
  /hf_[A-Za-z0-9]{20,}/,
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/,
  /STRIPE_SECRET_KEY\s*=\s*(?:sk_|rk_)/,
  /PREVIEW_SESSION_SIGNING_SECRET\s*=\s*[^<\s][^\n]*/
]) {
  if (forbidden.test(prompt)) throw new Error(`Cloudflare dashboard prompt appears to contain a secret value: ${forbidden}`);
}

console.log('Cloudflare dashboard prompt verified exact_repo=true isolated_preview=true frozen_build=true ai_gateway=true unified_billing=true personal_openai_key=false zdr=true logging=false cache_bypass=true access=true stripe_test_only=true evidence_required=true production_traffic=false');
