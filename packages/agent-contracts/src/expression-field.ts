export const EXPRESSION_FIELD_VERSION = 'expression-field.v1' as const;
export const EXPRESSION_AXIS_REGISTRY_VERSION = 'expression-axis-registry.v1' as const;

export const expressionAxisIds = [
  'clarity',
  'focus',
  'steadiness',
  'urgency',
  'courage',
  'fear',
  'anger',
  'tenderness',
  'grief',
  'joy',
  'desire',
  'trust',
  'patience',
  'boundaries',
  'responsibility',
  'repair'
] as const;

export type ExpressionAxisId = typeof expressionAxisIds[number];
export type ExpressionAxisDomain = 'self' | 'relationship' | 'system' | 'current_context';
export type ExpressionAxisDirection = readonly [number, number, number];

export interface ExpressionAxisRegistryEntry {
  id: ExpressionAxisId;
  index: number;
  label: string;
  domain: ExpressionAxisDomain;
  direction: ExpressionAxisDirection;
}

export const expressionAxisRegistry = [
  { id: 'clarity', index: 0, label: 'Clarity', domain: 'self', direction: [0.34798527267687634, 0.9375, 0] },
  { id: 'focus', index: 1, label: 'Focus', domain: 'self', direction: [-0.42985743923670755, 0.8125, 0.3937846263287336] },
  { id: 'steadiness', index: 2, label: 'Steadiness', domain: 'self', direction: [0.0634871954735437, 0.6875, -0.7234038471081724] },
  { id: 'urgency', index: 3, label: 'Urgency', domain: 'current_context', direction: [0.50305559816796, 0.5625, 0.6561469463099526] },
  { id: 'courage', index: 4, label: 'Courage', domain: 'self', direction: [-0.8854724951825381, 0.4375, -0.156627616578974] },
  { id: 'fear', index: 5, label: 'Fear', domain: 'self', direction: [0.8014981392972829, 0.3125, -0.5098475092642832] },
  { id: 'anger', index: 6, label: 'Anger', domain: 'relationship', direction: [-0.25500011945061624, 0.1875, 0.9485877339920497] },
  { id: 'tenderness', index: 7, label: 'Tenderness', domain: 'relationship', direction: [-0.46000593484912655, 0.0625, -0.8857134355442402] },
  { id: 'grief', index: 8, label: 'Grief', domain: 'self', direction: [0.9374848892962336, -0.0625, 0.3423679779728655] },
  { id: 'joy', index: 9, label: 'Joy', domain: 'self', direction: [-0.9079519205901849, -0.1875, 0.3747893540331617] },
  { id: 'desire', index: 10, label: 'Desire', domain: 'self', direction: [0.4026188380305669, -0.3125, -0.8603730709773035] },
  { id: 'trust', index: 11, label: 'Trust', domain: 'relationship', direction: [0.26912156091066985, -0.4375, 0.8580019437349805] },
  { id: 'patience', index: 12, label: 'Patience', domain: 'self', direction: [-0.7153542789226215, -0.5625, -0.41456242669481796] },
  { id: 'boundaries', index: 13, label: 'Boundaries', domain: 'relationship', direction: [0.709246688607407, -0.6875, -0.15592589489699188] },
  { id: 'responsibility', index: 14, label: 'Responsibility', domain: 'system', direction: [-0.33527813688580826, -0.8125, 0.4768986484845404] },
  { id: 'repair', index: 15, label: 'Repair', domain: 'relationship', direction: [-0.04471982743159614, -0.9375, -0.34509982184070775] }
] as const satisfies readonly ExpressionAxisRegistryEntry[];

export const expressionAxisRegistryById = Object.freeze(Object.fromEntries(
  expressionAxisRegistry.map((entry) => [entry.id, entry])
) as Record<ExpressionAxisId, ExpressionAxisRegistryEntry>);

