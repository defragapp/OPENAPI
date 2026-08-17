import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const auth = readFileSync(new URL('./security/auth.ts', import.meta.url), 'utf8');
const entitlements = readFileSync(new URL('./db/entitlements.ts', import.meta.url), 'utf8');
const stripe = readFileSync(new URL('./billing/stripe.ts', import.meta.url), 'utf8');
const people = readFileSync(new URL('./db/people.ts', import.meta.url), 'utf8');
const product = readFileSync(new URL('./db/product.ts', import.meta.url), 'utf8');
const relational = readFileSync(new URL('./relational-context.ts', import.meta.url), 'utf8');
const insightModules = readFileSync(new URL('./db/insight-modules.ts', import.meta.url), 'utf8');

describe('server-side Free and Sovereign+ boundary', () => {
  it('never trusts the client to decide the effective paid plan', () => {
    expect(entitlements).toContain('SELECT plan, features_json, as_of FROM entitlement_cache WHERE account_id = ?1');
    expect(entitlements).toContain("if (!row) return { plan: 'free'");
    expect(entitlements).toContain('return { plan: row.plan');
    expect(entitlements).toContain("error: 'entitlement_required'");
    expect(entitlements).toContain("nextAction: 'review_plan'");
    expect(stripe).toContain("event.plan === 'sovereign_plus'");
    expect(stripe).toContain('ACTIVE_SUBSCRIPTION_STATUSES.has(event.status)');
    expect(stripe).toContain('INSERT INTO entitlement_cache');
    expect(auth).toContain('const entitlements = await getEntitlements(env, accountId)');
  });

  it('gates paid relationship capability on the server and rechecks consent', () => {
    expect(auth).toContain("feature = 'people.compare'");
    expect(people).toContain("requireFeature(await getEntitlements(env, accountId), 'people.compare')");
    expect(relational).toContain("await requireConsent(env, accountId, personId, 'pair.compare')");
    expect(relational).toContain("await requireConsent(env, accountId, personId, 'trait.display')");
  });

  it('gates system analysis and system mutation on the server', () => {
    expect(auth).toContain("feature = 'systems.family'");
    expect(product).toContain('requireSystemAccess');
    expect(relational).toContain("await requireConsent(env, accountId, personId, 'system.include')");
    expect(relational).toContain('consentRecheckedForEveryParticipant: true');
  });

  it('gates Library continuity on the server', () => {
    expect(auth).toContain("feature = 'library.continuity'");
    expect(product).toContain('requireLibraryAccess');
    expect(insightModules).toContain("requireFeature(await getEntitlements(env, accountId), 'library.continuity')");
  });

  it('preserves account-owned read/delete controls after downgrade without granting paid intelligence', () => {
    expect(people).not.toMatch(/listPeople[\s\S]{0,160}requirePeopleFeature/);
    expect(product).not.toMatch(/listSystems[\s\S]{0,160}requireSystemAccess/);
    expect(product).not.toMatch(/listUnderstandings[\s\S]{0,160}requireLibraryAccess/);
    expect(product).not.toMatch(/deleteUnderstanding[\s\S]{0,160}requireLibraryAccess/);
    expect(relational).toContain('buildPairComparison');
    expect(relational).toContain('buildSystemAnalysis');
  });
});
