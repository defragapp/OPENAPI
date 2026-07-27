import { describe, expect, it } from 'vitest';
import { redeemMagicLink, requestMagicLink } from './auth-public';
import type { Env } from './env';

type CodeRow = {
  id: string;
  account_id: string;
  email_normalized: string;
  code_hash: string;
  return_to: string;
  attempts: number;
  max_attempts: number;
  expires_at: string;
  used_at: string | null;
};

type TestEnv = Env & {
  capturedEmails: string[];
  codeRows: Map<string, CodeRow>;
  sessions: string[];
};

describe('one-time email code recovery', () => {
  it('issues a code with the verified login request and redeems it into the normal session', async () => {
    const env = fakeEnv(true);
    const requested = await requestMagicLink(loginRequest('member@example.com', '/app/relationship?person=p_1'), env, 'login');
    expect(requested.status).toBe(200);
    await expect(requested.json()).resolves.toMatchObject({ status: 'sent', recovery: 'link_or_code' });
    expect(env.capturedEmails).toHaveLength(1);

    const code = env.capturedEmails[0]!.match(/one-time code on the sign-in page: (\d{6})/)?.[1];
    expect(code).toMatch(/^\d{6}$/);
    expect(env.codeRows.size).toBe(1);
    expect([...env.codeRows.values()][0]!.code_hash).not.toBe(code);

    const redeemed = await redeemMagicLink(codeRequest('member@example.com', code!), env);
    expect(redeemed.status).toBe(200);
    expect(redeemed.headers.get('set-cookie')).toContain('__Host-sovereign_session=');
    expect(redeemed.headers.get('set-cookie')).toContain('HttpOnly');
    await expect(redeemed.json()).resolves.toMatchObject({ status: 'success', createdAccount: false, next: '/app/relationship?person=p_1' });
    expect(env.sessions).toHaveLength(1);

    const replayed = await redeemMagicLink(codeRequest('member@example.com', code!), env);
    expect(replayed.status).toBe(400);
    await expect(replayed.json()).resolves.toEqual({ status: 'invalid_code' });
  });

  it('keeps an unknown-email request browser-identical without sending or storing recovery material', async () => {
    const env = fakeEnv(false);
    const response = await requestMagicLink(loginRequest('missing@example.com', '/app'), env, 'login');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'sent', recovery: 'link_or_code' });
    expect(env.capturedEmails).toHaveLength(0);
    expect(env.codeRows.size).toBe(0);
  });

  it('returns the same generic error while counting wrong attempts', async () => {
    const env = fakeEnv(true);
    await requestMagicLink(loginRequest('member@example.com', '/app'), env, 'login');
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      const response = await redeemMagicLink(codeRequest('member@example.com', '000000'), env);
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ status: 'invalid_code' });
    }
    expect([...env.codeRows.values()][0]!.attempts).toBe(5);
  });
});

function loginRequest(email: string, returnTo: string): Request {
  return new Request('https://app.test/api/v1/auth/login', {
    method: 'POST',
    headers: { origin: 'https://app.test', 'content-type': 'application/json', 'user-agent': 'test-agent' },
    body: JSON.stringify({ email, returnTo, turnstileToken: 'test-turnstile-pass' })
  });
}

function codeRequest(email: string, code: string): Request {
  return new Request('https://app.test/api/v1/auth/redeem', {
    method: 'POST',
    headers: { origin: 'https://app.test', 'content-type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
}

function fakeEnv(existingAccount: boolean): TestEnv {
  const capturedEmails: string[] = [];
  const codeRows = new Map<string, CodeRow>();
  const sessions: string[] = [];
  const account = { id: 'acct_1', auth_subject: 'email:member@example.com' };

  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first() {
              if (sql.includes('FROM auth_magic_links WHERE email_normalized')) return null;
              if (sql.includes('COUNT(*) AS count FROM auth_magic_links')) return { count: 0 };
              if (sql === 'SELECT id FROM accounts WHERE auth_subject = ?') return existingAccount && args[0] === account.auth_subject ? { id: account.id } : null;
              if (sql.includes('FROM auth_email_codes WHERE email_normalized')) return [...codeRows.values()].filter((row) => row.email_normalized === args[0]).at(-1) ?? null;
              if (sql === 'SELECT id, auth_subject FROM accounts WHERE id = ?') return existingAccount && args[0] === account.id ? account : null;
              if (sql === 'SELECT onboarding_completed_at FROM accounts WHERE id = ?') return { onboarding_completed_at: '2026-07-27 10:00:00' };
              return null;
            },
            async run() {
              if (sql.startsWith('INSERT INTO auth_email_codes')) {
                codeRows.set(String(args[0]), {
                  id: String(args[0]),
                  account_id: String(args[1]),
                  email_normalized: String(args[2]),
                  code_hash: String(args[3]),
                  return_to: String(args[4]),
                  attempts: 0,
                  max_attempts: Number(args[5]),
                  expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
                  used_at: null
                });
              } else if (sql.startsWith('UPDATE auth_email_codes SET used_at = COALESCE')) {
                for (const row of codeRows.values()) if (row.used_at === null && (row.email_normalized === args[0] || row.account_id === args[0])) row.used_at = new Date().toISOString();
              } else if (sql.startsWith('UPDATE auth_email_codes SET attempts = attempts + 1')) {
                const row = codeRows.get(String(args[0]));
                if (row && row.used_at === null && row.attempts < row.max_attempts) row.attempts += 1;
              } else if (sql.startsWith('UPDATE auth_email_codes SET used_at = datetime')) {
                const row = codeRows.get(String(args[0]));
                if (row && row.used_at === null && row.attempts < row.max_attempts) { row.used_at = new Date().toISOString(); return { success: true, meta: { changes: 1 } }; }
                return { success: true, meta: { changes: 0 } };
              } else if (sql.startsWith('DELETE FROM auth_email_codes')) {
                codeRows.delete(String(args[0]));
              } else if (sql.startsWith('INSERT INTO auth_sessions')) {
                sessions.push(String(args[0]));
              }
              return { success: true, meta: { changes: 1 } };
            },
            async all() { return { results: [] }; }
          };
        }
      };
    }
  } as unknown as D1Database;

  const kv = {
    async put(_key: string, value: string) {
      const message = JSON.parse(value) as { text?: string };
      capturedEmails.push(message.text ?? '');
    }
  } as unknown as KVNamespace;

  return {
    APP_ENV: 'test', APP_VERSION: 'test', DB: db, KV: kv, THREADS: {} as DurableObjectNamespace,
    STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SESSION_SIGNING_SECRET: 'test-session-secret',
    SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', capturedEmails, codeRows, sessions
  } as TestEnv;
}
