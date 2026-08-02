import { describe, expect, it } from 'vitest';
import {
  EXPRESSION_AXIS_REGISTRY_VERSION,
  EXPRESSION_FIELD_VERSION,
  assertExpressionFieldResponse,
  expressionAxisIds,
  expressionAxisRegistry,
  expressionAxisRegistryById,
  type ExpressionFieldResponse
} from './expression-field';

function validResponse(): ExpressionFieldResponse {
  return {
    version: EXPRESSION_FIELD_VERSION,
    registryVersion: EXPRESSION_AXIS_REGISTRY_VERSION,
    generatedAt: '2026-08-01T17:53:00-07:00',
    validUntil: null,
    mode: 'baseline',
    status: 'ready',
    measurementKind: 'relative_expression_salience',
    axes: expressionAxisIds.map((id, index) => ({
      id,
      label: expressionAxisRegistryById[id].label,
      baselineValue: 40 + index,
      currentDelta: 0,
      value: 40 + index,
      state: 'unconfirmed',
      confidence: 'supported',
      facetIds: [`facet.${id}`],
      basisRefs: [`basis.${id}`],
      summary: `${id} is available for confirmation.`,
      contextDomain: expressionAxisRegistryById[id].domain
    })),
    basis: [],
    limitations: ['Relative expression salience is not a diagnosis or score.']
  };
}

describe('Expression Field contract', () => {
  it('keeps an append-only, normalized, complete registry', () => {
    expect(expressionAxisRegistry.map((entry) => entry.id)).toEqual(expressionAxisIds);
    expect(expressionAxisRegistry.map((entry) => entry.index)).toEqual(expressionAxisIds.map((_, index) => index));
    for (const entry of expressionAxisRegistry) {
      expect(Math.hypot(...entry.direction)).toBeCloseTo(1, 5);
      expect(expressionAxisRegistryById[entry.id]).toEqual(entry);
    }
  });

  it('accepts a complete field with authoritative labels', () => {
    expect(() => assertExpressionFieldResponse(validResponse())).not.toThrow();
  });

  it('rejects duplicate axes, label drift, and non-finite values', () => {
    const duplicate = validResponse();
    duplicate.axes[1] = { ...duplicate.axes[0]! };
    expect(() => assertExpressionFieldResponse(duplicate)).toThrow(/repeats axis/i);

    const wrongLabel = validResponse();
    wrongLabel.axes[0] = { ...wrongLabel.axes[0]!, label: 'Mood score' };
    expect(() => assertExpressionFieldResponse(wrongLabel)).toThrow(/label/i);

    const nonFinite = validResponse();
    nonFinite.axes[0] = { ...nonFinite.axes[0]!, value: Number.NaN };
    expect(() => assertExpressionFieldResponse(nonFinite)).toThrow(/finite/i);
  });
});
