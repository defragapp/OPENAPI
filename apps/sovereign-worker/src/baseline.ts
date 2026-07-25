import type { Env } from './env';
import { canUseDevelopmentFixtures } from './runtime';
import { createOpenApiBaselineProvider } from './baseline-engine';

export type BirthTimeCertainty = 'exact' | 'approximate' | 'unknown';
export type LocationPrecision = 'none' | 'approximate' | 'city_or_regional' | 'ephemeral_current' | 'stored_permitted';
export interface BaselineInput { birthDate?: string; birthTime?: string; birthTimeCertainty?: BirthTimeCertainty; birthplace?: string; locationPrecision?: LocationPrecision; }
const VERSION = 'openapi-baseline-engine-v1';
const SOVV_REFERENCE_COMMIT = 'a3db94bccc75089723bef0cf5ff36c47064bd789';
const encoder = new TextEncoder();

async function sha256(value: string) { const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value)); return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join(''); }
function assertDate(value: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new Response('Invalid birth date', { status: 400 }); }
function assertTime(value: string | undefined, certainty: BirthTimeCertainty) { if (certainty !== 'unknown' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value ?? '')) throw new Response('Birth time required for exact or approximate certainty', { status: 400 }); }
function frameworkAvailability(certainty: BirthTimeCertainty, providerStatus: string) { return { astrology: providerStatus === 'computed' ? 'available' : 'unavailable', humanDesign: certainty === 'unknown' || providerStatus !== 'computed' ? 'unavailable' : 'partial', geneKeys: certainty === 'unknown' || providerStatus !== 'computed' ? 'unavailable' : 'partial', numerology: 'available', houses: 'unavailable' }; }

export async function computeReducedBaseline(input: BaselineInput, options: { providerAvailable?: boolean; provider?: BaselineProvider; allowRecordedFixture?: boolean } = {}) {
  const normalized = normalizeBaselineInput(input);
  if (options.providerAvailable === false) return partialBaseline(normalized.birthTimeCertainty, ['geocoder', 'timezone-provider', 'astronomical-provider']);
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
  const birthTimeCertainty = input.birthTimeCertainty ?? 'unknown';
  assertDate(birthDate);
  if (birthplace.length < 2 || /failed geocoding/i.test(birthplace)) throw new Response('Invalid birthplace', { status: 400 });
  assertTime(input.birthTime, birthTimeCertainty);
  return { birthDate, birthTime: birthTimeCertainty === 'unknown' ? undefined : input.birthTime, birthTimeCertainty, birthplace, locationPrecision: input.locationPrecision ?? 'city_or_regional' };
}

export interface BaselineProviderOutput {
  timezone: string;
  geocodePrecision: string;
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
    return {
      timezone: input.locationPrecision === 'none' ? 'unavailable' : 'UTC',
      geocodePrecision: input.locationPrecision === 'none' ? 'none' : input.locationPrecision,
      natalPlacements: { sun, moon, ...(ascendant ? { ascendant } : {}) },
      houses: null,
      aspects: ascendant ? [`Sun ${sun} square Ascendant ${ascendant}`] : [],
      humanDesign: ascendant ? { status: 'fixture-only', gate: day } : null,
      geneKeys: input.birthTimeCertainty === 'unknown' ? {} : { status: 'fixture-only', activation: ((month * 6 + day) % 64) + 1 },
      numerology: { lifePath: reduceNumber(year + month + day), birthDay: reduceNumber(day) },
      currentAstronomy: {},
      baselineTendency: 'Development fixture only: a reduced interpretive tendency is available.',
      interpretiveSignals: [`Sun in ${sun}`, `Moon in ${moon}`],
      sourceTimestamp: new Date().toISOString(),
      provenance: { fixture: true, rawBirthInputReturned: false }
    };
  } };
}

