import { describe, expect, it } from 'vitest';
import { ensureThread, listThreadMessages, listThreads } from './threads';
import type { Env } from '../env';

function envWithThreads(existing?: { threadId: string; accountId: string }): Env {
  const threads = new Map<string, string>();
  if (existing) threads.set(existing.threadId, existing.accountId);
  return {
    APP_ENV: 'test', APP_VERSION: 'test', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', THREADS: {} as DurableObjectNamespace,
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

  it('returns account-scoped summaries in recent-first order', async () => {
    const env = historyEnv();
    await expect(listThreads(env, 'a1')).resolves.toEqual([
      {
        id: 't1',
        title: 'A decision about work',
        contextKind: 'explore',
        covenantEnabled: false,
        createdAt: '2026-07-25 10:00:00',
        updatedAt: '2026-07-26 10:00:00'
      }
    ]);
  });

  it('restores user-visible messages and validated presentation metadata for an owned thread', async () => {
    const messages = await listThreadMessages(historyEnv(), 'a1', 't1');
    expect(messages).toEqual([
      { id: 'e1', role: 'user', text: 'Help me understand this choice.', createdAt: '2026-07-26 10:00:00' },
      {
        id: 'e3',
        role: 'assistant',
        text: 'Two needs may be interacting.',
        createdAt: '2026-07-26 10:00:02',
        context: { personId: 'person_1' },
        interfaceActions: { version: 1 },
        visualStory: { story: { should_show: true } },
        moduleOffer: { title: 'Two needs in one decision' }
      }
    ]);
  });

  it('does not expose another account’s conversation history', async () => {
    await expect(listThreadMessages(historyEnv(), 'a2', 't1')).rejects.toMatchObject({ status: 404 });
  });
});

function historyEnv(): Env {
  return {
    APP_ENV: 'test', APP_VERSION: 'test', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', THREADS: {} as DurableObjectNamespace,
    DB: {
      prepare(sql: string) {
        return {
          bind(...args: unknown[]) {
            return {
              async first() {
                if (sql.includes('SELECT id, account_id, covenant_enabled FROM threads')) {
                  return args[0] === 't1' && args[1] === 'a1'
                    ? { id: 't1', account_id: 'a1', covenant_enabled: 0 }
                    : null;
                }
                return null;
              },
              async all() {
                if (sql.includes('FROM threads t')) {
                  return { results: [{
                    id: 't1',
                    title: 'A decision about work',
                    context_kind: 'explore',
                    covenant_enabled: 0,
                    created_at: '2026-07-25 10:00:00',
                    updated_at: '2026-07-26 10:00:00'
                  }] };
                }
                if (sql.includes('FROM thread_events')) {
                  return { results: [
                    { id: 'e1', event_type: 'user_message', payload_json: '{"text":"Help me understand this choice."}', created_at: '2026-07-26 10:00:00' },
                    { id: 'e2', event_type: 'assistant_plan', payload_json: '{"hidden":"not returned"}', created_at: '2026-07-26 10:00:01' },
                    {
                      id: 'e3',
                      event_type: 'assistant_response',
                      payload_json: '{"text":"Two needs may be interacting.","context":{"personId":"person_1"},"interfaceActions":{"version":1},"visualStory":{"story":{"should_show":true}},"moduleOffer":{"title":"Two needs in one decision"}}',
                      created_at: '2026-07-26 10:00:02'
                    }
                  ] };
                }
                return { results: [] };
              }
            };
          }
        };
      }
    } as unknown as D1Database
  };
}
