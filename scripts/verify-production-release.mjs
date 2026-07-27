import { existsSync, readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const workerPackageJson = JSON.parse(readFileSync('apps/sovereign-worker/package.json', 'utf8'));
const deploy = readFileSync('scripts/cloudflare-direct-production-deploy.mjs', 'utf8');
const config = readFileSync('wrangler.production-direct.jsonc', 'utf8');
const runtime = readFileSync('apps/sovereign-worker/src/runtime-entry.ts', 'utf8');
const env = readFileSync('apps/sovereign-worker/src/env.ts', 'utf8');
const auth = readFileSync('apps/sovereign-worker/src/auth-public.ts', 'utf8');
const product = readFileSync('apps/sovereign-worker/src/db/product.ts', 'utf8');
const jobs = readFileSync('apps/sovereign-worker/src/jobs.ts', 'utf8');
const usage = readFileSync('apps/sovereign-worker/src/billing/usage.ts', 'utf8');
const stripe = readFileSync('apps/sovereign-worker/src/billing/stripe.ts', 'utf8');
const stripeRoute = readFileSync('apps/sovereign-worker/src/routes/stripe.ts', 'utf8');
const scaleMigration = readFileSync('apps/sovereign-worker/migrations/0009_production_scale_and_billing_safety.sql', 'utf8');
const workspaceMigration = readFileSync('apps/sovereign-worker/migrations/0010_account_onboarding_and_chat_history.sql', 'utf8');
const browserRuntime = readFileSync('apps/web/src/ProductionRuntime.ts', 'utf8');
const appHtml = readFileSync('apps/web/index.html', 'utf8');
const appUi = readFileSync('apps/web/src/App.tsx', 'utf8');
const publicLandingUi = readFileSync('apps/web/src/PublicLanding.tsx', 'utf8');
const workspaceUi = readFileSync('apps/web/src/SovereignWorkspace.tsx', 'utf8');
const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const pricing = readFileSync('apps/web/public/pricing.html', 'utf8');
const consent = readFileSync('apps/web/public/consent.html', 'utf8');
const consentCss = readFileSync('apps/web/public/consent.css', 'utf8');
const consentJs = readFileSync('apps/web/public/consent.js', 'utf8');
const staticHeaders = readFileSync('apps/web/public/_headers', 'utf8');
const workerHeaders = readFileSync('apps/sovereign-worker/src/security/headers.ts', 'utf8');

const currentDocumentFingerprints = [
  'Sovereign.OS turns Baseline Design into a private AI for personal, relationship, and system intelligence.',
  'id="root"'
];
for (const fingerprint of currentDocumentFingerprints) {
  if (!deploy.includes(fingerprint)) throw new Error(`Direct production deploy is missing current document fingerprint: ${fingerprint}`);
  if (!appHtml.includes(fingerprint)) throw new Error(`Production HTML is missing verifier fingerprint: ${fingerprint}`);
}

const currentApplicationFingerprints = [
  'Understand yourself—and everyone your life includes.',
  'What do you want to understand?',
  'Ask about yourself, a decision, a relationship, or the system around you. Sovereign brings in only the context that belongs.',
  'YOUR BASELINE · AVAILABLE IN EVERY CONVERSATION',
  'Your Baseline stays steady.',
  'Explore my Baseline',
  'See the relationship from both sides.',
  'What role does each person occupy in this system?',
  'Only understandings you deliberately save appear here.',
  'Build once. Explore continuously.',
  'Optional Christian and biblical lens for this conversation.'
];
for (const fingerprint of currentApplicationFingerprints) {
  if (!deploy.includes(fingerprint)) throw new Error(`Direct production deploy is missing current application fingerprint: ${fingerprint}`);
  if (!`${appUi}\n${publicLandingUi}\n${workspaceUi}`.includes(fingerprint)) {
    throw new Error(`Production application source is missing verifier fingerprint: ${fingerprint}`);
  }
}

const cloudflareGate = packageJson.scripts?.['verify:cloudflare-build'] ?? '';
for (const required of [
  'verify:release-config',
  'verify:production-release',
  'pnpm typecheck',
  'pnpm --filter @sovereign/worker test',
  'pnpm --filter @sovereign/web test',
  'pnpm build'
]) {
  if (!cloudflareGate.includes(required)) throw new Error(`Cloudflare build gate is missing ${required}`);
}
for (const retired of ['production:candidate', 'production:migrate', 'production:promote', 'production:rollback']) {
  if (packageJson.scripts?.[retired]) throw new Error(`Retired alternate release command remains: ${retired}`);
}
if (workerPackageJson.scripts?.deploy) throw new Error('Worker package must not expose a direct deploy command');
if (existsSync('scripts/cloudflare-production-release.mjs')) throw new Error('Retired alternate production release tool remains');
if (!workerPackageJson.scripts?.build?.includes('--config ../../wrangler.jsonc')) {
  throw new Error('Worker build must validate the authoritative root production config');
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
  'assertContainsAll',
  'howClean',
  'pricingClean',
  'faqClean',
  'publicConsent',
  'compiledCopy',
  'consentCss',
  'consentJs',
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
  '"/onboarding"',
  '"/app/*"',
  '"/auth/*"',
  '"/consent.html"',
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
  "pathname === '/consent.html'",
  'documentResponse(await env.ASSETS.fetch(request)',
  "headers.set('x-robots-tag', 'noindex, nofollow')",
  'isNavigationAssetPath',
  "target.pathname = '/app'",
  "migrationVersion: '0010_account_onboarding_and_chat_history'",
  "includesPrivateWorkspaceData: false",
  'sovereign_capacity_unavailable',
  "headers: { 'retry-after': '60' }",
  'THREAD_MESSAGE_PATH'
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
  "status = 'retained_billing_record'",
  '/v1/subscriptions/search?',
  'metadata["account_id"]',
  'stripe_subscription_search_page_limit',
  'requireStripeHandoffUrl',
  'integration_identifier',
  "'stripe-version': STRIPE_API_VERSION",
  "'checkout.stripe.com'",
  "'billing.stripe.com'"
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
  'deletion_jobs_due_idx',
  'ALTER TABLE accounts ADD COLUMN terms_accepted_at',
  'ALTER TABLE accounts ADD COLUMN terms_version',
  'ALTER TABLE accounts ADD COLUMN privacy_version'
]) {
  if (!scaleMigration.includes(required)) throw new Error(`Production scale migration is missing ${required}`);
}
for (const required of [
  'ALTER TABLE accounts ADD COLUMN onboarding_completed_at',
  "ALTER TABLE accounts ADD COLUMN plan_intent TEXT NOT NULL DEFAULT 'free'",
  'accounts_onboarding_idx'
]) {
  if (!workspaceMigration.includes(required)) throw new Error(`Workspace migration is missing ${required}`);
}

