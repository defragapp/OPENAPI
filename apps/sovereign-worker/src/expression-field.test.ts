import { describe, expect, it } from 'vitest';
import { expressionAxisIds } from '@sovereign/agent-contracts';
import { buildExpressionAxisValues, handleExpressionFieldRequest } from './expression-field';
import type { Env } from './env';

const facets = [
  {
    id: 'core_orientation',
    title: 'Core orientation',
    description: 'A stable orientation toward creating usable direction when circumstances remain unclear.',
    uncertainty: 'low',
    basisRefs: ['natal.sun']
  },
  {
    id: 'responsibility',
    title: 'Responsibility',
    description: 'Responsibility may become prominent when ownership, authority, and outcome are not clearly matched.',
    uncertainty: 'medium',
    basisRefs: ['natal.sun', 'aspect.sun-saturn']
  },
  {
    id: 'boundaries',
    title: 'Boundaries',
    description: 'Boundaries preserve the difference between participating and carrying an outcome for everyone.',
    uncertainty: 'low',
    basisRefs: ['aspect.sun-saturn']
  }
];

describe('Expression Field derivation', () => {
  it('returns every canonical axis exactly once with bounded values', () => {
    const axes = buildExpressionAxisValues({ facets });
    expect(axes).toHaveLength(expressionAxisIds.length);
    expect(new Set(axes.map((axis) => axis.id))).toEqual(new Set(expressionAxisIds));
    for (const axis of axes) {
      expect(axis.value).toBeGreaterThanOrEqual(0);
      expect(axis.value).toBeLessThanOrEqual(100);
      expect(axis.currentDelta).toBe(0);
      expect(axis.state).toBe('unconfirmed');
    }
  });

  it('uses current context only as a bounded salience delta', () => {
    const [baseline] = buildExpressionAxisValues({ facets }).filter((axis) => axis.id === 'responsibility');
    const [live] = buildExpressionAxisValues({
      facets,
      activeFacetIds: ['responsibility'],
      currentReady: true,
      contactCount: 10
    }).filter((axis) => axis.id === 'responsibility');
    expect(live!.baselineValue).toBe(baseline!.baselineValue);
    expect(live!.currentDelta).toBeLessThanOrEqual(18);
    expect(live!.value).toBeGreaterThan(baseline!.value);
    expect(live!.state).toBe('unconfirmed');
  });

  it('derives stable emphasis from permitted facet support rather than an axis-name hash', () => {
    const first = buildExpressionAxisValues({ facets });
    const second = buildExpressionAxisValues({ facets });
    expect(first).toEqual(second);
    expect(first.every((axis) => axis.baselineValue >= 28 && axis.baselineValue <= 76)).toBe(true);
  });

  it('is deterministic for an unchanged Baseline facet profile', () => {
    expect(buildExpressionAxisValues({ facets })).toEqual(buildExpressionAxisValues({ facets }));
  });

  it('returns the intended unauthorized response instead of surfacing a Worker 500', async () => {
    const response = await handleExpressionFieldRequest(
      new Request('https://app.defrag.app/api/v1/expression-field?mode=live'),
      {} as Env
    );

    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
  });
});
