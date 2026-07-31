import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const hardening = readFileSync(new URL('./premium-surface-hardening.css', import.meta.url), 'utf8');
const completion = readFileSync(new URL('./selective-visual-port.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('selective Sovereign visual port', () => {
  it('recreates the approved self, relationship, and whole-system demonstrations', () => {
    expect(landing).toContain('STEP 01 · YOU');
    expect(landing).toContain('STEP 02 · YOU + 1');
    expect(landing).toContain('STEP 03 · YOUR WHOLE SYSTEM');
    expect(landing).toContain('className="visual-reasoning-panel');
    expect(landing).toContain('className="visual-evidence-chips"');
    expect(landing).toContain('className="relationship-baseline-pair"');
    expect(landing).toContain('className="story-system-map"');
    expect(landing).toContain('How Sovereign reads both of you');
    expect(landing).toContain('SHARED PATTERN');
  });

  it('keeps the demonstrations clearly separated from real user data', () => {
    expect(landing).toContain('Sanitized demonstration · Not your Baseline');
    expect(landing).toContain('Sanitized product demonstrations · Illustrative Baseline values · Not your personal result');
    expect(landing.indexOf('Sanitized demonstration · Not your Baseline')).toBeLessThan(landing.indexOf('YOU ASKED'));
    expect(landing).toContain('PERMISSION BEFORE COMPARISON');
    expect(landing).toContain('No compatibility score.');
    expect(landing).toContain('No mind-reading.');
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

  it('ports the reference language onto existing authenticated components', () => {
    expect(hardening).toContain('.response-thread .answer-baseline');
    expect(hardening).toContain('.response-thread .relationship-answer > div:first-child');
    expect(hardening).toContain('.system-overview .system-graph');
    expect(hardening).toContain('.response-thread .basis-strip');
    expect(hardening).toContain('@media (max-width: 680px)');
    expect(hardening).toContain('@media (prefers-reduced-motion: reduce)');
    expect(hardening).toContain('@media (forced-colors: active)');
    expect(completion).toContain('.relationship-baseline-pair');
    expect(completion).toContain('.story-fixture-boundary');
    expect(main).toContain("import './selective-visual-port.css';");
  });

  it('does not introduce mock application behavior, scores, or alternate product architecture', () => {
    for (const prohibited of [
      'Alignment Score',
      'Stability Index',
      'Growth Rate',
      'localStorage',
      'Math.random',
      'Dashboard',
      'New Chat',
      'View Insights'
    ]) {
      expect(landing).not.toContain(prohibited);
    }
  });
});
