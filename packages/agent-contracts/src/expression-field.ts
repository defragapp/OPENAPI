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
export type ExpressionFieldMode = 'baseline' | 'live';
export type ExpressionFieldStatus = 'ready' | 'building' | 'baseline_only' | 'unavailable';
export type ExpressionState = 'integrated' | 'under_pressure' | 'mixed' | 'unconfirmed';
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
