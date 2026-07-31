import type { Env } from './env';
import { isValidTimeZone } from './baseline-engine';
import {
  baselinePlaceQuerySchema,
  storeServerPlaceResolution,
  type BaselinePlaceCandidate,
  type BaselinePlaceQuery
} from './baseline-place-resolution';

const DEFAULT_GEONAMES_URL = 'https://secure.geonames.org/';
const RESOLVER_SOURCE = 'GeoNames';
const RESOLVER_VERSION = 'geonames-webservices.v1';
const MAX_CANDIDATES = 4;

interface GeoNamesStatus {
  value?: number;
  message?: string;
}

interface GeoNamesEntry {
  geonameId?: number;
  name?: string;
  toponymName?: string;
  adminName1?: string;
  adminCode1?: string;
  countryName?: string;
  countryCode?: string;
  featureClass?: string;
  lat?: string;
  lng?: string;
  timezone?: { timeZoneId?: string };
}

interface GeoNamesSearchPayload {
  totalResultsCount?: number;
  geonames?: GeoNamesEntry[];
  status?: GeoNamesStatus;
}

interface GeoNamesTimezonePayload {
  timezoneId?: string;
  status?: GeoNamesStatus;
}

export interface PublicBaselinePlaceCandidate {
  resolutionId: string;
  displayName: string;
  timezone: string;
  confidence: 'low' | 'medium' | 'high';
  attribution: 'GeoNames';
  confirmed: false;
}

export async function resolveAndStoreBaselinePlaceCandidates(
  env: Env,
  accountId: string,
  rawQuery: unknown,
  fetchImpl: typeof fetch = fetch
): Promise<PublicBaselinePlaceCandidate[]> {
  const query = baselinePlaceQuerySchema.parse(rawQuery);
  const candidates = await resolveGeoNamesCandidates(env, query, fetchImpl);
  const stored: PublicBaselinePlaceCandidate[] = [];
  for (const candidate of candidates) {
    const resolution = await storeServerPlaceResolution(env, accountId, query, candidate, { confirmed: false });
    stored.push({
      resolutionId: resolution.id,
      displayName: resolution.displayName,
      timezone: resolution.timezone,
      confidence: resolution.confidence,
      attribution: RESOLVER_SOURCE,
      confirmed: false
    });
  }
  return stored;
}

export async function resolveGeoNamesCandidates(
  env: Env,
  query: BaselinePlaceQuery,
  fetchImpl: typeof fetch = fetch
): Promise<BaselinePlaceCandidate[]> {
  if ((env.BASELINE_PLACE_PROVIDER ?? 'geonames') !== 'geonames') {
    throw new Error('baseline_place_provider_unsupported');
  }
  const username = env.BASELINE_GEONAMES_USERNAME?.trim();
  if (!username) throw new Error('baseline_place_provider_unconfigured');

  const endpoint = geonamesUrl(env, 'searchJSON');
  endpoint.searchParams.set('q', [query.city, query.region, query.country].filter(Boolean).join(', '));
  endpoint.searchParams.set('featureClass', 'P');
  endpoint.searchParams.set('operator', 'AND');
  endpoint.searchParams.set('maxRows', String(MAX_CANDIDATES));
  endpoint.searchParams.set('style', 'FULL');
  endpoint.searchParams.set('lang', 'en');
  authorize(endpoint, env, username);

  const response = await timedFetch(fetchImpl, endpoint, env);
  if (!response.ok) throw new Error('baseline_place_search_unavailable');
  const payload = await response.json() as GeoNamesSearchPayload;
  assertGeoNamesPayload(payload.status);
  const entries = (payload.geonames ?? [])
    .filter((entry) => entry.featureClass === 'P')
    .slice(0, MAX_CANDIDATES);
  if (!entries.length) return [];

  const resolved: Array<{ entry: GeoNamesEntry; candidate: Omit<BaselinePlaceCandidate, 'confidence'> }> = [];
  for (const entry of entries) {
    const latitude = Number(entry.lat);
    const longitude = Number(entry.lng);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) continue;
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) continue;
    const timezone = await resolveTimezone(env, entry, latitude, longitude, username, fetchImpl);
    if (!timezone) continue;
    const displayName = displayPlace(entry);
    if (!displayName) continue;
    resolved.push({
      entry,
      candidate: {
        displayName,
        latitude,
        longitude,
        timezone,
        resolverSource: RESOLVER_SOURCE,
        resolverVersion: RESOLVER_VERSION
      }
    });
  }

  const exactMatches = resolved.filter(({ entry }) => exactPlaceMatch(query, entry)).length;
  return resolved.map(({ entry, candidate }, index) => ({
    ...candidate,
    confidence: confidenceFor(query, entry, index, exactMatches)
  }));
}

