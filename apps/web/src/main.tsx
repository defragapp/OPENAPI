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
import { PublicHowItWorks } from './PublicHowItWorks';
import { PublicPricing } from './PublicPricing';
import { PublicFAQ } from './PublicFAQ';
import { installPublicLandingViewportContract } from './PublicLandingViewportContract';
import { installPublicRouteAuthorityRuntime } from './PublicRouteAuthorityRuntime';
import { PublicPolicy } from './PublicPolicy';
import { PublicPolicyMetadata } from './PublicPolicyMetadata';
import { installReleaseInteractionRuntime } from './release-interaction-runtime';
import { installSafetyResponseRuntime } from './SafetyResponseRuntime';
import { installV0ReleaseFingerprint } from './v0-release-fingerprint';
import { PowderDemo } from './PowderDemo';

/* Canonical visual system */
import './design-system.css';
import './public.css';
import './workspace.css';
import './app-shell.css';
import './powder.css';
/* Passkey authentication remains the final component stylesheet. */
import './passkey-auth.css';

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
document.documentElement.dataset.sovereignProductStories = 'isolated-mobile-first-v2';
document.documentElement.dataset.sovereignMotionRelease = 'v0-motion-workflows-v8';
document.documentElement.dataset.sovereignPlatformCohesion = 'v1';
document.documentElement.dataset.sovereignProductionReadiness = 'desktop-ios-v1';
document.documentElement.dataset.sovereignHeroComposition = 'v3-bounded';
document.documentElement.dataset.sovereignVisualAuthority = 'production-v1';

const isPublicHome = location.pathname === '/';
const publicPolicyKind = location.pathname === '/privacy'
  ? 'privacy'
  : location.pathname === '/terms'
    ? 'terms'
    : null;
const isStaticPublicPage = ['/how-it-works', '/pricing', '/faq'].includes(location.pathname);
const isPowderDemo = location.pathname === '/demo' || location.pathname === '/powder';
const isDirectPublicSurface = isPublicHome || publicPolicyKind !== null || isStaticPublicPage || isPowderDemo;
const isAuthenticatedWorkspace = location.pathname === '/app' || location.pathname.startsWith('/app/');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      {!isDirectPublicSurface && <ProductCompletionLayer />}
      {isPowderDemo
        ? <PowderDemo />
        : isPublicHome
        ? <PublicLanding />
        : publicPolicyKind
          ? <><PublicPolicyMetadata kind={publicPolicyKind} /><PublicPolicy kind={publicPolicyKind} /></>
          : isStaticPublicPage
            ? (location.pathname === '/how-it-works' ? <PublicHowItWorks /> : location.pathname === '/pricing' ? <PublicPricing /> : <PublicFAQ />)
            : isAuthenticatedWorkspace
              ? <AuthenticatedWorkspace />
              : <><App /><EmailCodeFallback /><PasskeyAuthentication /></>}
    </AppErrorBoundary>
  </React.StrictMode>
);

installPublicLandingViewportContract();