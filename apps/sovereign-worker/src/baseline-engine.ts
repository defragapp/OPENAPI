import type { Env } from './env';
import type { BaselineProvider, BaselineProviderOutput, normalizeBaselineInput } from './baseline';
import {
  BASELINE_SOURCE_VERSION,
  type BaselineSourceData,
  type DataUncertainty
} from './baseline-contracts';

const DEFAULT_HORIZONS_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 365;
const REFERENCE_COMMIT = 'a3db94bccc75089723bef0cf5ff36c47064bd789';

const PLANET_IDS: Record<string, string> = {
  sun: '10',
  moon: '301',
  mercury: '199',
  venus: '299',
  mars: '499',
  jupiter: '599',
  saturn: '699',
  uranus: '799',
  neptune: '899',
  pluto: '999'
};

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

const SIGN_THEMES: Record<string, string> = {
  Aries: 'direct action and clear initiation',
  Taurus: 'stability, pacing, and practical continuity',
  Gemini: 'curiosity, comparison, and communication',
  Cancer: 'protection, belonging, and emotional context',
  Leo: 'visible expression, authorship, and creative direction',
  Virgo: 'discernment, usefulness, and careful refinement',
  Libra: 'reciprocity, perspective, and relational balance',
  Scorpio: 'depth, trust, and consequential change',
  Sagittarius: 'meaning, exploration, and wider possibility',
  Capricorn: 'structure, responsibility, and durable progress',
  Aquarius: 'independence, systems, and unconventional perspective',
  Pisces: 'sensitivity, imagination, and porous context'
};

// Personality-gate wheel retained as a reference-derived interpretive mapping.
// It does not claim a complete Human Design bodygraph, authority, type, or design-side calculation.
const HD_GATE_WHEEL = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
] as const;

export interface HorizonsPayload {
  signature?: { source?: string; version?: string };
  result?: string;
  error?: string;
  message?: string;
}

interface BodyPosition {
  longitude: number;
  latitude: number;
  retrograde: boolean;
  sign: string;
  degree: number;
}

type NormalizedBaselineInput = ReturnType<typeof normalizeBaselineInput>;
type FetchLike = typeof fetch;

export function createOpenApiBaselineProvider(env: Env, fetchImpl: FetchLike = fetch): BaselineProvider {
  return {
    async compute(input) {
      const normalized = input as NormalizedBaselineInput;
      const cacheKey = `baseline-engine:v2:${await hashJson({
        birthDate: normalized.birthDate,
        birthTime: normalized.birthTime ?? null,
        birthTimeCertainty: normalized.birthTimeCertainty,
        birthTimezone: normalized.birthTimezone,
        birthplaceHash: await sha256(normalized.birthplace.toLowerCase())
      })}`;
      const cached = await env.KV?.get(cacheKey, 'json') as BaselineProviderOutput | null;
      if (cached) return cached;

      const localTime = normalized.birthTime ?? '12:00';
      const birthInstant = localCivilTimeToUtc(normalized.birthDate, localTime, normalized.birthTimezone);
      const positions = await computeNatalPositions(env, birthInstant, fetchImpl);
      if (!positions.sun || !positions.moon) throw new Error('Required natal positions were unavailable');

      const placements = Object.fromEntries(
        Object.entries(positions).map(([body, position]) => [body, `${position.sign} ${position.degree.toFixed(2)}°${position.retrograde ? ' retrograde' : ''}`])
      );
      const aspectRecords = computeMajorAspects(positions, normalized.birthTimeCertainty);
      const aspects = aspectRecords.map((aspect) => aspect.display);
      const timeKnown = normalized.birthTimeCertainty !== 'unknown';
      const personalityGates = timeKnown
        ? Object.fromEntries(Object.entries(positions).map(([body, position]) => [body, gateForLongitude(position.longitude)]))
        : {};
      const numerology = computeNumerology(normalized.birthDate);
      const baselineTendency = summarizeBaseline(positions);
      const interpretiveSignals = [
        `Sun in ${positions.sun.sign}`,
        `Moon in ${positions.moon.sign}`,
        positions.mercury ? `Mercury in ${positions.mercury.sign}` : undefined,
        ...aspects.slice(0, 3)
      ].filter((value): value is string => Boolean(value));
      const computedAt = new Date().toISOString();
      const sourceData = buildSourceData(
        positions,
        aspectRecords,
        personalityGates,
        numerology,
        normalized.birthTimeCertainty,
        computedAt
      );

      const output: BaselineProviderOutput = {
        sourceData,
        natalPlacements: placements,
        houses: null,
        aspects,
        humanDesign: timeKnown ? {
          status: 'partial_personality_activations_only',
          personalityGates,
          withheld: 'Type, authority, centers, channels, profile, and design-side activations are not asserted by this engine.'
        } : null,
        geneKeys: timeKnown ? {
          status: 'partial_activation_numbers_only',
          activations: personalityGates,
          withheld: 'Shadow, gift, siddhi, spheres, and profile claims are not generated without a separately verified contract.'
        } : {},
        numerology,
        currentAstronomy: {},
        baselineTendency,
        interpretiveSignals,
        sourceTimestamp: computedAt,
        provenance: {
          engine: 'openapi-cloudflare-baseline-engine-v2',
          referenceCommit: REFERENCE_COMMIT,
          astronomySource: 'NASA/JPL Horizons API',
          observerCenter: 'Earth geocenter 500@399',
          timezoneSource: 'user-selected IANA timezone',
          birthplaceSentToExternalProvider: false,
          rawBirthInputReturned: false,
          completeHumanDesignClaimed: false,
          completeGeneKeysClaimed: false,
          housesClaimed: false
        }
      };

      await env.KV?.put(cacheKey, JSON.stringify(output), { expirationTtl: CACHE_TTL_SECONDS });
      return output;
    }
  };
}

