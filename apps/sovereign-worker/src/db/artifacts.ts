import type { Env } from '../env';

export type ArtifactType = 'export' | 'archive' | 'report' | 'audio' | 'video' | 'social_image';

export interface ArtifactRecord {
  id: string;
  accountId: string;
  objectKey: string;
  artifactType: ArtifactType;
  status: 'pending' | 'ready' | 'failed' | 'deleted';
}

export function artifactObjectKey(accountId: string, artifactId: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `accounts/${accountId}/artifacts/${artifactId}/${safeName}`;
}

export async function createArtifactRecord(env: Env, input: { accountId: string; artifactType: ArtifactType; filename: string; sourceJobId?: string; contentType?: string }): Promise<ArtifactRecord> {
  const id = `artifact_${crypto.randomUUID()}`;
  const objectKey = artifactObjectKey(input.accountId, id, input.filename);
  await env.DB.prepare('INSERT INTO artifacts (id, account_id, object_key, artifact_type, source_job_id, status, content_type) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, input.accountId, objectKey, input.artifactType, input.sourceJobId ?? null, 'pending', input.contentType ?? null).run();
  return { id, accountId: input.accountId, objectKey, artifactType: input.artifactType, status: 'pending' };
}

export async function requireArtifactOwnership(env: Env, accountId: string, artifactId: string): Promise<ArtifactRecord> {
  const row = await env.DB.prepare('SELECT id, account_id, object_key, artifact_type, status FROM artifacts WHERE id = ? AND account_id = ? AND deleted_at IS NULL')
    .bind(artifactId, accountId).first<{ id: string; account_id: string; object_key: string; artifact_type: ArtifactType; status: ArtifactRecord['status'] }>();
  if (!row) throw new Response('Artifact not found', { status: 404 });
  return { id: row.id, accountId: row.account_id, objectKey: row.object_key, artifactType: row.artifact_type, status: row.status };
}
