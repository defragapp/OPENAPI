# Sovereign.OS Launch Acceptance Record

Status: current launch record. This is the authoritative post-launch evidence for the initial text-first production release.

---

## Release Identity

| Field | Value |
|-------|-------|
| Product | Sovereign.OS |
| Repository | `defragapp/OPENAPI` |
| Branch | `main` |
| Git SHA | `31da213ba542b55a519d1e930f6bfa50d4d5db4e` |
| Release SHA | `31da213ba542b55a519d1e930f6bfa50d4d5db4e` |
| Cloudflare Worker | `sovv-web` |
| Account ID | `8b1954d216d65077c6480d62583fe2c2` |
| Environment | production |
| Deployment date | 2026-08-25 |
| Migration version | `0018_workers_ai_capacity_reservations` |
| Answer contract | `sovereign-answer.v2` |
| Baseline contract | `baseline-source.v1+baseline-facets.v1` |
| Release path | `pnpm production:release:text` |

---

## Source Certification

All repository gates passed for SHA `31da213ba542b55a519d1e930f6bfa50d4d5db4e`:

| Gate | Result |
|------|--------|
| `pnpm verify:foundation` | PASS |
| `pnpm build` | PASS |
| `pnpm typecheck` (9 projects) | PASS |
| `pnpm test` (457 tests) | PASS |
| `pnpm verify:migrations` (18 migrations) | PASS |
| `pnpm scan:secrets` | PASS |
| `pnpm scan:production-fixtures` | PASS |
| `pnpm verify:release-config` | PASS |
| `pnpm verify:intelligence-release` | PASS |
| `pnpm verify:worker-bundle-size` | PASS |
| `pnpm verify:cloudflare-build` (23/23 stages) | PASS |

---

## Deployment Certification

| Field | Value |
|-------|-------|
| Intended release SHA | `31da213ba542b55a519d1e930f6bfa50d4d5db4e` |
| Cloudflare deployed SHA | `31da213ba542b55a519d1e930f6bfa50d4d5db4e` |
| `/ready` SHA (sovereign.defrag.app) | `31da213ba542b55a519d1e930f6bfa50d4d5db4e` |
| `/ready` SHA (app.defrag.app) | `31da213ba542b55a519d1e930f6bfa50d4d5db4e` |
| `/ready` status | `true` |
| Release evidence SHA | `31da213ba542b55a519d1e930f6bfa50d4d5db4e` |
| Release evidence migration | `0018_workers_ai_capacity_reservations` |
| Migration parity | `current` |
| DMARC | verified |
| Deploys | 1 |

SHA parity:

```text
HEAD       = 31da213ba542b55a519d1e930f6bfa50d4d5db4e
origin     = 31da213ba542b55a519d1e930f6bfa50d4d5db4e
release    = 31da213ba542b55a519d1e930f6bfa50d4d5db4e
Cloudflare = 31da213ba542b55a519d1e930f6bfa50d4d5db4e
/ready     = 31da213ba542b55a519d1e930f6bfa50d4d5db4e
```

Migration parity:

```text
source      = 0018_workers_ai_capacity_reservations
release     = 0018_workers_ai_capacity_reservations
deployed    = 0018_workers_ai_capacity_reservations
/ready      = 0018_workers_ai_capacity_reservations
```

---

## Security Certification

| Control | Status | Evidence |
|---------|--------|----------|
| Cloudflare Access | configured | Production dependency report |
| Turnstile | configured | Bot protection on signup/policy routes |
| Authentication boundary | verified | Unauthenticated `/api/v1/sovereign/turn` returns 401 |
| Session signing | configured | `SESSION_SIGNING_SECRET` present in Worker secrets |
| Account isolation | implemented | HMAC-signed sessions, DB-level `account_id` isolation |
| Stripe webhook protection | verified | Unsigned POST to `/stripe/webhook` returns 405 |
| Worker secrets | 5/5 configured | `SESSION_SIGNING_SECRET`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Input safety | implemented | 15-category deterministic classifier with safety resources |
| Output safety | implemented | Dual-layer review (rewrite + hard gate) |
| Privacy controls | configured | `policyAcceptanceReceipts`, `privacyAccessControls`, `privateExports: on-demand-no-artifact` |

