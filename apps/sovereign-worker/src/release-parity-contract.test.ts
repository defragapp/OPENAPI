import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const workerRoot = process.cwd();
const repositoryRoot = resolve(workerRoot, '../..');
const runtime = readFileSync(resolve(workerRoot, 'src/runtime-entry.ts'), 'utf8');
const packageJson = readFileSync(resolve(repositoryRoot, 'package.json'), 'utf8');
const releaseWrapper = readFileSync(resolve(repositoryRoot, 'scripts/cloudflare-production-release.mjs'), 'utf8');
const deployV3 = readFileSync(resolve(repositoryRoot, 'scripts/cloudflare-production-deploy-v3.mjs'), 'utf8');
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
    expect(parentVerifier).toContain(expectedSequence);
  });

  it('promotes the canonical deploy path and requires a rendered browser comparison', () => {
    expect(deployV3).toContain("const migrationVersion = '0014_passkey_authentication';");
    expect(deployV3).toContain("contract: 'v0-public-landing-v3'");
    expect(deployV3).toContain('center-sliced-expression-field');
    expect(packageJson).toContain('verify-live-visual-release-v3.mjs');
    expect(releaseWrapper).toContain('verify-parent-domain-routes-v3.mjs');
    expect(releaseWrapper).toContain('verify-live-visual-release-v3.mjs');
    expect(visualVerifier).toContain('/browser-rendering/snapshot');
    expect(visualVerifier).toContain('screenshotOptions: { fullPage: true');
    expect(visualVerifier).toContain("method: 'Cloudflare Browser Run snapshot with full-page PNG plus deterministic normalized pixel, edge, color, and section-rhythm comparison'");
  });

  it('honors the Workers Free Quick Actions rate limit and validates the founder reference', () => {
    expect(visualRateLimiter).toContain('minimumIntervalMs = 10_500');
    expect(visualRateLimiter).toContain("response.status !== 429");
    expect(visualRateLimiter).toContain("response.headers.get('retry-after')");
    expect(visualRateLimiter).toContain("sourcePath = resolve(root, 'scripts/verify-live-visual-release-v2.mjs')");
    expect(visualRateLimiter).toContain("reference.length > 6_500");
    expect(visualRateLimiter).toContain('await import(pathToFileURL(generatedPath).href)');
  });

  it('stores the complete founder-approved JPEG reference', () => {
    const reference = Buffer.from(referenceBase64, 'base64');
    expect(reference.length).toBeGreaterThan(6_500);
    expect([...reference.subarray(0, 2)]).toEqual([0xff, 0xd8]);
    expect([...reference.subarray(reference.length - 2)]).toEqual([0xff, 0xd9]);
  });
});
