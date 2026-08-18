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

  it('keeps raw uncertainty provenance out of primary Library rows', () => {
    expect(controls).toContain('uncertainty?: string');
    expect(controls).toContain(
      "item.updatedAt ? `Updated ${new Date(item.updatedAt).toLocaleDateString()}` : 'Saved privately'"
    );
    expect(controls).not.toContain(
      ' · uncertainty ${item.body.uncertainty}'
    );
  });

  it('downloads account data without exposing implementation language', () => {
    expect(controls).toContain("fetch('/api/v1/account/export'");
    expect(controls).toContain("credentials: 'same-origin'");
    expect(controls).toContain("'x-idempotency-key': crypto.randomUUID()");
    expect(controls).toContain("anchor.download = 'sovereign-account-export.json'");
    expect(controls).toContain('Download my data');
    expect(controls).toContain('Sovereign did not keep a separate copy.');
    for (const phrase of ['authenticated request', 'provider identifiers', 'export artifact', 'Download private JSON export']) {
      expect(controls).not.toContain(phrase);
    }
  });

  it('reviews, resends, and cancels pending invitations without revealing the recipient address', () => {
    expect(controls).toContain("api('/api/v1/people')");
    expect(controls).toContain("person.invitationStatus === 'pending'");
    expect(controls).toContain('Resend invitation');
    expect(controls).toContain("status: action === 'resend' ? 'pending' : 'revoked'");
    expect(controls).toContain('new one-time invitation link');
    expect(controls).not.toContain('invited_email_normalized');
    expect(controls).not.toContain('Server-side rate limits prevent repeated delivery.');
  });

  it('makes the 14-day account deletion grace period visible and cancellable without raw status enums', () => {
    expect(controls).toContain("api('/api/v1/deletion-jobs')");
    expect(controls).toContain('14-day grace period');
    expect(controls).toContain('Type DELETE to continue');
    expect(controls).toContain("body: JSON.stringify({ approved: true })");
    expect(controls).toContain("body: JSON.stringify({ action: 'cancel' })");
    expect(controls).toContain('Cancel account deletion');
    expect(controls).not.toContain('Status: {deletionJob.status}');
    expect(controls).not.toContain('required billing and legal retention');
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

  it('does not surface backend message/error fields as product copy', () => {
    expect(controls).not.toContain("body.message || body.error");
    expect(controls).toContain("response.status === 403");
    expect(controls).toContain("response.status === 404");
    expect(controls).toContain("response.status >= 500");
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