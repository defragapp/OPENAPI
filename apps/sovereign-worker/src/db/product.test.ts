import { describe, expect, it } from 'vitest';
import { analyzeSystem, createDeletionJob, createExportJob, createSystem, freeEntitlements, saveUnderstanding } from './product';
import type { Env } from '../env';

function fakeEnv(): Env {
  const inserts: string[] = [];
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return {
    async first() {
      if (sql.startsWith('SELECT plan, features_json')) {
        return {
          plan: 'sovereign_plus',
          features_json: JSON.stringify(['baseline.today', 'baseline.explore', 'people.compare', 'systems.family', 'systems.team', 'library.continuity', 'covenant.lens']),
          as_of: new Date(0).toISOString()
        };
      }
      return null;
    },
    async all() { return { results: [] }; },
    async run() { inserts.push(`${sql}:${JSON.stringify(args)}`); return { success: true, meta: { changes: 1 } }; }
  }; } }; } } as unknown as D1Database;
  return { APP_ENV: 'test', APP_VERSION: 'test', DB: db, THREADS: {} as DurableObjectNamespace, STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret' };
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

  it('saves library continuity only through explicit user action', async () => {
    const env = fakeEnv();
    const saved = await saveUnderstanding(env, 'acct_1', { title: 'Useful map', summary: 'Pressure can get louder without becoming truth.' });
    expect(saved.body.savedExplicitly).toBe(true);
    expect(JSON.stringify(saved)).not.toMatch(/hidden reasoning|latitude|longitude|birth time/i);
  });

  it('disables private exports while preserving a cancellable deletion grace record', async () => {
    const env = fakeEnv();
    await expect(createExportJob(env, 'acct_1')).rejects.toMatchObject({ status: 404 });
    expect((await createDeletionJob(env, 'acct_1')).status).toBe('grace');
  });

  it('projects deterministic free entitlements by stable feature keys', () => {
    const entitlements = freeEntitlements();
    expect(entitlements.features['baseline.today']).toBe(true);
    expect(entitlements.features['people.compare']).toBe(false);
    expect(Object.keys(entitlements.features)).not.toContain('export.full');
  });
});
