import { describe, expect, it } from 'vitest';
import { artifactObjectKey, createArtifactRecord, requireArtifactOwnership } from './artifacts';
import type { Env } from '../env';

function envWithRows() {
  const rows = new Map<string, { id: string; account_id: string; object_key: string; artifact_type: 'export'; status: 'pending' }>();
  const env = {
    DB: {
      prepare(sql: string) {
        return {
          bind(...args: string[]) {
            return {
              async run() {
                const [id, accountId, objectKey, artifactType] = args as [string, string, string, 'export'];
                if (sql.includes('INSERT INTO artifacts')) rows.set(id, { id, account_id: accountId, object_key: objectKey, artifact_type: artifactType, status: 'pending' });
                return { success: true };
              },
              async first() {
                const [id, accountId] = args as [string, string];
                const row = rows.get(id);
                return row?.account_id === accountId ? row : null;
              }
            };
          }
        };
      }
    }
  } as unknown as Env;
  return env;
}

describe('artifact metadata ownership', () => {
  it('scopes R2 object keys under the owning account', () => {
    expect(artifactObjectKey('acct_1', 'artifact_1', '../export.json')).toBe('accounts/acct_1/artifacts/artifact_1/.._export.json');
  });

  it('requires D1 ownership before returning R2 metadata', async () => {
    const env = envWithRows();
    const record = await createArtifactRecord(env, { accountId: 'acct_owner', artifactType: 'export', filename: 'export.json' });
    await expect(requireArtifactOwnership(env, 'acct_owner', record.id)).resolves.toMatchObject({ accountId: 'acct_owner' });
    await expect(requireArtifactOwnership(env, 'acct_other', record.id)).rejects.toBeInstanceOf(Response);
  });
});