export type ExpressionFieldMode = 'baseline' | 'live';
export type ExpressionFieldStatus = 'ready' | 'building' | 'baseline_only' | 'unavailable';
export type ExpressionState =
  | 'gift'
  | 'protective'
  | 'repressed'
  | 'overextended'
  | 'mixed'
  | 'unconfirmed'
  | 'integrated'
  | 'under_pressure';
export type ExpressionConfidence = 'supported' | 'exploratory';

export interface ExpressionFieldBasisItem {
  id: string;
  category: string;
  display: string;
  accessibleLabel: string;
  computedAt: string;
  uncertainty: 'low' | 'medium' | 'high';
  provenance: string;
  subject: 'self';
}

export interface ExpressionAxisValue {
  id: ExpressionAxisId;
  label: string;
  baselineValue: number;
  currentDelta: number;
  value: number;
  state: ExpressionState;
  confidence: ExpressionConfidence;
  facetIds: string[];
  basisRefs: string[];
  summary: string;
  activeNow?: string;
  giftExpression?: string;
  shadowExpression?: string;
  repressedExpression?: string;
  overextendedExpression?: string;
  practicalDistinction?: string;
  contextDomain?: ExpressionAxisDomain;
}

export interface ExpressionFieldResponse {
  version: typeof EXPRESSION_FIELD_VERSION;
  registryVersion: typeof EXPRESSION_AXIS_REGISTRY_VERSION;
  generatedAt: string;
  validUntil: string | null;
  mode: ExpressionFieldMode;
  status: ExpressionFieldStatus;
  measurementKind: 'relative_expression_salience';
  axes: ExpressionAxisValue[];
  basis: ExpressionFieldBasisItem[];
  limitations: string[];
}

export function salienceLabel(value: number): 'Quiet' | 'Present' | 'More active' | 'Prominent' | 'Highly emphasized' {
  const normalized = Math.max(0, Math.min(100, value));
  if (normalized < 20) return 'Quiet';
  if (normalized < 45) return 'Present';
  if (normalized < 70) return 'More active';
  if (normalized < 90) return 'Prominent';
  return 'Highly emphasized';
}

export function expressionStateLabel(state: ExpressionState): string {
  switch (state) {
    case 'gift': return 'Gift expression';
    case 'protective': return 'Protective expression';
    case 'repressed': return 'Repressed expression';
    case 'overextended': return 'Overextended expression';
    case 'integrated': return 'Integrated expression';
    case 'under_pressure': return 'Expression under pressure';
    case 'mixed': return 'Mixed expression';
    default: return 'Yours to confirm';
  }
}

