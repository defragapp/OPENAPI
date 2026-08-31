# Sovereign.OS Live Acceptance Ledger

Recovered from the uncommitted local launch-audit artifacts on 2026-08-30
(`visual-inspection/prod-route-inspection-report.json`, `visual-inspection/qa/`,
`scripts/inspect-production-routes.mjs`, `.visual-release-audit/desktop-1440x900.png`).
Track names/IDs preserved from the recovered audit.

## Sprint ledger

### Track VQA-1 — Public route visual acceptance
- GREEN: `/how-it-works`, `/pricing`, `/faq`, `/privacy`, `/terms` desktop+mobile (prod capture, no defects).
- GREEN: `/` on app.defrag.app is a 308 redirect to `/app` (worker `routeHostname`); the login-render snapshot was a capture artifact, not a defect.
- GREEN: static 404 route structure/copy.
- FIXED: `.account-nav` header rendered the wordmark and "Create an account" jammed together with no flex layout (visible in `prod-desktop--login.png` / `prod-desktop--.png`). Fixed with `display:flex; align-items:center; justify-content:space-between` on `.account-shell .account-nav` in `apps/web/src/app-shell.css`.
- FIXED: small touch targets (`A. 36x17` etc.) on static launch header/footer anchors (404/FAQ/pricing/how-it-works/consent). Fixed with a 44px min-height touch floor in `apps/web/public/experience-static-refinement-v1.css`; cache buster bumped to `?v=20260830-touch-v1` across the five static HTML documents and matching pins in route-cohesion tests/verifiers.
- CLOSED (false positive): "2 inputs without nearby labels" — the flagged email/name inputs are wrapped in `<label class="field">`, a valid accessible association; the second flagged input is the Cloudflare Turnstile iframe's internal input (not our DOM).

### Track VQA-2 — FATAL captures
- BLOCKED: `/signup` desktop+mobile and `/login` mobile Playwright captures timed out on `networkidle` (Turnstile iframe keeps the network busy). Server checks confirm `/signup` and `/login` return 200. Capture-script wait strategy, not a product defect; superseded by live curl checks and post-release re-verification.

### Track AUTH-1 — Auth / onboarding
- GREEN: login page renders passkey + email-link/code paths, Turnstile state machine, session via `/api/v1/auth/*` (worker auth contracts green in `pnpm test`).

### Track BILL-1 — Stripe / entitlement
- GREEN: `/api/v1/stripe/webhook` correctly returns 401 without a signature at the application layer; signature verification is enforced in `apps/sovereign-worker` (`stripe-webhook-route-contract.test.ts`). The externally reported Cloudflare Access policy overprovisioning on that path is a Cloudflare dashboard configuration item, not a repository change; the app-layer contract is safe and Access changes must not break Stripe delivery.

### Track REL-1 — Release
- GREEN at `a6faf87`: `/ready` reported `ready:true`, SHA match, migration `0018_workers_ai_capacity_reservations` current, `sovereign-answer.v2` contract.
- FIXED (this sprint): account-nav flex layout + static touch targets. Verified before release: `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm verify:foundation`, `pnpm scan:secrets`.

| Agent | Status | Surface | Defect/Gap | Change | Test | Evidence |
|-------|--------|---------|-------------|--------|------|----------|
| VQA-1 | FIXED | Login/signup account header | Wordmark and switch link render adjacent, no spacing/centering | Flex layout on `.account-shell .account-nav` | `pnpm test`, `pnpm build` | `visual-inspection/qa/prod-desktop--login.png` |
| VQA-1 | FIXED | Static launch pages (404/FAQ/pricing/how-it-works/consent) | Header/footer anchors below 44px touch target | 44px touch floor in `experience-static-refinement-v1.css` + buster `20260830-touch-v1` | Route-cohesion tests updated and green | `visual-inspection/qa/prod-mobile--404.png` report entries |
| VQA-1 | CLOSED | Login/signup form labels | Heuristic flagged unlabeled inputs | None — inputs are label-wrapped; Turnstile iframe input is external | Review of `Field` in `App.tsx` | report `noformLabels` entries |
| VQA-2 | BLOCKED | `/signup`, `/login` mobile captures | Playwright `networkidle` timeout via Turnstile | None (capture strategy) | `curl` 200 on both routes | `prod-*-FATAL.png` |
| BILL-1 | GREEN | `/api/v1/stripe/webhook` | Access policy overprovisioning reported externally | App-layer 401 without signature confirmed; no unsafe Service Auth introduced | `stripe-webhook-route-contract.test.ts` | live probe 2026-08-30 |
| REL-1 | GREEN | Production `/ready` | — | — | SHA/migration/contract verified live | `/ready` payload at `a6faf87` |

