import { z } from 'zod';

export const basisSelectionSchema = z.object({
  user_confirmed: z.boolean(),
  human_design: z.array(z.string().min(1)).max(6),
  gene_keys: z.array(z.string().min(1)).max(6),
  astrology: z.array(z.string().min(1)).max(6),
  relationship: z.array(z.string().min(1)).max(6),
  live: z.array(z.string().min(1)).max(6),
  numerology: z.array(z.string().min(1)).max(6)
});

export const recognitionPlanSchema = z.object({
  response_phase: z.enum(['question', 'integration']),
  recognition: z.string().min(1).max(420),
  inward_question: z.string().min(1).max(240),
  candidate_hidden_expectation: z.string().max(420),
  protected_need: z.string().max(240),
  clearer_form: z.string().max(320),
  practical_action: z.string().max(320),
  module_suggestion: z.object({
    should_offer: z.boolean(),
    title: z.string().max(140),
    reason: z.string().max(240),
    format: z.enum(['audio', 'card', 'reflection', 'video', 'article'])
  }),
  basis: basisSelectionSchema,
  confidence: z.enum(['confirmed', 'supported', 'exploratory']),
  safety_mode: z.enum(['standard', 'grounded', 'escalate'])
});

export type RecognitionPlan = z.infer<typeof recognitionPlanSchema>;
export type BasisSelection = z.infer<typeof basisSelectionSchema>;

type BasisKey = Exclude<keyof BasisSelection, 'user_confirmed'>;
export type AvailableBasis = Record<BasisKey, string[]>;

const emptyAvailableBasis = (): AvailableBasis => ({
  human_design: [],
  gene_keys: [],
  astrology: [],
  relationship: [],
  live: [],
  numerology: []
});

export function deriveAvailableBasis(context: unknown): AvailableBasis {
  const output = emptyAvailableBasis();
  visit(context, output, '');
  for (const key of Object.keys(output) as BasisKey[]) output[key] = [...new Set(output[key])].slice(0, 20);
  return output;
}

function visit(value: unknown, output: AvailableBasis, parentKey: string): void {
  if (Array.isArray(value)) {
    if (/relationship|aspect|contact/i.test(parentKey)) pushStrings(output.relationship, value);
    if (/live|transit|current/i.test(parentKey)) pushStrings(output.live, value);
    if (/channel|gate|human.?design/i.test(parentKey)) pushStrings(output.human_design, value);
    for (const item of value) visit(item, output, parentKey);
    return;
  }
  if (!value || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  for (const [key, item] of Object.entries(record)) {
    if (/human.?design/i.test(key) && item && typeof item === 'object') collectHumanDesign(item as Record<string, unknown>, output.human_design);
    else if (/gene.?keys?/i.test(key) && item && typeof item === 'object') collectValues(item as Record<string, unknown>, output.gene_keys);
    else if (/natal.?placements?/i.test(key) && item && typeof item === 'object') collectPlacements(item as Record<string, unknown>, output.astrology);
    else if (/current.?astronomy|live.?contacts?|transits?/i.test(key) && item && typeof item === 'object') collectPlacements(item as Record<string, unknown>, output.live);
    else if (/numerology/i.test(key) && item && typeof item === 'object') collectNamedValues(item as Record<string, unknown>, output.numerology);
    else if (/relationship.?contacts?|synastry|aspects?/i.test(key)) {
      if (Array.isArray(item)) pushStrings(output.relationship, item);
      else if (typeof item === 'string') output.relationship.push(item);
    }
    visit(item, output, key);
  }
}

function collectHumanDesign(record: Record<string, unknown>, output: string[]): void {
  for (const key of ['profile', 'type', 'authority']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) output.push(value.trim());
  }
  for (const key of ['channels', 'gates']) {
    const value = record[key];
    if (Array.isArray(value)) pushStrings(output, value);
    else if (value && typeof value === 'object') collectValues(value as Record<string, unknown>, output);
  }
}

function collectValues(record: Record<string, unknown>, output: string[]): void {
  for (const value of Object.values(record)) {
    if (typeof value === 'string' || typeof value === 'number') output.push(String(value));
    else if (Array.isArray(value)) pushStrings(output, value);
  }
}

