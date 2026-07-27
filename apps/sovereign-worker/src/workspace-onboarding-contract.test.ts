import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../migrations/0010_account_onboarding_and_chat_history.sql', import.meta.url), 'utf8');
const auth = readFileSync(new URL('./auth-public.ts', import.meta.url), 'utf8');
const index = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
const entry = readFileSync(new URL('./entry.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./runtime-entry.ts', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('../../web/src/PlanOnboarding.tsx', import.meta.url), 'utf8');

describe('account onboarding and conversation persistence', () => {
  it('adds an explicit, account-scoped plan confirmation state', () => {
    expect(migration).toContain('onboarding_completed_at');
    expect(migration).toContain("plan_intent TEXT NOT NULL DEFAULT 'free'");
    expect(index).toContain("app.get('/api/v1/account/onboarding'");
    expect(index).toContain("app.post('/api/v1/account/onboarding'");
    expect(onboarding).toContain('Continue with Free');
    expect(onboarding).toContain('Choose Sovereign+');
  });

  it('sends newly-created accounts to plan confirmation and returning accounts to the workspace', () => {
    expect(auth).toContain('createdAccount');
    expect(auth).toContain("next: onboarding?.onboarding_completed_at ? '/app' : '/onboarding'");
    expect(runtime).toContain("pathname === '/onboarding'");
  });

  it('exposes account-owned thread history and stores restorable message text', () => {
    expect(index).toContain("app.get('/api/v1/threads'");
    expect(index).toContain("app.get('/api/v1/threads/:threadId'");
    expect(entry).toContain("await touchThread(env, auth.accountId, threadId, message)");
    expect(entry).toContain("'user_message', { text: message");
    expect(entry).not.toContain("'user_message', { redacted: true");
  });

  it('reports the same migration from every production health layer', () => {
    for (const source of [index, entry, runtime]) {
      expect(source).toContain("0010_account_onboarding_and_chat_history");
    }
  });
});
