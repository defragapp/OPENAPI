import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ProductCompletionLayer, installProductRuntime } from './ProductCompletionLayer';
import { installBaselineInputRuntime } from './BaselineInputRuntime';
import './styles.css';
import './product-completion.css';
import './visual-polish.css';

installProductRuntime();
installBaselineInputRuntime();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProductCompletionLayer />
    <App />
  </React.StrictMode>
);
