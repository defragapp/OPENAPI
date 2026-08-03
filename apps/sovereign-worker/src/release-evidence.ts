import type { Env } from './env';

export const RELEASE_EVIDENCE_CONTRACT = 'sovereign-production-release-evidence.v1';
export const RELEASE_ROUTE_COHESION_CONTRACT = 'sovereign-deployed-route-cohesion-v1';
export const RELEASE_RENDERED_VISUAL_CONTRACT = 'sovereign-rendered-page-family-audit-v1';

export type ProductionReleaseEvidence = {
  contract: typeof RELEASE_EVIDENCE_CONTRACT;
  sha: string;
  migrationVersion: string;
  routeCohesionContract: typeof RELEASE_ROUTE_COHESION_CONTRACT;
  routeCohesionVerified: true;
  renderedVisualContract: typeof RELEASE_RENDERED_VISUAL_CONTRACT;
  renderedVisualVerified: true;
  dmarcRecord: '_dmarc.defrag.app';
  dmarcVerified: true;
  completedAt: string;
};

export async function readProductionReleaseEvidence(env: Env): Promise<ProductionReleaseEvidence | null> {
  const sha = String(env.APP_VERSION || '').trim();
  if (!/^[0-9a-f]{40}$/i.test(sha)) return null;
  const record = await env.DB.prepare(`SELECT status, payload_json
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
    || evidence.routeCohesionContract !== RELEASE_ROUTE_COHESION_CONTRACT
    || evidence.routeCohesionVerified !== true
    || evidence.renderedVisualContract !== RELEASE_RENDERED_VISUAL_CONTRACT
    || evidence.renderedVisualVerified !== true
    || evidence.dmarcRecord !== '_dmarc.defrag.app'
    || evidence.dmarcVerified !== true
    || typeof evidence.completedAt !== 'string') {
    return null;
  }
  return evidence as ProductionReleaseEvidence;
}
