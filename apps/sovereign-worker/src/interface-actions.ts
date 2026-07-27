import { z } from 'zod';
import type { EntitlementSet } from './db/entitlements';

const identifier = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
export const interfaceActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('open_baseline'), args: z.object({ facet: z.enum(['overview', 'decision', 'communication', 'pressure', 'shadow_light']).default('overview') }) }),
  z.object({ type: z.literal('open_person'), args: z.object({ personId: identifier }) }),
  z.object({ type: z.literal('open_system'), args: z.object({ systemId: identifier }) }),
  z.object({ type: z.literal('open_decision'), args: z.object({}) }),
  z.object({ type: z.literal('open_optional_lens'), args: z.object({ lens: z.literal('covenant') }) }),
  z.object({ type: z.literal('show_plan'), args: z.object({ feature: z.enum(['people', 'systems', 'library', 'covenant']) }) })
]);
export type InterfaceAction = z.infer<typeof interfaceActionSchema>;

export interface InterfaceActionEnvelope {
  version: 1;
  primary: InterfaceAction | null;
  suggestions: InterfaceAction[];
  confirmationRequired: true;
}

export function buildInterfaceActions(input: string, context: { personId?: string; systemId?: string }, entitlements: EntitlementSet): InterfaceActionEnvelope {
  const actions: InterfaceAction[] = [];
  if (/\b(?:baseline|design|trait|shadow|light)\b/i.test(input)) actions.push({ type: 'open_baseline', args: { facet: /decision|choice|align/i.test(input) ? 'decision' : 'overview' } });
  if (/\b(?:decision|choice|align(?:ed|ment)?)\b/i.test(input)) actions.push({ type: 'open_decision', args: {} });
  if (context.personId && /\b(?:person|relationship|partner|mother|father|they|them)\b/i.test(input)) {
    actions.push(entitlements.features.includes('people.compare')
      ? { type: 'open_person', args: { personId: context.personId } }
      : { type: 'show_plan', args: { feature: 'people' } });
  }
  if (context.systemId && /\b(?:family|group|team|system|household)\b/i.test(input)) {
    actions.push(entitlements.features.some((feature) => feature === 'systems.family' || feature === 'systems.team')
      ? { type: 'open_system', args: { systemId: context.systemId } }
      : { type: 'show_plan', args: { feature: 'systems' } });
  }
  if (/\b(?:Christian|biblical|Scripture|Covenant)\b/i.test(input)) actions.push(entitlements.features.includes('covenant.lens')
    ? { type: 'open_optional_lens', args: { lens: 'covenant' } }
    : { type: 'show_plan', args: { feature: 'covenant' } });
  const validated = actions.flatMap((action) => {
    const parsed = interfaceActionSchema.safeParse(action);
    return parsed.success ? [parsed.data] : [];
  }).slice(0, 3);
  return { version: 1, primary: validated[0] ?? null, suggestions: validated.slice(1), confirmationRequired: true };
}

export function parseInterfaceAction(value: unknown): InterfaceAction | null {
  const parsed = interfaceActionSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
