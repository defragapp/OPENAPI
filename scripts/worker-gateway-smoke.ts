import app from '../apps/sovereign-worker/src/index';
import { createSignedSessionToken } from '../apps/sovereign-worker/src/security/auth';
import type { Env } from '../apps/sovereign-worker/src/env';

function fakeEnv(): Env {
  const accounts = new Map<string, string>();
  const threads = new Map<string, string>();
  const turns = new Map<string, any>();
  const events: unknown[] = [];
  let seq = 0;
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return {
    async first() {
      if (sql.includes('SELECT 1 AS ok')) return { ok: 1 };
      if (sql.startsWith('SELECT id, auth_subject')) { const id = accounts.get(args[0] as string); return id ? { id, auth_subject: args[0] } : null; }
      if (sql.startsWith('SELECT account_id FROM threads')) { const accountId = threads.get(args[0] as string); return accountId ? { account_id: accountId } : null; }
      if (sql.startsWith('SELECT plan')) return null;
      if (sql.includes('INSERT INTO ai_usage_windows')) return { turns_used: 1 };
      if (sql.startsWith('SELECT thread_id')) return turns.get(`${args[0]}:${args[1]}:${args[2]}`) ?? null;
      return null;
    },
    async run() {
      if (sql.startsWith('INSERT INTO accounts')) accounts.set(args[1] as string, args[0] as string);
      if (sql.startsWith('INSERT INTO persons')) return { success: true, meta: { changes: 1 } };
      if (sql.startsWith('INSERT INTO threads')) threads.set(args[0] as string, args[1] as string);
      if (sql.startsWith('INSERT OR IGNORE INTO thread_events')) events.push(args);
      if (sql.startsWith('INSERT OR IGNORE INTO thread_turn_states')) turns.set(`${args[2]}:${args[1]}:${args[3]}`, { thread_id: args[1], account_id: args[2], idempotency_key: args[3], seq: args[4], status: args[5] });
      if (sql.startsWith('UPDATE thread_turn_states')) { const turn = turns.get(`${args[3]}:${args[4]}:${args[5]}`); if (turn) turn.status = args[0]; }
      return { success: true, meta: { changes: 1 } };
    },
    async all() { return { results: [] }; }
  }; } }; } } as unknown as D1Database;
  return {
    APP_ENV: 'test', APP_VERSION: 'worker-gateway-smoke', AI_PROVIDER: 'cloudflare-gateway', AI_MODEL: 'openai/gpt-5.5', AI_GATEWAY_ID: 'sovereign',
    STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', DB: db,
    THREADS: { idFromName: (name: string) => ({ name }) as DurableObjectId, get: () => ({ fetch: async () => Response.json({ sequence: ++seq, duplicate: false }) }) as unknown as DurableObjectStub } as unknown as DurableObjectNamespace,
    AI: { async run(model: string, input: unknown, options: unknown) { if (model !== 'openai/gpt-5.5') throw new Error('invalid model'); const gateway = (options as any)?.gateway; if (gateway?.id !== 'sovereign' || gateway?.skipCache !== true || gateway?.collectLog !== false || gateway?.metadata?.plan !== 'free' || !gateway?.metadata?.account_ref) throw new Error('invalid gateway metadata'); if (JSON.stringify(options).includes('acct_')) throw new Error('raw account id leaked'); if (JSON.stringify(input).match(/birth date|birth time|latitude|longitude|workspace\/SOVV/i)) throw new Error('private model input leaked'); return new ReadableStream<string>({ start(controller) { controller.enqueue('Baseline: fixture tendency.\nCurrent: fixture amplification.\nObserved: nothing confirmed.\nUnknown: actual state remains unknown.'); controller.close(); } }); } }
  };
}

async function main(): Promise<void> {
  const token = await createSignedSessionToken({ sub: 'user:worker-gateway-smoke', exp: Math.floor(Date.now() / 1000) + 60 }, 'secret');
  const res = await app.fetch(new Request('https://app.test/api/v1/threads/t-smoke/messages', { method: 'POST', headers: { authorization: `Bearer ${token}`, origin: 'https://app.test', 'content-type': 'application/json', 'x-idempotency-key': 'smoke-1' }, body: JSON.stringify({ message: 'Show me Today without requiring an incident.', context: { surface: 'Today' } }) }), fakeEnv());
  const text = await res.text();
  if (res.status !== 202) throw new Error(`worker gateway smoke failed status=${res.status}`);
  for (const heading of ['Baseline', 'Current', 'Observed', 'Unknown']) if (!text.includes(heading)) throw new Error(`missing ${heading}`);
  console.log(`Worker Gateway smoke passed status=${res.status} response_chars=${text.length} provider=cloudflare-gateway model=openai/gpt-5.5`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
