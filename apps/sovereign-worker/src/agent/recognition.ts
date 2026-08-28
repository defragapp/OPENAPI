import { z } from 'zod';
import type { BasisRegistryItem } from '../baseline-contracts';

export const sovereignAnswerModes = [
  'baseline',
  'now',
  'shadow_gift',
  'alignment',
  'relationship',
  'system',
  'covenant'
] as const;

export const sovereignSectionIds = [
  'steady',
  'active_now',
  'shadow',
  'gift',
  'alignment',
  'you',
  'other',
  'interaction',
  'system',
  'responsibility',
  'unknowns',
  'experiment'
] as const;

export const sovereignActionTypes = [
  'explore_facet',
  'examine_alignment',
  'open_person',
  'invite_person',
  'open_system',
  'save_to_library',
  'offer_covenant'
] as const;

export const sovereignAnswerSchema = z.object({
  version: z.literal('sovereign-answer.v2'),
  mode: z.enum(sovereignAnswerModes),
  depth: z.enum(['focused', 'standard', 'deep']),
  headline: z.string().min(3).max(180),
  direct_answer: z.string().min(30).max(2_000),
  sections: z.array(z.object({
    id: z.enum(sovereignSectionIds),
    label: z.string().min(2).max(80),
    body: z.string().min(15).max(1_600)
  }).strict()).min(1).max(7),
  basis_refs: z.array(z.string().min(1)).max(12),
  correction_prompt: z.string().min(3).max(180),
  actions: z.array(z.object({
    type: z.enum(sovereignActionTypes),
    label: z.string().min(2).max(100),
    target_id: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/).optional()
  }).strict()).max(5),
  confidence: z.enum(['confirmed', 'supported', 'exploratory']),
  safety_mode: z.enum(['standard', 'grounded', 'escalate'])
}).strict();

export type SovereignAnswerV2 = z.infer<typeof sovereignAnswerSchema>;
export type SovereignAnswerAction = SovereignAnswerV2['actions'][number];

const basisRegistryItemSchema = z.object({
  id: z.string().min(1),
  category: z.enum(['user_confirmation', 'human_design', 'gene_keys', 'numerology', 'natal', 'aspect', 'live', 'relationship']),
  display: z.string().min(1).max(120),
  accessibleLabel: z.string().min(1).max(260),
  computedAt: z.string().min(1),
  expiresAt: z.string().min(1).optional(),
  uncertainty: z.enum(['low', 'medium', 'high']),
  provenance: z.string().min(1).max(240),
  subject: z.enum(['self', 'other', 'relationship'])
}).strict();

export interface SovereignAnswerEnvelope {
  answer: SovereignAnswerV2;
  basis: BasisRegistryItem[];
}

export function deriveAuthorizedBasisRegistry(context: unknown): BasisRegistryItem[] {
  const output = new Map<string, BasisRegistryItem>();
  visit(context, output);
  return [...output.values()].slice(0, 80);
}

