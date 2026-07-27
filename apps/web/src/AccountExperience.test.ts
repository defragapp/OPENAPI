import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('./ProductionRuntime.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('./auth-polish.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('account access experience', () => {
  it('preserves a safe post-auth destination and gives specific error guidance', () => {
    expect(app).toContain('safeClientReturnTo');
    expect(app).toContain('returnTo: requestedReturnTo');
    expect(app).toContain("problem.reason === 'expired_or_used'");
    expect(app).toContain('No account change was made.');
    expect(app).toContain('The link expires in 15 minutes and can be used once.');
  });

  it('uses approved Baseline-first account language instead of pattern-heavy copy', () => {
    expect(app).toContain('YOUR SOVEREIGN.OS');
    expect(app).toContain('Bring a decision into view with your Baseline underneath it');
    expect(app).toContain('Continue into Sovereign.OS.');
    expect(app).not.toContain('your own patterns in view');
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
    expect(runtime).toContain("'unsupported-callback'");
    expect(runtime).toContain('window.turnstile.reset(widgetId)');
    expect(runtime).toContain("const TURNSTILE_RESET_EVENT = 'sovereign:turnstile-reset'");
  });

  it('centers the widget without an oversized dashed placeholder', () => {
    expect(main).toContain("import './auth-polish.css'");
    expect(css).toContain('.turnstile-frame');
    expect(css).toContain('justify-items: center');
    expect(css).toContain('place-items: center');
    expect(css).toContain('max-width: 100% !important');
    expect(css).not.toContain('border: 1px dashed');
  });
});
