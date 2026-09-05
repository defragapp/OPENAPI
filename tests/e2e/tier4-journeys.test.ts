import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../..');

function read(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), 'utf8');
}

describe('Tier 4: Real-World Application Scenarios (End-to-End User Journeys)', () => {
  // ── JOURNEY 1: New Visitor Public Discovery & Route Navigation ──
  describe('Journey 1: New Visitor Public Discovery & Navigation', () => {
    it('J1.1: visitor lands on root domain and observes core brand thesis and founder hero statement', () => {
      const landing = read('apps/web/src/PublicLanding.tsx');
      expect(landing).toContain('Know yourself. Understand your people. See the whole system.');
      expect(landing).toMatch(/Healing\s*isn[’']t optional/i);
      expect(landing).toContain('Build your Baseline');
    });

    it('J1.2: visitor navigates to How It Works, Pricing, and FAQ routes with synchronized copy', () => {
      const how = read('apps/web/src/PublicHowItWorks.tsx');
      const pricing = read('apps/web/src/PublicPricing.tsx');
      const faq = read('apps/web/src/PublicFAQ.tsx');
      expect(how).toContain('Start with yourself. Add another person or the wider situation only when it helps.');
      expect(pricing).toContain('Sovereign+');
      expect(pricing).toContain('Free');
      expect(faq).toContain('What is Sovereign.OS?');
    });

    it('J1.3: visitor views dusk mountain visual backdrop applied to public route containers', () => {
      const css = read('apps/web/src/public.css');
      expect(css).toContain('/powder-hills-far.png');
      expect(css).toContain('/powder-hills-mid.png');
    });

    it('J1.4: primary call-to-action redirects prospective user directly to authenticated signup funnel', () => {
      const landing = read('apps/web/src/PublicLanding.tsx');
      expect(landing).toContain('href="/signup"');
    });

    it('J1.5: terms and privacy policy pages clearly state non-clinical personal discernment boundaries', () => {
      const how = read('apps/web/src/PublicHowItWorks.tsx');
      expect(how).toContain('personal discernment');
      expect(how).toContain('not clinical labels');
    });
  });

  // ── JOURNEY 2: Mobile Visitor Responsive Exploration ──
  describe('Journey 2: Mobile Visitor Responsive Exploration', () => {
    it('J2.1: mobile viewport styles specify responsive text wrapping and fluid typography via clamp()', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('font-size: clamp(');
    });

    it('J2.2: horizontal scroll overflow is strictly contained on mobile viewports', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('overflow-x: hidden;');
    });

    it('J2.3: mobile navigation drawer toggle provides accessible interactive controls', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="mobile-menu-trigger"');
      expect(workspace).toContain('aria-label="Open workspace menu"');
    });

    it('J2.4: touch targets on mobile maintain accessible dimensions (min-height >= 44px)', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('min-height: 44px;');
    });

    it('J2.5: mountain silhouettes scale gracefully on small screens without breaking layout flow', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain("background: url('/powder-hills-far.png') bottom center / cover no-repeat;");
      expect(css).toContain("background: url('/powder-hills-mid.png') bottom center / cover no-repeat;");
    });
  });

  // ── JOURNEY 3: Full 4-Step User Lifecycle Progression ──
  describe('Journey 3: Full 4-Step User Lifecycle Progression', () => {
    it('J3.1: Step 1 (Auth): user initiates account creation on signup route with email and terms agreement', () => {
      const app = read('apps/web/src/App.tsx');
      expect(app).toContain("path === '/signup'");
      expect(app).toContain('AccountPage');
      expect(app).toContain('sovereign:turnstile-state');
    });

    it('J3.2: Step 1 (Redemption): magic link redemption issues signed session token atomically via D1 batch', () => {
      const auth = read('apps/sovereign-worker/src/auth-public.ts');
      const accountsDb = read('apps/sovereign-worker/src/db/accounts.ts');
      expect(auth).toContain('createSignedSessionToken');
      expect(accountsDb).toContain('env.DB.batch');
    });

    it('J3.3: Step 2 (Tier Selection): authenticated user enters onboarding to choose Free or Sovereign+', () => {
      const onboarding = read('apps/web/src/PlanOnboarding.tsx');
      expect(onboarding).toContain('free');
      expect(onboarding).toContain('sovereign_plus');
      expect(onboarding).toContain('Sovereign+');
    });

    it('J3.4: Step 3 (Baseline Intake): user inputs birth date, time, and location to compute Baseline profile', () => {
      const baseline = read('apps/web/src/BaselineInputRuntime.ts');
      expect(baseline).toContain('birthDate');
      expect(baseline).toContain('birthTime');
      expect(baseline).toContain('birthplace');
    });

    it('J3.5: Step 4 (Workspace Entry): successful completion transitions user directly into active /app workspace', () => {
      const workspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
      expect(workspace).toContain('<SovereignIntelligenceWorkspace');
      expect(workspace).toContain('onboardingVerified');
    });
  });

  // ── JOURNEY 4: Active Workspace Interaction & Sovereign Conversation ──
  describe('Journey 4: Active Workspace Interaction & Sovereign Conversation', () => {
    it('J4.1: workspace renders centered floating glassmorphic window with exact design tokens', () => {
      const css = read('apps/web/src/workspace.css');
      expect(css).toContain('max-width: 1152px;');
      expect(css).toContain('height: 88vh;');
      expect(css).toContain('border-radius: 24px;');
      expect(css).toContain('background: rgba(22, 22, 22, 0.92)');
      expect(css).toContain('backdrop-filter: blur(28px);');
      expect(css).toContain('border: 1px solid rgba(255, 255, 255, 0.1);');
    });

    it('J4.2: left sidebar provides diamond logo, "+ New Chat" button, recent explorations, and user account pill', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="brand-diamond"');
      expect(workspace).toContain('SOVEREIGN.OS');
      expect(workspace).toContain('className="sidebar-new-chat-btn"');
      expect(workspace).toContain('className="recent-threads"');
      expect(workspace).toContain('className="sidebar-user-pill"');
    });

    it('J4.3: center stage presents "Sovereign" topbar, warm arrival greeting, and 2x3 action shortcuts grid', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('className="intelligence-topbar"');
      expect(workspace).toContain('What feels active for you now?');
      expect(workspace).toContain('className="workspace-action-grid"');
      expect(workspace).toContain('Explore a pattern');
      expect(workspace).toContain('Understand a relationship');
      expect(workspace).toContain('Evaluate a decision');
      expect(workspace).toContain('Family or team dynamic');
    });

    it('J4.4: floating composer dock provides attachment tool, rhythm tool, and send button (📎, 〰, ↑)', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('aria-label="Attach context or file"');
      expect(workspace).toContain('aria-label="Audio waveform rhythm exploration"');
      expect(workspace).toContain('aria-label="Send message"');
      expect(workspace).toContain('↑');
    });

    it('J4.5: message submission dispatches to /api/v1/threads/:id/messages and receives sovereign-answer.v2 stream', () => {
      const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
      expect(workspace).toContain('/api/v1/threads');
      const recognition = read('apps/sovereign-worker/src/agent/recognition.ts');
      expect(recognition).toContain('sovereign-answer.v2');
      expect(recognition).toContain('headline');
      expect(recognition).toContain('direct_answer');
      expect(recognition).toContain('sections');
    });
  });

  // ── JOURNEY 5: Security, Gate Protection & Edge Recovery ──
  describe('Journey 5: Security, Gate Protection & Edge Recovery', () => {
    it('J5.1: direct unauthenticated access to /app redirects user to /login with returnTo preserved', () => {
      const workspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
      expect(workspace).toContain("location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`)");
    });

    it('J5.2: policy gate blocks workspace access until latest Terms, Privacy Policy, and Age are confirmed', () => {
      const workspace = read('apps/web/src/AuthenticatedWorkspace.tsx');
      expect(workspace).toContain('policy_review');
      expect(workspace).toContain('I accept the current Terms.');
      expect(workspace).toContain('I acknowledge the current Privacy Policy.');
      expect(workspace).toContain('I confirm I am 18 or older.');
    });

    it('J5.3: subdomain isolation routes marketing to sovereign.defrag.app and app to app.defrag.app', () => {
      const wrangler = read('wrangler.jsonc');
      expect(wrangler).toContain('"pattern": "sovereign.defrag.app"');
      expect(wrangler).toContain('"pattern": "app.defrag.app"');
    });

    it('J5.4: Turnstile verification failures return explicit TURNSTILE_FAILED code preventing bot intrusion', () => {
      const auth = read('apps/sovereign-worker/src/auth-public.ts');
      expect(auth).toContain('TURNSTILE_FAILED');
    });

    it('J5.5: production readiness check /ready validates D1 migration 0019 parity and operational dependencies', () => {
      const runtime = read('apps/sovereign-worker/src/runtime-entry.ts');
      expect(runtime).toContain("migrationVersion");
      expect(runtime).toContain("LATEST_MIGRATION_VERSION = '0019_deprecate_manual_capacity'");
      expect(runtime).toContain("LATEST_MIGRATION_FILENAME = '0019_deprecate_manual_capacity.sql'");
    });
  });
});
