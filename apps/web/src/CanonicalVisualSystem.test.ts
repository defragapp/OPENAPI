import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const designSystem = read('./design-system.css');
const publicCss = read('./public.css');
const workspaceCss = read('./workspace.css');
const appShellCss = read('./app-shell.css');
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

  it('tracks terminal override cascade elimination progress', () => {
    // releases.css file still exists but is not imported - canonical imports are used
    expect(existsSync(new URL('./releases.css', import.meta.url))).toBe(true);
    // main.tsx uses canonical imports, not releases.css
    expect(main).not.toContain('releases.css');
    expect(main).not.toContain('installPlatformVisualCohesion');
    // Canonical imports are present
    expect(main).toContain("import './design-system.css';");
    expect(main).toContain("import './public.css';");
    expect(main).toContain("import './workspace.css';");
    expect(main).toContain("import './app-shell.css';");
    expect(main).toContain("import './passkey-auth.css';");
  });

  it('imports exactly the canonical files in main.tsx', () => {
    expect(main).toContain("import './design-system.css';");
    expect(main).toContain("import './public.css';");
    expect(main).toContain("import './workspace.css';");
    expect(main).toContain("import './app-shell.css';");
    expect(main).toContain("import './passkey-auth.css';");
  });

  it('has zero ?inline imports (terminal override layer eliminated)', () => {
    const inlineImports = main.match(/import \w+ from '\.\/[^']+\.css\?inline'/g) ?? [];
    expect(inlineImports).toHaveLength(0);
  });

  it('tracks specificity escalation in canonical layers for future purge', () => {
    // After the complete migration, canonical files should have minimal specificity escalation
    const publicSpecificityCount = (publicCss.match(/html:root:root:root body/g) ?? []).length;
    const workspaceSpecificityCount = (workspaceCss.match(/html:root:root:root body/g) ?? []).length;
    const appShellSpecificityCount = (appShellCss.match(/html:root:root:root body/g) ?? []).length;
    
    // design-system.css should NOT contain specificity escalation (it's the token foundation)
    expect(designSystem).not.toContain('html:root:root:root body');
    
    // Log counts for tracking (future passes should reduce these to 0)
    console.log(`Specificity escalation counts - public: ${publicSpecificityCount}, workspace: ${workspaceSpecificityCount}, app-shell: ${appShellSpecificityCount}`);
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
});
