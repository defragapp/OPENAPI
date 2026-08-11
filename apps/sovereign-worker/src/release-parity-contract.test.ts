import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const workerRoot = process.cwd();
const repositoryRoot = resolve(workerRoot, '../..');
const runtime = readFileSync(resolve(workerRoot, 'src/runtime-entry.ts'), 'utf8');
const releaseEvidenceRuntime = readFileSync(resolve(workerRoot, 'src/release-evidence.ts'), 'utf8');
const packageJson = readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8');
const wranglerConfig = readFileSync(resolve(repositoryRoot, 'wrangler.jsonc'), 'utf8');
const releaseWrapper = readFileSync(resolve(repositoryRoot, 'scripts/cloudflare-production-release.mjs'), 'utf8');
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
  it('derives migration 0015 from D1 history and both release tables, with an accurate 0014 fallback', () => {
    expect(runtime).toContain("const PREVIOUS_MIGRATION_VERSION = '0014_passkey_authentication'");
    expect(runtime).toContain("const LATEST_MIGRATION_VERSION = '0015_release_evidence'");
    expect(runtime).toContain("const LATEST_MIGRATION_FILENAME = '0015_release_evidence.sql'");
    expect(runtime).toContain("name = 'release_evidence'");
    expect(runtime).toContain("name = 'release_progress'");
    expect(runtime).toContain('FROM d1_migrations WHERE name = ?1');
    expect(runtime).toContain("migrationParity: migrationParity ? 'current' : 'behind'");
    expect(runtime).toContain('&& migrationParity');
    expect(runtime).toContain("status: pathname === '/ready' && !ready ? 503 : 200");
    expect(runtime).toContain('migrationVersion,');
    expect(runtime).toContain('latestMigrationVersion: LATEST_MIGRATION_VERSION');
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

  it('verifies DMARC before migrations, one deploy, route checks, rendered checks, and D1 evidence', () => {
    expect(deployV3).toContain("runWrangler(['deploy', '--config', generatedConfigPath])");
    expect(deployV3).not.toContain('cloudflare-production-deploy-v2.mjs');
    expect(releaseOrchestrator).toContain('applyD1Migrations');
    expect(releaseOrchestrator).toContain('writeReleaseEvidence');
    expect(packageJson).toContain('verify-live-visual-release-v3.mjs');
    for (const script of [
      'cloudflare-production-deploy-v3.mjs',
      'verify-parent-domain-routes-v3.mjs',
      'verify-live-secondary-public.mjs',
      'verify-live-route-cohesion.mjs',
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

  it('keeps deterministic DMARC reconciliation as a separately reported account control', () => {
    expect(dmarcReconciler).toContain("const RECORD_NAME = '_dmarc.defrag.app'");
    expect(dmarcReconciler).toContain("v=DMARC1; p=none; sp=none; adkim=s; aspf=s; pct=100");
    expect(dmarcReconciler).toContain('existing.length > 1');
    expect(dmarcReconciler).toContain("method: 'POST'");
    expect(dmarcReconciler).toContain("method: 'PATCH'");
    expect(dmarcReconciler).toContain('records.length !== 1');
    expect(releaseOrchestrator).toContain("status: 'dmarc-preflight-failed'");
    expect(releaseEvidenceLibrary).toContain("dmarcStatus: 'verified'");
    expect(releaseEvidenceLibrary).not.toContain('external_blocker');
  });

  it('publishes exact-SHA application release evidence only after every application gate', () => {
    expect(releaseEvidenceLibrary).toContain("RELEASE_EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1'");
    expect(releaseEvidenceLibrary).toContain("RELEASE_MIGRATION_VERSION = '0015_release_evidence'");
    expect(evidenceWriter).toContain('upsertReleaseEvidenceSql');
    expect(evidenceWriter).toContain("status='success'");
    expect(evidenceWriter).toContain('releaseEvidenceEquals');
    expect(evidenceWriter).not.toContain("runWrangler(['deploy'");
    expect(progressWriter).toContain('upsertReleaseProgressSql');
    expect(wranglerConfig).toMatch(/"account_id"\s*:\s*"[0-9a-f]{32}"/i);
    expect(releaseEvidenceRuntime).toContain('env.DB.prepare');
    expect(releaseEvidenceRuntime).toContain("status = 'success'");
    expect(releaseEvidenceRuntime).toContain("RELEASE_EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1'");
    expect(releaseEvidenceRuntime).toContain("RELEASE_MIGRATION_VERSION = '0015_release_evidence'");
    expect(releaseEvidenceRuntime).toContain('evidence.sha !== sha');
    expect(releaseEvidenceRuntime).toContain('evidence.dmarcVerified !== true');
    expect(runtime).toContain("import { readProductionReleaseEvidence } from './release-evidence'");
    expect(runtime).toContain('const releaseEvidence = await readProductionReleaseEvidence(env)');
    expect(runtime).toContain('releaseEvidence,');
  });

  it('honors the Workers Free Quick Actions rate limit and validates the founder reference', () => {
    expect(visualRateLimiter).toContain('minimumIntervalMs = 10_500');
    expect(visualRateLimiter).toContain("response.status !== 429");
    expect(visualRateLimiter).toContain("response.headers.get('retry-after')");
    expect(visualRateLimiter).toContain("sourcePath = resolve(root, 'scripts/verify-live-visual-release-v2.mjs')");
    expect(visualRateLimiter).toContain("reference.length > 6_500");
    expect(visualRateLimiter).toContain('const desktopMinimumScore = 0.70;');
    expect(visualRateLimiter).toContain('const desktopMinimumBandCorrelation = 0.15;');
    expect(visualRateLimiter).toContain('const desktopSectionRanges = [');
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
