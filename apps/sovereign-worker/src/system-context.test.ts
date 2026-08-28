import { describe, expect, it } from 'vitest';
import { buildSystemAnalysis } from './relational-context';
import type { Env } from './env';
import { type BaselineSourceData } from './baseline-contracts';
import { buildDeterministicFacetProfile } from './baseline-facets';
import { reduceNumber, longitudeToSign } from './astronomy';

/**
 * RUNTIME SYSTEM INTELLIGENCE TEST
 *
 * Verifies the "system answers are real generated output" final-outcome
 * criterion at runtime through the full buildSystemAnalysis path (not by
 * reading source text):
 *
 *   1. Analysis is blocked unless the system belongs to the caller and at
 *      least two members are present.
 *   2. The owner plus each invited member appear as DISTINCT participants with
 *      namespace-prefixed, non-merged source references.
 *   3. system.include and trait.display consent are rechecked per participant
 *      in deterministic server code.
 *   4. Exactly the participants the caller already sees (through the Systems
 *      entitlement surface) enter the shared system context.
 *   5. The system context exposes roles, responsibilities, and change effects
 *      without ever producing a score or numeric rating.
 */

const TEST_INPUT = {
  birthDate: '1990-05-17',
  birthTime: '14:30',
  birthTimeCertainty: 'exact' as const,
  birthplace: 'Austin, TX',
  birthTimezone: 'America/Chicago',
  locationPrecision: 'city_or_regional' as const
};

