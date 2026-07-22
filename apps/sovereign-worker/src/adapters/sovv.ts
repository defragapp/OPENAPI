import type { Env } from '../env';
import { canUseDevelopmentFixtures } from '../runtime';
import { computeReducedCurrentConditions } from '../current-conditions/current';

export interface AdapterEnvelope<T> {
  contractVersion: '1';
  requestId: string;
  provenance: 'sovv-service-binding' | 'sovv-internal-http' | 'openapi-fixture';
  uncertainty: 'low' | 'medium' | 'high';
  data: T;
}

export interface BaselineSummary {
  status: 'none' | 'pending' | 'ready' | 'failed' | 'degraded';
  summary: string;
  dimensions: Array<{ name: string; tendency: string; underPressure?: string; supportiveMove?: string; sourceRefs?: string[] }>;
  unknowns: string[];
  sourceRefs: string[];
}

export interface CurrentConditions {
  status: 'unavailable' | 'ready' | 'degraded';
  headline: string;
  amplifications: Array<{ name: string; effect: string; certainty: 'low' | 'medium' }>;
  unknowns: string[];
  sourceRefs: string[];
}

export interface LibrarySearchResult {
  items: Array<{ id: string; title: string; workspaceSource: string; createdAt?: string | undefined }>;
}

export interface ExistingIdentity {
  subject: string;
  email?: string | undefined;
  tier?: string | undefined;
  role?: string | undefined;
}

interface AdapterOptions {
  cookieHeader?: string | undefined;
}

function fixtureAllowed(env: Env): boolean {
  return canUseDevelopmentFixtures(env);
}

function requireSovv(env: Env): void {
  if (!env.SOVV_INTERNAL_BASE_URL) throw new Error('SOVV base URL is not configured');
}

