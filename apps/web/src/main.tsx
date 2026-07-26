import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import { ProductCompletionLayer, installProductRuntime } from './ProductCompletionLayer';
import { installBaselineInputRuntime } from './BaselineInputRuntime';
import { installProductionRuntime } from './ProductionRuntime';
import { PublicLanding } from './PublicLanding';
import { PublicPolicy } from './PublicPolicy';
import './styles.css';
import './product-completion.css';
import './public-landing.css';

installProductionRuntime();
installProductRuntime();
installBaselineInputRuntime();

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      {!isDirectPublicSurface && <ProductCompletionLayer />}
      {isPublicHome
        ? <PublicLanding />
        : publicPolicyKind
          ? <PublicPolicy kind={publicPolicyKind} />
          : <App />}
    </AppErrorBoundary>
  </React.StrictMode>
);
