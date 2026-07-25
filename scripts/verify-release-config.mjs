import { existsSync, readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('apps/sovereign-worker/wrangler.jsonc', 'utf8'));
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const previewSmoke = readFileSync('scripts/preview-smoke.ts', 'utf8');
const previewBootstrap = readFileSync('scripts/cloudflare-preview-bootstrap.mjs', 'utf8');
const cloudflareGuide = readFileSync('docs/cloudflare-workers-builds.md', 'utf8');
const webMain = readFileSync('apps/web/src/main.tsx', 'utf8');
const completionLayer = readFileSync('apps/web/src/ProductCompletionLayer.tsx', 'utf8');
const peopleDb = readFileSync('apps/sovereign-worker/src/db/people.ts', 'utf8');
const relationalContext = readFileSync('apps/sovereign-worker/src/relational-context.ts', 'utf8');

function assertBinding(scope, name) {
  if (!scope?.queues?.producers?.some((item) => item.binding === 'JOBS')) {
    throw new Error(`${name} missing JOBS queue producer`);
  }
  if (!scope?.queues?.consumers?.length) throw new Error(`${name} missing queue consumer`);
  if (!scope?.triggers?.crons?.length) throw new Error(`${name} missing scheduled cleanup trigger`);
  if (!scope?.r2_buckets?.some((item) => item.binding === 'ARTIFACTS')) {
    throw new Error(`${name} missing ARTIFACTS R2 binding`);
  }
  if (!scope?.d1_databases?.some((item) => item.binding === 'DB')) {
    throw new Error(`${name} missing DB D1 binding`);
  }
  if (!scope?.durable_objects?.bindings?.some((item) => item.name === 'THREADS')) {
    throw new Error(`${name} missing THREADS Durable Object binding`);
  }
  if (scope?.ai?.binding !== 'AI') throw new Error(`${name} missing Workers AI binding`);
  if (scope?.assets?.binding !== 'ASSETS') throw new Error(`${name} missing ASSETS binding`);
}

assertBinding(config, 'default');
assertBinding(config.env?.preview, 'preview');

if (config.vars?.APP_ENV !== 'production') {
  throw new Error('default Worker environment must fail closed as production');
}
if (config.env?.preview?.vars?.APP_ENV !== 'preview') {
  throw new Error('preview environment must be explicitly preview');
}
if (config.env?.preview?.name !== 'sovereign-openapi-preview') {
  throw new Error('preview Worker name must remain sovereign-openapi-preview');
}
if (config.env?.preview?.workers_dev !== true || config.env?.preview?.preview_urls !== false) {
  throw new Error('preview must use one dedicated workers.dev route with versioned preview URLs disabled');
}

for (const scope of [config.vars, config.env?.preview?.vars]) {
  if (scope?.AI_PROVIDER !== 'cloudflare-gateway') {
    throw new Error('AI provider must be Cloudflare Gateway');
  }
  if (scope?.AI_MODEL !== 'openai/gpt-5.5') {
    throw new Error('AI model must be the approved ZDR-cataloged model');
  }
  if (
    scope?.AI_FREE_MONTHLY_TURNS !== '10' ||
    scope?.AI_SOVEREIGN_PLUS_MONTHLY_TURNS !== '300'
  ) {
    throw new Error('AI allowances do not match the review contract');
  }
}

for (const key of ['STRIPE_SUCCESS_URL', 'STRIPE_CANCEL_URL', 'STRIPE_PORTAL_RETURN_URL']) {
  const value = String(config.env?.preview?.vars?.[key] ?? '');
  if (!value.startsWith('https://sovereign-openapi-preview.sovereign-os-api.workers.dev/app')) {
    throw new Error(`${key} must use the canonical account-scoped preview URL`);
  }
}

