import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Env } from './env';
import { buildSovereignEmail, sendOperationalEmail, transactionalEmailProvider } from './email';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Sovereign.OS transactional email', () => {
  it('renders one consistent branded HTML and plain-text template', () => {
    const message = buildSovereignEmail({
      eyebrow: 'Private sign-in',
      title: 'Return to your Sovereign.OS.',
      intro: 'Open your private personal intelligence environment.',
      actionLabel: 'Open Sovereign.OS',
      actionUrl: 'https://app.defrag.app/auth/redeem?token=private-token',
      details: ['This link expires in 15 minutes.', 'It can be used only once.']
    });

    expect(message.text).toContain('SOVEREIGN.OS');
    expect(message.text).toContain('Open Sovereign.OS:');
    expect(message.text).toContain('Questions or account support: info@defrag.app');
    expect(message.text).toContain('Do not forward it.');
    expect(message.html).toContain('SOVEREIGN.OS');
    expect(message.html).toContain('background:#0f0f0f');
    expect(message.html).toContain('https://sovereign.defrag.app/brand-mark.svg');
    expect(message.html).toContain("Optima,'Helvetica Neue',Arial,sans-serif");
    expect(message.html).not.toContain('Georgia');
    expect(message.html).not.toContain("'Times New Roman'");
    expect(message.html).toContain('border-radius:2px');
    expect(message.html).not.toContain('border-radius:999px');
    expect(message.html).toContain('mailto:info@defrag.app');
    expect(message.html).not.toContain('<script');
  });

  it('preserves the exact safe action URL in both HTML and plain text', () => {
    const actionUrl = 'https://app.defrag.app/auth/redeem?token=private-token&returnTo=%2Fapp';
    const message = buildSovereignEmail({
      eyebrow: 'Private sign-in',
      title: 'Return to your Sovereign.OS.',
      intro: 'Continue securely.',
      actionLabel: 'Open Sovereign.OS',
      actionUrl
    });

    expect(message.text).toContain(actionUrl);
    expect(message.html).toContain('https://app.defrag.app/auth/redeem?token=private-token&amp;returnTo=%2Fapp');
  });

  it('escapes user-facing content before placing it in HTML', () => {
    const message = buildSovereignEmail({
      eyebrow: 'Invitation',
      title: '<img src=x onerror=alert(1)>',
      intro: 'A & B',
      actionLabel: 'Review',
      actionUrl: 'https://app.defrag.app/invitation?token=private-token'
    });

    expect(message.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(message.html).toContain('A &amp; B');
    expect(message.html).not.toContain('<img src=x');
  });

  it('rejects credential-bearing or non-web action URLs', () => {
    expect(() => buildSovereignEmail({
      eyebrow: 'Private sign-in',
      title: 'Open',
      intro: 'Continue',
      actionLabel: 'Open',
      actionUrl: 'https://user:password@app.defrag.app/auth/redeem'
    })).toThrow('email_action_url_invalid');

    expect(() => buildSovereignEmail({
      eyebrow: 'Private sign-in',
      title: 'Open',
      intro: 'Continue',
      actionLabel: 'Open',
      actionUrl: 'javascript:alert(1)'
    })).toThrow('email_action_url_invalid');
  });

  it('uses Resend before the Cloudflare email binding and sends the branded payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'resend_email_test' }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    }));
    const bindingSend = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const env = {
      APP_ENV: 'production',
      RESEND_API_KEY: 're_test_key',
      EMAIL: { send: bindingSend },
      TRANSACTIONAL_FROM_EMAIL: 'info@defrag.app',
      PUBLIC_CONTACT_EMAIL: 'info@defrag.app'
    } as unknown as Env;

    expect(transactionalEmailProvider(env)).toBe('resend');
    const result = await sendOperationalEmail(env, {
      to: 'recipient@example.com',
      subject: 'Return to Sovereign.OS',
      text: 'Open your private link.',
      html: '<p>Open your private link.</p>',
      idempotencyKey: 'email-smoke-test',
      category: 'account_signin'
    });

    expect(result).toEqual({ provider: 'resend', id: 'resend_email_test', retryable: false });
    expect(bindingSend).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(options.body));
    expect(payload.from).toBe('Sovereign.OS <info@defrag.app>');
    expect(payload.reply_to).toBe('info@defrag.app');
    expect(payload.tags).toEqual(expect.arrayContaining([
      { name: 'product', value: 'sovereign-os' },
      { name: 'category', value: 'account_signin' },
      { name: 'environment', value: 'production' }
    ]));
  });
});
