import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./ProductionRuntime.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('./auth-onboarding.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('account access experience', () => {
  it('preserves a safe post-auth destination and gives specific error guidance', () => {
    expect(app).toContain('safeClientReturnTo');
    expect(app).toContain('returnTo: requestedReturnTo');
    expect(app).toContain("problem.reason === 'expired_or_used'");
    expect(app).toContain('No account change was made.');
    expect(app).toContain('The link expires in 15 minutes and can be used once.');
  });

  it('uses standard account language', () => {
    expect(app).toContain('Create your Sovereign.OS account.');
    expect(app).toContain('Start free. Verify your email, then build your Baseline.');
    expect(app).toContain('Sign in to Sovereign.OS.');
    expect(app).toContain('Use your email and the available secure sign-in method for your account.');
    expect(app).not.toMatch(/spiritual promise|one private link|no password/i);
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
    expect(main).toContain("import './auth-onboarding.css'");
    expect(css).toContain('.turnstile-frame');
    expect(css).toContain('justify-items: center');
    expect(css).not.toContain('border: 1px dashed');
  });
});
