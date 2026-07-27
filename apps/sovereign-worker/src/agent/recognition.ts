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

const archetypeIdSchema = z.enum(['fool', 'magician', 'three_of_cups', 'hermit', 'strength', 'tower']);
const visualPhaseSchema = z.enum(['origin', 'shadow', 'gift']);
const visualCardSchema = z.object({
  archetype: archetypeIdSchema,
  title: z.string().max(120),
  phase: visualPhaseSchema
});

const emptyVisualStory = () => ({
  should_show: false,
  mode: 'self' as const,
  primary: { archetype: 'fool' as const, title: '', phase: 'shadow' as const },
  secondary: null,
  tertiary: null,
  origin: '',
  shadow: '',
  gift: '',
  current: '',
  next_step: '',
  visual_reason: ''
});

export const visualStorySchema = z.object({
  should_show: z.boolean(),
  mode: z.enum(['self', 'interaction', 'family']),
  primary: visualCardSchema,
  secondary: visualCardSchema.nullable().optional().default(null),
  tertiary: visualCardSchema.nullable().optional().default(null),
  origin: z.string().max(360),
  shadow: z.string().max(360),
  gift: z.string().max(360),
  current: z.string().max(360),
  next_step: z.string().max(280),
  visual_reason: z.string().max(240)
}).optional().default(emptyVisualStory);

export const recognitionPlanSchema = z.object({
  response_shape: z.enum(['natural', 'guided']).optional(),
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
  visual_story: visualStorySchema,
  basis: basisSelectionSchema,
  confidence: z.enum(['confirmed', 'supported', 'exploratory']),
  safety_mode: z.enum(['standard', 'grounded', 'escalate'])
});

export type RecognitionPlan = z.infer<typeof recognitionPlanSchema>;
export type BasisSelection = z.infer<typeof basisSelectionSchema>;

export type VisualStoryPayload = {
  story: RecognitionPlan['visual_story'];
  basis: BasisSelection;
};

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
  parsed.recognition = parsed.recognition.trim();
  parsed.inward_question = normalizeQuestion(parsed.inward_question);
  parsed.candidate_hidden_expectation = parsed.candidate_hidden_expectation.trim();
  parsed.protected_need = parsed.protected_need.trim();
  parsed.clearer_form = parsed.clearer_form.trim();
  parsed.practical_action = parsed.practical_action.trim();
  parsed.module_suggestion.title = parsed.module_suggestion.title.trim();
  parsed.module_suggestion.reason = parsed.module_suggestion.reason.trim();
  trimVisualStory(parsed.visual_story);

  for (const key of Object.keys(available) as BasisKey[]) {
    const allowed = new Set(available[key]);
    if (parsed.basis[key].some((value) => !allowed.has(value))) throw new Error(`Recognition plan selected unverified ${key} data`);
  }

  if (parsed.response_phase === 'question') {
    parsed.candidate_hidden_expectation = '';
    parsed.protected_need = '';
    parsed.clearer_form = '';
    parsed.practical_action = '';
    parsed.module_suggestion.should_offer = false;
    parsed.module_suggestion.title = '';
    parsed.module_suggestion.reason = '';
    parsed.basis.user_confirmed = false;
    suppressVisualStory(parsed);
    return parsed;
  }

  for (const [field, value] of [
    ['clearer_form', parsed.clearer_form],
    ['practical_action', parsed.practical_action]
  ] as const) {
    if (!value) throw new Error(`Recognition integration is missing ${field}`);
  }

  if (parsed.safety_mode !== 'standard') {
    parsed.module_suggestion.should_offer = false;
    parsed.module_suggestion.title = '';
    parsed.module_suggestion.reason = '';
    suppressVisualStory(parsed);
  } else if (parsed.module_suggestion.should_offer && (!parsed.module_suggestion.title || !parsed.module_suggestion.reason)) {
    throw new Error('Insight Module offer requires a title and reason');
  }

  validateOrSuppressVisualStory(parsed);
  return parsed;
}