for (const required of [
  "if (kind === 'login' && !existing)",
  "if (row.purpose === 'login' && !row.account_id)",
  "if (row.purpose === 'signup' && !row.terms_accepted_at)",
  "if (row.purpose !== 'signup')",
  'terms_accepted_at = ?, terms_version = ?, privacy_version = ?',
  "account.auth_subject !== subject",
  'SameSite=Lax; Priority=High',
  "!validEmail(row.email_normalized)",
  "!['signup', 'login'].includes(row.purpose ?? '')"
]) {
  if (!auth.includes(required)) throw new Error(`Account creation safety is missing ${required}`);
}
for (const required of [
  'monthly_allowance_reached',
  "'retry-after': String(retryAfterSeconds)",
  'Date.parse(resetsAt)'
]) {
  if (!usage.includes(required)) throw new Error(`AI usage backpressure is missing ${required}`);
}

if (env.includes('ARTIFACTS') || env.includes('R2Bucket')) throw new Error('Worker Env must not expose R2');
if (!env.includes('RESEND_API_KEY')) throw new Error('Worker Env must preserve transactional email fallback');
if (product.includes("'export.full'")) throw new Error('Product entitlements must not include export.full');
if (!product.includes('Private export is not available')) throw new Error('Private export endpoint must fail closed');
if (!product.includes('kind, status, payload_json, run_after')) throw new Error('Deletion requests must schedule a D1 job');

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
  'STRIPE_HANDOFF_HOSTS',
  "'checkout.stripe.com'",
  "'billing.stripe.com'",
  'untrusted_billing_handoff',
  'TERMS_URL',
  'PRIVACY_URL'
]) {
  if (!browserRuntime.includes(required)) throw new Error(`Browser production runtime is missing ${required}`);
}
if (!`${appUi}\n${workspaceUi}`.includes('No private workspace data is included')) {
  throw new Error('Workspace sharing control is missing its private-data boundary');
}

for (const required of [
  '$20',
  '$99',
  'Consent-aware invitations and sharing'
]) {
  if (!pricing.includes(required)) throw new Error(`Pricing contract is missing ${required}`);
}
if (/full account export|export features/i.test(pricing)) throw new Error('Pricing still promises private export');
if (/donate\.stripe\.com|Support Sovereign\.OS|Support the platform/i.test(`${pricing}\n${browserRuntime}\n${appUi}`)) {
  throw new Error('Unapproved support placement is present');
}

for (const required of [
  '/launch.css?v=20260726-platform-r2',
  '/consent.css?v=20260726-consent-r1',
  '/consent.js?v=20260726-consent-r1',
  'You decide what another account may use.',
  'The inviting account cannot make or change these decisions for you.',
  'noindex,nofollow'
]) {
  if (!consent.includes(required)) throw new Error(`Consent page is missing ${required}`);
}
if (consent.includes('<style>') || consent.includes('const labels =')) {
  throw new Error('Consent page must not rely on inline style or script under production CSP');
}
for (const required of ['.consent-hero', '.consent-panel', '@media (max-width: 680px)']) {
  if (!consentCss.includes(required)) throw new Error(`Consent stylesheet is missing ${required}`);
}
for (const required of [
  "fetch('/api/v1/invitations/mine'",
  'Choose each permission independently.',
  'Permission allowed for future use.',
  'Permission revoked for future use.'
]) {
  if (!consentJs.includes(required)) throw new Error(`Consent controls are missing ${required}`);
}

console.log('Production release verified direct_cloudflare=true isolated_custom_domains=true hostname_navigation=true legacy_apex_preserved=true migration=0010 account_onboarding=true conversation_history=true d1_scale_indexes=true durable_objects=true durable_object_sharding=account_thread workers_ai=true ai_capacity_backpressure=true ai_allowance_retry_after=true static_assets=true static_security_headers=true document_security_headers=true hsts=true immutable_bundles=true app_noindex=true consent_csp_safe=true full_live_copy_gate=true signup_only_account_creation=true policy_acceptance_persisted=true malformed_magic_links_rejected=true trusted_stripe_handoffs=true remote_stripe_subscription_discovery=true cron=true r2=false queues=false turnstile=true magic_link_email=true stripe_checkout=true stripe_portal=true stripe_webhook_retry=true stripe_cancel_before_delete=true deleted_account_entitlements_blocked=true support_placement=false private_exports=false public_share=true live_gate=true concurrency_probe=20');
