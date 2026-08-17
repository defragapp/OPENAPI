import type { Env } from './env';

export const RELEASE_EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1';
export const RELEASE_ROUTE_COHESION_CONTRACT = 'sovereign-deployed-route-cohesion-v1';
export const RELEASE_RENDERED_VISUAL_CONTRACT = 'sovereign-rendered-page-family-audit-v1';
export const RELEASE_MIGRATION_VERSION = '0016_policy_acceptance_receipts';
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
] as const;

export type ProductionReleaseEvidence = {
  contract: typeof RELEASE_EVIDENCE_CONTRACT;
  sha: string;
  migrationVersion: typeof RELEASE_MIGRATION_VERSION;
  routeCohesionContract: typeof RELEASE_ROUTE_COHESION_CONTRACT;
  routeCohesionVerified: true;
  renderedVisualContract: typeof RELEASE_RENDERED_VISUAL_CONTRACT;
  renderedVisualVerified: true;
  dmarcRecord: '_dmarc.defrag.app';
  dmarcVerified: true;
  dmarcStatus: 'verified';
  completedAt: string;
};

export async function readProductionReleaseEvidence(env: Env): Promise<ProductionReleaseEvidence | null> {
  const sha = String(env.APP_VERSION || '').trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/i.test(sha)) return null;

  let parsed: unknown;
  try {
    const row = await env.DB.prepare(
      `SELECT evidence_b64 FROM release_evidence WHERE sha = ?1 AND status = 'success' LIMIT 1`
    ).bind(sha).first<{ evidence_b64: string }>();
    if (!row?.evidence_b64) return null;
    parsed = JSON.parse(decodeBase64Utf8(row.evidence_b64));
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const evidence = parsed as Partial<ProductionReleaseEvidence>;
  if (Object.keys(evidence).length !== RELEASE_EVIDENCE_KEYS.length
    || !RELEASE_EVIDENCE_KEYS.every((key) => Object.hasOwn(evidence, key))
    || evidence.contract !== RELEASE_EVIDENCE_CONTRACT
    || evidence.sha !== sha
    || evidence.migrationVersion !== RELEASE_MIGRATION_VERSION
    || evidence.routeCohesionContract !== RELEASE_ROUTE_COHESION_CONTRACT
    || evidence.routeCohesionVerified !== true
    || evidence.renderedVisualContract !== RELEASE_RENDERED_VISUAL_CONTRACT
    || evidence.renderedVisualVerified !== true
    || evidence.dmarcRecord !== '_dmarc.defrag.app'
    || evidence.dmarcVerified !== true
    || evidence.dmarcStatus !== 'verified'
    || typeof evidence.completedAt !== 'string'
    || !Number.isFinite(Date.parse(evidence.completedAt))) {
    return null;
  }
  return evidence as ProductionReleaseEvidence;
}

function decodeBase64Utf8(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
