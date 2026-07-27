import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./visual-intelligence.css', import.meta.url), 'utf8');

describe('authenticated product flow', () => {
  it('routes account creation through plan confirmation into one Sovereign intelligence experience', () => {
    expect(app).toContain("path === '/onboarding'");
    expect(app).toContain('<PlanOnboarding />');
    expect(app).toContain('safeClientReturnTo');
    expect(main).toContain('<SovereignIntelligenceWorkspace />');
    expect(onboarding).toContain('Choose a plan');
    expect(onboarding).toContain("location.assign('/app')");
  });

  it('makes Stripe-backed tier choice explicit', () => {
    expect(onboarding).toContain('Continue with Free');
    expect(onboarding).toContain('Choose Sovereign+');
    expect(onboarding).toContain('$99 / year');
    expect(onboarding).toContain('$20 / month');
    expect(onboarding).toContain("fetch('/api/v1/billing/checkout'");
  });

  it('persists and restores account-scoped conversation history', () => {
    expect(workspace).toContain("api('/api/v1/threads')");
    expect(workspace).toContain('openThread(thread.id)');
    expect(workspace).toContain('/messages');
    expect(workspace).toContain('Save to Library');
  });

  it('keeps the intelligence canvas primary on desktop and mobile', () => {
    expect(styles).toContain('.intelligence-sidebar');
    expect(styles).toContain('.intelligence-main');
    expect(styles).toContain('.sovereign-composer');
    expect(styles).toContain('@media (max-width: 820px)');
    expect(styles).toContain('min-height: 44px');
  });
});
