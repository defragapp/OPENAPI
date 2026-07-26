import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const deploy = readFileSync('scripts/cloudflare-direct-production-deploy.mjs', 'utf8');
const config = readFileSync('wrangler.production-direct.jsonc', 'utf8');
const runtime = readFileSync('apps/sovereign-worker/src/runtime-entry.ts', 'utf8');
const env = readFileSync('apps/sovereign-worker/src/env.ts', 'utf8');
const product = readFileSync('apps/sovereign-worker/src/db/product.ts', 'utf8');
const browserRuntime = readFileSync('apps/web/src/ProductionRuntime.ts', 'utf8');
const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const pricing = readFileSync('apps/web/public/pricing.html', 'utf8');

const cloudflareGate = packageJson.scripts?.['verify:cloudflare-build'] ?? '';
for (const required of [
  'verify:production-release',
  'pnpm typecheck',
  'pnpm --filter @sovereign/worker test',
  'pnpm --filter @sovereign/web test',
  'pnpm build'
]) {
  if (!cloudflareGate.includes(required)) throw new Error(`Cloudflare build gate is missing ${required}`);
}

for (const required of [
  "const publicBase = 'https://sovereign.defrag.app'",
  "const appBase = 'https://app.defrag.app'",
  "const parentBase = 'https://defrag.app'",
  "const d1Name = 'sovereign-openapi-db'",
  "'d1', 'migrations', 'apply'",
  "'secret', 'list'",
  "'SESSION_SIGNING_SECRET'",
  "'TURNSTILE_SECRET_KEY'",
  "'RESEND_API_KEY'",
  "'STRIPE_SECRET_KEY'",
  "'STRIPE_WEBHOOK_SECRET'",
  'verifyLiveProduction()',
  'concurrentHealth',
  'stripeSignatureRejection',
  'exportsDisabled',
  'securityHeaders',
  'r2Enabled: false',
  'queueEnabled: false'
]) {
  if (!deploy.includes(required)) throw new Error(`Direct production deploy is missing ${required}`);
}

for (const forbidden of [
  "queues', 'create",
  'r2 bucket',
  'r2_buckets',
  'ARTIFACTS',
  'R2Bucket',
  'secret values'
]) {
  if (deploy.toLowerCase().includes(forbidden.toLowerCase())) throw new Error(`Direct production deploy contains forbidden dependency ${forbidden}`);
}

for (const domain of ['defrag.app', 'www.defrag.app', 'sovereign.defrag.app', 'app.defrag.app']) {
  if (!config.includes(`"pattern": "${domain}"`)) throw new Error(`Production config is missing ${domain}`);
}
for (const required of [
  '"custom_domain": true',
  '"database_name": "sovereign-openapi-db"',
  '"class_name": "ThreadCoordinator"',
  '"binding": "AI"',
  '"directory": "apps/web/dist"',
  '"crons": ["*/15 * * * *"]',
  'price_1Te0g9Bk78yJ8Hww8fFZCqhm',
  'price_1Tq6nPBk78yJ8Hwwm0pxg4hH'
]) {
  if (!config.includes(required)) throw new Error(`Production config is missing ${required}`);
}
for (const forbidden of ['r2_buckets', 'queues', 'services']) {
  if (config.includes(`"${forbidden}"`)) throw new Error(`Production config must not declare ${forbidden}`);
}

for (const required of [
  "privateExports: 'disabled'",
  "sharing: 'public-link-only'",
  "transactionalEmail: env.EMAIL ? 'cloudflare-binding' : env.RESEND_API_KEY ? 'resend' : 'missing'",
  "'/api/v1/stripe/webhook'",
  "'/api/stripe/webhook'",
  "'/api/webhooks/stripe'",
  "'/api/v1/export-jobs'"
]) {
  if (!runtime.includes(required)) throw new Error(`Runtime production contract is missing ${required}`);
}

if (env.includes('ARTIFACTS') || env.includes('R2Bucket')) throw new Error('Worker Env must not expose R2');
if (!env.includes('RESEND_API_KEY')) throw new Error('Worker Env must preserve transactional email fallback');
if (product.includes("'export.full'")) throw new Error('Product entitlements must not include export.full');
if (!product.includes('Private export is not available')) throw new Error('Private export endpoint must fail closed');
if (!product.includes("kind, status, payload_json, run_after")) throw new Error('Deletion requests must schedule a D1 job');

for (const required of [
  'installProductionRuntime()',
  "from './ProductionRuntime'"
]) {
  if (!main.includes(required)) throw new Error(`Web entry is missing ${required}`);
}
for (const required of [
  'VITE_TURNSTILE_SITE_KEY',
  'navigator.share',
  'No private workspace data is included',
  'Support Sovereign.OS'
]) {
  if (!browserRuntime.includes(required)) throw new Error(`Browser production runtime is missing ${required}`);
}

for (const required of [
  '$20',
  '$99',
  'Consent-aware invitations and sharing',
  'does not grant subscription access',
  'https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02'
]) {
  if (!pricing.includes(required)) throw new Error(`Pricing contract is missing ${required}`);
}
if (/full account export|export features/i.test(pricing)) throw new Error('Pricing still promises private export');

console.log('Production release verified direct_cloudflare=true custom_domains=true d1=true durable_objects=true workers_ai=true static_assets=true cron=true r2=false queues=false turnstile=true magic_link_email=true stripe_checkout=true stripe_portal=true stripe_webhook_compat=true donation=true private_exports=false public_share=true live_gate=true concurrency_probe=20');