---

## Product Certification

### Implemented surfaces

| Surface | Status | Contract |
|---------|--------|----------|
| Baseline | implemented | `baseline-source.v1+baseline-facets.v1` |
| Expression Field | implemented | 15 axes, deterministic from Baseline |
| Sovereign Answer | implemented | `sovereign-answer.v2` |
| Self intelligence | implemented | Core intelligence pipeline |
| Relationship intelligence | implemented | Pair comparison, consent-gated |
| System intelligence | implemented | System analysis |
| Persistence | implemented | D1 with bookmark forwarding |
| Billing | implemented | Stripe, 6 webhook paths |
| Email | implemented | Resend, `info@defrag.app` |
| Privacy | implemented | On-demand export, no retained artifacts |
| Frontend | implemented | `SovereignIntelligenceWorkspace` (6 surfaces) |
| Public landing | implemented | Founder visual authority preserved |

### Product architecture

```text
Baseline
    ↓
Expression Field
    ↓
Intelligence / relational semantics
    ↓
Sovereign Answer v2
```

Intelligence domains: Self, Relationship, System.

### Product constraints (preserved)

- No Tarot
- No fake alignment score/needle
- No deterministic psychological claims from symbolic systems
- No diagnosis
- No unsupported motive attribution
- Worlds optional/consented
- Symbolic source material not represented as deterministic psychological fact
- Covenant opt-in bounded

---

## Authenticated E2E Production Smoke Test

```text
Authenticated E2E production smoke test:
BLOCKED — no authorized production test account/credentials available in this environment.
```

Already verified:

```text
Source certification:            PASS
Deployment certification:        PASS
Production readiness:            PASS
Authentication boundary:         PASS
Authenticated intelligence E2E:  NOT VERIFIED IN THIS ENVIRONMENT
```

The authenticated path (session → workspace → Baseline → Expression Field → intelligence → sovereign-answer.v2 → persistence) is fully implemented and passes local integration tests. Production exercise requires an authorized test account with an active session.

---

## Rollback Procedure

### Identify last known-good SHA

```bash
git log --oneline -10
```

Each production release records its exact SHA in D1 release evidence. The `/ready` endpoint exposes the currently deployed SHA. To find the last known-good release:

```bash
# Check production readiness to confirm current SHA
curl -sS https://sovereign.defrag.app/ready | jq '.sha'
```

### Revert to a known-good release

1. Check out the known-good SHA:

```bash
git checkout <known-good-sha>
```

2. Verify the SHA builds and passes gates:

```bash
pnpm verify:cloudflare-build
```

3. Deploy using the authoritative release path:

```bash
CLOUDFLARE_API_TOKEN=<token> pnpm production:release:text
```

Or via the OAuth release script:

```bash
bash scripts/production-release-oauth.sh
```

4. Confirm rollback:

```bash
curl -sS https://sovereign.defrag.app/ready | jq '{sha: .sha, ready: .ready, migration: .migrationVersion}'
```

### Migration compatibility

Worker rollback does not reverse D1 migrations. If the rolled-back code expects a schema that no longer exists, forward-repair migrations must be applied before rollback. The current schema (`0018_workers_ai_capacity_reservations`) is backward-compatible with all code since `0017`.

### What must NOT be manually changed during rollback

- Do not manually edit D1 data
- Do not manually modify Worker secrets via Cloudflare dashboard
- Do not manually alter Cloudflare route configurations
- Do not bypass the release orchestrator with ad-hoc `wrangler deploy`
- All changes go through the canonical release path

---

## Next Release Path

```text
develop/change
    ↓
pnpm verify:cloudflare-build
    ↓
pnpm production:release:text
    ↓
deploy (single wrangler deploy)
    ↓
readiness (both branded /ready endpoints)
    ↓
SHA reconciliation (GitHub = Cloudflare = /ready)
    ↓
smoke verification
```

