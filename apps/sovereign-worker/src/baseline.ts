import type { Env } from './env';
import { canUseDevelopmentFixtures } from './runtime';
import { createOpenApiBaselineProvider, isValidTimeZone } from './baseline-engine';
import { computeReducedCurrentConditions } from './current-conditions/current';
import {
  BASELINE_SOURCE_VERSION,
  baselineFacetProfileSchema,
  baselineSourceDataSchema,
  buildBaselineBasisRegistry,
  validateFacetProfileBasis,
  type BasisRegistryItem,
  type BaselineSourceData
} from './baseline-contracts';
import { ensureBaselineFacetProfile, getCachedBaselineFacetProfile } from './baseline-facets';

export type BirthTimeCertainty = 'exact' | 'approximate' | 'unknown';
export type LocationPrecision = 'none' | 'approximate' | 'city_or_regional' | 'ephemeral_current' | 'stored_permitted' | 'geocentric';
export interface BaselineInput { birthDate?: string; birthTime?: string; birthTimeCertainty?: BirthTimeCertainty; birthplace?: string; birthTimezone?: string; locationPrecision?: LocationPrecision; }
export interface CurrentLocationInput { latitude?: number; longitude?: number; }
export type BaselineReadinessState = 'not_started' | 'source_computing' | 'source_unavailable' | 'source_invalid' | 'facet_profile_preparing' | 'ready';
export interface BaselineReadiness {
  ready: boolean;
  state: BaselineReadinessState;
  message: string;
  nextAction: 'continue_onboarding' | 'retry_baseline' | 'review_baseline' | 'open_workspace';
  retryable: boolean;
}
const LOCATION_PRECISIONS: readonly LocationPrecision[] = ['none', 'approximate', 'city_or_regional', 'ephemeral_current', 'stored_permitted', 'geocentric'];
const VERSION = 'openapi-baseline-engine-v3';
const SOVV_REFERENCE_COMMIT = 'a3db94bccc75089723bef0cf5ff36c47064bd789';
const encoder = new TextEncoder();

async function sha256(value: string) { const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value)); return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join(''); }
function assertDate(value: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new Response('Invalid birth date', { status: 400 }); }
function assertTime(value: string | undefined, certainty: BirthTimeCertainty) { if (certainty !== 'unknown' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '')) throw new Response('Birth time required for exact or approximate certainty', { status: 400 }); }
function frameworkAvailability(certainty: BirthTimeCertainty, providerStatus: string) { return { astrology: providerStatus === 'computed' ? 'available' : 'unavailable', humanDesign: certainty === 'unknown' || providerStatus !== 'computed' ? 'unavailable' : 'partial', geneKeys: certainty === 'unknown' || providerStatus !== 'computed' ? 'unavailable' : 'partial', numerology: 'available', houses: 'unavailable' }; }

export function parseLocationPrecision(value: unknown): LocationPrecision {
  if (typeof value === 'string' && LOCATION_PRECISIONS.includes(value as LocationPrecision)) return value as LocationPrecision;
  throw new Response('Invalid current-condition precision', { status: 400 });
}

export async function computeReducedBaseline(input: BaselineInput, options: { providerAvailable?: boolean; provider?: BaselineProvider; allowRecordedFixture?: boolean } = {}) {
  const normalized = normalizeBaselineInput(input);
  if (options.providerAvailable === false) return partialBaseline(normalized.birthTimeCertainty, ['astronomical-provider']);
  const provider = options.provider ?? (options.allowRecordedFixture ? deterministicRecordedProvider() : undefined);
  if (!provider) return partialBaseline(normalized.birthTimeCertainty, ['openapi-baseline-engine-not-configured']);
  const computed = await provider.compute(normalized).catch((error) => {
    if (error instanceof Response) throw error;
    return undefined;
  });
  if (!computed) return partialBaseline(normalized.birthTimeCertainty, ['openapi-baseline-engine-unavailable']);
  return reduceComputedBaseline(normalized.birthTimeCertainty, computed);
}

