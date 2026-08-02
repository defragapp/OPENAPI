import { describe, expect, it } from 'vitest';
import { evaluatePublicLandingViewport } from './PublicLandingViewportContract';
import type { PublicLandingViewportSnapshot, ViewportSurfaceMeasurement } from './PublicLandingViewportContract';

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
      surface('personal-chat', 16, 359, 1120, 510),
      surface('personal-reasoning', 16, 359, 1648, 540),
      surface('relationship-chat', 16, 359, 2380, 450),
      surface('relationship-reasoning', 16, 359, 2848, 610),
      surface('system-map', 16, 359, 3650, 760),
      surface('system-reasoning', 16, 359, 4428, 520),
      surface('comparison', 16, 359, 5140, 430)
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
      surface('personal-chat', 100, 665, 1480, 560),
      surface('personal-reasoning', 713, 1340, 1480, 610),
      surface('relationship-chat', 100, 665, 2320, 500),
      surface('relationship-reasoning', 713, 1340, 2320, 650),
      surface('system-map', 100, 665, 3220, 820),
      surface('system-reasoning', 713, 1340, 3220, 570),
      surface('comparison', 160, 1280, 4300, 520)
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

  it('rejects missing, stretched, or side-by-side workflow surfaces', () => {
    const missing = passingPhoneSnapshot();
    missing.surfaces = missing.surfaces.filter((item) => item.id !== 'relationship-reasoning');
    expect(evaluatePublicLandingViewport(missing).failures).toContain('missing surface relationship-reasoning');

    const stretched = passingPhoneSnapshot();
    const personalWorkflow = stretched.surfaces.find((item) => item.id === 'personal-reasoning')!;
    personalWorkflow.height = 2400;
    personalWorkflow.bottom = personalWorkflow.top + personalWorkflow.height;
    expect(evaluatePublicLandingViewport(stretched).failures).toContain('personal-reasoning height 2400px > 1100px');

    const sideBySide = passingPhoneSnapshot();
    const chat = sideBySide.surfaces.find((item) => item.id === 'personal-chat')!;
    const workflow = sideBySide.surfaces.find((item) => item.id === 'personal-reasoning')!;
    workflow.top = chat.top;
    workflow.bottom = workflow.top + workflow.height;
    expect(evaluatePublicLandingViewport(sideBySide).failures).toContain('personal-reasoning is not clearly stacked below personal-chat');
  });

  it('rejects collapsed or excessive heading-to-stage spacing', () => {
    const collapsed = passingPhoneSnapshot();
    collapsed.stageGaps = [8, 36, 36];
    expect(evaluatePublicLandingViewport(collapsed).failures).toContain('stage gap 1 is 8px');

    const excessive = passingDesktopSnapshot();
    excessive.stageGaps = [58, 140, 54];
    expect(evaluatePublicLandingViewport(excessive).failures).toContain('stage gap 2 is 140px');
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