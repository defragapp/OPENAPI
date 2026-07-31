type Json = Record<string, unknown>;

const TODAY_PATH = '/api/v1/today';
const DATASET_KEY = 'baselineCompleteness';

export function installBaselineSupportedRuntime() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    if (!isTodayRequest(input, init) || !response.headers.get('content-type')?.includes('application/json')) {
      return response;
    }

    const body = asRecord(await response.clone().json().catch(() => ({})));
    const normalized = normalizeTodayForWorkspace(body);
    if (!normalized.supportedReduced) {
      delete document.documentElement.dataset[DATASET_KEY];
      return response;
    }

    document.documentElement.dataset[DATASET_KEY] = 'supported-reduced';
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('content-type', 'application/json; charset=utf-8');
    headers.set('cache-control', 'private, no-store');
    return Response.json(normalized.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
}

export function normalizeTodayForWorkspace(body: Json): { body: Json; supportedReduced: boolean } {
  const today = asRecord(body.today);
  const baseline = asRecord(today.baseline);
  const reduced = asRecord(baseline.reducedContext);
  const facetProfile = asRecord(reduced.facetProfile);
  const facets = Array.isArray(facetProfile.facets) ? facetProfile.facets : [];
  const compiler = asRecord(reduced.compiler);
  const supportedReduced = baseline.status === 'degraded'
    && facets.length > 0
    && compiler.fullCompilerReady === false;

  if (!supportedReduced) return { body, supportedReduced: false };

  return {
    supportedReduced: true,
    body: {
      ...body,
      today: {
        ...today,
        baseline: {
          ...baseline,
          // Existing workspace code recognizes only "completed" as usable.
          // This value exists only in the browser response clone. D1 and the
          // server API remain "degraded" with fullCompilerReady=false.
          status: 'completed',
          serverStatus: 'degraded',
          workspaceStatus: 'usable_supported_reduced'
        }
      }
    }
  };
}

function isTodayRequest(input: RequestInfo | URL, init?: RequestInit): boolean {
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (method !== 'GET') return false;
  try {
    const url = input instanceof Request ? new URL(input.url) : new URL(String(input), location.origin);
    return url.pathname === TODAY_PATH;
  } catch {
    return false;
  }
}

function asRecord(value: unknown): Json {
  return value && typeof value === 'object' ? value as Json : {};
}
