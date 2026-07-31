import { describe, expect, it } from 'vitest';
import { normalizeTodayForWorkspace } from './BaselineSupportedRuntime';

describe('supported reduced Baseline workspace adaptation', () => {
  it('keeps the server degraded state visible while enabling the legacy workspace', () => {
    const result = normalizeTodayForWorkspace({
      today: {
        baseline: {
          status: 'degraded',
          reducedContext: {
            compiler: { fullCompilerReady: false, completeness: 'reduced' },
            facetProfile: { facets: [{ id: 'core_orientation' }] }
          }
        }
      }
    });

    expect(result.supportedReduced).toBe(true);
    const baseline = ((result.body.today as Record<string, unknown>).baseline as Record<string, unknown>);
    expect(baseline.status).toBe('completed');
    expect(baseline.serverStatus).toBe('degraded');
    expect(baseline.workspaceStatus).toBe('usable_supported_reduced');
    expect(JSON.stringify(result.body)).toContain('"fullCompilerReady":false');
  });

  it('does not adapt legacy rows, pending runs, or output without facets', () => {
    for (const baseline of [
      { status: 'legacy_reduced', reducedContext: {} },
      { status: 'recompute_queued', reducedContext: {} },
      { status: 'degraded', reducedContext: { compiler: { fullCompilerReady: false }, facetProfile: { facets: [] } } },
      { status: 'degraded', reducedContext: { compiler: { fullCompilerReady: true }, facetProfile: { facets: [{}] } } }
    ]) {
      const body = { today: { baseline } };
      expect(normalizeTodayForWorkspace(body)).toEqual({ body, supportedReduced: false });
    }
  });
});
