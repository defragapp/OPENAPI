import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../public/intelligence-ui.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/intelligence-ui.css', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const prompt = readFileSync(new URL('../../sovereign-worker/src/agent/prompt-v1.ts', import.meta.url), 'utf8');

describe('Baseline-first visual intelligence experience', () => {
  it('loads the visual intelligence layer without replacing the React workspace', () => {
    expect(index).toContain('/src/main.tsx');
    expect(index).toContain('/intelligence-ui.css?v=20260726-baseline-first-r1');
    expect(index).toContain('/intelligence-ui.js?v=20260726-baseline-first-r1');
    expect(index).toContain('/recognition-ui.js');
    expect(index).toContain('/archetype-clarity.js');
  });

  it('gives Today meaningful value before a user types a question', () => {
    expect(ui).toContain("fetch('/api/v1/today'");
    expect(ui).toContain('YOUR BASELINE, ALIVE TODAY');
    expect(ui).toContain('WHAT REMAINS YOURS');
    expect(ui).toContain('WHAT IS LOUDER NOW');
    expect(ui).toContain('ACTIVE BASELINE QUALITIES');
    expect(ui).toContain('WHERE THIS MAY MATTER');
    expect(ui).toContain('baseline-core-object');
    expect(ui).toContain('live-sky-halo');
  });

  it('exposes the required exploration modes as visible objects', () => {
    for (const phrase of [
      'My Baseline',
      'Shadow and Light',
      'Alignment',
      'A Relationship',
      'My Role in a System',
      'Christian Perspective'
    ]) expect(ui).toContain(phrase);
    expect(ui).toContain('ALIGNMENT NEEDLE');
    expect(ui).toContain('SHADOW–LIGHT RAIL');
  });

  it('keeps relationship, system, consent, and privacy distinctions visible', () => {
    expect(ui).toContain('Possible perspective—not private thoughts.');
    expect(ui).toContain('Permission determines what may be compared.');
    expect(ui).toContain('Roles, pressure, authority, and change in one view.');
    expect(ui).toContain('Raw birth information and exact private location remain separate');
    expect(ui).toContain('Baseline + Live Sky');
    expect(ui).toContain('Only what the question needs');
  });

  it('renders completed AI text as structured sections instead of a wall of text', () => {
    expect(ui).toContain('structured-response-grid');
    expect(ui).toContain('Direct answer');
    expect(ui).toContain('What may be interacting');
    expect(ui).toContain('Aligned expression');
    expect(ui).toContain('One way to continue');
    expect(ui).toContain('SUPPORTING CONTEXT');
  });

  it('makes the composer context explicit', () => {
    expect(ui).toContain('sovereign-context-bar');
    expect(ui).toContain("baselineReady ? 'included' : 'not built'");
    expect(ui).toContain("liveReady ? 'included' : 'off'");
    expect(ui).toContain("covenantOn ? 'on' : 'off'");
  });

  it('is responsive, high-contrast aware, and reduced-motion safe', () => {
    expect(css).toContain('@media (max-width: 680px)');
    expect(css).toContain('@media (prefers-contrast: more)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('.baseline-orbit');
    expect(css).toContain('.alignment-instrument');
    expect(css).toContain('.perspective-split');
    expect(css).toContain('.system-map-preview');
  });

  it('changes the agent from incident-first to Baseline-first', () => {
    expect(prompt).toContain('BASELINE-FIRST FLOW');
    expect(prompt).toContain('Do not require the user to explain an incident');
    expect(prompt).toContain('The user’s story shows where the computed framework may be appearing');
    expect(prompt).toContain('choose response_phase "integration" and give a clear answer now');
    expect(prompt).toContain('Shadow and light');
    expect(prompt).toContain('Alignment');
    expect(prompt).toContain('Relationship');
    expect(prompt).toContain('System');
    expect(prompt).toContain('Covenant');
    expect(prompt).not.toContain('Unless the current message clearly answers a prior inward question');
  });

  it('updates the public cache version for the new assets', () => {
    expect(serviceWorker).toContain("sovereign-public-v6");
    expect(serviceWorker).toContain("'/intelligence-ui.css'");
    expect(serviceWorker).toContain("'/intelligence-ui.js'");
  });
});