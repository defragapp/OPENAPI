import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const authenticatedSpace = readFileSync(new URL('./AuthenticatedSpace.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const space = readFileSync(new URL('./SovereignIntelligenceSpace.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const styles = [
  readFileSync(new URL('./space-chat.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./sovereign-cohesion.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./sovereign-modern.css', import.meta.url), 'utf8')
].join('\n');

describe('authenticated product flow', () => {
  it('routes account creation through plan confirmation into one space', () => {
    expect(app).toContain("path === '/onboarding'");
    expect(app).toContain('<PlanOnboarding />');
    expect(app).toContain('safeClientReturnTo');
    expect(main).toContain('<AuthenticatedSpace />');
    expect(authenticatedSpace).toContain('<SovereignIntelligenceSpace onboardingVerified />');
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
    expect(space).toContain("api('/api/v1/threads')");
    expect(space).toContain('openThread(thread.id)');
    expect(space).toContain('/messages');
    expect(space).toContain("action.type === 'save_to_library'");
    expect(space).toContain('saveAnswer');
  });

  it('renders entitlement-aware plan actions without weakening the answer contract', () => {
    expect(space).toContain('interfaceActions: payload.interfaceActions');
    expect(space).toContain("action?.type === 'show_plan'");
    expect(space).toContain("location.assign('/pricing')");
    expect(space).toContain('libraryPlanAction');
    expect(space).toContain('covenantPlanAction');
  });

  it('keeps the conversation primary on desktop and mobile', () => {
    expect(styles).toContain('.intelligence-sidebar');
    expect(styles).toContain('.intelligence-main');
    expect(styles).toContain('.sovereign-composer');
    expect(styles).toContain('@media (max-width: 900px)');
    expect(styles).toContain('min-height: 44px');
  });

  it('supports unknown birth time without guessed outputs', () => {
    expect(space).toContain("['unknown', 'Unknown'");
    expect(space).toContain('A supported path.');
    expect(space).toContain('Sovereign will not guess unavailable values.');
  });

  it('requires an explicit, removable current-context choice without requesting device location', () => {
    expect(space).toContain("locationPrecision: 'geocentric'");
    expect(space).toContain("api('/api/v1/current-conditions', { method: 'DELETE' })");
    expect(space).toContain('Enable for six hours');
    expect(space).toContain('Remove current context');
    expect(space).toContain('does not request or store your device location');
    expect(space).not.toContain('navigator.geolocation');
  });
});
