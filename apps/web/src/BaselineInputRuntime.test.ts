import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const runtime = read('./BaselineInputRuntime.ts');
const main = read('./main.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');

describe('Baseline birthplace timezone correction', () => {
  it('installs before the authenticated workspace can submit Baseline input', () => {
    expect(main).toContain("import { installBaselineInputRuntime } from './BaselineInputRuntime'");
    expect(main).toContain('installBaselineInputRuntime();');
    expect(main.indexOf('installBaselineInputRuntime();')).toBeLessThan(main.indexOf('ReactDOM.createRoot'));
  });

  it('makes the birthplace timezone explicit, valid, reviewable, and persistent for the flow', () => {
    expect(runtime).toContain("const BASELINE_ENDPOINT = '/api/v1/baseline/onboarding'");
    expect(runtime).toContain("caption.textContent = 'Birthplace time zone'");
    expect(runtime).toContain("input.name = 'birthTimezone'");
    expect(runtime).toContain("input.setCustomValidity(valid ? ''");
    expect(runtime).toContain("window.sessionStorage.setItem(STORAGE_KEY, timezone)");
    expect(runtime).toContain("row.dataset.baselineTimezoneReview = 'true'");
    expect(runtime).toContain("value.textContent = selectedBirthTimezone");
    expect(runtime).toContain("new Intl.DateTimeFormat('en-US', { timeZone: value })");
  });

  it('overrides the browser-local fallback with the timezone the user reviewed', () => {
    expect(workspace).toContain('birthTimezone: timezone');
    expect(runtime).toContain('payload.birthTimezone = timezone');
    expect(runtime).toContain("throw new Error('Choose a valid birthplace time zone before building your Baseline.')");
    expect(runtime.indexOf('payload.birthTimezone = timezone')).toBeLessThan(runtime.indexOf('nativeFetch(input, { ...init, body: JSON.stringify(payload) })'));
  });
});
