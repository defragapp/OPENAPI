import { describe, expect, it } from 'vitest';
import { buildSovereignEmail } from './email';

describe('Sovereign.OS transactional email', () => {
  it('renders consistent branded HTML and plain text', () => {
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
    expect(message.text).toContain('Do not forward it.');
    expect(message.html).toContain('SOVEREIGN.OS');
    expect(message.html).toContain('background:#0d0d0e');
    expect(message.html).toContain('Open Sovereign.OS');
    expect(message.html).toContain('mailto:info@defrag.app');
    expect(message.html).not.toContain('<script');
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
});