export function normalizeBaselineInput(input: BaselineInput) {
  const birthDate = input.birthDate?.trim() ?? '';
  const birthplace = input.birthplace?.trim() ?? '';
  const birthTimezone = input.birthTimezone?.trim() ?? '';
  const birthTimeCertainty = input.birthTimeCertainty ?? 'unknown';
  assertDate(birthDate);
  if (birthplace.length < 2) throw new Response('Invalid birthplace', { status: 400 });
  if (!birthTimezone || !isValidTimeZone(birthTimezone)) throw new Response('Valid birthplace timezone required', { status: 400 });
  assertTime(input.birthTime, birthTimeCertainty);
  return { birthDate, birthTime: birthTimeCertainty === 'unknown' ? undefined : input.birthTime, birthTimeCertainty, birthplace, birthTimezone, locationPrecision: input.locationPrecision ?? 'city_or_regional' };
}

export interface BaselineProviderOutput {
  sourceData: BaselineSourceData;
  natalPlacements: Record<string, unknown>;
  houses: Record<string, unknown> | null;
  aspects: string[];
  humanDesign: Record<string, unknown> | null;
  geneKeys: Record<string, unknown>;
  numerology: Record<string, number>;
  currentAstronomy: Record<string, string>;
  baselineTendency: string;
  interpretiveSignals: string[];
  sourceTimestamp: string;
  provenance?: Record<string, unknown>;
}
export interface BaselineProvider { compute(input: ReturnType<typeof normalizeBaselineInput>): Promise<BaselineProviderOutput> }

export function deterministicRecordedProvider(): BaselineProvider {
  return { async compute(input) {
    const date = new Date(`${input.birthDate}T${input.birthTime ?? '12:00'}:00Z`);
    const day = date.getUTCDate(); const month = date.getUTCMonth() + 1; const year = date.getUTCFullYear();
    const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    const sun = signs[Math.floor(((month - 1) * 30 + Math.min(day, 30)) / 30) % 12]!;
    const moon = signs[(day + month) % 12]!;
    const ascendant = input.birthTimeCertainty === 'unknown' ? undefined : signs[(Number((input.birthTime ?? '12:00').slice(0, 2)) + day) % 12];
    const sunLongitude = signs.indexOf(sun) * 30 + 15;
    const moonLongitude = signs.indexOf(moon) * 30 + 15;
    const gate = ((month * 6 + day) % 64) + 1;
    const computedAt = new Date().toISOString();
    const uncertainty = input.birthTimeCertainty === 'unknown' ? 'high' : input.birthTimeCertainty === 'approximate' ? 'medium' : 'low';
    return {
      sourceData: {
        version: BASELINE_SOURCE_VERSION,
        computationVersion: VERSION,
        computedAt,
        uncertainty,
        natalBodies: [
          { id: 'natal.sun', body: 'sun', sign: sun, longitude: sunLongitude, displayDegree: '15.0°', retrograde: false, uncertainty: input.birthTimeCertainty === 'exact' ? 'low' : 'medium' },
          { id: 'natal.moon', body: 'moon', sign: moon, longitude: moonLongitude, displayDegree: '15.0°', retrograde: false, uncertainty }
        ],
        aspects: [],
        humanDesign: {
          personalityActivations: input.birthTimeCertainty === 'unknown'
            ? []
            : [{ id: 'hd.personality.sun', body: 'sun', gate, line: 1, uncertainty }]
        },
        geneKeys: {
          activations: input.birthTimeCertainty === 'unknown'
            ? []
            : [{ id: 'gk.activation.sun', body: 'sun', activation: gate, uncertainty }]
        },
        numerology: [
          { id: 'numerology.lifePath', key: 'lifePath', value: reduceNumber(year + month + day), uncertainty: 'low' },
          { id: 'numerology.birthDay', key: 'birthDay', value: reduceNumber(day), uncertainty: 'low' }
        ],
        houses: null,
        provenance: {
          astronomy: 'Sanitized development fixture',
          observerCenter: 'Fixture',
          timezoneResolution: 'Fixture UTC',
          birthTimeCertainty: input.birthTimeCertainty,
          rawBirthInputReturned: false,
          exactPrivateLocationReturned: false,
          completeHumanDesignClaimed: false,
          completeGeneKeysClaimed: false,
          housesClaimed: false
        }
      },
      natalPlacements: { sun, moon, ...(ascendant ? { ascendant } : {}) },
      houses: null,
      aspects: ascendant ? [`Sun ${sun} square Ascendant ${ascendant}`] : [],
      humanDesign: ascendant ? { personalityGates: { sun: { gate, line: 1 } } } : null,
      geneKeys: input.birthTimeCertainty === 'unknown' ? {} : { activations: { sun: gate } },
      numerology: { lifePath: reduceNumber(year + month + day), birthDay: reduceNumber(day) },
      currentAstronomy: {},
      baselineTendency: 'Development fixture only: a reduced interpretive tendency is available.',
      interpretiveSignals: [`Sun in ${sun}`, `Moon in ${moon}`],
      sourceTimestamp: computedAt,
      provenance: { fixture: true, rawBirthInputReturned: false, birthplaceSentToExternalProvider: false }
    };
  } };
}

