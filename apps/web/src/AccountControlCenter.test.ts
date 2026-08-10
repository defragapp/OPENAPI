import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const controls = readFileSync(new URL('./AccountControlCenter.tsx', import.meta.url), 'utf8');
const dialogRuntime = readFileSync(new URL('./dialog-accessibility.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./account-control.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const authenticatedWorkspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');

describe('mounted Account and Library controls', () => {
  it('exposes Library rename and delete through account-scoped endpoints', () => {
    expect(controls).toContain("api('/api/v1/library')");
    expect(controls).toContain("method: 'PATCH'");
    expect(controls).toContain("method: 'DELETE'");
    expect(controls).toContain('Save title');
    expect(controls).toContain('Delete this saved understanding from your Library?');
  });

  it('reviews, resends, and cancels pending invitations without revealing the recipient address', () => {
    expect(controls).toContain("api('/api/v1/people')");
    expect(controls).toContain("person.invitationStatus === 'pending'");
    expect(controls).toContain('Resend invitation');
    expect(controls).toContain("status: action === 'resend' ? 'pending' : 'revoked'");
    expect(controls).toContain('new one-time invitation link');
    expect(controls).not.toContain('invited_email_normalized');
  });

  it('makes the 14-day account deletion grace period visible and cancellable', () => {
    expect(controls).toContain("api('/api/v1/deletion-jobs')");
    expect(controls).toContain('14-day grace period');
    expect(controls).toContain('Type DELETE to continue');
    expect(controls).toContain("body: JSON.stringify({ approved: true })");
    expect(controls).toContain("body: JSON.stringify({ action: 'cancel' })");
    expect(controls).toContain('Cancel account deletion');
  });

  it('consolidates billing, privacy, terms, support, and permissions without stacking dialogs', () => {
    expect(controls).toContain("api('/api/v1/billing/portal'");
    expect(controls).toContain('People & permissions');
    expect(controls).toContain('setOpen(false);');
    expect(controls).toContain("new CustomEvent('sovereign:open-consent-controls')");
    expect(controls).toContain('https://sovereign.defrag.app/privacy');
    expect(controls).toContain('https://sovereign.defrag.app/terms');
    expect(controls).toContain('mailto:info@defrag.app');
  });

  it('installs a reusable focus trap and restores focus after dialogs close', () => {
    expect(dialogRuntime).toContain('[role="dialog"][aria-modal="true"]');
    expect(dialogRuntime).toContain("event.key !== 'Tab'");
    expect(dialogRuntime).toContain('returnTarget');
    expect(dialogRuntime).toContain('if (target?.isConnected)');
    expect(dialogRuntime).toContain('target?.focus()');
    expect(dialogRuntime).toContain('MutationObserver');
  });

  it('mounts and styles the control center only with the authenticated experience', () => {
    expect(main).toContain("import { AuthenticatedWorkspace } from './AuthenticatedWorkspace'");
    expect(main).toContain('<AuthenticatedWorkspace />');
    expect(authenticatedWorkspace).toContain("import { AccountControlCenter } from './AccountControlCenter'");
    expect(authenticatedWorkspace).toContain('<AccountControlCenter />');
    expect(main).toContain("import './account-control.css'");
    expect(main).toContain('installDialogAccessibility()');
    expect(styles).toContain('.account-control-dialog');
    expect(styles).toContain('.pending-invitation-list');
    expect(styles).toContain('min-height:44px');
    expect(styles).toContain('@media(max-width:640px)');
    expect(styles).toContain('@media(prefers-contrast:more)');
    expect(styles).toContain('@media(prefers-reduced-motion:reduce)');
  });
});