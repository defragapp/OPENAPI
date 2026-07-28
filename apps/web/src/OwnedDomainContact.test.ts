import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const email = readFileSync(new URL('../../sovereign-worker/src/email.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../../sovereign-worker/src/runtime-entry.ts', import.meta.url), 'utf8');
const publicAndEmailCopy = `${policy}\n${consent}\n${email}`;

describe('owned-domain contact and transactional delivery', () => {
  it('publishes only an address on the domain the project owns', () => {
    expect(publicAndEmailCopy).toContain('info@defrag.app');
    expect(publicAndEmailCopy).not.toContain('info@sovereign.os');
  });

  it('routes production transactional delivery through Resend before any fallback binding', () => {
    expect(email.indexOf('if (env.RESEND_API_KEY)')).toBeLessThan(email.indexOf('if (env.EMAIL)'));
    expect(email).toContain("return 'resend'");
    expect(runtime).toContain("emailProvider === 'resend'");
    expect(runtime).toContain("dependencies.transactionalEmail === 'resend'");
  });

  it('uses the current brand mark and non-pill email action styling', () => {
    expect(email).toContain('https://sovereign.defrag.app/brand-mark.svg');
    expect(email).toContain('border-radius:10px');
    expect(email).not.toContain('border-radius:999px');
  });
});
