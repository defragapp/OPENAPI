import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const auth = readFileSync(new URL('./auth-public.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../migrations/0011_email_code_recovery.sql', import.meta.url), 'utf8');

describe('email code storage security', () => {
  it('keys the six-digit code hash with a server-only secret', () => {
    expect(auth).toContain('async function emailCodeHash');
    expect(auth).toContain("{ name: 'HMAC', hash: 'SHA-256' }");
    expect(auth).toContain('encoder.encode(env.SESSION_SIGNING_SECRET)');
    expect(auth).toContain("crypto.subtle.sign('HMAC'");
    expect(auth).toContain('await emailCodeHash(env, email, emailCode)');
    expect(auth).toContain('await emailCodeHash(env, email, code)');
  });

  it('never stores the plain code or a reversible value in D1', () => {
    expect(migration).toContain('code_hash TEXT NOT NULL');
    expect(migration).not.toMatch(/plain_code|raw_code|code_encrypted/i);
    expect(auth).not.toContain('.bind(emailCodeId, existing.id, email, emailCode,');
    expect(auth).not.toContain('.bind(emailCodeId, existing.id, email, `${email}:${emailCode}`');
  });

  it('retains constant-time comparison and generic failure behavior', () => {
    expect(auth).toContain('constantTimeEqual(submittedHash, row.code_hash)');
    expect(auth).toContain('invalidCodeResponse()');
    expect(auth).not.toContain("status: 'expired_code'");
    expect(auth).not.toContain("status: 'code_locked'");
  });
});
