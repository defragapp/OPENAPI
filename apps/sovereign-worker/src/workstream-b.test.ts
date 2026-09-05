import { describe, expect, it } from 'vitest';
import app from './entry';
import { createSignedSessionToken } from './security/auth';
import type { Env } from './env';
import { persistBaseline, getBaselineStatus } from './baseline';

const executionContext = {
  waitUntil: (promise: Promise<unknown>) => promise,
  passThroughOnException: () => undefined
} as unknown as ExecutionContext;

function createMockKV() {
  const store = new Map<string, string>();
  return {
    async get(key: string) {
      return store.get(key) ?? null;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
    async delete(key: string) {
      store.delete(key);
    },
    store
  };
}

function fakeEnv() {
  const kv = createMockKV();
  const dbRows = new Map<string, any>();
  const facetProfiles = new Map<string, any>();
  const threads = new Map<string, string>();
  const turns = new Map<string, any>();
  const coordinatedTurns = new Map<string, number>();
  let seq = 0;

  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first() {
              if (sql.includes('SELECT 1 AS ok')) return { ok: 1 };
              if (sql.startsWith('SELECT onboarding_completed_at')) return { onboarding_completed_at: '2026-01-01', plan_intent: 'free' };
              if (sql.includes('FROM baseline_onboarding')) {
                const accountId = args[0] as string;
                return dbRows.get(`baseline:${accountId}`) ?? null;
              }
              if (sql.includes('FROM baseline_facet_profiles')) {
                const accountId = args[0] as string;
                return facetProfiles.get(`profile:${accountId}`) ?? null;
              }
              if (sql.startsWith('SELECT id, auth_subject')) {
                return { id: args[0], auth_subject: `email:${args[0]}` };
              }
              if (sql.startsWith('SELECT account_id FROM threads')) {
                const id = threads.get(args[0] as string);
                return id ? { account_id: id } : null;
              }
              if (sql.includes('FROM threads WHERE id = ?')) {
                return { id: args[0], account_id: args[1], context_kind: 'personal', covenant_enabled: 0 };
              }
              if (sql.startsWith('SELECT thread_id')) {
                return turns.get(`${args[0]}:${args[1]}:${args[2]}`) ?? null;
              }
              if (sql.startsWith('SELECT covenant_enabled FROM threads')) {
                return { covenant_enabled: 0 };
              }
              return null;
            },
            async run() {
              if (sql.includes('INSERT OR REPLACE INTO baseline_onboarding')) {
                const accountId = args[0] as string;
                dbRows.set(`baseline:${accountId}`, {
                  status: args[6],
                  uncertainty: args[7],
                  reduced_context_json: args[3],
                  provenance_json: args[5],
                  computation_version: args[4],
                  last_computed_at: new Date().toISOString(),
                  provider_status: args[8]
                });
              }
              if (sql.includes('INSERT OR REPLACE INTO baseline_facet_profiles')) {
                const accountId = args[0] as string;
                facetProfiles.set(`profile:${accountId}`, {
                  input_hash: args[1],
                  calculation_version: args[2],
                  facet_contract_version: args[3],
                  model_version: args[4],
                  profile_json: args[5]
                });
              }
              if (sql.startsWith('INSERT INTO threads')) threads.set(args[0] as string, args[1] as string);
              if (sql.startsWith('INSERT OR IGNORE INTO thread_turn_states')) {
                turns.set(`${args[2]}:${args[1]}:${args[3]}`, {
                  thread_id: args[1],
                  account_id: args[2],
                  idempotency_key: args[3],
                  seq: args[4],
                  status: args[5]
                });
              }
              if (sql.startsWith('UPDATE thread_turn_states')) {
                const turn = turns.get(`${args[3]}:${args[4]}:${args[5]}`);
                if (turn) turn.status = args[0];
              }
              return { success: true };
            },
            async all() {
              return { results: [] };
            }
          };
        }
      };
    }
  } as unknown as D1Database;

  return {
    APP_ENV: 'development',
    APP_VERSION: 'test',
    SESSION_SIGNING_SECRET: 'secret',
    STRIPE_SECRET_KEY: 'sk_test',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
    BASELINE_HORIZONS_URL: 'https://ssd.jpl.nasa.gov/api/horizons.api',
    DB: db,
    KV: kv as any,
    THREADS: {
      idFromName: (name: string) => ({ name }) as DurableObjectId,
      get: () => ({
        fetch: async (_input: RequestInfo | URL, init?: RequestInit) => {
          const payload = JSON.parse(String(init?.body ?? '{}')) as { idempotencyKey?: string };
          const key = payload.idempotencyKey ?? '';
          const existing = coordinatedTurns.get(key);
          if (existing) return Response.json({ sequence: existing, duplicate: true });
          const sequence = ++seq;
          coordinatedTurns.set(key, sequence);
          return Response.json({ sequence, duplicate: false });
        }
      }) as unknown as DurableObjectStub
    } as unknown as DurableObjectNamespace
  } as Env & { KV: ReturnType<typeof createMockKV> };
}