function trimVisualStory(story: RecognitionPlan['visual_story']): void {
  story.primary.title = story.primary.title.trim();
  if (story.secondary) story.secondary.title = story.secondary.title.trim();
  if (story.tertiary) story.tertiary.title = story.tertiary.title.trim();
  story.origin = story.origin.trim();
  story.shadow = story.shadow.trim();
  story.gift = story.gift.trim();
  story.current = story.current.trim();
  story.next_step = story.next_step.trim();
  story.visual_reason = story.visual_reason.trim();
}

function validateOrSuppressVisualStory(plan: RecognitionPlan): void {
  const story = plan.visual_story;
  if (!story.should_show) return;
  if (!plan.basis.user_confirmed || plan.safety_mode !== 'standard') return suppressVisualStory(plan);
  if (![story.primary.title, story.origin, story.shadow, story.gift, story.current, story.next_step, story.visual_reason].every(Boolean)) {
    return suppressVisualStory(plan);
  }
  if (story.mode !== 'self' && plan.basis.relationship.length === 0) return suppressVisualStory(plan);
  if (story.mode === 'interaction' && !story.secondary) return suppressVisualStory(plan);
  if (story.mode === 'family' && (!story.secondary || !story.tertiary)) return suppressVisualStory(plan);
}

function suppressVisualStory(plan: RecognitionPlan): void {
  plan.visual_story = emptyVisualStory();
}

function normalizeQuestion(value: string): string {
  const clean = value.trim().replace(/[?]+$/g, '').trim();
  if (clean.length < 3) throw new Error('Recognition planner returned an empty inward question');
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
  if (plan.response_shape === 'natural') {
    const body = plan.response_phase === 'question'
      ? [plan.recognition, plan.inward_question]
      : [plan.recognition, plan.candidate_hidden_expectation, plan.clearer_form, plan.practical_action].filter(Boolean);
    return `${body.join('\n\n')}${footer ? `\n\n${footer}` : ''}`;
  }
  if (plan.response_phase === 'question') {
    return `WHAT I NOTICE\n\n${plan.recognition}\n\nLOOK INWARD\n\n${plan.inward_question}${footer ? `\n\n${footer}` : ''}`;
  }
  const moduleLine = plan.module_suggestion.should_offer && plan.module_suggestion.title
    ? `\n\nEXPLORE LATER\n\n${plan.module_suggestion.title}`
    : '';
  return `WHAT THIS MAY BE SHOWING\n\n${plan.candidate_hidden_expectation}\n\nA CLEARER FORM\n\n${plan.clearer_form}\n\nWHAT TO DO\n\n${plan.practical_action}${moduleLine}${footer ? `\n\n${footer}` : ''}`;
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
    response_shape: 'natural | guided; use natural unless headings materially improve clarity or safety',
    response_phase: 'question | integration',
    recognition: 'plain-language observation',
    inward_question: 'exactly one meaningful question',
    candidate_hidden_expectation: 'optional compatibility field for possible pressure, learned expectation, responsibility tension, competing need, or system role; never an invented hidden motive',
    protected_need: 'optional valid need or value; never an invented wound',
    clearer_form: 'required in integration; empty in question phase',
    practical_action: 'required in integration; empty in question phase',
    module_suggestion: { should_offer: false, title: '', reason: '', format: 'reflection' },
    visual_story: {
      should_show: false,
      mode: 'self | interaction | family',
      primary: { archetype: 'fool | magician | three_of_cups | hermit | strength | tower', title: '', phase: 'origin | shadow | gift' },
      secondary: null,
      tertiary: null,
      origin: '',
      shadow: '',
      gift: '',
      current: '',
      next_step: '',
      visual_reason: ''
    },
    basis: { user_confirmed: false, human_design: [], gene_keys: [], astrology: [], relationship: [], live: [], numerology: [] },
    confidence: 'confirmed | supported | exploratory',
    safety_mode: 'standard | grounded | escalate'
  }, null, 2);
}
