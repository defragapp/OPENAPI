import { z } from 'zod';
import type { EntitlementSet } from './db/entitlements';

const identifier = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
export const interfaceActionSchema = z.object({
  type: z.enum([
    'explore_facet',
    'examine_alignment',
    'open_person',
    'invite_person',
    'open_system',
    'save_to_library',
    'offer_covenant',
    'show_plan'
  ]),
  label: z.string().min(2).max(100),
  target_id: identifier.optional(),
  feature: z.enum(['people', 'systems', 'library', 'covenant']).optional()
}).superRefine((value, context) => {
  if (['open_person', 'open_system'].includes(value.type) && !value.target_id) {
    context.addIssue({ code: 'custom', message: `${value.type} requires target_id` });
  }
  if (value.type === 'show_plan' && !value.feature) {
    context.addIssue({ code: 'custom', message: 'show_plan requires feature' });
  }
});

export type InterfaceAction = z.infer<typeof interfaceActionSchema>;

export interface InterfaceActionEnvelope {
  version: 2;
  primary: InterfaceAction | null;
  contextual: InterfaceAction[];
  confirmationRequired: true;
}

const covenantFamilySignals = /\b(?:family|parent|mother|father|sibling|brother|sister|favoritism|rivalry|scapegoat|exile|generational|carrying a role)\b/i;
const covenantRelationalSignals = /\b(?:betrayal|return|responsibility|blame|forgiv|reconcil|boundary|accountability|caregiv|pride|humility|truth|compassion|peacekeep|peacemak)\b/i;
const relationalFrameSignals = /\b(?:relationship|partner|spouse|marriage|friend|family|household|team|group|parent|sibling)\b/i;

export function buildInterfaceActions(
  input: string,
  context: { personId?: string; systemId?: string },
  entitlements: EntitlementSet
): InterfaceActionEnvelope {
  const actions: InterfaceAction[] = [];
  if (/\b(?:baseline|design|quality|capacity|shadow|gift|communication|learning|love|leadership|boundary|pressure|change)\b/i.test(input)) {
    actions.push({ type: 'explore_facet', label: 'Explore the relevant Baseline facet' });
  }
  if (/\b(?:decision|choice|fit|align(?:ed|ment)?|tradeoff)\b/i.test(input)) {
    actions.push({ type: 'examine_alignment', label: 'Examine the fit' });
  }
  if (context.personId) {
    actions.push(entitlements.features.includes('people.compare')
      ? { type: 'open_person', label: 'Open this relationship', target_id: context.personId }
      : { type: 'show_plan', label: 'Compare permitted Baselines with Sovereign+', feature: 'people' });
  } else if (/\b(?:relationship|partner|another person|both of us)\b/i.test(input)) {
    actions.push(entitlements.features.includes('people.compare')
      ? { type: 'invite_person', label: 'Invite someone privately' }
      : { type: 'show_plan', label: 'Invite and compare with Sovereign+', feature: 'people' });
  }
  if (context.systemId) {
    actions.push(entitlements.features.some((feature) => feature === 'systems.family' || feature === 'systems.team')
      ? { type: 'open_system', label: 'Open this system', target_id: context.systemId }
      : { type: 'show_plan', label: 'Explore systems with Sovereign+', feature: 'systems' });
  }
  const covenantRelevant = Boolean(context.systemId)
    || covenantFamilySignals.test(input)
    || (Boolean(context.personId) || relationalFrameSignals.test(input)) && covenantRelationalSignals.test(input);
  if (covenantRelevant) {
    actions.push(entitlements.features.includes('covenant.lens')
      ? { type: 'offer_covenant', label: 'Explore through Covenant' }
      : { type: 'show_plan', label: 'Explore Covenant with Sovereign+', feature: 'covenant' });
  }
  actions.push(entitlements.features.includes('library.continuity')
    ? { type: 'save_to_library', label: 'Save to Library' }
    : { type: 'show_plan', label: 'Keep useful understandings with Sovereign+', feature: 'library' });

  const validated = actions.flatMap((action) => {
    const parsed = interfaceActionSchema.safeParse(action);
    return parsed.success ? [parsed.data] : [];
  });
  const primary = validated.find((action) => !['save_to_library', 'offer_covenant'].includes(action.type)) ?? null;
  return {
    version: 2,
    primary,
    contextual: validated.filter((action) => action !== primary).slice(0, 4),
    confirmationRequired: true
  };
}

export function parseInterfaceAction(value: unknown): InterfaceAction | null {
  const parsed = interfaceActionSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
