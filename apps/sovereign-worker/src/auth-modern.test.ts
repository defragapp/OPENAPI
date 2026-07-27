import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { derivePasswordRecord, verifyPasswordRecord } from './auth-password';

const oauth = readFileSync(new URL('./auth-oauth.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./runtime-auth-entry.ts', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./onboarding.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../migrations/0010_auth_password_oauth_onboarding.sql', import.meta.url), 'utf8');

describe('modern account access', () => {
  it('derives a salted password record and rejects a different password', async () => {
    const password = 'A careful private password 2026';
    const record = await derivePasswordRecord(password);
    expect(record.hash).not.toContain(password);
    expect(record.salt.length).toBeGreaterThan(16);
    expect(record.iterations).toBeGreaterThanOrEqual(100_000);
    await expect(verifyPasswordRecord(password, record)).resolves.toBe(true);
    await expect(verifyPasswordRecord('A different private password 2026', record)).resolves.toBe(false);
  });

  it('verifies provider tokens and browser-bound state before linking an identity', () => {
    for (const required of [
      "header.alg !== 'RS256'",
      'issuers.includes(claims.iss)',
      'audiences.includes(audience)',
      'claims.exp <= Math.floor(Date.now() / 1000)',
      'crypto.subtle.verify',
      'state.nonce_hash',
      'email_verified',
      'auth_external_identities',
      "readCookie(request, OAUTH_STATE_COOKIE)",
      "await sha256(browserState) !== stateHash",
      'HttpOnly; Secure; SameSite=None'
    ]) {
      expect(oauth).toContain(required);
    }
  });

  it('routes password recovery OAuth and onboarding through the production entry', () => {
    for (const route of [
      '/api/v1/auth/password/signup',
      '/api/v1/auth/password/login',
      '/api/v1/auth/password/forgot',
      '/api/v1/auth/password/reset',
      '/api/v1/auth/oauth/',
      '/api/v1/onboarding/status',
      '/api/v1/onboarding/plan',
      '/api/v1/onboarding/complete'
    ]) {
      expect(runtime).toContain(route);
    }
  });

  it('keeps plan selection and Baseline completion connected', () => {
    expect(onboarding).toContain('selected_plan = excluded.selected_plan');
    expect(onboarding).toContain("stage = 'baseline'");
    expect(onboarding).toContain('Build your Baseline before finishing setup.');
    expect(onboarding).toContain("checkoutRequired: row.selected_plan === 'sovereign_plus'");
  });

  it('stores only hashed secrets and adds abuse-control indexes', () => {
    for (const required of [
      'password_hash TEXT NOT NULL',
      'password_salt TEXT NOT NULL',
      'token_hash TEXT NOT NULL UNIQUE',
      'state_hash TEXT NOT NULL UNIQUE',
      'nonce_hash TEXT NOT NULL',
      'auth_login_attempts_email_created_idx',
      'auth_login_attempts_ip_created_idx'
    ]) {
      expect(migration).toContain(required);
    }
    expect(migration).not.toMatch(/password\s+TEXT/i);
  });
});
