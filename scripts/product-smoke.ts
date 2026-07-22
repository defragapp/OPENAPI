import app from '../apps/sovereign-worker/src/index';
import { createSignedSessionToken } from '../apps/sovereign-worker/src/security/auth';
import type { Env } from '../apps/sovereign-worker/src/env';

function fakeEnv(): Env {
  const accounts = new Map<string, string>();
  const people = new Map<string, { accountId: string; role: string; displayName: string; source: string; consentStatus: string; baselineStatus: string }>();
  const invitations = new Map<string, { accountId: string; status: string }>();
  const consent = new Set<string>();
  const consentVersions = new Map<string, number>();
  const systems = new Map<string, { accountId: string; type: string; name: string; metadata: string }>();
  const understandings = new Map<string, { accountId: string; threadId?: string | null; kind: string; body: string }>();
  const deletionJobs = new Map<string, { accountId: string; status: string }>();
  const entitlementCache = new Map<string, { plan: string; features: string }>();
  const threads = new Map<string, string>();
  let seq = 0;
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return {
    async first() {
      if (sql.includes('SELECT 1 AS ok')) return { ok: 1 };
      if (sql.startsWith('SELECT id, auth_subject')) { const id = accounts.get(args[0] as string); return id ? { id, auth_subject: args[0] } : null; }
      if (sql.startsWith('SELECT id FROM persons')) { const person = people.get(args[0] as string); return person?.accountId === args[1] ? { id: args[0] } : null; }
      if (sql.startsWith('SELECT cg.id')) return consent.has(`${args[1]}:${args[2]}`) ? { id: 'consent_active' } : null;
      if (sql.startsWith('SELECT MAX(version)')) return { version: consentVersions.get(`${args[0]}:${args[1]}`) ?? 0 };
      if (sql.startsWith('SELECT id FROM systems')) { const system = systems.get(args[0] as string); return system?.accountId === args[1] ? { id: args[0] } : null; }
      if (sql.startsWith('SELECT body_json FROM saved_understandings')) { const item = understandings.get(args[0] as string); return item?.accountId === args[1] ? { body_json: item.body } : null; }
      if (sql.startsWith('SELECT plan')) { const entitlement = entitlementCache.get(args[0] as string); return entitlement ? { plan: entitlement.plan, features_json: entitlement.features, as_of: '2026-01-01' } : null; }
      if (sql.startsWith('SELECT account_id FROM threads')) { const accountId = threads.get(args[0] as string); return accountId ? { account_id: accountId } : null; }
      return null;
    },
    async run() {
      if (sql.startsWith('INSERT INTO accounts')) accounts.set(args[1] as string, args[0] as string);
      if (sql.startsWith('INSERT INTO persons')) people.set(args[0] as string, { accountId: args[1] as string, role: args[2] as string, displayName: args[3] as string, source: args[4] as string, consentStatus: args[5] as string, baselineStatus: args[6] as string });
      if (sql.startsWith('INSERT INTO invitations')) invitations.set(args[0] as string, { accountId: args[1] as string, status: args[3] as string });
      if (sql.startsWith('UPDATE invitations')) { const invite = invitations.get(args[1] as string); if (invite) invite.status = args[0] as string; }
      if (sql.startsWith('UPDATE consent_grants')) consent.delete(`${args[0]}:${args[1]}`);
      if (sql.startsWith('INSERT INTO consent_grants')) consent.add(`${args[1]}:${args[2]}`);
      if (sql.startsWith('INSERT INTO consent_versions')) consentVersions.set(`${args[1]}:${args[2]}`, args[3] as number);
      if (sql.startsWith('UPDATE persons')) { const person = people.get(args[1] as string); if (person) person.consentStatus = args[0] as string; }
      if (sql.startsWith('INSERT INTO systems')) systems.set(args[0] as string, { accountId: args[1] as string, type: args[2] as string, name: args[3] as string, metadata: args[4] as string });
      if (sql.startsWith('INSERT OR REPLACE INTO system_memberships')) return { success: true, meta: { changes: 1 } };
      if (sql.startsWith('INSERT INTO saved_understandings')) understandings.set(args[0] as string, { accountId: args[1] as string, threadId: args[2] as string | null, kind: args[3] as string, body: args[4] as string });
      if (sql.startsWith('UPDATE saved_understandings')) { const item = understandings.get(args[1] as string); if (item) item.body = args[0] as string; }
      if (sql.startsWith('DELETE FROM saved_understandings')) understandings.delete(args[0] as string);
      if (sql.startsWith('INSERT INTO export_jobs')) return { success: true, meta: { changes: 1 } };
      if (sql.startsWith('INSERT INTO deletion_jobs')) deletionJobs.set(args[0] as string, { accountId: args[1] as string, status: args[2] as string });
      if (sql.startsWith('UPDATE deletion_jobs')) { const job = deletionJobs.get(args[1] as string); if (job && job.accountId === args[2] && job.status === args[3]) job.status = args[0] as string; }
      if (sql.startsWith('INSERT OR IGNORE INTO webhook_events') || sql.startsWith('INSERT OR REPLACE INTO stripe_subscriptions')) return { success: true, meta: { changes: 1 } };
      if (sql.startsWith('INSERT OR REPLACE INTO entitlement_cache')) entitlementCache.set(args[0] as string, { plan: args[1] as string, features: args[2] as string });
      if (sql.startsWith('INSERT INTO threads')) threads.set(args[0] as string, args[1] as string);
      if (sql.startsWith('INSERT OR IGNORE INTO thread_events')) return { success: true, meta: { changes: 1 } };
      return { success: true, meta: { changes: 1 } };
    },
    async all() {
      if (sql.startsWith('SELECT id, role')) return { results: [...people.entries()].filter(([, p]) => p.accountId === args[0]).map(([id, p]) => ({ id, role: p.role, display_name: p.displayName, consent_status: p.consentStatus, baseline_status: p.baselineStatus, source_of_truth: p.source })) };
      if (sql.startsWith('SELECT id, system_type')) return { results: [...systems.entries()].filter(([, s]) => s.accountId === args[0]).map(([id, s]) => ({ id, system_type: s.type, name: s.name, metadata_json: s.metadata })) };
      if (sql.startsWith('SELECT id, thread_id')) return { results: [...understandings.entries()].filter(([, u]) => u.accountId === args[0]).map(([id, u]) => ({ id, thread_id: u.threadId, kind: u.kind, body_json: u.body, created_at: '2026-01-01', updated_at: '2026-01-01' })) };
      return { results: [] };
    }
  }; } }; } } as unknown as D1Database;
  return { APP_ENV: 'test', APP_VERSION: 'product-smoke', AI_PROVIDER: 'fixture', AI_MODEL: 'fixture', AI_GATEWAY_ID: 'sovereign', OPENAI_API_KEY: '', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', STRIPE_PRICE_SOVEREIGN_PLUS: 'price_test_sovereign_plus', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', DB: db, THREADS: { idFromName: (name: string) => ({ name }) as DurableObjectId, get: () => ({ fetch: async () => Response.json({ sequence: ++seq, duplicate: false }) }) as unknown as DurableObjectStub } as unknown as DurableObjectNamespace } as Env;
}

