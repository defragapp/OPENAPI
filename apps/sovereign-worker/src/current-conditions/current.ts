import type { Env } from '../env';
import { parseHorizonsJson, type HorizonsPayload } from '../baseline-engine';
import { baselineFacetIds, type BaselineFacetId, type BaselineSourceData } from '../baseline-contracts';
import { longitudeToSign, signedLongitudeDelta, BODY_GLYPHS, SIGN_CODES, ASPECT_GLYPHS } from '../astronomy';

export interface CurrentConditionInput {
  accountId: string;
  timestamp?: string;
  location?: { latitude: number; longitude: number; precision: 'city' | 'region' | 'ephemeral' } | undefined;
  perspective?: 'geocentric' | 'topocentric' | undefined;
  fixtureBodies?: Record<string, { longitude: number; latitude: number; retrograde?: boolean }> | undefined;
  natalBodies?: BaselineSourceData['natalBodies'] | undefined;
}

export interface ReducedCurrentCondition {
  version: 'current-conditions.v1';
  computedAt: string;
  expiresAt: string;
  source: 'OPENAPI_PORTED_HORIZONS' | 'OPENAPI_SANITIZED_FIXTURE';
  provenance: {
    referenceCommit: string;
    referenceFiles: string[];
    implementation: 'ported-minimal-current-condition-layer';
  };
  locationPrecisionUsed: 'city' | 'region' | 'ephemeral' | 'geocentric' | 'none';
  activeFactors: Array<{
    id: string;
    body: string;
    sign: string;
    longitude: number;
    degree: number;
    displayDegree: string;
    retrograde: boolean;
    basisRef: string;
    affectedFacetIds: BaselineFacetId[];
    uncertainty: 'low' | 'medium' | 'high';
  }>;
  currentToNatalContacts: Array<{
    id: string;
    currentBody: string;
    natalBody: string;
    aspect: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
    orb: number;
    display: string;
    basisRef: string;
    affectedFacetIds: BaselineFacetId[];
    uncertainty: 'low' | 'medium' | 'high';
  }>;
  affectedBaselineFacetIds: BaselineFacetId[];
  uncertainty: 'low' | 'medium' | 'high';
  separations: {
    baseline: string;
    currentContext: string;
    observedBehavior: string;
    unknownActualState: string;
  };
}

const REFERENCE_COMMIT = 'a3db94bccc75089723bef0cf5ff36c47064bd789';
const REFERENCE_FILES = [
  '/workspace/SOVV/apps/worker/src/baseline-compiler.ts',
  '/workspace/SOVV/apps/worker/src/routes/explain-stream.ts'
];

const PLANET_IDS: Record<string, string> = {
  sun: '10', moon: '301', mercury: '199', venus: '299', mars: '499', jupiter: '599', saturn: '699', uranus: '799', neptune: '899', pluto: '999', chiron: '2060'
};