### Exact commands

```bash
# 1. Verify source
pnpm verify:cloudflare-build

# 2. Deploy (same SHA only)
CLOUDFLARE_API_TOKEN=<token> pnpm production:release:text

# 3. Verify production
curl -sS https://sovereign.defrag.app/ready | jq '.sha, .ready'
curl -sS https://app.defrag.app/ready | jq '.sha, .ready'
```

### Cloudflare authentication

Wrangler OAuth is the canonical credential. Extract the OAuth token for script use:

```bash
wrangler login
wrangler auth token --json
```

Do not print, commit, log, or expose the token.

### Release invariants

- Run `pnpm production:release:text` only for the **same exact SHA** that passed `pnpm verify:cloudflare-build`
- The release orchestrator asserts SHA parity, applies migrations, deploys exactly once, writes release evidence, and converges readiness
- A preparation, migration, secret, Cloudflare-control, or DMARC failure before `wrangler deploy` performs zero deployments
- A failure after `wrangler deploy` is one deployment and must be diagnosed before another release attempt

---

## Operational Guardrails

### Source parity

```text
GitHub SHA = release SHA
```

Enforced by `scripts/assert-main-release.mjs`. The release command rejects drift between the local checkout and `origin/main`.

### Deployment parity

```text
release SHA = Cloudflare deployed SHA
```

Enforced by the release orchestrator's single `wrangler deploy` and post-deploy verification.

### Runtime parity

```text
Cloudflare deployed SHA = /ready SHA
```

Verified by the release orchestrator's convergence step across both branded domains.

### Migration parity

```text
source migration = production migration
```

Verified by `pnpm verify:migrations` (pre-deploy) and `/ready` response (post-deploy).

### Release acceptance

A successful build alone does not constitute launch acceptance.

A healthy production endpoint alone does not constitute product certification.

Both are required. Source certification, deployment certification, and product certification are separate states that must all be satisfied.

---

## Evidence Retention

Keep, as applicable:

- Exact `origin/main` SHA and exact deployed SHA
- `pnpm verify:cloudflare-build` result for that SHA
- One-deploy production result
- `/health` and `/ready` evidence from both branded domains
- Migration, privacy dependency, and release-evidence parity
- The explicit release-evidence route/rendered booleans
- Sanitized Cloudflare control/deployment metadata
- Real authenticated product-journey evidence (when available)
- Human desktop/iPhone screenshots when privacy-safe
- Optional Browser Rendering reports only when actually run

---

---

## Post-Launch Acceptance (2026-08-25)

Appended after the initial launch certification. Production release SHA unchanged.

### Product Acceptance Matrix

| Journey | Source | Production | Evidence | Status |
|---------|--------|------------|----------|--------|
| Public landing | implemented | sovereign.defrag.app serves correct product messaging, meta description, founder visual authority | HTTP 200, correct `<title>`, CSS authorities loaded | PASS |
| Authentication | implemented | WebAuthn passkeys + HMAC sessions; unauthenticated boundary returns 401 | HTTP 401 on unauthenticated `/api/v1/sovereign/turn` | PASS |
| Onboarding | implemented | PlanOnboarding with baseline collection, policy acceptance, 18+ eligibility | Source verified, policy gates wired | PASS (source) |
| Baseline | implemented | baseline-source.v1 + baseline-facets.v1, Baseline engine configured | `/ready` reports `baselineEngine: configured` | PASS (source) |
| Expression Field | implemented | 15 axes, deterministic from Baseline, `cache-control: private, no-store` | Source verified, endpoint authenticated | PASS (source) |
| Sovereign Answer | implemented | `sovereign-answer.v2` contract, recognition validation, dual safety gate | `/ready` reports `answerContract: sovereign-answer.v2` | PASS (source) |
| Persistence | implemented | D1 with bookmark forwarding, session-scoped reads | `/ready` reports `d1: ok`, `migrationParity: current` | PASS |
| Relationship | implemented | Pair comparison, consent-gated, framework display consent | Source verified | PASS (source) |
| System | implemented | System analysis, consent enforcement | Source verified | PASS (source) |
| Billing | implemented | Stripe configured, 6 webhook paths, unsigned requests rejected | HTTP 405 on unsigned Stripe webhook | PASS |
| Privacy | implemented | On-demand export, no retained artifacts, policy receipts | `/ready` reports `privateExports: on-demand-no-artifact`, `policyAcceptanceReceipts: configured` | PASS |
| Email | implemented | Resend, `info@defrag.app`, DMARC verified | `/ready` reports `transactionalEmail: resend`, DMARC verified | PASS |
| Frontend | implemented | SovereignIntelligenceWorkspace (6 surfaces), responsive, Geist Sans, near-black foundation | CSS authorities loaded, `viewport-fit=cover`, `prefers-reduced-motion` support | PASS |

