import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const people = readFileSync(new URL('./db/people.ts', import.meta.url), 'utf8');
const routes = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');

describe('pending invitation resend and cancellation contract', () => {
  it('uses the existing owner-authenticated invitation mutation route', () => {
    expect(routes).toContain("app.patch('/api/v1/invitations/:invitationId'");
    expect(routes).toContain('updateInvitationStatus');
    expect(people).toContain("if (status === 'pending')");
    expect(people).toContain('resendPendingInvitation');
  });

  it('cancels only a pending invitation before sending lifecycle notices', () => {
    const cancellationUpdate = people.indexOf("UPDATE invitations SET status = 'revoked'");
    const changedCheck = people.indexOf("if ((result.meta?.changes ?? 0) === 0)", cancellationUpdate);
    const notice = people.indexOf("notifyInvitationLifecycle(env, { invitationId, kind: 'revoked' })", changedCheck);
    expect(cancellationUpdate).toBeGreaterThan(-1);
    expect(people.slice(cancellationUpdate, changedCheck)).toContain("status = 'pending'");
    expect(changedCheck).toBeGreaterThan(cancellationUpdate);
    expect(notice).toBeGreaterThan(changedCheck);
  });

  it('rate limits resend and loads the previous one-time token state', () => {
    expect(people).toContain('INVITATION_RESEND_SECONDS = 120');
    expect(people).toContain("'retry-after': String(retryAfter)");
    expect(people).toContain('i.token_hash, i.expires_at');
    expect(people).toContain('token_hash: string | null');
    expect(people).toContain('const token = newToken()');
    expect(people).toContain('const tokenHash = await sha256(token)');
  });

  it('commits the new token atomically before sending the replacement email', () => {
    const update = people.indexOf('SET token_hash = ?, expires_at = datetime');
    const claimCheck = people.indexOf("if ((updated.meta?.changes ?? 0) !== 1)", update);
    const delivery = people.indexOf('await sendOperationalEmail(env', claimCheck);
    expect(update).toBeGreaterThan(-1);
    expect(people.slice(update, claimCheck)).toContain("status = 'pending' AND created_at = ?");
    expect(claimCheck).toBeGreaterThan(update);
    expect(delivery).toBeGreaterThan(claimCheck);
  });

  it('classifies resends and restores the previous token state if Resend fails', () => {
    expect(people).toContain("category: 'relationship_invitation_resend'");
    const delivery = people.indexOf("category: 'relationship_invitation_resend'");
    const catchBlock = people.indexOf('} catch (error) {', delivery);
    const rollback = people.indexOf('SET token_hash = ?, expires_at = ?, created_at = ?', catchBlock);
    const guardedRollback = people.indexOf("status = 'pending' AND token_hash = ?", rollback);
    const oldStateBind = people.indexOf('row.token_hash, row.expires_at, row.created_at', guardedRollback);
    expect(catchBlock).toBeGreaterThan(delivery);
    expect(rollback).toBeGreaterThan(catchBlock);
    expect(guardedRollback).toBeGreaterThan(rollback);
    expect(oldStateBind).toBeGreaterThan(guardedRollback);
  });

  it('keeps delivery data server-side and excludes private Baseline inputs', () => {
    expect(people).toContain('invited_email_normalized');
    expect(people).toContain('Raw birth details, exact private location');
    expect(people).not.toContain('return { email');
  });
});
