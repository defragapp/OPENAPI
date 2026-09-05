# Project: Sovereign.OS Public Launch

## Architecture
- **Monorepo Structure (pnpm workspace)**:
  - `apps/sovereign-worker`: Cloudflare Worker API & SSR edge gateway (Hono, Wrangler, D1, Durable Objects, Workers AI Gateway).
  - `apps/web`: React 19 single-page application with Vite, pure CSS design tokens, and self-hosted Geist fonts.
  - `packages/*`: Shared contracts and domain libraries (`adapter-contracts`, `agent-contracts`, `db`, `domain`, `evals`, `stripe`, `ui`).
- **Subdomain Routing & Gateway Architecture**:
  - `sovereign.defrag.app`: Public marketing & informational routes (`/`, `/how-it-works`, `/pricing`, `/faq`, `/terms`, `/privacy`).
  - `app.defrag.app`: Authenticated application routes (`/login`, `/signup`, `/onboarding`, `/app`).
  - Runtime redirects enforce strict subdomain isolation (HTTP 308).
- **AI Intelligence Pipeline**:
  - Unified "Sovereign" persona powered by Cloudflare AI Gateway (`@cf/zai-org/glm-4.7-flash`).
  - Covenant (Scripture lens) and Systems (relational/group context) operate as conditional reasoning modules.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Brand Thesis Standardization | Embed "Know yourself. Understand your people. See the whole system." across all routes, subpages, and workspace greeting. | M1 | Survey 1 (R1) |
| 2 | Cliché & Placeholder Elimination | Eliminate robotic greetings ("How can I help you today?"), test chips (`U✓`), and duplicate buttons. | M1 | Survey 1 (R1) |
| 3 | Non-Clinical Tone Alignment | Refocus clinical/medical disclaimers to sovereign personal discernment while preserving mandatory founder hero text. | M1 | Survey 1 (R1) |
| 4 | Static HTML & React Sync | Synchronize copy and structure between static HTML pages and React components for `/how-it-works`, `/pricing`, `/faq`. | M1 | Survey 1 (R1) |
| 5 | Singular Sovereign Persona | Preserve unified Sovereign persona; ensure Covenant and Systems operate strictly as conditional reasoning modules. | M1 | Survey 2 (R3) |
| 6 | Global Dusk Gradient & Mountain Ridges | Apply dusk background gradient (`#100814` to `#1a101f` to `#0d0710`) and mountain ridges (`powder-hills-far.png`, `powder-hills-mid.png`) globally. | M2 | Survey 1 (R2) |
| 7 | Floating Glassmorphic Workspace Window | Ensure `/app` maintains centered floating glassmorphic container (`max-w-6xl`, `h-[88vh]`, `rounded-3xl`, `bg-[#161616]/92`, `backdrop-blur-2xl`, `border border-white/10`, `shadow-2xl`) across all states including gates. | M2 | Survey 1 (R2) |
| 8 | Left Sidebar Anatomy | Validate diamond logo header, `+ New Chat` pill button, recent threads with relative time indicators, and bottom user account pill. | M2 | Survey 1 (R2) |
| 9 | Center Stage & Composer Dock | Validate "Sovereign" topbar, warm arrival greeting, 2x3 action shortcuts grid, and floating rounded composer dock (`📎`, `〰`, `↑`). | M2 | Survey 1 (R2) |
| 10 | Typography Enforcement | Ensure self-hosted Geist Sans across body and import `sovereign-display.woff2` for `--serif` display headings. | M2 | Survey 1 (R2) |
| 11 | 4-Step User Lifecycle Continuity | Ensure seamless progression: [Auth] -> [Tier Selection: Free vs Sovereign+] -> [Baseline Intake: DOB/TOB/POB] -> [Workspace Entry]. Fix Stripe return split-brain. | M3 | Survey 2 (R3) |
| 12 | D1 Transaction Batching & Error Codes | Batch sequential D1 mutations in `redeemMagicLink` with `env.DB.batch([...])` and wrap with explicit `AUTH_D1_ERROR`. | M3 | Survey 2 (R3) |
| 13 | Turnstile & 503 Blocker Mitigation | Ensure robust Turnstile verification and eliminate spurious 503 triggers. | M3 | Survey 2 (R3) |
| 14 | D1 Migration Parity Verification | Maintain all 19 D1 migrations (`0001` through `0019_deprecate_manual_capacity.sql`) and ensure `/ready` returns migration parity. | M3 | Survey 2 (R3) |
| 15 | Local Typechecks & Test Suite | Ensure `pnpm -r typecheck` exits 0 and `pnpm test` passes 100%. | M4 | Survey 3 (R4) |
| 16 | Pre-Flight Release Checks (24 Stages) | Execute and pass all 24 release check stages in `scripts/cloudflare-build-diagnostics.mjs`. | M4 | Survey 3 (R4) |
| 17 | Worker Bundle Size Control | Verify compressed worker bundle size remains <= 2,500 KiB gzip. | M4 | Survey 3 (R4) |
| 18 | Cloudflare Production Deployment | Deploy via `pnpm production:deploy` and verify `https://sovereign.defrag.app/ready` returns HTTP 200 with `ok: true`. | M4 | Survey 3 (R4) |
| 19 | E2E Test Suite Creation | Deliver comprehensive multi-tier test suite covering user requirements and publish `TEST_READY.md`. | M5 | Survey 3 (R5) |
| 20 | Live Browser Verification Gate | Run Playwright live verification on desktop (1440px) and mobile (390px), complete user journey and verify live Sovereign stream with zero disk clutter. | M5 | Survey 3 (R5) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Copy, Tone & Persona Alignment | Features 1, 2, 3, 4, 5 (R1, R3 persona) | none | DONE (Passed all Reviewers, Challengers, and Forensic Auditor) |
| M2 | Visual Design Cohesion & Powder Theme | Features 6, 7, 8, 9, 10 (R2) | M1 | IN_PROGRESS (worker_m2: 5c0bb5f5-d780-4c0a-9f1f-0c07cb817fee) |
| M3 | Auth, Lifecycle & D1 Transactions | Features 11, 12, 13, 14 (R3) | none | IN_REVIEW (worker_m3 done, verification pending) |
| M4 | Automated Release Gates & Cloudflare Deploy | Features 15, 16, 17, 18 (R4) | M1, M2, M3 | PLANNED |
| M5 | E2E Tests & Live Browser Verification | Features 19, 20 (R5) | M4 | IN_PROGRESS (test_writer: c6f90b46-dfb5-4829-bafd-59704543be4c) |

