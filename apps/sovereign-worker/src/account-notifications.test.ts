import { describe, expect, it } from 'vitest';
import type { Env } from './env';
import { notifyAccountDeletionChange } from './account-notifications';

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
      category: 'operational'
    });
    expect(String(captured[0]?.text)).toContain('14-day grace period');
    expect(String(captured[0]?.html)).toContain('Review or cancel deletion');
    expect(captured[1]).toMatchObject({
      subject: 'Sovereign.OS account deletion cancelled',
      category: 'operational'
    });
    expect(JSON.stringify(captured)).not.toContain('acct_private');
    expect(JSON.stringify(captured)).not.toContain('delete_private');
  });

  it('skips non-email identities without blocking the account mutation', async () => {
    const { env, captured } = notificationEnv('external:subject');
    await expect(notifyAccountDeletionChange(env, 'acct_1', {
      jobId: 'delete_1',
      state: 'scheduled'
    })).resolves.toBe(false);
    expect(captured).toHaveLength(0);
  });
});