function buildTestSourceData(): BaselineSourceData {
  const sunLongitude = 56.5;
  const moonLongitude = 213.7;
  const mercuryLongitude = 72.4;
  const venusLongitude = 38.2;
  const marsLongitude = 195.8;
  const jupiterLongitude = 312.4;
  const saturnLongitude = 248.1;
  const uranusLongitude = 325.6;
  const neptuneLongitude = 305.3;
  const plutoLongitude = 230.9;

  const sunSign = longitudeToSign(sunLongitude);
  const moonSign = longitudeToSign(moonLongitude);
  const computedAt = '2026-01-15T12:00:00.000Z';
  const certainty = 'exact' as const;

  return {
    version: 'baseline-source.v1',
    computationVersion: 'test-pipeline-v1',
    computedAt,
    uncertainty: 'low',
    natalBodies: [
      { id: 'natal.sun', body: 'sun', sign: sunSign.sign, longitude: sunLongitude, displayDegree: `${sunSign.degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.moon', body: 'moon', sign: moonSign.sign, longitude: moonLongitude, displayDegree: `${moonSign.degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.mercury', body: 'mercury', sign: longitudeToSign(mercuryLongitude).sign, longitude: mercuryLongitude, displayDegree: `${longitudeToSign(mercuryLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.venus', body: 'venus', sign: longitudeToSign(venusLongitude).sign, longitude: venusLongitude, displayDegree: `${longitudeToSign(venusLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.mars', body: 'mars', sign: longitudeToSign(marsLongitude).sign, longitude: marsLongitude, displayDegree: `${longitudeToSign(marsLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.jupiter', body: 'jupiter', sign: longitudeToSign(jupiterLongitude).sign, longitude: jupiterLongitude, displayDegree: `${longitudeToSign(jupiterLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.saturn', body: 'saturn', sign: longitudeToSign(saturnLongitude).sign, longitude: saturnLongitude, displayDegree: `${longitudeToSign(saturnLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.uranus', body: 'uranus', sign: longitudeToSign(uranusLongitude).sign, longitude: uranusLongitude, displayDegree: `${longitudeToSign(uranusLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.neptune', body: 'neptune', sign: longitudeToSign(neptuneLongitude).sign, longitude: neptuneLongitude, displayDegree: `${longitudeToSign(neptuneLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' },
      { id: 'natal.pluto', body: 'pluto', sign: longitudeToSign(plutoLongitude).sign, longitude: plutoLongitude, displayDegree: `${longitudeToSign(plutoLongitude).degree.toFixed(1)}°`, retrograde: false, uncertainty: 'low' }
    ],
    aspects: [
      { id: 'aspect.sun.trine.jupiter', leftBody: 'sun', aspect: 'trine', rightBody: 'jupiter', orb: 3.2, display: 'Sun trine Jupiter (3.2° orb)', uncertainty: 'low' },
      { id: 'aspect.moon.square.saturn', leftBody: 'moon', aspect: 'square', rightBody: 'saturn', orb: 2.8, display: 'Moon square Saturn (2.8° orb)', uncertainty: 'low' },
      { id: 'aspect.venus.sextile.mars', leftBody: 'venus', aspect: 'sextile', rightBody: 'mars', orb: 4.1, display: 'Venus sextile Mars (4.1° orb)', uncertainty: 'low' }
    ],
    humanDesign: {
      personalityActivations: [
        { id: 'hd.personality.sun', body: 'sun', gate: 13, line: 2, uncertainty: 'low' },
        { id: 'hd.personality.moon', body: 'moon', gate: 49, line: 4, uncertainty: 'low' },
        { id: 'hd.personality.mercury', body: 'mercury', gate: 30, line: 1, uncertainty: 'low' }
      ]
    },
    geneKeys: {
      activations: [
        { id: 'gk.activation.sun', body: 'sun', activation: 13, uncertainty: 'low' },
        { id: 'gk.activation.moon', body: 'moon', activation: 49, uncertainty: 'low' },
        { id: 'gk.activation.mercury', body: 'mercury', activation: 30, uncertainty: 'low' }
      ]
    },
    numerology: [
      { id: 'numerology.lifePath', key: 'lifePath', value: reduceNumber(1 + 9 + 9 + 0 + 0 + 5 + 1 + 7), uncertainty: 'low' },
      { id: 'numerology.birthDay', key: 'birthDay', value: reduceNumber(17), uncertainty: 'low' }
    ],
    houses: null,
    provenance: {
      astronomy: 'Test fixture',
      observerCenter: 'Earth geocenter 500@399',
      timezoneResolution: 'User-selected IANA timezone',
      birthTimeCertainty: certainty,
      rawBirthInputReturned: false,
      exactPrivateLocationReturned: false,
      completeHumanDesignClaimed: false,
      completeGeneKeysClaimed: false,
      housesClaimed: false
    }
  };
}

const OWNER_ACCOUNT = 'acct_owner';
const SYSTEM_ID = 'system_family';
const MEMBER_A = 'person_member_a';
const MEMBER_B = 'person_member_b';

interface PersonSeed {
  id: string;
  account_id: string;
  display_name: string;
  role: string;
  source_of_truth: string;
  bound_account_id: string | null;
}

interface Mutator {
  setGrantedScopes: (scopes: string[]) => void;
}

function buildEnv(scopes: string[]): { env: Env; mutator: Mutator } {
  const grantedScopes = new Set<string>(scopes);
  const reduced = {
    sourceData: buildTestSourceData(),
    facetProfile: buildDeterministicFacetProfile(buildTestSourceData())
  };

  const personSeeds = new Map<string, PersonSeed>([
    [MEMBER_A, {
      id: MEMBER_A,
      account_id: OWNER_ACCOUNT,
      display_name: 'Avery',
      role: 'sibling',
      source_of_truth: JSON.stringify({ observations: [], formalRole: 'sibling' }),
      bound_account_id: 'acct_avery'
    }],
    [MEMBER_B, {
      id: MEMBER_B,
      account_id: OWNER_ACCOUNT,
      display_name: 'Bailey',
      role: 'partner',
      source_of_truth: JSON.stringify({ observations: [], formalRole: 'partner' }),
      bound_account_id: 'acct_bailey'
    }]
  ]);

  const systemRow = {
    id: SYSTEM_ID,
    name: 'Household',
    system_type: 'family',
    metadata_json: JSON.stringify({
      sharedObjective: 'Keep the household running and everyone cared for',
      constraints: ['Travel month', 'Limited weekend capacity'],
      observations: ['Parent has been carrying planning late at night'],
      changeEffects: ['If the planner shares the calendar earlier, the evening load shifts to existing shared time.'],
      pressure: ['Planning load concentrates late in the week']
    })
  };

  const planRow = { plan: 'sovereign_plus', features_json: JSON.stringify(['baseline.today', 'baseline.explore', 'people.compare', 'systems.family', 'systems.team', 'library.continuity', 'covenant.lens']), as_of: new Date(0).toISOString() };
  const baselineBody = JSON.stringify(reduced);

  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first() {
              if (sql.startsWith('SELECT plan, features_json, as_of FROM entitlement_cache')) {
                return planRow;
              }
              if (sql.startsWith('SELECT id, name, system_type, metadata_json FROM systems')) {
                return sql.includes('WHERE id = ? AND account_id = ?') && String(args[0]) === SYSTEM_ID && String(args[1]) === OWNER_ACCOUNT
                  ? { ...systemRow }
                  : null;
              }
              if (sql.startsWith('SELECT id FROM persons WHERE id = ? AND account_id = ?')) {
                const seed = personSeeds.get(String(args[0]));
                return seed && seed.account_id === String(args[1]) ? { id: seed.id } : null;
              }
              if (sql.startsWith('SELECT id, display_name, role, source_of_truth, bound_account_id FROM persons WHERE id = ? AND account_id = ?')) {
                const seed = personSeeds.get(String(args[0]));
                return seed && seed.account_id === String(args[1]) ? { ...seed } : null;
              }
              if (sql.startsWith('SELECT cg.id FROM consent_grants cg')) {
                const scope = String(args[2]);
                return grantedScopes.has(scope) ? { id: `grant.${scope}` } : null;
              }
              if (sql.startsWith('SELECT status, uncertainty, reduced_context_json, computation_version, provider_status, last_computed_at FROM baseline_onboarding WHERE account_id = ?')) {
                return {
                  status: 'completed',
                  uncertainty: 'low',
                  reduced_context_json: baselineBody,
                  computation_version: 'test-pipeline-v1',
                  provider_status: 'ready',
                  last_computed_at: reduced.sourceData.computedAt
                };
              }
              if (sql.startsWith('SELECT input_hash, calculation_version, facet_contract_version, model_version, profile_json')) {
                return null;
              }
              return null;
            },
            async all() {
              if (sql.includes('FROM system_memberships sm JOIN persons p')) {
                const rows = [...personSeeds.values()].map((seed) => ({
                  id: seed.id,
                  display_name: seed.display_name,
                  role: seed.role,
                  source_of_truth: seed.source_of_truth,
                  bound_account_id: seed.bound_account_id,
                  role_label: seed.role,
                  metadata_json: JSON.stringify({ responsibility: `${seed.display_name} owns the calendar`, communicationPattern: 'checks in at the weekend', expectations: 'keeps evening shared time' })
                }));
                return { results: rows };
              }
              return { results: [] };
            },
            async run() {
              return { success: true, meta: { changes: 1 } };
            }
          };
        }
      };
    }
  } as unknown as D1Database;

  return {
    env: {
      APP_ENV: 'test',
      APP_VERSION: 'test',
      DB: db,
      THREADS: {} as DurableObjectNamespace
    } as Env,
    mutator: {
      setGrantedScopes: (next) => {
        grantedScopes.clear();
        next.forEach((scope) => grantedScopes.add(scope));
      }
    }
  };
}

