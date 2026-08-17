import { ELIGIBILITY_RULE, POLICY_CONTENT_HASH, POLICY_METADATA } from '../config/policies';
import { requestMagicLink, redeemMagicLink } from '../apps/sovereign-worker/src/auth-public';
import { requireAuth } from '../apps/sovereign-worker/src/security/auth';
import type { Env } from '../apps/sovereign-worker/src/env';

type Account = { id: string; auth_subject: string; terms_accepted_at?: string; terms_version?: string; privacy_version?: string };
type PolicyReceipt = { policyType: string; policyVersion: string; contentHash: string; releaseSha: string; acceptedAt: string };

function fakeEnv(): Env & { emails: string[]; accountsBySubject: Map<string, Account>; policyReceipts: PolicyReceipt[] } {
  const accountsBySubject = new Map<string, Account>();
  const accountsById = new Map<string, Account>();
  const links = new Map<string, Record<string, unknown>>();
  const sessions = new Map<string, { revoked_at: string | null; expires_at: string }>();
  const emails: string[] = [];
  const policyReceipts: PolicyReceipt[] = [];

  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first() {
              if (sql.includes('FROM auth_magic_links WHERE email_normalized')) return null;
              if (sql.includes('SELECT COUNT(*) AS count FROM auth_magic_links')) return { count: 0 };
              if (sql.includes('FROM auth_magic_links WHERE token_hash')) {
                return [...links.values()].find((link) => link.token_hash === args[0]) ?? null;
              }
              if (sql === 'SELECT id FROM accounts WHERE auth_subject = ?') {
                const account = accountsBySubject.get(String(args[0]));
                return account ? { id: account.id } : null;
              }
              if (sql === 'SELECT id, auth_subject FROM accounts WHERE auth_subject = ?') {
                return accountsBySubject.get(String(args[0])) ?? null;
              }
              if (sql === 'SELECT id, auth_subject FROM accounts WHERE id = ?') {
                return accountsById.get(String(args[0])) ?? null;
              }
              if (sql.startsWith('SELECT revoked_at')) return sessions.get(String(args[0])) ?? null;
              return null;
            },
            async run() {
              if (sql.startsWith('INSERT INTO auth_magic_links')) {
                links.set(String(args[0]), {
                  id: args[0], email_normalized: args[1], account_id: args[2], purpose: args[3],
                  token_hash: args[4], name: args[5], terms_accepted_at: args[6], terms_version: args[7],
                  privacy_version: args[8], policy_content_hash: args[9], policy_release_sha: args[10],
                  requested_ip_hash: args[11], user_agent_hash: args[12],
                  expires_at: new Date(Date.now() + 900_000).toISOString(), used_at: null
                });
              }
              if (sql.startsWith('INSERT INTO accounts')) {
                const account = { id: String(args[0]), auth_subject: String(args[1]) };
                accountsBySubject.set(account.auth_subject, account);
                accountsById.set(account.id, account);
              }
              if (sql.startsWith('UPDATE auth_magic_links')) {
                const link = links.get(String(args[1]));
                if (link) { link.used_at = new Date().toISOString(); link.account_id = args[0]; }
              }
              if (sql.startsWith('UPDATE accounts SET')) {
                const account = accountsById.get(String(args[3]));
                if (account) {
                  account.terms_accepted_at = String(args[0]);
                  account.terms_version = String(args[1]);
                  account.privacy_version = String(args[2]);
                }
              }
              if (sql.startsWith('INSERT OR IGNORE INTO policy_acceptance_receipts')) {
                const key = `${String(args[2])}:${String(args[6])}`;
                if (!policyReceipts.some((receipt) => `${receipt.policyType}:${receipt.acceptedAt}` === key)) {
                  policyReceipts.push({
                    policyType: String(args[2]),
                    policyVersion: String(args[3]),
                    contentHash: String(args[4]),
                    releaseSha: String(args[5]),
                    acceptedAt: String(args[6])
                  });
                }
              }
              if (sql.startsWith('INSERT INTO auth_sessions')) {
                sessions.set(String(args[0]), { revoked_at: null, expires_at: new Date(Date.now() + 86_400_000).toISOString() });
              }
              if (sql.startsWith('UPDATE auth_sessions SET last_seen_at')) return { success: true, meta: { changes: 1 } };
              return { success: true, meta: { changes: 1 } };
            },
            async all() { return { results: [] }; }
          };
        }
      };
    }
  } as unknown as D1Database;
  const kv = { put: async (_key: string, value: string) => { emails.push(value); } } as unknown as KVNamespace;
  return {
    APP_ENV: 'test', APP_VERSION: 'a'.repeat(40), DB: db, KV: kv,
    THREADS: {} as DurableObjectNamespace, STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '',
    SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret',
    emails, accountsBySubject, policyReceipts
  } as Env & { emails: string[]; accountsBySubject: Map<string, Account>; policyReceipts: PolicyReceipt[] };
}

