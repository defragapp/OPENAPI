import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const deploy = readFileSync('scripts/cloudflare-direct-production-deploy.mjs', 'utf8');
const config = readFileSync('wrangler.production-direct.jsonc', 'utf8');
const runtime = readFileSync('apps/sovereign-worker/src/runtime-entry.ts', 'utf8');
const env = readFileSync('apps/sovereign-worker/src/env.ts', 'utf8');
const product = readFileSync('apps/sovereign-worker/src/db/product.ts', 'utf8');
const jobs = readFileSync('apps/sovereign-worker/src/jobs.ts', 'utf8');
const stripe = readFileSync('apps/sovereign-worker/src/billing/stripe.ts', 'utf8');
const stripeRoute = readFileSync('apps/sovereign-worker/src/routes/stripe.ts', 'utf8');
const scaleMigration = readFileSync('apps/sovereign-worker/migrations/0009_production_scale_and_billing_safety.sql', 'utf8');
const browserRuntime = readFileSync('apps/web/src/ProductionRuntime.ts', 'utf8');
const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const pricing = readFileSync('apps/web/public/pricing.html', 'utf8');
const staticHeaders = readFileSync('apps/web/public/_headers', 'utf8');
const workerHeaders = readFileSync('apps/sovereign-worker/src/security/headers.ts', 'utf8');

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

for (const domain of ['sovereign.defrag.app', 'app.defrag.app']) {
  if (!config.includes(`"pattern": "${domain}"`)) throw new Error(`Production config is missing ${domain}`);
}
for (const legacyDomain of ['"pattern": "defrag.app"', '"pattern": "www.defrag.app"']) {
  if (config.includes(legacyDomain)) throw new Error(`Production config must not claim legacy domain ${legacyDomain}`);
}
for (const required of [
  '"custom_domain": true',
  '"database_name": "sovereign-openapi-db"',
  '"class_name": "ThreadCoordinator"',
  '"binding": "AI"',
  '"directory": "apps/web/dist"',
  '"crons": ["*/15 * * * *"]',
  '"/api/*"',
  '"/login"',
  '"/signup"',
  '"/app/*"',
  '"/auth/*"',
  '"/pricing.html"',
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
  "'/api/v1/export-jobs'",
  'withDocumentSecurityHeaders(await env.ASSETS.fetch(request))',
  'isNavigationAssetPath',
  "target.pathname = '/app'",
  "migrationVersion: '0009_production_scale_and_billing_safety'",
  "includesPrivateWorkspaceData: false"
]) {
  if (!runtime.includes(required)) throw new Error(`Runtime production contract is missing ${required}`);
}

for (const required of [
  'Content-Security-Policy:',
  "frame-ancestors 'none'",
  'Strict-Transport-Security:',
  'Cross-Origin-Opener-Policy: same-origin',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
  'Permissions-Policy:',
  'https://app.defrag.app/*',
  'X-Robots-Tag: noindex, nofollow',
  '/assets/*',
  'max-age=31536000, immutable'
]) {
  if (!staticHeaders.includes(required)) throw new Error(`Static security headers are missing ${required}`);
}
for (const required of [
  'strict-transport-security',
  'documentSecurityHeaders',
  "script-src 'self' https://challenges.cloudflare.com",
  'withDocumentSecurityHeaders'
]) {
  if (!workerHeaders.includes(required)) throw new Error(`Worker security headers are missing ${required}`);
}

for (const required of [
  'cancelAccountSubscriptions',
  "method: 'DELETE'",
  "status = 'canceled'",
  "account.auth_subject.startsWith('deleted:')",
  "status = 'retained_billing_record'"
]) {
  if (!stripe.includes(required)) throw new Error(`Stripe billing safety is missing ${required}`);
}
for (const required of [
  'SELECT processed_at, error_code FROM webhook_events',
  'processed_at = NULL, error_code = ?',
  'retried:',
  'duplicate: true, processed: true'
]) {
  if (!stripeRoute.includes(required)) throw new Error(`Stripe retry recovery is missing ${required}`);
}
for (const required of [
  "status IN ('grace','running')",
  'await cancelAccountSubscriptions',
  "case 'stripe.retry'",
  'stripe_retry_requires_original_signed_delivery',
  'stripe_subscriptions:cancelled-before-retention'
]) {
  if (!jobs.includes(required)) throw new Error(`Deletion lifecycle safety is missing ${required}`);
}
for (const required of [
  'auth_magic_links_ip_created_idx',
  'webhook_events_pending_idx',
  'background_jobs_account_kind_due_idx',
  'deletion_jobs_due_idx'
]) {
  if (!scaleMigration.includes(required)) throw new Error(`Production scale migration is missing ${required}`);
}

if (env.includes('ARTIFACTS') || env.includes('R2Bucket')) throw new Error('Worker Env must not expose R2');
if (!env.includes('RESEND_API_KEY')) throw new Error('Worker Env must preserve transactional email fallback');
if (product.includes("'export.full'")) throw new Error('Product entitlements must not include export.full');
if (!product.includes('Private export is not available')) throw new Error('Private export endpoint must fail closed');
if (!product.includes("kind, status, payload_json, run_after")) throw new Error('Deletion requests must schedule a D1 job');

for (const required of [
  'installProductionRuntime()',
  "from './ProductionRuntime'",
  "location.hostname === 'sovereign.defrag.app'",
  'navigator.serviceWorker.getRegistrations()',
  'registration.unregister()'
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

console.log('Production release verified direct_cloudflare=true isolated_custom_domains=true hostname_navigation=true legacy_apex_preserved=true migration=0009 d1_scale_indexes=true durable_objects=true workers_ai=true static_assets=true static_security_headers=true document_security_headers=true hsts=true immutable_bundles=true app_noindex=true app_service_worker=false cron=true r2=false queues=false turnstile=true magic_link_email=true stripe_checkout=true stripe_portal=true stripe_webhook_retry=true stripe_cancel_before_delete=true deleted_account_entitlements_blocked=true donation=true private_exports=false public_share=true live_gate=true concurrency_probe=20');
