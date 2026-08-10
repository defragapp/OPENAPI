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