function reduceNumber(value: number): number { let current = value; while (current > 9) current = String(current).split('').reduce((sum, character) => sum + Number(character), 0); return current; }
function partialBaseline(certainty: BirthTimeCertainty, unavailable: string[]) { return { status: 'partial', providerStatus: 'unavailable', uncertainty: 'high', computationVersion: VERSION, provenance: { deterministicCalculation: false, engine: 'openapi-owned', sovvReferenceCommit: SOVV_REFERENCE_COMMIT, sovvRuntimeDependency: false, birthplaceSentToExternalProvider: false, unavailable }, reducedContext: modelSafeContext(certainty, 'unavailable', frameworkAvailability(certainty, 'unavailable')) }; }
function reduceComputedBaseline(certainty: BirthTimeCertainty, computed: BaselineProviderOutput) {
  const availability = frameworkAvailability(certainty, 'computed');
  return {
    status: 'completed',
    providerStatus: 'computed',
    uncertainty: certainty === 'unknown' ? 'high' : certainty === 'approximate' ? 'medium' : 'low',
    computationVersion: VERSION,
    provenance: {
      deterministicCalculation: true,
      engine: 'openapi-cloudflare-baseline-engine',
      interpretiveFrameworks: ['astrology', 'human-design-partial', 'gene-keys-partial', 'numerology'],
      provider: 'openapi-owned-server-side-provider',
      sourceTimestamp: computed.sourceTimestamp,
      sovvReferenceCommit: SOVV_REFERENCE_COMMIT,
      sovvRuntimeDependency: false,
      birthplaceSentToExternalProvider: false,
      rawBirthInputReturned: false,
      ...computed.provenance
    },
    reducedContext: {
      ...modelSafeContext(certainty, 'computed', availability),
      baselineTendency: computed.baselineTendency,
      interpretiveSignals: computed.interpretiveSignals,
      sourceData: computed.sourceData,
      deterministicCalculation: {
        natalPlacements: computed.natalPlacements,
        houses: computed.houses,
        aspects: computed.aspects,
        humanDesign: certainty === 'unknown' ? null : computed.humanDesign,
        geneKeys: certainty === 'unknown' ? {} : computed.geneKeys,
        numerology: computed.numerology,
        currentAstronomy: computed.currentAstronomy
      },
      interpretiveFramework: {
        disclaimer: 'Astrology, Human Design, Gene Keys, and numerology are interpretive frameworks, not scientifically verified psychological measurement.',
        availability
      }
    }
  };
}
function modelSafeContext(certainty: BirthTimeCertainty, providerStatus: string, availability: Record<string, string>) { return { baselineTendency: 'Enduring tendency is represented as reduced interpretive language, not a diagnosis.', currentAmplification: 'Current conditions are computed separately and never determine behavior.', userObservation: 'No observed behavior is assumed until supplied by the user.', interpretiveSignals: Object.entries(availability).filter(([, state]) => state === 'available' || state === 'partial').map(([name]) => name), systemInference: providerStatus === 'computed' ? 'Structured deterministic reduction is available.' : 'Structured deterministic reduction is unavailable.', uncertainty: certainty === 'unknown' ? 'high' : 'stated', unknownActualState: 'Actual state remains unknown unless the user confirms it.' }; }

