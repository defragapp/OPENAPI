import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const auth = readFileSync(new URL('./auth-public.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./runtime-entry.ts', import.meta.url), 'utf8');
const accountMigration = readFileSync(new URL('../migrations/0009_production_scale_and_billing_safety.sql', import.meta.url), 'utf8');
const receiptMigration = readFileSync(new URL('../migrations/0016_policy_acceptance_receipts.sql', import.meta.url), 'utf8');
const privacyMigration = readFileSync(new URL('../migrations/0017_privacy_access_and_eligibility.sql', import.meta.url), 'utf8');
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
    expect(auth).toContain("import { ELIGIBILITY_RULE, POLICY_CONTENT_HASH, POLICY_METADATA } from '../../../config/policies'");
    expect(auth).toContain('body.termsVersion !== POLICY_METADATA.terms.version');
    expect(auth).toContain('body.privacyVersion !== POLICY_METADATA.privacy.version');
    expect(auth).toContain('body.policyContentHash !== POLICY_CONTENT_HASH');
    expect(auth).toContain("status: 'policy_update_required'");
    expect(policies).toContain("version: '2026-08-17.2'");
    expect(policies).toContain("POLICY_CONTENT_HASH = '10e0e2e9f3a17c6860c91311f3cfcbca426b237e49f2380ac57d11dc23fbf822'");
  });

  it('requires explicit 18 plus launch eligibility in both the auth core and production wrapper', () => {
    expect(policies).toContain("version: '2026-08-17-18-plus'");
    expect(policies).toContain('minimumAge: 18');
    expect(auth).toContain('body.ageEligible !== true');
    expect(auth).toContain('body.eligibilityRuleVersion !== ELIGIBILITY_RULE.version');
    expect(runtime).toContain("url.pathname === '/api/v1/auth/signup'");
    expect(runtime).toContain('signup.ageEligible !== true');
    expect(runtime).toContain('signup.eligibilityRuleVersion !== ELIGIBILITY_RULE.version');
    expect(runtime).toContain("field: 'eligibility'");
    expect(privacyMigration).toContain('eligibility_confirmed_at TEXT');
    expect(privacyMigration).toContain('eligibility_rule_version TEXT');
    expect(privacyMigration).toContain('policy_signup_eligibility_after_terms_receipt');
    expect(privacyMigration).toContain("NEW.acceptance_surface = 'signup'");
  });

  it('freezes accepted policy evidence before redemption and appends separate receipts', () => {
    for (const column of ['terms_version', 'privacy_version', 'policy_content_hash', 'policy_release_sha']) {
      expect(receiptMigration).toContain(`ALTER TABLE auth_magic_links ADD COLUMN ${column}`);
    }
    expect(receiptMigration).toContain('CREATE TABLE policy_acceptance_receipts');
    expect(receiptMigration).toContain("policy_type TEXT NOT NULL CHECK(policy_type IN ('terms','privacy'))");
    expect(receiptMigration).toContain("release_sha TEXT NOT NULL CHECK(length(release_sha) = 40 AND release_sha NOT GLOB '*[^0-9a-f]*')");
    expect(auth).toContain('terms_accepted_at, terms_version, privacy_version, policy_content_hash, policy_release_sha');
    expect(auth).toContain('INSERT OR IGNORE INTO policy_acceptance_receipts');
    expect(auth).toContain("[['terms', row.terms_version], ['privacy', row.privacy_version]]");
    expect(auth).toContain("'signup', ?, ?");
    expect(auth).toContain("if (!/^[0-9a-f]{40}$/.test(value)) throw new Response('Release identity unavailable'");
    expect(auth).toContain("!/^[0-9a-f]{40}$/.test(row.policy_release_sha)");
  });

  it('stores only hashed request evidence in policy receipts', () => {
    expect(receiptMigration).toContain('requested_ip_hash TEXT');
    expect(receiptMigration).toContain('user_agent_hash TEXT');
    expect(receiptMigration).not.toMatch(/\brequested_ip\s+TEXT\b/);
    expect(receiptMigration).not.toMatch(/\buser_agent\s+TEXT\b/);
    expect(auth).toContain("sha256(request.headers.get('user-agent') ?? 'unknown')");
    expect(auth).toContain("const [ipHash, userAgentHash] = await Promise.all([sha256(ip)");
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
