import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../env';
import { notifyBillingLifecycle, type BillingNotificationKind } from './notifications';

afterEach(() => {
  vi.unstubAllGlobals();
});

function notificationEnv(authSubject = 'email:user@example.com'): Env {
  return {
    APP_ENV: 'production',
    PUBLIC_APP_URL: 'https://app.defrag.app',
    PUBLIC_CONTACT_EMAIL: 'info@sovereign.defrag.app',
    TRANSACTIONAL_FROM_EMAIL: 'info@sovereign.defrag.app',
    RESEND_API_KEY: 're_test_billing',
    DB: {
      prepare() {
        return {
          bind() {
            return {
              async first() { return { auth_subject: authSubject }; },
              async run() { return { success: true, meta: { changes: 1 } }; },
              async all() { return { results: [] }; }
            };
          }
        };
      }
    }
  } as unknown as Env;
}

async function send(kind: BillingNotificationKind, overrides: Partial<{ status: string; interval: 'monthly' | 'annual'; currentPeriodEnd: string }> = {}) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: `email_${kind}` }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  }));
  vi.stubGlobal('fetch', fetchMock);
  const sent = await notifyBillingLifecycle(notificationEnv(), {
    eventId: `evt_${kind}`,
    accountId: 'acct_billing_notice',
    kind,
    status: overrides.status ?? 'active',
    effectivePlan: kind === 'returned_to_free' ? 'free' : 'sovereign_plus',
    ...(overrides.interval ? { interval: overrides.interval } : {}),
    ...(overrides.currentPeriodEnd ? { currentPeriodEnd: overrides.currentPeriodEnd } : {})
  });
  const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
  return { sent, fetchMock, payload: JSON.parse(String(options.body)) as Record<string, unknown>, headers: options.headers as Record<string, string> };
}

describe('Stripe-projected billing lifecycle email', () => {
  it('sends the branded activation notice only after an authoritative event', async () => {
    const result = await send('activated', { interval: 'annual' });
    expect(result.sent).toBe(true);
    expect(result.payload.subject).toBe('Sovereign+ is active');
    expect(String(result.payload.html)).toContain('Your expanded access is active.');
    expect(String(result.payload.text)).toContain('Billing cadence: annual.');
    expect(result.payload.reply_to).toBe('info@sovereign.defrag.app');
    expect(result.payload.tags).toEqual(expect.arrayContaining([
      { name: 'category', value: 'operational' },
      { name: 'product', value: 'sovereign-os' }
    ]));
  });

  it('explains a scheduled cancellation without implying immediate loss of access', async () => {
    const result = await send('cancellation_scheduled', {
      status: 'active',
      currentPeriodEnd: '2026-09-01T00:00:00.000Z'
    });
    expect(result.payload.subject).toBe('Sovereign+ cancellation scheduled');
    expect(String(result.payload.text)).toContain('Paid capabilities remain available through the current billing period.');
    expect(String(result.payload.text)).toContain('September 1, 2026');
  });

  it('sends payment attention and returned-to-Free notices without including private Baseline content', async () => {
    const attention = await send('payment_attention', { status: 'past_due' });
    expect(attention.payload.subject).toBe('Sovereign+ billing needs attention');
    expect(String(attention.payload.text)).toContain('Free Baseline access remains available');

    vi.unstubAllGlobals();
    const free = await send('returned_to_free', { status: 'canceled' });
    expect(free.payload.subject).toBe('Your Sovereign.OS account is now on Free');
    expect(String(free.payload.text)).toContain('Your account and Baseline were not deleted.');
    expect(String(free.payload.text)).not.toMatch(/birth date|birthplace|natal|aspect/i);
  });

  it('does not attempt delivery when the account identity is not an email subject', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const sent = await notifyBillingLifecycle(notificationEnv('subject:private'), {
      eventId: 'evt_no_email',
      accountId: 'acct_no_email',
      kind: 'activated',
      status: 'active',
      effectivePlan: 'sovereign_plus'
    });
    expect(sent).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
