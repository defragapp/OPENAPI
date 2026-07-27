import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const onboardingMigration = readFileSync(new URL('../migrations/0010_account_onboarding_and_chat_history.sql', import.meta.url), 'utf8');
const recoveryMigration = readFileSync(new URL('../migrations/0011_email_code_recovery.sql', import.meta.url), 'utf8');
const auth = readFileSync(new URL('./auth-public.ts', import.meta.url), 'utf8');
const index = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
const entry = readFileSync(new URL('./entry.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./runtime-entry.ts', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('../../web/src/PlanOnboarding.tsx', import.meta.url), 'utf8');

 describe('account onboarding, recovery, and conversation persistence', () => {
  it('adds an explicit, account-scoped plan confirmation state', () => {
    expect(onboardingMigration).toContain('onboarding_completed_at');
    expect(onboardingMigration).toContain("plan_intent TEXT NOT NULL DEFAULT 'free'");
    expect(index).toContain("app.get('/api/v1/account/onboarding'");
    expect(index).toContain("app.post('/api/v1/account/onboarding'");
    expect(onboarding).toContain('Continue with Free');
    expect(onboarding).toContain('Choose Sovereign+');
  });

  it('sends new accounts to plan confirmation and returning accounts to an allowlisted destination', () => {
    expect(auth).toContain('createdAccount');
    expect(auth).toContain("onboarding?.onboarding_completed_at ? safeReturnTo(returnTo) : '/onboarding'");
    expect(runtime).toContain("pathname === '/onboarding'");
  });

  it('stores hashed, expiring, one-use email recovery codes with attempt limits', () => {
    expect(recoveryMigration).toContain('CREATE TABLE IF NOT EXISTS auth_email_codes');
    expect(recoveryMigration).toContain('code_hash TEXT NOT NULL');
    expect(recoveryMigration).toContain('max_attempts INTEGER NOT NULL DEFAULT 5');
    expect(auth).toContain('constantTimeEqual');
    expect(auth).toContain('invalidCodeResponse()');
  });

  it('exposes account-owned thread history and stores restorable message text', () => {
    expect(index).toContain("app.get('/api/v1/threads'");
    expect(index).toContain("app.get('/api/v1/threads/:threadId'");
    expect(entry).toContain('await touchThread(env, auth.accountId, threadId, message)');
    expect(entry).toContain("'user_message', { text: message");
    expect(entry).not.toContain("'user_message', { redacted: true");
  });

  it('reports the current recovery migration from the authoritative production health layer', () => {
    expect(runtime).toContain("migrationVersion: '0011_email_code_recovery'");
  });
});
