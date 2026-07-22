import app from '../apps/sovereign-worker/src/index';
import type { Env } from '../apps/sovereign-worker/src/env';

function fakeEnv(): Env {
  const accounts = new Map<string, any>();
  const accountsByEmail = new Map<string, string>();
  const tokens = new Map<string, any>();
  const sessions = new Map<string, any>();
  const people = new Map<string, any>();
  const audits: unknown[] = [];
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return {
    async first() {
      if (sql.includes('SELECT 1 AS ok')) return { ok: 1 };
      if (sql.startsWith('SELECT id FROM accounts WHERE email')) { const id = accountsByEmail.get(args[0] as string); const acct = id ? accounts.get(id) : null; return acct && acct.status !== args[1] ? { id } : null; }
      if (sql.startsWith('SELECT id, status FROM accounts WHERE email')) { const id = accountsByEmail.get(args[0] as string); const acct = id ? accounts.get(id) : null; return acct && acct.status === args[1] ? { id, status: acct.status } : null; }
      if (sql.startsWith('SELECT id, auth_subject')) { const acct = [...accounts.values()].find((item) => item.auth_subject === args[0]); return acct ? { id: acct.id, auth_subject: acct.auth_subject } : null; }
      if (sql.startsWith('SELECT id FROM account_sessions')) { const sess = sessions.get(args[0] as string); if (!sess) return null; return sess.revoked ? null : { id: sess.id }; }
      if (sql.startsWith('SELECT id, account_id')) { const token = tokens.get(args[0] as string); return token && token.type === args[1] ? { id: token.id, account_id: token.accountId, email: token.email, expires_at: token.expiresAt, used_at: token.usedAt } : null; }
      return null;
    },
    async run() {
      if (sql.startsWith('INSERT INTO turnstile_audit_events') || sql.startsWith('INSERT INTO auth_attempts') || sql.startsWith('INSERT INTO email_delivery_log')) audits.push([sql, ...args]);
      if (sql.startsWith('INSERT INTO accounts')) { const acct = { id: args[0], auth_subject: args[1], email: args[2], displayName: args[3], status: args[4] }; accounts.set(args[0] as string, acct); accountsByEmail.set(args[2] as string, args[0] as string); }
      if (sql.startsWith('INSERT INTO persons')) people.set(args[0] as string, { accountId: args[1], role: args[2], name: args[3] });
      if (sql.startsWith('INSERT INTO account_auth_tokens')) tokens.set(args[3] as string, { id: args[0], accountId: args[1], email: args[2], type: args[4], expiresAt: args[5], usedAt: null });
      if (sql.startsWith('UPDATE account_auth_tokens')) { const token = [...tokens.values()].find((item) => item.id === args[0]); if (token) token.usedAt = new Date().toISOString(); }
      if (sql.startsWith('UPDATE accounts SET status')) { const acct = accounts.get(args[1] as string); if (acct) acct.status = args[0]; }
      if (sql.startsWith('INSERT INTO account_sessions')) sessions.set(args[0] as string, { id: args[0], accountId: args[1], hash: args[2], expiresAt: args[3], revoked: false });
      if (sql.startsWith('UPDATE account_sessions SET revoked_at')) { if (String(sql).includes('WHERE account_id')) { for (const sess of sessions.values()) if (sess.accountId === args[0]) sess.revoked = true; } else { const sess = sessions.get(args[0] as string); if (sess) sess.revoked = true; } }
      if (sql.startsWith('INSERT OR REPLACE INTO baseline_onboarding')) audits.push(['baseline', ...args]);
      if (sql.startsWith('UPDATE persons SET display_name')) return { success: true, meta: { changes: 1 } };
      return { success: true, meta: { changes: 1 } };
    },
    async all() { return { results: [] }; }
  }; } }; } } as unknown as D1Database;
  return { APP_ENV: 'test', APP_VERSION: 'auth-smoke', AI_PROVIDER: 'fixture', AI_MODEL: 'fixture', AI_GATEWAY_ID: 'sovereign', OPENAI_API_KEY: '', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', STRIPE_PRICE_SOVEREIGN_PLUS: 'price_test_sovereign_plus', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', DB: db, THREADS: {} as DurableObjectNamespace } as Env;
}

async function post(env: Env, path: string, body: unknown, cookie?: string) {
  const res = await app.fetch(new Request(`https://app.test${path}`, { method: 'POST', headers: { origin: 'https://app.test', 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) }), env);
  const text = await res.text();
  if (res.status >= 400) throw new Error(`${path} failed status=${res.status} body=${text}`);
  return { res, json: text ? JSON.parse(text) : {} };
}

async function main() {
  const env = fakeEnv();
  const signup = await post(env, '/api/v1/auth/signup', { name: 'Release User', email: 'Release@Example.com', termsAccepted: true, privacyAccepted: true, turnstileToken: 'fixture-turnstile-pass' });
  if (!signup.json.fixtureToken) throw new Error('fixture verification token missing');
  const verified = await post(env, '/api/v1/auth/verify', { token: signup.json.fixtureToken });
  const cookie = verified.res.headers.get('set-cookie');
  if (!cookie?.includes('__Host-sovereign_session')) throw new Error('verification did not establish a secure session');
  await post(env, '/api/v1/baseline/onboarding', { displayName: 'Release User', birthDate: '1990-01-01', birthTimeCertainty: 'known', birthLocation: 'Regional fixture only', currentLocationMode: 'city_or_regional' }, cookie);
  await post(env, '/api/v1/auth/login', { email: 'release@example.com', turnstileToken: 'fixture-turnstile-pass' });
  const duplicate = await post(env, '/api/v1/auth/signup', { name: 'Release User', email: 'release@example.com', termsAccepted: true, privacyAccepted: true, turnstileToken: 'fixture-turnstile-pass' });
  if (duplicate.json.emailDelivery !== 'generic-if-account-exists') throw new Error('duplicate signup did not use safe generic response');
  await post(env, '/api/v1/auth/logout-all', {}, cookie);
  let revoked = false;
  try {
    const unauthorized = await app.fetch(new Request('https://app.test/api/v1/you', { headers: { cookie } }), env);
    revoked = unauthorized.status === 401;
  } catch (error) {
    revoked = error instanceof Response && error.status === 401;
  }
  if (!revoked) throw new Error('revoked session expected 401');
  console.log('Auth smoke passed signup=true verification=true baseline_onboarding=true magic_link_request=true revocation=true enumeration_safe=true');
}

main().catch(async (error) => { if (error instanceof Response) { console.error(`Response status=${error.status} body=${await error.text()}`); } else { console.error(error instanceof Error ? error.message : String(error)); } process.exit(1); });
