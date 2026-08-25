import { describe, expect, it } from 'vitest';
import { evaluatePublicLandingViewport } from './PublicLandingViewportContract';
import type { PublicLandingViewportSnapshot, ViewportSurfaceMeasurement } from './PublicLandingViewportContract';

const desktopRequiredSurfaceIds = [
  'hero',
  'expression-slice',
  'personal-proof',
  'relationship-chat',
  'relationship-reasoning',
  'system-map',
  'system-reasoning',
  'comparison'
] as const;

function surface(
  id: string,
  left: number,
  right: number,
  top: number,
  height: number,
  layoutWidth = right - left
): ViewportSurfaceMeasurement {
  return {
    id,
    left,
    right,
    top,
    bottom: top + height,
    width: right - left,
    height,
    layoutWidth
  };
}

function passingPhoneSnapshot(): PublicLandingViewportSnapshot {
  return {
    viewportWidth: 375,
    scrollWidth: 375,
    surfaces: [
      surface('hero', 16, 359, 0, 620),
      surface('expression-slice', 0, 375, 620, 320),
      surface('personal-proof', 16, 359, 1120, 790),
      surface('relationship-chat', 16, 359, 2120, 450),
      surface('relationship-reasoning', 16, 359, 2588, 610),
      surface('system-map', 16, 359, 3390, 760),
      surface('system-reasoning', 0, 0, 0, 0, 0),
      surface('comparison', 16, 359, 4170, 430)
    ],
    stageGaps: [42, 36, 36],
    comparisonStacked: true
  };
}

function passingDesktopSnapshot(): PublicLandingViewportSnapshot {
  return {
    viewportWidth: 1440,
    scrollWidth: 1440,
    surfaces: [
      surface('hero', 220, 1220, 0, 780),
      surface('expression-slice', 0, 1440, 780, 520),
      surface('personal-proof', 100, 1340, 1480, 830),
      surface('relationship-chat', 100, 665, 2540, 500),
      surface('relationship-reasoning', 713, 1340, 2540, 650),
      surface('system-map', 100, 820, 3440, 820),
      surface('system-reasoning', 860, 1340, 3440, 570),
      surface('comparison', 160, 1280, 4520, 520)
    ],
    stageGaps: [58, 54, 54],
    comparisonStacked: false
  };
}

describe('restored landing rendered viewport contract', () => {
  it('accepts the field and compact stacked product stages at phone width', () => {
    expect(evaluatePublicLandingViewport(passingPhoneSnapshot())).toMatchObject({ ok: true, failures: [] });
  });

  it('accepts the intended desktop composition', () => {
    expect(evaluatePublicLandingViewport(passingDesktopSnapshot())).toMatchObject({ ok: true, failures: [] });
  });

  it('allows the secondary system reasoning panel to collapse on narrow screens only', () => {
    const narrow = passingPhoneSnapshot();
    narrow.surfaces = narrow.surfaces.filter((item) => item.id !== 'system-reasoning');
    expect(evaluatePublicLandingViewport(narrow)).toMatchObject({ ok: true, failures: [] });

    const desktop = passingDesktopSnapshot();
    desktop.surfaces = desktop.surfaces.filter((item) => item.id !== 'system-reasoning');
    expect(evaluatePublicLandingViewport(desktop).failures).toContain('missing surface system-reasoning');
  });

  it('rejects a desktop-scaled expression field on a phone', () => {
    const snapshot = passingPhoneSnapshot();
    snapshot.surfaces[1] = surface('expression-slice', 72, 303, 620, 320, 520);
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

  it('rejects missing, stretched, or side-by-side required product surfaces', () => {
    const missing = passingPhoneSnapshot();
    missing.surfaces = missing.surfaces.filter((item) => item.id !== 'relationship-reasoning');
    expect(evaluatePublicLandingViewport(missing).failures).toContain('missing surface relationship-reasoning');

    const stretched = passingPhoneSnapshot();
    const selfProof = stretched.surfaces.find((item) => item.id === 'personal-proof')!;
    selfProof.height = 2400;
    selfProof.bottom = selfProof.top + selfProof.height;
    expect(evaluatePublicLandingViewport(stretched).failures).toContain('personal-proof height 2400px > 1100px');

    const sideBySide = passingPhoneSnapshot();
    const chat = sideBySide.surfaces.find((item) => item.id === 'relationship-chat')!;
    const workflow = sideBySide.surfaces.find((item) => item.id === 'relationship-reasoning')!;
    workflow.top = chat.top;
    workflow.bottom = workflow.top + workflow.height;
    expect(evaluatePublicLandingViewport(sideBySide).failures).toContain('relationship-reasoning is not clearly stacked below relationship-chat');
  });

  it('rejects collapsed or excessive heading-to-stage spacing', () => {
    const collapsed = passingPhoneSnapshot();
    collapsed.stageGaps = [8, 36, 36];
    expect(evaluatePublicLandingViewport(collapsed).failures).toContain('stage gap 1 is 8px');

    const excessive = passingDesktopSnapshot();
    excessive.stageGaps = [58, 140, 54];
    expect(evaluatePublicLandingViewport(excessive).failures).toContain('stage gap 2 is 140px');
  });

  it('covers every desktop-required public surface', () => {
    expect(desktopRequiredSurfaceIds).toEqual([
      'hero',
      'expression-slice',
      'personal-proof',
      'relationship-chat',
      'relationship-reasoning',
      'system-map',
      'system-reasoning',
      'comparison'
    ]);
  });
});
