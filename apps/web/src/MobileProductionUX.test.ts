import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const mobile = readFileSync(new URL('./ios-production-refinement.css', import.meta.url), 'utf8');
const staticRelease = readFileSync(new URL('../public/static-release.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const account = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

describe('production iOS and responsive experience', () => {
  it('loads the final production refinement after the established design layers', () => {
    expect(main).toContain("import './ios-production-refinement.css'");
    expect(main.indexOf("import './ios-production-refinement.css'")).toBeGreaterThan(main.indexOf("import './sovereign-brand.css'"));
  });

  it('keeps every authenticated surface thumb reachable on small screens', () => {
    for (const label of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) {
      expect(workspace).toContain(`label: '${label}'`);
    }
    expect(workspace).toContain('className="mobile-nav-trigger"');
    expect(mobile).toContain('grid-template-columns: repeat(6, minmax(0, 1fr));');
    expect(mobile).toContain('.intelligence-workspace.nav-open .intelligence-sidebar');
    expect(mobile).toContain('min-height: 58px;');
  });

  it('protects the composer, context, and mobile controls from the iOS safe area', () => {
    expect(mobile).toContain('bottom: calc(78px + env(safe-area-inset-bottom));');
    expect(mobile).toContain('padding-top: calc(10px + env(safe-area-inset-top));');
    expect(mobile).toContain('.intelligence-workspace.context-open:not(.nav-open) .intelligence-sidebar');
    expect(mobile).toContain('.account-control-trigger');
    expect(mobile).toContain('.structured-intelligence-trigger');
  });

  it('prevents iOS input zoom and preserves readable supporting text', () => {
    expect(account).toContain('className="account-shell"');
    expect(mobile).toContain('.auth-panel input:not([type="checkbox"])');
    expect(mobile).toContain('min-height: 50px;');
    expect(mobile).toContain('font-size: 16px;');
    expect(mobile).toContain('.account-points');
  });

  it('keeps static public navigation visible and readable without horizontal discovery', () => {
    expect(staticRelease).toContain('repeat(auto-fit, minmax(78px, 1fr))');
    expect(staticRelease).toContain('font-size: .84rem;');
    expect(staticRelease).toContain('font-size: .9rem;');
    expect(staticRelease).not.toContain('overflow-x: auto');
  });

  it('retains contrast and reduced-motion accommodations', () => {
    expect(mobile).toContain('@media (prefers-contrast: more)');
    expect(mobile).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
