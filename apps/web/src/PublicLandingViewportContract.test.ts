import { describe, expect, it } from 'vitest';
import { evaluatePublicLandingViewport } from './PublicLandingViewportContract';
import type { PublicLandingViewportSnapshot, ViewportSurfaceMeasurement } from './PublicLandingViewportContract';

const desktopRequiredSurfaceIds = [
  'hero',
  'expression-slice',
  'demo-card',
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
  } as ViewportSurfaceMeasurement;
}

function passingPhoneSnapshot(): PublicLandingViewportSnapshot {
  return {
    viewportWidth: 375,
    scrollWidth: 375,
    surfaces: [
      surface('hero', 16, 359, 0, 620),
      surface('expression-slice', 0, 375, 620, 320),
      surface('demo-card', 16, 359, 1120, 800),
      surface('comparison', 16, 359, 2120, 430)
    ],
    stageGaps: [42, 36],
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
      surface('demo-card', 100, 1340, 1480, 800),
      surface('comparison', 160, 1280, 2480, 520)
    ],
    stageGaps: [58, 54],
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

  it('allows the demo card to collapse on narrow screens only', () => {
    const narrow = passingPhoneSnapshot();
    narrow.surfaces = narrow.surfaces.filter((item) => item.id !== 'demo-card');
    narrow.stageGaps = [42, 36];
    expect(evaluatePublicLandingViewport(narrow)).toMatchObject({ ok: true, failures: [] });

    const desktop = passingDesktopSnapshot();
    desktop.surfaces = desktop.surfaces.filter((item) => item.id !== 'demo-card');
    expect(evaluatePublicLandingViewport(desktop).failures).toContain('missing surface demo-card');
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

  it('rejects missing, stretched, or side-by-side required surfaces', () => {
    const missing = passingPhoneSnapshot();
    missing.surfaces = missing.surfaces.filter((item) => item.id !== 'comparison');
    expect(evaluatePublicLandingViewport(missing).failures).toContain('missing surface comparison');

    const stretched = passingPhoneSnapshot();
    const demoCardIdx = stretched.surfaces.findIndex((item) => item.id === 'demo-card');
    const stretchedDemoCard = stretched.surfaces[demoCardIdx]!;
    stretched.surfaces[demoCardIdx] = {
      ...stretchedDemoCard,
      height: 2400,
      bottom: stretchedDemoCard.top + 2400
    } as ViewportSurfaceMeasurement;
    expect(evaluatePublicLandingViewport(stretched).failures).toContain('demo-card height 2400px > 1100px');

    const sideBySide = passingPhoneSnapshot();
    const hero = sideBySide.surfaces.find((item) => item.id === 'hero')!;
    const demoIdx = sideBySide.surfaces.findIndex((item) => item.id === 'demo-card');
    const sideBySideDemoCard = sideBySide.surfaces[demoIdx]!;
    sideBySide.surfaces[demoIdx] = {
      ...sideBySideDemoCard,
      top: hero.top,
      bottom: hero.top + sideBySideDemoCard.height
    } as ViewportSurfaceMeasurement;
    expect(evaluatePublicLandingViewport(sideBySide).failures).toContain('demo-card is not clearly stacked below hero');
  });

  it('rejects collapsed or excessive heading-to-stage spacing', () => {
    const collapsed = passingPhoneSnapshot();
    collapsed.stageGaps = [8, 36];
    expect(evaluatePublicLandingViewport(collapsed).failures).toContain('stage gap 1 is 8px');

    const excessive = passingDesktopSnapshot();
    excessive.stageGaps = [58, 140];
    expect(evaluatePublicLandingViewport(excessive).failures).toContain('stage gap 2 is 140px');
  });

  it('covers every desktop-required public surface', () => {
    expect(desktopRequiredSurfaceIds).toEqual([
      'hero',
      'expression-slice',
      'demo-card',
      'comparison'
    ]);
  });
});