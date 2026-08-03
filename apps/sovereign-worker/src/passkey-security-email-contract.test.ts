import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const passkeys = readFileSync(new URL('./auth-passkeys.ts', import.meta.url), 'utf8');

describe('passkey security email contract', () => {
  it('sends a non-blocking, idempotent notice only after a passkey is stored', () => {
    const insert = passkeys.indexOf("INSERT INTO auth_passkeys");
    const notice = passkeys.indexOf('await sendPasskeyAddedNotice');
    expect(insert).toBeGreaterThan(-1);
    expect(notice).toBeGreaterThan(insert);
    expect(passkeys).toContain('passkey_added_notification_failed');
    expect(passkeys).toContain('idempotencyKey: `passkey-added:${passkeyId}`');
    expect(passkeys).toContain("category: 'account_security'");
  });

  it('does not claim access to biometric or device-unlock information', () => {
    expect(passkeys).toContain('Sovereign.OS never receives the biometric or device unlock information used by your authenticator.');
    expect(passkeys).toContain('Email link and six-digit code recovery remain available for the account.');
    expect(passkeys).toContain('If you did not add this passkey');
  });

  it('uses only an email-backed account identity and the private account controls URL', () => {
    expect(passkeys).toContain("subject?.startsWith('email:')");
    expect(passkeys).toContain("new URL('/app', env.PUBLIC_APP_URL || DEFAULT_APP_URL)");
    expect(passkeys).toContain("actionUrl.searchParams.set('panel', 'account')");
  });
});
