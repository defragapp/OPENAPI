import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const rights = readFileSync(
  new URL('./PolicyGateAccountRights.tsx', import.meta.url),
  'utf8'
);

const authenticatedWorkspace = readFileSync(
  new URL('./AuthenticatedWorkspace.tsx', import.meta.url),
  'utf8'
);

const runtimeEntry = readFileSync(
  new URL('../../sovereign-worker/src/runtime-entry.ts', import.meta.url),
  'utf8'
);

const launchCss = readFileSync(
  new URL('./authenticated-launch-cohesion-v1.css', import.meta.url),
  'utf8'
);

describe('stale-policy account rights', () => {
  it('renders direct consumer account controls while policy review is required', () => {
    expect(authenticatedWorkspace).toContain(
      "import { PolicyGateAccountRights } from './PolicyGateAccountRights'"
    );

    expect(authenticatedWorkspace).toContain('<PolicyGateAccountRights />');

    expect(authenticatedWorkspace).not.toContain(
      'through the account APIs'
    );

    expect(rights).toContain('Download my data');
    expect(rights).toContain('Manage billing');
    expect(rights).toContain('Sign out');
    expect(rights).toContain('Sign out all sessions');
    expect(rights).toContain('Account deletion');
    expect(rights).toContain('https://sovereign.defrag.app/privacy');
    expect(rights).toContain('mailto:info@defrag.app');
  });

  it('uses only server-authorized stale-policy account-rights routes', () => {
    expect(rights).toContain("fetch('/api/v1/account/export'");
    expect(rights).toContain("'/api/v1/auth/logout'");
    expect(rights).toContain("'/api/v1/auth/logout-all'");
    expect(rights).toContain("'/api/v1/billing/portal'");
    expect(rights).toContain("'/api/v1/deletion-jobs'");

    expect(runtimeEntry).toContain("'POST /api/v1/account/export'");
    expect(runtimeEntry).toContain("'POST /api/v1/auth/logout'");
    expect(runtimeEntry).toContain("'POST /api/v1/auth/logout-all'");
    expect(runtimeEntry).toContain("'GET /api/v1/billing/entitlements'");
    expect(runtimeEntry).toContain("'POST /api/v1/billing/portal'");
    expect(runtimeEntry).toContain(
      "url.pathname === '/api/v1/deletion-jobs'"
    );
    expect(runtimeEntry).toContain(
      "url.pathname.startsWith('/api/v1/deletion-jobs/')"
    );
  });

  it('does not expose normal private intelligence through the policy-rights component', () => {
    expect(rights).not.toContain('/api/v1/library');
    expect(rights).not.toContain('/api/v1/people');
    expect(rights).not.toContain('/api/v1/threads');
    expect(rights).not.toContain('SovereignIntelligenceWorkspace');

    const rightsIndex = authenticatedWorkspace.indexOf(
      '<PolicyGateAccountRights />'
    );

    const workspaceIndex = authenticatedWorkspace.indexOf(
      'data-workspace-contract="one-room"'
    );

    expect(rightsIndex).toBeGreaterThan(-1);
    expect(workspaceIndex).toBeGreaterThan(rightsIndex);
    expect(authenticatedWorkspace).toContain(
      "if (state !== 'ready')"
    );
  });

  it('keeps destructive account actions explicit and reversible during grace', () => {
    expect(rights).toContain("deletePhrase !== 'DELETE'");
    expect(rights).toContain('Type DELETE to continue');
    expect(rights).toContain(
      "body: JSON.stringify({ approved: true })"
    );
    expect(rights).toContain(
      "body: JSON.stringify({ action: 'cancel' })"
    );
    expect(rights).toContain('14-day grace period');
    expect(rights).toContain('Cancel account deletion');
  });

  it('keeps account-rights controls touch accessible on small screens', () => {
    expect(launchCss).toContain('.policy-gate-account-rights');
    expect(launchCss).toContain('.policy-gate-rights-actions');
    expect(launchCss).toContain('min-height: 44px');
    expect(launchCss).toContain('@media (max-width: 640px)');
    expect(launchCss).toContain('grid-template-columns: minmax(0, 1fr)');
  });
});
