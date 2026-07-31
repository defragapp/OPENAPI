import { describe, expect, it } from 'vitest';
import { evaluatePublicLandingViewport } from './PublicLandingViewportContract';
import type { PublicLandingViewportSnapshot } from './PublicLandingViewportContract';

const ids = ['hero-content','baseline-artifact','personal-chat','personal-workflow','relationship-chat','relationship-workflow','system-instrument','consent'] as const;
function passingSnapshot(): PublicLandingViewportSnapshot {
  return {
    viewportWidth: 390,
    scrollWidth: 390,
    surfaces: ids.map((id) => ({ id, left: 18, right: 372, width: 354, layoutWidth: 354 })),
    stageGaps: [38, 38, 38],
    consentStacked: true
  };
}

describe('public landing rendered viewport contract', () => {
  it('accepts the component-owned phone composition', () => {
    expect(evaluatePublicLandingViewport(passingSnapshot())).toMatchObject({ ok: true, failures: [] });
  });
  it('rejects a desktop-scaled workflow', () => {
    const snapshot = passingSnapshot();
    snapshot.surfaces[2] = { id: 'personal-chat', left: 74, right: 316, width: 242, layoutWidth: 540 };
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toContain('personal-chat width');
    expect(result.failures.join(' ')).toContain('rendered scale');
  });
  it('rejects overflow and unstacked consent', () => {
    const snapshot = passingSnapshot();
    snapshot.scrollWidth = 430;
    snapshot.consentStacked = false;
    const result = evaluatePublicLandingViewport(snapshot);
    expect(result.failures).toContain('horizontal overflow 430px > 390px');
    expect(result.failures).toContain('consent section is not stacked');
  });
  it('rejects excessive heading-to-product distance', () => {
    const snapshot = passingSnapshot();
    snapshot.stageGaps[1] = 140;
    expect(evaluatePublicLandingViewport(snapshot).failures).toContain('stage gap 2 is 140px');
  });
});
