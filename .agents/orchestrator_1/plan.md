# Sovereign.OS Public Launch Plan

## Overview
Drive Sovereign.OS to public launch completion across 4 parallel tracks and execute live verification gates:
- R1: Holistic Copy & Tone Audit
- R2: Strict Visual Design Cohesion (Powder template)
- R3: Auth, Baseline, & Workspace Lifecycle
- R4: Automated Release Gates & Cloudflare Production Deployment
- R5: Active Live Browser Verification Gate

## Phases

### Phase 0: Survey & Codebase Inventory
- Spawn 3 Explorers in parallel:
  - **Explorer 1 (survey_copy_visual)**: Audit routes (`/`, `/how-it-works`, `/pricing`, `/faq`, `/login`, `/signup`, `/onboarding`, `/app`), check copy placeholders/jargon, check CSS/Tailwind, Powder styling assets (`powder-hills-far.png`, `powder-hills-mid.png`), glassmorphic tokens, sidebar, topbar, dock.
  - **Explorer 2 (survey_auth_d1_ai)**: Audit auth flow (`/login`, `/signup`, `/onboarding`), tier selection, baseline intake, D1 migrations (`0001` through `0019`), transactional batching, error codes (`AUTH_D1_ERROR`, `TURNSTILE_FAILED`), and AI module architecture (unifying into singular "Sovereign" persona with conditional Covenant/Systems modules).
  - **Explorer 3 (survey_build_test_deploy)**: Inspect `package.json`, pnpm workspace, `typecheck`, `test`, `verify:cloudflare-build`, `production:deploy`, wrangler.toml/json, `/ready` health route, and E2E test harness.
- Synthesize findings into `/Users/cjo/OPENAPI/PROJECT.md` with Feature Inventory, Milestones, and Interface Contracts.

### Phase 1: Dual Track Execution
#### Track 1: Implementation
- **Milestone 1: Copy, Tone, & Persona Alignment (R1 & Persona from R3)**
  - Unify brand copy around *"Know yourself. Understand your people. See the whole system."*
  - Eliminate clinical/medical jargon and robotic placeholders across all routes.
  - Unify AI intelligence into singular "Sovereign" persona (Covenant and Systems as conditional reasoning modules).
- **Milestone 2: Visual Design Cohesion (R2)**
  - Powder dusk background gradient (`#100814` to `#1a101f` to `#0d0710`), hills silhouettes.
  - Centered floating glassmorphic workspace (`max-w-6xl`, `h-[88vh]`, `rounded-3xl`, `bg-[#161616]/92`, `backdrop-blur-2xl`, `border border-white/10`, `shadow-2xl`).
  - Refurbished sidebar, topbar, greeting, 2x3 action shortcuts, rounded composer dock.
  - Typography enforcement (Geist Sans and serifs).
- **Milestone 3: Auth, Baseline, & Workspace Lifecycle (R3)**
  - 4-step lifecycle: Auth -> Tier Selection -> Baseline Intake -> Workspace Entry.
  - Fix 503 / Turnstile issues, transactional D1 batching, explicit error codes.
  - Verify all 19 D1 migrations applied and in full parity.
- **Milestone 4: Automated Release Gates & Production Deploy (R4)**
  - `pnpm -r typecheck` exit code 0.
  - `pnpm test` exit code 0.
  - `pnpm verify:cloudflare-build` 24 release checks pass, <=2500 KiB gzip.
  - Cloudflare deployment via `pnpm production:deploy`.
  - Validate `https://sovereign.defrag.app/ready`.

#### Track 2: E2E Testing & Live Browser Verification
- Design comprehensive E2E test suite (Tiers 1-4) published as `TEST_READY.md`.
- **R5 Live Browser Verification Gate**:
  - Headless browser verification on desktop (1440px) and mobile (390px) against live production.
  - Live user journey: sign up / login -> tier selection -> baseline intake -> workspace entry -> submit prompt -> verify streaming response from Sovereign.
  - Ensure zero local screenshot/artifact clutter.

### Phase 2: Independent Forensic Audit & Final Signoff
- Run Forensic Auditor on all changes to ensure genuine implementation with zero hardcoding or facade tricks.
- Compile completion evidence report and handoff to parent Sentinel.
