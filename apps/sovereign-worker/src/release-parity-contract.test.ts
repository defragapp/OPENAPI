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
const dmarcReconciler = readFileSync(resolve(repositoryRoot, 'scripts/configure-cloudflare-dmarc.mjs'), 'utf8');
const evidenceWriter = readFileSync(resolve(repositoryRoot, 'scripts/write-cloudflare-release-evidence.mjs'), 'utf8');
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
  it('derives migration 0014 from deployed schema evidence and blocks stale readiness', () => {
    expect(runtime).toContain("const LATEST_MIGRATION_VERSION = '0014_passkey_authentication'");
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

  it('runs deployment, route checks, and rendered checks before recording release evidence', () => {
    expect(deployV3).toContain("const migrationVersion = '0014_passkey_authentication';");
    expect(deployV3).toContain("contract: 'v0-public-landing-v3'");
    expect(deployV3).toContain('center-sliced-expression-field');
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
      expect(releaseWrapper).toContain(script);
    }
    const positions = [
      'cloudflare-production-deploy-v3.mjs',
      'verify-parent-domain-routes-v3.mjs',
      'verify-live-secondary-public.mjs',
      'verify-live-route-cohesion.mjs',
      'verify-live-visual-release-v3.mjs',
      'configure-cloudflare-dmarc.mjs',
      'write-cloudflare-release-evidence.mjs'
    ].map((script) => releaseWrapper.indexOf(script));
    expect(positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1]!))).toBe(true);
    expect(releaseWrapper).toContain('DMARC reconciliation is non-authoritative');
    expect(releaseWrapper).toContain('const browserRunMaxAttempts = 2;');
    expect(releaseWrapper).toContain('const retryable = browserVerificationLabels.has(label);');
    expect(releaseWrapper).not.toContain('deferredBrowserVerification');
    expect(releaseWrapper).not.toContain('verification=deferred');
    expect(releaseWrapper).toContain("RELEASE_DMARC_VERIFIED: dmarcVerified ? 'true' : 'false'");
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
    expect(releaseWrapper).toContain("dmarcVerified ? 'verified' : 'external-blocker'");
  });

  it('publishes exact-SHA application release evidence only after every application gate', () => {
    expect(evidenceWriter).toContain("const EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1'");
    expect(evidenceWriter).toContain("const ROUTE_COHESION_CONTRACT = 'sovereign-deployed-route-cohesion-v1'");
    expect(evidenceWriter).toContain("const RENDERED_VISUAL_CONTRACT = 'sovereign-rendered-page-family-audit-v1'");
    expect(evidenceWriter).toContain("process.env.RELEASE_DMARC_VERIFIED");
    expect(evidenceWriter).toContain("dmarcStatus: dmarcVerified ? 'verified' : 'external_blocker'");
    expect(evidenceWriter).toContain("apps/web/dist/release-evidence.json");
    expect(evidenceWriter).toContain('writeFileSync(evidenceAssetPath');
    expect(evidenceWriter).toContain("executeWrangler(['deploy', '--config', generatedConfigPath])");
    expect(evidenceWriter).toContain('final evidence deployment did not converge');
    expect(evidenceWriter).toContain('finalEvidenceDeploy: true');
    expect(wranglerConfig).toMatch(/"account_id"\s*:\s*"[0-9a-f]{32}"/i);
    expect(releaseEvidenceRuntime).toContain('env.ASSETS.fetch');
    expect(releaseEvidenceRuntime).toContain('release-evidence.json?sha=${sha}');
    expect(releaseEvidenceRuntime).not.toContain('background_jobs');
    expect(releaseEvidenceRuntime).not.toContain('env.DB.withSession');
    expect(releaseEvidenceRuntime).toContain("RELEASE_EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1'");
    expect(releaseEvidenceRuntime).toContain("RELEASE_MIGRATION_VERSION = '0014_passkey_authentication'");
    expect(releaseEvidenceRuntime).toContain('evidence.sha !== sha');
    expect(releaseEvidenceRuntime).toContain("typeof evidence.dmarcVerified !== 'boolean'");
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
