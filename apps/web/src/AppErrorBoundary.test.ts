import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const boundary = readFileSync(new URL('./AppErrorBoundary.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('application error recovery', () => {
  it('wraps the production interface in an error boundary', () => {
    expect(main).toContain("import { AppErrorBoundary } from './AppErrorBoundary'");
    expect(main).toContain('<AppErrorBoundary>');
    expect(main).toContain('</AppErrorBoundary>');
  });

  it('provides a factual user-facing recovery state', () => {
    expect(boundary).toContain('getDerivedStateFromError');
    expect(boundary).toContain('Something went wrong while opening Sovereign.OS.');
    expect(boundary).toContain('Reload the page. If the problem continues, return home and sign in again.');
    expect(boundary).toContain('window.location.reload()');
    expect(boundary).toContain('Return home');
    expect(boundary).not.toContain('Nothing new was submitted or saved');
    expect(boundary).not.toContain('could not open this view safely');
    expect(boundary).not.toContain('error.message');
    expect(boundary).not.toContain('componentStack}</');
  });
});