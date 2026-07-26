import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const script = readFileSync('scripts/cloudflare-production-release.mjs', 'utf8');
const guide = readFileSync('docs/production-release.md', 'utf8');
const gates = readFileSync('docs/release-gates.md', 'utf8');
const ignore = readFileSync('.gitignore', 'utf8');

const commands = {
  'production:candidate': 'node scripts/cloudflare-production-release.mjs candidate',
  'production:migrate': 'node scripts/cloudflare-production-release.mjs migrate',
  'production:promote': 'node scripts/cloudflare-production-release.mjs promote',
  'production:rollback': 'node scripts/cloudflare-production-release.mjs rollback',
  'verify:production-release': 'node scripts/verify-production-release.mjs'
};
for (const [name, expected] of Object.entries(commands)) {
  if (packageJson.scripts?.[name] !== expected) throw new Error(`package.json is missing exact ${name} command`);
}
if (!packageJson.scripts?.['verify:cloudflare-build']?.includes('verify:production-release')) {
  throw new Error('Cloudflare verification must statically validate the production release path');
}

for (const required of [
  "new Set(['candidate', 'migrate', 'promote', 'rollback'])",
  'PRODUCTION_RELEASE_APPROVAL',
  'PRODUCTION_PREVIEW_APPROVED_SHA',
  'PRODUCTION_MIGRATIONS_APPLIED_SHA',
  'PRODUCTION_APPROVAL_EVIDENCE_URL',
  'PRODUCTION_MIGRATIONS_BACKWARD_COMPATIBLE',
  "if (mode === 'candidate' || mode === 'migrate') requireApproval(mode);",
  "'versions', 'upload'",
  "'versions', 'deploy'",
  "'rollback', rollbackVersion",
  "'--message', `Rollback Sovereign.OS to ${rollbackVersion}`",
  "['secret', 'list'",
  "'--format', 'json'",
  "['d1', 'migrations', 'apply'",
  "const noProvisionFlags = ['--experimental-provision=false', '--experimental-auto-create=false']",
  "'--yes'",
  'mkdirSync(tmpDir, { recursive: true })',
  'const wranglerArgs = configPath ? [...args, \'--config\', configPath] : args',
  'trafficPromoted: false',
  'this release tool never creates production storage',
  'Production release requires an exact clean commit',
  'PRODUCTION_BASE_URL must not use the isolated preview hostname'
]) {
  if (!script.includes(required)) throw new Error(`Production release script is missing ${required}`);
}
for (const forbidden of [
  "['deploy'",
  "d1', 'create'",
  "secret', 'bulk'",
  'STRIPE_SECRET_KEY: process.env',
  'SESSION_SIGNING_SECRET: process.env',
  "], resolve(workerDir, 'wrangler.jsonc'))"
]) {
  if (script.includes(forbidden)) throw new Error(`Production release script contains unsafe operation ${forbidden}`);
}

for (const required of [
  'Upload without traffic',
  'Apply migrations separately',
  'Promote the exact version',
  'Rollback',
  'production-candidate.json',
  'PRODUCTION_RELEASE_APPROVAL=candidate:<40-character-commit-sha>',
  'PRODUCTION_RELEASE_APPROVAL=migrate:<40-character-commit-sha>',
  'PRODUCTION_RELEASE_APPROVAL=promote:<40-character-commit-sha>:<version-id>',
  'PRODUCTION_RELEASE_APPROVAL=rollback:<version-id>',
  'Cloudflare Worker versions do not roll back D1 or R2 state',
  'Do not use a gradual traffic split for this static-asset application unless version affinity is configured',
  'automatic resource provisioning disabled',
  'requires a commit-bound approval value for every mutating action before remote preflight',
  'provides an explicit non-interactive rollback command'
]) {
  if (!guide.includes(required)) throw new Error(`Production release guide is missing ${required}`);
}
for (const required of [
  'production version is uploaded without receiving traffic',
  'exact uploaded version ID',
  'rollback version ID'
]) {
  if (!gates.includes(required)) throw new Error(`Release gates are missing ${required}`);
}
for (const required of [
  'production-candidate.json',
  'apps/sovereign-worker/.wrangler.production.generated.jsonc'
]) {
  if (!ignore.includes(required)) throw new Error(`.gitignore is missing ${required}`);
}

console.log('Production release path verified candidate_upload=true traffic_promotion_separate=true commit_bound_approval=true approval_before_preflight=true migration_gate=true existing_resources_only=true automatic_provisioning=false secret_values_not_uploaded=true rollback_recorded=true current_wrangler_cli=true non_interactive=true');