async function computeNatalPositions(env: Env, instant: Date, fetchImpl: FetchLike): Promise<Record<string, BodyPosition>> {
  const positions: Record<string, BodyPosition> = {};
  for (const [body, targetId] of Object.entries(PLANET_IDS)) {
    if (Object.keys(positions).length > 0) await delay(125);
    const rows = await fetchHorizonsRows(env, targetId, instant, fetchImpl);
    if (!rows.length) continue;
    const first = rows[0]!;
    const second = rows[1];
    const sign = longitudeToSign(first.longitude);
    positions[body] = {
      longitude: first.longitude,
      latitude: first.latitude,
      retrograde: Boolean(second && signedLongitudeDelta(first.longitude, second.longitude) < 0),
      sign: sign.sign,
      degree: sign.degree
    };
  }
  return positions;
}

async function fetchHorizonsRows(env: Env, targetId: string, instant: Date, fetchImpl: FetchLike) {
  const stop = new Date(instant.getTime() + 12 * 60 * 60 * 1000);
  const url = new URL(env.BASELINE_HORIZONS_URL || DEFAULT_HORIZONS_URL);
  const params: Record<string, string> = {
    format: 'json',
    COMMAND: `'${targetId}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'OBSERVER',
    CENTER: `'500@399'`,
    START_TIME: `'${horizonsDate(instant)}'`,
    STOP_TIME: `'${horizonsDate(stop)}'`,
    STEP_SIZE: `'6 h'`,
    QUANTITIES: `'31'`,
    CSV_FORMAT: 'YES',
    CAL_FORMAT: 'CAL',
    CAL_TYPE: 'GREGORIAN',
    EXTRA_PREC: 'YES'
  };
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await timedFetch(fetchImpl, url, {
    headers: { 'User-Agent': 'Sovereign.OS OPENAPI Baseline Engine/2.0' }
  }, timeoutMs(env));
  if (!response.ok) throw new Error(`Horizons unavailable (${response.status})`);
  return parseHorizonsJson(await response.json() as HorizonsPayload);
}

export function parseHorizonsJson(payload: HorizonsPayload): Array<{ longitude: number; latitude: number }> {
  if (payload.error || payload.message) throw new Error('Horizons returned an error payload');
  const source = payload.signature?.source ?? '';
  const version = payload.signature?.version ?? '';
  if (!/NASA\/JPL Horizons API/i.test(source) || !/^1\./.test(version)) {
    throw new Error('Unexpected Horizons API signature');
  }
  const result = payload.result ?? '';
  const block = result.match(/\$\$SOE([\s\S]*?)\$\$EOE/)?.[1];
  if (!block) throw new Error('Horizons ephemeris rows were missing');

  const rows: Array<{ longitude: number; latitude: number }> = [];
  for (const rawLine of block.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const fields = parseCsvLine(line);
    const numeric = fields
      .map((field) => field.trim())
      .filter((field) => field.length > 0)
      .map((field) => Number(field))
      .filter((value) => Number.isFinite(value));
    if (numeric.length < 2) continue;
    const longitude = numeric[numeric.length - 2]!;
    const latitude = numeric[numeric.length - 1]!;
    if (longitude >= 0 && longitude < 360 && latitude >= -90 && latitude <= 90) {
      rows.push({ longitude, latitude });
    }
  }
  if (!rows.length) throw new Error('Horizons ecliptic longitude and latitude could not be parsed');
  return rows;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]!;
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

interface ComputedAspect {
  id: string;
  leftBody: string;
  aspect: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  rightBody: string;
  orb: number;
  display: string;
  uncertainty: DataUncertainty;
}

function computeMajorAspects(
  positions: Record<string, BodyPosition>,
  certainty: NormalizedBaselineInput['birthTimeCertainty']
): ComputedAspect[] {
  const definitions = [
    { name: 'conjunction' as const, angle: 0, orb: 8 },
    { name: 'sextile' as const, angle: 60, orb: 5 },
    { name: 'square' as const, angle: 90, orb: 7 },
    { name: 'trine' as const, angle: 120, orb: 7 },
    { name: 'opposition' as const, angle: 180, orb: 8 }
  ] as const;
  const entries = Object.entries(positions);
  const aspects: ComputedAspect[] = [];
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const [leftName, leftPosition] = entries[left]!;
      const [rightName, rightPosition] = entries[right]!;
      const separation = Math.abs(signedLongitudeDelta(leftPosition.longitude, rightPosition.longitude));
      for (const definition of definitions) {
        const orb = Math.abs(separation - definition.angle);
        if (orb <= definition.orb) {
          aspects.push({
            id: `aspect.${leftName}.${definition.name}.${rightName}`,
            leftBody: leftName,
            aspect: definition.name,
            rightBody: rightName,
            orb: Math.round(orb * 10) / 10,
            display: `${title(leftName)} ${definition.name} ${title(rightName)} (${orb.toFixed(1)}° orb)`,
            uncertainty: certaintyUncertainty(certainty, leftName === 'moon' || rightName === 'moon')
          });
        }
      }
    }
  }
  return aspects.slice(0, 16);
}

function buildSourceData(
  positions: Record<string, BodyPosition>,
  aspects: ComputedAspect[],
  personalityGates: Record<string, { gate: number; line: number }>,
  numerology: Record<string, number>,
  certainty: NormalizedBaselineInput['birthTimeCertainty'],
  computedAt: string
): BaselineSourceData {
  return {
    version: BASELINE_SOURCE_VERSION,
    computationVersion: 'openapi-baseline-engine-v3',
    computedAt,
    uncertainty: certainty === 'exact' ? 'low' : certainty === 'approximate' ? 'medium' : 'high',
    natalBodies: Object.entries(positions).map(([body, position]) => ({
      id: `natal.${body}`,
      body,
      sign: position.sign,
      longitude: Math.round(position.longitude * 10_000) / 10_000,
      displayDegree: `${position.degree.toFixed(1)}°`,
      retrograde: position.retrograde,
      uncertainty: certaintyUncertainty(certainty, body === 'moon')
    })),
    aspects,
    humanDesign: {
      personalityActivations: Object.entries(personalityGates).map(([body, value]) => ({
        id: `hd.personality.${body}`,
        body,
        gate: value.gate,
        line: value.line,
        uncertainty: certainty === 'exact' ? 'low' : 'medium'
      }))
    },
    geneKeys: {
      activations: Object.entries(personalityGates).map(([body, value]) => ({
        id: `gk.activation.${body}`,
        body,
        activation: value.gate,
        uncertainty: certainty === 'exact' ? 'low' : 'medium'
      }))
    },
    numerology: Object.entries(numerology)
      .filter(([key]) => key === 'lifePath' || key === 'birthDay')
      .map(([key, value]) => ({
        id: `numerology.${key}`,
        key: key as 'lifePath' | 'birthDay',
        value,
        uncertainty: 'low' as const
      })),
    houses: null,
    provenance: {
      astronomy: 'NASA/JPL Horizons',
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

function certaintyUncertainty(
  certainty: NormalizedBaselineInput['birthTimeCertainty'],
  timeSensitive: boolean
): DataUncertainty {
  if (certainty === 'exact') return 'low';
  if (certainty === 'approximate') return timeSensitive ? 'medium' : 'low';
  return timeSensitive ? 'high' : 'medium';
}

function gateForLongitude(longitude: number): { gate: number; line: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const gateIndex = Math.min(63, Math.floor(normalized / 5.625));
  const positionInGate = normalized - gateIndex * 5.625;
  return { gate: HD_GATE_WHEEL[gateIndex]!, line: Math.min(6, Math.floor(positionInGate / 0.9375) + 1) };
}

function computeNumerology(birthDate: string): Record<string, number> {
  const digits = birthDate.replace(/\D/g, '').split('').map(Number);
  const day = Number(birthDate.slice(8, 10));
  return { lifePath: reduceNumber(digits.reduce((sum, value) => sum + value, 0)), birthDay: reduceNumber(day) };
}

function summarizeBaseline(positions: Record<string, BodyPosition>): string {
  const sun = positions.sun!;
  const moon = positions.moon!;
  const mercury = positions.mercury;
  const themes = [SIGN_THEMES[sun.sign], SIGN_THEMES[moon.sign], mercury ? SIGN_THEMES[mercury.sign] : undefined]
    .filter((value): value is string => Boolean(value));
  return `This reduced interpretive Baseline emphasizes ${themes.join('; ')}. These are reflection themes, not measurements of personality or proof of present behavior.`;
}

function longitudeToSign(longitude: number) {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return { sign: ZODIAC_SIGNS[index] ?? 'Aries', degree: normalized % 30 };
}

function signedLongitudeDelta(from: number, to: number) {
  return ((to - from + 540) % 360) - 180;
}

export function localCivilTimeToUtc(date: string, time: string, timezone: string): Date {
  if (!isValidTimeZone(timezone)) throw new Response('Invalid birthplace timezone', { status: 400 });
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const desiredUtc = Date.UTC(year!, month! - 1, day!, hour!, minute!);
  let candidate = desiredUtc;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(new Date(candidate));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const representedUtc = Date.UTC(
      Number(values.year), Number(values.month) - 1, Number(values.day),
      Number(values.hour), Number(values.minute), Number(values.second)
    );
    candidate += desiredUtc - representedUtc;
  }
  return new Date(candidate);
}

export function isValidTimeZone(timezone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function horizonsDate(date: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getUTCFullYear()}-${months[date.getUTCMonth()]}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

function timeoutMs(env: Env) {
  const parsed = Number(env.BASELINE_PROVIDER_TIMEOUT_MS ?? 8000);
  return Number.isFinite(parsed) && parsed >= 1000 && parsed <= 20000 ? parsed : 8000;
}

async function timedFetch(fetchImpl: FetchLike, input: RequestInfo | URL, init: RequestInit, timeout: number) {
  return fetchImpl(input, { ...init, signal: AbortSignal.timeout(timeout) });
}

async function hashJson(value: unknown) {
  return sha256(JSON.stringify(value));
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function reduceNumber(value: number): number {
  let current = value;
  while (current > 9 && current !== 11 && current !== 22 && current !== 33) {
    current = String(current).split('').reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

function title(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
