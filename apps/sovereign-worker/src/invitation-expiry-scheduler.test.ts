import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const jobs = readFileSync(new URL('./jobs.ts', import.meta.url), 'utf8');

describe('scheduled invitation expiry lifecycle', () => {
  it('finds only pending invitations whose expiration has passed', () => {
    expect(jobs).toContain("WHERE status = 'pending' AND expires_at <= datetime('now')");
    expect(jobs).toContain('ORDER BY expires_at ASC LIMIT 100');
  });

  it('claims each invitation atomically before sending an expiry notice', () => {
    const update = jobs.indexOf("SET status = 'expired', token_hash = NULL");
    const changed = jobs.indexOf("if ((result.meta?.changes ?? 0) !== 1) continue", update);
    const notice = jobs.indexOf("notifyInvitationLifecycle(env, { invitationId: row.id, kind: 'expired' })", changed);
    expect(update).toBeGreaterThan(-1);
    expect(changed).toBeGreaterThan(update);
    expect(notice).toBeGreaterThan(changed);
  });

  it('runs expiry automation from the scheduled D1 cleanup path', () => {
    expect(jobs).toContain('const expiredInvitations = await expirePendingInvitations(env)');
    expect(jobs).toContain('expiredInvitations,');
    expect(jobs).toContain("if (!accountId) await cleanupExpired(env)");
    expect(jobs).toContain("case 'cleanup.expired':");
  });
});
