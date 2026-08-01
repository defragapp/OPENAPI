import {
  EXPRESSION_AXIS_REGISTRY_VERSION,
  EXPRESSION_FIELD_VERSION,
  expressionAxisIds,
  type ExpressionAxisId,
  type ExpressionAxisValue,
  type ExpressionFieldBasisItem,
  type ExpressionFieldMode,
  type ExpressionFieldResponse
} from '@sovereign/agent-contracts';
import { getModelSafeBaselineContext } from './baseline';
import type { Env } from './env';
import { requireAuth } from './security/auth';

const labels: Record<ExpressionAxisId, string> = {
  clarity: 'Clarity',
  focus: 'Focus',
  steadiness: 'Steadiness',
  urgency: 'Urgency',
  courage: 'Courage',
  fear: 'Fear',
  anger: 'Anger',
  tenderness: 'Tenderness',
  grief: 'Grief',
  joy: 'Joy',
  desire: 'Desire',
  trust: 'Trust',
  patience: 'Patience',
  boundaries: 'Boundaries',
  responsibility: 'Responsibility',
  repair: 'Repair'
};

const axisFacetMap: Record<ExpressionAxisId, readonly string[]> = {
  clarity: ['decision_making', 'alignment_markers'],
  focus: ['learning', 'underused_capacity'],
  steadiness: ['core_orientation', 'response_change'],
  urgency: ['response_pressure', 'responsibility'],
  courage: ['leadership', 'gift_expression'],
  fear: ['shadow_expression', 'response_pressure'],
  anger: ['boundaries', 'conflict_repair'],
  tenderness: ['love_connection', 'gift_expression'],
  grief: ['love_connection', 'response_change'],
  joy: ['creativity_expression', 'gift_expression'],
  desire: ['identity_purpose', 'creativity_expression'],
  trust: ['love_connection', 'core_orientation'],
  patience: ['decision_making', 'response_change'],
  boundaries: ['boundaries'],
  responsibility: ['responsibility'],
  repair: ['conflict_repair']
};

export async function handleExpressionFieldRequest(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  const url = new URL(request.url);
  const requestedMode = parseMode(url.searchParams.get('mode'));
  const context = asRecord(await getModelSafeBaselineContext(env, auth.accountId));
  const baseline = asRecord(context.baseline);
  const reduced = asRecord(baseline.reducedContext);
  const profile = asRecord(reduced.facetProfile);
  const facets = asRecords(profile.facets);

  if (baseline.status !== 'completed') {
    return privateJson({
      error: 'baseline_required',
      message: 'Complete your Baseline before opening the Expression Field.',
      retryable: false
    }, 409);
  }

  if (facets.length === 0) {
    return privateJson(buildUnavailableResponse(requestedMode, 'building'), 200);
  }

  const current = asRecord(context.current);
  const currentReduced = asRecord(current.reduced);
  const currentReady = current.status === 'ready';
  const activeFacetIds = new Set(
    Array.isArray(currentReduced.affectedBaselineFacetIds)
      ? currentReduced.affectedBaselineFacetIds.filter((value): value is string => typeof value === 'string')
      : []
  );
  const contacts = asRecords(currentReduced.currentToNatalContacts);
  const baselineRegistry = asRecords(reduced.basisRegistry);
  const currentRegistry = currentReady ? asRecords(currentReduced.basisRegistry) : [];
  const registry = [...baselineRegistry, ...currentRegistry]
    .filter((item) => item.subject === 'self')
    .filter(isBasisItem);

  const axes = expressionAxisIds.map((id) => buildAxis({
    id,
    facets,
    activeFacetIds,
    contactCount: contacts.length,
    currentReady: requestedMode === 'live' && currentReady
  }));
  const usedBasis = new Set(axes.flatMap((axis) => axis.basisRefs));
  const basis = registry.filter((item) => usedBasis.has(item.id));
  const appliedMode: ExpressionFieldMode = requestedMode === 'live' && currentReady ? 'live' : 'baseline';

  const response: ExpressionFieldResponse = {
    version: EXPRESSION_FIELD_VERSION,
    registryVersion: EXPRESSION_AXIS_REGISTRY_VERSION,
    generatedAt: new Date().toISOString(),
    validUntil: appliedMode === 'live' && typeof currentReduced.expiresAt === 'string'
      ? currentReduced.expiresAt
      : null,
    mode: appliedMode,
    status: requestedMode === 'live' && !currentReady ? 'baseline_only' : 'ready',
    measurementKind: 'relative_expression_salience',
    axes,
    basis,
    limitations: [
      'Values show relative expression salience within your own field, not a psychological measurement or score.',
      'Current conditions may change emphasis, but they do not determine behavior or actual emotional state.',
      'Integrated or under-pressure expression remains unconfirmed until you provide or confirm lived context.'
    ]
  };

  return privateJson(response);
}

