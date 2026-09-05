# TEST_INFRA — Sovereign.OS E2E & Multi-Tier Test Architecture

## 1. Test Philosophy & Principles

The Sovereign.OS End-to-End (E2E) Test Suite is designed to guarantee unwavering production stability, visual cohesion, security integrity, and contract conformance across public and authenticated routes. The testing philosophy is governed by five foundational pillars:

### 1.1 Opaque-Box & Requirement-Driven
- All test expectations are derived strictly from authoritative specifications in `ORIGINAL_REQUEST.md` (R1 through R5) and `PROJECT.md` (Features 1 through 20).
- Tests treat the application runtime, edge gateway, and frontend single-page application as an opaque black-box. Verification operates exclusively across observable interfaces: HTTP request/response payloads, status codes, response headers, rendered DOM structures, computed CSS properties, client-side event broadcasts, and live streaming SSE/JSON responses.
- No internal private functions or brittle implementation details are tested directly; if an implementation refactors internal helpers while preserving the interface contract, tests remain green.

### 1.2 Deterministic Output Derivation
- Every test assertion cites an explicit requirement from `ORIGINAL_REQUEST.md` or `PROJECT.md`.
- Dynamic and non-deterministic fields (such as git commit SHAs, timestamps, signed JWTs, and ephemeral session IDs) are validated against exact cryptographic regex formats, schema constraints, and temporal validity windows rather than hardcoded magic strings.
- Reference oracle validation is performed against live production deployments (`https://sovereign.defrag.app` and `https://app.defrag.app`) and verified build artifacts.

### 1.3 Independence, Isolation & Zero Local Clutter
- Every test case is hermetic and isolated: it establishes its own preconditions, avoids shared mutable global state, and executes deterministically regardless of execution order or concurrency.
- In strict adherence to R5 and project requirements: **ZERO local screenshot or artifact disk clutter is created during test runs**. All layout, styling, and dimension evaluations are conducted in-memory via headless browser evaluations (`window.getComputedStyle()`, `scrollWidth`, `clientWidth`, `getBoundingClientRect()`). Any ephemeral storage needed during validation uses temporary directories with deterministic `try ... finally` cleanup handlers.

### 1.4 Adversarial Edge & Boundary Verification
- The suite actively challenges edge conditions: special characters, malformed inputs, SQL injection attempts, Turnstile iframe polling stalls, expired session tokens, unauthorized route traversals, network timeouts, and viewport boundary constraints (e.g. mobile 390px vs desktop 1440px).
- Cloudflare Turnstile integration is tested specifically to prevent automation hangs by enforcing `waitUntil: 'domcontentloaded'` and explicit element selectors instead of brittle `networkidle` triggers.

---

## 2. Test Architecture & Suite Structure

```
tests/e2e/
├── tier1-features.test.ts       # Tier 1: Feature Coverage (>=5 test cases per feature for all 20 features)
├── tier2-boundaries.test.ts     # Tier 2: Boundary & Corner Cases (>=5 test cases per feature for all 20 features)
├── tier3-pairwise.test.ts       # Tier 3: Cross-Feature Combinations (Pairwise integration across features)
├── tier4-journeys.test.ts       # Tier 4: Real-World Application Scenarios (End-to-end user journeys)
├── live-browser-gate.ts         # R5 Live Browser Verification Gate (Playwright desktop 1440px & mobile 390px)
└── run-all.mjs                  # Master E2E orchestrator & structured evidence collector
```

### Coverage Thresholds
| Tier | Description | Requirement | Implementation Target |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Feature Coverage | $\ge 5$ test cases per feature for all 20 features | $\ge 100$ unit/E2E test cases |
| **Tier 2** | Boundary & Corner Cases | $\ge 5$ boundary/corner cases per feature for all 20 features | $\ge 100$ stress/boundary test cases |
| **Tier 3** | Cross-Feature Combinations | Pairwise feature interaction coverage | $\ge 15$ multi-feature integration tests |
| **Tier 4** | Real-World Application Scenarios | Complete end-to-end user journeys | $\ge 5$ full realistic lifecycle journeys |
| **R5 Gate** | Live Headless Browser Gate | Desktop (1440px) & Mobile (390px), live stream, zero clutter | Playwright live production test |