export async function persistBaseline(env: Env, accountId: string, input: BaselineInput) {
  const computed = await computeConfiguredBaseline(env, input);
  const protectedInput = {
    birthDateHash: await sha256(input.birthDate ?? ''),
    birthTimeCertainty: input.birthTimeCertainty,
    hasBirthTime: Boolean(input.birthTime && input.birthTimeCertainty !== 'unknown'),
    birthplaceHash: await sha256(input.birthplace ?? ''),
    birthTimezoneHash: await sha256(input.birthTimezone ?? ''),
    locationPrecision: input.locationPrecision ?? 'city_or_regional'
  };
  const inputHash = await sha256(JSON.stringify(protectedInput));
  const parsedSource = baselineSourceDataSchema.safeParse(asRecord(computed.reducedContext).sourceData);
  let facetProfile = null;
  if (parsedSource.success) {
    facetProfile = await ensureBaselineFacetProfile(env, {
      accountId,
      inputHash,
      source: parsedSource.data
    }).catch(() => null);
    (computed.reducedContext as Record<string, unknown>).facetProfile = facetProfile;
    (computed.reducedContext as Record<string, unknown>).facetProfileStatus = facetProfile ? 'ready' : 'pending';
  }
  await env.DB.prepare(`INSERT OR REPLACE INTO baseline_onboarding (account_id, input_hash, protected_input_json, reduced_context_json, computation_version, provenance_json, status, uncertainty, last_computed_at, provider_status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, datetime('now'))`).bind(accountId, inputHash, JSON.stringify(protectedInput), JSON.stringify(computed.reducedContext), computed.computationVersion, JSON.stringify(computed.provenance), computed.status, computed.uncertainty, computed.providerStatus).run();
  const ready = computed.status === 'completed' && facetProfile !== null;
  return {
    status: ready ? 'completed' : computed.status === 'completed' ? 'preparing' : computed.status,
    ready,
    uncertainty: computed.uncertainty,
    reducedContext: computed.reducedContext,
    facetProfileStatus: facetProfile ? 'ready' : 'pending',
    readinessState: ready ? 'ready' : computed.status === 'completed' ? 'facet_profile_preparing' : 'source_unavailable',
    message: ready
      ? 'Your Baseline is ready.'
      : computed.status === 'completed'
        ? 'The exact Baseline source was saved, but its plain-language facet profile did not finish validating.'
        : 'The Baseline source could not be calculated, so Sovereign will not substitute a generic answer.',
    nextAction: 'retry_baseline' as const,
    provenance: computed.provenance,
    computationVersion: computed.computationVersion
  };
}

export async function computeConfiguredBaseline(env: Env, input: BaselineInput) {
  normalizeBaselineInput(input);
  if (canUseDevelopmentFixtures(env)) {
    return computeReducedBaseline(input, { provider: deterministicRecordedProvider(), allowRecordedFixture: true });
  }
  return computeReducedBaseline(input, { provider: createOpenApiBaselineProvider(env) });
}

