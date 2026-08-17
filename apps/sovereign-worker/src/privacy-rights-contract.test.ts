import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const rights = readFileSync(new URL('./privacy-rights.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./runtime-entry.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../migrations/0017_privacy_access_and_eligibility.sql', import.meta.url), 'utf8');
const jobs = readFileSync(new URL('./jobs.ts', import.meta.url), 'utf8');

describe('private account access and policy review contract', () => {
  it('generates account access on demand without R2 or export artifacts', () => {
    expect(runtime).toContain("url.pathname === '/api/v1/account/export'");
    expect(runtime).toContain("'content-disposition': 'attachment; filename=\"sovereign-account-export.json\"'");
    expect(runtime).toContain("'cache-control': 'private, no-store'");
    expect(rights).toContain("EXPORT_CONTRACT = 'sovereign-private-account-export.v1'");
    expect(rights).toContain('exportArtifactStored: false');
    expect(rights).toContain('generatedOnDemand: true');
    expect(rights).not.toContain('env.R2');
    expect(rights).not.toContain('r2_key');
    expect(runtime).toContain("const DISABLED_PATH_PREFIXES = ['/api/v1/export-jobs']");
  });

  it('excludes authentication secrets and provider identifiers from the user export', () => {
    for (const phrase of [
      'session tokens and session hashes',
      'magic-link and email-code secrets or hashes',
      'passkey credential identifiers and public keys',
      'invitation token hashes',
      'Stripe customer and subscription identifiers',
      'webhook payloads and provider secrets'
    ]) expect(rights).toContain(phrase);
    expect(rights).not.toContain('SELECT session_hash');
    expect(rights).not.toContain('SELECT token_hash');
    expect(rights).not.toContain('credential_id, public_key_jwk');
    expect(rights).not.toContain('stripe_customer_id, stripe_subscription_id');
  });

  it('blocks stale-policy production APIs while preserving privacy, exit, and billing controls', () => {
    expect(runtime).toContain("env.APP_ENV === 'production'");
    expect(runtime).toContain('!isPolicyReviewExempt(request, url)');
    expect(runtime).toContain("error: 'policy_review_required'");
    expect(runtime).toContain("status: 428");
    for (const exempt of [
      'GET /api/v1/account/policy-status',
      'POST /api/v1/account/policy-acceptance',
      'POST /api/v1/account/export',
      'POST /api/v1/auth/logout',
      'POST /api/v1/auth/logout-all',
      'GET /api/v1/auth/session',
      'GET /api/v1/billing/entitlements',
      'POST /api/v1/billing/portal'
    ]) expect(runtime).toContain(exempt);
    expect(runtime).toContain("url.pathname === '/api/v1/deletion-jobs'");
  });

  it('stores append-only policy update receipts and versioned eligibility state', () => {
    expect(rights).toContain("acceptance_surface, requested_ip_hash, user_agent_hash");
    expect(rights).toContain("VALUES (?, ?, ?, ?, ?, ?, ?, 'policy-update', ?, ?)");
    expect(rights).toContain('eligibility_confirmed_at = ?');
    expect(rights).toContain('eligibility_rule_version = ?');
    expect(migration).toContain("request_type TEXT NOT NULL CHECK(request_type IN ('access_export','policy_update'))");
    expect(migration).toContain("NEW.policy_version = '2026-08-17.2'");
    expect(migration).toContain("NEW.policy_content_hash = '10e0e2e9f3a17c6860c91311f3cfcbca426b237e49f2380ac57d11dc23fbf822'");
  });

  it('keeps deletion handling explicit for account-private storage', () => {
    expect(jobs).toContain('ACCOUNT_TABLE_DELETES');
    expect(jobs).toContain('baseline_onboarding');
    expect(jobs).toContain('saved_understandings');
    expect(jobs).toContain('account_privacy_settings');
  });
});
