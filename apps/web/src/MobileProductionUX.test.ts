import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const engine = read('./engine-room.css');
const safeArea = read('./engine-room-safe-area.css');
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
    expect(main).toContain("import './engine-room-safe-area.css'");
    expect(main).toContain("import './engine-room.css'");
    expect(main.indexOf("import './engine-room.css'")).toBeGreaterThan(main.indexOf("import './engine-room-safe-area.css'"));
  });

  it('uses a deliberate small-screen Engine Room composition', () => {
    expect(engine).toContain('@media (max-width: 760px)');
    expect(engine).toContain('@media (max-width: 440px)');
    expect(engine).toMatch(/@media \(max-width: 760px\)[\s\S]*?\.engine-scroll-shell \{ height: 520svh; \}/);
    expect(engine).toContain('.engine-header { height: 62px; padding: 0 16px; }');
    expect(engine).toContain('.engine-layer { padding: 84px 18px 26px; }');
    expect(engine).toContain('.engine-command { min-height: 46px; width: 100%; justify-content: flex-start; }');
    expect(engine).toContain('.answer-distinction { grid-template-columns: 1fr; }');
  });

  it('keeps public controls, text, and notched edges usable', () => {
    expect(engine).toContain('min-height: 44px');
    expect(engine).toContain('font-size: 16px');
    expect(engine).toContain('overflow: clip');
    expect(safeArea).toContain('env(safe-area-inset-top)');
    expect(safeArea).toContain('env(safe-area-inset-bottom)');
    expect(safeArea).toContain('env(safe-area-inset-left)');
    expect(safeArea).toContain('env(safe-area-inset-right)');
    expect(authCss).toContain('.auth-panel');
  });

  it('keeps the interactive scale selector accessible without hover', () => {
    expect(landing).toContain('role="tablist"');
    expect(landing).toContain('aria-selected={selected === index}');
    expect(landing).toContain('onClick={() => onSelect(index)}');
    expect(landing).toContain('onKeyDown={(event) => moveScaleFocus');
    expect(landing).toContain("['ArrowLeft', 'ArrowRight', 'Home', 'End']");
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