export async function getBaselineStatus(env: Env, accountId: string) {
  const row = await env.DB.prepare('SELECT status, uncertainty, reduced_context_json, provenance_json, computation_version, last_computed_at, provider_status FROM baseline_onboarding WHERE account_id = ?').bind(accountId).first<{ status: string; uncertainty: string; reduced_context_json: string; provenance_json: string; computation_version: string; last_computed_at: string; provider_status: string }>();
  if (!row) return { status: 'not_started' };
  const readiness = await getBaselineReadiness(env, accountId);
  return {
    status: readiness.ready ? 'completed' : row.status === 'completed' ? 'preparing' : row.status,
    ready: readiness.ready,
    readinessState: readiness.state,
    readinessMessage: readiness.message,
    nextAction: readiness.nextAction,
    facetProfileStatus: readiness.ready ? 'ready' : 'pending',
    uncertainty: row.uncertainty,
    reducedContext: JSON.parse(row.reduced_context_json),
    provenance: JSON.parse(row.provenance_json),
    computationVersion: row.computation_version,
    lastComputedAt: row.last_computed_at,
    providerStatus: row.provider_status
  };
}

export async function getBaselineReadiness(env: Env, accountId: string): Promise<BaselineReadiness> {
  const row = await env.DB.prepare('SELECT status, reduced_context_json, provider_status FROM baseline_onboarding WHERE account_id = ?')
    .bind(accountId)
    .first<{ status: string; reduced_context_json: string; provider_status: string }>();
  if (!row) return baselineReadiness('not_started', 'Build your Baseline before asking Sovereign a question.', 'continue_onboarding', false);
  if (row.status === 'partial' || row.provider_status !== 'computed') {
    return baselineReadiness('source_unavailable', 'The Baseline source could not be calculated. Your account and saved data remain unchanged.', 'retry_baseline', true);
  }
  if (row.status !== 'completed') {
    return baselineReadiness('source_computing', 'The Baseline source is still being calculated. Sovereign has not generated an answer.', 'continue_onboarding', true);
  }
  const reduced = safeStoredRecord(row.reduced_context_json);
  const source = baselineSourceDataSchema.safeParse(reduced.sourceData);
  if (!source.success) {
    return baselineReadiness('source_invalid', 'The saved Baseline source is incomplete or invalid. No generic substitute will be used.', 'review_baseline', false);
  }
  const registry = buildBaselineBasisRegistry(source.data);
  const cachedProfile = await getCachedBaselineFacetProfile(env, accountId);
  const profile = baselineFacetProfileSchema.safeParse(cachedProfile ?? reduced.facetProfile);
  if (!profile.success) {
    return baselineReadiness('facet_profile_preparing', 'The exact Baseline source is saved, but the plain-language facet profile is still being prepared.', 'retry_baseline', true);
  }
  try {
    validateFacetProfileBasis(profile.data, registry);
  } catch {
    return baselineReadiness('facet_profile_preparing', 'The Baseline facet profile did not pass exact Basis validation. No answer will be generated until it does.', 'retry_baseline', true);
  }
  return baselineReadiness('ready', 'Your Baseline source and validated facet profile are ready.', 'open_workspace', false);
}

export async function requireCompletedBaseline(env: Env, accountId: string): Promise<BaselineReadiness> {
  const readiness = await getBaselineReadiness(env, accountId);
  if (readiness.ready) return readiness;
  throw Response.json({
    type: 'https://sovereign.defrag.app/problems/baseline-required',
    error: 'baseline_required',
    code: readiness.state,
    message: readiness.message,
    nextAction: readiness.nextAction,
    retryable: readiness.retryable
  }, {
    status: readiness.state === 'source_invalid' ? 422 : 409,
    headers: { 'cache-control': 'private, no-store' }
  });
}

function baselineReadiness(state: BaselineReadinessState, message: string, nextAction: BaselineReadiness['nextAction'], retryable: boolean): BaselineReadiness {
  return { ready: state === 'ready', state, message, nextAction, retryable };
}

