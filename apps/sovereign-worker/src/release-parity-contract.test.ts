import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const workerRoot = process.cwd();
const repositoryRoot = resolve(workerRoot, '../..');
const runtime = readFileSync(resolve(workerRoot, 'src/runtime-entry.ts'), 'utf8');
const releaseEvidenceRuntime = readFileSync(resolve(workerRoot, 'src/release-evidence.ts'), 'utf8');
const policyReceiptMigration = readFileSync(resolve(workerRoot, 'migrations/0016_policy_acceptance_receipts.sql'), 'utf8');
const privacyAccessMigration = readFileSync(resolve(workerRoot, 'migrations/0017_privacy_access_and_eligibility.sql'), 'utf8');
const capacityReservationMigration = readFileSync(resolve(workerRoot, 'migrations/0018_workers_ai_capacity_reservations.sql'), 'utf8');
const packageJson = readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8');
const wranglerConfig = readFileSync(resolve(repositoryRoot, 'wrangler.jsonc'), 'utf8');
const releaseWrapper = readFileSync(resolve(repositoryRoot, 'scripts/cloudflare-production-release.mjs'), 'utf8');
const textRelease = readFileSync(resolve(repositoryRoot, 'scripts/cloudflare-production-text-release.mjs'), 'utf8');
const deployV3 = readFileSync(resolve(repositoryRoot, 'scripts/cloudflare-production-deploy-v3.mjs'), 'utf8');
const releaseOrchestrator = readFileSync(resolve(repositoryRoot, 'scripts/release-orchestrator.mjs'), 'utf8');
const releaseEvidenceLibrary = readFileSync(resolve(repositoryRoot, 'scripts/release-evidence-lib.mjs'), 'utf8');
const dmarcReconciler = readFileSync(resolve(repositoryRoot, 'scripts/configure-cloudflare-dmarc.mjs'), 'utf8');
const evidenceWriter = readFileSync(resolve(repositoryRoot, 'scripts/write-cloudflare-release-evidence.mjs'), 'utf8');
const progressWriter = readFileSync(resolve(repositoryRoot, 'scripts/write-cloudflare-release-progress.mjs'), 'utf8');
const parentVerifier = readFileSync(resolve(repositoryRoot, 'scripts/verify-parent-domain-routes-v3.mjs'), 'utf8');
const visualVerifier = readFileSync(resolve(repositoryRoot, 'scripts/verify-live-visual-release-v2.mjs'), 'utf8');
const visualRateLimiter = readFileSync(resolve(repositoryRoot, 'scripts/verify-live-visual-release-v3.mjs'), 'utf8');
const referenceBase64 = readFileSync(
  resolve(repositoryRoot, 'tests/visual/sovereign-landing-reference-192x507.jpg.base64'),
  'utf8'
).trim();

