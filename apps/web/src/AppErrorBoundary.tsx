import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Sovereign.OS view error', { error, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="account-shell">
        <a className="wordmark" href="/">SOVEREIGN.OS</a>
        <section className="auth-panel" role="alert">
          <p className="eyebrow">VIEW INTERRUPTED</p>
          <h1>Sovereign could not open this view safely.</h1>
          <p className="lede">Nothing new was submitted or saved from the interrupted view. Reload it, or return to the public entry page.</p>
          <div className="action-row">
            <button className="primary-button" onClick={() => window.location.reload()}>Reload this view</button>
            <a className="secondary-button" href="/">Return home</a>
          </div>
        </section>
      </main>
    );
  }
}
