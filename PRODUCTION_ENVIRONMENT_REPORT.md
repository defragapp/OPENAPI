# Sovereign.OS — Production Environment Report

**Status:** Phase 1 — verified as of 2026-08-28 (UTC)
**Release:** `release-v1.0.0` → commit `e2e7c2389dafa4621632db0dede9964d6ac80d08`
**Method:** live public probes + configuration/source inspection. Nothing in this report claims an automated Browser check or authenticated API call that did not actually run.

---

## 1. DNS & Routing

| Host | Type | Resolves to (Cloudflare edge) | Notes |
|------|------|------------------------------|-------|
| `defrag.app` | A | `172.67.189.53`, `104.21.9.97` | Redirects `308` to `sovereign.defrag.app/` |
| `app.defrag.app` | A | `172.67.189.53`, `104.21.9.97` | Auth'd app; `308` → `/app` → `/login` when unauthenticated |
| `sovereign.defrag.app` | A | `104.21.9.97`, `172.67.189.53` | Public landing (200) |

All three hosts terminate on Cloudflare edge (cf-ray headers observed), TLS valid (`ssl_verify_result=0`).

- `https://defrag.app` → **308** → `https://sovereign.defrag.app/` (canonical public landing).
- `https://app.defrag.app` → **308** → `https://app.defrag.app/app` → **200** SPA shell, then client-side redirect to `/login?returnTo=%2Fapp` for unauthenticated visitors (auth gate active).
- `https://sovereign.defrag.app` → **200** HTML (`<title>Sovereign.OS — Private personal AI for real life</title>`).

## 2. Worker & Ready Endpoints (both branded endpoints)

Both hosts report identical, expected values (AGENTS.md line 21 satisfied):

| Field | `app.defrag.app/ready` | `sovereign.defrag.app/ready` |
|-------|------------------------|------------------------------|
| `ok` | true | true |
| `ready` | true | true |
| `sha` | `e2e7c2389dafa4621632db0dede9964d6ac80d08` | same |
| `version` | `e2e7c2389dafa4621632db0dede9964d6ac80d08` | same |
| `environment` | production | production |
| `migrationVersion` | `0019_deprecate_manual_capacity` | same |
| `latestMigrationVersion` | `0018_...` | same |
| `dependencies.migrationParity` | `current` | same |
| `releaseEvidence.sha` | `e2e7c23...` | same |

**Dependencies reported configured:** d1 `ok`; migrationParity `current`; aiFreeCapacity, aiCapacityReservations, passkeys, releaseEvidenceStore, policyAcceptanceReceipts, privacyAccessControls, durableObjects, assets, ai, aiGateway (`sovereign-ai-gateway`) all `configured`; baselineEngine `configured`; authentication `configured`; transactionalEmail `resend`; stripe `configured` (with `stripeWebhookPaths`); worldsVideo `disabled`; privateExports `on-demand-no-artifact`; sharing `public-link-only`.

**Release evidence honesty (AGENTS.md line 22):** `routeCohesionVerified: false` and `renderedVisualVerified: false` — correct for the text-first launch, which intentionally does **not** run automated Browser Rendering. `dmarcVerified: true` (checked `_dmarc.defrag.app`).

## 3. Served Worker & Deployment Params

- Worker `main`: `apps/sovereign-worker/src/runtime-entry.ts` (wrangler.jsonc `name: sovereign-agent`).
- Bindings: D1 `DB`, Durable Object `THREADS` (ThreadCoordinator), AI binding, ASSETS (from `../web/dist`).
- Static assets served from `apps/web/dist`: `index-DTMNbHKg.js`, `index-DdoOqF30.css`, `rolldown-runtime-*.js`, `vendor-react-*.js`, `sovereign-context-field.svg`.
- Observability enabled: invocation logs `on`, traces on with `head_sampling_rate 0.05`.
- Custom domains `sovereign.defrag.app` / `app.defrag.app` enabled (Cloudflare account-level; confirmed via account session).

## 4. API Surface (grounded in `apps/sovereign-worker/src/index.ts`)

