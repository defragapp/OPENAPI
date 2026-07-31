import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import './baseline-compiler-bridge.css';

type Json = Record<string, unknown>;

type PlaceCandidate = {
  resolutionId: string;
  displayName: string;
  timezone: string;
  confidence: 'low' | 'medium' | 'high';
  attribution: 'GeoNames';
  confirmed: false;
};

type PendingChoice = {
  candidates: PlaceCandidate[];
  resolve: (candidate: PlaceCandidate | null) => void;
};

type LegacyBaselineSubmission = {
  birthDate: string;
  birthplace: string;
  birthTimeCertainty: 'exact' | 'approximate' | 'unknown';
  birthTime?: string;
  fullBirthName?: string;
  preferredName?: string;
};

const BASELINE_ONBOARDING_PATH = '/api/v1/baseline/onboarding';
const TERMINAL_STATUSES = new Set(['ready', 'degraded', 'validation_failed', 'cancelled']);

export function BaselineCompilerBridge({ children }: { children: ReactNode }) {
  const [pendingChoice, setPendingChoice] = useState<PendingChoice | null>(null);
  const chooser = useRef<(candidates: PlaceCandidate[]) => Promise<PlaceCandidate | null>>(async () => null);

  chooser.current = (candidates) => new Promise((resolve) => {
    setPendingChoice({ candidates, resolve });
  });

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const bridgedFetch: typeof window.fetch = async (input, init) => {
      if (!isLegacyBaselineRequest(input, init)) return originalFetch(input, init);
      return submitThroughCompilerBridge(originalFetch, input, init, (candidates) => chooser.current(candidates));
    };
    window.fetch = bridgedFetch;
    return () => {
      window.fetch = originalFetch;
      setPendingChoice((current) => {
        current?.resolve(null);
        return null;
      });
    };
  }, []);

  function finishChoice(candidate: PlaceCandidate | null) {
    setPendingChoice((current) => {
      current?.resolve(candidate);
      return null;
    });
  }

  return (
    <>
      {children}
      {pendingChoice && (
        <div className="baseline-place-confirmation" role="dialog" aria-modal="true" aria-labelledby="baseline-place-confirmation-title">
          <button className="baseline-place-backdrop" aria-label="Cancel birthplace confirmation" onClick={() => finishChoice(null)} />
          <section>
            <header>
              <p>Confirm the source</p>
              <h2 id="baseline-place-confirmation-title">Which birthplace is correct?</h2>
              <span>Sovereign resolved these city-level matches on the server. Your device timezone was not used.</span>
            </header>
            <div className="baseline-place-options">
              {pendingChoice.candidates.map((candidate) => (
                <button key={candidate.resolutionId} onClick={() => finishChoice(candidate)}>
                  <strong>{candidate.displayName}</strong>
                  <span>{friendlyTimezone(candidate.timezone)}</span>
                  <small>{confidenceLabel(candidate.confidence)}</small>
                </button>
              ))}
            </div>
            <footer>
              <small>Place and timezone resolution: GeoNames. Exact coordinates remain encrypted and are not shown to the model.</small>
              <button onClick={() => finishChoice(null)}>Go back</button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

async function submitThroughCompilerBridge(
  originalFetch: typeof fetch,
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  chooseCandidate: (candidates: PlaceCandidate[]) => Promise<PlaceCandidate | null>
): Promise<Response> {
  try {
    const legacy = parseLegacySubmission(init?.body);
    const birthplace = parseBirthplace(legacy.birthplace);
    const resolutionResponse = await originalFetch('/api/v1/baseline/place/resolve', jsonInit({
      city: birthplace.city,
      region: birthplace.region,
      country: birthplace.country
    }));
    const resolutionBody = await readJson(resolutionResponse);
    if (!resolutionResponse.ok) return cloneJsonResponse(resolutionBody, resolutionResponse.status, resolutionResponse.headers);

    const candidates = Array.isArray(resolutionBody.candidates)
      ? resolutionBody.candidates.filter(isPlaceCandidate)
      : [];
    if (!candidates.length) {
      return problemResponse(422, 'baseline_place_not_found', 'That birthplace could not be resolved. Enter city, region, and country more precisely.');
    }

    const selected = await chooseCandidate(candidates);
    if (!selected) {
      return problemResponse(409, 'baseline_place_confirmation_cancelled', 'Confirm the exact birthplace before the Baseline is calculated.');
    }

    const confirmation = await originalFetch(
      `/api/v1/baseline/place/${encodeURIComponent(selected.resolutionId)}/confirm`,
      jsonInit({})
    );
    const confirmationBody = await readJson(confirmation);
    if (!confirmation.ok) return cloneJsonResponse(confirmationBody, confirmation.status, confirmation.headers);

    const canonicalBody = {
      ...(legacy.fullBirthName ? { fullBirthName: legacy.fullBirthName } : {}),
      ...(legacy.preferredName ? { preferredName: legacy.preferredName } : {}),
      birthDate: legacy.birthDate,
      birthTimeCertainty: legacy.birthTimeCertainty,
      ...(legacy.birthTime ? { birthTime: legacy.birthTime } : {}),
      birthplace,
      placeResolutionId: selected.resolutionId
    };
    const compilerResponse = await originalFetch(input, {
      ...init,
      headers: mergeJsonHeaders(init?.headers),
      body: JSON.stringify(canonicalBody)
    });
    const compilerBody = await readJson(compilerResponse);
    if (!compilerResponse.ok) return cloneJsonResponse(compilerBody, compilerResponse.status, compilerResponse.headers);

    const runId = asRecord(compilerBody.baseline).runId;
    if (typeof runId !== 'string') {
      return problemResponse(502, 'baseline_compiler_run_missing', 'The Baseline compiler did not return a valid run.');
    }
    return await waitForCompiledBaseline(originalFetch, runId);
  } catch (error) {
    if (error instanceof Response) return error;
    return problemResponse(
      400,
      'baseline_source_invalid',
      error instanceof Error ? error.message : 'The Baseline source details were incomplete or invalid.'
    );
  }
}

async function waitForCompiledBaseline(originalFetch: typeof fetch, runId: string): Promise<Response> {
  for (let attempt = 0; attempt < 14; attempt += 1) {
    const statusResponse = await originalFetch('/api/v1/baseline/status', {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { accept: 'application/json' }
    });
    const statusBody = await readJson(statusResponse);
    if (!statusResponse.ok) return cloneJsonResponse(statusBody, statusResponse.status, statusResponse.headers);
    const baselineStatus = asRecord(statusBody.baseline);
    if (baselineStatus.runId === runId && TERMINAL_STATUSES.has(String(baselineStatus.status))) {
      if (baselineStatus.status === 'validation_failed' || baselineStatus.status === 'cancelled') {
        return problemResponse(
          422,
          'baseline_compilation_failed',
          'The Baseline could not be validated. Nothing was saved as a complete technical result.'
        );
      }
      const todayResponse = await originalFetch('/api/v1/today', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { accept: 'application/json' }
      });
      const todayBody = await readJson(todayResponse);
      if (!todayResponse.ok) return cloneJsonResponse(todayBody, todayResponse.status, todayResponse.headers);
      const baseline = asRecord(asRecord(todayBody.today).baseline);
      if (!baseline.reducedContext) {
        return problemResponse(502, 'baseline_compiler_output_missing', 'The Baseline run finished without a usable validated result.');
      }
      return Response.json({ baseline }, {
        status: 200,
        headers: { 'cache-control': 'private, no-store' }
      });
    }

    await originalFetch('/api/v1/jobs/run', jsonInit({})).catch(() => undefined);
    await delay(Math.min(250 + attempt * 75, 900));
  }

  return problemResponse(
    503,
    'baseline_compilation_pending',
    'Your Baseline is still compiling. Return to Today shortly; no incomplete result was shown as ready.'
  );
}

function isLegacyBaselineRequest(input: RequestInfo | URL, init?: RequestInit): boolean {
  if ((init?.method ?? 'GET').toUpperCase() !== 'POST' || typeof init?.body !== 'string') return false;
  const url = requestUrl(input);
  if (!url || url.pathname !== BASELINE_ONBOARDING_PATH) return false;
  try {
    const body = JSON.parse(init.body) as Json;
    return typeof body.birthplace === 'string' && typeof body.placeResolutionId !== 'string';
  } catch {
    return false;
  }
}

function parseLegacySubmission(body: BodyInit | null | undefined): LegacyBaselineSubmission {
  if (typeof body !== 'string') throw new Error('The Baseline source request was invalid.');
  const value = asRecord(JSON.parse(body) as unknown);
  const birthDate = typeof value.birthDate === 'string' ? value.birthDate.trim() : '';
  const birthplace = typeof value.birthplace === 'string' ? value.birthplace.trim() : '';
  const certainty = value.birthTimeCertainty;
  const birthTime = typeof value.birthTime === 'string' ? value.birthTime.trim() : undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error('Add a valid birth date.');
  if (!['exact', 'approximate', 'unknown'].includes(String(certainty))) throw new Error('Choose how certain the birth time is.');
  if ((certainty === 'exact' || certainty === 'approximate') && !/^([01]\d|2[0-3]):[0-5]\d$/.test(birthTime ?? '')) {
    throw new Error('Add the exact or approximate birth time, or choose Unknown.');
  }
  return {
    birthDate,
    birthplace,
    birthTimeCertainty: certainty as LegacyBaselineSubmission['birthTimeCertainty'],
    ...(birthTime ? { birthTime } : {}),
    ...(typeof value.fullBirthName === 'string' && value.fullBirthName.trim() ? { fullBirthName: value.fullBirthName.trim() } : {}),
    ...(typeof value.preferredName === 'string' && value.preferredName.trim() ? { preferredName: value.preferredName.trim() } : {})
  };
}

export function parseBirthplace(value: string): { city: string; region: string; country: string } {
  const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) throw new Error('Enter the birthplace as city, region, and country.');
  return {
    city: parts[0]!,
    region: parts.slice(1, -1).join(', '),
    country: parts[parts.length - 1]!
  };
}

function jsonInit(body: unknown): RequestInit {
  return {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-idempotency-key': crypto.randomUUID()
    },
    body: JSON.stringify(body)
  };
}

function mergeJsonHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  result.set('accept', 'application/json');
  result.set('content-type', 'application/json');
  result.set('x-idempotency-key', crypto.randomUUID());
  return result;
}

function requestUrl(input: RequestInfo | URL): URL | null {
  try {
    if (input instanceof Request) return new URL(input.url);
    return new URL(String(input), location.origin);
  } catch {
    return null;
  }
}

async function readJson(response: Response): Promise<Json> {
  return response.headers.get('content-type')?.includes('application/json')
    ? asRecord(await response.json().catch(() => ({})))
    : {};
}

function cloneJsonResponse(body: Json, status: number, sourceHeaders: Headers): Response {
  const headers = new Headers(sourceHeaders);
  headers.delete('content-length');
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'private, no-store');
  return Response.json(body, { status, headers });
}

function problemResponse(status: number, error: string, message: string): Response {
  return Response.json({ error, message }, {
    status,
    headers: { 'cache-control': 'private, no-store' }
  });
}

function isPlaceCandidate(value: unknown): value is PlaceCandidate {
  const candidate = asRecord(value);
  return typeof candidate.resolutionId === 'string'
    && typeof candidate.displayName === 'string'
    && typeof candidate.timezone === 'string'
    && ['low', 'medium', 'high'].includes(String(candidate.confidence));
}

function asRecord(value: unknown): Json {
  return value && typeof value === 'object' ? value as Json : {};
}

function friendlyTimezone(value: string): string {
  return value.replaceAll('_', ' ').replace('/', ' · ');
}

function confidenceLabel(value: PlaceCandidate['confidence']): string {
  return value === 'high' ? 'Strong city match' : value === 'medium' ? 'Review this match' : 'Low-confidence match';
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
