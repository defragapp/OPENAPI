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
    "['data-visual-contract=\"founder-v0-static\"', 'data-secondary-visual-contract=\"founder-v0-locked-v1\"', 'data-route-cohesion=\"v1\"', '/v0-public-static.css?v=20260803-refined-v2', '/deployed-route-cohesion.css?v=20260803-route-v1', '/experience-static-refinement-v1.css?v=20260817-cohesion-v2', '/premium-action-static-v1.css?v=20260818-geist-v1', 'class=\"launch-nav-inner\"', 'class=\"launch-mobile-menu-panel\"']"
  ],
  [
    "const passkeyMigration = read('apps/sovereign-worker/migrations/0014_passkey_authentication.sql');",
    "const passkeyMigration = read('apps/sovereign-worker/migrations/0014_passkey_authentication.sql');\nconst releaseMigration = read('apps/sovereign-worker/migrations/0015_release_evidence.sql');\nconst policyReceiptMigration = read('apps/sovereign-worker/migrations/0016_policy_acceptance_receipts.sql');\nconst privacyAccessMigration = read('apps/sovereign-worker/migrations/0017_privacy_access_and_eligibility.sql');\nconst capacityReservationMigration = read('apps/sovereign-worker/migrations/0018_workers_ai_capacity_reservations.sql');\nconst privacyRights = read('apps/sovereign-worker/src/privacy-rights.ts');\nconst releaseEvidenceRuntime = read('apps/sovereign-worker/src/release-evidence.ts');\nconst releaseEvidenceLibrary = read('scripts/release-evidence-lib.mjs');\nconst releaseOrchestrator = read('scripts/release-orchestrator.mjs');"
  ],
  [
    "const heroCss = read('apps/web/src/landing-hero-field-v4.css');\nconst storyCss = read('apps/web/src/v0-restored-product-stories.css');",
    "const heroCss = read('apps/web/src/landing-hero-field-v4.css');\nconst refinementCss = read('apps/web/src/experience-refinement-v1.css');\nconst renderedFidelityCss = read('apps/web/src/rendered-fidelity-v1.css');\nconst landingRefinementCss = read('apps/web/src/landing-refinement-v2.css');\nconst landingRefinementV5Css = read('apps/web/src/landing-live-refinement-v5.css');\nconst invitationFidelityCss = read('apps/web/src/invitation-rendered-fidelity-v1.css');\nconst storyCss = read('apps/web/src/v0-restored-product-stories.css');"
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
    "  \"const LATEST_MIGRATION_VERSION = '0018_workers_ai_capacity_reservations'\",\n  \"policyAcceptanceReceipts: policyReceiptSchemaReady ? 'configured' : 'missing'\",\n  \"privacyAccessControls: privacyAccessSchemaReady ? 'configured' : 'missing'\",\n  \"aiCapacityReservations: capacityReservationSchemaReady ? 'configured' : 'missing'\",\n  \"dependencies.policyAcceptanceReceipts === 'configured'\",\n  \"dependencies.privacyAccessControls === 'configured'\",\n  \"dependencies.aiCapacityReservations === 'configured'\",\n  \"privateExports: 'on-demand-no-artifact'\",\n  \"releaseEvidenceStore: releaseSchemaReady ? 'configured' : 'missing'\",\n  \"dependencies.releaseEvidenceStore === 'configured'\""
  ],
  [
    "requireAll('passkey credential verification', passkeyVerifier, [",
    "requireAll('release evidence migration', releaseMigration, ['CREATE TABLE release_evidence', 'CREATE TABLE release_progress', \"status TEXT NOT NULL CHECK(status = 'success')\", \"status TEXT NOT NULL CHECK(status = 'failure')\"]);\nrequireAll('policy acceptance receipt migration', policyReceiptMigration, ['ALTER TABLE auth_magic_links ADD COLUMN terms_version', 'ALTER TABLE auth_magic_links ADD COLUMN privacy_version', 'ALTER TABLE auth_magic_links ADD COLUMN policy_content_hash', 'ALTER TABLE auth_magic_links ADD COLUMN policy_release_sha', 'CREATE TABLE policy_acceptance_receipts']);\nrequireAll('privacy access migration', privacyAccessMigration, ['ALTER TABLE accounts ADD COLUMN eligibility_confirmed_at', 'ALTER TABLE accounts ADD COLUMN eligibility_rule_version', 'CREATE TABLE privacy_request_events', 'policy_signup_eligibility_after_terms_receipt']);\nrequireAll('capacity reservation migration', capacityReservationMigration, ['CREATE TABLE workers_ai_capacity_reservations', 'reserved_neurons > 0 AND reserved_neurons <= 7500', 'settled_neurons >= 0 AND settled_neurons <= reserved_neurons']);\nrequireAll('privacy rights runtime', privacyRights, ['sovereign-private-account-export.v1', 'exportArtifactStored: false', 'generatedOnDemand: true', 'acceptCurrentPolicies', 'getPolicyStatus']);\nrequireAll('D1 release evidence runtime', releaseEvidenceRuntime, ['env.DB.prepare', \"status = 'success'\", \"RELEASE_MIGRATION_VERSION = '0018_workers_ai_capacity_reservations'\"]);\nrequireAll('release evidence orchestration', `${releaseEvidenceLibrary}\\n${releaseOrchestrator}`, ['upsertReleaseEvidenceSql', 'upsertReleaseProgressSql', 'applyD1Migrations', 'writeReleaseEvidence', 'writeReleaseProgress', \"RELEASE_MIGRATION_VERSION = '0018_workers_ai_capacity_reservations'\"]);\n\nrequireAll('passkey credential verification', passkeyVerifier, ["
  ],
  [
    "requireAll('application document', index, ['id=\"root\"', 'Healing isn’t optional. Holding onto the pain is.', 'release-fingerprint']);",
    "requireAll('application document', index, ['id=\"root\"', 'Sovereign.OS — Private personal AI for real life', 'og:title', 'og:description', '/og-sovereign.png', '/app-icon.png', '/apple-touch-icon.png', 'release-fingerprint']);"
  ],  [
    "  'stroke: #2f93ff',\n  'width: 100vw',",
    "  'width: 100vw',"
],
  [
    "requireAll('How it works document', how, ['Ask about your life. Get an answer built around you.', 'journey-steps', 'baseline-explainer']);",
    "requireAll('How it works document', how, ['Your Baseline first. The situation second.', 'journey-steps', 'baseline-explainer', '/experience-static-refinement-v1.css?v=20260817-cohesion-v2']);"
  ],
  [
    "requireAll('FAQ document', faq, ['<details', 'Do I need to open my email every time I sign in?', 'When is my plan verified?', 'Can I correct or remove an interpretation?']);",
    "requireAll('FAQ document', faq, ['<details', 'What is Sovereign.OS?', 'What is Baseline Design?', 'Do I need to open my email every time I sign in?', 'What happens to my plan if a payment fails or I cancel?', 'Can I correct or remove an interpretation?', 'Can I support Sovereign.OS without subscribing?', 'one-time amount from $1']);"
  ],
  [
    "  ['passkey auth', passkeyCss],\n  ['v0 static public', staticV0]",
    "  ['experience refinement', refinementCss],\n  ['rendered fidelity', renderedFidelityCss],\n  ['landing refinement v2', landingRefinementCss],\n  ['landing refinement v5', landingRefinementV5Css],\n  ['invitation rendered fidelity', invitationFidelityCss],\n  ['passkey auth', passkeyCss],\n  ['v0 static public', staticV0],\n  ['static experience refinement', staticRefinement]"
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

/*
 * Public-positioning-reset compatibility.
 *
 * The underlying v2 verifier still contains earlier founder-v0 copy markers.
 * The main v3 compatibility pass upgrades that historical verifier first;
 * this second pass aligns only those generated public-language assertions
 * with the self → People → Systems release contract.
 */
const positioningContracts = [
  [
    `requireAll('How it works document', how, ['Your Baseline first. The situation second.', 'journey-steps', 'baseline-explainer', '/experience-static-refinement-v1.css?v=20260817-cohesion-v2']);`,
    `requireAll('How it works document', how, ['Start with yourself. Add another person or the wider situation only when it helps.', 'Ask about what you actually want to understand.', '<summary>See source details</summary>', '<dt>Sources</dt>', 'journey-steps', 'baseline-explainer', '/experience-static-refinement-v1.css?v=20260817-cohesion-v2']);`
  ],
];

function replacePositioningContract(retiredContract, currentContract) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences !== 1) {
    throw new Error(
      `Production release v3 positioning compatibility expected one occurrence but found ${occurrences}: ${retiredContract.slice(0, 120)}`
    );
  }
  source = source.replace(retiredContract, currentContract);
}