function reduceNumber(value: number): number { let current = value; while (current > 9) current = String(current).split('').reduce((sum, character) => sum + Number(character), 0); return current; }
function partialBaseline(certainty: BirthTimeCertainty, unavailable: string[]) { return { status: 'partial', providerStatus: 'unavailable', uncertainty: 'high', computationVersion: VERSION, provenance: { deterministicCalculation: false, engine: 'openapi-owned', sovvReferenceCommit: SOVV_REFERENCE_COMMIT, sovvRuntimeDependency: false, unavailable }, reducedContext: modelSafeContext(certainty, 'unavailable', frameworkAvailability(certainty, 'unavailable')) }; }
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
      rawBirthInputReturned: false,
      ...computed.provenance
    },
    reducedContext: {
      ...modelSafeContext(certainty, 'computed', availability),
      baselineTendency: computed.baselineTendency,
      interpretiveSignals: computed.interpretiveSignals,
      deterministicCalculation: {
        natalPlacements: computed.natalPlacements,
        houses: computed.houses,
        aspects: computed.aspects,
        humanDesign: certainty === 'unknown' ? null : computed.humanDesign,
        geneKeys: certainty === 'unknown' ? {} : computed.geneKeys,
        numerology: computed.numerology,
        currentAstronomy: computed.currentAstronomy,
        timezone: computed.timezone,
        geocodePrecision: computed.geocodePrecision
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
  const protectedInput = { birthDateHash: await sha256(input.birthDate ?? ''), birthTimeCertainty: input.birthTimeCertainty, hasBirthTime: Boolean(input.birthTime && input.birthTimeCertainty !== 'unknown'), birthplaceHash: await sha256(input.birthplace ?? ''), locationPrecision: input.locationPrecision ?? 'city_or_regional' };
  const inputHash = await sha256(JSON.stringify(protectedInput));
  await env.DB.prepare(`INSERT OR REPLACE INTO baseline_onboarding (account_id, input_hash, protected_input_json, reduced_context_json, computation_version, provenance_json, status, uncertainty, last_computed_at, provider_status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, datetime('now'))`).bind(accountId, inputHash, JSON.stringify(protectedInput), JSON.stringify(computed.reducedContext), computed.computationVersion, JSON.stringify(computed.provenance), computed.status, computed.uncertainty, computed.providerStatus).run();
  return { status: computed.status, uncertainty: computed.uncertainty, reducedContext: computed.reducedContext, provenance: computed.provenance, computationVersion: computed.computationVersion };
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
  return { status: row.status, uncertainty: row.uncertainty, reducedContext: JSON.parse(row.reduced_context_json), provenance: JSON.parse(row.provenance_json), computationVersion: row.computation_version, lastComputedAt: row.last_computed_at, providerStatus: row.provider_status };
}

export async function computeCurrentConditions(env: Env, accountId: string, mode: LocationPrecision) {
  const precision = mode === 'ephemeral_current' ? 'approximate' : mode;
  const unavailable = mode === 'none';
  const provider = unavailable ? undefined : await fetchCurrentConditionProvider(env, precision);
  const providerStatus = provider ? 'computed' : 'unavailable';
  const reduced = { baselineTendency: 'Baseline unchanged.', possibleCurrentAmplification: provider ? `${provider.currentAstronomy.sun} and ${provider.currentAstronomy.moon} may be noticeable today.` : 'Unavailable without a configured permitted provider.', knownObservation: 'No observed behavior supplied.', unknownActualState: 'Current conditions do not determine behavior.' };
  const person = await env.DB.prepare('SELECT id FROM persons WHERE account_id = ? ORDER BY created_at LIMIT 1').bind(accountId).first<{ id: string }>();
  if (person?.id) await env.DB.prepare('INSERT INTO current_conditions (id, person_id, computed_at, location_hash, conditions_json, source_ref, precision_used, provider_status) VALUES (?, ?, datetime(\'now\'), ?, ?, ?, ?, ?)').bind(`current_${crypto.randomUUID()}`, person.id, null, JSON.stringify(reduced), provider?.source ?? 'openapi-current-provider', precision, providerStatus).run();
  return { source: provider?.source ?? 'openapi-current-provider', computedAt: provider?.sourceTimestamp ?? new Date().toISOString(), precisionUsed: precision, providerStatus, reduced };
}

export async function getLatestCurrentConditions(env: Env, accountId: string) {
  const row = await env.DB.prepare(`SELECT cc.computed_at, cc.conditions_json, cc.precision_used, cc.provider_status
    FROM current_conditions cc
    JOIN persons p ON p.id = cc.person_id
    WHERE p.account_id = ?
    ORDER BY cc.computed_at DESC
    LIMIT 1`).bind(accountId).first<{ computed_at: string; conditions_json: string; precision_used: string; provider_status: string }>();
  if (!row) return { status: 'not_started', providerStatus: 'unavailable', reduced: null };
  return { status: row.provider_status === 'computed' ? 'ready' : 'unavailable', providerStatus: row.provider_status, precisionUsed: row.precision_used, computedAt: row.computed_at, reduced: JSON.parse(row.conditions_json) };
}

export async function getModelSafeBaselineContext(env: Env, accountId: string) {
  const [baseline, current] = await Promise.all([getBaselineStatus(env, accountId), getLatestCurrentConditions(env, accountId)]);
  return {
    baseline: sanitizeBaselineForModel(baseline),
    current,
    separation: [
      'Baseline tendency is enduring interpretive context, not diagnosis or proof.',
      'Current amplification is temporary context and does not determine behavior.',
      'Observed behavior must be supplied or confirmed by the user.',
      'Actual state remains unknown unless the user confirms it.'
    ]
  };
}

function sanitizeBaselineForModel(value: unknown) {
  const baseline = asRecord(value);
  const reduced = asRecord(baseline.reducedContext);
  const calculation = asRecord(reduced.deterministicCalculation);
  const provenance = asRecord(baseline.provenance);
  if (baseline.status === 'not_started') return { status: 'not_started' };
  return {
    status: baseline.status,
    uncertainty: baseline.uncertainty,
    providerStatus: baseline.providerStatus,
    computationVersion: baseline.computationVersion,
    lastComputedAt: baseline.lastComputedAt,
    provenance: {
      deterministicCalculation: provenance.deterministicCalculation,
      engine: provenance.engine,
      interpretiveFrameworks: provenance.interpretiveFrameworks,
      rawBirthInputReturned: false,
      sovvRuntimeDependency: false
    },
    reducedContext: {
      baselineTendency: reduced.baselineTendency,
      currentAmplification: reduced.currentAmplification,
      userObservation: reduced.userObservation,
      interpretiveSignals: reduced.interpretiveSignals,
      systemInference: reduced.systemInference,
      uncertainty: reduced.uncertainty,
      unknownActualState: reduced.unknownActualState,
      deterministicCalculation: {
        natalPlacements: calculation.natalPlacements,
        aspects: calculation.aspects,
        humanDesign: calculation.humanDesign,
        geneKeys: calculation.geneKeys,
        numerology: calculation.numerology
      },
      interpretiveFramework: reduced.interpretiveFramework
    }
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

async function fetchCurrentConditionProvider(env: Env, precision: string): Promise<{ source: string; sourceTimestamp: string; currentAstronomy: Record<string, string> } | undefined> {
  if (!env.ASTRONOMY_API_URL) return undefined;
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 2500);
  try { const response = await fetch(`${env.ASTRONOMY_API_URL}?precision=${encodeURIComponent(precision)}`, { signal: controller.signal }); if (!response.ok) return undefined; const data = await response.json() as { currentAstronomy?: Record<string, string>; sourceTimestamp?: string }; if (!data.currentAstronomy?.sun || !data.currentAstronomy?.moon) return undefined; return { source: 'configured-astronomy-provider', sourceTimestamp: data.sourceTimestamp ?? new Date().toISOString(), currentAstronomy: data.currentAstronomy }; } catch { return undefined; } finally { clearTimeout(timeout); }
}
