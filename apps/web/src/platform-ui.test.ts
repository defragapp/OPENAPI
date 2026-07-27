import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignWorkspace.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');

describe('authenticated product flow', () => {
  it('routes account creation through plan confirmation into one workspace', () => {
    expect(app).toContain("path === '/onboarding'");
    expect(app).toContain('<PlanOnboarding />');
    expect(app).toContain('<SovereignWorkspace />');
    expect(app).toContain("payload.next === '/onboarding'");
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

  it('keeps the conversation primary on desktop and mobile', () => {
    expect(styles).toContain('.chat-sidebar');
    expect(styles).toContain('.conversation-shell');
    expect(styles).toContain('.chat-composer');
    expect(styles).toContain('@media (max-width: 800px)');
    expect(styles).toContain('min-height: 44px');
  });
});
