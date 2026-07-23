import { describe, expect, it } from 'vitest';
import { createSignedSessionToken, requireAuth } from './auth';
import type { Env } from '../env';

function envWithDb(secret: string): Env {
  const accounts = new Map<string, string>();
  return {
    APP_ENV: 'test', APP_VERSION: 'test', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: secret,
    THREADS: {} as DurableObjectNamespace,
    DB: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              async first() {
                if (sql.startsWith('SELECT id, auth_subject')) {
                  const subject = args[0] as string;
                  const id = accounts.get(subject);
                  return id ? { id, auth_subject: subject } : null;
                }
                return null;
              },
              async run() {
                if (sql.startsWith('INSERT INTO accounts')) accounts.set(args[1] as string, args[0] as string);
                return { success: true };
              }
            };
          }
        };
      }
    } as unknown as D1Database
  };
}

describe('signed session authentication', () => {
  it('accepts a valid signed bearer token and resolves an account', async () => {
    const env = envWithDb('secret');
    const token = await createSignedSessionToken({ sub: 'user:1', exp: Math.floor(Date.now() / 1000) + 60 }, 'secret');
    const auth = await requireAuth(new Request('https://app.test', { headers: { authorization: `Bearer ${token}` } }), env);
    expect(auth.subject).toBe('user:1');
    expect(auth.accountId).toBeTruthy();
  });

  it('rejects missing auth, invalid signatures, and expired sessions', async () => {
    const env = envWithDb('secret');
    await expect(requireAuth(new Request('https://app.test'), env)).rejects.toMatchObject({ status: 401 });
    const invalid = await createSignedSessionToken({ sub: 'user:1' }, 'other');
    await expect(requireAuth(new Request('https://app.test', { headers: { authorization: `Bearer ${invalid}` } }), env)).rejects.toMatchObject({ status: 401 });
    const expired = await createSignedSessionToken({ sub: 'user:1', exp: Math.floor(Date.now() / 1000) - 1 }, 'secret');
    await expect(requireAuth(new Request('https://app.test', { headers: { authorization: `Bearer ${expired}` } }), env)).rejects.toMatchObject({ status: 401 });
  });
});
