import { readFileSync } from 'node:fs';
import app from '../apps/sovereign-worker/src/index';
import { createSignedSessionToken } from '../apps/sovereign-worker/src/security/auth';
import type { Env } from '../apps/sovereign-worker/src/env';

function fakeEnv(): Env {
  const accounts = new Map<string, string>();
  const people = new Map<string, { accountId: string; role: string; displayName: string; source: string; consentStatus: string; baselineStatus: string }>();
  const systems = new Map<string, { accountId: string; type: string; name: string; metadata: string }>();
  const understandings = new Map<string, { accountId: string; threadId?: string | null; kind: string; body: string }>();
  const deletionJobs = new Map<string, { accountId: string; status: string }>();
  const entitlementCache = new Map<string, { plan: string; features: string }>();
  const threads = new Map<string, string>();

  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first() {
              if (sql.includes('SELECT 1 AS ok')) return { ok: 1 };
              if (sql.startsWith('SELECT id, auth_subject')) {
                const id = accounts.get(args[0] as string);
                return id ? { id, auth_subject: args[0] } : null;
              }
              if (sql.startsWith('SELECT auth_subject FROM accounts')) {
                return [...accounts.values()].includes(args[0] as string) ? { auth_subject: 'user:product-smoke' } : null;
              }
              if (sql.startsWith('SELECT id FROM persons')) {
                const person = people.get(args[0] as string);
                return person?.accountId === args[1] ? { id: args[0] } : null;
              }
              if (sql.startsWith('SELECT cg.id')) return null;
              if (sql.startsWith('SELECT MAX(version)')) return { version: 0 };
              if (sql.startsWith('SELECT id FROM systems')) {
                const system = systems.get(args[0] as string);
                return system?.accountId === args[1] ? { id: args[0] } : null;
              }
              if (sql.startsWith('SELECT body_json FROM saved_understandings')) {
                const item = understandings.get(args[0] as string);
                return item?.accountId === args[1] ? { body_json: item.body } : null;
              }
              if (sql.startsWith('SELECT plan')) {
                const entitlement = entitlementCache.get(args[0] as string);
                return entitlement ? { plan: entitlement.plan, features_json: entitlement.features, as_of: '2026-01-01' } : null;
              }
              if (sql.startsWith('SELECT account_id FROM threads')) {
                const accountId = threads.get(args[0] as string);
                return accountId ? { account_id: accountId } : null;
              }
              if (sql.startsWith('SELECT turns_used FROM ai_usage_windows')) return null;
              if (sql.startsWith('SELECT id, status FROM stripe_subscriptions')) return null;
              if (sql.startsWith('SELECT stripe_customer_id FROM stripe_customers')) return null;
              if (sql.startsWith('SELECT covenant_enabled FROM threads')) return { covenant_enabled: 0 };
              return null;
            },
            async run() {
              if (sql.startsWith('INSERT INTO accounts')) accounts.set(args[1] as string, args[0] as string);
              if (sql.startsWith('INSERT INTO persons')) {
                people.set(args[0] as string, {
                  accountId: args[1] as string,
                  role: args[2] as string,
                  displayName: args[3] as string,
                  source: args[4] as string,
                  consentStatus: args[5] as string,
                  baselineStatus: args[6] as string
                });
              }
              if (sql.startsWith('UPDATE consent_grants')) return { success: true, meta: { changes: 0 } };
              if (sql.startsWith('INSERT INTO consent_versions')) return { success: true, meta: { changes: 1 } };
              if (sql.startsWith('UPDATE persons')) {
                const person = people.get(args[1] as string);
                if (person) person.consentStatus = args[0] as string;
              }
              if (sql.startsWith('INSERT INTO systems')) systems.set(args[0] as string, { accountId: args[1] as string, type: args[2] as string, name: args[3] as string, metadata: args[4] as string });
              if (sql.startsWith('INSERT INTO saved_understandings')) understandings.set(args[0] as string, { accountId: args[1] as string, threadId: args[2] as string | null, kind: args[3] as string, body: args[4] as string });
              if (sql.startsWith('UPDATE saved_understandings')) {
                const item = understandings.get(args[1] as string);
                if (item) item.body = args[0] as string;
              }
              if (sql.startsWith('DELETE FROM saved_understandings')) understandings.delete(args[0] as string);
              if (sql.startsWith('INSERT INTO deletion_jobs')) deletionJobs.set(args[0] as string, { accountId: args[1] as string, status: args[2] as string });
              if (sql.startsWith('UPDATE deletion_jobs')) {
                const job = deletionJobs.get(args[1] as string);
                if (job && job.accountId === args[2] && job.status === args[3]) job.status = args[0] as string;
              }
              if (sql.startsWith('INSERT INTO entitlement_cache')) entitlementCache.set(args[0] as string, { plan: args[1] as string, features: args[2] as string });
              if (sql.startsWith('INSERT INTO threads')) threads.set(args[0] as string, args[1] as string);
              return { success: true, meta: { changes: 1 } };
            },
            async all() {
              if (sql.startsWith('SELECT p.id, p.role')) {
                return {
                  results: [...people.entries()]
                    .filter(([, person]) => person.accountId === args[0])
                    .map(([id, person]) => ({
                      id,
                      role: person.role,
                      display_name: person.displayName,
                      consent_status: person.consentStatus,
                      baseline_status: person.baselineStatus,
                      effective_baseline_status: person.baselineStatus,
                      source_of_truth: person.source,
                      bound_account_id: null,
                      invitation_status: null,
                      invitation_expires_at: null
                    }))
                };
              }
              if (sql.startsWith('SELECT id, system_type')) {
                return {
                  results: [...systems.entries()]
                    .filter(([, system]) => system.accountId === args[0])
                    .map(([id, system]) => ({ id, system_type: system.type, name: system.name, metadata_json: system.metadata }))
                };
              }
              if (sql.startsWith('SELECT id, thread_id')) {
                return {
                  results: [...understandings.entries()]
                    .filter(([, item]) => item.accountId === args[0])
                    .map(([id, item]) => ({ id, thread_id: item.threadId, kind: item.kind, body_json: item.body, created_at: '2026-01-01', updated_at: '2026-01-01' }))
                };
              }
              return { results: [] };
            }
          };
        }
      };
    }
  } as unknown as D1Database;

  return {
    APP_ENV: 'test',
    APP_VERSION: 'product-smoke',
    AI_PROVIDER: 'cloudflare-gateway',
    AI_MODEL: '@cf/zai-org/glm-4.7-flash',
    AI_GATEWAY_ID: 'sovereign-ai-gateway',
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY: 'price_test_sovereign_monthly',
    STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL: 'price_test_sovereign_annual',
    SOVV_INTERNAL_BASE_URL: '',
    SOVV_INTERNAL_AUTH_TOKEN: '',
    SESSION_SIGNING_SECRET: 'secret',
    DB: db,
    THREADS: {} as DurableObjectNamespace
  } as Env;
}

