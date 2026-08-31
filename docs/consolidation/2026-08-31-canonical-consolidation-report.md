# Sovereign.OS — Canonical Source Consolidation & Drift Recovery (2026‑08‑31)

Status: Evidence-backed consolidation baseline for `defragapp/OPENAPI`.

This document records the canonical repository state, local checkout inventory, known divergences, and the A–G classification needed to reconcile prior AI‑agent work without reintroducing architecture drift.

## 1) Canonical repository
- Path: `/Users/cjo/Downloads/AZUP-SOV/OPENAPI/openapiii`
- Remote: `git@github.com:defragapp/OPENAPI.git`
- Branch: `main`
- HEAD: `bb2725b10d4f296156bffb05fa9fa6755086681f`
- origin/main: `bb2725b10d4f296156bffb05fa9fa6755086681f`

## 2) Production proof (current)
- app.defrag.app/ready: 200; prior session verified `sha=bb2725b10d4f…`; `sovereign-answer.v2`; migration `0018`; parity current; Worlds video disabled
- sovereign.defrag.app/ready: 200; prior session verified same SHA and contracts

Note: In this pass, raw JSON parsing via sed was inconclusive for fields, but HTTP 200 was confirmed on both; a structured parse will be re-run in the next step to capture `sha`, `migrationVersion`, and `answerContract` explicitly.

## 3) Local repositories discovered
1. `/Users/cjo/Downloads/AZUP-SOV/OPENAPI/openapiii`
   - remote: `git@github.com:/defragapp/OPENAPI.git`
   - branch: `main`
   - HEAD: `bb2725b10d4f296156bffb05fa9fa6755086681f`
   - status highlights: modified `AGENTS.md`, `docs/DOCUMENTATION_MAP.md`; added `opencode*.json` backups; modified `packages/evals/src/sovereign-behavior.test.ts`
2. `/Users/cjo/Downloads/AZUP-SOV/OPENAPI`
   - remote: `https://github.com/defragapp/OPENAPI.git`
   - branch: `refinement/visual-hierarchy-2026-08-16`
   - HEAD: `6de64f7deb703c6095feef54a11d76213e361227` (2026‑08‑16)
   - status: DIRTY (`.idea/`, `finish-sovereign-cloudflare-release.sh`, nested `openapiii/`)

No other OPENAPI/Sovereign/SOVV checkouts were found under the searched roots.

## 4) Documentation authority hierarchy (enforced)
1. `docs/product-language-system.md` — user‑facing language
2. `docs/launch-product-contract.md` — launch inclusion boundary (text‑first; Worlds/video parked)
3. `docs/v0-visual-port-contract.md` — founder visual/component authority (CSS import order; founder hero; typography via Geist)
4. Intelligence/safety/privacy/consent/architecture contracts
5. Implementation/audit/release documentation
6. Historical materials

`docs/landing-experience-audit.md` is explicitly historical/subordinate. Worlds/video docs are future/parked.

## 5) Known architectural conflict — DO NOT MERGE (G)
- Sibling `apps/web/src/main.tsx` imports an alternate, expansive CSS stack and places `passkey-auth.css` non‑terminal. This conflicts with canonical CSS authority and import order:
  - Canonical: `design-system.css` → `public.css` → `workspace.css` → `app-shell.css` → `passkey-auth.css` (terminal)
  - Sibling excerpt (partial): dozens of `*.css` including `typography-system.css`, various `v0-*` and `public-landing-*.css` prior to a late `passkey-auth.css`

This stack is quarantined as G (conflicting implementation) until an explicit product/visual decision is made. Do not merge.

## 6) Divergent changes (initial A–G classification)

Legend:
- A — Current implementation improvement (compatible)
- B — Tests / verification / evaluation (compatible)
- C — Documentation / product definition (must obey hierarchy)
- D — Operational tooling (release/audit/devops)
- E — Duplicate (already represented/superseded)
- F — Historical / parked (retain as reference)
- G — Conflicting implementation (do not merge)

Summary from sibling `refinement/visual-hierarchy-2026-08-16`:

- G — CSS import architecture and duplicate landing authorities in `apps/web/src/main.tsx` (see §5)
- C — Docs changed in sibling (selection): `architecture.md`, `browser-visual-release-audit.md`, `cloudflare-free-tier-hardening.md`, `current-conditions-port.md`, `landing-experience-audit.md` (historical), `product-positioning-canonical.md`, `release/*`, `releases/*`, `security/*`, `worlds-*.md`
  - Disposition: Keep canonical authorities per hierarchy; integrate non‑conflicting clarifications; keep Worlds and older audits as historical
- B — Tests/verifiers: naming suggests landing/mobile acceptance specs; require extraction and vetting against canonical runtime
- D — Operational tooling: release/preview/OAuth helpers present; review and integrate only if aligned with current release authority (`verify:cloudflare-build` → `production:release:text`)
- E — Duplicates: many scripts already exist in canonical (e.g., `scripts/inspect-production-routes.mjs`, `sovereign-output-eval.ts`) — sibling may contain overlapping variants; dedupe rather than multiply
- F — Worlds/video contracts and assets: historical/future scope; do not activate

An itemized commit/file matrix with SHAs, dates, paths, purpose, evidence, and disposition will follow in the next pass.

## 7) Recovered/preserved (already on `main`)
- Durable agent guidance: `.junie/AGENTS.md` with subagents (`public-visual`, `ai-quality`, `auth-billing`, `production-readiness`)
- Root `AGENTS.md` repaired to use canonical Git root (`git rev-parse --show-toplevel`) rather than hard‑coded workspace path
- Evidence/artifacts preserved: `.visual-release-audit/`, `visual-inspection/`, `qa/`, `scripts/inspect-production-routes.mjs`, `scripts/sovereign-output-eval.ts`, `scripts/ai-probe.ts`
- `docs/DOCUMENTATION_MAP.md` extended as master index (adds Business/Entitlements; Acceptance/Ledger; Known External Blockers)

## 8) GitHub graph
- Current environment lacks `gh`; cannot inventory PRs/issues. Action: repeat this section with `gh` in an authenticated shell; classify #207, #208, #210–#216, and other relevant items as DONE / SUPERSEDED / STILL REQUIRED / DUPLICATE / HISTORICAL / REQUIRES DECISION.

## 9) Remaining consolidation actions
1. Build the commit/file‑level A–G matrix from sibling branch with provenance and disposition
2. Reconcile only A–D items into canonical `main`; quarantine G; mark F historical in `docs/DOCUMENTATION_MAP.md`
3. Re‑parse `/ready` JSON to capture `sha`, `migrationVersion`, `answerContract`, `worldsVideo` explicitly
4. When environment permits: run `pnpm install` → `pnpm verify:foundation` → `pnpm typecheck` → `pnpm test` → `pnpm build` → `pnpm scan:secrets` → `pnpm verify:cloudflare-build`
5. Prepare a compact final consolidation report addendum with GREEN/FIXED/BLOCKED/REMAINING and evidence links; update `SPRINT_ACCEPTANCE.md`

## 10) Stop conditions
- Do not merge the sibling CSS import stack or duplicate landing authorities (G) without a documented product/visual decision
- Do not activate Worlds/video
- Do not introduce alternate architecture or CSS authority
- Do not delete historical evidence; preserve provenance for any imported work
