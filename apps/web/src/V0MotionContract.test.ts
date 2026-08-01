import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const motion = readFileSync(new URL('./v0-motion-accessibility.css', import.meta.url), 'utf8');

describe('founder v0 reduced-motion contract', () => {
  it('loads the accessibility contract before the final visual authority', () => {
    const accessibilityImport = "import './v0-motion-accessibility.css';";
    const visualImport = "import './v0-visual-port.css';";
    expect(main).toContain(accessibilityImport);
    expect(main.indexOf(accessibilityImport)).toBeLessThan(main.indexOf(visualImport));
  });

  it('reveals the complete hero immediately when motion is reduced', () => {
    expect(motion).toContain('@media (prefers-reduced-motion: reduce)');
    expect(motion).toContain('.v0-landing-port .v0-hero h1 > em');
    expect(motion).toContain('animation: none !important');
    expect(motion).toContain('opacity: 1 !important');
    expect(motion).toContain('transform: none !important');
  });
});
