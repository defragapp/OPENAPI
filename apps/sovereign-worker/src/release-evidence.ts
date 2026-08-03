import type { Env } from './env';

export const RELEASE_EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1';
export const RELEASE_ROUTE_COHESION_CONTRACT = 'sovereign-deployed-route-cohesion-v1';
export const RELEASE_RENDERED_VISUAL_CONTRACT = 'sovereign-rendered-page-family-audit-v1';
export const RELEASE_MIGRATION_VERSION = '0014_passkey_authentication';

export type ProductionReleaseEvidence = {
  contract: typeof RELEASE_EVIDENCE_CONTRACT;
  sha: string;
  migrationVersion: typeof RELEASE_MIGRATION_VERSION;
  routeCohesionContract: typeof RELEASE_ROUTE_COHESION_CONTRACT;
  routeCohesionVerified: true;
  renderedVisualContract: typeof RELEASE_RENDERED_VISUAL_CONTRACT;
  renderedVisualVerified: true;
  dmarcRecord: '_dmarc.defrag.app';
  dmarcVerified: boolean;
  dmarcStatus: 'verified' | 'external_blocker';
  completedAt: string;
};

export async function readProductionReleaseEvidence(env: Env): Promise<ProductionReleaseEvidence | null> {
  const sha = String(env.APP_VERSION || '').trim();
  if (!/^[0-9a-f]{40}$/i.test(sha)) return null;
  const session = env.DB.withSession('first-primary');
  const record = await session.prepare(`SELECT status, payload_json
    FROM background_jobs
    WHERE id = ?1 AND kind = 'production_release_evidence'
    LIMIT 1`)
    .bind(`production-release:${sha}`)
    .first<{ status: string; payload_json: string }>();
  if (record?.status !== 'succeeded') return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(record.payload_json);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const evidence = parsed as Partial<ProductionReleaseEvidence>;
  if (evidence.contract !== RELEASE_EVIDENCE_CONTRACT
    || evidence.sha !== sha
    || evidence.migrationVersion !== RELEASE_MIGRATION_VERSION
    || evidence.routeCohesionContract !== RELEASE_ROUTE_COHESION_CONTRACT
    || evidence.routeCohesionVerified !== true
    || evidence.renderedVisualContract !== RELEASE_RENDERED_VISUAL_CONTRACT
    || evidence.renderedVisualVerified !== true
    || evidence.dmarcRecord !== '_dmarc.defrag.app'
    || typeof evidence.dmarcVerified !== 'boolean'
    || (evidence.dmarcStatus !== 'verified' && evidence.dmarcStatus !== 'external_blocker')
    || evidence.dmarcVerified !== (evidence.dmarcStatus === 'verified')
    || typeof evidence.completedAt !== 'string') {
    return null;
  }
  return evidence as ProductionReleaseEvidence;
}
