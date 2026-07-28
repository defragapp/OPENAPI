import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const email = readFileSync(new URL('../../sovereign-worker/src/email.ts', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../../sovereign-worker/src/runtime-entry.ts', import.meta.url), 'utf8');
const emailSmoke = readFileSync(new URL('../../../scripts/email-smoke.ts', import.meta.url), 'utf8');
const cloudflareWorkflow = readFileSync(new URL('../../../.github/workflows/cloudflare-build-trigger.yml', import.meta.url), 'utf8');
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

  it('requires an actual delivered event instead of treating API acceptance as delivery', () => {
    expect(emailSmoke).toContain('delivered+sovereign-');
    expect(emailSmoke).toContain('https://api.resend.com/emails/');
    expect(emailSmoke).toContain("lastEvent === 'delivered'");
    expect(emailSmoke).toContain('resend_delivery_timeout');
  });

  it('triggers Cloudflare Builds for the exact current main SHA and verifies the live release', () => {
    expect(cloudflareWorkflow).toContain('/builds/triggers/${CF_TRIGGER_UUID}/builds');
    expect(cloudflareWorkflow).toContain('"commit_hash":"${REQUESTED_SHA}"');
    expect(cloudflareWorkflow).toContain('ready.migrationVersion === \'0011_email_code_recovery\'');
    expect(cloudflareWorkflow).toContain("ready.dependencies?.transactionalEmail === 'resend'");
    expect(cloudflareWorkflow).toContain('pnpm smoke:email');
  });
});