function safeStoredRecord(value: string): Record<string, unknown> {
  try { return asRecord(JSON.parse(value)); } catch { return {}; }
}

export async function computeCurrentConditions(env: Env, accountId: string, mode: LocationPrecision, input: CurrentLocationInput = {}) {
  if (mode === 'none') return unavailableCurrentConditions(mode, 'Location permission is not enabled.');
  const geocentric = mode === 'geocentric';
  let location: { latitude: number; longitude: number; precision: 'city' | 'region' | 'ephemeral' } | undefined;
  if (!geocentric) {
    const latitude = Number(input.latitude ?? env.CURRENT_CONDITIONS_LAT);
    const longitude = Number(input.longitude ?? env.CURRENT_CONDITIONS_LNG);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return unavailableCurrentConditions(mode, 'A permitted current location is required.');
    }
    const precision = mode === 'ephemeral_current' ? 'ephemeral' : mode === 'approximate' ? 'region' : 'city';
    location = { latitude, longitude, precision };
  }
  try {
    const baseline = await getBaselineStatus(env, accountId);
    const source = baselineSourceDataSchema.safeParse(asRecord(asRecord(baseline).reducedContext).sourceData);
    const current = await computeReducedCurrentConditions(env, {
      accountId,
      perspective: geocentric ? 'geocentric' : 'topocentric',
      ...(location ? { location } : {}),
      ...(source.success ? { natalBodies: source.data.natalBodies } : {})
    });
    const person = await env.DB.prepare(`SELECT id FROM persons
      WHERE account_id = ? AND role = 'self'
      ORDER BY created_at LIMIT 1`).bind(accountId).first<{ id: string }>();
    if (!person?.id) throw new Error('Self person record unavailable');
    await env.DB.prepare('INSERT INTO current_conditions (id, person_id, computed_at, location_hash, conditions_json, source_ref, precision_used, provider_status) VALUES (?, ?, datetime(\'now\'), ?, ?, ?, ?, ?)')
      .bind(`current_${crypto.randomUUID()}`, person.id, null, JSON.stringify(current), current.source, mode, 'computed').run();
    return { source: current.source, computedAt: current.computedAt, precisionUsed: mode, providerStatus: 'computed', reduced: current };
  } catch {
    return unavailableCurrentConditions(mode, 'Current astronomy is temporarily unavailable.');
  }
}

export async function clearCurrentConditions(env: Env, accountId: string) {
  await env.DB.prepare(`DELETE FROM current_conditions
    WHERE person_id IN (SELECT id FROM persons WHERE account_id = ?)`)
    .bind(accountId)
    .run();
  return { status: 'not_started' as const, removed: true };
}

function unavailableCurrentConditions(mode: LocationPrecision, reason: string) {
  return { source: 'openapi-current-conditions', computedAt: new Date().toISOString(), precisionUsed: mode, providerStatus: 'unavailable', reduced: { baselineTendency: 'Baseline unchanged.', possibleCurrentAmplification: reason, knownObservation: 'No observed behavior supplied.', unknownActualState: 'Current conditions do not determine behavior.' } };
}

export async function getLatestCurrentConditions(env: Env, accountId: string) {
  const row = await env.DB.prepare(`SELECT cc.computed_at, cc.conditions_json, cc.precision_used, cc.provider_status
    FROM current_conditions cc
    JOIN persons p ON p.id = cc.person_id
    WHERE p.account_id = ?
    ORDER BY cc.computed_at DESC
    LIMIT 1`).bind(accountId).first<{ computed_at: string; conditions_json: string; precision_used: string; provider_status: string }>();
  if (!row) return { status: 'not_started', providerStatus: 'unavailable', reduced: null };
  const reduced = JSON.parse(row.conditions_json) as Record<string, unknown>;
  const expiresAt = typeof reduced.expiresAt === 'string' ? Date.parse(reduced.expiresAt) : 0;
  const expired = !expiresAt || expiresAt <= Date.now();
  return {
    status: row.provider_status === 'computed' && !expired ? 'ready' : expired ? 'expired' : 'unavailable',
    providerStatus: row.provider_status,
    precisionUsed: row.precision_used,
    computedAt: row.computed_at,
    expired,
    reduced
  };
}

