import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import { ProductCompletionLayer, installProductRuntime } from './ProductCompletionLayer';
import { installBaselineInputRuntime } from './BaselineInputRuntime';
import { installProductionRuntime } from './ProductionRuntime';
import './styles.css';
import './product-completion.css';
import './visual-polish.css';

installProductionRuntime();
installProductRuntime();
installBaselineInputRuntime();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ProductCompletionLayer />
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
