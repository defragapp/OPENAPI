import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const motion = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');

describe('founder v0 reduced-motion contract', () => {
  it('loads the accessibility contract before the final visual authority', () => {
    const publicImport = "import './public.css';";
    const accessibilityImport = "import './app-shell.css';";
    expect(main).toContain(publicImport);
    expect(main).toContain(accessibilityImport);
    expect(main.indexOf(publicImport)).toBeLessThan(main.indexOf(accessibilityImport));
  });

  it('reveals the complete hero immediately when motion is reduced', () => {
    expect(motion).toContain('@media (prefers-reduced-motion: reduce)');
    expect(motion).toContain('.v0-landing-port .v0-hero h1 > em');
    expect(motion).toContain('animation: none !important');
    expect(motion).toContain('opacity: 1 !important');
    expect(motion).toContain('transform: none !important');
  });
});