Auth/identity:
- `POST /api/v1/auth/signup`, `POST /api/v1/auth/login` (magic-link request, same-origin enforced)
- `GET/POST /api/v1/auth/redeem` (magic-link redeem)
- `POST /api/v1/auth/logout`, `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/session` (auth required)

Account / onboarding / data lifecycle:
- `GET/POST /api/v1/account/onboarding`
- `POST /api/v1/baseline/onboarding`, `GET /api/v1/baseline/status`, `POST /api/v1/baseline/profile/prepare`
- `POST/DELETE /api/v1/current-conditions`
- `POST /api/v1/export-jobs`, `POST /api/v1/deletion-jobs`, `GET /api/v1/deletion-jobs`, `PATCH /api/v1/deletion-jobs/:jobId`
- `GET /api/v1/you`

People / relationship:
- `GET/POST /api/v1/people`, `POST /api/v1/people/:personId/invitations`, `PATCH /api/v1/invitations/:invitationId`, `PUT /api/v1/people/:personId/consent/:scope`, `POST /api/v1/people/:personId/compare`

Systems / alignment:
- `GET/POST /api/v1/systems`, `POST /api/v1/systems/:systemId/members`, `GET /api/v1/systems/:systemId/alignment`

Library:
- `GET/POST /api/v1/library`, `PATCH/DELETE /api/v1/library/:understandingId`

Intelligence threads:
- `GET /api/v1/today`, `GET /api/v1/threads`, `GET /api/v1/threads/:threadId`, `POST /api/v1/threads/:threadId/messages`, `POST /api/v1/threads/:threadId/corrections`, `POST /api/v1/explore`, `POST /api/v1/threads/:threadId/covenant`

Billing (Stripe):
- `GET /api/v1/billing/entitlements`, `POST /api/v1/billing/checkout`, `POST /api/v1/billing/portal`, `POST /api/v1/billing/stripe-test-event` (test-scoped), `POST /api/v1/stripe/webhook` (webhook; bypass)

TTS:
- `POST /api/tts` (auth + same-origin + edge cache)

Other:
- `GET /ready` (public), scheduled/queue handlers.
- `app.notFound` → `{"error":"Not found"}` 404; `app.onError` → 500 JSON.

## 5. Observed Live Behavior (black-box probes)

- `defrag.app/` → 308 → `sovereign.defrag.app/` (200).
- `app.defrag.app/app` unauthenticated → `200` shell → client `302`-style redirect to `/login?returnTo=%2Fapp` — **auth gate active before app content**.
- `app.defrag.app/api/v1/nonexistent-xyz` → **401 Unauthorized** (auth enforced at the `/api` middleware before routing; not found is not disclosed to unauthenticated callers).
- `app.defrag.app/api/tts` unauthenticated `POST {"text":"hi"}` → **404 `{"error":"not_found"}`** (route not reached without auth). Noted discrepancy vs `401` on other `/api` paths — flagged for Phase 8 security review (see below).
- TLS: all valid, no cert errors.

### Observation for Phase 8 (Security)
The `/api/tts` unauthenticated probe returned `404 not_found` whereas a bogus `/api/v1/*` path returned `401`. This is likely due to the assets `not_found_handling` / route-mount ordering. **Not a security regression** (the endpoint still returns no data and requires auth), but it should be confirmed intentional during the security review so API reachability/security posture is consistent.

## 6. Findings & Follow-ups

| # | Severity | Finding | Disposition |
|---|----------|---------|-------------|
| E-1 | Info | Both branded `/ready` report exact `e2e7c23`; parity current | No action |
| E-2 | Info | Release evidence fields false for Browser rendering (text-first); dmarc true | Correct per AGENTS.md 22 |
| E-3 | Low | `/api/tts` unauth returns 404 vs 401 on other `/api` paths; confirm intentional in Phase 8 | Phase 8 |
| E-4 | Info | Landing is client-rendered SPA; hero text not in static HTML (JS-rendered). Verify against "visible without JS" product rule in Phase 2 | Phase 2 |

---

**Phase 1 status:** Production environment live and healthy; both branded `/ready` endpoints at exact certified SHA. Follow-ups (E-3, E-4) carried into Phases 2 and 8.
