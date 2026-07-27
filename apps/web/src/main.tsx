import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import { ProductCompletionLayer, installProductRuntime } from './ProductCompletionLayer';
import { installBaselineInputRuntime } from './BaselineInputRuntime';
import { installProductionRuntime } from './ProductionRuntime';
import { installProductLanguageRuntime } from './ProductLanguageRuntime';
import { PublicLanding } from './PublicLanding';
import { PublicPolicy } from './PublicPolicy';
import { AccountFlow } from './AccountFlow';
import './styles.css';
import './product-completion.css';
import './public-landing.css';
import './production-polish.css';
import './account-flow.css';

installProductionRuntime();
installProductRuntime();
installBaselineInputRuntime();
installProductLanguageRuntime();

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
const accountFlowPaths = new Set(['/login', '/signup', '/forgot-password', '/reset-password', '/onboarding']);
const isAccountFlow = accountFlowPaths.has(location.pathname);
const isDirectPublicSurface = isPublicHome || publicPolicyKind !== null;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      {!isDirectPublicSurface && !isAccountFlow && <ProductCompletionLayer />}
      {isPublicHome
        ? <PublicLanding />
        : publicPolicyKind
          ? <PublicPolicy kind={publicPolicyKind} />
          : isAccountFlow
            ? <AccountFlow />
            : <App />}
    </AppErrorBoundary>
  </React.StrictMode>
);
