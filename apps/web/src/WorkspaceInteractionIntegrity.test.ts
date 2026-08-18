import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

function functionBody(name: string) {
  const start = workspace.indexOf(`function ${name}(`);
  expect(start, `${name} should exist`).toBeGreaterThanOrEqual(0);
  const nextFunction = workspace.indexOf('\n  function ', start + 1);
  const nextTopLevelFunction = workspace.indexOf('\nfunction ', start + 1);
  const candidates = [nextFunction, nextTopLevelFunction].filter((value) => value > start);
  const end = candidates.length ? Math.min(...candidates) : workspace.length;
  return workspace.slice(start, end);
}

describe('Sovereign workspace interaction integrity', () => {
  it('keeps primary navigation separate from destructive conversation reset', () => {
    const openSurface = functionBody('openSurface');
    expect(openSurface).toContain('setSurface(next)');
    expect(openSurface).not.toContain('startNewThread(');

    const startNewThread = functionBody('startNewThread');
    expect(startNewThread).toContain("setDraft('')");
    expect(workspace).toContain('New exploration');
  });

  it('uses one stable processing state instead of staged thinking claims', () => {
    expect(workspace).toContain('Preparing your answer…');
    for (const phrase of [
      'Connecting your Baseline',
      'Checking what may be more relevant now',
      'Looking at the pattern',
      'Connecting the situation',
      'Connecting the relevant context…'
    ]) expect(workspace).not.toContain(phrase);
    expect(workspace).not.toContain('responseProgressTimer');
    expect(workspace).not.toContain('setInterval(() => {\n      if (phase >= phases.length - 1)');
  });

  it('keeps authenticated source disclosure in ordinary user language', () => {
    expect(workspace).toContain('<strong>Sources</strong>');
    expect(workspace).toContain('<span>See source details</span>');
    expect(workspace).toContain('<h2 id="basis-title">Source details</h2>');
    expect(workspace).not.toContain('<strong>Basis</strong>');
    expect(workspace).not.toContain('<h2 id="basis-title">Basis</h2>');
    expect(workspace).not.toContain('Close Basis sources');
  });

  it('does not forward arbitrary backend error text into the private workspace UI', () => {
    expect(workspace).not.toContain('problem.message || problem.error');
    expect(workspace).not.toContain('payload.message || payload.error');
    expect(workspace).toContain('That request could not be completed.');
    expect(workspace).toContain('Sovereign.OS could not complete that request. Try again in a moment.');
  });

  it('keeps Baseline birth-input ownership in canonical onboarding', () => {
    const beginBaseline = functionBody('beginBaseline');
    expect(beginBaseline).toContain("location.assign('/onboarding?baseline=review')");
    expect(workspace).not.toContain('function BaselineBuilder(');
    expect(workspace).not.toContain('Intl.DateTimeFormat().resolvedOptions().timeZone');
    expect(workspace).not.toContain('birthTimezone: timezone');
  });
});
