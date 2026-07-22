/**
 * OPENAPI baseline-engine
 *
 * Provenance:
 * - SOVV commit: a3db94bccc75089723bef0cf5ff36c47064bd789
 * - Input contract source: /packages/core/src/types.ts BaselineRequest
 * - Current-condition source: /apps/worker/src/baseline-compiler.ts LiveSkySnapshot/getCurrentSkySnapshot
 * - Reduction source: /apps/worker/src/baseline-compiler.ts formatDatasetForAI/formatDatasetForApp
 * - Active-signal source: /apps/worker/src/active-signals.ts selectActiveSignals/formatActiveSignalsForPrompt
 *
 * This package intentionally does not port SOVV's Worker/KV/session architecture,
 * public routes, incident-first application structure, or AI synthesis layer. Until
 * parity fixtures from verified SOVV outputs are available, it returns structured
 * reduced contexts and explicit unavailable states rather than fabricating a
 * framework computation.
 */

export type BirthTimeCertainty = 'exact' | 'approx' | 'unknown';
export type LocationPrecision = 'unavailable' | 'approximate' | 'city' | 'region' | 'ephemeral' | 'stored_permitted';
export type ContextAvailability = 'ready' | 'unavailable' | 'invalid';

export interface SanitizedBaselineInput {
  name?: string;
  birthDate: string;
  birthTime?: { certainty: BirthTimeCertainty; localTime?: string };
  birthPlace: { label?: string; region?: string; country?: string; timezone?: string };
  currentLocation?: { precision: LocationPrecision; label?: string; timezone?: string };
}

export interface SanitizedCurrentConditionsInput {
  at?: string;
  location: { precision: LocationPrecision; label?: string; timezone?: string };
  baselineContext?: Pick<ReducedBaselineContext, 'baselineId' | 'status' | 'modelSafe'>;
}

export interface ReducedBaselineContext {
  baselineId: string;
  status: ContextAvailability;
  source: 'openapi-baseline-engine';
  provenance: string[];
  modelSafe: {
    enduringBaselineTendency: string;
    currentAmplification: string;
    observedBehavior: string;
    unknownActualState: string;
    correctionPrompt: 'yes_partly_not_today';
  };
  privacy: {
    rawBirthInputSentToModel: false;
    exactLocationSentToModel: false;
    retainedFields: string[];
  };
  unavailableReason?: string;
}

export interface ReducedCurrentConditionsContext {
  status: ContextAvailability;
  source: 'openapi-baseline-engine';
  modelSafe: {
    currentAmplification: string;
    precisionUsed: LocationPrecision;
    unknownActualState: string;
  };
  privacy: {
    exactLocationSentToModel: false;
    locationPrecision: LocationPrecision;
  };
  unavailableReason?: string;
}

const PROVENANCE = [
  'SOVV@a3db94b packages/core/src/types.ts BaselineRequest',
  'SOVV@a3db94b apps/worker/src/baseline-compiler.ts LiveSkySnapshot/getCurrentSkySnapshot',
  'SOVV@a3db94b apps/worker/src/baseline-compiler.ts formatDatasetForAI/formatDatasetForApp',
  'SOVV@a3db94b apps/worker/src/active-signals.ts selectActiveSignals/formatActiveSignalsForPrompt'
] as const;

export function normalizeBaselineInput(input: SanitizedBaselineInput): SanitizedBaselineInput {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) throw new TypeError('birthDate must be YYYY-MM-DD');
  if (!input.birthPlace || !Object.values(input.birthPlace).some(Boolean)) throw new TypeError('birthPlace requires at least one coarse label, region, country, or timezone');
  const certainty = input.birthTime?.certainty ?? 'unknown';
  if (!['exact', 'approx', 'unknown'].includes(certainty)) throw new TypeError('birthTime.certainty is invalid');
  if (input.birthTime?.localTime && !/^\d{2}:\d{2}$/.test(input.birthTime.localTime)) throw new TypeError('birthTime.localTime must be HH:mm when provided');
  return {
    ...input,
    ...(input.name?.trim() ? { name: input.name.trim() } : {}),
    birthTime: { certainty, ...(input.birthTime?.localTime ? { localTime: input.birthTime.localTime } : {}) },
    birthPlace: sanitizePlace(input.birthPlace),
    ...(input.currentLocation ? { currentLocation: sanitizeLocation(input.currentLocation) } : {})
  };
}

