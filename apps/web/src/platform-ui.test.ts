import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const authenticatedWorkspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const styles = [
  readFileSync(new URL('./workspace.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./workspace.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./workspace.css', import.meta.url), 'utf8')
].join('\n');

describe('authenticated product flow', () => {
  it('routes account creation through plan confirmation into one workspace', () => {
    expect(app).toContain("path === '/onboarding'");
    expect(app).toContain('<PlanOnboarding />');
    expect(app).toContain('safeClientReturnTo');
    expect(main).toContain('<AuthenticatedWorkspace />');
    expect(authenticatedWorkspace).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
    expect(onboarding).toContain('Choose a plan');
    expect(onboarding).toContain("location.replace('/app')");
  });

  it('makes Stripe-backed tier choice explicit', () => {
    expect(onboarding).toContain('Continue with Free');
    expect(onboarding).toContain('Choose Sovereign+');
    expect(onboarding).toContain('Annual billing');
    expect(onboarding).toContain('Monthly billing');
    expect(onboarding).toContain('Stripe checkout shows the current price before you confirm.');
    expect(onboarding).not.toMatch(/\$99|\$20|\$8\.25|save \$141/);
    expect(onboarding).toContain("fetch('/api/v1/billing/checkout'");
    expect(onboarding).toContain('location.assign(data.checkout.url)');
  });

  it('persists and restores account-scoped conversation history', () => {
    expect(workspace).toContain("api('/api/v1/threads')");
    expect(workspace).toContain('openThread(thread.id)');
    expect(workspace).toContain('/messages');
    expect(workspace).toContain("action.type === 'save_to_library'");
    expect(workspace).toContain('saveAnswer');
  });

  it('renders entitlement-aware plan actions without weakening the answer contract', () => {
    expect(workspace).toContain('interfaceActions: payload.interfaceActions');
    expect(workspace).toContain("action?.type === 'show_plan'");
    expect(workspace).toContain("sessionStorage.setItem('sovereign:upgrade-continuity'");
    expect(workspace).toContain("setSurface('You')");
    expect(workspace).toContain('onShowPlan(primaryPlanAction.feature)');
    expect(workspace).toContain('libraryPlanAction');
    expect(workspace).toContain('covenantPlanAction');
  });

  it('keeps the conversation primary on desktop and mobile', () => {
    expect(styles).toContain('.intelligence-sidebar');
    expect(styles).toContain('.intelligence-main');
    expect(styles).toContain('.sovereign-composer');
    expect(styles).toContain('@media (max-width: 900px)');
    expect(styles).toContain('min-height: 44px');
  });

  it('supports unknown birth time without guessed outputs', () => {
    expect(workspace).toContain("['unknown', 'Unknown'");
    expect(workspace).toContain('You can continue without a birth time.');
    expect(workspace).toContain('Sovereign will not guess unavailable values.');
  });

  it('requires an explicit, removable current-context choice without requesting device location', () => {
    expect(workspace).toContain("locationPrecision: 'geocentric'");
    expect(workspace).toContain("api('/api/v1/current-conditions', { method: 'DELETE' })");
    expect(workspace).toContain('Enable for six hours');
    expect(workspace).toContain('Remove current context');
    expect(workspace).toContain('does not request your device location');
    expect(workspace).not.toContain('navigator.geolocation');
  });
});
