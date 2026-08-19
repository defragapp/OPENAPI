import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AuthenticatedWorkspace } from './AuthenticatedWorkspace';
import { EmailCodeFallback, installEmailCodeFallbackRuntime } from './EmailCodeFallback';
import { PasskeyAuthentication } from './PasskeyAuthentication';
import { ProductCompletionLayer, installProductRuntime } from './ProductCompletionLayer';
import { installBaselineInputRuntime } from './BaselineInputRuntime';
import { installDialogAccessibility } from './dialog-accessibility';
import { installPrivateAnswerExportRuntime } from './PrivateAnswerExportRuntime';
import { installProductionReadinessRuntime } from './production-readiness-runtime';
import { installProductionRuntime } from './ProductionRuntime';
import { PublicLanding } from './PublicLanding';
import { installPublicLandingViewportContract } from './PublicLandingViewportContract';
import { installPublicRouteAuthorityRuntime } from './PublicRouteAuthorityRuntime';
import { PublicPolicy } from './PublicPolicy';
import { PublicPolicyMetadata } from './PublicPolicyMetadata';
import { installReleaseInteractionRuntime } from './release-interaction-runtime';
import { installSafetyResponseRuntime } from './SafetyResponseRuntime';
import { installV0ReleaseFingerprint } from './v0-release-fingerprint';
import platformVisualCohesionCss from './platform-visual-cohesion-v1.css?inline';
import sitewideCohesionRefinementCss from './sitewide-cohesion-refinement-v2.css?inline';
import workspaceMobileReleaseCss from './workspace-mobile-release-v3.css?inline';
import productionReadinessVisualCss from './production-readiness-visual-v1.css?inline';
import publicLandingFinalAuthorityCss from './public-landing-final-authority.css?inline';
import experienceRefinementCss from './experience-refinement-v1.css?inline';
import renderedFidelityCss from './rendered-fidelity-v1.css?inline';
import landingRefinementV2Css from './landing-refinement-v2.css?inline';
import landingLiveRefinementV3Css from './landing-live-refinement-v3.css?inline';
import landingLiveRefinementV4Css from './landing-live-refinement-v4.css?inline';
import landingLiveRefinementV5Css from './landing-live-refinement-v5.css?inline';
import invitationRenderedFidelityCss from './invitation-rendered-fidelity-v1.css?inline';
import workspaceProductionRefinementCss from './workspace-production-refinement-v1.css?inline';
import authenticatedLaunchCohesionCss from './authenticated-launch-cohesion-v1.css?inline';
import premiumActionAuthorityCss from './premium-action-authority-v1.css?inline';
import sansTypographyAuthorityCss from './sans-typography-authority-v1.css?inline';
import productionProductCohesionCss from './production-product-cohesion-v1.css?inline';
import publicIntelligenceDemonstrationCss from './public-intelligence-demonstration-v1.css?inline';
import productionVisualAuthorityCss from './production-visual-authority-v1.css?inline';
import seniorDesignSystemCss from './senior-design-system-v1.css?inline';
import publicIntelligenceDemonstrationV2Css from './public-intelligence-demonstration-v2.css?inline';

/* Component foundations */
import './styles.css';
import './product-completion.css';
import './public-landing.css';
import './public-release.css';
import './workspace-chat.css';
import './workspace-mobile.css';
import './system-membership.css';
import './auth-onboarding.css';
import './email-code-fallback.css';
import './unified-entry.css';
import './account-control.css';
import './safety-response-runtime.css';

/* Existing production product surfaces and behavior. */
import './sovereign-cohesion.css';
import './sovereign-modern.css';
import './landing-production.css';
import './interface-composition.css';
import './premium-surfaces.css';
import './premium-surface-hardening.css';
import './selective-visual-port.css';
import './premium-platform-release.css';
import './sovereign-visual-system.css';
import './typography-system.css';
import './expression-field/expression-field.css';
import './expression-field/expression-field-precision.css';
import './responsive-viewport-contract.css';
import './public-landing-editorial.css';

/* Founder v0 foundation and integrated Expression Field. */
import './v0-platform-port.css';
import './v0-motion-accessibility.css';
import './v0-visual-port.css';
import './v0-global-experience.css';
import './v0-landing-refinement.css';
import './v0-single-example-release.css';
import './emergency-public-removal.css';
import './landing-expression-field-v3.css';
import './landing-expression-field-integration.css';
import './v0-restored-product-stories.css';
import './landing-product-stories-v2.css';

/* Public component language, interaction details, iOS behavior, secondary surfaces, account journey, then passkey authority. */
import './public-landing-approved-v8.css';
import './landing-hero-field-v4.css';
import './landing-ios-parity-density-v1.css';
import './public-secondary-pages-locked.css';
import './account-journey.css';
import './account-journey-structured.css';
import './account-journey-release-cohesion.css';
import './deployed-route-cohesion.css';
/* Passkey authentication remains the final component stylesheet; terminal inline release authorities follow below. */
import './passkey-auth.css';

