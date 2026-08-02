import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const refinement = read('./v0-landing-refinement.css');

describe('production landing refinement', () => {
  it('loads after global founder authority and before passkey authority', () => {
    const globalImport = "import './v0-global-experience.css';";
    const refinementImport = "import './v0-landing-refinement.css';";
    const passkeyImport = "import './passkey-auth.css';";

    expect(main).toContain(refinementImport);
    expect(main.indexOf(refinementImport)).toBeGreaterThan(main.indexOf(globalImport));
    expect(main.indexOf(passkeyImport)).toBeGreaterThan(main.indexOf(refinementImport));
  });

  it('keeps the approved landing sequence while improving hierarchy and product scale', () => {
    for (const marker of [
      '.v0-landing-port .v0-hero h1',
      '.v0-landing-port .v0-story-grid',
      '.v0-landing-port .v0-flow-field',
      '.v0-landing-port .v0-system-stage',
      '.v0-landing-port .v0-comparison-grid',
      '.v0-landing-port .v0-final',
      '@media (max-width: 760px)',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(refinement).toContain(marker);

    expect(refinement).toContain('color: rgba(232, 221, 208, 0.11) !important');
    expect(refinement).toContain('width: min(100%, 1080px) !important');
    expect(refinement).toContain('margin: 32px auto 0 !important');
    expect(refinement).not.toContain('display: none');
  });

  it('keeps the refinement stylesheet structurally valid', () => {
    expect((refinement.match(/{/g) ?? []).length).toBe((refinement.match(/}/g) ?? []).length);
  });
});
