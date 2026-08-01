import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const engine = read('./engine-room.css');
const workspaceCss = read('./workspace-chat.css');
const workspaceMobileCss = read('./workspace-mobile.css');
const compositionCss = read('./interface-composition.css');
const authCss = read('./auth-onboarding.css');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');

describe('production mobile and responsive experience', () => {
  it('loads Engine Room last without removing authenticated mobile foundations', () => {
    expect(main).toContain("import './workspace-chat.css'");
    expect(main).toContain("import './workspace-mobile.css'");
    expect(main).toContain("import './auth-onboarding.css'");
    expect(main).toContain("import './interface-composition.css'");
    expect(main).toContain("import './engine-room.css'");
    expect(main.indexOf("import './engine-room.css'")).toBeGreaterThan(main.indexOf("import './public-landing-editorial.css'"));
  });

  it('uses a mobile-specific vertical engine instead of shrinking the desktop stage', () => {
    expect(landing).toContain('data-viewport-contract="engine-room-v1"');
    expect(engine).toContain('@media (max-width: 680px)');
    expect(engine).toMatch(/@media \(max-width: 680px\)[\s\S]*?\.engine-scroll-shell \{ min-height: 0;/);
    expect(engine).toMatch(/@media \(max-width: 680px\)[\s\S]*?\.engine-state,[\s\S]*?position: relative;/);
    expect(engine).toContain('.scale-node { position: relative;');
    expect(engine).toContain('.query-step { grid-template-columns: 1fr;');
  });

  it('keeps public commands readable and touch accessible', () => {
    expect(engine).toContain('min-height: 44px');
    expect(engine).toContain('.engine-command { width: 100%; min-height: 48px; }');
    expect(engine).toContain('font-size: 1.03rem');
    expect(engine).toContain('overflow: visible');
    expect(engine).toContain('@media (forced-colors: active)');
    expect(authCss).toContain('.auth-panel');
  });

  it('keeps five authenticated surfaces thumb reachable and You in the menu sheet', () => {
    expect(workspace).toContain('className="mobile-bottom-nav"');
    expect(workspace).toContain("surfaces.filter((item) => item.name !== 'You')");
    expect(workspace).toContain('You · Baseline, plan, permissions, and account');
    expect(workspaceCss).toContain('grid-template-columns: repeat(5, 1fr)');
    expect(workspaceCss).toContain('min-height: 56px');
  });

  it('protects authenticated composer, sheets, and notched edges', () => {
    expect(workspaceCss).toContain('env(safe-area-inset-bottom)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-left)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-right)');
    expect(workspaceMobileCss).toContain('max-height: 86svh');
  });

  it('retains visible focus, reduced motion, and horizontal overflow protection', () => {
    expect(engine).toContain(':focus-visible');
    expect(engine).toContain('@media (prefers-reduced-motion: reduce)');
    expect(engine).toContain('overflow: clip');
    expect(workspaceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(workspaceMobileCss).toContain('overflow-x: clip');
    expect(compositionCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
