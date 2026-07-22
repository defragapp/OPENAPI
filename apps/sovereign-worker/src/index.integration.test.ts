import { describe, expect, it } from 'vitest';
import app from './index';
import { createSignedSessionToken } from './security/auth';
import type { Env } from './env';

function fakeEnv(options: { plan?: string; features?: string[] } = {}): Env {
  const accounts = new Map<string, string>();
  const threads = new Map<string, { accountId: string; covenantEnabled: number }>();
  const turns = new Map<string, any>();
  const corrections: any[] = [];
  let seq = 0;
  const db = {
    prepare(sql: string) {
      let args: unknown[] = [];
      const statement = {
        bind(...bound: unknown[]) { args = bound; return statement; },
        async first() {
          if (sql.includes('SELECT 1 AS ok')) return { ok: 1 };
          if (sql.startsWith('SELECT id, auth_subject')) { const id = accounts.get(args[0] as string); return id ? { id, auth_subject: args[0] } : null; }
          if (sql.startsWith('SELECT account_id FROM threads')) { const thread = threads.get(args[0] as string); return thread ? { account_id: thread.accountId } : null; }
          if (sql.startsWith('SELECT id, covenant_enabled FROM threads')) { const thread = threads.get(args[0] as string); return thread && thread.accountId === args[1] ? { id: args[0], covenant_enabled: thread.covenantEnabled } : null; }
          if (sql.startsWith('SELECT plan')) return options.plan ? { plan: options.plan, features_json: JSON.stringify(options.features ?? []), as_of: new Date(0).toISOString() } : null;
          if (sql.startsWith('SELECT thread_id')) return turns.get(`${args[0]}:${args[1]}:${args[2]}`) ?? null;
          return null;
        },
        async run() {
          if (sql.startsWith('INSERT INTO accounts')) accounts.set(args[1] as string, args[0] as string);
          if (sql.startsWith('INSERT INTO persons')) return { success: true };
          if (sql.startsWith('INSERT INTO threads')) threads.set(args[0] as string, { accountId: args[1] as string, covenantEnabled: 0 });
          if (sql.startsWith('UPDATE threads SET covenant_enabled')) { const thread = threads.get(args[1] as string); if (thread && thread.accountId === args[2]) thread.covenantEnabled = args[0] as number; }
          if (sql.startsWith('INSERT OR IGNORE INTO thread_events')) return { success: true };
          if (sql.startsWith('INSERT INTO user_corrections')) corrections.push(args);
          if (sql.startsWith('INSERT OR IGNORE INTO thread_turn_states')) turns.set(`${args[2]}:${args[1]}:${args[3]}`, { thread_id: args[1], account_id: args[2], idempotency_key: args[3], seq: args[4], status: args[5] });
          if (sql.startsWith('UPDATE thread_turn_states')) { const turn = turns.get(`${args[3]}:${args[4]}:${args[5]}`); if (turn) turn.status = args[0]; }
          return { success: true };
        }
      };
      return statement;
    }
  } as unknown as D1Database;
  return {
    APP_ENV: 'test', APP_VERSION: 'test', OPENAI_API_KEY: '', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', DB: db,
    THREADS: { idFromName: (name: string) => ({ name }) as DurableObjectId, get: () => ({ fetch: async () => { const userSequence = seq + 1; const assistantSequence = seq + 2; seq = assistantSequence; return Response.json({ sequence: userSequence, userSequence, assistantSequence, duplicate: false }); } }) as unknown as DurableObjectStub } as unknown as DurableObjectNamespace
  };
}

async function authHeader(): Promise<Record<string, string>> {
  return { authorization: `Bearer ${await createSignedSessionToken({ sub: 'user:test', exp: Math.floor(Date.now() / 1000) + 60 }, 'secret')}` };
}

async function safeFetch(request: Request, env: Env): Promise<Response> {
  try {
    return await app.fetch(request, env);
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

describe('authenticated Today and Explore smoke flow', () => {
  it('serves Today without incident input and keeps separation categories', async () => {
    const res = await app.fetch(new Request('https://app.test/api/v1/today', { headers: await authHeader() }), fakeEnv());
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.today.data.separation).toContain('Actual state is unknown unless the user confirms it.');
  });

  it('serves Explore in plain language with collapsed framework details', async () => {
    const res = await app.fetch(new Request('https://app.test/api/v1/explore', { method: 'POST', headers: { ...(await authHeader()), origin: 'https://app.test', 'content-type': 'application/json' }, body: JSON.stringify({ topic: 'communication' }) }), fakeEnv());
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.topic).toBe('communication');
    expect(json.frameworkDetailsDefault).toBe('collapsed');
  });



  it('keeps protected product routes authenticated while allowing operational health and public config', async () => {
    expect((await safeFetch(new Request('https://app.test/health'), fakeEnv())).status).toBe(200);
    expect((await safeFetch(new Request('https://app.test/api/v1/public/config'), fakeEnv())).status).toBe(200);
    expect((await safeFetch(new Request('https://app.test/api/v1/today'), fakeEnv())).status).toBe(401);
    expect((await safeFetch(new Request('https://app.test/api/v1/you'), fakeEnv())).status).toBe(401);
  });

  it('hardens direct Covenant scripture retrieval behind auth, entitlement, owned thread, and enabled context', async () => {
    const headers = await authHeader();
    expect((await safeFetch(new Request('https://app.test/api/v1/covenant/scripture/James%201:5'), fakeEnv())).status).toBe(401);
    expect((await safeFetch(new Request('https://app.test/api/v1/covenant/scripture/James%201:5?threadId=t1', { headers }), fakeEnv())).status).toBe(403);

    const env = fakeEnv({ plan: 'sovereign_plus', features: ['baseline.today', 'baseline.explore', 'covenant.lens'] });
    expect((await safeFetch(new Request('https://app.test/api/v1/covenant/scripture/James%201:5?threadId=t1', { headers }), env)).status).toBe(404);
    const enable = await app.fetch(new Request('https://app.test/api/v1/threads/t1/covenant', { method: 'POST', headers: { ...headers, origin: 'https://app.test', 'content-type': 'application/json' }, body: JSON.stringify({ enabled: true, bibleTranslation: 'WEB', reference: 'James 1:5' }) }), env);
    expect(enable.status).toBe(200);
    const scoped = await safeFetch(new Request('https://app.test/api/v1/covenant/scripture/James%201:5?threadId=t1', { headers }), env);
    expect(scoped.status).toBe(200);
    expect(await scoped.json()).toMatchObject({ threadId: 't1', threadScoped: true });
  });

  it('captures correction feedback and rejects duplicate turns', async () => {
    const env = fakeEnv();
    const headers = { ...(await authHeader()), origin: 'https://app.test', 'content-type': 'application/json' };
    const correction = await app.fetch(new Request('https://app.test/api/v1/threads/t1/corrections', { method: 'POST', headers, body: JSON.stringify({ correction: 'partly' }) }), env);
    expect(correction.status).toBe(200);
    const messageHeaders = { ...headers, 'x-idempotency-key': 'idem-1' };
    const first = await app.fetch(new Request('https://app.test/api/v1/threads/t1/messages', { method: 'POST', headers: messageHeaders, body: JSON.stringify({ message: 'Show me today without an incident.', context: { surface: 'Today' } }) }), env);
    expect(first.status).toBe(202);
    const text = await first.text();
    expect(text).toContain('Development fixture only');
  });
});
