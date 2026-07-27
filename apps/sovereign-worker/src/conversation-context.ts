import type { Env } from './env';
import { buildPairComparison, buildSystemAnalysis } from './relational-context';
import { getEntitlements, requireFeature } from './db/entitlements';

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

export async function authorizeConversationContext(env: Env, accountId: string, selection: ConversationContextSelection): Promise<unknown | undefined> {
  if (selection.personId) return buildPairComparison(env, accountId, selection.personId);
  if (selection.systemId) {
    const entitlements = await getEntitlements(env, accountId);
    if (!entitlements.features.includes('systems.family') && !entitlements.features.includes('systems.team')) requireFeature(entitlements, 'systems.family');
    return buildSystemAnalysis(env, accountId, selection.systemId);
  }
  return undefined;
}

function parseIdentifier(value: unknown, field: string): string | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value !== 'string' || !identifier.test(value)) throw new Response(`Invalid ${field}`, { status: 400 });
  return value;
}