export function buildExpressionAxisValues(input: {
  facets: Record<string, unknown>[];
  activeFacetIds?: readonly string[];
  currentReady?: boolean;
  contactCount?: number;
}): ExpressionAxisValue[] {
  return expressionAxisIds.map((id) => buildAxis({
    id,
    facets: input.facets,
    activeFacetIds: new Set(input.activeFacetIds ?? []),
    currentReady: input.currentReady === true,
    contactCount: input.contactCount ?? 0
  }));
}

function buildAxis(input: {
  id: ExpressionAxisId;
  facets: Record<string, unknown>[];
  activeFacetIds: Set<string>;
  currentReady: boolean;
  contactCount: number;
}): ExpressionAxisValue {
  const allowedFacetIds = axisFacetMap[input.id];
  const mappedFacets = input.facets.filter((facet) => typeof facet.id === 'string' && allowedFacetIds.includes(facet.id));
  const basisRefs = unique(mappedFacets.flatMap((facet) => stringArray(facet.basisRefs)));
  const seedSource = mappedFacets.map((facet) => [
    facet.id,
    facet.uncertainty,
    stringArray(facet.basisRefs).sort()
  ]);
  const baselineValue = clamp(34 + (stableHash(`${input.id}:${JSON.stringify(seedSource)}`) % 31) + Math.min(6, basisRefs.length * 2), 28, 72);
  const active = mappedFacets.some((facet) => typeof facet.id === 'string' && input.activeFacetIds.has(facet.id));
  const currentDelta = input.currentReady && active
    ? clamp(6 + Math.min(12, input.contactCount * 2), 0, 18)
    : 0;
  const primary = mappedFacets[0];
  const title = typeof primary?.title === 'string' ? primary.title : labels[input.id];
  const description = typeof primary?.description === 'string'
    ? primary.description
    : `${labels[input.id]} is available as a Baseline expression to explore.`;

  return {
    id: input.id,
    label: labels[input.id],
    baselineValue,
    currentDelta,
    value: clamp(baselineValue + currentDelta, 0, 100),
    state: 'unconfirmed',
    confidence: mappedFacets.length > 0 && basisRefs.length > 0 ? 'supported' : 'exploratory',
    facetIds: mappedFacets.map((facet) => String(facet.id)),
    basisRefs,
    summary: description,
    ...(active && input.currentReady
      ? { activeNow: `${title} may be more salient for a limited time. Current context does not establish how you are expressing it.` }
      : {})
  };
}

function buildUnavailableResponse(mode: ExpressionFieldMode, status: 'building' | 'unavailable'): ExpressionFieldResponse {
  return {
    version: EXPRESSION_FIELD_VERSION,
    registryVersion: EXPRESSION_AXIS_REGISTRY_VERSION,
    generatedAt: new Date().toISOString(),
    validUntil: null,
    mode: 'baseline',
    status,
    measurementKind: 'relative_expression_salience',
    axes: [],
    basis: [],
    limitations: [mode === 'live'
      ? 'The Expression Field will become available after your Baseline facets are ready; current context was not guessed.'
      : 'The Expression Field will become available after your Baseline facets are ready.']
  };
}

function parseMode(value: string | null): ExpressionFieldMode {
  return value === 'baseline' ? 'baseline' : 'live';
}

function privateJson(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      'cache-control': 'private, no-store',
      'content-type': 'application/json; charset=utf-8',
      vary: 'Cookie'
    }
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function asRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function isBasisItem(value: Record<string, unknown>): value is Record<string, unknown> & ExpressionFieldBasisItem {
  return typeof value.id === 'string'
    && typeof value.category === 'string'
    && typeof value.display === 'string'
    && typeof value.accessibleLabel === 'string'
    && typeof value.computedAt === 'string'
    && (value.uncertainty === 'low' || value.uncertainty === 'medium' || value.uncertainty === 'high')
    && typeof value.provenance === 'string'
    && value.subject === 'self';
}