function authRequest(path: string, body: Record<string, unknown>) {
  return new Request(`https://app.test${path}`, {
    method: 'POST',
    headers: { origin: 'https://app.test', 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function main() {
  const env = fakeEnv();
  const privateLogin = await requestMagicLink(authRequest('/api/v1/auth/login', {
    email: 'missing@example.com', turnstileToken: 'test-turnstile-pass'
  }), env, 'login');
  if (privateLogin.status !== 200 || env.emails.length !== 0 || env.accountsBySubject.size !== 0) {
    throw new Error('nonexistent login created an account or disclosed existence');
  }

  const underageMissing = await requestMagicLink(authRequest('/api/v1/auth/signup', {
    email: 'blocked@example.com',
    name: 'Blocked',
    termsAccepted: true,
    termsVersion: POLICY_METADATA.terms.version,
    privacyVersion: POLICY_METADATA.privacy.version,
    policyContentHash: POLICY_CONTENT_HASH,
    turnstileToken: 'test-turnstile-pass'
  }), env, 'signup');
  if (underageMissing.status !== 400 || (await underageMissing.json() as { field?: string }).field !== 'eligibility') {
    throw new Error('signup without explicit 18+ eligibility was accepted');
  }

  const signup = await requestMagicLink(authRequest('/api/v1/auth/signup', {
    email: 'USER@Example.COM',
    name: 'User',
    termsAccepted: true,
    termsVersion: POLICY_METADATA.terms.version,
    privacyVersion: POLICY_METADATA.privacy.version,
    policyContentHash: POLICY_CONTENT_HASH,
    ageEligible: true,
    eligibilityRuleVersion: ELIGIBILITY_RULE.version,
    turnstileToken: 'test-turnstile-pass'
  }), env, 'signup');
  if (signup.status !== 200 || env.emails.length !== 1) throw new Error('signup magic link not sent');
  const emailText = JSON.parse(env.emails[0]!).text as string;
  const token = decodeURIComponent(emailText.match(/token=([^\s]+)/)?.[1] ?? '');
  if (!token) throw new Error('test email did not capture token');

  const redeemed = await redeemMagicLink(new Request(`https://app.test/api/v1/auth/redeem?token=${token}`), env);
  const setCookie = redeemed.headers.get('set-cookie') ?? '';
  if (redeemed.status !== 200 || !setCookie.includes('HttpOnly') || !setCookie.includes('Priority=High')) {
    throw new Error(`redeem did not create hardened cookie status=${redeemed.status}`);
  }
  const account = env.accountsBySubject.get('email:user@example.com');
  if (!account?.terms_accepted_at || account.terms_version !== POLICY_METADATA.terms.version || account.privacy_version !== POLICY_METADATA.privacy.version) {
    throw new Error('signup policy acceptance was not persisted');
  }
  if (env.policyReceipts.length !== 2
    || !env.policyReceipts.some((receipt) => receipt.policyType === 'terms' && receipt.policyVersion === POLICY_METADATA.terms.version)
    || !env.policyReceipts.some((receipt) => receipt.policyType === 'privacy' && receipt.policyVersion === POLICY_METADATA.privacy.version)
    || env.policyReceipts.some((receipt) => receipt.contentHash !== POLICY_CONTENT_HASH || receipt.releaseSha !== 'a'.repeat(40))) {
    throw new Error('versioned policy acceptance receipts were not persisted');
  }

  const cookie = setCookie.split(';')[0]!;
  const auth = await requireAuth(new Request('https://app.test/api/v1/you', { headers: { cookie } }), env);
  if (!auth.accountId) throw new Error('session did not resolve');
  const reused = await redeemMagicLink(new Request(`https://app.test/api/v1/auth/redeem?token=${token}`), env);
  if (reused.status !== 409) throw new Error('used token accepted');
  console.log('Auth smoke passed private_login=true signup_only_creation=true policy_acceptance=true eligibility_18_plus=true policy_receipts=2 email=true redemption=true session=true used_rejected=true');
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
