import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const orbit = readFileSync(new URL('./BaselineOrbit.tsx', import.meta.url), 'utf8');
const orbitStyles = readFileSync(new URL('./baseline-orbit.css', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignWorkspace.tsx', import.meta.url), 'utf8');

describe('shared Baseline visual asset', () => {
  it('uses one owned visual on the homepage and in the workspace', () => {
    expect(landing).toContain('<BaselineOrbit />');
    expect(workspace).toContain('<BaselineOrbit compact />');
    expect(orbit).toContain('YOUR BASELINE');
    expect(orbit).toContain('SHADOW');
    expect(orbit).toContain('LIGHT');
    expect(orbit).toContain('ALIGNED');
  });

  it('removes the old visualization runtime stack from production', () => {
    for (const retired of [
      '/recognition-ui.js',
      '/mirror-ui.css',
      '/archetype-clarity.js',
      '/archetype-art-detail.js'
    ]) expect(index).not.toContain(retired);
  });

  it('is responsive, decorative-safe, and reduced-motion aware', () => {
    expect(orbit).toContain('aria-hidden="true"');
    expect(orbitStyles).toContain('@media (max-width: 700px)');
    expect(orbitStyles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(orbitStyles).toContain('.baseline-orbit-compact');
  });
});