### Visual Acceptance

| Surface | Status | Evidence |
|---------|--------|----------|
| Near-black foundation | PASS | `theme-color: #080a0d` |
| Warm cream typography | PASS | Geist Sans loaded, CSS custom properties active |
| Mobile viewport | PASS | `viewport-fit=cover`, safe-area-inset support in 30+ CSS files |
| Reduced motion | PASS | `prefers-reduced-motion: reduce` in 57+ CSS files |
| Safe area (notch) | PASS | `env(safe-area-inset-*)` in 30+ CSS files |
| Landing content | PASS | Correct product messaging: "private personal AI", "understanding", "relationships", "decisions", "Baseline" |
| Policy pages | PASS | `/terms` and `/privacy` return HTTP 200 |

### Authenticated E2E

```text
NOT VERIFIED — authorized test account unavailable in this environment.
```

The authenticated intelligence path (session → workspace → Baseline → Expression Field → intelligence → sovereign-answer.v2 → persistence) is fully implemented and passes local integration tests. Production exercise requires an authorized test account with an active session.

### Product Journey Evidence

| Journey | Intent | Implementation | Production State | Evidence | Remaining Gap |
|---------|--------|---------------|-----------------|----------|---------------|
| #210 Account → Baseline → Workspace → first answer | Account creation → policy → plan → Baseline → Workspace → sovereign-answer.v2 | PlanOnboarding + SovereignIntelligenceWorkspace + sovereign.ts | Infrastructure ready; authenticated path requires real account | Source certified, deployment certified | Real user journey execution |
| #211 auth/email/billing lifecycle | Email passkey, session, billing, account lifecycle | WebAuthn + Stripe + Resend | All dependencies configured | `/ready` reports all configured | Real user journey execution |
| #212 People/Relationship/System | Invitation → consent → relationship → System → revoke | relational-context.ts, consent enforcement | Source implemented | Source certified | Real user journey execution |
| #213 text AI modes, Basis, safety | Representative AI modes, source attribution, failure handling | sovereign.ts, recognition.ts, safety.ts, input-safety.ts | AI Gateway configured, model available | Worker Gateway smoke passed (202) | Real user journey execution |
| #214 visual/interaction QA | Human desktop + iPhone/Safari/PWA review | CSS authorities, responsive design, accessibility | Visual checks pass (see above) | HTTP evidence, CSS verification | Human desktop/iPhone review |
| #215 documentation authority | Documentation free of contradictions | docs/ reconciled | Migration references updated | Launch record created | Human review |
| #216 stability matrix | Final PASS/FAIL/N/A and sign-off | All gates pass | 23/23 stages, 457 tests | This document | Owner sign-off |

### Release Impact

```text
NO PRODUCTION CHANGE REQUIRED
```

No genuine production defect was discovered during post-launch acceptance. The authenticated E2E gap is an evidence gap, not a production defect.

---

## Owner Acceptance Checklist

### Engineering Certification

