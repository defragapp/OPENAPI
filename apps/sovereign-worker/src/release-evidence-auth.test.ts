import { describe, expect, it } from 'vitest';
import runtime from './runtime-entry';
import type { Env } from './env';

const executionContext = {} as ExecutionContext;
const CORRECT_SECRET = 'release-evidence-secret-value';
const SHA = 'a'.repeat(40);
const EVIDENCE_B64 = Buffer.from(JSON.stringify({ sha: SHA })).toString('base64');

function dbWithEvidence(): { db: Env['DB']; writes: string[] } {
  const writes: string[] = [];
  const db = {
    prepare: (sql: string) => ({
      bind: (...bound: unknown[]) => ({
        run: async () => {
          writes.push(`${sql}|${bound.join('|')}`);
          return { meta: { changes: 0 } };
        }
      })
    })
  } as unknown as Env['DB'];
  return { db, writes };
}

function requestFor(body: Record<string, unknown>, secret?: string, shaHeader?: string): Request {
  return new Request('https://app.defrag.app/internal/release-evidence', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(secret !== undefined ? { 'x-release-secret': secret } : {}),
      ...(shaHeader !== undefined ? { 'x-release-sha': shaHeader } : {})
    },
    body: JSON.stringify(body)
  });
}

const envWithSecret = () => {
  const { db, writes } = dbWithEvidence();
  return { env: { RELEASE_EVIDENCE_SECRET: CORRECT_SECRET, DB: db } as unknown as Env, writes };
};

describe('internal release evidence mutation authentication', () => {
  it('accepts a mutation with the correct secret and writes to the store', async () => {
    const { env, writes } = envWithSecret();
    const response = await runtime.fetch(
      requestFor({ sha: SHA, evidence_b64: EVIDENCE_B64 }, CORRECT_SECRET),
      env,
      executionContext
    );
    expect(response.status).toBe(200);
    expect(writes.some((entry) => entry.includes('INSERT INTO release_evidence') && entry.includes(EVIDENCE_B64))).toBe(true);
  });

  it('rejects a mutation with no secret header', async () => {
    const { env, writes } = envWithSecret();
    const response = await runtime.fetch(
      requestFor({ sha: SHA, evidence_b64: EVIDENCE_B64 }),
      env,
      executionContext
    );
    expect(response.status).toBe(401);
    expect(writes.length).toBe(0);
  });

  it('rejects a mutation with an incorrect secret', async () => {
    const { env, writes } = envWithSecret();
    const response = await runtime.fetch(
      requestFor({ sha: SHA, evidence_b64: EVIDENCE_B64 }, 'wrong-secret'),
      env,
      executionContext
    );
    expect(response.status).toBe(401);
    expect(writes.length).toBe(0);
  });

  it('rejects a mutation when only the public deployed SHA is supplied', async () => {
    const { db, writes } = dbWithEvidence();
    const response = await runtime.fetch(
      requestFor({ sha: SHA, evidence_b64: EVIDENCE_B64 }, undefined, SHA),
      {
        RELEASE_EVIDENCE_SECRET: CORRECT_SECRET,
        APP_VERSION: SHA,
        DB: db
      } as unknown as Env,
      executionContext
    );
    expect(response.status).toBe(401);
    expect(writes.length).toBe(0);
  });

  it('rejects all mutations when the worker has no release secret configured', async () => {
    const { db, writes } = dbWithEvidence();
    const response = await runtime.fetch(
      requestFor({ sha: SHA, evidence_b64: EVIDENCE_B64 }, CORRECT_SECRET),
      { APP_VERSION: SHA, DB: db } as unknown as Env,
      executionContext
    );
    expect(response.status).toBe(401);
    expect(writes.length).toBe(0);
  });
});
