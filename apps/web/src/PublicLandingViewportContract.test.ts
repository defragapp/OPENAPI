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

function passingPhoneSnapshot(): PublicLandingViewportSnapshot {
  return {
    viewportWidth: 375,
    scrollWidth: 375,
    surfaces: surfaceIds.map((id) => ({ id, left: 16, right: 359, width: 343, layoutWidth: 343 })),
    stageGaps: [42, 42, 42],
    comparisonStacked: true
  };
}

function passingDesktopSnapshot(): PublicLandingViewportSnapshot {
  return {
    viewportWidth: 1440,
    scrollWidth: 1440,
    surfaces: [
      { id: 'hero', left: 220, right: 1220, width: 1000, layoutWidth: 1000 },
      { id: 'personal-chat', left: 130, right: 710, width: 580, layoutWidth: 580 },
      { id: 'personal-reasoning', left: 730, right: 1310, width: 580, layoutWidth: 580 },
      { id: 'relationship-chat', left: 130, right: 710, width: 580, layoutWidth: 580 },
      { id: 'relationship-reasoning', left: 730, right: 1310, width: 580, layoutWidth: 580 },
      { id: 'system-map', left: 290, right: 1150, width: 860, layoutWidth: 860 },
      { id: 'comparison', left: 130, right: 1310, width: 1180, layoutWidth: 1180 }
    ],
    stageGaps: [58, 58, 58],
    comparisonStacked: false
  };
}

describe('founder v0 landing rendered viewport contract', () => {
  it('accepts full-width v0 workflow surfaces at phone width', () => {
    expect(evaluatePublicLandingViewport(passingPhoneSnapshot())).toMatchObject({ ok: true, failures: [] });
  });

  it('accepts the intended two-column desktop composition', () => {
    expect(evaluatePublicLandingViewport(passingDesktopSnapshot())).toMatchObject({ ok: true, failures: [] });
  });

  it('rejects a desktop-scaled product demonstration on a phone', () => {
    const snapshot = passingPhoneSnapshot();
    snapshot.surfaces[1] = { id: 'personal-chat', left: 72, right: 303, width: 231, layoutWidth: 520 };
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toContain('personal-chat width');
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

  it('rejects excessive space between a v0 story heading and product stage', () => {
    const snapshot = passingPhoneSnapshot();
    snapshot.stageGaps[1] = 144;
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.ok).toBe(false);
    expect(result.failures).toContain('stage gap 2 is 144px');
  });
});