| Item | Status |
|------|--------|
| Source certification | PASS |
| Build | PASS (pnpm build — all 10 projects) |
| Tests | PASS (457/457) |
| Migrations | PASS (18/18) |
| Release verification | PASS (verify:release-config, verify:intelligence-release) |
| Cloudflare build | PASS (verify:cloudflare-build — 23/23 stages) |
| Deployment | PASS (production:release:text — success) |
| SHA parity | PASS (HEAD = origin = Cloudflare = /ready = 31da213...) |
| Migration parity | PASS (source = deployed = /ready = 0018_workers_ai_capacity_reservations, parity: current) |
| Production readiness | PASS (/ready — all dependencies configured) |
| Security configuration | PASS (scan:secrets — clean) |
| Visual implementation checks | PASS (CSS authorities, typography, viewport, reduced-motion, safe-area) |

### Requires Human Acceptance

| Item | Status | Owner Action |
|------|--------|--------------|
| Authenticated real-user journey | EVIDENCE PENDING | Exercise the full first-user path with a real test account |
| Desktop interaction review | EVIDENCE PENDING | Review live app in desktop browser |
| iPhone interaction review | EVIDENCE PENDING | Review live app on iPhone/Safari |
| Owner acceptance of product messaging/experience | EVIDENCE PENDING | Review and accept the overall product experience |

### How to Close These Gaps

When an authorized production test account is available:

```text
landing → authentication → account/session → baseline → workspace
→ first question → Sovereign Answer → follow-up → persistence
```

Then test one representative Relationship or System journey.

Record only: journey completed, success/failure, route, contract status, persistence result, release SHA.

On desktop and iPhone, review:

```text
landing page — authentication — onboarding — workspace — composer
— answer rendering — navigation — error/loading states — responsive behavior
— typography — spacing — information hierarchy
```

Classify any issues found:

```text
BLOCKING        — prevents user from completing core journey
NON-BLOCKING    — cosmetic or minor, does not block acceptance
ACCEPTED        — known, intentional, or within product direction
```

### Product Journey Acceptance

| Journey | Classification | Evidence |
|---------|---------------|----------|
| #210 Account → Baseline → Workspace → first answer | EVIDENCE PENDING | Real user journey not yet executed |
| #211 auth/email/billing lifecycle | EVIDENCE PENDING | Real user journey not yet executed |
| #212 People/Relationship/System | EVIDENCE PENDING | Real user journey not yet executed |
| #213 text AI modes / Basis / safety | EVIDENCE PENDING | Real user journey not yet executed |
| #214 visual / interaction QA | EVIDENCE PENDING | Human desktop/iPhone review pending |
| #215 documentation authority | ACCEPTED | Launch record reconciled |
| #216 stability matrix / owner sign-off | EVIDENCE PENDING | Depends on #210–#214 closure |

---

## Final Owner Sign-Off

```text
Engineering certification:              PASS
Production deployment certification:    PASS
Production SHA:                         31da213ba542b55a519d1e930f6bfa50d4d5db4e

Authenticated E2E:                      EVIDENCE PENDING
Desktop human acceptance:               EVIDENCE PENDING
iPhone human acceptance:                EVIDENCE PENDING
Product journey acceptance:             EVIDENCE PENDING
Owner sign-off:                         PENDING

Production status:                      LIVE — ACCEPTANCE EVIDENCE PENDING

PRODUCTION RELEASE SHA  = 31da213ba542b55a519d1e930f6bfa50d4d5db4e
ACCEPTANCE DOCS SHA     = bbc5412
```

---

## Documentation Map

| Document | Purpose |
|----------|---------|
| `docs/architecture.md` | System architecture |
| `docs/production-release.md` | Release procedure authority |
| `docs/release-prep.md` | Pre-release preparation |
| `docs/release/OWNER_ACTIONS.md` | Owner release actions |
| `docs/release/NAMESPACE_AUTHORITY.md` | Domain/namespace authority |
| `docs/product-language-system.md` | Product language authority |
| `docs/v0-visual-port-contract.md` | Visual port contract |
| This document | Launch acceptance evidence |