export async function computeReducedCurrentConditions(env: Env, input: CurrentConditionInput): Promise<ReducedCurrentCondition> {
  const computedAt = new Date(input.timestamp ?? Date.now()).toISOString();
  const expiresAt = new Date(new Date(computedAt).getTime() + 6 * 60 * 60 * 1000).toISOString();
  const bodies = input.fixtureBodies ?? await fetchCurrentBodies(env, computedAt, input.location);
  const activeFactors = Object.entries(bodies).map(([body, position]) => {
    const { sign, degree } = longitudeToSign(position.longitude);
    const retrograde = position.retrograde === true;
    return {
      id: `current.${body}`,
      body,
      sign,
      longitude: Math.round(position.longitude * 10_000) / 10_000,
      degree,
      displayDegree: `${degree.toFixed(1)}°`,
      retrograde,
      basisRef: `current.${body}`,
      affectedFacetIds: [] as BaselineFacetId[],
      uncertainty: input.fixtureBodies || input.perspective === 'geocentric'
        ? 'low' as const
        : input.location
          ? 'medium' as const
          : 'high' as const
    };
  }).sort((left, right) => left.body.localeCompare(right.body));

  const currentToNatalContacts = computeCurrentToNatalContacts(activeFactors, input.natalBodies ?? []);
  const affectedBaselineFacetIds = [...new Set([
    ...activeFactors.flatMap((factor) => factor.affectedFacetIds),
    ...currentToNatalContacts.flatMap((contact) => contact.affectedFacetIds)
  ])];
  return {
    version: 'current-conditions.v1',
    computedAt,
    expiresAt,
    source: input.fixtureBodies ? 'OPENAPI_SANITIZED_FIXTURE' : 'OPENAPI_PORTED_HORIZONS',
    provenance: { referenceCommit: REFERENCE_COMMIT, referenceFiles: REFERENCE_FILES, implementation: 'ported-minimal-current-condition-layer' },
    locationPrecisionUsed: input.perspective === 'geocentric' ? 'geocentric' : input.location?.precision ?? 'none',
    activeFactors,
    currentToNatalContacts,
    affectedBaselineFacetIds,
    uncertainty: input.fixtureBodies || input.perspective === 'geocentric' ? 'low' : input.location ? 'medium' : 'high',
    separations: {
      baseline: 'The Baseline remains the stable interpretive reference.',
      currentContext: 'Current positions and exact contacts identify temporarily relevant themes; they do not establish behavior.',
      observedBehavior: 'No behavior is treated as observed unless the user supplies or confirms it.',
      unknownActualState: 'No exact emotion, motive, diagnosis, or future behavior is inferred.'
    }
  };
}

async function fetchCurrentBodies(env: Env, computedAt: string, location?: CurrentConditionInput['location']): Promise<Record<string, { longitude: number; latitude: number; retrograde?: boolean }>> {
  const observerKey = location ? `${location.latitude.toFixed(1)}:${location.longitude.toFixed(1)}` : 'geocentric';
  const cacheKey = `current_conditions:${observerKey}:${computedAt.slice(0, 13)}`;
  const cached = await env.KV?.get(cacheKey, 'json') as Record<string, { longitude: number; latitude: number; retrograde?: boolean }> | null;
  if (cached) return cached;
  const entries = Object.entries(PLANET_IDS);
  const bodies: Record<string, { longitude: number; latitude: number; retrograde?: boolean }> = {};
  for (const [name, targetId] of entries) {
    if (Object.keys(bodies).length > 0) await new Promise((resolve) => setTimeout(resolve, 125));
    const position = await fetchHorizonsPosition(env, targetId, computedAt, location);
    if (position) bodies[name] = position;
  }
  if (!Object.keys(bodies).length) throw new Error('No Horizons current-condition bodies returned');
  await env.KV?.put(cacheKey, JSON.stringify(bodies), { expirationTtl: 6 * 60 * 60 });
  return bodies;
}

async function fetchHorizonsPosition(env: Env, targetId: string, computedAt: string, location?: CurrentConditionInput['location']): Promise<{ longitude: number; latitude: number; retrograde: boolean } | null> {
  const startDate = new Date(computedAt);
  const stopDate = new Date(startDate.getTime() + 12 * 60 * 60 * 1000);
  const endpoint = buildCurrentHorizonsEndpoint(env, targetId, startDate, stopDate, location);
  const timeout = Number(env.BASELINE_PROVIDER_TIMEOUT_MS ?? 8000);
  const response = await fetch(endpoint, {
    headers: { 'User-Agent': 'Sovereign.OS OPENAPI Current Conditions/1.0' },
    signal: AbortSignal.timeout(Number.isFinite(timeout) ? timeout : 8000)
  });
  if (!response.ok) return null;
  let rows: Array<{ longitude: number; latitude: number }>;
  try {
    rows = parseHorizonsJson(await response.json() as HorizonsPayload);
  } catch {
    return null;
  }
  const first = rows[0];
  if (!first) return null;
  const second = rows[1];
  return {
    longitude: first.longitude,
    latitude: first.latitude,
    retrograde: Boolean(second && signedLongitudeDelta(first.longitude, second.longitude) < 0)
  };
}

