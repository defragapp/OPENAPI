import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const auth = readFileSync(new URL('./auth-public.ts', import.meta.url), 'utf8');
const accountMigration = readFileSync(new URL('../migrations/0009_production_scale_and_billing_safety.sql', import.meta.url), 'utf8');
const receiptMigration = readFileSync(new URL('../migrations/0016_policy_acceptance_receipts.sql', import.meta.url), 'utf8');
const policies = readFileSync(new URL('../../../config/policies.ts', import.meta.url), 'utf8');

describe('production account creation contract', () => {
  it('creates new accounts only through accepted signup', () => {
    expect(auth).toContain("if (kind === 'login' && !existing)");
    expect(auth).toContain("if (row.purpose === 'login' && !row.account_id)");
    expect(auth).toContain("if (row.purpose !== 'signup')");
    expect(auth).toContain("row.purpose === 'signup' && (");
    expect(auth).toContain('!row.terms_accepted_at');
  });

  it('requires the exact current policy versions and content hash at signup', () => {
    expect(auth).toContain("import { POLICY_CONTENT_HASH, POLICY_METADATA } from '../../../config/policies'");
    expect(auth).toContain('body.termsVersion !== POLICY_METADATA.terms.version');
    expect(auth).toContain('body.privacyVersion !== POLICY_METADATA.privacy.version');
    expect(auth).toContain('body.policyContentHash !== POLICY_CONTENT_HASH');
    expect(auth).toContain("status: 'policy_update_required'");
    expect(policies).toContain("version: '2026-08-17'");
    expect(policies).toContain("POLICY_CONTENT_HASH = 'fa4258363c34fa6e6f735dd9045f32b302106d4a8cd583de4519f3d6a135197e'");
  });

  it('freezes accepted policy evidence before redemption and appends separate receipts', () => {
    for (const column of ['terms_version', 'privacy_version', 'policy_content_hash', 'policy_release_sha']) {
      expect(receiptMigration).toContain(`ALTER TABLE auth_magic_links ADD COLUMN ${column}`);
    }
    expect(receiptMigration).toContain('CREATE TABLE policy_acceptance_receipts');
    expect(receiptMigration).toContain("policy_type TEXT NOT NULL CHECK(policy_type IN ('terms','privacy'))");
    expect(auth).toContain('terms_accepted_at, terms_version, privacy_version, policy_content_hash, policy_release_sha');
    expect(auth).toContain('INSERT OR IGNORE INTO policy_acceptance_receipts');
    expect(auth).toContain("[['terms', row.terms_version], ['privacy', row.privacy_version]]");
    expect(auth).toContain("'signup', ?, ?");
  });

  it('preserves account-level current policy fields and hardens the host-only session cookie', () => {
    expect(auth).toContain('terms_accepted_at = ?, terms_version = ?, privacy_version = ?');
    expect(auth).toContain('SameSite=Lax; Priority=High');
    for (const column of ['terms_accepted_at', 'terms_version', 'privacy_version']) {
      expect(accountMigration).toContain(`ALTER TABLE accounts ADD COLUMN ${column}`);
    }
  });

  it('rejects links whose account identity changed after issuance', () => {
    expect(auth).toContain('account.auth_subject !== subject');
    expect(auth).toContain('SELECT id, auth_subject FROM accounts WHERE id = ?');
  });
});