function collectNamedValues(record: Record<string, unknown>, output: string[]): void {
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' || typeof value === 'number') output.push(`${plainKey(key)} ${String(value)}`);
  }
}

function collectPlacements(record: Record<string, unknown>, output: string[]): void {
  const glyphs: Record<string, string> = { sun: '☉', moon: '☾', ascendant: '↑', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇' };
  for (const [key, value] of Object.entries(record)) {
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    output.push(`${glyphs[key.toLowerCase()] ?? plainKey(key)} ${String(value)}`);
  }
}

function pushStrings(output: string[], values: unknown[]): void {
  for (const value of values) if (typeof value === 'string' || typeof value === 'number') output.push(String(value));
}

function plainKey(value: string): string { return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase(); }

export function parseRecognitionPlan(raw: string, available: AvailableBasis): RecognitionPlan {
  const parsed = recognitionPlanSchema.parse(JSON.parse(extractJson(raw)));
  for (const key of Object.keys(available) as BasisKey[]) {
    const allowed = new Set(available[key]);
    if (parsed.basis[key].some((value) => !allowed.has(value))) throw new Error(`Recognition plan selected unverified ${key} data`);
  }
  parsed.inward_question = normalizeQuestion(parsed.inward_question);
  if (parsed.response_phase === 'question') {
    parsed.candidate_hidden_expectation = '';
    parsed.protected_need = '';
    parsed.clearer_form = '';
    parsed.practical_action = '';
    parsed.module_suggestion.should_offer = false;
  }
  return parsed;
}

function normalizeQuestion(value: string): string {
  const clean = value.trim().replace(/[?]+$/g, '');
  return `${clean}?`;
}

function extractJson(raw: string): string {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Recognition planner did not return JSON');
  return trimmed.slice(start, end + 1);
}

export function composeRecognitionResponse(plan: RecognitionPlan): string {
  const safeBasis = plan.safety_mode === 'standard' ? plan.basis : { ...plan.basis, human_design: [], gene_keys: [], astrology: [], relationship: [], live: [], numerology: [] };
  const footer = renderBasisFooter(safeBasis);
  if (plan.response_phase === 'question') {
    return `WHAT I NOTICE\n\n${plan.recognition}\n\nLOOK INWARD\n\n${plan.inward_question}${footer ? `\n\n${footer}` : ''}`;
  }
  const moduleLine = plan.module_suggestion.should_offer && plan.module_suggestion.title
    ? `\n\nEXPLORE LATER\n\n${plan.module_suggestion.title}`
    : '';
  return `WHAT THIS MAY BE SHOWING\n\n${plan.candidate_hidden_expectation || plan.recognition}\n\nA CLEARER FORM\n\n${plan.clearer_form}\n\nWHAT TO DO\n\n${plan.practical_action}${moduleLine}${footer ? `\n\n${footer}` : ''}`;
}

export function renderBasisFooter(basis: BasisSelection): string {
  const parts: string[] = [];
  if (basis.user_confirmed) parts.push('U✓');
  addPart(parts, 'HD', basis.human_design);
  addPart(parts, 'GK', basis.gene_keys);
  addPart(parts, 'A', basis.astrology);
  addPart(parts, 'REL', basis.relationship);
  addPart(parts, 'LIVE', basis.live);
  addPart(parts, 'N', basis.numerology);
  return parts.length ? `BASIS · ${parts.join(' | ')}` : '';
}

function addPart(parts: string[], label: string, values: string[]): void {
  if (values.length) parts.push(`${label} ${values.join(' · ')}`);
}

export function recognitionJsonContract(_available: AvailableBasis): string {
  return JSON.stringify({
    response_phase: 'question | integration',
    recognition: 'plain-language observation',
    inward_question: 'exactly one question',
    candidate_hidden_expectation: 'empty in question phase',
    protected_need: 'empty in question phase',
    clearer_form: 'empty in question phase',
    practical_action: 'empty in question phase',
    module_suggestion: { should_offer: false, title: '', reason: '', format: 'reflection' },
    basis: { user_confirmed: false, human_design: [], gene_keys: [], astrology: [], relationship: [], live: [], numerology: [] },
    confidence: 'confirmed | supported | exploratory',
    safety_mode: 'standard | grounded | escalate'
  }, null, 2);
}
