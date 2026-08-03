import { describe, expect, it } from 'vitest';
import type { Env } from './env';
import { notifyAccountDeletionChange, notifyAccountDeletionCompleted } from './account-notifications';

function notificationEnv(subject = 'email:user@example.com') {
  const captured: Array<Record<string, unknown>> = [];
  const env = {
    APP_ENV: 'test',
    APP_VERSION: 'test',
    DB: {
      prepare() {
        return {
          bind() {
            return {
              async first() { return { auth_subject: subject }; }
            };
          }
        };
      }
    },
    KV: {
      async put(_key: string, value: string) {
        captured.push(JSON.parse(value) as Record<string, unknown>);
      }
    },
    THREADS: {} as DurableObjectNamespace,
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    SESSION_SIGNING_SECRET: 'test-secret',
    PUBLIC_APP_URL: 'https://app.defrag.app'
  } as unknown as Env;
  return { env, captured };
}

describe('account deletion notifications', () => {
  it('sends branded scheduling and cancellation notices without account identifiers', async () => {
    const { env, captured } = notificationEnv();

    await expect(notifyAccountDeletionChange(env, 'acct_private', {
      jobId: 'delete_private',
      state: 'scheduled',
      graceDays: 14
    })).resolves.toBe(true);
    await expect(notifyAccountDeletionChange(env, 'acct_private', {
      jobId: 'delete_private',
      state: 'cancelled'
    })).resolves.toBe(true);

    expect(captured).toHaveLength(2);
    expect(captured[0]).toMatchObject({
      to: 'user@example.com',
      subject: 'Sovereign.OS account deletion scheduled',
      category: 'account_security'
    });
    expect(String(captured[0]?.text)).toContain('14-day grace period');
    expect(String(captured[0]?.html)).toContain('Review or cancel deletion');
    expect(captured[1]).toMatchObject({
      subject: 'Sovereign.OS account deletion cancelled',
      category: 'account_security'
    });
    expect(JSON.stringify(captured)).not.toContain('acct_private');
    expect(JSON.stringify(captured)).not.toContain('delete_private');
  });

  it('sends a final deletion confirmation without private account data', async () => {
    const { env, captured } = notificationEnv();
    await expect(notifyAccountDeletionCompleted(env, 'user@example.com', 'delete_private')).resolves.toBe(true);

    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      to: 'user@example.com',
      subject: 'Sovereign.OS account deletion completed',
      category: 'account_security'
    });
    expect(String(captured[0]?.text)).toContain('The scheduled deletion finished after the grace period.');
    expect(String(captured[0]?.text)).toContain('Active Stripe subscriptions were cancelled before deletion completed.');
    expect(String(captured[0]?.text)).not.toMatch(/birth date|birthplace|natal|aspect|acct_private|delete_private/i);
  });

  it('skips non-email identities or invalid completion recipients without blocking deletion', async () => {
    const { env, captured } = notificationEnv('external:subject');
    await expect(notifyAccountDeletionChange(env, 'acct_1', {
      jobId: 'delete_1',
      state: 'scheduled'
    })).resolves.toBe(false);
    await expect(notifyAccountDeletionCompleted(env, 'not-an-email', 'delete_1')).resolves.toBe(false);
    expect(captured).toHaveLength(0);
  });
});