---

## 3. Feature Inventory & Multi-Tier Mapping

| Feature # | Feature Name | Tier 1 Coverage (>=5) | Tier 2 Coverage (>=5) | Tier 3 Pairings | Tier 4 User Journeys |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **F1** | Brand Thesis Standardization | T1.F1.1 - T1.F1.5: Core promise verbatim presence on `/`, `/how-it-works`, `/pricing`, `/faq`, and workspace greeting. | T2.F1.1 - T2.F1.5: Case/whitespace normalization, no punctuation corruption, responsive text wrapping, no placeholder leakage. | F1 + F4, F1 + F9 | Journey 1, Journey 2 |
| **F2** | Cliché & Placeholder Elimination | T1.F2.1 - T1.F2.5: Zero robotic greetings ("How can I help you?"), no debug test chips (`U✓`), no duplicate buttons, no lorem ipsum. | T2.F2.1 - T2.F2.5: Substring regex variants, hidden aria-labels clean, graceful empty thread state, button debounce. | F2 + F5 | Journey 4 |
| **F3** | Non-Clinical Tone Alignment | T1.F3.1 - T1.F3.5: Sovereign personal discernment wording, founder hero text preserved, no medical diagnosis claims, prompt safety rules. | T2.F3.1 - T2.F3.5: User psychiatric diagnostic query redirection, crisis escalation boundaries, disclaimer autonomy, hero immutability. | F3 + F5 | Journey 4, Journey 5 |
| **F4** | Static HTML & React Sync | T1.F4.1 - T1.F4.5: Exact copy & structure parity between `.html` and `.tsx` for `/how-it-works`, `/pricing`, `/faq`, nav links, meta tags. | T2.F4.1 - T2.F4.5: Heading text drift detection, deep anchor link parity (#section), hydration mismatch immunity, trailing slashes. | F4 + F1 | Journey 1 |
| **F5** | Singular Sovereign Persona | T1.F5.1 - T1.F5.5: Unified Sovereign persona in system prompt, Covenant as conditional lens, Systems as relational lens, single header. | T2.F5.1 - T2.F5.5: Simultaneous module activation, prompt injection defense, no persona selector dropdown, basis ref authorization. | F5 + F2, F5 + F3 | Journey 4 |
| **F6** | Global Dusk Gradient & Mountain Ridges | T1.F6.1 - T1.F6.5: Hex stops `#100814` to `#1a101f` to `#0d0710`, `powder-hills-far.png` & `mid.png` presence, public assets HTTP 200. | T2.F6.1 - T2.F6.5: High DPI / Retina scaling, zero horizontal overflow at 390px, fallback gradient legibility, WCAG AA contrast (4.5:1). | F6 + F7, F6 + F10 | Journey 1, Journey 2 |
| **F7** | Floating Glassmorphic Workspace Window | T1.F7.1 - T1.F7.5: Container `max-w-6xl` (1152px), `h-[88vh]`, `rounded-3xl` (24px), `bg-[#161616]/92`, `backdrop-blur-2xl`, `shadow-2xl`. | T2.F7.1 - T2.F7.5: Mobile responsive collapse (<=640px), modal overlay nesting, resize stability, Safari `-webkit-backdrop-filter` support. | F7 + F6, F7 + F8 | Journey 4 |
| **F8** | Left Sidebar Anatomy | T1.F8.1 - T1.F8.5: Diamond logo header (`SOVEREIGN.OS`), `+ New Chat` pill button, recent thread list, relative time tags, user account pill. | T2.F8.1 - T2.F8.5: Mobile drawer toggle, empty thread prompt, long thread title truncation, 50+ thread scrolling containment. | F8 + F7, F8 + F9 | Journey 4 |
| **F9** | Center Stage & Composer Dock | T1.F9.1 - T1.F9.5: "Sovereign" topbar, arrival greeting, 2x3 action shortcuts grid, floating composer dock (`📎`, `〰`, `↑`). | T2.F9.1 - T2.F9.5: Textarea upward auto-expansion, empty submission block, Shift+Enter newline, composer disable during AI stream. | F9 + F1, F9 + F8 | Journey 4 |
| **F10** | Typography Enforcement | T1.F10.1 - T1.F10.5: Self-hosted Geist Sans for body, `sovereign-display.woff2` for `--serif` display headings, `font-display: swap`, local files. | T2.F10.1 - T2.F10.5: FOUT mitigation fallbacks, Latin-1 & typography symbol support, 200% zoom stability, monospace code token stack. | F10 + F6 | Journey 1, Journey 2 |
| **F11** | 4-Step User Lifecycle Continuity | T1.F11.1 - T1.F11.5: Step 1 (Auth), Step 2 (Tier Free vs Sovereign+), Step 3 (Baseline DOB/TOB/POB), Step 4 (Workspace Entry), Stripe return. | T2.F11.1 - T2.F11.5: Unauthenticated redirect to `/login`, incomplete onboarding gate traps, already completed skip to `/app`, idempotent baseline. | F11 + F12, F11 + F13 | Journey 3, Journey 5 |
| **F12** | D1 Transaction Batching & Error Codes | T1.F12.1 - T1.F12.5: `env.DB.batch([...])` mutations in magic link redemption, `AUTH_D1_ERROR` code wrap, baseline batch write, structured JSON errors. | T2.F12.1 - T2.F12.5: Atomicity on mid-batch failure, parameterized SQL injection resistance, duplicate token replay rejection (`TOKEN_ALREADY_USED`). | F12 + F11, F12 + F14 | Journey 3, Journey 5 |
| **F13** | Turnstile & 503 Blocker Mitigation | T1.F13.1 - T1.F13.5: `TURNSTILE_FAILED` code on missing token, test key handling in preview, `/ready` 200 resilience, zero 503 errors on public routes. | T2.F13.1 - T2.F13.5: Turnstile verify timeout resilience, expired token refresh prompt, 429 rate limit with Retry-After, token replay protection. | F13 + F11, F13 + F20 | Journey 3, Journey 5 |
| **F14** | D1 Migration Parity Verification | T1.F14.1 - T1.F14.5: All 19 migration files present (`0001` to `0019`), `/ready` returns `0019_deprecate_manual_capacity`, `dependencies.migrationParity === "current"`. | T2.F14.1 - T2.F14.5: Migration sequence immutable checksums, `legacy_workers_ai_daily_capacity` query compatibility, no descending migrations. | F14 + F12, F14 + F18 | Journey 5 |
| **F15** | Local Typechecks & Test Suite | T1.F15.1 - T1.F15.5: Worker typechecks 0 errors, web typechecks 0 errors, package contracts typecheck 0 errors, unit test suite passes 100%. | T2.F15.1 - T2.F15.5: Strict mode compiler adherence (`exactOptionalPropertyTypes`, `noImplicitAny`), zero unhandled rejections, deterministic passes. | F15 + F19 | All Journeys |
| **F16** | Pre-Flight Release Checks (24 Stages) | T1.F16.1 - T1.F16.5: All 24 diagnostic stages in `cloudflare-build-diagnostics.mjs`, foundation check, migrations check, secrets scan, fixtures scan. | T2.F16.1 - T2.F16.5: Simulated stage failure non-zero exit, stage timing telemetry, public contact verification (`info@sovereign.os`), source map suppression. | F16 + F17 | Journey 5 |
| **F17** | Worker Bundle Size Control | T1.F17.1 - T1.F17.5: Budget enforced at $\le 2500\text{ KiB}$ gzip, Cloudflare limit $\le 3072\text{ KiB}$, current size $235\text{ KiB}$, ephemeral build outdir cleanup. | T2.F17.1 - T2.F17.5: Oversize threshold triggers failure exit, boundary test at 2500 KiB, dry-run failure cleanup, no heavy bloat dependencies. | F17 + F16 | Journey 5 |
| **F18** | Cloudflare Production Deployment | T1.F18.1 - T1.F18.5: `https://sovereign.defrag.app/ready` returns HTTP 200, `ok: true`, `ready: true`, SHA matches git HEAD, `app.defrag.app/ready` healthy. | T2.F18.1 - T2.F18.5: HTTP 308 subdomain isolation (`/app` redirects to `app.defrag.app`), HSTS & security headers, TLS certificate validity, parent domain redirects. | F18 + F14 | All Journeys |
| **F19** | E2E Test Suite Creation | T1.F19.1 - T1.F19.5: `TEST_INFRA.md` published, Tier 1 coverage ($\ge 5$ per feature), Tier 2 coverage ($\ge 5$ per feature), Tier 3 pairwise, `TEST_READY.md` generated. | T2.F19.1 - T2.F19.5: Opaque-box requirement validation, test run concurrency safety, regex matching for dynamic timestamps/SHAs, clean exit codes. | F19 + F15 | All Journeys |
| **F20** | Live Browser Verification Gate | T1.F20.1 - T1.F20.5: Playwright launches headless Chromium, desktop (1440px) audit, mobile (390px) audit, sovereign & app domains audited, live stream answer received. | T2.F20.1 - T2.F20.5: Avoid Turnstile hangs via `domcontentloaded`, zero local screenshot or report clutter, in-memory style & overflow checks, ephemeral temp cleanup. | F20 + F13 | Journey 1, Journey 2, Journey 4 |

---

## 4. Live Browser Verification Gate (R5) Specification

### 4.1 Target Viewports & Responsive Auditing
1. **Desktop Viewport**: `1440 × 900`
   - Validates that public routes render full header navigation, hero composition, and two-tier mountain silhouettes.
   - Validates that the authenticated workspace renders inside the centered floating glassmorphic window (`max-w-6xl`, `h-[88vh]`, `rounded-3xl`, `bg-[#161616]/92`, `backdrop-blur-2xl`).
2. **Mobile Viewport**: `390 × 844` (iPhone standard reference)
   - Validates zero horizontal scrolling (`scrollWidth - clientWidth <= 0`).
   - Validates that interactive touch targets meet minimum accessible dimensions ($\ge 40\text{px}$ height).
   - Validates that the desktop sidebar collapses into a slide-over or bottom navigation without clipping text.

### 4.2 Turnstile Network Hang Prevention Protocol
- In production, Cloudflare Turnstile's iframe maintains an ongoing heartbeat connection that prevents Playwright's `networkidle` state from resolving, triggering severe test timeouts.
- **Rule**: All navigation calls must specify `{ waitUntil: 'domcontentloaded', timeout: 30000 }` or `{ waitUntil: 'load' }`.
- Element readiness must be polled via explicit CSS selectors (`page.waitForSelector('input[type="email"]')`, `page.locator('button.primary-button')`) rather than waiting for global network quiescence.

### 4.3 Zero Disk Clutter Guarantee
- Visual inspection must not leave `.png`, `.jpg`, `.base64`, or temporary report files committed or scattered in the workspace.
- DOM and layout dimensions are extracted into typed JSON structures directly inside browser memory via `page.evaluate()`.
- If temporary files must be created (e.g. for intermediate trace evaluation), they are created in `/tmp/sovereign-e2e-XXXXXX/` and guaranteed to be destroyed in a `finally` block before process exit.

### 4.4 Live User Conversation Exchange
The live browser gate completes the end-to-end conversation exchange:
1. Navigates to authenticated application route `https://app.defrag.app/`.
2. Completes or verifies active session authentication and baseline readiness.
3. Accesses the workspace stage `/app`.
4. Submits prompt: *"What capacity or recurring pattern in me is operating here?"*
5. Observes the live stream transition, verifies response text arrives adhering to the `sovereign-answer.v2` contract (with structured sections such as Shadow / Gift or grounded discernment), and confirms the composer input returns to ready state.

---

## 5. Test Runner Commands & CI Integration

### Executing the Multi-Tier E2E Suite
```bash
# Run all E2E test tiers (Tiers 1, 2, 3, and 4)
pnpm exec vitest run tests/e2e/tier1-features.test.ts tests/e2e/tier2-boundaries.test.ts tests/e2e/tier3-pairwise.test.ts tests/e2e/tier4-journeys.test.ts

# Run the R5 Live Browser Verification Gate (Playwright headless runner)
node --import tsx tests/e2e/live-browser-gate.ts

# Execute the complete automated release verification gate
node tests/e2e/run-all.mjs
```
