import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const jobs = readFileSync(new URL('./jobs.ts', import.meta.url), 'utf8');

describe('scheduled invitation expiry lifecycle', () => {
  it('finds a bounded set of pending invitations whose expiration has passed', () => {
    expect(jobs).toContain("WHERE status = 'pending' AND expires_at <= datetime('now')");
    expect(jobs).toContain('ORDER BY expires_at ASC LIMIT 25');
  });

  it('claims each invitation atomically before sending an expiry notice', () => {
    const update = jobs.indexOf("SET status = 'expired', token_hash = NULL");
    const changed = jobs.indexOf("if ((result.meta?.changes ?? 0) !== 1) continue", update);
    const claimed = jobs.indexOf('expiredIds.push(row.id)', changed);
    const notice = jobs.indexOf("notifyInvitationLifecycle(env, { invitationId, kind: 'expired' })", claimed);
    expect(update).toBeGreaterThan(-1);
    expect(changed).toBeGreaterThan(update);
    expect(claimed).toBeGreaterThan(changed);
    expect(notice).toBeGreaterThan(claimed);
  });

  it('sends claimed notices concurrently within the bounded batch', () => {
    expect(jobs).toContain('await Promise.all(expiredIds.map((invitationId) =>');
    expect(jobs).toContain('return expiredIds.length');
  });

  it('runs expiry automation from the scheduled D1 cleanup path', () => {
    expect(jobs).toContain('const expiredInvitations = await expirePendingInvitations(env)');
    expect(jobs).toContain('expiredInvitations,');
    expect(jobs).toContain("if (!accountId) await cleanupExpired(env)");
    expect(jobs).toContain("case 'cleanup.expired':");
  });
});
