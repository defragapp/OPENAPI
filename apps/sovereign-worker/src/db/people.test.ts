import { describe, expect, it } from 'vitest';
import { CONSENT_SCOPES, createInvitation, createPerson, hasConsent, requireConsent, setConsent, updateInvitationStatus } from './people';
import type { Env } from '../env';

function fakeEnv(): Env {
  const people = new Map<string, { accountId: string; displayName: string; role: string; source: string; consentStatus: string; baselineStatus: string }>();
  const grants = new Map<string, { active: boolean }>();
  const invitations = new Map<string, { accountId: string; status: string }>();
  const versions = new Map<string, number>();
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return {
    async first() {
      if (sql.startsWith('SELECT id FROM persons')) {
        const person = people.get(args[0] as string);
        return person?.accountId === args[1] ? { id: args[0] } : null;
      }
      if (sql.startsWith('SELECT MAX(version)')) return { version: versions.get(`${args[0]}:${args[1]}`) ?? null };
      if (sql.startsWith('SELECT cg.id')) return grants.get(`${args[1]}:${args[2]}`)?.active ? { id: 'grant' } : null;
      return null;
    },
    async all() { return { results: [...people.entries()].filter(([, p]) => p.accountId === args[0]).map(([id, p]) => ({ id, role: p.role, display_name: p.displayName, consent_status: p.consentStatus, baseline_status: p.baselineStatus, source_of_truth: p.source })) }; },
    async run() {
      if (sql.startsWith('INSERT INTO persons')) people.set(args[0] as string, { accountId: args[1] as string, role: args[2] as string, displayName: args[3] as string, source: args[4] as string, consentStatus: args[5] as string, baselineStatus: args[6] as string });
      if (sql.startsWith('INSERT INTO invitations')) invitations.set(args[0] as string, { accountId: args[1] as string, status: args[3] as string });
      if (sql.startsWith('UPDATE invitations')) { const invite = invitations.get(args[1] as string); if (invite && invite.accountId === args[2]) { invite.status = args[0] as string; return { success: true, meta: { changes: 1 } }; } return { success: true, meta: { changes: 0 } }; }
      if (sql.startsWith('UPDATE consent_grants')) { const grant = grants.get(`${args[0]}:${args[1]}`); if (grant) grant.active = false; }
      if (sql.startsWith('INSERT INTO consent_grants')) grants.set(`${args[1]}:${args[2]}`, { active: true });
      if (sql.startsWith('INSERT INTO consent_versions')) versions.set(`${args[1]}:${args[2]}`, args[3] as number);
      if (sql.startsWith('UPDATE persons')) { const person = people.get(args[1] as string); if (person && person.accountId === args[2]) person.consentStatus = args[0] as string; }
      return { success: true, meta: { changes: 1 } };
    }
  }; } }; } } as unknown as D1Database;
  return { APP_ENV: 'test', APP_VERSION: 'test', DB: db, THREADS: {} as DurableObjectNamespace, OPENAI_API_KEY: '', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret' };
}

describe('people invitations and consent boundaries', () => {
  it('creates private people and invitation lifecycle states', async () => {
    const env = fakeEnv();
    const person = await createPerson(env, 'acct_1', { displayName: 'Avery', role: 'friendship', metadata: { closeness: 'close' } });
    const invite = await createInvitation(env, 'acct_1', person.id, 'user:1');
    expect(invite.status).toBe('pending');
    await expect(updateInvitationStatus(env, 'acct_1', invite.id, 'accepted')).resolves.toBeUndefined();
    await expect(updateInvitationStatus(env, 'acct_1', invite.id, 'declined')).resolves.toBeUndefined();
    await expect(updateInvitationStatus(env, 'acct_1', invite.id, 'expired')).resolves.toBeUndefined();
    await expect(updateInvitationStatus(env, 'acct_1', invite.id, 'revoked')).resolves.toBeUndefined();
  });

  it('enforces consent allowed, denied, revoked, partial, and cross-account access', async () => {
    const env = fakeEnv();
    const person = await createPerson(env, 'acct_1', { displayName: 'Riley', role: 'family' });
    await expect(requireConsent(env, 'acct_1', person.id, 'pair.compare')).rejects.toMatchObject({ status: 403 });
    await setConsent(env, 'acct_1', person.id, 'pair.compare', true, 'user:1');
    await expect(requireConsent(env, 'acct_1', person.id, 'pair.compare')).resolves.toBeUndefined();
    expect(await hasConsent(env, 'acct_1', person.id, 'current_conditions.use')).toBe(false);
    await setConsent(env, 'acct_1', person.id, 'pair.compare', false, 'user:1');
    await expect(requireConsent(env, 'acct_1', person.id, 'pair.compare')).rejects.toMatchObject({ status: 403 });
    await expect(requireConsent(env, 'acct_2', person.id, 'pair.compare')).rejects.toMatchObject({ status: 404 });
    expect(CONSENT_SCOPES).toContain('covenant.include');
  });
});
