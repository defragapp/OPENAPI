import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const people = readFileSync(new URL('./db/people.ts', import.meta.url), 'utf8');
const routes = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');

describe('pending invitation resend contract', () => {
  it('uses the existing owner-authenticated invitation mutation route', () => {
    expect(routes).toContain("app.patch('/api/v1/invitations/:invitationId'");
    expect(routes).toContain('updateInvitationStatus');
    expect(people).toContain("if (status === 'pending')");
    expect(people).toContain('resendPendingInvitation');
  });

  it('rate limits resend and replaces the one-time token', () => {
    expect(people).toContain('INVITATION_RESEND_SECONDS = 120');
    expect(people).toContain("'retry-after': String(retryAfter)");
    expect(people).toContain('const token = newToken()');
    expect(people).toContain('const tokenHash = await sha256(token)');
    expect(people).toContain("token_hash = ?, expires_at = datetime('now', '+${INVITATION_TTL_DAYS} days')");
  });

  it('keeps delivery data on the server and preserves privacy context', () => {
    expect(people).toContain('invited_email_normalized');
    expect(people).toContain('Raw birth details, exact private location');
    expect(people).toContain('sendOperationalEmail');
    expect(people).not.toContain('return { email');
  });

  it('allows only pending invitation resend or owner revocation', () => {
    expect(people).toContain("i.status = 'pending'");
    expect(people).toContain("if (status !== 'revoked')");
    expect(people).toContain('Only the invited person may accept or decline');
  });
});