for (const [retiredContract, currentContract] of positioningContracts) {
  replacePositioningContract(retiredContract, currentContract);
}

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
if (!source.includes('/experience-static-refinement-v1.css?v=20260817-cohesion-v2')) throw new Error('Production release v3 is missing the final static refinement contract.');
if (!source.includes("read('apps/web/src/rendered-fidelity-v1.css')") || !source.includes("read('apps/web/src/landing-refinement-v2.css')") || !source.includes("read('apps/web/src/landing-live-refinement-v5.css')")) throw new Error('Production release v3 is missing current rendered landing authorities.');
if (!source.includes("read('apps/sovereign-worker/migrations/0016_policy_acceptance_receipts.sql')")) throw new Error('Production release v3 is missing the policy acceptance receipt migration authority.');
if (!source.includes("read('apps/sovereign-worker/migrations/0017_privacy_access_and_eligibility.sql')")) throw new Error('Production release v3 is missing the privacy access migration authority.');
if (!source.includes("read('apps/sovereign-worker/migrations/0018_workers_ai_capacity_reservations.sql')")) throw new Error('Production release v3 is missing the capacity reservation migration authority.');
if (!source.includes("read('apps/sovereign-worker/src/privacy-rights.ts')")) throw new Error('Production release v3 is missing the privacy rights runtime authority.');
for (const retired of ['Start with what’s actually happening.', 'Ask about your life. Get an answer built around you.']) {
  if (source.includes(retired)) throw new Error(`Production release v3 still enforces retired active product language: ${retired}`);
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
