import { z } from 'zod';

export const BASELINE_SOURCE_VERSION = 'baseline-source.v1' as const;
export const BASELINE_FACET_CONTRACT_VERSION = 'baseline-facets.v1' as const;

export const baselineFacetIds = [
  'core_orientation',
  'identity_purpose',
  'communication',
  'decision_making',
  'learning',
  'creativity_expression',
  'love_connection',
  'leadership',
  'boundaries',
  'responsibility',
  'conflict_repair',
  'response_pressure',
  'response_change',
  'underused_capacity',
  'shadow_expression',
  'gift_expression',
  'alignment_markers'
] as const;

export type BaselineFacetId = typeof baselineFacetIds[number];
export type DataUncertainty = 'low' | 'medium' | 'high';

const uncertaintySchema = z.enum(['low', 'medium', 'high']);
const bodySchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1),
  sign: z.string().min(1),
  longitude: z.number().min(0).lt(360),
  displayDegree: z.string().min(1),
  retrograde: z.boolean(),
  uncertainty: uncertaintySchema
}).strict();
const aspectSchema = z.object({
  id: z.string().min(1),
  leftBody: z.string().min(1),
  aspect: z.enum(['conjunction', 'sextile', 'square', 'trine', 'opposition']),
  rightBody: z.string().min(1),
  orb: z.number().min(0),
  display: z.string().min(1),
  uncertainty: uncertaintySchema
}).strict();
const activationSchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1),
  gate: z.number().int().min(1).max(64),
  line: z.number().int().min(1).max(6),
  uncertainty: uncertaintySchema
}).strict();
const geneKeyActivationSchema = z.object({
  id: z.string().min(1),
  body: z.string().min(1),
  activation: z.number().int().min(1).max(64),
  uncertainty: uncertaintySchema
}).strict();
const numerologySchema = z.object({
  id: z.string().min(1),
  key: z.enum(['lifePath', 'birthDay']),
  value: z.number().int().min(1),
  uncertainty: uncertaintySchema
}).strict();

export const baselineSourceDataSchema = z.object({
  version: z.literal(BASELINE_SOURCE_VERSION),
  computationVersion: z.string().min(1),
  computedAt: z.string().datetime(),
  uncertainty: uncertaintySchema,
  natalBodies: z.array(bodySchema),
  aspects: z.array(aspectSchema),
  humanDesign: z.object({
    personalityActivations: z.array(activationSchema)
  }).strict(),
  geneKeys: z.object({
    activations: z.array(geneKeyActivationSchema)
  }).strict(),
  numerology: z.array(numerologySchema),
  houses: z.null(),
  provenance: z.object({
    astronomy: z.string().min(1),
    observerCenter: z.string().min(1),
    timezoneResolution: z.string().min(1),
    birthTimeCertainty: z.enum(['exact', 'approximate', 'unknown']),
    rawBirthInputReturned: z.literal(false),
    exactPrivateLocationReturned: z.literal(false),
    completeHumanDesignClaimed: z.literal(false),
    completeGeneKeysClaimed: z.literal(false),
    housesClaimed: z.literal(false)
  }).strict()
}).strict();

export type BaselineSourceData = z.infer<typeof baselineSourceDataSchema>;

export const baselineFacetSchema = z.object({
  id: z.enum(baselineFacetIds),
  title: z.string().min(2).max(100),
  description: z.string().min(20).max(700),
  shadowExpression: z.string().min(20).max(600),
  giftExpression: z.string().min(20).max(600),
  alignmentMarkers: z.array(z.string().min(4).max(220)).min(2).max(6),
  uncertainty: uncertaintySchema,
  basisRefs: z.array(z.string().min(1)).min(1).max(10)
}).strict();

export const baselineFacetProfileSchema = z.object({
  version: z.literal(BASELINE_FACET_CONTRACT_VERSION),
  modelVersion: z.string().min(1),
  sourceComputationVersion: z.string().min(1),
  generatedAt: z.string().datetime(),
  interpretive: z.literal(true),
  facets: z.array(baselineFacetSchema).length(baselineFacetIds.length)
}).strict();

export type BaselineFacet = z.infer<typeof baselineFacetSchema>;
export type BaselineFacetProfile = z.infer<typeof baselineFacetProfileSchema>;

export type BasisCategory =
  | 'user_confirmation'
  | 'human_design'
  | 'gene_keys'
  | 'numerology'
  | 'natal'
  | 'aspect'
  | 'live'
  | 'relationship';

export interface BasisRegistryItem {
  id: string;
  category: BasisCategory;
  display: string;
  accessibleLabel: string;
  computedAt: string;
  uncertainty: DataUncertainty;
  provenance: string;
  subject: 'self' | 'other' | 'relationship';
}

