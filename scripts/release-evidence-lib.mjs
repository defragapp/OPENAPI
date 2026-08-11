export const RELEASE_EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1';
export const RELEASE_MIGRATION_VERSION = '0015_release_evidence';
export const RELEASE_MIGRATION_FILENAME = '0015_release_evidence.sql';
export const RELEASE_ROUTE_COHESION_CONTRACT = 'sovereign-deployed-route-cohesion-v1';
export const RELEASE_RENDERED_VISUAL_CONTRACT = 'sovereign-rendered-page-family-audit-v1';
export const RELEASE_PROGRESS_CONTRACT = 'sovereign-production-release-progress.v1';
export const RELEASE_DMARC_RECORD = '_dmarc.sovereign.os';
export const MAX_RELEASE_PROGRESS_SUMMARY_LENGTH = 2_000;
const RELEASE_EVIDENCE_KEYS = [
  'contract',
  'sha',
  'migrationVersion',
  'routeCohesionContract',
  'routeCohesionVerified',
  'renderedVisualContract',
  'renderedVisualVerified',
  'dmarcRecord',
  'dmarcVerified',
  'dmarcStatus',
  'completedAt'
];

export function assertReleaseSha(sha) {
  const value = String(sha || '').trim();
  if (!/^[0-9a-f]{40}$/i.test(value)) throw new Error('Release SHA must be a full 40-character hexadecimal commit');
  return value.toLowerCase();
}

export function assertReleaseStage(stage) {
  const value = String(stage || '').trim();
  if (!/^[a-z0-9-]{2,80}$/.test(value)) throw new Error('Release progress stage is invalid');
  return value;
}

export function encodeBase64Json(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64');
}

export function decodeBase64Json(value) {
  return JSON.parse(Buffer.from(String(value || ''), 'base64').toString('utf8'));
}

export function createReleaseEvidence({ sha, dmarcVerified = false, completedAt = new Date().toISOString() }) {
  const normalizedSha = assertReleaseSha(sha);
  const verified = dmarcVerified === true;
  return {
    contract: RELEASE_EVIDENCE_CONTRACT,
    sha: normalizedSha,
    migrationVersion: RELEASE_MIGRATION_VERSION,
    routeCohesionContract: RELEASE_ROUTE_COHESION_CONTRACT,
    routeCohesionVerified: true,
    renderedVisualContract: RELEASE_RENDERED_VISUAL_CONTRACT,
    renderedVisualVerified: true,
    dmarcRecord: RELEASE_DMARC_RECORD,
    dmarcVerified: verified,
    dmarcStatus: verified ? 'verified' : 'external_blocker',
    completedAt
  };
}

export function validateReleaseEvidence(value, expectedSha) {
  const sha = assertReleaseSha(expectedSha);
  return Boolean(
    value
    && typeof value === 'object'
    && Object.keys(value).length === RELEASE_EVIDENCE_KEYS.length
    && RELEASE_EVIDENCE_KEYS.every((key) => Object.hasOwn(value, key))
    && value.contract === RELEASE_EVIDENCE_CONTRACT
    && value.sha === sha
    && value.migrationVersion === RELEASE_MIGRATION_VERSION
    && value.routeCohesionContract === RELEASE_ROUTE_COHESION_CONTRACT
    && value.routeCohesionVerified === true
    && value.renderedVisualContract === RELEASE_RENDERED_VISUAL_CONTRACT
    && value.renderedVisualVerified === true
    && value.dmarcRecord === RELEASE_DMARC_RECORD
    && typeof value.dmarcVerified === 'boolean'
    && (value.dmarcStatus === 'verified' || value.dmarcStatus === 'external_blocker')
    && value.dmarcVerified === (value.dmarcStatus === 'verified')
    && typeof value.completedAt === 'string'
    && Number.isFinite(Date.parse(value.completedAt))
  );
}

export function releaseEvidenceEquals(left, right) {
  if (!left || !right) return false;
  return Object.keys(left).length === RELEASE_EVIDENCE_KEYS.length
    && Object.keys(right).length === RELEASE_EVIDENCE_KEYS.length
    && RELEASE_EVIDENCE_KEYS.every((key) => left[key] === right[key]);
}

export function upsertReleaseEvidenceSql(sha, evidenceB64) {
  const normalizedSha = assertReleaseSha(sha);
  const encoded = assertBase64(evidenceB64, 'Release evidence');
  return `INSERT INTO release_evidence (sha, contract, evidence_b64, status, created_at, updated_at)
VALUES ('${normalizedSha}', '${RELEASE_EVIDENCE_CONTRACT}', '${encoded}', 'success', datetime('now'), datetime('now'))
ON CONFLICT(sha) DO UPDATE SET
  contract = excluded.contract,
  evidence_b64 = excluded.evidence_b64,
  status = excluded.status,
  updated_at = datetime('now');`;
}

export function sanitizeReleaseProgressSummary(value) {
  return String(value || '')
    .replace(/cfat_[A-Za-z0-9_-]+/g, '[redacted-cloudflare-token]')
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
    .replace(/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9_-]+/g, '[redacted-provider-key]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(-MAX_RELEASE_PROGRESS_SUMMARY_LENGTH);
}

export function upsertReleaseProgressSql(sha, stage, summaryB64) {
  const normalizedSha = assertReleaseSha(sha);
  const normalizedStage = assertReleaseStage(stage);
  const encoded = assertBase64(summaryB64, 'Release progress summary');
  return `INSERT INTO release_progress (sha, stage, status, summary_b64, created_at, updated_at)
VALUES ('${normalizedSha}', '${normalizedStage}', 'failure', '${encoded}', datetime('now'), datetime('now'))
ON CONFLICT(sha, stage) DO UPDATE SET
  status = excluded.status,
  summary_b64 = excluded.summary_b64,
  updated_at = datetime('now');`;
}

function assertBase64(value, label) {
  const encoded = String(value || '').trim();
  if (!encoded || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error(`${label} must be non-empty base64`);
  return encoded;
}
