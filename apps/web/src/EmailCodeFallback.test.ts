import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const fallback = readFileSync(new URL('./EmailCodeFallback.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('email code sign-in fallback', () => {
  it('appears only after the same generic verified login response', () => {
    expect(fallback).toContain("url.pathname === '/api/v1/auth/login'");
    expect(fallback).toContain("payload.recovery === 'link_or_code'");
    expect(fallback).toContain("new CustomEvent<CodeReadyDetail>(EMAIL_CODE_READY");
    expect(fallback).not.toContain('account exists');
  });

  it('redeems a six-digit one-time code through the existing auth endpoint', () => {
    expect(fallback).toContain("fetch('/api/v1/auth/redeem'");
    expect(fallback).toContain("body: JSON.stringify({ email: ready.email, code: cleanCode })");
    expect(fallback).toContain('inputMode="numeric"');
    expect(fallback).toContain('autoComplete="one-time-code"');
    expect(fallback).toContain('pattern="[0-9]{6}"');
  });

  it('uses one generic browser error for invalid, expired, used, or locked codes', () => {
    expect(fallback).toContain('That code is invalid or expired. Use the newest email or request a fresh sign-in email.');
    expect(fallback).not.toContain('code_locked');
    expect(fallback).not.toContain('expired_code');
  });

  it('preserves only safe in-app return routes', () => {
    expect(fallback).toContain("parsed.pathname === '/app'");
    expect(fallback).toContain("parsed.pathname.startsWith('/app/')");
    expect(fallback).toContain("parsed.pathname === '/onboarding'");
    expect(fallback).toContain("value.startsWith('//')");
  });

  it('mounts on account pages with accessible responsive styling', () => {
    expect(main).toContain('installEmailCodeFallbackRuntime()');
    expect(main).toContain('<EmailCodeFallback />');
    expect(main).toContain("import './app-shell.css'");
    expect(styles).toContain('.email-code-fallback');
    expect(styles).toContain('min-height:50px');
    expect(styles).toContain('@media(max-width:680px)');
    expect(styles).toContain('@media(prefers-contrast:more)');
    expect(styles).toContain('@media(prefers-reduced-motion:reduce)');
  });
});
