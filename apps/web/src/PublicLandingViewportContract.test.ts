import { describe, expect, it } from 'vitest';
import { evaluatePublicLandingViewport } from './PublicLandingViewportContract';
import type { PublicLandingViewportSnapshot } from './PublicLandingViewportContract';

const surfaceIds = [
  'hero',
  'expression-slice',
  'capability-summary',
  'comparison'
] as const;

function passingPhoneSnapshot(): PublicLandingViewportSnapshot {
  return {
    viewportWidth: 375,
    scrollWidth: 375,
    surfaces: [
      { id: 'hero', left: 16, right: 359, width: 343, layoutWidth: 343 },
      { id: 'expression-slice', left: 0, right: 375, width: 375, layoutWidth: 375 },
      { id: 'capability-summary', left: 16, right: 359, width: 343, layoutWidth: 343 },
      { id: 'comparison', left: 16, right: 359, width: 343, layoutWidth: 343 }
    ],
    stageGaps: [42],
    comparisonStacked: true
  };
}

function passingDesktopSnapshot(): PublicLandingViewportSnapshot {
  return {
    viewportWidth: 1440,
    scrollWidth: 1440,
    surfaces: [
      { id: 'hero', left: 220, right: 1220, width: 1000, layoutWidth: 1000 },
      { id: 'expression-slice', left: 0, right: 1440, width: 1440, layoutWidth: 1440 },
      { id: 'capability-summary', left: 160, right: 1280, width: 1120, layoutWidth: 1120 },
      { id: 'comparison', left: 160, right: 1280, width: 1120, layoutWidth: 1120 }
    ],
    stageGaps: [58],
    comparisonStacked: false
  };
}

describe('single-example landing rendered viewport contract', () => {
  it('accepts a full-bleed expression slice at phone width', () => {
    expect(evaluatePublicLandingViewport(passingPhoneSnapshot())).toMatchObject({ ok: true, failures: [] });
  });

  it('accepts the intended desktop composition', () => {
    expect(evaluatePublicLandingViewport(passingDesktopSnapshot())).toMatchObject({ ok: true, failures: [] });
  });

  it('rejects a desktop-scaled expression slice on a phone', () => {
    const snapshot = passingPhoneSnapshot();
    snapshot.surfaces[1] = { id: 'expression-slice', left: 72, right: 303, width: 231, layoutWidth: 520 };
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toContain('expression-slice width');
    expect(result.failures.join(' ')).toContain('rendered scale');
  });

  it('rejects horizontal overflow and an unstacked phone comparison', () => {
    const snapshot = passingPhoneSnapshot();
    snapshot.scrollWidth = 412;
    snapshot.comparisonStacked = false;
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.ok).toBe(false);
    expect(result.failures).toContain('horizontal overflow 412px > 375px');
    expect(result.failures).toContain('comparison section is not stacked');
  });

  it('rejects excessive space between the hero content and expression slice', () => {
    const snapshot = passingPhoneSnapshot();
    snapshot.stageGaps[0] = 144;
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.ok).toBe(false);
    expect(result.failures).toContain('stage gap 1 is 144px');
  });

  it('covers every required public surface', () => {
    expect(surfaceIds).toEqual(['hero', 'expression-slice', 'capability-summary', 'comparison']);
  });
});
