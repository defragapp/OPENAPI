import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const auth = readFileSync(new URL('./auth-public.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../migrations/0009_production_scale_and_billing_safety.sql', import.meta.url), 'utf8');

describe('production account creation contract', () => {
  it('creates new accounts only through accepted signup', () => {
    expect(auth).toContain("if (kind === 'login' && !existing)");
    expect(auth).toContain("if (row.purpose === 'login' && !row.account_id)");
    expect(auth).toContain("if (row.purpose !== 'signup')");
    expect(auth).toContain("if (row.purpose === 'signup' && !row.terms_accepted_at)");
  });

  it('persists current policy versions and hardens the host-only session cookie', () => {
    expect(auth).toContain("const TERMS_VERSION = '2026-08-09'");
    expect(auth).toContain("const PRIVACY_VERSION = '2026-08-09'");
    expect(auth).toContain('terms_accepted_at = ?, terms_version = ?, privacy_version = ?');
    expect(auth).toContain('SameSite=Lax; Priority=High');
    for (const column of ['terms_accepted_at', 'terms_version', 'privacy_version']) {
      expect(migration).toContain(`ALTER TABLE accounts ADD COLUMN ${column}`);
    }
  });

  it('rejects links whose account identity changed after issuance', () => {
    expect(auth).toContain("account.auth_subject !== subject");
    expect(auth).toContain("SELECT id, auth_subject FROM accounts WHERE id = ?");
  });
});