import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const flow = readFileSync(new URL('./AccountFlow.tsx', import.meta.url), 'utf8');
const passwordKey = readFileSync(new URL('./PasswordKey.ts', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./account-flow.css', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');

describe('Sovereign.OS account and onboarding funnel', () => {
  it('uses the dedicated account flow for every account setup page', () => {
    for (const route of ['/login', '/signup', '/forgot-password', '/reset-password', '/onboarding']) {
      expect(main).toContain(route);
    }
    expect(main).toContain("import { AccountFlow } from './AccountFlow'");
    expect(main).toContain('<AccountFlow />');
  });

  it('offers configured OAuth alongside email and password', () => {
    expect(flow).toContain("modes?.apple === 'configured'");
    expect(flow).toContain("modes?.google === 'configured'");
    expect(flow).toContain('Continue with Apple');
    expect(flow).toContain('Continue with Google');
    expect(flow).toContain('autoComplete="current-password"');
    expect(flow).toContain('Forgot password?');
  });

  it('keeps password stretching and private-key encryption in the browser', () => {
    for (const required of [
      "name: 'PBKDF2'",
      '600_000',
      "name: 'AES-GCM'",
      "name: 'Ed25519'",
      'encryptedPrivateKey',
      'passwordProofMessage'
    ]) {
      expect(passwordKey).toContain(required);
    }
    expect(flow).toContain("createPasswordEnvelope(password)");
    expect(flow).toContain("postJson('/api/v1/auth/password/challenge'");
    expect(flow).toContain('signPasswordChallenge(email, password, challenge)');
    expect(flow).toContain('challengeId: challenge.challengeId');
    expect(flow).toContain('signature,');
  });

  it('preserves paid intent through signup sign-in and onboarding', () => {
    expect(flow).toContain("plan === 'sovereign_plus'");
    expect(flow).toContain('turnstileToken: turnstileToken()');
    expect(flow).toContain('plan,');
    expect(flow).toContain('interval');
    expect(flow).toContain('Already have an account? Sign in');
    expect(flow).toContain('Continue to secure checkout');
    expect(flow).toContain("postJson('/api/v1/billing/checkout', { interval, source: 'onboarding' }, true)");
    expect(pricing).toContain('/signup?plan=sovereign_plus&amp;interval=monthly');
    expect(pricing).toContain('/signup?plan=sovereign_plus&amp;interval=annual');
    expect(pricing).toContain('/signup?plan=free');
  });

  it('collects the complete initial Baseline input after plan selection', () => {
    for (const field of ['birthDate', 'birthplace', 'birthTimezone', 'birthTimeCertainty', 'locationPrecision']) {
      expect(flow).toContain(`name="${field}"`);
    }
    expect(flow).toContain('Build your starting map.');
    expect(flow).toContain('Raw birth data and exact private location are not sent to the AI model.');
  });

  it('keeps account and onboarding screens usable on phones', () => {
    expect(css).toContain('@media (max-width: 680px)');
    expect(css).toContain('.onboarding-plan-grid');
    expect(css).toContain('grid-template-columns: 1fr');
    expect(css).toContain('min-height: 50px');
  });
});
