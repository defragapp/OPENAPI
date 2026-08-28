import { describe, expect, it } from 'vitest';
import { buildPairComparison } from './relational-context';
import type { Env } from './env';
import { type BaselineSourceData } from './baseline-contracts';
import { buildDeterministicFacetProfile } from './baseline-facets';
import { reduceNumber, longitudeToSign } from './astronomy';

/**
 * RUNTIME CONSENT-GATED PAIR COMPARISON TEST
 *
 * Verifies the "person comparison requires consent" final-outcome criterion at
 * runtime through the full buildPairComparison path (not by reading source text):
 *
 *   1. Comparison is blocked with 403 permission_denied when consent is absent.
 *   2. With consent granted by the invited person, two DISTINCT participants are
 *      returned with namespace-prefixed, non-merged source references.
 *   3. framework.display consent gates whether the invited person's exact
 *      framework source values enter the shared context.
 *   4. The comparison never produces a compatibility score or raw birth sharing.
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
const INVITED_ACCOUNT = 'acct_invited';
const PERSON_ID = 'person_invited';

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
  const persons = new Map<string, PersonSeed>([
    [PERSON_ID, {
      id: PERSON_ID,
      account_id: OWNER_ACCOUNT,
      display_name: 'Avery',
      role: 'friendship',
      source_of_truth: JSON.stringify({ observations: [], formalRole: 'friend' }),
      bound_account_id: INVITED_ACCOUNT
    }]
  ]);

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
              if (sql.startsWith('SELECT id FROM persons WHERE id = ? AND account_id = ?')) {
                const seed = persons.get(String(args[0]));
                return seed && seed.account_id === String(args[1]) ? { id: seed.id } : null;
              }
              if (sql.startsWith('SELECT cg.id FROM consent_grants cg')) {
                const scope = String(args[2]);
                return grantedScopes.has(scope) ? { id: `grant.${scope}` } : null;
              }
              if (sql.startsWith('SELECT id, display_name, role, source_of_truth, bound_account_id FROM persons WHERE id = ? AND account_id = ?')) {
                const seed = persons.get(String(args[0]));
                return seed && seed.account_id === String(args[1]) ? { ...seed } : null;
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
    throw new Error('expected permission_denied but comparison succeeded');
  } catch (error) {
    if (error instanceof Error && error.message === 'expected permission_denied but comparison succeeded') throw error;
    const resp = error as Response;
    expect(resp).toMatchObject({ status: 403 });
    expect(resp.headers.get('cache-control')).toBe('private, no-store');
  }
}

describe('buildPairComparison runtime consent gating', () => {
  it('blocks comparison with 403 permission_denied when consent is absent', async () => {
    const { env } = buildEnv([]);
    await permissionDenied(buildPairComparison(env, OWNER_ACCOUNT, PERSON_ID));
  });

  it('blocks comparison when trait.display consent is missing (pair.compare alone is insufficient)', async () => {
    const { env } = buildEnv(['pair.compare']);
    await permissionDenied(buildPairComparison(env, OWNER_ACCOUNT, PERSON_ID));
  });

  it('returns two distinct participants with source references intact when consent is granted', async () => {
    const { env } = buildEnv(['pair.compare', 'trait.display', 'framework.display']);
    const result = await buildPairComparison(env, OWNER_ACCOUNT, PERSON_ID);

    expect(result.kind).toBe('relationship');
    expect(result.permissions).toEqual({ pairCompare: true, traitDisplay: true, frameworkDisplay: true });

    expect(result.participants).toHaveLength(2);
    const owner = result.participants[0]!;
    const other = result.participants[1]!;
    expect(owner.key).toBe('you');
    expect(other.key).toBe('other');
    expect(owner.label).toBe('You');
    expect(other.label).toBe('Avery');
    expect(other.role).toBe('friendship');

    expect(owner.facets.length).toBeGreaterThan(0);
    expect(other.facets.length).toBeGreaterThan(0);
    expect(owner.expressionAxes.length).toBeGreaterThan(0);
    expect(other.expressionAxes.length).toBeGreaterThan(0);

    expect(other.observedState).toBe('not_confirmed');
    expect(other.unknownActualState).toContain('remain unknown');

    expect(result.provenance.rawBirthInputShared).toBe(false);
    expect(result.provenance.exactPrivateLocationShared).toBe(false);
    expect(result.provenance.ownerComputationVersion).toBe('test-pipeline-v1');
    expect(result.provenance.invitedComputationVersion).toBe('test-pipeline-v1');
  });

  it('keeps invited source references namespace-prefixed so identities are not merged', async () => {
    const { env } = buildEnv(['pair.compare', 'trait.display', 'framework.display']);
    const result = await buildPairComparison(env, OWNER_ACCOUNT, PERSON_ID);

    const ownerFacetRefs = result.participants[0]!.facets.flatMap((f) => f.basisRefs);
    const otherFacetRefs = result.participants[1]!.facets.flatMap((f) => f.basisRefs);
    expect(otherFacetRefs.length).toBeGreaterThan(0);
    expect(otherFacetRefs.every((ref) => ref.startsWith('other.'))).toBe(true);
    expect(ownerFacetRefs.some((ref) => ref.startsWith('other.'))).toBe(false);

    const ownerAxisRefs = result.participants[0]!.expressionAxes.flatMap((a) => a.basisRefs);
    const otherAxisRefs = result.participants[1]!.expressionAxes.flatMap((a) => a.basisRefs);
    expect(otherAxisRefs.every((ref) => ref.startsWith('other.'))).toBe(true);
    expect(ownerAxisRefs.some((ref) => ref.startsWith('other.'))).toBe(false);

    expect(result.basisRegistry.some((item) => item.id.startsWith('other.'))).toBe(true);
  });

  it('strips the invited framework source values when framework.display is not granted', async () => {
    const { env } = buildEnv(['pair.compare', 'trait.display']);
    const result = await buildPairComparison(env, OWNER_ACCOUNT, PERSON_ID);

    expect(result.permissions.frameworkDisplay).toBe(false);
    const other = result.participants[1]!;
    expect(other.facets.length).toBeGreaterThan(0);
    expect(other.facets.every((facet) => facet.basisRefs.length === 0)).toBe(true);
    expect(other.expressionAxes.every((axis) => axis.basisRefs.length === 0)).toBe(true);
    expect(result.basisRegistry.some((item) => item.id.startsWith('other.'))).toBe(false);
  });

  it('never returns a compatibility score or numeric rating', async () => {
    const { env } = buildEnv(['pair.compare', 'trait.display', 'framework.display']);
    const result = await buildPairComparison(env, OWNER_ACCOUNT, PERSON_ID);
    // No user-facing score/rating field anywhere in the relationship comparison structure.
    expect('score' in result).toBe(false);
    expect('compatibilityScore' in result).toBe(false);
    expect('percentage' in result).toBe(false);
    expect(JSON.stringify(result)).not.toContain('compatibilityScore');
    expect(JSON.stringify(result)).not.toContain('compat_score');
    // The interaction is a structured comparison ("What happens between people"),
    // not a numeric compatibility verdict.
    for (const contact of result.interaction.exactPairContacts) {
      expect(String(contact.display)).not.toMatch(/score|compat|rating/i);
      expect(String(contact.accessibleLabel)).not.toMatch(/score|compat|rating/i);
    }
    expect(result.interaction.responsibilities.relationship).toContain('cannot create consent or certainty');
  });
});
