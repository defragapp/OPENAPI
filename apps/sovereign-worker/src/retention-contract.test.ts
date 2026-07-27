import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const jobs = readFileSync(new URL('./jobs.ts', import.meta.url), 'utf8');
const config = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');

describe('public retention contract', () => {
  it('defaults unsaved thread content to 30 days and non-content audit metadata to 90 days', () => {
    expect(config).toContain('"THREAD_RETENTION_DAYS": "30"');
    expect(config).toContain('"AUDIT_RETENTION_DAYS": "90"');
    expect(jobs).toContain('retentionDays(env.THREAD_RETENTION_DAYS, 30');
    expect(jobs).toContain('retentionDays(env.AUDIT_RETENTION_DAYS, 90');
  });

  it('deletes expired conversation events while preserving saved Library records', () => {
    expect(jobs).toContain('DELETE FROM thread_events');
    expect(jobs).toContain('DELETE FROM threads');
    expect(jobs).toContain('SELECT thread_id FROM saved_understandings');
    expect(jobs).toContain('UPDATE user_corrections SET note = NULL');
    expect(jobs).toContain('DELETE FROM tool_audit_events');
    expect(jobs).not.toContain('DELETE FROM saved_understandings WHERE created_at');
  });

  it('runs cleanup from the scheduled unscoped job pass and reports privacy-safe counts', () => {
    expect(jobs).toContain('if (!accountId) await cleanupExpired(env)');
    expect(jobs).toContain("console.info('retention_cleanup'");
    expect(jobs).not.toContain('payload_json FROM thread_events');
  });
});
