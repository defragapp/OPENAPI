import { requestMagicLink, redeemMagicLink } from '../apps/sovereign-worker/src/auth-public';
import { requireAuth } from '../apps/sovereign-worker/src/security/auth';
import type { Env } from '../apps/sovereign-worker/src/env';

function fakeEnv(): Env & { emails: string[] } {
  const accounts = new Map<string, { id: string; subject: string }>();
  const links = new Map<string, any>();
  const sessions = new Map<string, any>();
  const emails: string[] = [];
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return {
    async first() {
      if (sql.includes('FROM auth_magic_links WHERE email_normalized')) return null;
      if (sql.includes('FROM auth_magic_links WHERE token_hash')) return [...links.values()].find((l) => l.token_hash === args[0]) ?? null;
      if (sql.startsWith('SELECT id FROM accounts')) return accounts.get(args[0] as string) ?? null;
      if (sql.startsWith('SELECT id, auth_subject')) return accounts.get(args[0] as string) ?? null;
      if (sql.startsWith('SELECT revoked_at')) return sessions.get(args[0] as string) ?? null;
      return null;
    },
    async run() {
      if (sql.startsWith('INSERT INTO auth_magic_links')) links.set(args[0] as string, { id: args[0], email_normalized: args[1], account_id: args[2], purpose: args[3], token_hash: args[4], name: args[5], expires_at: new Date(Date.now() + 900000).toISOString(), used_at: null });
      if (sql.startsWith('INSERT INTO accounts')) accounts.set(args[1] as string, { id: args[0] as string, subject: args[1] as string });
      if (sql.startsWith('UPDATE auth_magic_links')) { const l = links.get(args[1] as string); if (l) { l.used_at = new Date().toISOString(); l.account_id = args[0]; } }
      if (sql.startsWith('INSERT INTO auth_sessions')) sessions.set(args[0] as string, { revoked_at: null, expires_at: new Date(Date.now() + 86400000).toISOString() });
      if (sql.startsWith('UPDATE auth_sessions SET last_seen_at')) return { success: true, meta: { changes: 1 } };
      return { success: true, meta: { changes: 1 } };
    }, async all() { return { results: [] }; }
  }; } }; } } as unknown as D1Database;
  const kv = { put: async (_key: string, value: string) => { emails.push(value); } } as unknown as KVNamespace;
  return { APP_ENV: 'test', APP_VERSION: 'auth-smoke', DB: db, KV: kv, THREADS: {} as DurableObjectNamespace, STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', emails } as Env & { emails: string[] };
}

async function main() {
  const env = fakeEnv();
  const signup = await requestMagicLink(new Request('https://app.test/api/v1/auth/signup', { method: 'POST', headers: { origin: 'https://app.test' }, body: JSON.stringify({ email: 'USER@Example.COM', name: 'User', termsAccepted: true, turnstileToken: 'test-turnstile-pass' }) }), env);
  if (signup.status !== 200 || env.emails.length !== 1) throw new Error('signup magic link not sent');
  const emailText = JSON.parse(env.emails[0]!).text as string;
  const token = decodeURIComponent(emailText.match(/token=([^\s]+)/)?.[1] ?? '');
  if (!token) throw new Error('test email did not capture token');
  const redeemed = await redeemMagicLink(new Request(`https://app.test/api/v1/auth/redeem?token=${token}`), env);
  if (redeemed.status !== 200 || !redeemed.headers.get('set-cookie')?.includes('HttpOnly')) throw new Error(`redeem did not create secure cookie status=${redeemed.status} body=${await redeemed.text()} cookie=${redeemed.headers.get('set-cookie')}`);
  const cookie = redeemed.headers.get('set-cookie')!.split(';')[0]!;
  const auth = await requireAuth(new Request('https://app.test/api/v1/you', { headers: { cookie } }), env);
  if (!auth.accountId) throw new Error('session did not resolve');
  const reused = await redeemMagicLink(new Request(`https://app.test/api/v1/auth/redeem?token=${token}`), env);
  if (reused.status !== 409) throw new Error('used token accepted');
  console.log('Auth smoke passed signup=true email=true redemption=true session=true used_rejected=true');
}
main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
