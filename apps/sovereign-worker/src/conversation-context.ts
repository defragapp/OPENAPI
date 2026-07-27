import type { Env } from './env';
import { buildPairComparison, buildSystemAnalysis } from './relational-context';
import { requireFeature, type EntitlementSet } from './db/entitlements';

export interface ConversationContextSelection {
  surface?: string;
  personId?: string;
  systemId?: string;
}

const identifier = /^[A-Za-z0-9_-]{1,128}$/;

export function parseConversationContext(value: unknown): ConversationContextSelection {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Response('Invalid conversation context', { status: 400 });
  const input = value as Record<string, unknown>;
  const surface = typeof input.surface === 'string' ? input.surface.slice(0, 32) : undefined;
  const personId = parseIdentifier(input.personId, 'personId');
  const systemId = parseIdentifier(input.systemId, 'systemId');
  if (personId && systemId) throw new Response('Choose either a person or a system for this turn', { status: 400 });
  return {
    ...(surface ? { surface } : {}),
    ...(personId ? { personId } : {}),
    ...(systemId ? { systemId } : {})
  };
}

export async function authorizeConversationContext(
  env: Env,
  accountId: string,
  selection: ConversationContextSelection,
  entitlements: EntitlementSet
): Promise<unknown | undefined> {
  requireConversationContextEntitlement(selection, entitlements);
  if (selection.personId) return projectModelSafeConversationContext(await buildPairComparison(env, accountId, selection.personId));
  if (selection.systemId) {
    return projectModelSafeConversationContext(await buildSystemAnalysis(env, accountId, selection.systemId));
  }
  return undefined;
}

export function requireConversationContextEntitlement(selection: ConversationContextSelection, entitlements: EntitlementSet): void {
  if (selection.personId) requireFeature(entitlements, 'people.compare');
  if (selection.systemId && !entitlements.features.includes('systems.family') && !entitlements.features.includes('systems.team')) {
    requireFeature(entitlements, 'systems.family');
  }
}

export function projectModelSafeConversationContext(value: unknown): unknown {
  return project(value);
}

function project(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => project(item));
  if (!value || typeof value !== 'object') return value;
  const output: Record<string, unknown> = {};
  for (const [childKey, childValue] of Object.entries(value as Record<string, unknown>)) {
    if (isPrivateIdentifierKey(childKey)) continue;
    if (childKey === 'label') {
      output.label = childValue === 'You' ? 'You' : 'Other person';
      continue;
    }
    if (childKey === 'from' || childKey === 'to') {
      output[childKey] = childValue === 'You' ? 'You' : 'Other person';
      continue;
    }
    output[childKey] = project(childValue);
  }
  return output;
}

function isPrivateIdentifierKey(key: string): boolean {
  return /(?:^|_)(?:id|account|subject|email|token|trace)(?:$|_)/i.test(key)
    || /(?:Id|Account|Subject|Email|Token|Trace)$/i.test(key)
    || key === 'name'
    || key === 'displayName'
    || key === 'consentCheckedAt'
    || key === 'lastComputedAt';
}

function parseIdentifier(value: unknown, field: string): string | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || !identifier.test(value)) throw new Response(`Invalid ${field}`, { status: 400 });
  return value;
}