function visit(value: unknown, output: Map<string, BasisRegistryItem>): void {
  if (Array.isArray(value)) {
    for (const item of value) visit(item, output);
    return;
  }
  if (!value || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  if (Array.isArray(record.basisRegistry)) {
    for (const raw of record.basisRegistry) {
      const parsed = basisRegistryItemSchema.safeParse(raw);
      if (parsed.success && !isProhibitedBasisDisplay(parsed.data.display)) {
        const item = parsed.data;
        output.set(item.id, {
          id: item.id,
          category: item.category,
          display: item.display,
          accessibleLabel: item.accessibleLabel,
          computedAt: item.computedAt,
          ...(item.expiresAt ? { expiresAt: item.expiresAt } : {}),
          uncertainty: item.uncertainty,
          provenance: item.provenance,
          subject: item.subject
        });
      }
    }
  }
  for (const child of Object.values(record)) visit(child, output);
}

function isProhibitedBasisDisplay(value: string): boolean {
  return /\b(?:status|withheld|unavailable|provider|internal|fixture-only|json|object)\b/i.test(value)
    || /[{}\[\]"]/g.test(value);
}

export function parseSovereignAnswer(raw: string, registry: BasisRegistryItem[]): SovereignAnswerV2 {
  const parsed = sovereignAnswerSchema.parse(JSON.parse(extractJson(raw)));
  const allowed = new Set(registry.map((item) => item.id));
  if (parsed.basis_refs.some((id) => !allowed.has(id))) {
    throw new Error('Sovereign answer selected an invented or unauthorized Basis reference');
  }
  if (parsed.depth === 'focused' && parsed.sections.length > 3) {
    throw new Error('Focused Sovereign answers may contain at most three sections');
  }
  if (parsed.depth !== 'focused' && parsed.sections.length < 2) {
    throw new Error('Standard and deep Sovereign answers require at least two useful sections');
  }
  if (parsed.depth !== 'focused' && parsed.sections.length > 5) {
    throw new Error('Standard and deep Sovereign answers may contain at most five sections');
  }
  if (parsed.mode === 'relationship') {
    if (parsed.depth !== 'deep') throw new Error('Relationship answers require deep depth');
    requireSectionIds(parsed, ['you', 'other', 'interaction', 'responsibility', 'unknowns']);
  }
  if (parsed.mode === 'system') {
    if (parsed.depth !== 'deep') throw new Error('System answers require deep depth');
    requireSectionIds(parsed, ['system', 'responsibility', 'unknowns']);
  }
  if (parsed.mode === 'shadow_gift') {
    requireSectionIds(parsed, ['shadow', 'gift']);
  }
  if (parsed.mode === 'alignment') {
    const labels = new Set(parsed.sections.map((section) => section.label.toLowerCase()));
    for (const required of ['supports the fit', 'pulls against it', 'the real tradeoff', 'still needed', 'a closer version']) {
      if (![...labels].some((label) => label.includes(required))) {
        throw new Error(`Alignment answer is missing ${required}`);
      }
    }
  }
  if (parsed.mode === 'covenant') {
    const labels = new Set(parsed.sections.map((section) => section.label.toLowerCase()));
    for (const required of ['biblical parallel', 'scripture', 'teaching', 'application', 'boundary']) {
      if (![...labels].some((label) => label.includes(required))) {
        throw new Error(`Covenant answer is missing ${required}`);
      }
    }
  }
  validatePatternLensCoherence(parsed);
  return trimAnswer(parsed);
}

function validatePatternLensCoherence(answer: SovereignAnswerV2): void {
  const ids = new Set(answer.sections.map((section) => section.id));
  const includesExpression = ids.has('shadow') || ids.has('gift') || ids.has('active_now');
  const includesInteraction = ids.has('interaction') || ids.has('system');
  if (!includesExpression || !includesInteraction) return;

  for (const id of ['steady', 'responsibility', 'unknowns'] as const) {
    if (!ids.has(id)) {
      throw new Error(`A pattern answer that connects expression and interaction is missing ${id}`);
    }
  }
}

function requireSectionIds(answer: SovereignAnswerV2, required: Array<SovereignAnswerV2['sections'][number]['id']>): void {
  const present = new Set(answer.sections.map((section) => section.id));
  for (const id of required) {
    if (!present.has(id)) throw new Error(`${answer.mode} answer is missing ${id}`);
  }
}

function trimAnswer(answer: SovereignAnswerV2): SovereignAnswerV2 {
  answer.headline = answer.headline.trim();
  answer.direct_answer = answer.direct_answer.trim();
  answer.correction_prompt = answer.correction_prompt.trim();
  answer.sections = answer.sections.map((section) => ({
    ...section,
    label: section.label.trim(),
    body: section.body.trim()
  }));
  answer.actions = answer.actions.map((action) => ({
    ...action,
    label: action.label.trim()
  }));
  return answer;
}

export function attachBasisValues(answer: SovereignAnswerV2, registry: BasisRegistryItem[]): BasisRegistryItem[] {
  const byId = new Map(registry.map((item) => [item.id, item]));
  return answer.basis_refs.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}

export function composeSovereignAnswerText(answer: SovereignAnswerV2): string {
  const sections = answer.sections.map((section) => `${section.label.toUpperCase()}\n\n${section.body}`);
  return `${answer.headline}\n\n${answer.direct_answer}${sections.length ? `\n\n${sections.join('\n\n')}` : ''}`;
}

export function sovereignAnswerJsonContract(): string {
  return JSON.stringify({
    version: 'sovereign-answer.v2',
    mode: sovereignAnswerModes.join(' | '),
    depth: 'focused | standard | deep',
    headline: 'specific answer headline',
    direct_answer: 'meaningful direct answer before any disclosure',
    sections: [{
      id: sovereignSectionIds.join(' | '),
      label: 'plain-language label',
      body: 'specific useful body'
    }],
    basis_refs: ['server-provided ID only'],
    correction_prompt: 'brief invitation to confirm or correct',
    actions: [{
      type: sovereignActionTypes.join(' | '),
      label: 'clear action label',
      target_id: 'optional authorized identifier'
    }],
    confidence: 'confirmed | supported | exploratory',
    safety_mode: 'standard | grounded | escalate'
  }, null, 2);
}

function extractJson(raw: string): string {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Sovereign did not return a JSON object');
  return trimmed.slice(start, end + 1);
}
