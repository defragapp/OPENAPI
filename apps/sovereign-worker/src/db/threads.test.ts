import { describe, expect, it } from 'vitest';
import { ensureThread } from './threads';
import type { Env } from '../env';

function envWithThreads(existing?: { threadId: string; accountId: string }): Env {
  const threads = new Map<string, string>();
  if (existing) threads.set(existing.threadId, existing.accountId);
  return {
    APP_ENV: 'test', APP_VERSION: 'test', OPENAI_API_KEY: '', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', THREADS: {} as DurableObjectNamespace,
    DB: { prepare(sql: string) { return { bind(...args: unknown[]) { return { async first() { if (sql.startsWith('SELECT account_id')) { const accountId = threads.get(args[0] as string); return accountId ? { account_id: accountId } : null; } return null; }, async run() { if (sql.startsWith('INSERT INTO threads')) threads.set(args[0] as string, args[1] as string); return { success: true }; } }; } }; } } as unknown as D1Database
  };
}

describe('thread account ownership', () => {
  it('prevents cross-account thread access', async () => {
    await expect(ensureThread(envWithThreads({ threadId: 't1', accountId: 'a1' }), 'a2', 't1')).rejects.toMatchObject({ status: 404 });
  });

  it('allows the owning account to reuse an existing thread', async () => {
    await expect(ensureThread(envWithThreads({ threadId: 't1', accountId: 'a1' }), 'a1', 't1')).resolves.toBeUndefined();
  });
});