async function request(env: Env, token: string, path: string, init: RequestInit = {}) {
  const res = await app.fetch(new Request(`https://app.test${path}`, { ...init, headers: { authorization: `Bearer ${token}`, origin: 'https://app.test', 'content-type': 'application/json', ...(init.headers ?? {}) } }), env);
  if (res.status >= 400) throw new Error(`${path} failed status=${res.status} body=${await res.text()}`);
  return res.json() as Promise<any>;
}

async function main() {
  const env = fakeEnv();
  const token = await createSignedSessionToken({ sub: 'user:product-smoke', exp: Math.floor(Date.now() / 1000) + 60 }, 'secret');
  const person = (await request(env, token, '/api/v1/people', { method: 'POST', body: JSON.stringify({ displayName: 'Avery', role: 'friend', metadata: { relationshipType: 'friend' } }) })).person;
  await request(env, token, `/api/v1/people/${person.id}/invitations`, { method: 'POST' });
  await request(env, token, `/api/v1/people/${person.id}/consent/pair.compare`, { method: 'PUT', body: JSON.stringify({ granted: true }) });
  await request(env, token, `/api/v1/people/${person.id}/consent/trait.display`, { method: 'PUT', body: JSON.stringify({ granted: true }) });
  await request(env, token, `/api/v1/people/${person.id}/consent/system.include`, { method: 'PUT', body: JSON.stringify({ granted: true }) });
  await request(env, token, `/api/v1/people/${person.id}/compare`, { method: 'POST' });
  const system = (await request(env, token, '/api/v1/systems', { method: 'POST', body: JSON.stringify({ name: 'Family care', systemType: 'family' }) })).system;
  await request(env, token, `/api/v1/systems/${system.id}/members`, { method: 'POST', body: JSON.stringify({ personId: person.id, metadata: { formalRole: 'sibling', responsibility: 'shared check-ins' } }) });
  await request(env, token, `/api/v1/systems/${system.id}/alignment`);
  const saved = (await request(env, token, '/api/v1/library', { method: 'POST', body: JSON.stringify({ title: 'Boundary insight', summary: 'A user-approved summary with uncertainty preserved.', links: { personId: person.id } }) })).saved;
  await request(env, token, `/api/v1/library/${saved.id}`, { method: 'PATCH', body: JSON.stringify({ title: 'Updated boundary insight' }) });
  await request(env, token, '/api/v1/export-jobs', { method: 'POST' });
  const deletion = (await request(env, token, '/api/v1/deletion-jobs', { method: 'POST' })).deletionJob;
  await request(env, token, `/api/v1/deletion-jobs/${deletion.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'cancel' }) });
  await request(env, token, '/api/v1/billing/checkout', { method: 'POST', body: JSON.stringify({ plan: 'sovereign_plus', idempotencyKey: 'product-smoke' }) });
  await request(env, token, '/api/v1/billing/portal', { method: 'POST' });
  await request(env, token, '/api/v1/billing/stripe-fixture-event', { method: 'POST', body: JSON.stringify({ id: 'evt_product_smoke', priceId: 'price_test_sovereign_plus' }) });
  const covenant = await request(env, token, '/api/v1/threads/product-smoke/covenant', { method: 'POST', body: JSON.stringify({ enabled: true, bibleTranslation: 'WEB', reference: 'James 1:5', subject: 'a decision' }) });
  if (!covenant.scriptureSeparateFromInterpretation || !covenant.lens.passage.citation) throw new Error('covenant smoke failed');
  console.log('Product smoke passed surfaces=people,systems,library,you,billing,covenant consent_gated=true fixtures_only=true');
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