export async function getModelSafeBaselineContext(env: Env, accountId: string) {
  const [baseline, current, cachedFacetProfile] = await Promise.all([
    getBaselineStatus(env, accountId),
    getLatestCurrentConditions(env, accountId),
    getCachedBaselineFacetProfile(env, accountId)
  ]);
  return {
    baseline: sanitizeBaselineForModel(baseline, cachedFacetProfile),
    current: sanitizeCurrentForModel(current),
    separation: [
      'Baseline tendency is enduring interpretive context, not diagnosis or proof.',
      'Current amplification is temporary context and does not determine behavior.',
      'Observed behavior must be supplied or confirmed by the user.',
      'Actual state remains unknown unless the user confirms it.'
    ]
  };
}

function sanitizeBaselineForModel(value: unknown, cachedFacetProfile: unknown) {
  const baseline = asRecord(value);
  const reduced = asRecord(baseline.reducedContext);
  const provenance = asRecord(baseline.provenance);
  if (baseline.status === 'not_started') return { status: 'not_started' };
  const parsedSource = baselineSourceDataSchema.safeParse(reduced.sourceData);
  const sourceData = parsedSource.success ? parsedSource.data : null;
  const registry = sourceData ? buildBaselineBasisRegistry(sourceData) : [];
  const parsedProfile = baselineFacetProfileSchema.safeParse(cachedFacetProfile ?? reduced.facetProfile);
  let facetProfile = null;
  if (sourceData && parsedProfile.success) {
    try {
      facetProfile = validateFacetProfileBasis(parsedProfile.data, registry);
    } catch {
      facetProfile = null;
    }
  }
  const ready = baseline.status === 'completed' && sourceData !== null && facetProfile !== null;
  return {
    status: ready ? 'completed' : baseline.status === 'not_started' ? 'not_started' : 'preparing',
    ready,
    facetProfileStatus: ready ? 'ready' : 'incomplete',
    uncertainty: baseline.uncertainty,
    providerStatus: baseline.providerStatus,
    computationVersion: baseline.computationVersion,
    lastComputedAt: baseline.lastComputedAt,
    provenance: {
      deterministicCalculation: provenance.deterministicCalculation,
      engine: provenance.engine,
      interpretiveFrameworks: provenance.interpretiveFrameworks,
      rawBirthInputReturned: false,
      birthplaceSentToExternalProvider: false,
      sovvRuntimeDependency: false
    },
    reducedContext: {
      facetProfileStatus: ready ? 'ready' : 'incomplete',
      facetProfile,
      uncertainty: reduced.uncertainty,
      unknownActualState: reduced.unknownActualState,
      sourceData,
      basisRegistry: registry,
    }
  };
}

