import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');
const main = readFileSync(resolve(root, 'apps/web/src/main.tsx'), 'utf8');
const invitationFidelity = readFileSync(resolve(root, 'apps/web/src/releases.css'), 'utf8');
const historicalHardening = readFileSync(resolve(root, 'apps/web/src/workspace.css'), 'utf8');

describe('invitation rendered fidelity', () => {
  it('loads as part of the single terminal inline authority', () => {
    expect(main).toContain("import releasesCss from './releases.css?inline';");
    expect(main).toContain("style.textContent = releasesCss;");
  });

  it('reconciles the historical desktop two-column placement without changing mobile', () => {
    expect(historicalHardening).toContain('.invitation-state {\n  display: grid;\n  grid-column: 2;');
    expect(historicalHardening).toContain('@media (max-width: 900px) {\n  .invitation-state {\n    grid-column: 1;');
    expect(invitationFidelity).toContain('@media (min-width: 901px)');
    expect(invitationFidelity).toContain('width: min(960px, calc(100vw - 96px)) !important;');
    expect(invitationFidelity).toContain('grid-template-columns: minmax(0, 1fr) minmax(340px, 0.92fr) !important;');
    expect(invitationFidelity).toContain('grid-column: 2 !important;');
  });

  it('prevents the invitation heading from fragmenting inside words', () => {
    expect(invitationFidelity).toContain('> #invitation-title {');
    expect(invitationFidelity).toContain('overflow-wrap: normal !important;');
    expect(invitationFidelity).toContain('word-break: normal !important;');
    expect(invitationFidelity).toContain('hyphens: none !important;');
    expect(invitationFidelity).toContain('max-width: 9.5ch !important;');
  });
});
