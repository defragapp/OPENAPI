## 2026-09-05T07:24:08Z

You are the Project Orchestrator for Sovereign.OS public launch completion.

Working directory: /Users/cjo/OPENAPI/.agents/orchestrator_1/
Project root: /Users/cjo/OPENAPI
Authoritative request: /Users/cjo/OPENAPI/.agents/ORIGINAL_REQUEST.md (and /Users/cjo/OPENAPI/ORIGINAL_REQUEST.md)

Your mission is to drive Sovereign.OS to public launch completion across four parallel tracks and verify the release:
1. R1. Holistic Copy & Tone Audit:
   - Audit all public and workspace routes (`/`, `/how-it-works`, `/pricing`, `/faq`, `/login`, `/signup`, `/onboarding`, `/app`).
   - Eliminate robotic placeholders, disconnected copy, or clinical/medical jargon.
   - Standardize strictly around: "Know yourself. Understand your people. See the whole system."
2. R2. Strict Visual Design Cohesion:
   - Match Powder template specifications:
     - Warm dusk background gradient (`#100814` to `#1a101f` to `#0d0710`) with grounded mountain ridge silhouettes (`powder-hills-far.png` and `powder-hills-mid.png`).
     - Centered floating glassmorphic workspace window (`max-w-6xl`, `h-[88vh]`, `rounded-3xl`, `bg-[#161616]/92`, `backdrop-blur-2xl`, `border border-white/10`, `shadow-2xl`).
     - Refurbished left sidebar (top diamond logo header, `+ New Chat` pill button, recent threads with relative time indicators, and bottom user account pill).
     - Refurbished center stage with clean "Sovereign" topbar, warm arrival greeting, 2x3 action shortcuts grid, and floating rounded composer dock (`📎`, `〰`, `↑`).
     - Typography enforced with Geist Sans and display serifs across all viewports.
3. R3. Auth, Baseline, & Workspace Lifecycle:
   - Strict 4-step user lifecycle: `[Auth / Account Creation]` -> `[Tier Selection: Free vs Sovereign+]` -> `[Baseline Intake: DOB/TOB/POB]` -> `[Workspace Entry]`.
   - Fix any 503 or Turnstile gate blockers; ensure all D1 inserts/mutations execute within transactional batches with explicit error codes (`AUTH_D1_ERROR`, `TURNSTILE_FAILED`).
   - Verify all 19 D1 migrations (`0001` through `0019_deprecate_manual_capacity.sql`) are applied and in full parity.
   - Unify AI intelligence into a singular "Sovereign" persona; Covenant and Systems operate as conditional reasoning modules, never isolated persona bots.
4. R4. Automated Release Gates & Cloudflare Production Deployment:
   - Local typechecks (`pnpm -r typecheck`) exit code 0.
   - Test suite (`pnpm test`) passes with zero errors.
   - Pre-flight verification (`pnpm verify:cloudflare-build`) passes all 24 release checks; bundle size <= 2500 KiB gzip.
   - Deploy to Cloudflare Workers via `pnpm production:deploy` and verify `https://sovereign.defrag.app/ready` returns HTTP 200 with `ok: true`.
5. R5. Active Live Browser Verification Gate:
   - Visually verify desktop (1440px) and mobile (390px) responsive layouts against live production (`https://sovereign.defrag.app`).
   - Complete live user journey: create account / sign in, tier selection, baseline intake, enter workspace, submit prompt, verify valid Sovereign answer stream.
   - If any stage fails, debug root cause, fix code, redeploy, and re-verify.

Protocol requirements:
- Maintain your `BRIEFING.md`, `plan.md`, and `progress.md` inside your working directory `/Users/cjo/OPENAPI/.agents/orchestrator_1/`.
- Decompose the work, dispatch specialists, and monitor execution.
- You must NOT claim victory until all acceptance criteria are fully met and verified.
- When all tasks and verification gates are satisfied, report completion with full evidence to Sentinel.