const glyphs: Record<string, string> = {
  sun: '☉',
  moon: '☾',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  chiron: '⚷'
};

const signCodes: Record<string, string> = {
  Aries: 'ARI',
  Taurus: 'TAU',
  Gemini: 'GEM',
  Cancer: 'CAN',
  Leo: 'LEO',
  Virgo: 'VIR',
  Libra: 'LIB',
  Scorpio: 'SCO',
  Sagittarius: 'SAG',
  Capricorn: 'CAP',
  Aquarius: 'AQU',
  Pisces: 'PIS'
};

const aspectGlyphs: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍'
};

export function buildBaselineBasisRegistry(source: BaselineSourceData): BasisRegistryItem[] {
  const items: BasisRegistryItem[] = [];
  for (const activation of source.humanDesign.personalityActivations) {
    items.push({
      id: activation.id,
      category: 'human_design',
      display: `HD G${activation.gate}.${activation.line}`,
      accessibleLabel: `Human Design personality activation, gate ${activation.gate}, line ${activation.line}`,
      computedAt: source.computedAt,
      uncertainty: activation.uncertainty,
      provenance: 'Server Baseline calculation',
      subject: 'self'
    });
  }
  for (const activation of source.geneKeys.activations) {
    items.push({
      id: activation.id,
      category: 'gene_keys',
      display: `GK ACT${activation.activation}`,
      accessibleLabel: `Gene Keys partial activation number ${activation.activation}`,
      computedAt: source.computedAt,
      uncertainty: activation.uncertainty,
      provenance: 'Server Baseline calculation',
      subject: 'self'
    });
  }
  for (const value of source.numerology) {
    const code = value.key === 'lifePath' ? 'LP' : 'BD';
    items.push({
      id: value.id,
      category: 'numerology',
      display: `N ${code}${value.value}`,
      accessibleLabel: `${value.key === 'lifePath' ? 'Numerology life path' : 'Numerology birth day'} ${value.value}`,
      computedAt: source.computedAt,
      uncertainty: value.uncertainty,
      provenance: 'Deterministic numerology calculation',
      subject: 'self'
    });
  }
  for (const body of source.natalBodies) {
    const symbol = glyphs[body.body.toLowerCase()] ?? title(body.body);
    const sign = signCodes[body.sign] ?? body.sign.slice(0, 3).toUpperCase();
    items.push({
      id: body.id,
      category: 'natal',
      display: `${symbol} ${sign} ${body.displayDegree}${body.retrograde ? 'R' : ''}`,
      accessibleLabel: `${title(body.body)} in ${body.sign} at ${body.displayDegree}${body.retrograde ? ', retrograde' : ''}`,
      computedAt: source.computedAt,
      uncertainty: body.uncertainty,
      provenance: 'Server astronomical calculation',
      subject: 'self'
    });
  }
  for (const aspect of source.aspects) {
    const left = glyphs[aspect.leftBody.toLowerCase()] ?? title(aspect.leftBody);
    const right = glyphs[aspect.rightBody.toLowerCase()] ?? title(aspect.rightBody);
    items.push({
      id: aspect.id,
      category: 'aspect',
      display: `${left} ${aspectGlyphs[aspect.aspect]} ${right} ${aspect.orb.toFixed(1)}°`,
      accessibleLabel: `${title(aspect.leftBody)} ${aspect.aspect} ${title(aspect.rightBody)}, ${aspect.orb.toFixed(1)} degree orb`,
      computedAt: source.computedAt,
      uncertainty: aspect.uncertainty,
      provenance: 'Server astronomical calculation',
      subject: 'self'
    });
  }
  return items;
}

export function validateFacetProfileBasis(profile: BaselineFacetProfile, registry: BasisRegistryItem[]): BaselineFacetProfile {
  const allowed = new Set(registry.map((item) => item.id));
  const seen = new Set<BaselineFacetId>();
  for (const facet of profile.facets) {
    if (seen.has(facet.id)) throw new Error(`Baseline facet profile repeats ${facet.id}`);
    seen.add(facet.id);
    if (facet.basisRefs.some((id) => !allowed.has(id))) {
      throw new Error(`Baseline facet ${facet.id} selected an unverified Basis reference`);
    }
  }
  for (const id of baselineFacetIds) {
    if (!seen.has(id)) throw new Error(`Baseline facet profile is missing ${id}`);
  }
  return profile;
}

export function basisRegistryMap(items: BasisRegistryItem[]): Record<string, BasisRegistryItem> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export function parseJsonObject(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Model response did not contain a JSON object');
  return JSON.parse(trimmed.slice(start, end + 1));
}

function title(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
