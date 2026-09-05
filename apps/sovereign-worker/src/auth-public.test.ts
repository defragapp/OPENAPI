import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeReturnTo, verifyTurnstile } from './auth-public';
import type { Env } from './env';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('safe authentication return routing', () => {
  it('preserves only approved private destinations', () => {
    expect(safeReturnTo('/app')).toBe('/app');
    expect(safeReturnTo('/app/relationship?person=p_1')).toBe('/app/relationship?person=p_1');
    expect(safeReturnTo('/onboarding')).toBe('/onboarding');
    expect(safeReturnTo('/consent.html?token=invitation')).toBe('/consent.html?token=invitation');
  });

  it('rejects external, protocol-relative, malformed, and unrelated destinations', () => {
    expect(safeReturnTo('https://example.com')).toBe('/app');
    expect(safeReturnTo('//example.com/app')).toBe('/app');
    expect(safeReturnTo('/pricing.html')).toBe('/app');
    expect(safeReturnTo('/app\\evil')).toBe('/app');
    expect(safeReturnTo(null)).toBe('/app');
  });
});


describe('Turnstile production failure handling', () => {
  it('preserves the 503 response contract when the secret is unavailable', async () => {
    const env = { APP_ENV: 'production' } as unknown as Env;
    await expect(verifyTurnstile(env, 'token')).rejects.toMatchObject({ status: 503 });
  });

  it('logs invalid production secrets regardless of their literal value', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ success: false, 'error-codes': ['invalid-input-secret'] })));
    const env = { APP_ENV: 'production', TURNSTILE_SECRET_KEY: 'secret' } as unknown as Env;

    await expect(verifyTurnstile(env, 'token')).rejects.toMatchObject({ status: 503 });
    expect(error).toHaveBeenCalledWith('turnstile_configuration_error', { invalidSecret: true });
  });
});

describe('requestMagicLink D1 transaction safety', () => {
  it('executes database mutations via env.DB.batch without manual SQL transaction statements', async () => {
    const executedSql: string[] = [];
    const batchStatements: any[] = [];
    const mockDb = {
      prepare: vi.fn((sql: string) => {
        executedSql.push(sql);
        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
          throw new Error('D1 does not support manual transaction SQL');
        }
        return {
          bind: vi.fn((...args: any[]) => ({
            first: vi.fn(async () => null),
            run: vi.fn(async () => ({ success: true, meta: { changes: 1 } }))
          }))
        };
      }),
      batch: vi.fn(async (stmts: any[]) => {
        batchStatements.push(...stmts);
        return stmts.map(() => ({ success: true, meta: { changes: 1 } }));
      })
    };

    const env = {
      APP_ENV: 'test',
      APP_VERSION: '0'.repeat(40),
      DB: mockDb,
      KV: { put: vi.fn() }
    } as unknown as Env;

    const request = new Request('https://app.test/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://app.test' },
      body: JSON.stringify({
        email: 'user@example.com',
        name: 'User',
        turnstileToken: 'token',
        termsAccepted: true,
        termsVersion: '2026-08-17.2',
        privacyVersion: '2026-08-17.2',
        policyContentHash: '10e0e2e9f3a17c6860c91311f3cfcbca426b237e49f2380ac57d11dc23fbf822',
        ageEligible: true,
        eligibilityRuleVersion: '2026-08-17-18-plus'
      })
    });

    const { requestMagicLink } = await import('./auth-public');
    const response = await requestMagicLink(request, env, 'signup');
    expect(response.status).toBe(200);
    expect(mockDb.batch).toHaveBeenCalledTimes(1);
    expect(batchStatements.length).toBe(1);
    expect(executedSql).not.toContain('BEGIN');
    expect(executedSql).not.toContain('COMMIT');
    expect(executedSql).not.toContain('ROLLBACK');
  });
});