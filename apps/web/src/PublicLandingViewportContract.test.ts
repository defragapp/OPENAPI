import { describe, expect, it } from 'vitest';
import { evaluatePublicLandingViewport } from './PublicLandingViewportContract';
import type { PublicLandingViewportSnapshot } from './PublicLandingViewportContract';

const surfaceIds = [
  'hero',
  'personal-chat',
  'personal-reasoning',
  'relationship-chat',
  'relationship-reasoning',
  'system-map',
  'comparison'
] as const;

function passingSnapshot(): PublicLandingViewportSnapshot {
  return {
    viewportWidth: 375,
    scrollWidth: 375,
    surfaces: surfaceIds.map((id) => ({ id, left: 16, right: 359, width: 343, layoutWidth: 343 })),
    stageGaps: [42, 42, 42],
    comparisonStacked: true
  };
}

describe('founder v0 landing rendered viewport contract', () => {
  it('accepts full-width v0 workflow surfaces at phone width', () => {
    expect(evaluatePublicLandingViewport(passingSnapshot())).toMatchObject({ ok: true, failures: [] });
  });

  it('rejects a desktop-scaled product demonstration', () => {
    const snapshot = passingSnapshot();
    snapshot.surfaces[1] = { id: 'personal-chat', left: 72, right: 303, width: 231, layoutWidth: 520 };
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toContain('personal-chat width');
    expect(result.failures.join(' ')).toContain('rendered scale');
  });

  it('rejects horizontal overflow and an unstacked comparison', () => {
    const snapshot = passingSnapshot();
    snapshot.scrollWidth = 412;
    snapshot.comparisonStacked = false;
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.ok).toBe(false);
    expect(result.failures).toContain('horizontal overflow 412px > 375px');
    expect(result.failures).toContain('comparison section is not stacked');
  });

  it('rejects excessive space between a v0 story heading and product stage', () => {
    const snapshot = passingSnapshot();
    snapshot.stageGaps[1] = 144;
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.ok).toBe(false);
    expect(result.failures).toContain('stage gap 2 is 144px');
  });
});
