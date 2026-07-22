import type { Env } from '../env';

export interface CurrentConditionInput {
  accountId: string;
  timestamp?: string;
  location?: { latitude: number; longitude: number; precision: 'city' | 'region' | 'ephemeral' } | undefined;
  fixtureBodies?: Record<string, { longitude: number; latitude: number; retrograde?: boolean }> | undefined;
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
  locationPrecisionUsed: 'city' | 'region' | 'ephemeral' | 'none';
  activeFactors: Array<{
    body: string;
    sign: string;
    degree: number;
    retrograde: boolean;
    label: string;
    quality: 'clarifying' | 'pressurizing' | 'softening' | 'intensifying' | 'stabilizing';
    relativeStrength: number;
  }>;
  affectedBaselineDimensions: Array<'identity' | 'decisions' | 'communication' | 'learning' | 'love' | 'expression' | 'pressure_response'>;
  amplification: {
    direction: string;
    quality: string;
    relativeStrength: number;
  };
  uncertainty: 'low' | 'medium' | 'high';
  safeLabels: string[];
  separations: {
    baselineTendency: string;
    currentAmplification: string;
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

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as const;

export function eclipticLongitudeToSign(longitude: number): { sign: string; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return { sign: ZODIAC_SIGNS[signIndex] ?? 'Aries', degree: Math.round(degree * 100) / 100 };
}

export async function computeReducedCurrentConditions(env: Env, input: CurrentConditionInput): Promise<ReducedCurrentCondition> {
  const computedAt = new Date(input.timestamp ?? Date.now()).toISOString();
  const expiresAt = new Date(new Date(computedAt).getTime() + 6 * 60 * 60 * 1000).toISOString();
  const bodies = input.fixtureBodies ?? await fetchCurrentBodies(env, computedAt, input.location);
  const activeFactors = Object.entries(bodies).map(([body, position]) => {
    const { sign, degree } = eclipticLongitudeToSign(position.longitude);
    const retrograde = position.retrograde === true;
    const quality = qualityForBody(body, retrograde);
    return {
      body,
      sign,
      degree,
      retrograde,
      label: `${title(body)} in ${sign}${retrograde ? ' retrograde' : ''}`,
      quality,
      relativeStrength: strengthForBody(body, retrograde)
    };
  }).sort((left, right) => right.relativeStrength - left.relativeStrength).slice(0, 6);

  const affectedBaselineDimensions = affectedDimensions(activeFactors.map((factor) => factor.body));
  const relativeStrength = activeFactors.length ? Math.round(activeFactors.reduce((sum, factor) => sum + factor.relativeStrength, 0) / activeFactors.length) : 0;
  return {
    version: 'current-conditions.v1',
    computedAt,
    expiresAt,
    source: input.fixtureBodies ? 'OPENAPI_SANITIZED_FIXTURE' : 'OPENAPI_PORTED_HORIZONS',
    provenance: { referenceCommit: REFERENCE_COMMIT, referenceFiles: REFERENCE_FILES, implementation: 'ported-minimal-current-condition-layer' },
    locationPrecisionUsed: input.location?.precision ?? 'none',
    activeFactors,
    affectedBaselineDimensions,
    amplification: {
      direction: relativeStrength >= 70 ? 'louder' : relativeStrength >= 40 ? 'noticeable' : 'subtle',
      quality: summarizeQuality(activeFactors.map((factor) => factor.quality)),
      relativeStrength
    },
    uncertainty: input.fixtureBodies ? 'low' : input.location ? 'medium' : 'high',
    safeLabels: [
      'Current amplification is context, not certainty.',
      'Observed behavior must come from the user.',
      'Actual state remains unknown unless confirmed.'
    ],
    separations: {
      baselineTendency: 'Enduring pattern language belongs to the Baseline layer.',
      currentAmplification: 'Current conditions may make some themes louder or softer for a limited window.',
      observedBehavior: 'No behavior is treated as observed unless the user supplies or confirms it.',
      unknownActualState: 'No exact emotion, motive, diagnosis, or future behavior is inferred.'
    }
  };
}

async function fetchCurrentBodies(env: Env, computedAt: string, location?: CurrentConditionInput['location']): Promise<Record<string, { longitude: number; latitude: number; retrograde?: boolean }>> {
  if (!location) throw new Error('Permitted location is required for current-condition computation');
  const cacheKey = `current_conditions:${location.latitude.toFixed(1)}:${location.longitude.toFixed(1)}:${computedAt.slice(0, 13)}`;
  const cached = await env.KV?.get(cacheKey, 'json') as Record<string, { longitude: number; latitude: number; retrograde?: boolean }> | null;
  if (cached) return cached;
  const entries = Object.entries(PLANET_IDS);
  const bodies: Record<string, { longitude: number; latitude: number; retrograde?: boolean }> = {};
  for (const [name, targetId] of entries) {
    if (Object.keys(bodies).length > 0) await new Promise((resolve) => setTimeout(resolve, 150));
    const position = await fetchHorizonsPosition(targetId, computedAt, location.latitude, location.longitude);
    if (position) bodies[name] = position;
  }
  if (!Object.keys(bodies).length) throw new Error('No Horizons current-condition bodies returned');
  await env.KV?.put(cacheKey, JSON.stringify(bodies), { expirationTtl: 6 * 60 * 60 });
  return bodies;
}

async function fetchHorizonsPosition(targetId: string, computedAt: string, lat: number, lng: number): Promise<{ longitude: number; latitude: number; retrograde: boolean } | null> {
  const startDate = new Date(computedAt);
  const stopDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
  const start = horizonsDate(startDate);
  const stop = horizonsDate(stopDate);
  const params = new URLSearchParams({
    format: 'json', COMMAND: `'${targetId}'`, OBJ_DATA: 'NO', MAKE_EPHEM: 'YES', EPHEM_TYPE: 'OBSERVER', CENTER: 'coord@399', COORD_TYPE: 'GEODETIC',
    SITE_COORD: `'${lng.toFixed(4)},${lat.toFixed(4)},0'`, START_TIME: `'${start}'`, STOP_TIME: `'${stop}'`, STEP_SIZE: '1d', QUANTITIES: '31', CSV_FORMAT: 'NO'
  });
  const response = await fetch(`https://ssd.jpl.nasa.gov/api/horizons.api?${params}`, { headers: { 'User-Agent': 'SovereignOS/1.0 openapi-current-conditions' }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  const text = await response.text();
  const soeMatch = text.match(/\$\$SOE([\s\S]*?)\$\$EOE/);
  if (!soeMatch?.[1]) return null;
  const dataLine = soeMatch[1].trim().split('\n')[0] ?? '';
  const numbers = dataLine.match(/-?\d+\.\d+/g);
  if (!numbers || numbers.length < 2) return null;
  return { longitude: parseFloat(numbers[0] ?? '0'), latitude: parseFloat(numbers[1] ?? '0'), retrograde: text.includes('R') && dataLine.includes('R') };
}

function horizonsDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getUTCFullYear()}-${months[date.getUTCMonth()]}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

function title(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function qualityForBody(body: string, retrograde: boolean): ReducedCurrentCondition['activeFactors'][number]['quality'] {
  if (retrograde) return 'intensifying';
  if (body === 'mercury') return 'clarifying';
  if (body === 'venus' || body === 'moon') return 'softening';
  if (body === 'saturn') return 'stabilizing';
  if (body === 'mars' || body === 'pluto') return 'pressurizing';
  return 'clarifying';
}

function strengthForBody(body: string, retrograde: boolean): number {
  const base: Record<string, number> = { moon: 78, sun: 74, mercury: 68, venus: 62, mars: 72, jupiter: 55, saturn: 70, uranus: 58, neptune: 52, pluto: 60, chiron: 48 };
  return Math.min(100, (base[body] ?? 50) + (retrograde ? 8 : 0));
}

function affectedDimensions(bodies: string[]): ReducedCurrentCondition['affectedBaselineDimensions'] {
  const out = new Set<ReducedCurrentCondition['affectedBaselineDimensions'][number]>();
  if (bodies.includes('mercury')) out.add('communication').add('learning').add('decisions');
  if (bodies.includes('venus')) out.add('love').add('expression');
  if (bodies.includes('mars') || bodies.includes('saturn') || bodies.includes('pluto')) out.add('pressure_response').add('decisions');
  if (bodies.includes('sun') || bodies.includes('moon')) out.add('identity').add('expression');
  if (!out.size) out.add('identity');
  return [...out];
}

function summarizeQuality(qualities: ReducedCurrentCondition['activeFactors'][number]['quality'][]): string {
  if (qualities.includes('pressurizing') || qualities.includes('intensifying')) return 'pressure may be easier to notice, without becoming proof of what is true';
  if (qualities.includes('stabilizing')) return 'structure may be easier to use when kept humane';
  if (qualities.includes('softening')) return 'connection themes may be more noticeable';
  return 'clarity themes may be easier to name';
}
