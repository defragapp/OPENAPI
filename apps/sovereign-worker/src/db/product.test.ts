import { describe, expect, it } from 'vitest';
import { analyzeSystem, createDeletionJob, createExportJob, createSystem, freeEntitlements, saveUnderstanding } from './product';
import type { Env } from '../env';

function fakeEnv(options: { consent?: boolean; personAccountId?: string } = {}): Env {
  const inserts: string[] = [];
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return {
    async first() {
      if (sql.startsWith('SELECT id FROM persons')) return options.personAccountId === args[1] ? { id: args[0] } : null;
      if (sql.startsWith('SELECT cg.id')) return options.consent ? { id: 'consent_1' } : null;
      return null;
    },
    async all() { return { results: [] }; },
    async run() { inserts.push(`${sql}:${JSON.stringify(args)}`); return { success: true, meta: { changes: 1 } }; }
  }; } }; } } as unknown as D1Database;
  return { APP_ENV: 'test', APP_VERSION: 'test', DB: db, THREADS: {} as DurableObjectNamespace, OPENAI_API_KEY: '', STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret' };
}

describe('systems, library, privacy, and entitlement helpers', () => {
  it('creates systems and uses type-specific non-diagnostic alignment language', async () => {
    const env = fakeEnv();
    const system = await createSystem(env, 'acct_1', { name: 'Ops team', systemType: 'team', metadata: { sharedObjective: 'ship safely' } });
    expect(system.systemType).toBe('team');
    expect(analyzeSystem('team').roleAlignment).toContain('formal authority');
    expect(analyzeSystem('family').interactionAlignment).toContain('caregiving');
    expect(analyzeSystem('family').prohibitedDefaults).toContain('automatic estrangement');
  });

  it('saves library continuity without a person link through explicit user action', async () => {
    const env = fakeEnv();
    const saved = await saveUnderstanding(env, 'acct_1', { title: 'Useful map', summary: 'Pressure can get louder without becoming truth.' });
    expect(saved.body.savedExplicitly).toBe(true);
    expect(JSON.stringify(saved)).not.toMatch(/hidden reasoning|latitude|longitude|birth time/i);
  });

  it('requires active library.link consent for person-linked Library saves', async () => {
    await expect(saveUnderstanding(fakeEnv({ personAccountId: 'acct_1', consent: false }), 'acct_1', { title: 'Linked map', summary: 'Only with consent.', links: { personId: 'person_1' } })).rejects.toMatchObject({ status: 403 });
    await expect(saveUnderstanding(fakeEnv({ personAccountId: 'acct_2', consent: true }), 'acct_1', { title: 'Cross account', summary: 'No.', links: { personId: 'person_1' } })).rejects.toMatchObject({ status: 404 });
    const saved = await saveUnderstanding(fakeEnv({ personAccountId: 'acct_1', consent: true }), 'acct_1', { title: 'Linked map', summary: 'Consent is active.', links: { personId: 'person_1' } });
    expect(saved.body.links).toEqual({ personId: 'person_1' });
  });

  it('creates export and deletion grace jobs without executing irreversible deletion', async () => {
    const env = fakeEnv();
    expect((await createExportJob(env, 'acct_1')).excludes).toContain('hidden reasoning');
    expect((await createDeletionJob(env, 'acct_1')).status).toBe('grace');
  });

  it('projects deterministic free entitlements by stable feature keys', () => {
    const entitlements = freeEntitlements();
    expect(entitlements.features['baseline.today']).toBe(true);
    expect(entitlements.features['people.compare']).toBe(false);
    expect(Object.keys(entitlements.features)).toContain('export.full');
  });
});
