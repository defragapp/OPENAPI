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
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const consentRuntime = readFileSync(new URL('../public/consent.js', import.meta.url), 'utf8');

describe('Sovereign account and space shell', () => {
  it('contains every product surface inside one canonical space', () => {
    for (const label of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) expect(space).toContain(`name: '${label}'`);
    expect(space).toContain('New exploration');
    expect(space).toContain('Recent explorations');
    expect(main).toContain('<AuthenticatedSpace />');
    expect(authenticatedSpace).toContain('<SovereignIntelligenceSpace onboardingVerified />');
  });

  it('verifies the account before mounting any private product surface', () => {
    expect(authenticatedSpace).toContain("fetch('/api/v1/account/onboarding'");
    expect(authenticatedSpace).toContain("fetch('/api/v1/baseline/status'");
    expect(authenticatedSpace).toContain('location.replace(`/login?returnTo=');
    expect(authenticatedSpace).toContain("location.replace(billingReturn ? `/onboarding?billing=${encodeURIComponent(billingReturn)}` : '/onboarding')");
    expect(authenticatedSpace).toContain("billingReturn === 'success'");
    expect(authenticatedSpace.indexOf("state !== 'ready'")).toBeLessThan(authenticatedSpace.indexOf('<SovereignIntelligenceSpace onboardingVerified />'));
    expect(app).toContain('return <PublicNotFound />');
    expect(app).not.toContain('SovereignIntelligenceSpace');
  });

  it('keeps Today Baseline-first and correction-ready', () => {
    for (const phrase of ['Your Baseline', 'More relevant now', 'What changes under pressure?', 'Gift expression', 'Where this may matter', 'Not today']) {
      expect(space).toContain(phrase);
    }
    expect(space).toContain('Current context does not determine your behavior.');
  });

  it('routes signup through explicit plan confirmation without changing prices', () => {
    expect(app).toContain('Create your account, verify your email, then build the personal foundation Sovereign uses.');
    expect(app).toContain('safeClientReturnTo');
    expect(app).toContain("if (path === '/onboarding') return <PlanOnboarding />;");
    expect(onboarding).toContain('/api/v1/account/onboarding');
    expect(onboarding).toContain('/api/v1/billing/checkout');
    expect(onboarding).toContain('$20 / month');
    expect(onboarding).toContain('$99 / year');
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
      expect(`${app}\n${space}`).toContain(label);
    }
  });

  it('keeps consent under the invited person’s control', () => {
    expect(space).toContain('Send private invitation');
    expect(space).toContain('Adding a name is not permission.');
    expect(app).toContain('Choose what this connection may use.');
    expect(consent).toContain('Manage requested uses.');
    expect(consentRuntime).toContain("fetch('/api/v1/invitations/mine'");
    expect(consentRuntime).toContain('Permission revoked for future use.');
  });

  it('keeps Library explicit and user-controlled', () => {
    expect(space).toContain('Library is not a journal or transcript archive.');
    expect(space).toContain("action.type === 'save_to_library'");
    expect(space).toContain('Save this understanding');
    expect(space).toContain('Nothing has been kept yet.');
  });
});
