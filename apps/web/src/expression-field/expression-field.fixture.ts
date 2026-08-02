import {
  EXPRESSION_AXIS_REGISTRY_VERSION,
  EXPRESSION_FIELD_VERSION,
  expressionAxisIds,
  type ExpressionAxisId,
  type ExpressionFieldResponse
} from './expression-field-contract';

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

const SELF_VALUES = [62, 54, 70, 46, 58, 33, 42, 66, 38, 57, 51, 64, 60, 72, 78, 55] as const;
const RELATIONSHIP_YOU_VALUES = [56, 58, 72, 42, 61, 35, 39, 69, 44, 53, 49, 67, 79, 73, 68, 63] as const;
const RELATIONSHIP_MAYA_VALUES = [78, 66, 61, 51, 55, 31, 36, 58, 34, 65, 57, 62, 43, 64, 59, 60] as const;
const SYSTEM_VALUES = [
  [56, 58, 72, 42, 61, 35, 39, 69, 44, 53, 49, 67, 79, 73, 68, 63],
  [78, 66, 61, 51, 55, 31, 36, 58, 34, 65, 57, 62, 43, 64, 59, 60],
  [52, 71, 66, 38, 63, 29, 41, 74, 48, 59, 46, 70, 76, 69, 65, 72],
  [69, 49, 74, 57, 52, 37, 45, 62, 41, 56, 54, 65, 71, 75, 73, 58]
] as const;

export const landingExpressionFieldFixture = buildFixture(
  SELF_VALUES,
  'self',
  new Map<ExpressionAxisId, number>([['responsibility', 10], ['clarity', 6]])
);

export const landingRelationshipExpressionFieldFixtures = {
  you: buildFixture(RELATIONSHIP_YOU_VALUES, 'relationship-you'),
  maya: buildFixture(RELATIONSHIP_MAYA_VALUES, 'relationship-maya')
} as const;

export const landingSystemExpressionFieldFixtures = SYSTEM_VALUES.map((values, index) => (
  buildFixture(values, `system-${index + 1}`)
));

function buildFixture(
  values: readonly number[],
  fixtureId: string,
  currentDeltas: ReadonlyMap<ExpressionAxisId, number> = new Map()
): ExpressionFieldResponse {
  const hasCurrentContext = currentDeltas.size > 0;
  return {
    version: EXPRESSION_FIELD_VERSION,
    registryVersion: EXPRESSION_AXIS_REGISTRY_VERSION,
    generatedAt: '2026-08-01T00:00:00.000Z',
    validUntil: null,
    mode: hasCurrentContext ? 'live' : 'baseline',
    status: 'ready',
    measurementKind: 'relative_expression_salience',
    axes: expressionAxisIds.map((id, index) => {
      const value = values[index] ?? 50;
      const currentDelta = currentDeltas.get(id) ?? 0;
      return {
        id,
        label: labels[index]!,
        baselineValue: Math.max(0, value - currentDelta),
        currentDelta,
        value,
        state: 'unconfirmed',
        confidence: 'supported',
        facetIds: [`illustrative.${fixtureId}.${id}`],
        basisRefs: [],
        summary: `${labels[index]} is one relative expression within this sanitized Baseline example.`,
        ...(currentDelta > 0
          ? { activeNow: `${labels[index]} is more visible in the example’s temporary context without determining behavior.` }
          : {})
      };
    }),
    basis: [],
    limitations: [
      'Sanitized demonstration · Illustrative values · Not your Baseline',
      'Line length shows relative salience inside this example, not a psychological score.'
    ]
  };
}