async function request(env: Env, token: string, path: string, init: RequestInit = {}, expected = 200) {
  let response: Response;
  try {
    response = await app.fetch(new Request(`https://app.test${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        origin: 'https://app.test',
        'content-type': 'application/json',
        'x-idempotency-key': crypto.randomUUID(),
        ...(init.headers ?? {})
      }
    }), env);
  } catch (error) {
    if (!(error instanceof Response)) throw error;
    response = error;
  }
  if (response.status !== expected) throw new Error(`${path} expected ${expected}, got ${response.status}: ${await response.text()}`);
  return response;
}

async function json(env: Env, token: string, path: string, init: RequestInit = {}, expected = 200) {
  return request(env, token, path, init, expected).then((response) => response.json() as Promise<any>);
}

async function main() {
  const runtime = readFileSync('apps/sovereign-worker/src/runtime-entry.ts', 'utf8');
  const privacyRights = readFileSync('apps/sovereign-worker/src/privacy-rights.ts', 'utf8');
  if (!runtime.includes("url.pathname === '/api/v1/account/export'") || !privacyRights.includes('generatedOnDemand: true')) {
    throw new Error('on-demand private export contract is not wired into production runtime');
  }
  if (privacyRights.includes('env.R2') || privacyRights.includes('r2_key')) {
    throw new Error('private export unexpectedly depends on retained R2 artifact storage');
  }

  const env = fakeEnv();
  const token = await createSignedSessionToken({ sub: 'user:product-smoke', exp: Math.floor(Date.now() / 1000) + 60 }, 'secret');

  const checkout = await json(env, token, '/api/v1/billing/checkout', { method: 'POST', body: JSON.stringify({ interval: 'monthly' }) }, 201);
  if (!checkout.checkout?.url?.includes('test-billing')) throw new Error('test Checkout handoff was not returned');
  const portal = await json(env, token, '/api/v1/billing/portal', { method: 'POST', body: '{}' }, 201);
  if (!portal.portal?.url?.includes('test-billing')) throw new Error('test Portal handoff was not returned');

  const projection = await json(env, token, '/api/v1/billing/stripe-test-event', {
    method: 'POST',
    body: JSON.stringify({ id: 'evt_product_smoke', priceId: 'price_test_sovereign_annual', status: 'active' })
  });
  if (projection.projection?.plan !== 'sovereign_plus') throw new Error('test Stripe projection did not activate Sovereign+');
  const billing = await json(env, token, '/api/v1/billing/entitlements');
  if (billing.effective?.plan !== 'sovereign_plus') throw new Error('Sovereign+ entitlement was not readable');

  const person = (await json(env, token, '/api/v1/people', {
    method: 'POST',
    body: JSON.stringify({ displayName: 'Avery', role: 'friend', metadata: { relationshipType: 'friend' } })
  }, 201)).person;
  const people = await json(env, token, '/api/v1/people');
  if (!people.people?.some((item: { id: string }) => item.id === person.id)) throw new Error('paid People record was not readable');

  await request(env, token, `/api/v1/people/${person.id}/consent/pair.compare`, {
    method: 'PUT',
    body: JSON.stringify({ granted: true })
  }, 403);
  await request(env, token, `/api/v1/people/${person.id}/compare`, { method: 'POST' }, 403);

  const system = (await json(env, token, '/api/v1/systems', {
    method: 'POST',
    body: JSON.stringify({ name: 'Family care', systemType: 'family' })
  }, 201)).system;
  const systems = await json(env, token, '/api/v1/systems');
  if (!systems.systems?.some((item: { id: string }) => item.id === system.id)) throw new Error('paid System record was not readable');
  const alignment = await json(env, token, `/api/v1/systems/${system.id}/alignment`);
  if (!alignment.analysis?.interactionAlignment) throw new Error('system alignment was not returned');

  const saved = (await json(env, token, '/api/v1/library', {
    method: 'POST',
    body: JSON.stringify({ title: 'Boundary insight', summary: 'A user-approved summary with uncertainty preserved.' })
  }, 201)).saved;
  await json(env, token, `/api/v1/library/${saved.id}`, { method: 'PATCH', body: JSON.stringify({ title: 'Updated boundary insight' }) });
  await json(env, token, '/api/v1/library');
  await json(env, token, `/api/v1/library/${saved.id}`, { method: 'DELETE' });

  await request(env, token, '/api/v1/export-jobs', { method: 'POST' }, 404);
  const deletion = (await json(env, token, '/api/v1/deletion-jobs', { method: 'POST', body: JSON.stringify({ approved: true }) }, 202)).deletionJob;
  await json(env, token, `/api/v1/deletion-jobs/${deletion.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'cancel' }) });

  const covenant = await json(env, token, '/api/v1/threads/product-smoke/covenant', {
    method: 'POST',
    body: JSON.stringify({ enabled: true, bibleTranslation: 'WEB', reference: 'James 1:5', subject: 'a decision' })
  });
  if (!covenant.scriptureSeparateFromInterpretation || !covenant.lens?.scripture?.citation || !covenant.lens?.boundary) throw new Error('Covenant smoke failed');

  console.log('Product smoke passed billing=stripe-projected paid_surfaces=people,systems,library,covenant private_export=on-demand-no-artifact legacy_export_jobs=disabled owner_granted_consent=blocked');
}

main().catch(async (error) => {
  if (error instanceof Response) {
    console.error(`Product smoke received HTTP ${error.status}: ${await error.text()}`);
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exit(1);
});
