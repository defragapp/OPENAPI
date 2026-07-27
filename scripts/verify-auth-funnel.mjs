import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const rootConfig = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const directConfig = JSON.parse(readFileSync('wrangler.production-direct.jsonc', 'utf8'));
const migration = readFileSync('apps/sovereign-worker/migrations/0010_auth_password_oauth_onboarding.sql', 'utf8');
const password = readFileSync('apps/sovereign-worker/src/auth-password.ts', 'utf8');
const oauth = readFileSync('apps/sovereign-worker/src/auth-oauth.ts', 'utf8');
const runtime = readFileSync('apps/sovereign-worker/src/runtime-auth-entry.ts', 'utf8');
const maintenance = readFileSync('apps/sovereign-worker/src/auth-maintenance.ts', 'utf8');
const onboarding = readFileSync('apps/sovereign-worker/src/onboarding.ts', 'utf8');
const browserKey = readFileSync('apps/web/src/PasswordKey.ts', 'utf8');
const accountFlow = readFileSync('apps/web/src/AccountFlow.tsx', 'utf8');
const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const pricing = readFileSync('apps/web/public/pricing.html', 'utf8');
const docs = readFileSync('docs/auth-onboarding-production.md', 'utf8');
const envExample = readFileSync('.env.example', 'utf8');

function requireText(source, required, label) {
  for (const value of required) {
    if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
  }
}

for (const config of [rootConfig, directConfig]) {
  if (config.main !== 'apps/sovereign-worker/src/runtime-auth-entry.ts') throw new Error('Production config must use runtime-auth-entry.ts');
  for (const route of ['/login', '/signup', '/forgot-password', '/reset-password', '/onboarding', '/api/*']) {
    if (!config.assets?.run_worker_first?.includes(route)) throw new Error(`Production config is missing ${route}`);
  }
  if (config.vars?.STRIPE_CANCEL_URL !== 'https://app.defrag.app/onboarding?billing=cancelled') {
    throw new Error('Stripe cancellation must return to onboarding');
  }
}

requireText(migration, [
  'CREATE TABLE auth_password_credentials',
  'public_key_jwk TEXT NOT NULL',
  'encrypted_private_key TEXT NOT NULL',
  'encryption_iv TEXT NOT NULL',
  'kdf_salt TEXT NOT NULL',
  'kdf_iterations INTEGER NOT NULL',
  'CREATE TABLE auth_password_challenges',
  'CREATE TABLE auth_password_resets',
  'CREATE TABLE auth_external_identities',
  'CREATE TABLE auth_oauth_states',
  'CREATE TABLE account_onboarding',
  'auth_login_attempts_email_created_idx',
  'auth_password_challenges_ip_created_idx'
], 'Auth migration');
if (migration.includes('password_hash') || migration.includes('password_salt')) throw new Error('Worker must not store a direct password hash or password salt');

requireText(browserKey, [
  "const CREDENTIAL_VERSION = 'browser-key-v1'",
  'const KDF_ITERATIONS = 600_000',
  "name: 'PBKDF2'",
  "hash: 'SHA-256'",
  "name: 'AES-GCM'",
  "name: 'Ed25519'",
  'createPasswordEnvelope',
  'signPasswordChallenge',
  'passwordProofMessage',
  'privateKeyBytes.fill(0)'
], 'Browser password credential');

if (password.includes("name: 'PBKDF2'")) throw new Error('Worker request path must not perform the password KDF');
requireText(password, [
  "const CREDENTIAL_VERSION = 'browser-key-v1'",
  'passwordChallenge',
  'passwordLogin',
  "crypto.subtle.verify('Ed25519'",
  'passwordProofMessage',
  'auth_password_challenges',
  'verifyTurnstile',
  'recordLoginAttempt',
  'requestPasswordReset',
  'revokeAccountSessions',
  'env.DB.batch(['
], 'Worker password protocol');

requireText(oauth, [
  "const OAUTH_STATE_COOKIE = '__Host-sovereign_oauth_state'",
  'HttpOnly; Secure; SameSite=None',
  'await sha256(browserState) !== stateHash',
  'state.nonce_hash',
  "header.alg !== 'RS256'",
  'audiences.includes(audience)',
  'email_verified',
  'auth_external_identities'
], 'OAuth protocol');

requireText(runtime, [
  '/api/v1/auth/password/signup',
  '/api/v1/auth/password/challenge',
  '/api/v1/auth/password/login',
  '/api/v1/auth/password/forgot',
  '/api/v1/auth/password/reset',
  '/api/v1/auth/oauth/',
  '/api/v1/onboarding/status',
  '/api/v1/onboarding/plan',
  '/api/v1/onboarding/complete',
  "passwordProtocol: 'browser-key-v1'",
  "migrationVersion: '0010_auth_password_oauth_onboarding'"
], 'Production auth runtime');
requireText(maintenance, ['auth_password_challenges', 'auth_password_resets', 'auth_oauth_states', 'auth_login_attempts'], 'Auth cleanup');
requireText(onboarding, ["selected_plan = excluded.selected_plan", "stage = 'baseline'", 'checkoutRequired', 'Build your Baseline before finishing setup.'], 'Onboarding state');

requireText(accountFlow, [
  "from './PasswordKey'",
  'createPasswordEnvelope(password)',
  "postJson('/api/v1/auth/password/challenge'",
  'signPasswordChallenge(email, password, challenge)',
  'challengeId: challenge.challengeId',
  "postJson('/api/v1/onboarding/plan'",
  "postJson('/api/v1/billing/checkout'",
  'Build your starting map.',
  'Your password stays in this browser'
], 'Account flow');
requireText(main, ["'/forgot-password'", "'/reset-password'", "'/onboarding'", '<AccountFlow />'], 'Web entry');
requireText(pricing, [
  '/signup?plan=free',
  '/signup?plan=sovereign_plus&amp;interval=monthly',
  '/signup?plan=sovereign_plus&amp;interval=annual',
  '/pricing-funnel.css?v=20260726-auth-r1'
], 'Pricing intent');

requireText(envExample, [
  'GOOGLE_CLIENT_ID=',
  'GOOGLE_CLIENT_SECRET=',
  'GOOGLE_REDIRECT_URI=https://app.defrag.app/api/v1/auth/oauth/google/callback',
  'APPLE_CLIENT_ID=',
  'APPLE_TEAM_ID=',
  'APPLE_KEY_ID=',
  'APPLE_PRIVATE_KEY=',
  'APPLE_REDIRECT_URI=https://app.defrag.app/api/v1/auth/oauth/apple/callback',
  'RESEND_API_KEY='
], 'Environment example');
requireText(docs, ['browser-key-v1', '600,000 iterations', 'focused security review', 'Account creation', 'Sign-in', 'Password recovery'], 'Auth runbook');

const cloudflareGate = packageJson.scripts?.['verify:cloudflare-build'] ?? '';
if (!cloudflareGate.includes('verify:auth-funnel')) throw new Error('Cloudflare build gate must verify the auth funnel');
if (packageJson.scripts?.['verify:auth-funnel'] !== 'node scripts/verify-auth-funnel.mjs') throw new Error('Auth funnel verifier command drifted');

console.log('Auth funnel verified password_protocol=browser-key-v1 worker_kdf=false browser_pbkdf2=600000 ed25519=true oauth_state_bound=true password_recovery=true pricing_intent=true onboarding=true stripe_handoff=true');
