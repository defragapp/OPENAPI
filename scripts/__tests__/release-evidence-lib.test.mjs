import { describe, expect, it } from 'vitest';
import {
  createReleaseEvidence,
  decodeBase64Json,
  encodeBase64Json,
  releaseEvidenceEquals,
  sanitizeReleaseProgressSummary,
  upsertReleaseEvidenceSql,
  upsertReleaseProgressSql,
  validateReleaseEvidence
} from '../release-evidence-lib.mjs';

describe('release evidence library', () => {
  it('round-trips and validates complete production evidence', () => {
    const sha = 'a'.repeat(40);
    const evidence = createReleaseEvidence({ sha, dmarcVerified: true, completedAt: '2026-08-09T00:00:00.000Z' });
    const decoded = decodeBase64Json(encodeBase64Json(evidence));
    expect(validateReleaseEvidence(decoded, sha)).toBe(true);
    expect(releaseEvidenceEquals(decoded, evidence)).toBe(true);
    expect(validateReleaseEvidence({ ...decoded, unexpected: true }, sha)).toBe(false);
    expect(releaseEvidenceEquals({ ...decoded, unexpected: true }, evidence)).toBe(false);
    expect(validateReleaseEvidence({ ...decoded, dmarcVerified: false, dmarcStatus: 'external_blocker' }, sha)).toBe(false);
    expect(() => createReleaseEvidence({ sha, dmarcVerified: false })).toThrow(/Verified DMARC/);
  });

  it('generates constrained upserts only after validating identifiers', () => {
    const sha = 'b'.repeat(40);
    expect(upsertReleaseEvidenceSql(sha, encodeBase64Json({ sha }))).toContain('ON CONFLICT(sha) DO UPDATE');
    expect(upsertReleaseProgressSql(sha, 'verify-route-cohesion', encodeBase64Json({ ok: false })))
      .toContain('ON CONFLICT(sha, stage) DO UPDATE');
    expect(() => upsertReleaseProgressSql(sha, "bad'; DROP TABLE accounts;--", 'YWJj')).toThrow();
  });

  it('redacts provider credentials from failure progress', () => {
    const cloudflareLike = ['cf', 'at_', 'example'].join('');
    const bearerLike = ['abc', '.def', '.ghi'].join('');
    const providerLike = ['sk', '_live_', 'example'].join('');
    const summary = sanitizeReleaseProgressSummary(`${cloudflareLike} Bearer ${bearerLike} ${providerLike}`);
    expect(summary).not.toContain(cloudflareLike);
    expect(summary).not.toContain(bearerLike);
    expect(summary).not.toContain(providerLike);
  });
});