export async function computeReducedBaseline(input: SanitizedBaselineInput): Promise<ReducedBaselineContext> {
  const normalized = normalizeBaselineInput(input);
  const baselineId = await stableContextId(normalized);
  const timeCertainty = normalized.birthTime?.certainty ?? 'unknown';
  const readiness = timeCertainty === 'unknown' ? 'unavailable' : 'ready';
  return {
    baselineId,
    status: readiness,
    source: 'openapi-baseline-engine',
    provenance: [...PROVENANCE],
    modelSafe: {
      enduringBaselineTendency: readiness === 'ready'
        ? `Baseline input is normalized with ${timeCertainty} birth-time certainty; framework-specific interpretation must remain reduced and correction-aware.`
        : 'Baseline input is incomplete because birth-time certainty is unknown; do not infer a framework tendency.',
      currentAmplification: 'Current conditions are computed separately and must be described only as possible amplification, never as a certain feeling.',
      observedBehavior: 'Only behavior explicitly supplied or confirmed by the user may be treated as observed.',
      unknownActualState: 'The user\'s actual internal state remains unknown until they confirm, correct, or reject the interpretation.',
      correctionPrompt: 'yes_partly_not_today'
    },
    privacy: {
      rawBirthInputSentToModel: false,
      exactLocationSentToModel: false,
      retainedFields: ['birthDate:hash-only', 'birthTime:certainty', 'birthPlace:coarse', 'currentLocation:precision']
    },
    ...(readiness === 'unavailable' ? { unavailableReason: 'birth_time_certainty_unknown' } : {})
  };
}

export async function computeReducedCurrentConditions(input: SanitizedCurrentConditionsInput): Promise<ReducedCurrentConditionsContext> {
  const precision = input.location.precision;
  if (precision === 'unavailable') {
    return unavailableCurrentConditions(precision, 'current_location_unavailable');
  }
  return {
    status: 'ready',
    source: 'openapi-baseline-engine',
    modelSafe: {
      currentAmplification: `Current-condition context may use ${precision} location precision for broad timing language only; exact feelings remain unknown.`,
      precisionUsed: precision,
      unknownActualState: 'Timing signals can suggest amplification, but the user decides whether it fits today.'
    },
    privacy: { exactLocationSentToModel: false, locationPrecision: precision }
  };
}

export function unavailableCurrentConditions(precision: LocationPrecision, reason: string): ReducedCurrentConditionsContext {
  return {
    status: 'unavailable',
    source: 'openapi-baseline-engine',
    modelSafe: {
      currentAmplification: 'Current-condition context is unavailable; do not infer timing amplification.',
      precisionUsed: precision,
      unknownActualState: 'The user\'s actual state remains unknown.'
    },
    privacy: { exactLocationSentToModel: false, locationPrecision: precision },
    unavailableReason: reason
  };
}

function sanitizePlace(place: SanitizedBaselineInput['birthPlace']): SanitizedBaselineInput['birthPlace'] {
  return Object.fromEntries(Object.entries(place).filter(([, value]) => typeof value === 'string' && value.trim().length > 0).map(([key, value]) => [key, String(value).trim()])) as SanitizedBaselineInput['birthPlace'];
}

function sanitizeLocation(location: NonNullable<SanitizedBaselineInput['currentLocation']>): NonNullable<SanitizedBaselineInput['currentLocation']> {
  return { precision: location.precision, ...(location.label ? { label: location.label.trim() } : {}), ...(location.timezone ? { timezone: location.timezone.trim() } : {}) };
}

async function stableContextId(input: SanitizedBaselineInput): Promise<string> {
  const material = JSON.stringify({ birthDate: input.birthDate, birthTime: input.birthTime, birthPlace: input.birthPlace });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `baseline_${hex.slice(0, 24)}`;
}