async function resolveTimezone(
  env: Env,
  entry: GeoNamesEntry,
  latitude: number,
  longitude: number,
  username: string,
  fetchImpl: typeof fetch
): Promise<string | null> {
  const embedded = entry.timezone?.timeZoneId?.trim();
  if (embedded && isValidTimeZone(embedded)) return embedded;

  const endpoint = geonamesUrl(env, 'timezoneJSON');
  endpoint.searchParams.set('lat', latitude.toFixed(6));
  endpoint.searchParams.set('lng', longitude.toFixed(6));
  authorize(endpoint, env, username);
  const response = await timedFetch(fetchImpl, endpoint, env);
  if (!response.ok) return null;
  const payload = await response.json() as GeoNamesTimezonePayload;
  assertGeoNamesPayload(payload.status);
  const timezone = payload.timezoneId?.trim();
  return timezone && isValidTimeZone(timezone) ? timezone : null;
}

function geonamesUrl(env: Env, service: string): URL {
  const base = new URL(env.BASELINE_GEONAMES_URL || DEFAULT_GEONAMES_URL);
  if (base.protocol !== 'https:') throw new Error('baseline_place_provider_insecure');
  base.pathname = `${base.pathname.replace(/\/?$/, '/')}${service}`;
  base.search = '';
  return base;
}

function authorize(endpoint: URL, env: Env, username: string) {
  endpoint.searchParams.set('username', username);
  const token = env.BASELINE_GEONAMES_TOKEN?.trim();
  if (token) endpoint.searchParams.set('token', token);
}

async function timedFetch(fetchImpl: typeof fetch, url: URL, env: Env): Promise<Response> {
  const configured = Number(env.BASELINE_PROVIDER_TIMEOUT_MS ?? 8000);
  const timeout = Number.isFinite(configured) ? Math.min(Math.max(configured, 1000), 15_000) : 8000;
  return fetchImpl(url, {
    headers: { 'User-Agent': 'Sovereign.OS Baseline Place Resolver/1.0' },
    signal: AbortSignal.timeout(timeout)
  });
}

function assertGeoNamesPayload(status?: GeoNamesStatus) {
  if (!status) return;
  const value = Number(status.value);
  if (value === 15) return;
  if ([10, 18, 19, 20].includes(value)) throw new Error('baseline_place_provider_capacity');
  throw new Error('baseline_place_provider_error');
}

function displayPlace(entry: GeoNamesEntry): string {
  return uniqueText([
    entry.name || entry.toponymName,
    entry.adminName1,
    entry.countryName || entry.countryCode
  ]).join(', ');
}

function exactPlaceMatch(query: BaselinePlaceQuery, entry: GeoNamesEntry): boolean {
  const city = normalize(entry.name || entry.toponymName) === normalize(query.city);
  const country = [entry.countryName, entry.countryCode].some((value) => normalize(value) === normalize(query.country));
  const region = !query.region || [entry.adminName1, entry.adminCode1].some((value) => normalize(value) === normalize(query.region));
  return city && country && region;
}

function confidenceFor(
  query: BaselinePlaceQuery,
  entry: GeoNamesEntry,
  index: number,
  exactMatchCount: number
): 'low' | 'medium' | 'high' {
  if (exactPlaceMatch(query, entry) && index === 0 && exactMatchCount === 1) return 'high';
  const city = normalize(entry.name || entry.toponymName) === normalize(query.city);
  const country = [entry.countryName, entry.countryCode].some((value) => normalize(value) === normalize(query.country));
  return city && country ? 'medium' : 'low';
}

function normalize(value?: string): string {
  return (value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function uniqueText(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  return values.flatMap((value) => {
    const clean = value?.trim();
    const key = normalize(clean);
    if (!clean || !key || seen.has(key)) return [];
    seen.add(key);
    return [clean];
  });
}
