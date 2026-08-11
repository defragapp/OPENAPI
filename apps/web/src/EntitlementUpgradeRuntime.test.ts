import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');
const layer = read('./ProductCompletionLayer.tsx');
const routeAuthority = read('./PublicRouteAuthorityRuntime.ts');
const main = read('./main.tsx');
const entitlements = read('../../sovereign-worker/src/db/entitlements.ts');

describe('visible entitlement handoff', () => {
  it('keeps server-side feature denial authoritative', () => {
    expect(entitlements).toContain('throw Response.json({');
    expect(entitlements).toContain("error: 'entitlement_required'");
    expect(entitlements).toContain("nextAction: 'review_plan'");
    expect(entitlements).toContain("'cache-control': 'private, no-store'");
    expect(layer).toContain("response.status === 403");
    expect(layer).toContain('inspectEntitlementResponse(response.clone(), path)');
    expect(layer).toContain('/feature unavailable|plan required|upgrade/i');
  });

  it('maps each advertised paid capability to a clear Sovereign+ explanation', () => {
    for (const feature of ['people', 'systems', 'library', 'covenant']) {
      expect(layer).toContain(`${feature}: {`);
    }
    expect(layer).toContain("window.dispatchEvent(new CustomEvent<PlanNotice>('sovereign:plan-required'");
    expect(layer).toContain('Review Sovereign+ plans');
    expect(layer).toContain('Continue with Free');
    expect(layer).toContain('Free remains available for your Baseline, Today, and personal Explore questions.');
  });

  it('routes authenticated upgrade handoffs to the public pricing authority', () => {
    expect(routeAuthority).toContain("const PUBLIC_ORIGIN = 'https://sovereign.defrag.app'");
    expect(routeAuthority).toContain("a[href=\"/pricing\"]");
    expect(routeAuthority).toContain('anchor.href = `${PUBLIC_ORIGIN}/pricing`');
    expect(main).toContain("import { installPublicRouteAuthorityRuntime } from './PublicRouteAuthorityRuntime'");
    expect(main).toContain('installPublicRouteAuthorityRuntime();');
  });

  it('turns free-plan rejected control actions into a handled user journey', () => {
    expect(layer).toContain("window.addEventListener('unhandledrejection'");
    expect(layer).toContain('event.preventDefault();');
    expect(layer).toContain("/turn limit|monthly.*limit/i");
    expect(layer).toContain("Sovereign+ includes 300 AI turns each month.");
  });
});