function installPlatformVisualCohesion(): void {
  if (document.head.querySelector('style[data-sovereign-platform-cohesion="v1"]')) return;
  const style = document.createElement('style');
  style.dataset.sovereignPlatformCohesion = 'v1';
  style.textContent = `${platformVisualCohesionCss}\n${sitewideCohesionRefinementCss}\n${workspaceMobileReleaseCss}\n${productionReadinessVisualCss}\n${publicLandingFinalAuthorityCss}`;
  style.textContent += `\n${experienceRefinementCss}`;
  style.textContent += `\n${renderedFidelityCss}`;
  style.textContent += `\n${landingRefinementV2Css}`;
  style.textContent += `\n${landingLiveRefinementV3Css}`;
  style.textContent += `\n${landingLiveRefinementV4Css}`;
  style.textContent += `\n${landingLiveRefinementV5Css}`;
  style.textContent += `\n${invitationRenderedFidelityCss}`;
  style.textContent += `\n${workspaceProductionRefinementCss}`;
  style.textContent += `\n${premiumActionAuthorityCss}`;
  style.textContent += `\n${authenticatedLaunchCohesionCss}`;
  style.textContent += `\n${sansTypographyAuthorityCss}`;
  style.textContent += `\n${productionProductCohesionCss}`;
  style.textContent += `\n${publicIntelligenceDemonstrationCss}`;
  style.textContent += `\n${productionVisualAuthorityCss}`;
  style.textContent += `\n${seniorDesignSystemCss}`;
  style.textContent += `\n${publicIntelligenceDemonstrationV2Css}`;
  document.head.append(style);
}

installPlatformVisualCohesion();
installProductionReadinessRuntime();
installReleaseInteractionRuntime();
installV0ReleaseFingerprint();
installProductionRuntime();
installProductRuntime();
installEmailCodeFallbackRuntime();
installBaselineInputRuntime();
installPublicRouteAuthorityRuntime();
installDialogAccessibility();
installPrivateAnswerExportRuntime();
installSafetyResponseRuntime();

function retireLegacyPublicCache(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    void (async () => {
      const controlled = Boolean(navigator.serviceWorker.controller);
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ('caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith('sovereign-public'))
            .map((key) => window.caches.delete(key))
        );
      }

      if (controlled && window.sessionStorage.getItem('sovereign-public-cache-retired') !== 'true') {
        window.sessionStorage.setItem('sovereign-public-cache-retired', 'true');
        window.location.reload();
      }
    })().catch(() => undefined);
  });
}

function refreshStaleIosPageRestore(): void {
  if (!import.meta.env.PROD) return;

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) window.location.reload();
  });
}

function installMobileViewportStability(): void {
  let frame = 0;

  const syncViewport = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      const viewport = window.visualViewport;
      const width = Math.round(viewport?.width || window.innerWidth);
      const height = Math.round(viewport?.height || window.innerHeight);
      document.documentElement.style.setProperty('--sovereign-viewport-height', `${height}px`);
      document.documentElement.style.setProperty('--sovereign-viewport-width', `${width}px`);
      document.documentElement.dataset.sovereignOrientation = width > height ? 'landscape' : 'portrait';
    });
  };

  syncViewport();
  window.addEventListener('resize', syncViewport, { passive: true });
  window.addEventListener('orientationchange', syncViewport, { passive: true });
  window.addEventListener('pageshow', syncViewport, { passive: true });
  window.visualViewport?.addEventListener('resize', syncViewport, { passive: true });
  window.visualViewport?.addEventListener('scroll', syncViewport, { passive: true });
}

retireLegacyPublicCache();
refreshStaleIosPageRestore();
installMobileViewportStability();

document.documentElement.dataset.sovereignLayoutRelease = 'approved-public-v8';
document.documentElement.dataset.sovereignProductStories = 'text-first-intelligence-v2';
document.documentElement.dataset.sovereignMotionRelease = 'v0-motion-workflows-v8';
document.documentElement.dataset.sovereignPlatformCohesion = 'v1';
document.documentElement.dataset.sovereignProductionReadiness = 'desktop-ios-v1';
document.documentElement.dataset.sovereignHeroComposition = 'v3-bounded';
document.documentElement.dataset.sovereignVisualAuthority = 'senior-design-system-v1';
document.documentElement.dataset.sovereignPublicDemoAuthority = 'text-first-v2';

const isPublicHome = location.pathname === '/';
const publicPolicyKind = location.pathname === '/privacy'
  ? 'privacy'
  : location.pathname === '/terms'
    ? 'terms'
    : null;
const isDirectPublicSurface = isPublicHome || publicPolicyKind !== null;
const isAuthenticatedWorkspace = location.pathname === '/app' || location.pathname.startsWith('/app/');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      {!isDirectPublicSurface && <ProductCompletionLayer />}
      {isPublicHome
        ? <PublicLanding />
        : publicPolicyKind
          ? <><PublicPolicyMetadata kind={publicPolicyKind} /><PublicPolicy kind={publicPolicyKind} /></>
          : isAuthenticatedWorkspace
            ? <AuthenticatedWorkspace />
            : <><App /><EmailCodeFallback /><PasskeyAuthentication /></>}
    </AppErrorBoundary>
  </React.StrictMode>
);

installPublicLandingViewportContract();