async function authHeader(sub = 'usr_workstream_b'): Promise<Record<string, string>> {
  return {
    authorization: `Bearer ${await createSignedSessionToken({ sub, exp: Math.floor(Date.now() / 1000) + 3600 }, 'secret')}`
  };
}

describe('WORKSTREAM B Verification', () => {
  it('1. Intake baseline request -> payload validation -> save to D1 & KV baseline:${userId}:latest', async () => {
    const env = fakeEnv();
    const userId = 'usr_workstream_b';
    const headers = { ...(await authHeader(userId)), origin: 'https://app.test', 'content-type': 'application/json' };

    // Payload validation rejection (invalid birthDate)
    const invalidReq = new Request('https://app.test/api/v1/baseline/onboarding', {
      method: 'POST',
      headers,
      body: JSON.stringify({ birthDate: 'invalid-date', birthplace: 'Austin, TX', birthTimezone: 'America/Chicago' })
    });
    const invalidRes = await app.fetch(invalidReq, env, executionContext);
    expect(invalidRes.status).toBe(400);

    // Valid onboarding request
    const validReq = new Request('https://app.test/api/v1/baseline/onboarding', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthTimeCertainty: 'exact',
        birthplace: 'Austin, TX',
        birthTimezone: 'America/Chicago'
      })
    });
    const validRes = await app.fetch(validReq, env, executionContext);
    expect([201, 202]).toContain(validRes.status);

    // Check that KV has baseline:${userId}:latest saved
    const kvData = await env.KV.get(`baseline:${userId}:latest`);
    expect(kvData).not.toBeNull();
    const parsedKV = JSON.parse(kvData!);
    expect(parsedKV).toBeDefined();
  });

  it('2. Reads baseline from KV / D1 for authenticated user status', async () => {
    const env = fakeEnv();
    const userId = 'usr_workstream_b';
    
    // Seed KV directly
    await env.KV.put(`baseline:${userId}:latest`, JSON.stringify({
      status: 'completed',
      ready: true,
      readinessState: 'ready',
      uncertainty: 'low'
    }));

    const status = await getBaselineStatus(env, userId);
    expect(status.ready).toBe(true);
    expect(status.status).toBe('completed');
  });

  it('3. Ensures chat response streams reliably without hanging or socket errors', async () => {
    const env = fakeEnv();
    const userId = 'usr_workstream_b';
    const headers = { ...(await authHeader(userId)), origin: 'https://app.test', 'content-type': 'application/json', 'x-idempotency-key': 'idem-b-1' };

    // Persist baseline
    await persistBaseline(env, userId, {
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthTimeCertainty: 'exact',
      birthplace: 'Austin, TX',
      birthTimezone: 'America/Chicago'
    });

    const req = new Request('https://app.test/api/v1/threads/t_wsb/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: 'What is my baseline orientation?', context: { surface: 'Today' } })
    });

    const res = await app.fetch(req, env, executionContext);
    expect(res.status).toBe(202);
    expect(res.headers.get('content-type')).toContain('text/plain');

    // Read the stream completely
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(0);
  });
});