async function callSovv<T>(env: Env, path: string, init: RequestInit, fallback: T, options: AdapterOptions = {}): Promise<AdapterEnvelope<T>> {
  const requestId = crypto.randomUUID();
  if (!env.SOVV_INTERNAL_BASE_URL) {
    if (!fixtureAllowed(env)) throw new Error('SOVV service unavailable');
    return { contractVersion: '1', requestId, provenance: 'openapi-fixture', uncertainty: 'high', data: fallback };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');
  headers.set('x-request-id', requestId);
  headers.set('x-sovereign-contract-version', '1');
  if (env.SOVV_INTERNAL_AUTH_TOKEN) headers.set('authorization', `Bearer ${env.SOVV_INTERNAL_AUTH_TOKEN}`);
  if (options.cookieHeader) headers.set('cookie', options.cookieHeader);
  const response = await fetch(new URL(path, env.SOVV_INTERNAL_BASE_URL), { ...init, signal: controller.signal, headers }).finally(() => clearTimeout(timeout));
  if (!response.ok) throw new Error(`SOVV adapter ${path} failed with ${response.status}`);
  return { contractVersion: '1', requestId, provenance: 'sovv-internal-http', uncertainty: 'medium', data: await response.json<T>() };
}

export async function resolveExistingIdentity(env: Env, cookieHeader?: string): Promise<AdapterEnvelope<ExistingIdentity>> {
  requireSovv(env);
  const result = await callSovv<{ id?: string; email?: string | undefined; tier?: string | undefined; role?: string }>(env, '/api/user/me', { method: 'GET' }, { id: 'fixture-user' }, { cookieHeader });
  const id = result.data.id;
  if (!id) throw new Error('SOVV identity response missing id');
  return { ...result, data: { subject: `sovv:user:${id}`, email: result.data.email, tier: result.data.tier, role: result.data.role } };
}

export async function getBaselineSummary(env: Env, personId: string, focus?: string, options: AdapterOptions = {}): Promise<AdapterEnvelope<BaselineSummary>> {
  if (personId !== 'self') throw new Error('Only self Baseline is available in Phase 1');
  const response = await callSovv<{ baseline?: unknown; datasetStatus?: string }>(env, '/api/baseline', { method: 'GET' }, { datasetStatus: 'fixture' }, { cookieHeader: options.cookieHeader });
  if (response.provenance === 'openapi-fixture') return { ...response, data: developmentBaselineFixture(focus) };
  const status = normalizeBaselineStatus(response.data.datasetStatus);
  return {
    ...response,
    uncertainty: status === 'ready' ? 'medium' : 'high',
    data: {
      status,
      summary: status === 'ready' ? 'A verified SOVV Baseline dataset is available. OPENAPI requested only reduced context.' : 'Your Baseline is not ready yet, so Sovereign cannot personalize this section.',
      dimensions: [],
      unknowns: status === 'ready' ? [] : ['SOVV did not return a ready reduced Baseline dataset.'],
      sourceRefs: ['SOVV:apps/worker/src/baseline.ts:/api/baseline']
    }
  };
}

export async function getBaselineDimension(env: Env, personId: string, dimension: string, options: AdapterOptions = {}): Promise<AdapterEnvelope<BaselineSummary['dimensions'][number]>> {
  if (personId !== 'self') throw new Error('Only self Baseline is available in Phase 1');
  const response = await callSovv<{ identityAnchors?: string[]; traitCount?: number; status?: string }>(env, '/api/baseline/dataset', { method: 'GET' }, { status: 'fixture' }, { cookieHeader: options.cookieHeader });
  if (response.provenance === 'openapi-fixture') return { ...response, data: developmentBaselineFixture(dimension).dimensions[0]! };
  return {
    ...response,
    data: {
      name: dimension,
      tendency: response.data.status === 'ready' ? 'SOVV has a compiled dataset for this account. Use the translation endpoint before showing framework detail.' : 'This dimension is unavailable until the SOVV Baseline dataset is ready.',
      supportiveMove: 'Keep the explanation plain-language and non-deterministic.',
      sourceRefs: ['SOVV:apps/worker/src/baseline.ts:/api/baseline/dataset']
    }
  };
}

export async function getCurrentConditions(env: Env, personId: string): Promise<AdapterEnvelope<CurrentConditions>> {
  if (personId !== 'self') throw new Error('Only self current conditions are available in Phase 1');
  const latitude = Number(env.CURRENT_CONDITIONS_LAT);
  const longitude = Number(env.CURRENT_CONDITIONS_LNG);
  const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
  if (!hasLocation && !fixtureAllowed(env)) throw new Error('Permitted location is required for production current-condition computation');
  const reduced = await computeReducedCurrentConditions(env, {
    accountId: 'resolved-account',
    location: hasLocation ? { latitude: Math.round(latitude * 10) / 10, longitude: Math.round(longitude * 10) / 10, precision: 'city' } : undefined,
    fixtureBodies: hasLocation ? undefined : {
      sun: { longitude: 15.25, latitude: 0.01 },
      mercury: { longitude: 72.4, latitude: -1.2, retrograde: true },
      mars: { longitude: 218.9, latitude: 0.4 }
    }
  });
  return {
    contractVersion: '1',
    requestId: crypto.randomUUID(),
    provenance: reduced.source === 'OPENAPI_SANITIZED_FIXTURE' ? 'openapi-fixture' : 'sovv-internal-http',
    uncertainty: reduced.uncertainty,
    data: {
      status: reduced.source === 'OPENAPI_SANITIZED_FIXTURE' ? 'degraded' : 'ready',
      headline: reduced.amplification.quality,
      amplifications: reduced.activeFactors.map((factor) => ({ name: factor.label, effect: `${factor.quality}; relative strength ${factor.relativeStrength}/100`, certainty: reduced.uncertainty === 'low' ? 'medium' : 'low' })),
      unknowns: [reduced.separations.unknownActualState],
      sourceRefs: ['OPENAPI:apps/sovereign-worker/src/current-conditions/current.ts', ...reduced.provenance.referenceFiles]
    }
  };
}

export async function searchLibrary(env: Env, query: string, options: AdapterOptions = {}): Promise<AdapterEnvelope<LibrarySearchResult>> {
  const params = new URLSearchParams({ q: query, limit: '10' });
  const response = await callSovv<{ items?: Array<{ id?: string; title?: string; workspace_source?: string; created_at?: string }> }>(env, `/api/library?${params}`, { method: 'GET' }, { items: [] }, { cookieHeader: options.cookieHeader });
  return {
    ...response,
    data: { items: (response.data.items ?? []).map((item) => (() => { const mapped: { id: string; title: string; workspaceSource: string; createdAt?: string | undefined } = { id: item.id ?? '', title: item.title ?? 'Untitled', workspaceSource: item.workspace_source ?? 'UNKNOWN' }; if (item.created_at) mapped.createdAt = item.created_at; return mapped; })()) }
  };
}

export async function compareBaselineToCurrentConditions(env: Env, personId: string, options: AdapterOptions = {}): Promise<AdapterEnvelope<{ baseline: BaselineSummary; current: CurrentConditions; separation: string[] }>> {
  const baseline = await getBaselineSummary(env, personId, undefined, options);
  const current = await getCurrentConditions(env, personId).catch((error) => {
    if (!fixtureAllowed(env)) throw error;
    return { contractVersion: '1' as const, requestId: crypto.randomUUID(), provenance: 'openapi-fixture' as const, uncertainty: 'high' as const, data: developmentCurrentFixture() };
  });
  return {
    contractVersion: '1',
    requestId: crypto.randomUUID(),
    provenance: baseline.provenance === 'openapi-fixture' || current.provenance === 'openapi-fixture' ? 'openapi-fixture' : 'sovv-internal-http',
    uncertainty: baseline.uncertainty === 'high' || current.uncertainty === 'high' ? 'high' : 'medium',
    data: {
      baseline: baseline.data,
      current: current.data,
      separation: ['Baseline tendency is enduring pattern language.', 'Current amplification is temporary context.', 'Observed behavior requires user confirmation.', 'Actual state is unknown unless the user confirms it.']
    }
  };
}

function normalizeBaselineStatus(status: unknown): BaselineSummary['status'] {
  if (status === 'ready' || status === 'pending' || status === 'failed' || status === 'degraded') return status;
  if (status === 'none' || status === undefined || status === null) return 'none';
  return 'degraded';
}

function developmentBaselineFixture(focus?: string): BaselineSummary {
  return {
    status: 'degraded',
    summary: 'Development fallback only: verified SOVV Baseline data is unavailable in this environment.',
    dimensions: [
      { name: focus || 'pressure response', tendency: 'Fixture: pressure may make urgency louder.', supportiveMove: 'Separate urgency from truth before acting.', sourceRefs: ['OPENAPI_DEVELOPMENT_FIXTURE'] }
    ],
    unknowns: ['Live SOVV Baseline contract is unavailable.'],
    sourceRefs: ['OPENAPI_DEVELOPMENT_FIXTURE']
  };
}

function developmentCurrentFixture(): CurrentConditions {
  return {
    status: 'degraded',
    headline: 'Development fallback only: current-condition context is unavailable, so no actual state is inferred.',
    amplifications: [{ name: 'uncertainty', effect: 'Keep current amplification separate from actual state.', certainty: 'low' }],
    unknowns: ['No verified standalone SOVV current-condition route is configured.'],
    sourceRefs: ['OPENAPI_DEVELOPMENT_FIXTURE']
  };
}
