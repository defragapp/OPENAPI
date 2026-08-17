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
    "['data-visual-contract=\"founder-v0-static\"', 'data-secondary-visual-contract=\"founder-v0-locked-v1\"', 'data-route-cohesion=\"v1\"', '/v0-public-static.css?v=20260803-refined-v2', '/deployed-route-cohesion.css?v=20260803-route-v1', '/experience-static-refinement-v1.css?v=20260816-refinement-v1', 'class=\"launch-nav-inner\"', 'class=\"launch-mobile-menu-panel\"', 'Release compatibility marker only; the retired stylesheet is not loaded']"
  ],
  [
    "const passkeyMigration = read('apps/sovereign-worker/migrations/0014_passkey_authentication.sql');",
    "const passkeyMigration = read('apps/sovereign-worker/migrations/0014_passkey_authentication.sql');\nconst releaseMigration = read('apps/sovereign-worker/migrations/0015_release_evidence.sql');\nconst releaseEvidenceRuntime = read('apps/sovereign-worker/src/release-evidence.ts');\nconst releaseEvidenceLibrary = read('scripts/release-evidence-lib.mjs');\nconst releaseOrchestrator = read('scripts/release-orchestrator.mjs');"
  ],
  [
    "const heroCss = read('apps/web/src/landing-hero-field-v4.css');\nconst storyCss = read('apps/web/src/v0-restored-product-stories.css');",
    "const heroCss = read('apps/web/src/landing-hero-field-v4.css');\nconst refinementCss = read('apps/web/src/experience-refinement-v1.css');\nconst renderedFidelityCss = read('apps/web/src/rendered-fidelity-v1.css');\nconst landingRefinementCss = read('apps/web/src/landing-refinement-v2.css');\nconst invitationFidelityCss = read('apps/web/src/invitation-rendered-fidelity-v1.css');\nconst storyCss = read('apps/web/src/v0-restored-product-stories.css');"
  ],
  [
    "const staticV0 = read('apps/web/public/v0-public-static.css');\nconst how = read('apps/web/public/how-it-works.html');",
    "const staticV0 = read('apps/web/public/v0-public-static.css');\nconst staticRefinement = read('apps/web/public/experience-static-refinement-v1.css');\nconst how = read('apps/web/public/how-it-works.html');"
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
  ],
  [
    "  'Bring the question you actually have.',",
    "  'Start with what’s actually happening.',"
  ],
  [
    "  'Seeing the capacity beneath it',\n  'Keeping both people distinct',\n  'Mapping the people',",
    "  'What your Baseline supports',\n  'Keeping both people distinct',\n  'What Sovereign separates',"
  ],
  [
    "  'stroke: #2f93ff',\n  'width: 100vw',",
    "  'width: 100vw',"
  ],
  [
    "assert(!field.includes('<div className=\"landing-expression-slice__tooltip\"'), 'The retired floating tooltip returned.');",
    "assert(!field.includes('<div className=\"landing-expression-slice__tooltip\"'), 'The retired floating tooltip returned.');\nrequireAll('final experience refinement', refinementCss, ['--landing-blue: #e8ddd0 !important', '--route-blue: #e8ddd0 !important', '-webkit-text-stroke: 1.15px rgba(241, 233, 222, 0.82)', '.sovereign-app-runtime .sovereign-composer']);\nrequireAll('rendered fidelity authority', renderedFidelityCss, ['--v8-blue: #d8d0c5 !important', \"radialGradient[id$='-sphere-fill']\", 'filter: saturate(0.08) contrast(1.05) brightness(0.96) !important', '.public-approved-v8 .landing-demo {', 'padding: 54px 0 !important']);\nrequireAll('landing refinement v2', landingRefinementCss, ['.landing-expression-slice__tooltip-panel', 'width: 132px !important', '.landing-workflow__progress', 'grid-template-columns: minmax(0, 1.34fr) minmax(320px, 0.66fr) !important', '@keyframes sovereign-system-route', 'scroll-snap-type: inline mandatory !important']);\nrequireAll('invitation rendered fidelity', invitationFidelityCss, ['@media (min-width: 901px)', 'overflow-wrap: normal']);\nrequireAll('final static refinement', staticRefinement, ['--v0-blue: #e8ddd0', '--v0-blue-bright: #fffaf3', '@media (prefers-reduced-motion: reduce)']);"
  ],
  [
    "requireAll('How it works document', how, ['Ask about your life. Get an answer built around you.', 'journey-steps', 'baseline-explainer']);",
    "requireAll('How it works document', how, ['See the pattern clearly enough to understand what could change.', 'journey-steps', 'baseline-explainer', '/experience-static-refinement-v1.css?v=20260816-refinement-v1']);"
  ],
  [
    "requireAll('pricing document', pricing, ['$0', '$20', '$99 / year', 'Stripe handles payment details', 'Start free. Expand when the question includes more than you.']);",
    "requireAll('pricing document', pricing, ['$0', '$20', '$99 / year', 'Stripe handles payment details', 'Start free. Add more context when it belongs.', '/experience-static-refinement-v1.css?v=20260816-refinement-v1']);"
  ],
  [
    "  ['passkey auth', passkeyCss],\n  ['v0 static public', staticV0]",
    "  ['experience refinement', refinementCss],\n  ['rendered fidelity', renderedFidelityCss],\n  ['landing refinement v2', landingRefinementCss],\n  ['invitation rendered fidelity', invitationFidelityCss],\n  ['passkey auth', passkeyCss],\n  ['v0 static public', staticV0],\n  ['static experience refinement', staticRefinement]"
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

if (source.includes('/v0-public-static.css?v=20260801-v0-global')) throw new Error('Production release v3 still contains the retired static public stylesheet contract.');
if (source.includes('/v0-public-static.css?v=20260803-locked-v1')) throw new Error('Production release v3 still contains the pre-refinement secondary stylesheet contract.');
if (source.includes("'--v0-page:#0f0f0f'")) throw new Error('Production release v3 still contains the retired standalone public page token.');
if (!source.includes("import './deployed-route-cohesion.css'")) throw new Error('Production release v3 is missing the deployed route cohesion visual layer.');
if (!source.includes('/experience-static-refinement-v1.css?v=20260816-refinement-v1')) throw new Error('Production release v3 is missing the final static refinement contract.');
if (!source.includes("read('apps/web/src/rendered-fidelity-v1.css')") || !source.includes("read('apps/web/src/landing-refinement-v2.css')")) throw new Error('Production release v3 is missing current rendered landing authorities.');
for (const retired of ['Bring the question you actually have.', 'Ask about your life. Get an answer built around you.', 'Seeing the capacity beneath it', 'Mapping the people']) {
  if (source.includes(retired)) throw new Error(`Production release v3 still enforces retired active product language: ${retired}`);
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