export function buildCurrentHorizonsEndpoint(
  env: Env,
  targetId: string,
  startDate: Date,
  stopDate: Date,
  location?: CurrentConditionInput['location']
) {
  const endpoint = new URL(env.BASELINE_HORIZONS_URL || 'https://ssd.jpl.nasa.gov/api/horizons.api');
  const params: Record<string, string> = {
    format: 'json',
    COMMAND: `'${targetId}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'OBSERVER',
    CENTER: location ? 'coord@399' : `'500@399'`,
    START_TIME: `'${horizonsDate(startDate)}'`,
    STOP_TIME: `'${horizonsDate(stopDate)}'`,
    STEP_SIZE: `'6 h'`,
    QUANTITIES: `'31'`,
    CSV_FORMAT: 'YES',
    CAL_FORMAT: 'CAL',
    CAL_TYPE: 'GREGORIAN',
    EXTRA_PREC: 'YES'
  };
  if (location) {
    params.COORD_TYPE = 'GEODETIC';
    params.SITE_COORD = `'${location.longitude.toFixed(4)},${location.latitude.toFixed(4)},0'`;
  }
  for (const [key, value] of Object.entries(params)) endpoint.searchParams.set(key, value);
  return endpoint;
}

function horizonsDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getUTCFullYear()}-${months[date.getUTCMonth()]}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

function facetsForBody(body: string): BaselineFacetId[] {
  const mapped: Partial<Record<string, BaselineFacetId[]>> = {
    sun: ['core_orientation', 'identity_purpose', 'leadership'],
    moon: ['love_connection', 'response_pressure', 'response_change'],
    mercury: ['communication', 'learning', 'decision_making'],
    venus: ['love_connection', 'creativity_expression', 'boundaries'],
    mars: ['leadership', 'conflict_repair', 'response_pressure'],
    jupiter: ['learning', 'underused_capacity', 'response_change'],
    saturn: ['responsibility', 'boundaries', 'alignment_markers'],
    uranus: ['response_change', 'creativity_expression', 'underused_capacity'],
    neptune: ['creativity_expression', 'love_connection', 'shadow_expression'],
    pluto: ['conflict_repair', 'shadow_expression', 'gift_expression'],
    chiron: ['underused_capacity', 'shadow_expression', 'gift_expression']
  };
  return (mapped[body] ?? ['core_orientation']).filter((id) => baselineFacetIds.includes(id));
}

function computeCurrentToNatalContacts(
  current: ReducedCurrentCondition['activeFactors'],
  natal: BaselineSourceData['natalBodies']
): ReducedCurrentCondition['currentToNatalContacts'] {
  const definitions = [
    { aspect: 'conjunction' as const, angle: 0, orb: 3 },
    { aspect: 'sextile' as const, angle: 60, orb: 2 },
    { aspect: 'square' as const, angle: 90, orb: 3 },
    { aspect: 'trine' as const, angle: 120, orb: 3 },
    { aspect: 'opposition' as const, angle: 180, orb: 3 }
  ];
  const contacts: ReducedCurrentCondition['currentToNatalContacts'] = [];
  for (const live of current) {
    for (const base of natal) {
      const separation = Math.abs(signedLongitudeDelta(base.longitude, live.longitude));
      for (const definition of definitions) {
        const orb = Math.abs(separation - definition.angle);
        if (orb > definition.orb) continue;
        const rounded = Math.round(orb * 10) / 10;
        contacts.push({
          id: `contact.${live.body}.${definition.aspect}.${base.body}`,
          currentBody: live.body,
          natalBody: base.body,
          aspect: definition.aspect,
          orb: rounded,
          display: `Current ${live.body} ${definition.aspect} natal ${base.body} (${rounded.toFixed(1)}° orb)`,
          basisRef: `contact.${live.body}.${definition.aspect}.${base.body}`,
          affectedFacetIds: [...new Set([...facetsForBody(live.body), ...facetsForBody(base.body)])],
          uncertainty: live.uncertainty === 'high' || base.uncertainty === 'high'
            ? 'high'
            : live.uncertainty === 'medium' || base.uncertainty === 'medium'
              ? 'medium'
              : 'low'
        });
      }
    }
  }
  return contacts.sort((left, right) => left.orb - right.orb).slice(0, 12);
}
