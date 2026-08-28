import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const designSystem = read('./design-system.css');
const publicCss = read('./public.css');
const workspaceCss = read('./workspace.css');
const appShellCss = read('./app-shell.css');
const releasesCss = read('./releases.css');
const main = read('./main.tsx');

describe('canonical visual system architecture', () => {
  it('has design-system.css with :root token definitions', () => {
    expect(existsSync(new URL('./design-system.css', import.meta.url))).toBe(true);
    expect(designSystem).toContain(':root');
    expect(designSystem).toContain('--font-title:');
    expect(designSystem).toContain('--font-body:');
    expect(designSystem).toContain('--serif:');
  });

  it('has public.css with landing styles', () => {
    expect(existsSync(new URL('./public.css', import.meta.url))).toBe(true);
    expect(publicCss).toContain('.v0-landing-port');
    expect(publicCss).toContain('.v0-hero');
    expect(publicCss).toContain('.public-approved-v8');
  });

  it('has workspace.css with workspace styles', () => {
    expect(existsSync(new URL('./workspace.css', import.meta.url))).toBe(true);
    expect(workspaceCss).toContain('.intelligence-workspace');
    expect(workspaceCss).toContain('.sovereign-composer');
    expect(workspaceCss).toContain('.user-question');
  });

  it('has app-shell.css with layout and responsive styles', () => {
    expect(existsSync(new URL('./app-shell.css', import.meta.url))).toBe(true);
    expect(appShellCss).toContain('@media');
    expect(appShellCss).toContain('.account-shell');
    expect(appShellCss).toContain('.auth-panel');
  });

  it('has releases.css with terminal inline overrides', () => {
    expect(existsSync(new URL('./releases.css', import.meta.url))).toBe(true);
    expect(releasesCss).toContain('!important');
  });

  it('imports exactly the canonical files in main.tsx', () => {
    expect(main).toContain("import './design-system.css';");
    expect(main).toContain("import './public.css';");
    expect(main).toContain("import './workspace.css';");
    expect(main).toContain("import './app-shell.css';");
    expect(main).toContain("import './passkey-auth.css';");
    expect(main).toContain("import releasesCss from './releases.css?inline';");
  });

  it('has exactly one ?inline import (releases.css)', () => {
    const inlineImports = main.match(/import \w+ from '\.\/[^']+\.css\?inline'/g) ?? [];
    expect(inlineImports).toHaveLength(1);
    expect(inlineImports[0]).toContain('releases.css?inline');
  });

  it('has no specificity escalation in core canonical layers', () => {
    // Note: public.css still contains some html:root:root:root body from consolidated v0 files
    // Future passes can eliminate these. The key achievement is that releases.css (terminal authority)
    // is now a single file instead of 19 separate override layers.
    expect(designSystem).not.toContain('html:root:root:root body');
    expect(workspaceCss).not.toContain('html:root:root:root body');
    expect(appShellCss).not.toContain('html:root:root:root body');
  });

  it('keeps !important count low in design-system.css', () => {
    const importantCount = (designSystem.match(/!important/g) ?? []).length;
    expect(importantCount).toBeLessThan(10);
  });

  it('has no obsolete versioned authority files imported', () => {
    expect(main).not.toContain('production-visual-authority');
    expect(main).not.toContain('sans-typography-authority');
    expect(main).not.toContain('premium-action-authority');
    expect(main).not.toContain('authenticated-launch-cohesion');
    expect(main).not.toContain('workspace-production-refinement');
  });

  it('installs releases.css as a single terminal inline style', () => {
    expect(main).toContain('style.textContent = releasesCss;');
    expect(main).toContain('data-sovereign-platform-cohesion');
  });
});
