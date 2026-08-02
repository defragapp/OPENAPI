import {
  EXPRESSION_AXIS_REGISTRY_VERSION,
  EXPRESSION_FIELD_VERSION,
  assertExpressionFieldResponse,
  expressionAxisIds,
  expressionAxisRegistryById,
  type ExpressionAxisId,
  type ExpressionAxisValue,
  type ExpressionFieldBasisItem,
  type ExpressionFieldMode,
  type ExpressionFieldResponse
} from '@sovereign/agent-contracts';
import { getModelSafeBaselineContext } from './baseline';
import type { Env } from './env';
import { requireAuth } from './security/auth';

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
  const authResult = await authenticateExpressionFieldRequest(request, env);
  if (authResult instanceof Response) return authResult;
  const auth = authResult;

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
    return validatedPrivateJson(buildUnavailableResponse(requestedMode, 'building'));
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
      'Values show relative expression salience within your own field, not a diagnosis, personality score, or exact measurement of emotion.',
      'Current conditions may change which expressions are more visible, but they do not determine identity, behavior, or another person’s internal state.',
      'Gift, protective or shadow, repressed, and overextended expressions are possibilities for reflection until you confirm how the quality is actually operating.'
    ]
  };

  return validatedPrivateJson(response);
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

async function authenticateExpressionFieldRequest(
  request: Request,
  env: Env
): Promise<Awaited<ReturnType<typeof requireAuth>> | Response> {
  try {
    const auth = await requireAuth(request, env);
    return auth;
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

function buildAxis(input: {
  id: ExpressionAxisId;
  facets: Record<string, unknown>[];
  activeFacetIds: Set<string>;
  currentReady: boolean;
  contactCount: number;
}): ExpressionAxisValue {
  const registryEntry = expressionAxisRegistryById[input.id];
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
  const title = typeof primary?.title === 'string' ? primary.title : registryEntry.label;
  const description = firstText(mappedFacets, 'description')
    ?? `${registryEntry.label} is one expression within your Baseline that Sovereign can help you examine in ordinary language.`;
  const giftExpression = firstText(mappedFacets, 'giftExpression');
  const shadowExpression = firstText(mappedFacets, 'shadowExpression');
  const practicalDistinction = firstStringFromArray(mappedFacets, 'alignmentMarkers');

  return {
    id: input.id,
    label: registryEntry.label,
    baselineValue,
    currentDelta,
    value: clamp(baselineValue + currentDelta, 0, 100),
    state: 'unconfirmed',
    confidence: mappedFacets.length > 0 && basisRefs.length > 0 ? 'supported' : 'exploratory',
    facetIds: mappedFacets.map((facet) => String(facet.id)),
    basisRefs,
    summary: description,
    ...(giftExpression ? { giftExpression } : {}),
    ...(shadowExpression ? {
      shadowExpression,
      repressedExpression: `When held back, ${lowerFirst(shadowExpression)}`,
      overextendedExpression: `When overused, ${lowerFirst(shadowExpression)}`
    } : {}),
    ...(practicalDistinction ? { practicalDistinction } : {}),
    ...(active && input.currentReady
      ? {
          activeNow: `${title} may be more visible for a limited time. That added emphasis does not establish how you are expressing it.`,
          contextDomain: 'current_context' as const
        }
      : { contextDomain: registryEntry.domain })
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

function validatedPrivateJson(response: ExpressionFieldResponse): Response {
  try {
    assertExpressionFieldResponse(response);
    return privateJson(response);
  } catch (error) {
    console.error('expression_field_validation_failed', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown validation failure'
    });
    return privateJson({
      version: EXPRESSION_FIELD_VERSION,
      registryVersion: EXPRESSION_AXIS_REGISTRY_VERSION,
      status: 'unavailable',
      reason: 'invalid_payload',
      message: 'The Expression Field is temporarily unavailable.'
    }, 503);
  }
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

function firstText(facets: Record<string, unknown>[], key: string): string | undefined {
  for (const facet of facets) {
    const value = facet[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function firstStringFromArray(facets: Record<string, unknown>[], key: string): string | undefined {
  for (const facet of facets) {
    const value = facet[key];
    if (!Array.isArray(value)) continue;
    const found = value.find((item): item is string => typeof item === 'string' && item.trim().length > 0);
    if (found) return found.trim();
  }
  return undefined;
}

function lowerFirst(value: string): string {
  return value.length > 0 ? value[0]!.toLowerCase() + value.slice(1) : value;
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
