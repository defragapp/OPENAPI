import { describe, expect, it } from 'vitest';
import { evaluatePublicLandingViewport } from './PublicLandingViewportContract';
import type { PublicLandingViewportSnapshot } from './PublicLandingViewportContract';

const requiredSurfaceIds = [
  'hero',
  'expression-slice',
  'personal-chat',
  'personal-reasoning',
  'relationship-chat',
  'relationship-reasoning',
  'system-map',
  'system-reasoning',
  'comparison'
] as const;

function passingPhoneSnapshot(): PublicLandingViewportSnapshot {
  const inset = { left: 16, right: 359, width: 343, layoutWidth: 343 };
  return {
    viewportWidth: 375,
    scrollWidth: 375,
    surfaces: [
      { id: 'hero', ...inset },
      { id: 'expression-slice', left: 0, right: 375, width: 375, layoutWidth: 375 },
      { id: 'personal-chat', ...inset },
      { id: 'personal-reasoning', ...inset },
      { id: 'relationship-chat', ...inset },
      { id: 'relationship-reasoning', ...inset },
      { id: 'system-map', ...inset },
      { id: 'system-reasoning', ...inset },
      { id: 'comparison', ...inset }
    ],
    stageGaps: [42, 36, 36, 36],
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
      { id: 'personal-chat', left: 100, right: 665, width: 565, layoutWidth: 565 },
      { id: 'personal-reasoning', left: 713, right: 1340, width: 627, layoutWidth: 627 },
      { id: 'relationship-chat', left: 100, right: 665, width: 565, layoutWidth: 565 },
      { id: 'relationship-reasoning', left: 713, right: 1340, width: 627, layoutWidth: 627 },
      { id: 'system-map', left: 100, right: 665, width: 565, layoutWidth: 565 },
      { id: 'system-reasoning', left: 713, right: 1340, width: 627, layoutWidth: 627 },
      { id: 'comparison', left: 160, right: 1280, width: 1120, layoutWidth: 1120 }
    ],
    stageGaps: [58, 54, 54, 54],
    comparisonStacked: false
  };
}

describe('restored landing rendered viewport contract', () => {
  it('accepts the field and stacked product stages at phone width', () => {
    expect(evaluatePublicLandingViewport(passingPhoneSnapshot())).toMatchObject({ ok: true, failures: [] });
  });

  it('accepts the intended desktop composition', () => {
    expect(evaluatePublicLandingViewport(passingDesktopSnapshot())).toMatchObject({ ok: true, failures: [] });
  });

  it('rejects a desktop-scaled expression field on a phone', () => {
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

  it('rejects a missing workflow surface', () => {
    const snapshot = passingPhoneSnapshot();
    snapshot.surfaces = snapshot.surfaces.filter((surface) => surface.id !== 'relationship-reasoning');
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.failures).toContain('missing surface relationship-reasoning');
  });

  it('covers every required public surface', () => {
    expect(requiredSurfaceIds).toEqual([
      'hero',
      'expression-slice',
      'personal-chat',
      'personal-reasoning',
      'relationship-chat',
      'relationship-reasoning',
      'system-map',
      'system-reasoning',
      'comparison'
    ]);
  });
});