const cloudflareBuildCommand = packageJson.scripts?.['verify:cloudflare-build'];
if (!cloudflareBuildCommand) throw new Error('package.json is missing verify:cloudflare-build');
for (const gate of [
  'verify:foundation',
  'verify:migrations',
  'scan:secrets',
  'scan:production-fixtures',
  'verify:release-config',
  'typecheck',
  'test',
  'build',
  'smoke:auth',
  'smoke:baseline',
  'smoke:jobs',
  'smoke:worker-gateway',
  'smoke:stripe',
  'smoke:product',
  'smoke:release-closure'
]) {
  if (!cloudflareBuildCommand.includes(gate)) {
    throw new Error(`Cloudflare build verification is missing release gate ${gate}`);
  }
}

for (const required of [
  'WORKERS_CI_COMMIT_SHA',
  'WORKERS_CI_BUILD_UUID',
  'PREVIEW_BASE_URL',
  'PREVIEW_SESSION_SIGNING_SECRET',
  'TURNSTILE_SECRET_KEY',
  'EMAIL_API_TOKEN',
  'PUBLIC_APP_URL',
  'TURNSTILE_EXPECTED_HOSTNAME',
  "['secret', 'bulk'",
  "['deploy', '--env', 'preview'"
]) {
  if (!previewBootstrap.includes(required)) {
    throw new Error(`Cloudflare preview bootstrap is missing ${required}`);
  }
}
if (previewBootstrap.indexOf("['deploy', '--env', 'preview'") > previewBootstrap.indexOf("['secret', 'bulk'")) {
  throw new Error('preview bootstrap must create the Worker before attaching runtime secrets');
}

for (const required of [
  'PREVIEW_BASE_URL',
  'PREVIEW_SESSION_SIGNING_SECRET',
  'VITE_TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
  'EMAIL_API_URL',
  'EMAIL_API_TOKEN',
  'EMAIL_FROM',
  'D1 Edit',
  'Queues Edit',
  'Workers R2 Storage Edit',
  'Workers Scripts Edit'
]) {
  if (!cloudflareGuide.includes(required)) {
    throw new Error(`Cloudflare build guide is missing ${required}`);
  }
}

for (const required of [
  'installProductRuntime()',
  '<ProductCompletionLayer />'
]) {
  if (!webMain.includes(required)) throw new Error(`web entrypoint is missing ${required}`);
}
for (const required of [
  'VITE_TURNSTILE_SITE_KEY',
  'sovereign:relational-result',
  '/api/v1/invitations/mine',
  'Cancel invitation',
  'Remove from workspace',
  'Do not allow'
]) {
  if (!completionLayer.includes(required)) throw new Error(`product completion layer is missing ${required}`);
}
if (!peopleDb.includes('activeScopes') || !peopleDb.includes('export async function removePerson')) {
  throw new Error('people records must expose active scopes and safe removal');
}
if (!relationalContext.includes('at least two consented invited members')) {
  throw new Error('system review must require the owner plus two consented invited members');
}

if (!previewSmoke.includes('verifyFreeGates') || !previewSmoke.includes('verifyPaidCapabilities')) {
  throw new Error('preview smoke does not separate Free and paid behavior');
}
if (!previewSmoke.includes('expected 403') && !previewSmoke.includes(', 403')) {
  throw new Error('preview smoke does not verify paid feature denial on Free');
}
if (/consent\/.+granted:\s*true/s.test(previewSmoke)) {
  throw new Error('preview smoke attempts to grant another person consent from the workspace owner');
}

// GitHub workflows remain optional secondary verification. When present, ensure they do not drift.
for (const path of ['.github/workflows/preview-deploy.yml', '.github/workflows/live-verify.yml']) {
  if (!existsSync(path)) continue;
  const workflow = readFileSync(path, 'utf8');
  if (workflow.includes('openai/gpt-5.6-terra')) {
    throw new Error(`${path} still uses the unapproved model fallback`);
  }
  if (!workflow.includes('openai/gpt-5.5')) {
    throw new Error(`${path} is missing the approved ZDR-cataloged model`);
  }
}

console.log(
  'Release config verified cloudflare_build=true d1=true durable_objects=true queues=true schedules=true r2=true ai=true assets=true canonical_preview_url=true runtime_secret_order=true auth_config=true relational_results=true revocation_ui=true three_person_system=true tier_smoke=true'
);
