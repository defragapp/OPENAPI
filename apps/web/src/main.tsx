import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AuthenticatedWorkspace } from './AuthenticatedWorkspace';
import { EmailCodeFallback, installEmailCodeFallbackRuntime } from './EmailCodeFallback';
import { ProductCompletionLayer, installProductRuntime } from './ProductCompletionLayer';
import { installBaselineInputRuntime } from './BaselineInputRuntime';
import { installDialogAccessibility } from './dialog-accessibility';
import { installPrivateAnswerExportRuntime } from './PrivateAnswerExportRuntime';
import { installProductionRuntime } from './ProductionRuntime';
import { PublicLanding } from './PublicLanding';
import { installPublicLandingViewportContract } from './PublicLandingViewportContract';
import { PublicPolicy } from './PublicPolicy';
import { PublicPolicyMetadata } from './PublicPolicyMetadata';

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

/* Shared product system, route-owned landing layout, and composition hierarchy. */
import './sovereign-cohesion.css';
import './sovereign-modern.css';
import './landing-production.css';
import './interface-composition.css';
import './premium-surfaces.css';
import './premium-surface-hardening.css';
import './selective-visual-port.css';
import './premium-platform-release.css';
import './sovereign-visual-system.css';
import './responsive-viewport-contract.css';

installProductionRuntime();
installProductRuntime();
installEmailCodeFallbackRuntime();
installBaselineInputRuntime();
installDialogAccessibility();
installPrivateAnswerExportRuntime();
installPublicLandingViewportContract();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  if (location.hostname === 'sovereign.defrag.app') {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
  } else {
    window.addEventListener('load', () => {
      void navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister()))
      );
    });
  }
}

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
            : <><App /><EmailCodeFallback /></>}
    </AppErrorBoundary>
  </React.StrictMode>
);