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
          <p className="eyebrow">THIS VIEW DID NOT OPEN</p>
          <h1>Something went wrong while opening Sovereign.OS.</h1>
          <p className="lede">Reload the page. If the problem continues, return home and sign in again.</p>
          <div className="action-row">
            <button className="primary-button" onClick={() => window.location.reload()}>Reload</button>
            <a className="secondary-button" href="/">Return home</a>
          </div>
        </section>
      </main>
    );
  }
}