import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignWorkspace.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const consentRuntime = readFileSync(new URL('../public/consent.js', import.meta.url), 'utf8');

describe('Sovereign account and workspace shell', () => {
  it('contains the complete contextual navigation inside one chat UI', () => {
    for (const label of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) {
      expect(workspace).toContain(label);
    }
    expect(workspace).toContain('＋ New conversation');
    expect(workspace).toContain('RECENT');
    expect(workspace).toContain('Ask Sovereign…');
  });

  it('keeps Today Baseline-first and correction-ready', () => {
    expect(workspace).toContain('Your Baseline stays steady.');
    expect(workspace).toContain('Current emphasis');
    expect(workspace).toContain('Your experience');
    expect(workspace).toContain('Still unknown');
    expect(workspace).toContain('Does this fit?');
    expect(workspace).toContain('Not today');
  });

  it('routes signup through explicit tier confirmation and preserves safe return context', () => {
    expect(app).toContain('Confirm your email, choose Free or Sovereign+, and enter your private personal intelligence environment.');
    expect(app).toContain('safeClientReturnTo');
    expect(app).toContain('returnTo: requestedReturnTo');
    expect(onboarding).toContain('Your plan is confirmed before the workspace opens.');
    expect(onboarding).toContain('/api/v1/account/onboarding');
    expect(onboarding).toContain('/api/v1/billing/checkout');
  });

  it('allows pinch zoom and includes mobile-safe controls', () => {
    expect(html).not.toContain('user-scalable=no');
    expect(styles).toContain('safe-area-inset-bottom');
    expect(styles).toContain('min-height: 44px');
    expect(styles).toContain('@media (max-width: 800px)');
  });

  it('uses visible labels across private forms', () => {
    for (const label of ['Email address', 'Person', 'Invitation email', 'New system', 'Birth date', 'Birthplace']) {
      expect(`${app}\n${workspace}`).toContain(label);
    }
  });

  it('keeps consent under the invited person’s control', () => {
    expect(workspace).toContain('Send private invitation');
    expect(workspace).toContain('They choose what to allow.');
    expect(app).toContain('Choose what this connection may use.');
    expect(consent).toContain('Manage requested uses.');
    expect(consentRuntime).toContain("fetch('/api/v1/invitations/mine'");
    expect(consentRuntime).toContain('Permission revoked for future use.');
  });

  it('uses direct auth language with visible, enumeration-safe guidance', () => {
    expect(app).toContain('Understand your life in context.');
    expect(app).toContain('Welcome back.');
    expect(app).toContain('Check your inbox. The link expires in 15 minutes and can be used once.');
    expect(app).toContain('No account change was made.');
    expect(app).not.toMatch(/never reveal whether|whether or not an account exists|no password/i);
  });

  it('keeps Library explicit and user-controlled', () => {
    expect(workspace).toContain('Only understandings you deliberately save appear here.');
    expect(workspace).toContain('Save to Library');
    expect(workspace).toContain('Nothing saved yet.');
    expect(workspace).not.toContain('Editable summary');
  });
});