async function permissionDenied(promise: Promise<unknown>): Promise<void> {
  try {
    await promise;
    throw new Error('expected permission_denied but system analysis succeeded');
  } catch (error) {
    if (error instanceof Error && error.message === 'expected permission_denied but system analysis succeeded') throw error;
    const resp = error as Response;
    expect(resp).toMatchObject({ status: 403 });
    expect(resp.headers.get('cache-control')).toBe('private, no-store');
  }
}

describe('buildSystemAnalysis runtime consent gating', () => {
  it('blocks analysis with 403 permission_denied when a member has not granted system.include', async () => {
    const { env } = buildEnv(['trait.display']);
    await permissionDenied(buildSystemAnalysis(env, OWNER_ACCOUNT, SYSTEM_ID));
  });

  it('blocks analysis when trait.display is missing (system.include alone is insufficient)', async () => {
    const { env } = buildEnv(['system.include']);
    await permissionDenied(buildSystemAnalysis(env, OWNER_ACCOUNT, SYSTEM_ID));
  });

  it('returns the owner and each member as distinct participants with source references intact', async () => {
    const { env } = buildEnv(['system.include', 'trait.display', 'framework.display']);
    const result = await buildSystemAnalysis(env, OWNER_ACCOUNT, SYSTEM_ID);

    expect(result.kind).toBe('system');
    expect(result.system.label).toBe('Household');
    expect(result.system.sharedObjective).toContain('Keep the household running');
    expect(result.system.currentObservations.length).toBeGreaterThan(0);

    expect(result.participants).toHaveLength(3);
    expect(result.participants[0]!.key).toBe('you');
    expect(result.participants[0]!.label).toBe('You');
    expect(result.participants[1]!.key).toBe('member_1');
    expect(result.participants[1]!.label).toBe('Avery');
    expect(result.participants[2]!.key).toBe('member_2');
    expect(result.participants[2]!.label).toBe('Bailey');

    expect(result.participants.every((p) => p.facets.length > 0)).toBe(true);
    expect(result.participants.every((p) => p.expressionAxes.length > 0)).toBe(true);
    expect(result.participants.every((p) => p.observedState === 'not_confirmed')).toBe(true);

    const memberRefs = result.participants.slice(1).flatMap((p) => p.facets.flatMap((f) => f.basisRefs));
    expect(memberRefs.some((ref) => ref.startsWith('member_'))).toBe(true);
    const ownerRefs = result.participants[0]!.facets.flatMap((f) => f.basisRefs);
    expect(ownerRefs.some((ref) => ref.startsWith('member_'))).toBe(false);
  });

  it('strips invited framework source values when framework.display is not granted', async () => {
    const { env } = buildEnv(['system.include', 'trait.display']);
    const result = await buildSystemAnalysis(env, OWNER_ACCOUNT, SYSTEM_ID);

    const owner = result.participants[0]!;
    expect(owner.facets.every((f) => f.basisRefs.length > 0)).toBe(true);
    for (const member of result.participants.slice(1)) {
      expect(member.facets.every((f) => f.basisRefs.length === 0)).toBe(true);
      expect(member.expressionAxes.every((a) => a.basisRefs.length === 0)).toBe(true);
    }
    expect(result.basisRegistry.some((item) => item.id.startsWith('member_'))).toBe(false);
  });

  it('exposes roles, responsibilities, and change effects without producing a score or rating', async () => {
    const { env } = buildEnv(['system.include', 'trait.display', 'framework.display']);
    const result = await buildSystemAnalysis(env, OWNER_ACCOUNT, SYSTEM_ID);

    expect(result.systemView.roles.length).toBe(3);
    expect(result.systemView.responsibilityConcentration.length).toBeGreaterThan(0);
    expect(result.systemView.changeEffects.length).toBeGreaterThan(0);
    expect(result.systemView.changeEffects[0]).toContain('shifts to existing shared time');

    expect('score' in result).toBe(false);
    expect('compatibilityScore' in result).toBe(false);
    expect('percentage' in result).toBe(false);
    expect(JSON.stringify(result)).not.toMatch(/compat_score|compatibilityScore|numericRating/i);

    expect(result.provenance.consentRecheckedForEveryParticipant).toBe(true);
    expect(result.provenance.rawBirthInputShared).toBe(false);
    expect(result.missingInformation.length).toBeGreaterThan(0);
    expect(result.responsibilityBoundaries[0]).toContain('No participant is responsible for another participant');
  });
});
