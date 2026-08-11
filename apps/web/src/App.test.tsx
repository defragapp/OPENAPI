import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const authenticatedWorkspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const styles = [
  readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./sovereign-cohesion.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./sovereign-modern.css', import.meta.url), 'utf8')
].join('\n');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const consentRuntime = readFileSync(new URL('../public/consent.js', import.meta.url), 'utf8');

describe('Sovereign account and workspace shell', () => {
  it('contains every product surface inside one canonical workspace', () => {
    for (const label of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) expect(workspace).toContain(`name: '${label}'`);
    expect(workspace).toContain('New exploration');
    expect(workspace).toContain('Recent explorations');
    expect(main).toContain('<AuthenticatedWorkspace />');
    expect(authenticatedWorkspace).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
  });

  it('verifies the account before mounting any private product surface', () => {
    expect(authenticatedWorkspace).toContain("fetch('/api/v1/account/onboarding'");
    expect(authenticatedWorkspace).toContain("fetch('/api/v1/baseline/status'");
    expect(authenticatedWorkspace).toContain('location.replace(`/login?returnTo=');
    expect(authenticatedWorkspace).toContain("location.replace(billingReturn ? `/onboarding?billing=${encodeURIComponent(billingReturn)}` : '/onboarding')");
    expect(authenticatedWorkspace).toContain("billingReturn === 'success'");
    expect(authenticatedWorkspace.indexOf("state !== 'ready'")).toBeLessThan(authenticatedWorkspace.indexOf('<SovereignIntelligenceWorkspace onboardingVerified />'));
    expect(app).toContain('return <PublicNotFound />');
    expect(app).not.toContain('SovereignIntelligenceWorkspace');
  });

  it('keeps Today Baseline-first, qualified, and correction-ready', () => {
    for (const phrase of ['Your Baseline is active.', 'What remains steady', 'Temporary current context', 'Not today']) {
      expect(workspace).toContain(phrase);
    }
    expect(workspace).toContain('It does not determine your behavior.');
    expect(workspace).toContain('Your actual response');
  });

  it('routes signup through explicit plan confirmation without duplicating live prices', () => {
    expect(app).toContain('Create your account, verify your email, then build the personal foundation Sovereign uses.');
    expect(app).toContain('safeClientReturnTo');
    expect(app).toContain("if (path === '/onboarding') return <PlanOnboarding />;");
    expect(onboarding).toContain('/api/v1/account/onboarding');
    expect(onboarding).toContain('/api/v1/billing/checkout');
    expect(onboarding).toContain('Monthly billing');
    expect(onboarding).toContain('Annual billing');
    expect(onboarding).toContain('Stripe checkout shows the current price before you confirm.');
    expect(onboarding).not.toMatch(/\$99|\$20|\$8\.25|save \$141/);
  });

  it('allows pinch zoom and includes mobile-safe controls', () => {
    expect(html).not.toContain('user-scalable=no');
    expect(styles).toContain('safe-area-inset-bottom');
    expect(styles).toContain('min-height: 44px');
    expect(styles).toContain('@media (max-width: 700px)');
    expect(styles).toContain('@media (max-width: 900px)');
  });

  it('uses visible labels across private forms', () => {
    for (const label of ['Email address', 'Invitation email', 'New system', 'Birth date', 'Birthplace', 'Birth-time certainty']) {
      expect(`${app}\n${workspace}`).toContain(label);
    }
  });

  it('keeps consent under the invited person’s control', () => {
    expect(workspace).toContain('Send private invitation');
    expect(workspace).toContain('Adding a name is not permission.');
    expect(app).toContain('Choose what this connection may use.');
    expect(consent).toContain('Manage requested uses.');
    expect(consentRuntime).toContain("fetch('/api/v1/invitations/mine'");
    expect(consentRuntime).toContain('Permission revoked for future use.');
  });

  it('keeps Library explicit and user-controlled', () => {
    expect(workspace).toContain('Library is not a journal or transcript archive.');
    expect(workspace).toContain("action.type === 'save_to_library'");
    expect(workspace).toContain('Save this understanding');
    expect(workspace).toContain('Nothing has been kept yet.');
  });
});