export function assertExpressionFieldResponse(value: unknown): asserts value is ExpressionFieldResponse {
  const response = record(value, 'Expression Field response');
  expectEqual(response.version, EXPRESSION_FIELD_VERSION, 'version');
  expectEqual(response.registryVersion, EXPRESSION_AXIS_REGISTRY_VERSION, 'registryVersion');
  expectString(response.generatedAt, 'generatedAt', 64);
  if (!hasExplicitOffset(response.generatedAt as string) || !Number.isFinite(Date.parse(response.generatedAt as string))) {
    throw new Error('Expression Field generatedAt must be an ISO-8601 timestamp with an explicit offset.');
  }
  if (response.validUntil !== null && response.validUntil !== undefined) {
    expectString(response.validUntil, 'validUntil', 64);
    if (!hasExplicitOffset(response.validUntil as string) || !Number.isFinite(Date.parse(response.validUntil as string))) {
      throw new Error('Expression Field validUntil must be null or an ISO-8601 timestamp with an explicit offset.');
    }
  }
  expectOneOf(response.mode, ['baseline', 'live'] as const, 'mode');
  expectOneOf(response.status, ['ready', 'building', 'baseline_only', 'unavailable'] as const, 'status');
  expectEqual(response.measurementKind, 'relative_expression_salience', 'measurementKind');

  if (!Array.isArray(response.axes)) throw new Error('Expression Field axes must be an array.');
  const status = response.status as ExpressionFieldStatus;
  if ((status === 'ready' || status === 'baseline_only') && response.axes.length !== expressionAxisIds.length) {
    throw new Error(`Expression Field must include exactly ${expressionAxisIds.length} axes when ready.`);
  }
  if ((status === 'building' || status === 'unavailable') && response.axes.length !== 0) {
    throw new Error('Unavailable Expression Field responses cannot include partial axes.');
  }

  const seenIds = new Set<string>();
  for (const [index, rawAxis] of response.axes.entries()) {
    const axis = record(rawAxis, `axes[${index}]`);
    expectOneOf(axis.id, expressionAxisIds, `axes[${index}].id`);
    const id = axis.id as ExpressionAxisId;
    if (seenIds.has(id)) throw new Error(`Expression Field repeats axis ${id}.`);
    seenIds.add(id);
    expectEqual(axis.label, expressionAxisRegistryById[id].label, `axes[${index}].label`);
    expectFiniteRange(axis.baselineValue, `axes[${index}].baselineValue`, 0, 100);
    expectFiniteRange(axis.currentDelta, `axes[${index}].currentDelta`, -100, 100);
    expectFiniteRange(axis.value, `axes[${index}].value`, 0, 100);
    expectOneOf(axis.state, ['gift', 'protective', 'repressed', 'overextended', 'mixed', 'unconfirmed', 'integrated', 'under_pressure'] as const, `axes[${index}].state`);
    expectOneOf(axis.confidence, ['supported', 'exploratory'] as const, `axes[${index}].confidence`);
    expectStringArray(axis.facetIds, `axes[${index}].facetIds`, 24, 160);
    expectStringArray(axis.basisRefs, `axes[${index}].basisRefs`, 24, 256);
    expectString(axis.summary, `axes[${index}].summary`, 800);
    for (const key of ['activeNow', 'giftExpression', 'shadowExpression', 'repressedExpression', 'overextendedExpression', 'practicalDistinction'] as const) {
      if (axis[key] !== undefined) expectString(axis[key], `axes[${index}].${key}`, 800);
    }
    if (axis.contextDomain !== undefined) {
      expectOneOf(axis.contextDomain, ['self', 'relationship', 'system', 'current_context'] as const, `axes[${index}].contextDomain`);
    }
  }

  if (!Array.isArray(response.basis) || response.basis.length > 160) throw new Error('Expression Field basis must be a bounded array.');
  if (!Array.isArray(response.limitations) || response.limitations.length > 12) throw new Error('Expression Field limitations must be a bounded array.');
  for (const [index, limitation] of response.limitations.entries()) expectString(limitation, `limitations[${index}]`, 700);
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path} must be an object.`);
  return value as Record<string, unknown>;
}

function expectEqual(value: unknown, expected: string, path: string): void {
  if (value !== expected) throw new Error(`Expression Field ${path} must equal ${expected}.`);
}

function expectString(value: unknown, path: string, maximum: number): void {
  if (typeof value !== 'string' || value.length < 1 || value.length > maximum) {
    throw new Error(`Expression Field ${path} must be a non-empty string no longer than ${maximum} characters.`);
  }
}

function expectStringArray(value: unknown, path: string, maximumItems: number, maximumLength: number): void {
  if (!Array.isArray(value) || value.length > maximumItems) throw new Error(`Expression Field ${path} must be a bounded array.`);
  value.forEach((item, index) => expectString(item, `${path}[${index}]`, maximumLength));
}

function expectFiniteRange(value: unknown, path: string, minimum: number, maximum: number): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`Expression Field ${path} must be finite and between ${minimum} and ${maximum}.`);
  }
}

function expectOneOf<const T extends readonly string[]>(value: unknown, allowed: T, path: string): asserts value is T[number] {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new Error(`Expression Field ${path} is not recognized.`);
  }
}

function hasExplicitOffset(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
}
