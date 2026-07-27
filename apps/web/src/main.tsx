import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import { ProductCompletionLayer, installProductRuntime } from './ProductCompletionLayer';
import { installBaselineInputRuntime } from './BaselineInputRuntime';
import { installProductionRuntime } from './ProductionRuntime';
import { installReleaseRuntime } from './ReleaseRuntime';
import { PublicLanding } from './PublicLanding';
import { PublicPolicy } from './PublicPolicy';
import { ReleaseAccountPage } from './ReleaseAccountPage';
import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace';
import { SystemMembershipManager } from './SystemMembershipManager';
import './styles.css';
import './product-completion.css';
import './public-landing.css';
import './production-polish.css';
import './baseline-orbit.css';
import './workspace-chat.css';
import './visual-intelligence.css';
import './system-membership.css';
import './release-remediation.css';

installProductionRuntime();
installReleaseRuntime();
installProductRuntime();
installBaselineInputRuntime();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  if (location.hostname === 'sovereign.defrag.app') {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
  } else {
    window.addEventListener('load', () => {
      void navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())));
    });
  }
}

const isPublicHome = location.pathname === '/';
const publicPolicyKind = location.pathname === '/privacy' ? 'privacy' : location.pathname === '/terms' ? 'terms' : null;
const isDirectPublicSurface = isPublicHome || publicPolicyKind !== null;
const isAuthenticatedWorkspace = location.pathname === '/app' || location.pathname.startsWith('/app/');
const accountMode = location.pathname === '/login' ? 'login' : location.pathname === '/signup' ? 'signup' : location.pathname === '/auth/redeem' ? 'redeem' : null;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      {!isDirectPublicSurface && <ProductCompletionLayer />}
      {isPublicHome
        ? <PublicLanding />
        : publicPolicyKind
          ? <PublicPolicy kind={publicPolicyKind} />
          : accountMode
            ? <ReleaseAccountPage mode={accountMode} />
            : isAuthenticatedWorkspace
              ? <><SovereignIntelligenceWorkspace /><SystemMembershipManager /></>
              : <App />}
    </AppErrorBoundary>
  </React.StrictMode>
);
