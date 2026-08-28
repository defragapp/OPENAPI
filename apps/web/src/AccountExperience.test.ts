import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const passkey = readFileSync(new URL('./PasskeyAuthentication.tsx', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./ProductionRuntime.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const accountControls = readFileSync(new URL('./AccountControlCenter.tsx', import.meta.url), 'utf8');
const accountControlCss = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('account access experience', () => {
  it('preserves a safe post-auth destination and gives specific error guidance', () => {
    expect(app).toContain('safeClientReturnTo');
    expect(app).toContain('returnTo: requestedReturnTo');
    expect(app).toContain("problem.reason === 'expired_or_used'");
    expect(app).toContain('No account change was made.');
    expect(app).toContain('The one-time link expires in 15 minutes.');
    expect(app).toContain('The six-digit code expires in 10 minutes.');
    expect(app).not.toContain('The one-time link and six-digit code expire in 15 minutes.');
    expect(app).toContain("'Account creation is temporarily unavailable'");
    expect(app).toContain("'Sign-in is temporarily unavailable'");
  });

  it('uses Baseline-first account language without introducing passwords', () => {
    expect(app).toContain('Create your Sovereign.OS account.');
    expect(app).toContain('Start free. Verify your email, then build your Baseline.');
    expect(app).toContain('Your Baseline becomes the private reference Sovereign uses across self, decisions, relationships, and systems.');
    expect(app).toContain('Sign in to Sovereign.OS.');
    expect(app).toContain('Use your email and the secure sign-in method available for your account.');
    expect(passkey).toContain('Choose a secure way to sign in.');
    expect(passkey).toContain('Use your device passkey, or enter your email below for a one-time link and six-digit code.');
    expect(passkey).not.toContain('Return to your Baseline and the questions you were exploring.');
    expect(app).not.toMatch(/spiritual promise|one private link|no password/i);
    expect(passkey).not.toMatch(/password reset|forgot password/i);
  });

  it('renders accessible field and security errors', () => {
    expect(app).toContain('aria-invalid={Boolean(fieldErrors.email)}');
    expect(app).toContain('aria-invalid={Boolean(fieldErrors.name)}');
    expect(app).toContain('data-turnstile-caption');
    expect(app).toContain('field-error');
    expect(app).toContain("window.addEventListener('sovereign:turnstile-state'");
  });

  it('manages single-use Turnstile tokens as an explicit widget lifecycle', () => {
    expect(runtime).toContain("size: 'flexible'");
    expect(runtime).toContain("'expired-callback'");
    expect(runtime).toContain("'timeout-callback'");
    expect(runtime).toContain('window.turnstile.reset(widgetId)');
  });

  it('loads the consolidated auth and onboarding stylesheet', () => {
    expect(main).toContain("import './app-shell.css'");
    expect(css).toContain('.turnstile-frame');
    expect(css).toContain('justify-items: center');
    expect(css).not.toContain('border: 1px dashed');
  });

  it('connects the canonical live Stripe support link without granting entitlements', () => {
    expect(accountControls).toContain("const SUPPORT_PAYMENT_URL = 'https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02'");
    expect(accountControls).not.toContain('https://donate.stripe.com/7sY6oG1LDcls8s90x267S03');
    expect(accountControls).toContain('Support continued Sovereign.OS development');
    expect(accountControls).toContain('one-time amount from $1');
    expect(accountControls).not.toContain('$5 to $500');
    expect(accountControls).toContain('Support does not grant Sovereign+ access, ownership, influence, tax-deductible status, or a promise of future features.');
    expect(accountControls).toContain('target="_blank" rel="noreferrer"');
    expect(accountControlCss).toContain('.support-development-section');
    expect(accountControlCss).toContain('.support-development-link');
  });
});
