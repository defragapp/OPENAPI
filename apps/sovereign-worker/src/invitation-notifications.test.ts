import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Env } from './env';
import { notifyInvitationLifecycle } from './invitation-notifications';

afterEach(() => {
  vi.unstubAllGlobals();
});

function notificationEnv(): Env {
  return {
    APP_ENV: 'production',
    PUBLIC_APP_URL: 'https://app.defrag.app',
    PUBLIC_CONTACT_EMAIL: 'support@defrag.app',
    TRANSACTIONAL_FROM_EMAIL: 'info@defrag.app',
    RESEND_API_KEY: 're_test_invitation',
    DB: {
      prepare() {
        return {
          bind() {
            return {
              async first() {
                return {
                  account_id: 'acct_owner',
                  invited_email_normalized: 'invitee@example.com',
                  display_name: 'Private connection',
                  owner_subject: 'email:owner@example.com'
                };
              },
              async run() { return { success: true, meta: { changes: 1 } }; },
              async all() { return { results: [] }; }
            };
          }
        };
      }
    }
  } as unknown as Env;
}

function mockResend() {
  const fetchMock = vi.fn().mockImplementation(async (_url: string, options: RequestInit) => {
    const payload = JSON.parse(String(options.body)) as { to: string[] };
    return new Response(JSON.stringify({ id: `email_${payload.to[0]}` }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function payloads(fetchMock: ReturnType<typeof vi.fn>): Array<Record<string, unknown>> {
  return fetchMock.mock.calls.map(([, options]) => JSON.parse(String((options as RequestInit).body)) as Record<string, unknown>);
}

describe('invitation lifecycle notifications', () => {
  it('notifies both parties after acceptance without claiming that consent was granted', async () => {
    const fetchMock = mockResend();
    const sent = await notifyInvitationLifecycle(notificationEnv(), {
      invitationId: 'invite_accept',
      kind: 'accepted'
    });

    expect(sent).toBe(true);
    const messages = payloads(fetchMock);
    expect(messages).toHaveLength(2);
    expect(messages.map((message) => message.subject)).toEqual(expect.arrayContaining([
      'A Sovereign.OS invitation was accepted',
      'Your Sovereign.OS invitation was accepted'
    ]));
    for (const message of messages) {
      expect(String(message.text)).toContain('does not grant blanket access');
      expect(String(message.text)).not.toMatch(/birth date|birthplace|natal|exact private location:/i);
      expect(message.reply_to).toBe('support@defrag.app');
    }
  });

  it('records permission version in idempotency and identifies the exact scope', async () => {
    const fetchMock = mockResend();
    await notifyInvitationLifecycle(notificationEnv(), {
      invitationId: 'invite_scope',
      kind: 'permission_granted',
      scope: 'pair.compare',
      decisionVersion: 4
    });

    const messages = payloads(fetchMock);
    expect(messages).toHaveLength(2);
    for (const message of messages) {
      expect(String(message.text)).toContain('relationship comparison');
    }
    const headers = fetchMock.mock.calls.map(([, options]) => (options as RequestInit).headers as Record<string, string>);
    expect(headers.every((value) => value['idempotency-key']?.includes('permission_granted:v4'))).toBe(true);
    expect(messages.every((message) => (message.tags as Array<{ name: string; value: string }>).some((tag) => tag.name === 'category' && tag.value === 'consent_update'))).toBe(true);
  });

  it('states that revoked permission is unavailable for new shared context', async () => {
    const fetchMock = mockResend();
    await notifyInvitationLifecycle(notificationEnv(), {
      invitationId: 'invite_revoke',
      kind: 'permission_revoked',
      scope: 'library.link',
      decisionVersion: 5
    });

    const messages = payloads(fetchMock);
    expect(messages.some((message) => String(message.text).includes('no longer available for new shared context'))).toBe(true);
  });

  it('treats expiration as no consent and no sharing', async () => {
    const fetchMock = mockResend();
    await notifyInvitationLifecycle(notificationEnv(), {
      invitationId: 'invite_expired',
      kind: 'expired'
    });

    for (const message of payloads(fetchMock)) {
      expect(String(message.text)).toMatch(/No permission was granted|no permission was granted/i);
      expect(String(message.text)).toMatch(/Nothing was shared|do not expose/i);
    }
  });

  it('notifies both parties when a still-pending invitation is cancelled', async () => {
    const fetchMock = mockResend();
    const sent = await notifyInvitationLifecycle(notificationEnv(), {
      invitationId: 'invite_cancelled',
      kind: 'revoked'
    });

    expect(sent).toBe(true);
    const messages = payloads(fetchMock);
    expect(messages).toHaveLength(2);
    expect(messages.every((message) => message.subject === 'A Sovereign.OS invitation was cancelled')).toBe(true);
    expect(messages.some((message) => String(message.text).includes('The cancelled one-time link is invalid.'))).toBe(true);
    expect(messages.some((message) => String(message.text).includes('The one-time link can no longer be used'))).toBe(true);
    for (const message of messages) {
      expect(String(message.text)).toMatch(/No account was connected|no account was connected/i);
      expect(String(message.text)).toMatch(/No permission was granted|no permission was granted/i);
      expect(String(message.text)).not.toMatch(/birth date|birthplace|natal|aspect/i);
    }
  });
});