const archiveSha256 = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const expectedSequence = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha256}`;
const expectedRuntimeSequence = expectedSequence.replace(archiveSha256, '${VISUAL_ARCHIVE_SHA256}');
const expectedParentVerifierSequence = expectedSequence.replace(archiveSha256, '${expectedArchive}');

describe('production release parity contract', () => {
  it('derives migration 0018 from immutable history and the reservation schema', () => {
    expect(runtime).toContain("const PASSKEY_MIGRATION_VERSION = '0014_passkey_authentication'");
    expect(runtime).toContain("const RELEASE_EVIDENCE_MIGRATION_VERSION = '0015_release_evidence'");
    expect(runtime).toContain("const POLICY_RECEIPT_MIGRATION_VERSION = '0016_policy_acceptance_receipts'");
    expect(runtime).toContain("const PRIVACY_ACCESS_MIGRATION_VERSION = '0017_privacy_access_and_eligibility'");
    expect(runtime).toContain("const LATEST_MIGRATION_VERSION = '0018_workers_ai_capacity_reservations'");
    expect(runtime).toContain("const LATEST_MIGRATION_FILENAME = '0018_workers_ai_capacity_reservations.sql'");
    expect(runtime).toContain("name = 'release_evidence'");
    expect(runtime).toContain("name = 'release_progress'");
    expect(runtime).toContain("name = 'policy_acceptance_receipts'");
    expect(runtime).toContain("name = 'privacy_request_events'");
    expect(runtime).toContain("name = 'workers_ai_capacity_reservations'");
    expect(runtime).toContain("pragma_table_info('accounts')");
    expect(runtime).toContain('FROM d1_migrations WHERE name = ?1');
    expect(runtime).toContain("policyAcceptanceReceipts: policyReceiptSchemaReady ? 'configured' : 'missing'");
    expect(runtime).toContain("privacyAccessControls: privacyAccessSchemaReady ? 'configured' : 'missing'");
    expect(runtime).toContain("aiCapacityReservations: capacityReservationSchemaReady ? 'configured' : 'missing'");
    expect(runtime).toContain("migrationParity: migrationParity ? 'current' : 'behind'");
    expect(runtime).toContain("&& dependencies.policyAcceptanceReceipts === 'configured'");
    expect(runtime).toContain("&& dependencies.privacyAccessControls === 'configured'");
    expect(runtime).toContain("&& dependencies.aiCapacityReservations === 'configured'");
    expect(runtime).toContain("status: pathname === '/ready' && !ready ? 503 : 200");
    expect(runtime).toContain("...(pathname === '/ready' ? { sha: env.APP_VERSION } : {})");
    expect(runtime).toContain('migrationVersion,');
    expect(runtime).toContain('latestMigrationVersion: LATEST_MIGRATION_VERSION');
    expect(policyReceiptMigration).toContain('CREATE TABLE policy_acceptance_receipts');
    expect(privacyAccessMigration).toContain('CREATE TABLE privacy_request_events');
    expect(privacyAccessMigration).toContain('eligibility_rule_version TEXT');
    expect(privacyAccessMigration).not.toContain('workers_ai_capacity_reservations');
    expect(capacityReservationMigration).toContain('CREATE TABLE workers_ai_capacity_reservations');
  });

  it('publishes the v3 runtime visual release contract', () => {
    expect(runtime).toContain("contract: 'v0-public-landing-v3'");
    expect(runtime).toContain("field: 'landing-expression-field-v3'");
    expect(runtime).toContain('renderedComparisonRequired: true');
    expect(runtime).toContain(expectedRuntimeSequence);
    expect(parentVerifier).toContain(`const expectedArchive = '${archiveSha256}'`);
    expect(parentVerifier).toContain(expectedParentVerifierSequence);
    expect(parentVerifier).toContain("assert(result.json?.visualRelease?.sequenceFingerprint === expectedSequence");
  });

  it('keeps the optional Browser-audited release path fail-closed', () => {
    expect(deployV3).toContain("runWrangler(['deploy', '--config', generatedConfigPath])");
    expect(deployV3).not.toContain('cloudflare-production-deploy-v2.mjs');
    expect(releaseOrchestrator).toContain('applyD1Migrations');
    expect(releaseOrchestrator).toContain('writeReleaseEvidence');
    expect(packageJson).toContain('verify-live-visual-release-v3.mjs');
    for (const script of [
      'cloudflare-production-deploy-v3.mjs',
      'verify-parent-domain-routes-v3.mjs',
      'verify-live-secondary-public.mjs',
      'verify-live-route-cohesion-v2.mjs',
      'verify-live-visual-release-v3.mjs',
      'configure-cloudflare-dmarc.mjs',
      'write-cloudflare-release-evidence.mjs'
    ]) {
      expect(`${releaseWrapper}\n${releaseOrchestrator}`).toContain(script);
    }
    const positions = [
      'dmarc = await reconcileDmarc',
      'prepared = await prepareConfig',
      'const migrationResult = applyMigrations',
      'const deployResult = await deployMain',
      'for (const check of postDeployChecks)',
      'const evidence = await evidenceWriter'
    ].map((marker) => releaseOrchestrator.indexOf(marker));
    expect(positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1]!))).toBe(true);
    expect(releaseOrchestrator).toContain('browserRunMaxAttempts = 2');
    expect(releaseOrchestrator).toContain('persistFailure');
    expect(releaseOrchestrator).not.toContain('deferredBrowserVerification');
    expect(visualVerifier).toContain('/browser-rendering/snapshot');
    expect(visualVerifier).toContain('screenshotOptions: { fullPage: true');
    expect(visualVerifier).toContain("method: 'Cloudflare Browser Run snapshot with full-page PNG plus deterministic normalized pixel, edge, color, and section-rhythm comparison'");
  });

  it('provides a text-first production release path without Browser Rendering and records truthful evidence', () => {
    expect(packageJson).toContain('"production:release:text"');
    expect(packageJson).toContain('cloudflare-production-text-release.mjs');
    expect(textRelease).toContain('DEFAULT_POST_DEPLOY_CHECKS.filter((check) => check.browserRun !== true)');
    expect(textRelease).toContain("const requiredChecks = ['verify-runtime-v3', 'verify-secondary-public']");
    expect(textRelease).toContain('postDeployChecks: TEXT_FIRST_POST_DEPLOY_CHECKS');
    expect(textRelease).not.toContain('verify-live-route-cohesion');
    expect(textRelease).not.toContain('verify-live-visual-release');
    expect(releaseOrchestrator).toContain("routeCohesionVerified: passedPostDeployChecks.has('verify-route-cohesion')");
    expect(releaseOrchestrator).toContain("renderedVisualVerified: passedPostDeployChecks.has('verify-rendered-visuals')");
    expect(releaseEvidenceLibrary).toContain("typeof value.routeCohesionVerified === 'boolean'");
    expect(releaseEvidenceLibrary).toContain("typeof value.renderedVisualVerified === 'boolean'");
    expect(releaseEvidenceRuntime).toContain("typeof evidence.routeCohesionVerified !== 'boolean'");
    expect(releaseEvidenceRuntime).toContain("typeof evidence.renderedVisualVerified !== 'boolean'");
  });

  it('verifies the publicly served DMARC value before deployment without mutating DNS', () => {
    expect(dmarcReconciler).toContain("const RECORD_NAME = '_dmarc.defrag.app'");
    expect(dmarcReconciler).toContain("v=DMARC1; p=none; sp=none; adkim=s; aspf=s; pct=100");
    expect(dmarcReconciler).toContain('https://cloudflare-dns.com/dns-query');
    expect(dmarcReconciler).toContain("accept: 'application/dns-json'");
    expect(dmarcReconciler).toContain('records.length !== 1');
    expect(dmarcReconciler).not.toContain("method: 'POST'");
    expect(dmarcReconciler).not.toContain("method: 'PATCH'");
    expect(dmarcReconciler).not.toContain('authorization:');
    expect(releaseOrchestrator).toContain("status: 'dmarc-preflight-failed'");
    expect(releaseEvidenceLibrary).toContain("dmarcStatus: 'verified'");
    expect(releaseEvidenceLibrary).not.toContain('external_blocker');
  });

  it('publishes exact-SHA application release evidence with explicit verification provenance', () => {
    expect(releaseEvidenceLibrary).toContain("RELEASE_EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1'");
    expect(releaseEvidenceLibrary).toContain("RELEASE_MIGRATION_VERSION = '0018_workers_ai_capacity_reservations'");
    expect(releaseEvidenceLibrary).toContain("RELEASE_MIGRATION_FILENAME = '0018_workers_ai_capacity_reservations.sql'");
    expect(evidenceWriter).toContain('upsertReleaseEvidenceSql');
    expect(evidenceWriter).toContain("status='success'");
    expect(evidenceWriter).toContain('releaseEvidenceEquals');
    expect(evidenceWriter).toContain("payload?.dependencies?.privacyAccessControls === 'configured'");
    expect(evidenceWriter).toContain('routeCohesionVerified');
    expect(evidenceWriter).toContain('renderedVisualVerified');
    expect(evidenceWriter).not.toContain("runWrangler(['deploy'");
    expect(progressWriter).toContain('upsertReleaseProgressSql');
    expect(wranglerConfig).toMatch(/"account_id"\s*:\s*"[0-9a-f]{32}"/i);
    expect(releaseEvidenceRuntime).toContain('env.DB.prepare');
    expect(releaseEvidenceRuntime).toContain("status = 'success'");
    expect(releaseEvidenceRuntime).toContain("RELEASE_EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1'");
    expect(releaseEvidenceRuntime).toContain("RELEASE_MIGRATION_VERSION = '0018_workers_ai_capacity_reservations'");
    expect(releaseEvidenceRuntime).toContain('evidence.sha !== sha');
    expect(releaseEvidenceRuntime).toContain('evidence.dmarcVerified !== true');
    expect(runtime).toContain("import { readProductionReleaseEvidence } from './release-evidence'");
    expect(runtime).toContain('const releaseEvidence = await readProductionReleaseEvidence(env)');
    expect(runtime).toContain('releaseEvidence,');
    expect(runtime).toContain("aiGatewayId: env.AI_GATEWAY_ID || 'missing'");
    expect(runtime).toContain("publicContactEmail: env.PUBLIC_CONTACT_EMAIL || 'info@defrag.app'");
  });

  it('honors the Workers Free Quick Actions rate limit and validates the founder reference', () => {
    expect(visualRateLimiter).toContain('minimumIntervalMs = 10_500');
    expect(visualRateLimiter).toContain("response.status !== 429");
    expect(visualRateLimiter).toContain("response.headers.get('retry-after')");
    expect(visualRateLimiter).toContain("sourcePath = resolve(root, 'scripts/verify-live-visual-release-v2.mjs')");
    expect(visualRateLimiter).toContain("reference.length > 6_500");
    expect(visualRateLimiter).toContain('const desktopMinimumScore = 0.70;');
    expect(visualRateLimiter).toContain('Aggregate visual similarity already weights band correlation');
    expect(visualRateLimiter).toContain('const desktopSectionRanges = [');
    expect(visualRateLimiter).toContain("['.landing-story--system', 0.55, 0.65, 0.15, 0.23]");
    expect(visualRateLimiter).toContain("['.v0-final', 0.84, 0.93, 0.08, 0.14]");
    expect(visualRateLimiter).toContain('await import(pathToFileURL(generatedPath).href)');
  });

  it('stores the complete founder-approved JPEG reference', () => {
    const reference = Buffer.from(referenceBase64, 'base64');
    expect(reference.length).toBeGreaterThan(6_500);
    expect([...reference.subarray(0, 2)]).toEqual([0xff, 0xd8]);
    expect([...reference.subarray(reference.length - 2)]).toEqual([0xff, 0xd9]);
  });
});
