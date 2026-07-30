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
    expect(workspace).toContain('New question');
    expect(workspace).toContain('Recent conversations');
    expect(main).toContain('<AuthenticatedWorkspace />');
    expect(authenticatedWorkspace).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
  });

  it('verifies the account before mounting any private product surface', () => {
    expect(authenticatedWorkspace).toContain("fetch('/api/v1/account/onboarding'");
    expect(authenticatedWorkspace).toContain('location.replace(`/login?returnTo=');
    expect(authenticatedWorkspace).toContain("location.replace('/onboarding')");
    expect(authenticatedWorkspace.indexOf("state !== 'ready'")).toBeLessThan(authenticatedWorkspace.indexOf('<SovereignIntelligenceWorkspace onboardingVerified />'));
    expect(app).toContain('return <PublicNotFound />');
    expect(app).not.toContain('SovereignIntelligenceWorkspace');
  });

  it('keeps Today Baseline-first and immediately understandable', () => {
    for (const phrase of ['Your Baseline', 'May deserve more attention now', 'What changes under pressure?', 'What does this make possible at its best?', 'Where this may matter', 'Not today']) {
      expect(workspace).toContain(phrase);
    }
    expect(workspace).toContain('Temporary current context does not determine your behavior.');
    expect(workspace).toContain('See what is steady and what may matter more right now.');
  });

  it('routes signup through explicit plan confirmation without changing prices', () => {
    expect(app).toContain('Start free. Verify your email, choose a plan, and build your Baseline.');
    expect(app).toContain('safeClientReturnTo');
    expect(onboarding).toContain('/api/v1/account/onboarding');
    expect(onboarding).toContain('/api/v1/billing/checkout');
    expect(onboarding).toContain('$20 / month');
    expect(onboarding).toContain('$99 / year');
    expect(onboarding).toContain('Choose Free or Sovereign+.');
  });

  it('allows pinch zoom and includes mobile-safe controls', () => {
    expect(html).not.toContain('user-scalable=no');
    expect(styles).toContain('safe-area-inset-bottom');
    expect(styles).toContain('min-height: 44px');
    expect(styles).toContain('@media (max-width: 700px)');
    expect(styles).toContain('@media (max-width: 900px)');
  });

  it('uses visible labels across private forms', () => {
    for (const label of ['Email address', 'Invitation email', 'New group', 'Birth date', 'Birthplace', 'Birth-time certainty']) {
      expect(`${app}\n${workspace}`).toContain(label);
    }
  });

  it('keeps consent under the invited person’s control in plain language', () => {
    expect(workspace).toContain('Send private invitation');
    expect(workspace).toContain('Adding a name does not give you access to their information.');
    expect(app).toContain('Choose what Sovereign may use about you.');
    expect(app).toContain('Accept invitation and choose permissions');
    expect(consent).toContain('Review and change each permission.');
    expect(consentRuntime).toContain("fetch('/api/v1/invitations/mine'");
    expect(consentRuntime).toContain('Permission not allowed.');
  });

  it('keeps Library explicit and user-controlled', () => {
    expect(workspace).toContain('Library contains selected insights, not every conversation.');
    expect(workspace).toContain("action.type === 'save_to_library'");
    expect(workspace).toContain('Save this insight');
    expect(workspace).toContain('Nothing saved yet.');
  });

  it('removes abstract workspace headings and control labels', () => {
    for (const phrase of ['Your intelligence begins with your Baseline.', 'Bring the whole structure into view.', 'Keep what changes your understanding.', 'Opening your intelligence.', 'Why this is personal']) {
      expect(workspace).not.toContain(phrase);
    }
    expect(workspace).toContain('Manage your Baseline, privacy, plan, and account.');
    expect(workspace).toContain('Supporting details');
    expect(workspace).toContain('What shaped this answer');
  });
});