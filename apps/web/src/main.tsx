import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AccountControlCenter } from './AccountControlCenter';
import { ProductCompletionLayer, installProductRuntime } from './ProductCompletionLayer';
import { installBaselineInputRuntime } from './BaselineInputRuntime';
import { installDialogAccessibility } from './dialog-accessibility';
import { installProductionRuntime } from './ProductionRuntime';
import { PublicLanding } from './PublicLanding';
import { PublicPolicy } from './PublicPolicy';
import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace';
import { StructuredIntelligenceLayer, installStructuredIntelligenceRuntime } from './StructuredIntelligenceLayer';
import { SystemMembershipManager } from './SystemMembershipManager';
import './styles.css';
import './product-completion.css';
import './public-landing.css';
import './public-release.css';
import './production-polish.css';
import './baseline-orbit.css';
import './workspace-chat.css';
import './visual-intelligence.css';
import './system-membership.css';
import './auth-polish.css';
import './unified-entry.css';
import './account-control.css';
import './structured-intelligence.css';
import './sovereign-brand.css';

installProductionRuntime();
installProductRuntime();
installStructuredIntelligenceRuntime();
installBaselineInputRuntime();
installDialogAccessibility();

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
          ? <PublicPolicy kind={publicPolicyKind} />
          : isAuthenticatedWorkspace
            ? <><SovereignIntelligenceWorkspace /><StructuredIntelligenceLayer /><AccountControlCenter /><SystemMembershipManager /></>
            : <App />}
    </AppErrorBoundary>
  </React.StrictMode>
);
