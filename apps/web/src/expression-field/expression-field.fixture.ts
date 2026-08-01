import {
  EXPRESSION_AXIS_REGISTRY_VERSION,
  EXPRESSION_FIELD_VERSION,
  expressionAxisIds,
  type ExpressionFieldResponse
} from '@sovereign/agent-contracts';

const labels = [
  'Clarity',
  'Focus',
  'Steadiness',
  'Urgency',
  'Courage',
  'Fear',
  'Anger',
  'Tenderness',
  'Grief',
  'Joy',
  'Desire',
  'Trust',
  'Patience',
  'Boundaries',
  'Responsibility',
  'Repair'
] as const;

const values = [62, 54, 70, 46, 58, 33, 42, 66, 38, 57, 51, 64, 60, 72, 78, 55] as const;

export const landingExpressionFieldFixture: ExpressionFieldResponse = {
  version: EXPRESSION_FIELD_VERSION,
  registryVersion: EXPRESSION_AXIS_REGISTRY_VERSION,
  generatedAt: '2026-08-01T00:00:00.000Z',
  validUntil: null,
  mode: 'live',
  status: 'ready',
  measurementKind: 'relative_expression_salience',
  axes: expressionAxisIds.map((id, index) => ({
    id,
    label: labels[index]!,
    baselineValue: Math.max(24, values[index]! - (index % 4 === 0 ? 8 : 0)),
    currentDelta: index % 4 === 0 ? 8 : 0,
    value: values[index]!,
    state: 'unconfirmed',
    confidence: 'supported',
    facetIds: [],
    basisRefs: [],
    summary: index === 14
      ? 'Responsibility may be more visible when ownership is unclear.'
      : `${labels[index]} is shown as one possible expression within the complete field.`,
    ...(index === 14
      ? { activeNow: 'Temporary context may make responsibility more noticeable without determining how it is expressed.' }
      : {})
  })),
  basis: [],
  limitations: [
    'Sanitized demonstration · Illustrative values · Not your Baseline',
    'Line length shows relative salience inside this example, not a psychological score.'
  ]
};
