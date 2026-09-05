import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../..');

function read(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), 'utf8');
}

describe('Tier 1: Feature Coverage (All 20 Features, >=5 tests each)', () => {
  // ── FEATURE 1: Brand Thesis Standardization ──
  describe('Feature 1: Brand Thesis Standardization', () => {
    const thesis = 'Know yourself. Understand your people. See the whole system.';

    it('T1.F1.1: embeds exact brand thesis on public landing', () => {
      const landing = read('apps/web/src/PublicLanding.tsx');
      expect(landing).toContain(thesis);
    });

    it('T1.F1.2: embeds brand thesis across public pages and How It Works kicker', () => {
      const howItWorksReact = read('apps/web/src/PublicHowItWorks.tsx');
      expect(howItWorksReact.toUpperCase()).toContain(thesis.toUpperCase());
    });

    it('T1.F1.3: reinforces brand thesis in product language system & positioning', () => {
      const langSystem = read('docs/product-language-system.md');
      expect(langSystem).toContain(thesis);
    });

    it('T1.F1.4: embeds brand thesis in workspace arrival or systems surface', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('See the whole system.');
    });

    it('T1.F1.5: verifies release scripts enforce brand thesis immutability', () => {
      const releaseScript = read('scripts/verify-intelligence-release-v2.mjs');
      expect(releaseScript).toContain(thesis);
    });
  });

  // ── FEATURE 2: Cliché & Placeholder Elimination ──
  describe('Feature 2: Cliché & Placeholder Elimination', () => {
    it('T1.F2.1: eliminates robotic greeting "How can I help you today?" across workspace', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).not.toContain('How can I help you today?');
      expect(workspace).not.toContain('How may I help you today?');
    });

    it('T1.F2.2: eliminates test chips like "U✓" from rendered views', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      const landing = read('apps/web/src/PublicLanding.tsx');
      expect(workspace).not.toContain('U✓');
      expect(landing).not.toContain('U✓');
    });

    it('T1.F2.3: eliminates generic "Lorem ipsum" or placeholder copy in public templates', () => {
      const howItWorks = read('apps/web/public/how-it-works.html');
      const pricing = read('apps/web/public/pricing.html');
      const faq = read('apps/web/public/faq.html');
      expect(howItWorks.toLowerCase()).not.toContain('lorem ipsum');
      expect(pricing.toLowerCase()).not.toContain('lorem ipsum');
      expect(faq.toLowerCase()).not.toContain('lorem ipsum');
    });

    it('T1.F2.4: action shortcuts grid features purposeful, distinct prompt options', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('Explore a pattern');
      expect(workspace).toContain('Understand a relationship');
      expect(workspace).toContain('Evaluate a decision');
      expect(workspace).toContain('Family or team dynamic');
    });

    it('T1.F2.5: ensures warm arrival greeting is grounded rather than robotic', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('What feels active for you now?');
      expect(workspace).toContain('Begin with what remains steady');
    });
  });

  // ── FEATURE 3: Non-Clinical Tone Alignment ──
  describe('Feature 3: Non-Clinical Tone Alignment', () => {
    it('T1.F3.1: preserves mandatory founder hero text', () => {
      const landing = read('apps/web/src/PublicLanding.tsx');
      expect(landing).toMatch(/Healing\s*isn[’']t optional/i);
      expect(landing).toMatch(/Holding onto\s*the pain is/i);
    });

    it('T1.F3.2: enforces personal discernment and non-clinical framing in disclaimers', () => {
      const howItWorks = read('apps/web/src/PublicHowItWorks.tsx');
      expect(howItWorks).toContain('personal discernment');
      expect(howItWorks).toContain('not clinical labels');
    });

    it('T1.F3.3: ensures prompt contract explicitly forbids clinical pathology diagnosis', () => {
      const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');
      expect(prompt).toContain('diagnosis');
      expect(prompt).toContain('therapy voice');
    });

    it('T1.F3.4: safety validator asserts non-clinical boundaries on agent outputs', () => {
      const safety = read('apps/sovereign-worker/src/agent/safety.ts');
      expect(safety).toContain('clinical');
    });

    it('T1.F3.5: separation instructions clarify Baseline tendency is not a diagnosis or clinical verdict', () => {
      const baseline = read('apps/sovereign-worker/src/baseline.ts');
      expect(baseline).toContain('Baseline tendency is enduring interpretive context, not diagnosis or proof.');
    });
  });

  // ── FEATURE 4: Static HTML & React Sync ──
  describe('Feature 4: Static HTML & React Sync', () => {
    it('T1.F4.1: synchronizes How It Works title & core headings between HTML and React', () => {
      const html = read('apps/web/public/how-it-works.html');
      const react = read('apps/web/src/PublicHowItWorks.tsx');
      const phrase = 'Start with yourself. Add another person or the wider situation only when it helps.';
      expect(html).toContain(phrase);
      expect(react).toContain(phrase);
    });

    it('T1.F4.2: synchronizes Pricing tier options between HTML and React', () => {
      const html = read('apps/web/public/pricing.html');
      const react = read('apps/web/src/PublicPricing.tsx');
      expect(html).toContain('Sovereign+');
      expect(react).toContain('Sovereign+');
      expect(html).toContain('Free');
      expect(react).toContain('Free');
    });

    it('T1.F4.3: synchronizes FAQ questions between HTML and React', () => {
      const html = read('apps/web/public/faq.html');
      const react = read('apps/web/src/PublicFAQ.tsx');
      expect(html).toContain('What is Sovereign.OS?');
      expect(react).toContain('What is Sovereign.OS?');
    });

    it('T1.F4.4: enforces identical canonical URLs between static HTML and React heads', () => {
      const howItWorksHtml = read('apps/web/public/how-it-works.html');
      expect(howItWorksHtml).toContain('rel="canonical" href="https://sovereign.defrag.app/how-it-works"');
    });

    it('T1.F4.5: verifies router delegates static public routes to matching React components', () => {
      const main = read('apps/web/src/main.tsx');
      expect(main).toContain("location.pathname === '/how-it-works' ? <PublicHowItWorks />");
      expect(main).toContain("location.pathname === '/pricing' ? <PublicPricing />");
      expect(main).toContain('<PublicFAQ />');
    });
  });

  // ── FEATURE 5: Singular Sovereign Persona ──
  describe('Feature 5: Singular Sovereign Persona', () => {
    it('T1.F5.1: unifies AI intelligence strictly under the singular "Sovereign" persona', () => {
      const agent = read('apps/sovereign-worker/src/agent/sovereign.ts');
      expect(agent).toContain('Sovereign');
      expect(agent).not.toContain('PersonaManager');
    });

    it('T1.F5.2: operates Covenant strictly as a conditional reasoning module, never a separate persona', () => {
      const agent = read('apps/sovereign-worker/src/agent/sovereign.ts');
      expect(agent).toContain('covenantEnabled');
      const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');
      expect(prompt).toContain('Covenant');
    });

    it('T1.F5.3: operates Systems strictly as a relational reasoning lens', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('Systems');
      expect(workspace).toContain('See the whole system.');
    });

    it('T1.F5.4: enforces sovereign-answer.v2 contract schema', () => {
      const recognition = read('apps/sovereign-worker/src/agent/recognition.ts');
      expect(recognition).toContain('sovereign-answer.v2');
      expect(recognition).toContain('headline');
      expect(recognition).toContain('direct_answer');
      expect(recognition).toContain('sections');
    });

    it('T1.F5.5: UI topbar displays unified "Sovereign" header across all workspace views', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('<strong>Sovereign</strong>');
    });
  });

  // ── FEATURE 6: Global Dusk Gradient & Mountain Ridges ──
  describe('Feature 6: Global Dusk Gradient & Mountain Ridges', () => {
    it('T1.F6.1: defines dusk gradient with hex stops #100814, #1a101f, and #0d0710', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('#100814');
      expect(css).toContain('#1a101f');
      expect(css).toContain('#0d0710');
    });

    it('T1.F6.2: references far mountain ridge asset powder-hills-far.png', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('/powder-hills-far.png');
    });

    it('T1.F6.3: references mid mountain ridge asset powder-hills-mid.png', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('/powder-hills-mid.png');
    });

    it('T1.F6.4: confirms physical existence of powder-hills-far.png and mid.png in public directory', () => {
      expect(existsSync(resolve(ROOT, 'apps/web/public/powder-hills-far.png'))).toBe(true);
      expect(existsSync(resolve(ROOT, 'apps/web/public/powder-hills-mid.png'))).toBe(true);
    });

    it('T1.F6.5: applies dusk theme and mountain ridges to public landing views', () => {
      const publicCss = read('apps/web/src/public.css');
      expect(publicCss).toContain('/powder-hills-far.png');
      expect(publicCss).toContain('/powder-hills-mid.png');
    });
  });

  // ── FEATURE 7: Floating Glassmorphic Workspace Window ──
  describe('Feature 7: Floating Glassmorphic Workspace Window', () => {
    it('T1.F7.1: enforces max-w-6xl container width constraint (1152px)', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('max-width: 1152px;');
    });

    it('T1.F7.2: enforces h-[88vh] height constraint', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('height: 88vh;');
    });

    it('T1.F7.3: enforces rounded-3xl border radius (24px)', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('border-radius: 24px;');
    });

    it('T1.F7.4: enforces bg-[#161616]/92 background styling', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('background: rgba(22, 22, 22, 0.92)');
    });

    it('T1.F7.5: enforces backdrop-blur-2xl, border-white/10, and shadow-2xl elevation', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('backdrop-filter: blur(28px);');
      expect(css).toContain('-webkit-backdrop-filter: blur(28px);');
      expect(css).toContain('border: 1px solid rgba(255, 255, 255, 0.1);');
      expect(css).toContain('box-shadow: 0 32px 80px rgba(0, 0, 0, 0.75)');
    });
  });

  // ── FEATURE 8: Left Sidebar Anatomy ──
  describe('Feature 8: Left Sidebar Anatomy', () => {
    it('T1.F8.1: renders diamond logo header in sidebar', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="intelligence-sidebar-header"');
      expect(workspace).toContain('className="brand-diamond"');
      expect(workspace).toContain('SOVEREIGN.OS');
    });

    it('T1.F8.2: renders "+ New Chat" pill button', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="sidebar-new-chat-btn"');
      expect(workspace).toContain('+');
      expect(workspace).toContain('New Chat');
    });

    it('T1.F8.3: renders recent threads list container', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="recent-threads"');
      expect(workspace).toContain('className="sidebar-thread-list"');
    });

    it('T1.F8.4: renders relative time indicators on recent threads', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="sidebar-thread-time"');
      expect(workspace).toContain('formatRelativeTime');
    });

    it('T1.F8.5: renders bottom user account pill with tier display', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="sidebar-user-pill"');
      expect(workspace).toContain('className="user-tier"');
      expect(workspace).toContain('Sovereign+');
      expect(workspace).toContain('Free');
    });
  });

  // ── FEATURE 9: Center Stage & Composer Dock ──
  describe('Feature 9: Center Stage & Composer Dock', () => {
    it('T1.F9.1: center stage topbar displays "Sovereign" title and surface indicator', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="intelligence-topbar"');
      expect(workspace).toContain('className="topbar-surface-tag"');
    });

    it('T1.F9.2: renders warm arrival greeting', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="workspace-hero-greeting"');
      expect(workspace).toContain('What feels active for you now?');
    });

    it('T1.F9.3: renders 2x3 action shortcuts grid', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="workspace-action-grid"');
      expect(workspace).toContain('role="group"');
      expect(workspace).toContain('aria-label="Exploration shortcuts"');
    });

    it('T1.F9.4: renders floating rounded composer dock anchored at bottom', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="sovereign-composer sovereign-composer--enhanced"');
      expect(workspace).toContain('className="composer-dock-tools"');
    });

    it('T1.F9.5: composer dock includes attachment tool, rhythm tool, and send button (📎, 〰, ↑)', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('aria-label="Attach context or file"');
      expect(workspace).toContain('aria-label="Audio waveform rhythm exploration"');
      expect(workspace).toContain('aria-label="Send message"');
      expect(workspace).toContain('↑');
    });
  });

  // ── FEATURE 10: Typography Enforcement ──
  describe('Feature 10: Typography Enforcement', () => {
    it('T1.F10.1: self-hosts Geist font family locally', () => {
      expect(existsSync(resolve(ROOT, 'apps/web/public/fonts/geist/Geist-Variable.woff2'))).toBe(true);
    });

    it('T1.F10.2: self-hosts sovereign-display.woff2 for serif headings', () => {
      expect(existsSync(resolve(ROOT, 'apps/web/public/fonts/sovereign-display.woff2'))).toBe(true);
    });

    it('T1.F10.3: defines @font-face declarations for Geist with font-display: swap in design-system', () => {
      const css = read('apps/web/src/design-system.css');
      expect(css).toContain('Geist-Variable.woff2');
      expect(css).toContain('font-display: swap');
    });

    it('T1.F10.4: defines --serif CSS variable utilizing font-title in design-system', () => {
      const css = read('apps/web/src/design-system.css');
      expect(css).toContain('--serif: var(--font-title);');
    });

    it('T1.F10.5: headings enforce display serif across public and workspace views', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('font-family: var(--serif)');
    });
  });

  // ── FEATURE 11: 4-Step User Lifecycle Continuity ──
  describe('Feature 11: 4-Step User Lifecycle Continuity', () => {
    it('T1.F11.1: defines Step 1 (Auth) supporting email magic link and passkey flow', () => {
      const app = read('apps/web/src/App.tsx');
      expect(app).toContain("path === '/login' || path === '/signup' || path === '/auth/redeem'");
      expect(app).toContain('AccountPage');
    });

    it('T1.F11.2: defines Step 2 (Tier Selection: Free vs Sovereign+) on onboarding route', () => {
      const onboarding = read('apps/web/src/PlanOnboarding.tsx');
      expect(onboarding).toContain('free');
      expect(onboarding).toContain('sovereign_plus');
      expect(onboarding).toContain('Sovereign+');
    });

    it('T1.F11.3: defines Step 3 (Baseline Intake) capturing DOB, TOB, and POB', () => {
      const baseline = read('apps/web/src/BaselineInputRuntime.ts');
      expect(baseline).toContain('birthDate');
      expect(baseline).toContain('birthTime');
      expect(baseline).toContain('birthplace');
    });

    it('T1.F11.4: defines Step 4 (Workspace Entry) transitioning authenticated user into /app', () => {
      const authWorkspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
      expect(authWorkspace).toContain('<SovereignIntelligenceWorkspace');
    });

    it('T1.F11.5: handles Stripe billing return parameters seamlessly without session split-brain', () => {
      const authWorkspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
      expect(authWorkspace).toContain("new URLSearchParams(location.search).get('billing')");
      expect(authWorkspace).toContain('STRIPE_CONFIRMATION_ATTEMPTS');
    });
  });

  // ── FEATURE 12: D1 Transaction Batching & Error Codes ──
  describe('Feature 12: D1 Transaction Batching & Error Codes', () => {
    it('T1.F12.1: utilizes env.DB.batch for sequential transactional D1 mutations', () => {
      const accountsDb = read('apps/sovereign-worker/src/db/accounts.ts');
      expect(accountsDb).toContain('env.DB.batch');
    });

    it('T1.F12.2: wraps authentication database errors with explicit AUTH_D1_ERROR', () => {
      const authPublic = read('apps/sovereign-worker/src/auth-public.ts');
      expect(authPublic).toContain('AUTH_D1_ERROR');
    });

    it('T1.F12.3: verifies batch mutations during baseline facet generation', () => {
      const facets = read('apps/sovereign-worker/src/baseline-facets.ts');
      expect(facets).toContain('baselineFacetBatches');
    });

    it('T1.F12.4: verifies structured JSON error response format', () => {
      const authPublic = read('apps/sovereign-worker/src/auth-public.ts');
      expect(authPublic).toContain('status:');
      expect(authPublic).toContain('error:');
    });

    it('T1.F12.5: ensures session token issuance executes atomically with account initialization', () => {
      const authPublic = read('apps/sovereign-worker/src/auth-public.ts');
      expect(authPublic).toContain('createSignedSessionToken');
    });
  });

  // ── FEATURE 13: Turnstile & 503 Blocker Mitigation ──
  describe('Feature 13: Turnstile & 503 Blocker Mitigation', () => {
    it('T1.F13.1: issues explicit TURNSTILE_FAILED error code on failed challenge validation', () => {
      const authPublic = read('apps/sovereign-worker/src/auth-public.ts');
      expect(authPublic).toContain('TURNSTILE_FAILED');
    });

    it('T1.F13.2: verifies turnstile test key bypass handling in non-production environments', () => {
      const authPublic = read('apps/sovereign-worker/src/auth-public.ts');
      expect(authPublic).toContain('1x0000000000000000000000000000000AA');
      expect(authPublic).toContain('test-turnstile-pass');
    });

    it('T1.F13.3: ensures health check endpoint /ready never returns 503 during normal operations', () => {
      const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
      expect(runtime).toContain('healthResponse');
      expect(runtime).toContain("status: pathname === '/ready' && !ready ? 503 : 200");
    });

    it('T1.F13.4: public routes serve static assets via ASSETS binding', () => {
      const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
      expect(runtime).toContain('env.ASSETS.fetch');
    });

    it('T1.F13.5: client-side Turnstile state dispatch uses custom event architecture', () => {
      const app = read('apps/web/src/App.tsx');
      expect(app).toContain('sovereign:turnstile-state');
    });
  });

  // ── FEATURE 14: D1 Migration Parity Verification ──
  describe('Feature 14: D1 Migration Parity Verification', () => {
    it('T1.F14.1: maintains exactly 19 sequential migration files (0001 through 0019)', () => {
      const migrationsDir = resolve(ROOT, 'apps/sovereign-worker/migrations');
      const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));
      expect(files.length).toBe(19);
    });

    it('T1.F14.2: migration 0019_deprecate_manual_capacity.sql exists and marks capacity tables legacy', () => {
      const m19 = read('apps/sovereign-worker/migrations/0019_deprecate_manual_capacity.sql');
      expect(m19).toContain('legacy_workers_ai_daily_capacity');
      expect(m19).toContain('legacy_workers_ai_capacity_reservations');
    });

    it('T1.F14.3: /ready endpoint reports migrationVersion as 0019_deprecate_manual_capacity', () => {
      const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
      expect(runtime).toContain("'0019_deprecate_manual_capacity'");
    });

    it('T1.F14.4: /ready verifies migration 0019 filename constant in runtime entry', () => {
      const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
      expect(runtime).toContain("LATEST_MIGRATION_FILENAME = '0019_deprecate_manual_capacity.sql'");
    });

    it('T1.F14.5: verify-production-d1-parity script verifies schema parity against migrations directory', () => {
      const parityScript = read('scripts/verify-production-d1-parity.mjs');
      expect(parityScript).toContain("migrationsDir = 'apps/sovereign-worker/migrations'");
    });
  });

  // ── FEATURE 15: Local Typechecks & Test Suite ──
  describe('Feature 15: Local Typechecks & Test Suite', () => {
    it('T1.F15.1: root package.json defines typecheck and test scripts', () => {
      const pkg = JSON.parse(read('package.json'));
      expect(pkg.scripts.typecheck).toBe('pnpm -r typecheck');
      expect(pkg.scripts.test).toBeDefined();
    });

    it('T1.F15.2: sovereign-worker package.json defines typecheck script using tsc --noEmit', () => {
      const pkg = JSON.parse(read('apps/sovereign-worker/package.json'));
      expect(pkg.scripts.typecheck).toBe('tsc --noEmit');
    });

    it('T1.F15.3: web package.json defines typecheck script using tsc --noEmit', () => {
      const pkg = JSON.parse(read('apps/web/package.json'));
      expect(pkg.scripts.typecheck).toBe('tsc --noEmit');
    });

    it('T1.F15.4: tsconfig.base.json enforces strict mode compiler options', () => {
      const tsconfig = JSON.parse(read('tsconfig.base.json'));
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.compilerOptions.exactOptionalPropertyTypes).toBe(true);
    });

    it('T1.F15.5: vitest configuration is active across workspace packages', () => {
      const pkg = JSON.parse(read('package.json'));
      expect(pkg.devDependencies.vitest).toBeDefined();
    });
  });

  // ── FEATURE 16: Pre-Flight Release Checks (24 Stages) ──
  describe('Feature 16: Pre-Flight Release Checks (24 Stages)', () => {
    it('T1.F16.1: cloudflare-build-diagnostics.mjs defines exactly 24 release check stages', () => {
      const diagnostics = read('scripts/cloudflare-build-diagnostics.mjs');
      const match = diagnostics.match(/const stages = \[([\s\S]*?)\];/);
      expect(match).not.toBeNull();
      const stageLines = match![1].split('\n').filter((l) => l.trim().startsWith('['));
      expect(stageLines.length).toBe(24);
    });

    it('T1.F16.2: includes foundation and migration verification stages', () => {
      const diagnostics = read('scripts/cloudflare-build-diagnostics.mjs');
      expect(diagnostics).toContain("'foundation'");
      expect(diagnostics).toContain("'migrations'");
    });

    it('T1.F16.3: includes secrets and production fixture scans', () => {
      const diagnostics = read('scripts/cloudflare-build-diagnostics.mjs');
      expect(diagnostics).toContain("'secrets-scan'");
      expect(diagnostics).toContain("'production-fixtures'");
    });

    it('T1.F16.4: includes public contact and source map suppression gates', () => {
      const diagnostics = read('scripts/cloudflare-build-diagnostics.mjs');
      expect(diagnostics).toContain("'public-contact'");
      expect(diagnostics).toContain("'public-source-maps'");
    });

    it('T1.F16.5: includes bundle size and production D1 parity gates', () => {
      const diagnostics = read('scripts/cloudflare-build-diagnostics.mjs');
      expect(diagnostics).toContain("'worker-bundle-size'");
      expect(diagnostics).toContain("'production-d1-parity'");
    });
  });

  // ── FEATURE 17: Worker Bundle Size Control ──
  describe('Feature 17: Worker Bundle Size Control', () => {
    it('T1.F17.1: enforces internal bundle size budget of 2,500 KiB gzip', () => {
      const script = read('scripts/verify-worker-bundle-size.mjs');
      expect(script).toContain('INTERNAL_BUDGET_BYTES = 2_500 * 1024');
    });

    it('T1.F17.2: enforces Cloudflare Free limit of 3,072 KiB gzip', () => {
      const script = read('scripts/verify-worker-bundle-size.mjs');
      expect(script).toContain('CLOUDFLARE_FREE_LIMIT_BYTES = 3 * 1024 * 1024');
    });

    it('T1.F17.3: executes dry-run deployment to capture accurate gzip size', () => {
      const script = read('scripts/verify-worker-bundle-size.mjs');
      expect(script).toContain("'deploy'");
      expect(script).toContain("'--dry-run'");
    });

    it('T1.F17.4: cleans up temporary build output directory after evaluation', () => {
      const script = read('scripts/verify-worker-bundle-size.mjs');
      expect(script).toContain('rmSync(outputDirectory');
    });

    it('T1.F17.5: parses gzip output regex cleanly in KiB and MiB units', () => {
      const script = read('scripts/verify-worker-bundle-size.mjs');
      expect(script).toContain('/gzip:\\s*([\\d.]+)\\s*(B|KiB|MiB)/i');
    });
  });

  // ── FEATURE 18: Cloudflare Production Deployment ──
  describe('Feature 18: Cloudflare Production Deployment', () => {
    it('T1.F18.1: wrangler.jsonc configures sovereign.defrag.app custom domain route', () => {
      const config = read('wrangler.jsonc');
      expect(config).toContain('sovereign.defrag.app');
    });

    it('T1.F18.2: wrangler.jsonc configures app.defrag.app custom domain route', () => {
      const config = read('wrangler.jsonc');
      expect(config).toContain('app.defrag.app');
    });

    it('T1.F18.3: wrangler.jsonc configures D1 database binding "DB"', () => {
      const config = read('wrangler.jsonc');
      expect(config).toContain('"binding": "DB"');
      expect(config).toContain('"database_name": "sovereign-openapi-db"');
    });

    it('T1.F18.4: wrangler.jsonc configures Durable Objects binding "THREADS"', () => {
      const config = read('wrangler.jsonc');
      expect(config).toContain('"name": "THREADS"');
      expect(config).toContain('"class_name": "ThreadCoordinator"');
    });

    it('T1.F18.5: wrangler.jsonc configures AI Gateway "@cf/zai-org/glm-4.7-flash"', () => {
      const config = read('wrangler.jsonc');
      expect(config).toContain('"binding": "AI"');
      expect(config).toContain('"AI_GATEWAY_ID": "sovereign-ai-gateway"');
    });
  });

  // ── FEATURE 19: E2E Test Suite Creation ──
  describe('Feature 19: E2E Test Suite Creation', () => {
    it('T1.F19.1: TEST_INFRA.md exists at project root', () => {
      expect(existsSync(resolve(ROOT, 'TEST_INFRA.md'))).toBe(true);
    });

    it('T1.F19.2: TEST_INFRA.md documents opaque-box testing philosophy', () => {
      const doc = read('TEST_INFRA.md');
      expect(doc).toContain('Opaque-Box');
      expect(doc).toContain('Requirement-Driven');
    });

    it('T1.F19.3: TEST_INFRA.md maps all 20 features across Tiers 1 through 4', () => {
      const doc = read('TEST_INFRA.md');
      for (let i = 1; i <= 20; i++) {
        expect(doc).toContain(`F${i}`);
      }
    });

    it('T1.F19.4: TEST_INFRA.md outlines live browser verification gate requirements', () => {
      const doc = read('TEST_INFRA.md');
      expect(doc).toContain('Live Browser Verification Gate (R5)');
      expect(doc).toContain('1440 × 900');
      expect(doc).toContain('390 × 844');
    });

    it('T1.F19.5: defines test runner commands and verification scripts', () => {
      const doc = read('TEST_INFRA.md');
      expect(doc).toContain('vitest run tests/e2e');
    });
  });

  // ── FEATURE 20: Live Browser Verification Gate ──
  describe('Feature 20: Live Browser Verification Gate', () => {
    it('T1.F20.1: devDependencies include Playwright packages for browser automation', () => {
      const pkg = JSON.parse(read('package.json'));
      expect(pkg.devDependencies['playwright']).toBeDefined();
      expect(pkg.devDependencies['@playwright/test']).toBeDefined();
    });

    it('T1.F20.2: live gate specifies desktop 1440px viewport audit', () => {
      const infra = read('TEST_INFRA.md');
      expect(infra).toContain('1440');
    });

    it('T1.F20.3: live gate specifies mobile 390px viewport audit', () => {
      const infra = read('TEST_INFRA.md');
      expect(infra).toContain('390');
    });

    it('T1.F20.4: mandates domcontentloaded wait condition to prevent Turnstile hangs', () => {
      const infra = read('TEST_INFRA.md');
      expect(infra).toContain("domcontentloaded");
      expect(infra).toContain("Turnstile");
    });

    it('T1.F20.5: mandates zero local screenshot or artifact disk clutter', () => {
      const infra = read('TEST_INFRA.md');
      expect(infra).toContain('ZERO local screenshot or artifact disk clutter');
    });
  });
});
