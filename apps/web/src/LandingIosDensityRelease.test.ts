import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const iosCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');

describe('landing iOS parity and density release', () => {
  it('loads the narrow-screen authority after the hero and before route and final passkey authority', () => {
    const publicImport = "import './public.css';";
    const routeImport = "import './app-shell.css';";
    const passkeyImport = "import './passkey-auth.css';";

    expect(main).toContain(publicImport);
    expect(main).toContain(routeImport);
    expect(main).toContain(passkeyImport);
    expect(main.indexOf(routeImport)).toBeGreaterThan(main.indexOf(publicImport));
    expect(main.indexOf(passkeyImport)).toBeGreaterThan(main.indexOf(routeImport));
  });

  it('keeps the same Sovereign.OS identity across desktop and iOS', () => {
    expect(landing).toContain('<BrandMark />');
    expect(landing).toContain('v0-wordmark--mobile');
    expect(iosCss).toContain("content: 'SOVEREIGN.OS'");
    expect(iosCss).toContain('font-family: var(--font-sans, sans-serif)');
    expect(iosCss).toContain('font-weight: 650');
    expect(iosCss).toContain('letter-spacing: 0.22em');
  });

  it('respects iOS horizontal safe areas without creating a second design', () => {
    expect(iosCss).toContain('padding-left: max(18px, env(safe-area-inset-left))');
    expect(iosCss).toContain('padding-right: max(18px, env(safe-area-inset-right))');
    expect(iosCss).toContain('@supports (-webkit-touch-callout: none)');
    expect(iosCss).not.toContain('mobile-redesign');
  });

  it('reduces mobile scroll density while preserving all three product stories', () => {
    for (const marker of [
      'padding: 54px 0',
      'grid-template-columns: repeat(2, minmax(0, 1fr))',
      'min-height: 76px',
      'min-height: 0',
      'content-visibility: auto',
      'contain-intrinsic-size: auto 640px'
    ]) expect(iosCss).toContain(marker);

    expect(iosCss).toContain('.landing-workflow__copy > span');
    expect(iosCss).toContain('clip-path: inset(50%)');
  });

  it('keeps the override isolated to narrow screens and balanced', () => {
    expect(iosCss).toContain('@media (max-width: 760px)');
    expect((iosCss.match(/{/g) ?? []).length).toBe((iosCss.match(/}/g) ?? []).length);
  });
});