function sanitizeCurrentForModel(value: unknown) {
  const current = asRecord(value);
  const reduced = asRecord(current.reduced);
  if (current.status === 'not_started') return { status: 'not_started', providerStatus: 'unavailable' };
  return {
    status: current.status,
    providerStatus: current.providerStatus,
    precisionUsed: current.precisionUsed,
    computedAt: current.computedAt,
    reduced: {
      version: reduced.version,
      computedAt: reduced.computedAt,
      expiresAt: reduced.expiresAt,
      source: reduced.source,
      locationPrecisionUsed: reduced.locationPrecisionUsed,
      activeFactors: reduced.activeFactors,
      currentToNatalContacts: reduced.currentToNatalContacts,
      affectedBaselineFacetIds: reduced.affectedBaselineFacetIds,
      uncertainty: reduced.uncertainty,
      separations: reduced.separations,
      basisRegistry: current.status === 'ready' ? buildCurrentBasisRegistry(reduced) : [],
      baselineTendency: reduced.baselineTendency,
      possibleCurrentAmplification: reduced.possibleCurrentAmplification,
      knownObservation: reduced.knownObservation,
      unknownActualState: reduced.unknownActualState
    }
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function buildCurrentBasisRegistry(value: Record<string, unknown>): BasisRegistryItem[] {
  const computedAt = typeof value.computedAt === 'string' ? value.computedAt : new Date(0).toISOString();
  const expiresAt = typeof value.expiresAt === 'string' ? value.expiresAt : undefined;
  const provenance = value.source === 'OPENAPI_PORTED_HORIZONS'
    ? 'Server current-position calculation'
    : value.source === 'OPENAPI_SANITIZED_FIXTURE'
      ? 'Sanitized development fixture'
      : 'Current astronomical calculation';
  const bodies = Array.isArray(value.activeFactors) ? value.activeFactors : [];
  const contacts = Array.isArray(value.currentToNatalContacts) ? value.currentToNatalContacts : [];
  const bodyGlyphs: Record<string, string> = { sun: '☉', moon: '☾', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇', chiron: '⚷' };
  const signCodes: Record<string, string> = { Aries: 'ARI', Taurus: 'TAU', Gemini: 'GEM', Cancer: 'CAN', Leo: 'LEO', Virgo: 'VIR', Libra: 'LIB', Scorpio: 'SCO', Sagittarius: 'SAG', Capricorn: 'CAP', Aquarius: 'AQU', Pisces: 'PIS' };
  const aspectGlyphs: Record<string, string> = { conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍' };
  const items: BasisRegistryItem[] = [];
  for (const raw of bodies) {
    const factor = asRecord(raw);
    if (typeof factor.id !== 'string' || typeof factor.body !== 'string' || typeof factor.sign !== 'string' || typeof factor.displayDegree !== 'string') continue;
    const symbol = bodyGlyphs[factor.body] ?? factor.body;
    items.push({
      id: factor.id,
      category: 'live',
      display: `LIVE ${symbol} ${signCodes[factor.sign] ?? factor.sign.slice(0, 3).toUpperCase()} ${factor.displayDegree}${factor.retrograde === true ? 'R' : ''}`,
      accessibleLabel: `Current ${factor.body} in ${factor.sign} at ${factor.displayDegree}${factor.retrograde === true ? ', retrograde' : ''}`,
      computedAt,
      ...(expiresAt ? { expiresAt } : {}),
      uncertainty: factor.uncertainty === 'low' || factor.uncertainty === 'medium' ? factor.uncertainty : 'high',
      provenance,
      subject: 'self'
    });
  }
  for (const raw of contacts) {
    const contact = asRecord(raw);
    if (typeof contact.id !== 'string' || typeof contact.currentBody !== 'string' || typeof contact.natalBody !== 'string' || typeof contact.aspect !== 'string' || typeof contact.orb !== 'number') continue;
    const currentGlyph = bodyGlyphs[contact.currentBody] ?? contact.currentBody;
    const natalGlyph = bodyGlyphs[contact.natalBody] ?? contact.natalBody;
    items.push({
      id: contact.id,
      category: 'live',
      display: `LIVE ${currentGlyph} ${aspectGlyphs[contact.aspect] ?? contact.aspect} ${natalGlyph} ${contact.orb.toFixed(1)}°`,
      accessibleLabel: `Current ${contact.currentBody} ${contact.aspect} natal ${contact.natalBody}, ${contact.orb.toFixed(1)} degree orb`,
      computedAt,
      ...(expiresAt ? { expiresAt } : {}),
      uncertainty: contact.uncertainty === 'low' || contact.uncertainty === 'medium' ? contact.uncertainty : 'high',
      provenance,
      subject: 'self'
    });
  }
  return items;
}