## Interface Contracts
### Web UI ↔ Worker API
- **Auth Redemption**: `/auth/redeem?token=<token>` returns `{ status: 'success', createdAccount: boolean, next: string }` with signed session cookie. On failure: explicit JSON error with HTTP status.
- **Onboarding Plan Confirmation**: `POST /api/v1/account/onboarding` with `{ plan: 'free' | 'sovereign_plus' }`. Requires completed baseline.
- **Baseline Intake**: `POST /api/v1/baseline/onboarding` with birth details. Returns `{ status: 'ok', readinessState: 'ready' | 'facet_profile_preparing' }`.
- **Health Check**: `GET /ready` returns `{ ok: true, ready: true, migrationVersion: '0019_deprecate_manual_capacity', sha: string }`.

## Code Layout
- `apps/web/src/`: React components, views (`Public*.tsx`, `PlanOnboarding.tsx`, `AuthenticatedWorkspace.tsx`, `SovereignIntelligenceWorkspace.tsx`).
- `apps/web/src/styles/` & CSS files: `public.css`, `workspace.css`, `design-system.css`, `app-shell.css`.
- `apps/web/public/`: Static assets (`powder-hills-*.png`, fonts, static HTML templates).
- `apps/sovereign-worker/src/`: Worker backend (`runtime-entry.ts`, `production-entry.ts`, `auth-public.ts`, `baseline.ts`, `agent/prompt-v1.ts`, `agent/sovereign.ts`).
- `apps/sovereign-worker/migrations/`: D1 SQL migrations (`0001` through `0019_deprecate_manual_capacity.sql`).
- `scripts/`: Release verification and build scripts (`cloudflare-build-diagnostics.mjs`, `verify-worker-bundle-size.mjs`, `release-orchestrator.mjs`).
