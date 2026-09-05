# Original User Request

## Initial Request — 2026-09-05T07:23:24Z

Act as the Principal Engineering and Design Team to drive Sovereign.OS to public launch completion across four parallel tracks. You MUST NOT mark this project as complete until the live production URL (https://sovereign.defrag.app/) is visually verified via browser and functionally tested through a live conversation exchange with Sovereign.

Working directory: /Users/cjo/OPENAPI
Integrity mode: development

## Requirements

### R1. Holistic Copy & Tone Audit
Audit all public and workspace routes (`/`, `/how-it-works`, `/pricing`, `/faq`, `/login`, `/signup`, `/onboarding`, `/app`). Eliminate any robotic placeholders, disconnected copy, or clinical/medical jargon. Standardize strictly around the core brand thesis: *"Know yourself. Understand your people. See the whole system."* and ensure grounded, empathetic, non-clinical personal intelligence language.

### R2. Strict Visual Design Cohesion
Ensure all public views and the authenticated workspace match the Powder template specifications:
- Warm dusk background gradient (`#100814` to `#1a101f` to `#0d0710`) with grounded mountain ridge silhouettes (`powder-hills-far.png` and `powder-hills-mid.png`).
- Centered floating glassmorphic workspace window (`max-w-6xl`, `h-[88vh]`, `rounded-3xl`, `bg-[#161616]/92`, `backdrop-blur-2xl`, `border border-white/10`, `shadow-2xl`).
- Refurbished left sidebar (top diamond logo header, `+ New Chat` pill button, recent threads with relative time indicators, and bottom user account pill).
- Refurbished center stage with clean "Sovereign" topbar, warm arrival greeting, 2x3 action shortcuts grid, and floating rounded composer dock (`📎`, `〰`, `↑`).
- Typography enforced with Geist Sans and display serifs across all viewports.

### R3. Auth, Baseline, & Workspace Lifecycle
Ensure the strict 4-step user lifecycle operates without dead ends or split-brain routing:
`[Auth / Account Creation]` -> `[Tier Selection: Free vs Sovereign+]` -> `[Baseline Intake: DOB/TOB/POB]` -> `[Workspace Entry]`.
- Fix any `503` or Turnstile gate blockers; ensure all D1 inserts/mutations execute within transactional batches with explicit error codes (`AUTH_D1_ERROR`, `TURNSTILE_FAILED`).
- Verify all 19 D1 migrations (`0001` through `0019_deprecate_manual_capacity.sql`) are applied and in full parity.
- Unify AI intelligence into a singular "Sovereign" persona; Covenant and Systems operate as conditional reasoning modules, never isolated persona bots.

### R4. Automated Release Gates & Cloudflare Production Deployment
- Verify all local typechecks (`pnpm -r typecheck`) and the full test suite (`pnpm test`) pass with zero errors.
- Run pre-flight verification (`pnpm verify:cloudflare-build`) to pass all 24 release checks and keep bundle size under 2500 KiB gzip.
- Deploy to Cloudflare Workers via `pnpm production:deploy` and verify `https://sovereign.defrag.app/ready` returns HTTP 200 with `ok: true`.

### R5. Active Live Browser Verification Gate
Using headless browser automation against the live production deployment (`https://sovereign.defrag.app`):
- Visually verify desktop (1440px) and mobile (390px) responsive layouts.
- Complete the live user journey: create account / sign in, navigate through tier selection and baseline intake, enter the active workspace, submit a prompt, and verify that a valid Sovereign answer stream is received.
- If any stage fails, debug the root cause, fix the code, redeploy, and re-verify.

## Acceptance Criteria

### Production Reliability & Code Quality
- [ ] `pnpm -r typecheck` exits with code 0 across all workspace packages.
- [ ] `pnpm test` exits with code 0 with all test suites passing.
- [ ] `pnpm verify:cloudflare-build` completes all 24 stages successfully.
- [ ] Worker bundle size remains <= 2500 KiB gzip.
- [ ] `https://sovereign.defrag.app/ready` returns HTTP 200 with `{"ok":true,"ready":true}` and migration `0019_deprecate_manual_capacity`.

### Brand, Visual & Flow Validation
- [ ] All public routes (`/`, `/how-it-works`, `/pricing`, `/faq`, `/terms`, `/privacy`) render consistent Powder visual tokens and typography.
- [ ] Authenticated workspace renders as a centered floating glassmorphic window over the dusk mountain backdrop.
- [ ] Live browser interaction succeeds in creating an account / entering workspace and receiving a streaming response from Sovereign.
- [ ] Zero local screenshot or artifact disk clutter created during validation.
