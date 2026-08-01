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
import { installProductionRuntime } from './ProductionRuntime';
import { PublicLanding } from './PublicLanding';
import { installPublicLandingViewportContract } from './PublicLandingViewportContract';
import { PublicPolicy } from './PublicPolicy';
import { PublicPolicyMetadata } from './PublicPolicyMetadata';
import { installSafetyResponseRuntime } from './SafetyResponseRuntime';
import { installV0ReleaseFingerprint } from './v0-release-fingerprint';

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
import './responsive-viewport-contract.css';
import './public-landing-editorial.css';

/* Founder v0 foundation, global product authority, then passkey-specific final authority. */
import './v0-platform-port.css';
import './v0-motion-accessibility.css';
import './v0-visual-port.css';
import './v0-global-experience.css';
import './passkey-auth.css';

installV0ReleaseFingerprint();
installProductionRuntime();
installProductRuntime();
installEmailCodeFallbackRuntime();
installBaselineInputRuntime();
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

retireLegacyPublicCache();

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
