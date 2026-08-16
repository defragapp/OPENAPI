import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const main = read('./main.tsx');
const reactAuthority = read('./deployed-route-cohesion.css');
const platformAuthority = read('./platform-visual-cohesion-v1.css');
const mobileRelease = read('./workspace-mobile-release-v3.css');
const productionReadiness = read('./production-readiness-visual-v1.css');
const refinementAuthority = read('./experience-refinement-v1.css');
const workspaceAuthorities = [reactAuthority, platformAuthority, mobileRelease, productionReadiness, refinementAuthority].join('\n');
const finalLandingAuthority = read('./public-landing-final-authority.css');
const mobileUtilities = read('./WorkspaceMobileUtilities.tsx');
const staticAuthority = read('../public/deployed-route-cohesion.css');
const staticRefinement = read('../public/experience-static-refinement-v1.css');
const howItWorks = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const faq = read('../public/faq.html');
const policy = read('./PublicPolicy.tsx');
const app = read('./App.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const authenticatedWorkspace = read('./AuthenticatedWorkspace.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const routeVerifier = read('../../../scripts/verify-live-route-cohesion.mjs');
const secondaryVerifier = read('../../../scripts/verify-live-secondary-public.mjs');
const productionRelease = read('../../../scripts/cloudflare-production-release.mjs');
const packageJson = JSON.parse(read('../../../package.json')) as { scripts?: Record<string, string> };

const staticPages = [
  ['How it works', howItWorks],
  ['Pricing', pricing],
  ['FAQ', faq]
] as const;

describe('deployed route cohesion', () => {
  it('keeps the certified foundation and appends one final experience authority', () => {
    const passkeyMarker = "import './passkey-auth.css';";
    const passkey = main.indexOf(passkeyMarker);
    const cohesion = main.indexOf("import './deployed-route-cohesion.css';");
    expect(cohesion).toBeGreaterThan(-1);
    expect(passkey).toBeGreaterThan(cohesion);
    expect(main.slice(passkey + passkeyMarker.length)).not.toContain("import './");
    expect(main).toContain("import platformVisualCohesionCss from './platform-visual-cohesion-v1.css?inline'");
    expect(main).toContain("import sitewideCohesionRefinementCss from './sitewide-cohesion-refinement-v2.css?inline'");
    expect(main).toContain("import workspaceMobileReleaseCss from './workspace-mobile-release-v3.css?inline'");
    expect(main).toContain("import productionReadinessVisualCss from './production-readiness-visual-v1.css?inline'");
    expect(main).toContain("import publicLandingFinalAuthorityCss from './public-landing-final-authority.css?inline'");
    expect(main).toContain("import experienceRefinementCss from './experience-refinement-v1.css?inline'");
    expect(main).toContain('function installPlatformVisualCohesion(): void');
    expect(main).toContain("style.dataset.sovereignPlatformCohesion = 'v1'");
    expect(main).toContain('style.textContent = `${platformVisualCohesionCss}\\n${sitewideCohesionRefinementCss}\\n${workspaceMobileReleaseCss}\\n${productionReadinessVisualCss}\\n${publicLandingFinalAuthorityCss}`');
    expect(main).toContain('style.textContent += `\\n${experienceRefinementCss}`');
    expect(main).toContain('document.head.append(style)');
    expect(main).not.toContain('platformVisualCohesionUrl');
    expect(main).not.toContain("link.rel = 'stylesheet'");
    expect(main).not.toContain('heroCompositionReleaseCss');
    expect(main.indexOf('installPlatformVisualCohesion();')).toBeLessThan(main.indexOf('installV0ReleaseFingerprint();'));
    expect(main).toContain("dataset.sovereignPlatformCohesion = 'v1'");
    expect(main).toContain("dataset.sovereignProductionReadiness = 'desktop-ios-v1'");
    expect(main).toContain("dataset.sovereignHeroComposition = 'v3-bounded'");
    expect(productionReadiness).toContain('--production-nav-height: 80px');
    expect(productionReadiness).toContain('calc(var(--sovereign-viewport-height, 100svh) - var(--production-nav-height))');
    expect(finalLandingAuthority).toContain('max-height: 920px !important');
    expect(finalLandingAuthority).toContain('height: 420px !important');
    expect(finalLandingAuthority).toContain('width: min(1260px, 94vw) !important');
    expect(finalLandingAuthority).toContain('padding: 108px 0 116px !important');
    expect(finalLandingAuthority).toContain('grid-template-columns: repeat(2, minmax(0, 1fr)) !important');
    expect(finalLandingAuthority).not.toContain('width: min(1480px, 118vw)');
    expect(refinementAuthority).toContain('--landing-blue: #e8ddd0 !important');
    expect(refinementAuthority).toContain('--route-blue: #e8ddd0 !important');
  });

  it('keeps the frozen landing outside both non-landing foundation authorities', () => {
    for (const authority of [reactAuthority, platformAuthority]) {
      expect(authority).toContain('.account-shell');
      expect(authority).toContain('.plan-onboarding');
      expect(authority).toContain('.invitation-shell');
      expect(authority).toContain('.public-not-found');
      expect(authority).toContain('.private-route-gate');
      expect(authority).toContain('.public-secondary-page');
      expect(authority).toContain('.sovereign-app-runtime');
      expect(authority).not.toContain('.public-approved-v8 .v0-hero');
      expect(authority).not.toContain('.landing-story--personal');
      expect(authority).not.toContain('.landing-story--relationship');
      expect(authority).not.toContain('.landing-story--system');
    }
  });

  it('preserves route foundation tokens while the final authority neutralizes the blue accent', () => {
    for (const marker of [
      '--route-page: #090b0e',
      '--route-ink: #f1e9de',
      '--route-blue: #2f93ff',
      '--route-blue-bright: #78c7ff',
      '--route-shell: min(1120px',
      'font-family: var(--font-display',
      '.account-layout',
      '.plan-layout',
      '.public-secondary-page .policy-grid',
      '.sovereign-app-runtime .intelligence-topbar h1',
      '@media (max-width: 650px)'
    ]) {
      expect(reactAuthority).toContain(marker);
    }
    expect(refinementAuthority).toContain('--route-blue: #e8ddd0 !important');
    expect(refinementAuthority).toContain('--route-blue-bright: #fffaf3 !important');
    expect(staticRefinement).toContain('--v0-blue: #e8ddd0');
    expect(staticRefinement).toContain('--v0-blue-bright: #fffaf3');
  });

  it('styles the actual mounted single-room workspace at desktop and iPhone widths', () => {
    for (const mountedClass of [
      'intelligence-sidebar',
      'intelligence-main',
      'intelligence-topbar',
      'intelligence-scroll',
      'surface-heading',
      'baseline-preparing',
      'today-facet-view',
      'today-steady',
      'today-current',
      'explore-home',
      'account-settings-index',
      'sovereign-composer',
      'intelligence-context'
    ]) {
      expect(workspace).toContain(mountedClass);
      expect(workspaceAuthorities).toContain(`.${mountedClass}`);
    }
    for (const retiredClass of ['today-insight-lines', 'explore-mode-list', 'mobile-bottom-nav', 'account-summary']) {
      expect(workspace).not.toContain(retiredClass);
      expect(reactAuthority).not.toContain(retiredClass);
    }
    expect(platformAuthority).toContain('sovereign-platform-cohesion-v1');
    expect(platformAuthority).toContain('@media (max-width: 820px)');
    expect(platformAuthority).toContain('@media (max-width: 560px)');
    expect(platformAuthority).toContain('env(safe-area-inset-bottom)');
    expect(platformAuthority).toContain('width: 44px');
    expect(platformAuthority).toContain('height: 44px');
    expect(platformAuthority).toContain('@media (prefers-reduced-motion: reduce)');
    expect(refinementAuthority).toContain('.sovereign-app-runtime .sovereign-composer');
    expect(refinementAuthority).toContain('.sovereign-app-runtime .intelligence-sidebar nav > button.active::before');
  });

  it('collapses mobile utility overlays into one closed context sheet and compact composer', () => {
    expect(authenticatedWorkspace).toContain('className="workspace-desktop-plan-status"');
    expect(authenticatedWorkspace).toContain('<WorkspaceMobileUtilities />');
    expect(mobileUtilities).toContain('createPortal');
    expect(mobileUtilities).toContain('<VerifiedPlanStatus expanded />');
    expect(mobileUtilities).toContain('Expression Field');
    expect(mobileUtilities).toContain('System members');
    expect(mobileUtilities).toContain('Account & Library');
    expect(mobileRelease).toContain('.workspace-desktop-plan-status');
    expect(mobileRelease).toContain('.expression-field-launcher');
    expect(mobileRelease).toContain('.system-membership-trigger');
    expect(mobileRelease).toContain('display: none !important');
    expect(mobileRelease).toContain('.composer-context-line');
    expect(mobileRelease).toContain('grid-template-columns: minmax(0, 1fr) 48px');
    expect(mobileRelease).toContain('visibility: hidden !important');
    expect(mobileRelease).toContain('.intelligence-workspace.context-open .intelligence-context');
    expect(reactAuthority).toContain('.explore-home');
    expect(reactAuthority).toContain('.composer-example');
    expect(productionReadiness).toContain('calc(178px + env(safe-area-inset-bottom))');
    expect(productionReadiness).toContain('bottom: max(8px, env(safe-area-inset-bottom))');
    expect(mobileRelease).not.toContain('.explore-mode-list');
  });

  it.each(staticPages)('%s loads the static refinement after route cohesion', (_label, document) => {
    expect(document).toContain('data-route-cohesion="v1"');
    expect(document).toContain('/deployed-route-cohesion.css?v=20260803-route-v1');
    expect(document).toContain('/experience-static-refinement-v1.css?v=20260816-refinement-v1');
    expect(document.indexOf('/deployed-route-cohesion.css')).toBeGreaterThan(document.indexOf('/v0-public-static.css'));
    expect(document.indexOf('/experience-static-refinement-v1.css')).toBeGreaterThan(document.indexOf('/deployed-route-cohesion.css'));
  });

  it('organizes each static page for its actual content instead of using one generic grid', () => {
    expect(staticAuthority).toContain('body.how-page .journey-steps');
    expect(staticAuthority).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(staticAuthority).toContain('body.pricing-page .price-card');
    expect(staticAuthority).toContain('body.pricing-page .plan-comparison-list > div');
    expect(staticAuthority).toContain('body.questions-page .faq-section');
    expect(staticAuthority).toContain('body.questions-page .faq-list summary');
    expect(staticAuthority).toContain('@media (max-width: 650px)');
    expect(staticRefinement).toContain('body.how-page .worlds-aperture img');
    expect(staticRefinement).toContain('filter: saturate(0.18)');
  });

  it('covers the real deployed React route roots', () => {
    expect(policy).toContain('public-secondary-page');
    expect(app).toContain('className="account-shell"');
    expect(app).toContain('className="account-shell invitation-shell"');
    expect(app).toContain('className="public-not-found"');
    expect(onboarding).toContain('className="plan-onboarding"');
    expect(authenticatedWorkspace).toContain('className="private-route-gate"');
    expect(authenticatedWorkspace).toContain('className="sovereign-app-runtime"');
    expect(refinementAuthority).toContain(':where(.plan-onboarding, .public-secondary-page, .public-not-found, .private-route-gate)');
  });

  it('audits every deployed page family at rendered desktop and phone widths', () => {
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
    ]) {
      expect(routeVerifier).toContain(`name: '${route}'`);
    }
    expect(routeVerifier).toContain('width: 1440, height: 900');
    expect(routeVerifier).toContain('width: 390, height: 844');
    expect(routeVerifier).toContain('bodyCopyPresent');
    expect(routeVerifier).toContain("includes('Sovereign Display')");
    expect(routeVerifier).toContain('paragraphSize >= 14');
    expect(routeVerifier).toContain('paragraphLineHeight >= audit.typography.paragraphSize * 1.42');
    expect(routeVerifier).toContain('overflowX <= 1');
  });

  it('makes both fast and rendered route verification production-authoritative', () => {
    expect(secondaryVerifier).toContain("const routeCssPath = '/deployed-route-cohesion.css?v=20260803-route-v1'");
    expect(secondaryVerifier).toContain("const refinementCssPath = '/experience-static-refinement-v1.css?v=20260816-refinement-v1'");
    expect(secondaryVerifier).toContain('data-route-cohesion="v1"');
    expect(secondaryVerifier).toContain('body.how-page .journey-steps');
    expect(secondaryVerifier).toContain('body.pricing-page .price-card');
    expect(secondaryVerifier).toContain('body.questions-page .faq-section');
    expect(secondaryVerifier).toContain('--refine-paper:#e8ddd0');
    expect(productionRelease).toContain("['verify-route-cohesion', 'scripts/verify-live-route-cohesion.mjs']");
    expect(packageJson.scripts?.['verify:live-route-cohesion']).toBe('node scripts/verify-live-route-cohesion.mjs');
  });
});
