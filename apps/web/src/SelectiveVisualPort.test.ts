import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const v0Visual = readFileSync(new URL('./v0-visual-port.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('founder v0 selective visual port', () => {
  it('ports the supplied self, relationship, and whole-system demonstrations', () => {
    expect(landing).toContain('Step 01 · You');
    expect(landing).toContain('Step 02 · You + 1');
    expect(landing).toContain('Step 03 · Your whole system');
    expect(landing).toContain('className="v0-flow"');
    expect(landing).toContain('className="v0-baseline-trace"');
    expect(landing).toContain('className="v0-family-map"');
    expect(landing).toContain('How Sovereign reads both of you');
    expect(landing).toContain('Shared pattern');
  });

  it('keeps demonstrations distinct from actual user data', () => {
    expect(landing).toContain('Illustrative Baseline');
    expect(landing).toContain('Illustrative permitted Baselines');
    expect(landing).toContain('Sanitized system demonstration');
    expect(landing).toContain('No compatibility score');
    expect(landing).toContain('No private-thought claims');
    expect(landing).toContain('Each person controls what may be included');
  });

  it('preserves the canonical single-room workspace and production data sources', () => {
    expect(workspace).toContain("type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'");
    expect(workspace).toContain("accept': 'application/vnd.sovereign.answer+json'");
    expect(workspace).toContain("api('/api/v1/people')");
    expect(workspace).toContain("api('/api/v1/systems')");
    expect(workspace).toContain("api('/api/v1/today')");
    expect(workspace).toContain('className="relationship-answer"');
    expect(workspace).toContain('className="system-graph"');
    expect(workspace).toContain('className="basis-strip"');
  });

  it('applies the v0 language to existing authenticated and account components', () => {
    for (const selector of [
      '.intelligence-workspace',
      '.intelligence-sidebar',
      '.intelligence-context',
      '.sovereign-composer',
      '.surface-heading',
      '.account-shell',
      '.auth-panel',
      '.workspace-sheet'
    ]) expect(v0Visual).toContain(selector);
    expect(v0Visual).toContain('@media (max-width: 760px)');
    expect(v0Visual).toContain('@media (prefers-reduced-motion: reduce)');
    expect(main).toContain("import './v0-visual-port.css';");
  });

  it('does not introduce the archive mock runtime, scores, or alternate architecture', () => {
    const source = `${landing}\n${v0Visual}`;
    for (const prohibited of [
      'Alignment Score',
      'Stability Index',
      'Growth Rate',
      'localStorage',
      'Math.random',
      'generateAIResponse',
      'Demo User',
      'dashboard-grid',
      'mock-auth',
      'fake-answer'
    ]) expect(source).not.toContain(prohibited);
  });
});
