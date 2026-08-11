import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const css = read('./production-readiness-visual-v1.css');
const runtime = read('./production-readiness-runtime.ts');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const mobileUtilities = read('./WorkspaceMobileUtilities.tsx');
const routeVerifier = read('../../../scripts/verify-live-route-cohesion.mjs');
const visualVerifier = read('../../../scripts/verify-live-visual-release-v3.mjs');
const release = read('../../../scripts/cloudflare-production-release.mjs');
const buildDiagnostics = read('../../../scripts/cloudflare-build-diagnostics.mjs');
const workerGatewaySmoke = read('../../../scripts/worker-gateway-smoke.ts');

describe('desktop and iOS production readiness v1', () => {
  it('installs the final authority after every prior platform layer', () => {
    expect(main).toContain("import { installProductionReadinessRuntime } from './production-readiness-runtime'");
    expect(main).toContain("import productionReadinessVisualCss from './production-readiness-visual-v1.css?inline'");
    expect(main).toContain('${workspaceMobileReleaseCss}\\n${productionReadinessVisualCss}');
    expect(main.indexOf('installProductionReadinessRuntime();')).toBeLessThan(main.indexOf('installReleaseInteractionRuntime();'));
    expect(main).toContain("dataset.sovereignProductionReadiness = 'desktop-ios-v1'");
  });

  it('standardizes the desktop navigation across public and account routes', () => {
    for (const marker of [
      '--production-nav-height: 80px',
      '.public-approved-v8 .v0-nav',
      '.public-secondary-page .v0-nav',
      '.account-shell .account-nav',
      '.plan-onboarding .account-nav',
      '.launch-page .launch-nav',
      'position: sticky !important',
      'min-height: 44px !important',
      'font-size: 0.82rem !important'
    ]) expect(css).toContain(marker);
  });

  it('uses a dynamic full-screen hero and keeps the field below the copy', () => {
    expect(landing).toContain('className="v0-hero sovereign-opening-field"');
    for (const marker of [
      'calc(var(--sovereign-viewport-height, 100svh) - var(--production-nav-height))',
      'padding: clamp(86px, 10vh, 128px) 24px 0',
      '.public-approved-v8 .landing-expression-slice',
      'top: auto !important',
      'height: clamp(315px, 39%, 430px)',
      'top: 100% !important',
      'width: min(1240px, 94vw)'
    ]) expect(css).toContain(marker);
  });

  it('keeps vector detail compact, endpoint anchored, and click revealed', () => {
    for (const marker of [
      'data-inspecting="true"',
      '.landing-expression-slice__tooltip-panel',
      'width: 148px !important',
      'height: 50px !important',
      '.landing-expression-slice__tooltip-connector',
      'opacity: 0 !important',
      'visibility: hidden !important'
    ]) expect(css).toContain(marker);
    for (const marker of [
      "panelWidth: '148'",
      "panelHeight: '50'",
      "titleY: '18'",
      "valueY: '34'",
      "metaY: '46'",
      "dataset.compactEndpointTooltip = 'true'"
    ]) expect(runtime).toContain(marker);
    expect(field).toContain('const tooltip = placeTooltip(selectedProjected.projected)');
    expect(field).toContain('x1={selectedProjected.projected.x}');
    expect(field).toContain('y1={selectedProjected.projected.y}');
  });

  it('uses a restrained phone scale and keeps the complete field inside the opening', () => {
    for (const marker of [
      '@media (max-width: 900px)',
      '--production-nav-height: 64px',
      'env(safe-area-inset-bottom)',
      'min-height: max(660px',
      'font-size: clamp(2.9rem, 11.2vw, 4.25rem)',
      'height: clamp(212px, 27%, 258px)',
      'width: min(660px, 165vw)',
      '@media (max-width: 430px)',
      'min-height: max(640px',
      'width: min(590px, 154vw)'
    ]) expect(css).toContain(marker);
    expect(css).not.toContain('15.2vw');
    expect(css).not.toContain('220vw');
  });

  it('organizes policy, account, onboarding, and workspace pages with one mobile hierarchy', () => {
    for (const marker of [
      '.public-secondary-page .policy-hero h1',
      'font-size: clamp(2.55rem, 9.8vw, 3.85rem)',
      '.account-shell .account-intro h1',
      'font-size: clamp(2.4rem, 9.2vw, 3.6rem)',
      '.sovereign-app-runtime .surface-heading h1',
      'font-size: clamp(2rem, 8.8vw, 2.85rem)',
      'calc(178px + env(safe-area-inset-bottom))',
      'bottom: max(8px, env(safe-area-inset-bottom))',
      'grid-template-columns: minmax(0, 1fr) 44px',
      'height: 44px !important'
    ]) expect(css).toContain(marker);
    expect(mobileUtilities).toContain('<details className="workspace-mobile-utilities">');
    expect(mobileUtilities).toContain('Workspace tools');
    expect(mobileUtilities).toContain('workspace-mobile-utilities-content');
  });

  it('keeps every public and account page inside rendered desktop and phone verification', () => {
    for (const route of [
      'how-it-works',
      'pricing',
      'faq',
      'privacy',
      'terms',
      'login',
      'signup',
      'invitation',
      'onboarding-gate',
      'workspace-gate',
      'not-found'
    ]) expect(routeVerifier).toContain(`name: '${route}'`);
    expect(routeVerifier).toContain('width: 1440, height: 900');
    expect(routeVerifier).toContain('width: 390, height: 844');
    expect(routeVerifier).toContain('audit.document.overflowX <= 1');
    expect(visualVerifier).toContain("name: 'mobile-390x844'");
    expect(visualVerifier).toContain("name: 'mobile-430x932'");
  });

  it('requires runtime, visual, product, billing, auth, and AI gates before release', () => {
    for (const marker of [
      "['verify-runtime-v3', 'scripts/verify-parent-domain-routes-v3.mjs']",
      "['verify-route-cohesion', 'scripts/verify-live-route-cohesion.mjs']",
      "['verify-rendered-visuals', 'scripts/verify-live-visual-release-v3.mjs']"
    ]) expect(release).toContain(marker);
    for (const stage of [
      'auth-smoke',
      'baseline-smoke',
      'jobs-smoke',
      'worker-gateway-smoke',
      'stripe-smoke',
      'product-smoke',
      'release-closure-smoke'
    ]) expect(buildDiagnostics).toContain(`['${stage}'`);
    expect(workerGatewaySmoke).toContain("provider=${config.provider}");
    expect(workerGatewaySmoke).toContain("contract=sovereign-answer.v2");
    expect(workerGatewaySmoke).toContain("AI_GATEWAY_ID: 'sovereign'");
  });

  it('keeps every release stylesheet structurally balanced', () => {
    expect((css.match(/{/g) ?? []).length).toBe((css.match(/}/g) ?? []).length);
    expect((runtime.match(/{/g) ?? []).length).toBe((runtime.match(/}/g) ?? []).length);
  });
});
