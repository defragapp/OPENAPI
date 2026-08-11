import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve(process.argv[2] || 'scripts/verify-production-release-v2.mjs');
const temporaryPath = resolve(`scripts/.verify-production-release-v3-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');

const replacements = [
  [
    "\"import './public-landing-approved-v8.css';\",\n  \"import './landing-hero-field-v4.css';\",\n  \"import './passkey-auth.css';\"",
    "\"import './public-landing-approved-v8.css';\",\n  \"import './landing-hero-field-v4.css';\",\n  \"import './landing-ios-parity-density-v1.css';\",\n  \"import './public-secondary-pages-locked.css';\",\n  \"import './deployed-route-cohesion.css';\",\n  \"import './passkey-auth.css';\""
  ],
  [
    "\"import './landing-hero-field-v4.css'\",\n  \"import './passkey-auth.css'\"",
    "\"import './landing-hero-field-v4.css'\",\n  \"import './landing-ios-parity-density-v1.css'\",\n  \"import './public-secondary-pages-locked.css'\",\n  \"import './deployed-route-cohesion.css'\",\n  \"import './passkey-auth.css'\""
  ],
  [
    "['--v0-page:#0f0f0f', '--v0-cream:#e8ddd0', 'body{min-width:320px', '.launch-nav', '.launch-hero', '.journey-steps', '.pricing-grid', '.faq-list', '.launch-footer']",
    "['--v0-page: #090b0e', '--v0-cream: #f1e9de', '--v0-blue: #2f93ff', '--v0-blue-bright: #78c7ff', '--v0-shell: min(1120px', 'body.launch-page {', '.launch-nav-inner', '.launch-mobile-menu-panel', '.launch-hero', '.journey-steps', '.pricing-grid', '.product-proof-window', '.support-note-section', '.faq-list', '.launch-footer']"
  ],
  [
    "['data-visual-contract=\"founder-v0-static\"', '/v0-public-static.css?v=20260801-v0-global', 'Release compatibility marker only; the retired stylesheet is not loaded']",
    "['data-visual-contract=\"founder-v0-static\"', 'data-secondary-visual-contract=\"founder-v0-locked-v1\"', 'data-route-cohesion=\"v1\"', '/v0-public-static.css?v=20260803-refined-v2', '/deployed-route-cohesion.css?v=20260803-route-v1', 'class=\"launch-nav-inner\"', 'class=\"launch-mobile-menu-panel\"', 'Release compatibility marker only; the retired stylesheet is not loaded']"
  ],
  [
    "const passkeyMigration = read('apps/sovereign-worker/migrations/0014_passkey_authentication.sql');",
    "const passkeyMigration = read('apps/sovereign-worker/migrations/0014_passkey_authentication.sql');\nconst releaseMigration = read('apps/sovereign-worker/migrations/0015_release_evidence.sql');\nconst releaseEvidenceRuntime = read('apps/sovereign-worker/src/release-evidence.ts');\nconst releaseEvidenceLibrary = read('scripts/release-evidence-lib.mjs');\nconst releaseOrchestrator = read('scripts/release-orchestrator.mjs');"
  ],
  [
    "const deploy = read('scripts/cloudflare-production-deploy-v2.mjs');",
    "const deploy = read('scripts/cloudflare-production-deploy-v3.mjs');"
  ],
  [
    "  \"migrationVersion: '0013_workers_ai_free_capacity'\",\n  \"latestMigrationVersion: '0014_passkey_authentication'\"",
    "  \"const LATEST_MIGRATION_VERSION = '0015_release_evidence'\",\n  \"releaseEvidenceStore: releaseSchemaReady ? 'configured' : 'missing'\",\n  \"dependencies.releaseEvidenceStore === 'configured'\""
  ],
  [
    "requireAll('passkey credential verification', passkeyVerifier, [",
    "requireAll('release evidence migration', releaseMigration, ['CREATE TABLE release_evidence', 'CREATE TABLE release_progress', \"status TEXT NOT NULL CHECK(status = 'success')\", \"status TEXT NOT NULL CHECK(status = 'failure')\"]);\nrequireAll('D1 release evidence runtime', releaseEvidenceRuntime, ['env.DB.prepare', \"status = 'success'\", \"RELEASE_MIGRATION_VERSION = '0015_release_evidence'\"]);\nrequireAll('release evidence orchestration', `${releaseEvidenceLibrary}\\n${releaseOrchestrator}`, ['upsertReleaseEvidenceSql', 'upsertReleaseProgressSql', 'applyD1Migrations', 'writeReleaseEvidence', 'writeReleaseProgress']);\n\nrequireAll('passkey credential verification', passkeyVerifier, ["
  ]
];

function replaceOnce(retiredContract, currentContract) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Production release v3 compatibility update expected one retired contract occurrence but found ${occurrences}: ${retiredContract.slice(0, 96)}`);
  }
  source = source.replace(retiredContract, currentContract);
}

for (const [retiredContract, currentContract] of replacements) replaceOnce(retiredContract, currentContract);

const deployBlock = /requireAll\('production deploy compatibility', deploy, \[[\s\S]*?assert\(!deploy\.includes\("'Math\.random'"\), 'Production deploy still rejects a dependency bundle by a generic string'\);/;
const deployMatches = source.match(deployBlock);
if (!deployMatches || deployMatches.length !== 1) {
  throw new Error('Production release v3 could not replace the legacy deployment compatibility block.');
}
source = source.replace(deployBlock, `requireAll('single-deploy production release', \`${'${deploy}'}\\n${'${releaseOrchestrator}'}\`, [
  'export async function main',
  "runWrangler(['deploy', '--config', generatedConfigPath])",
  'applyD1Migrations',
  'postDeployChecks',
  'writeReleaseEvidence',
  'writeReleaseProgress',
  'persistFailure'
]);
assert(!deploy.includes('cloudflare-production-deploy-v2.mjs'), 'Production v3 must never execute the legacy v2 deployment script');`);

if (source.includes('/v0-public-static.css?v=20260801-v0-global')) {
  throw new Error('Production release v3 still contains the retired static public stylesheet contract.');
}
if (source.includes('/v0-public-static.css?v=20260803-locked-v1')) {
  throw new Error('Production release v3 still contains the pre-refinement secondary stylesheet contract.');
}
if (source.includes("'--v0-page:#0f0f0f'")) {
  throw new Error('Production release v3 still contains the retired standalone public page token.');
}
if (!source.includes("import './deployed-route-cohesion.css'")) {
  throw new Error('Production release v3 is missing the deployed route cohesion visual layer.');
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
