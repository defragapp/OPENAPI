import { describe, expect, it, vi } from 'vitest';
import { createSignedSessionToken, requireAuth, requireSameOrigin } from './auth';
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

function capturedThrow(fn: () => void): unknown {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error;
  }
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
    await expect(requireAuth(new Request('https://app.test'), env)).rejects.toMatchObject({ status: 401 });
    const expired = await createSignedSessionToken({ sub: 'user:1', exp: Math.floor(Date.now() / 1000) - 1 }, 'secret');
    await expect(requireAuth(new Request('https://app.test'), env)).rejects.toMatchObject({ status: 401 });
  });

  it('never accepts the legacy SOVV cookie as production authentication authority', async () => {
    const env = envWithDb('secret');
    env.APP_ENV = 'production';
    env.SOVV_INTERNAL_BASE_URL = 'https://legacy.internal.example';
    env.SOVV_INTERNAL_AUTH_TOKEN = 'legacy-test-token';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(requireAuth(new Request('https://app.defrag.app/api/v1/auth/session', {
      headers: { cookie: '__sov_session=legacy-cookie' }
    }), env)).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('same-origin mutation policy', () => {
  it('accepts a same-origin browser mutation', () => {
    expect(() => requireSameOrigin(new Request('https://app.defrag.app/api/v1/account/policy-acceptance', {
      method: 'POST',
      headers: {
        origin: 'https://app.defrag.app',
        'sec-fetch-site': 'same-origin'
      }
    }))).not.toThrow();
  });

  it('allows an explicit non-browser bearer mutation without ambient cookies', () => {
    expect(() => requireSameOrigin(new Request('https://app.defrag.app/api/v1/library', {
      method: 'POST',
      headers: { authorization: 'Bearer signed-session-token' }
    }))).not.toThrow();
  });

  it('does not let a bearer header bypass browser cookie origin requirements', () => {
    const error = capturedThrow(() => requireSameOrigin(new Request('https://app.defrag.app/api/v1/library', {
      method: 'POST',
      headers: {
        authorization: 'Bearer signed-session-token',
        cookie: '__Host-sovereign_session=ambient-cookie'
      }
    })));
    expect(error).toBeInstanceOf(Response);
    expect((error as Response).status).toBe(403);
  });

  it('rejects a cross-origin mutation even when the request is otherwise valid', () => {
    const error = capturedThrow(() => requireSameOrigin(new Request('https://app.defrag.app/api/v1/account/export', {
      method: 'POST',
      headers: {
        origin: 'https://attacker.example',
        'sec-fetch-site': 'cross-site'
      }
    })));
    expect(error).toBeInstanceOf(Response);
    expect((error as Response).status).toBe(403);
  });

  it('fails closed when browser mutation origin evidence is missing', () => {
    const error = capturedThrow(() => requireSameOrigin(new Request('https://app.defrag.app/api/v1/auth/logout', {
      method: 'POST'
    })));
    expect(error).toBeInstanceOf(Response);
    expect((error as Response).status).toBe(403);
  });

  it('rejects cross-site fetch metadata even if an origin string is supplied', () => {
    const error = capturedThrow(() => requireSameOrigin(new Request('https://app.defrag.app/api/v1/library', {
      method: 'POST',
      headers: {
        origin: 'https://app.defrag.app',
        'sec-fetch-site': 'cross-site'
      }
    })));
    expect(error).toBeInstanceOf(Response);
    expect((error as Response).status).toBe(403);
  });
});