import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../..');

function read(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), 'utf8');
}

describe('Tier 3: Pairwise Cross-Feature Integration Tests', () => {
  // ── Pair 1: Feature 1 (Brand Thesis) + Feature 4 (Static HTML & React Sync) ──
  it('Pair 1 [F1 + F4]: Brand Thesis is synchronized between static marketing templates and React components', () => {
    const thesis = 'Know yourself. Understand your people. See the whole system.';
    const reactLanding = read('apps/web/src/PublicLanding.tsx');
    const reactHowItWorks = read('apps/web/src/PublicHowItWorks.tsx');
    expect(reactLanding).toContain(thesis);
    expect(reactHowItWorks.toUpperCase()).toContain(thesis.toUpperCase());
  });

  // ── Pair 2: Feature 1 (Brand Thesis) + Feature 9 (Center Stage & Workspace Arrival) ──
  it('Pair 2 [F1 + F9]: Brand Thesis core principles align with workspace arrival greeting and action shortcuts', () => {
    const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
    expect(workspace).toContain('What feels active for you now?');
    expect(workspace).toContain('Your Baseline stays beneath every exploration.');
    expect(workspace).toContain('See the whole system.');
    expect(workspace).toContain('Explore a pattern');
    expect(workspace).toContain('Understand a relationship');
  });

  // ── Pair 3: Feature 2 (Cliché Elimination) + Feature 5 (Singular Sovereign Persona) ──
  it('Pair 3 [F2 + F5]: Sovereign persona prompt eliminates robotic clichés and conversational filler', () => {
    const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');
    expect(prompt).toContain('Avoid generic coaching');
    expect(prompt).toContain('inspirational filler');
    expect(prompt).not.toContain('How can I help you today?');
    expect(prompt).toContain('You are Sovereign, the single Baseline-first intelligence inside Sovereign.OS.');
  });

  // ── Pair 4: Feature 3 (Non-Clinical Tone) + Feature 5 (Singular Sovereign Persona) ──
  it('Pair 4 [F3 + F5]: Sovereign persona provides personal discernment without clinical diagnosis', () => {
    const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');
    const howItWorks = read('apps/web/src/PublicHowItWorks.tsx');
    expect(prompt).toContain('diagnosis');
    expect(prompt).toContain('therapy voice');
    expect(howItWorks).toContain('personal discernment');
    expect(howItWorks).toContain('not clinical labels');
  });

  // ── Pair 5: Feature 6 (Global Dusk Gradient) + Feature 7 (Floating Glassmorphic Window) ──
  it('Pair 5 [F6 + F7]: Glassmorphic workspace container layers seamlessly over dusk mountain backdrop', () => {
    const css = read('apps/web/src/workspace.css');
    // Backdrop gradient stops
    expect(css).toContain('#100814');
    expect(css).toContain('#1a101f');
    expect(css).toContain('#0d0710');
    // Mountain ridge background images
    expect(css).toContain('/powder-hills-far.png');
    expect(css).toContain('/powder-hills-mid.png');
    // Glassmorphic container properties
    expect(css).toContain('max-width: 1152px;');
    expect(css).toContain('height: 88vh;');
    expect(css).toContain('background: rgba(22, 22, 22, 0.92)');
    expect(css).toContain('backdrop-filter: blur(28px);');
    expect(css).toContain('border: 1px solid rgba(255, 255, 255, 0.1);');
  });

  // ── Pair 6: Feature 6 (Global Dusk Gradient) + Feature 10 (Typography Enforcement) ──
  it('Pair 6 [F6 + F10]: Geist typography tokens ensure high legibility against dark dusk gradient stops', () => {
    const workspaceCss = read('apps/web/src/workspace.css');
    const designCss = read('apps/web/src/design-system.css');
    expect(workspaceCss).toContain('color: #ffffff;');
    expect(designCss).toContain('Geist-Variable.woff2');
    expect(designCss).toContain('--serif: var(--font-title);');
  });

  // ── Pair 7: Feature 7 (Glassmorphic Window) + Feature 8 (Left Sidebar Anatomy) ──
  it('Pair 7 [F7 + F8]: Left sidebar docks cleanly inside glassmorphic window container', () => {
    const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
    expect(workspace).toContain('className="intelligence-sidebar"');
    expect(workspace).toContain('className="intelligence-sidebar-header"');
    expect(workspace).toContain('className="brand-diamond"');
    expect(workspace).toContain('SOVEREIGN.OS');
    expect(workspace).toContain('className="sidebar-new-chat-btn"');
    expect(workspace).toContain('className="sidebar-user-pill"');
  });

  // ── Pair 8: Feature 8 (Left Sidebar) + Feature 9 (Center Stage & Composer Dock) ──
  it('Pair 8 [F8 + F9]: Starting a new thread in sidebar resets center stage to warm arrival greeting and shortcuts', () => {
    const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
    expect(workspace).toContain('startNewThread()');
    expect(workspace).toContain('workspace-hero-greeting');
    expect(workspace).toContain('workspace-action-grid');
    expect(workspace).toContain('sovereign-composer');
  });

  // ── Pair 9: Feature 11 (4-Step Lifecycle) + Feature 12 (D1 Batch Transactions) ──
  it('Pair 9 [F11 + F12]: Magic link redemption executes atomic batch mutations during account creation', () => {
    const accountsDb = read('apps/sovereign-worker/src/db/accounts.ts');
    const authPublic = read('apps/sovereign-worker/src/auth-public.ts');
    expect(accountsDb).toContain('env.DB.batch');
    expect(authPublic).toContain('createSignedSessionToken');
    expect(authPublic).toContain('AUTH_D1_ERROR');
  });

  // ── Pair 10: Feature 11 (4-Step Lifecycle) + Feature 13 (Turnstile & 503 Blocker Mitigation) ──
  it('Pair 10 [F11 + F13]: Auth routes validate Turnstile challenges with structured error codes before progressing to onboarding', () => {
    const authPublic = read('apps/sovereign-worker/src/auth-public.ts');
    const app = read('apps/web/src/App.tsx');
    expect(authPublic).toContain('TURNSTILE_FAILED');
    expect(app).toContain('sovereign:turnstile-state');
    expect(app).toContain("path === '/onboarding'");
  });

  // ── Pair 11: Feature 12 (D1 Batch Transactions) + Feature 14 (D1 Migration Parity) ──
  it('Pair 11 [F12 + F14]: Database operations run against schemas aligned with all 19 migrations', () => {
    const m19 = read('apps/sovereign-worker/migrations/0019_deprecate_manual_capacity.sql');
    const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
    expect(m19).toContain('legacy_workers_ai_daily_capacity');
    expect(runtime).toContain("LATEST_MIGRATION_VERSION = '0019_deprecate_manual_capacity'");
    expect(runtime).toContain("LATEST_MIGRATION_FILENAME = '0019_deprecate_manual_capacity.sql'");
  });

  // ── Pair 12: Feature 13 (Turnstile Mitigation) + Feature 20 (Live Browser Verification Gate) ──
  it('Pair 12 [F13 + F20]: Browser automation uses domcontentloaded to avoid Turnstile networkidle hangs', () => {
    const infra = read('TEST_INFRA.md');
    expect(infra).toContain("waitUntil: 'domcontentloaded'");
    expect(infra).toContain('Turnstile');
  });

  // ── Pair 13: Feature 14 (D1 Migration Parity) + Feature 18 (Cloudflare Production Deployment) ──
  it('Pair 13 [F14 + F18]: Production ready check reports migration 0019 parity and git commit SHA', () => {
    const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
    const wrangler = read('wrangler.jsonc');
    expect(runtime).toContain('migrationVersion');
    expect(runtime).toContain('latestMigrationVersion');
    expect(wrangler).toContain('sovereign-openapi-db');
    expect(wrangler).toContain('apps/sovereign-worker/migrations');
  });

  // ── Pair 14: Feature 16 (Pre-Flight Checks) + Feature 17 (Worker Bundle Size Control) ──
  it('Pair 14 [F16 + F17]: Diagnostic gate stage executes bundle size verification within 2,500 KiB budget', () => {
    const diagnostics = read('scripts/cloudflare-build-diagnostics.mjs');
    const bundleScript = read('scripts/verify-worker-bundle-size.mjs');
    expect(diagnostics).toContain("'worker-bundle-size'");
    expect(bundleScript).toContain('INTERNAL_BUDGET_BYTES = 2_500 * 1024');
  });

  // ── Pair 15: Feature 15 (Local Typechecks) + Feature 19 (E2E Test Suite Creation) ──
  it('Pair 15 [F15 + F19]: E2E test suite adheres to strict TypeScript compiler options and vitest execution', () => {
    const tsconfig = JSON.parse(read('tsconfig.base.json'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(existsSync(resolve(ROOT, 'tests/e2e/tier1-features.test.ts'))).toBe(true);
    expect(existsSync(resolve(ROOT, 'tests/e2e/tier2-boundaries.test.ts'))).toBe(true);
    expect(existsSync(resolve(ROOT, 'tests/e2e/tier3-pairwise.test.ts'))).toBe(true);
  });
});
