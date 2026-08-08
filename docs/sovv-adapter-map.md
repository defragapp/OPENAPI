# SOVV adapter map

## Verification status

The `/workspace/SOVV` read-only checkout was inspected at commit `a3db94bccc75089723bef0cf5ff36c47064bd789`. The checkout remained read-only and no SOVV files were modified.

## Verified source files

- Auth/session: `/workspace/SOVV/apps/worker/src/auth.ts`
- Session cookie compatibility: `/workspace/SOVV/apps/worker/src/routes/auth-cookie-compat.ts`
- Baseline routes and reduced dataset status: `/workspace/SOVV/apps/worker/src/baseline.ts`
- Baseline computation and NASA/JPL Horizons path: `/workspace/SOVV/apps/worker/src/baseline-compiler.ts`
- Library retrieval: `/workspace/SOVV/apps/worker/src/history.ts`
- Entitlements: `/workspace/SOVV/apps/worker/src/entitlements.ts`
- Worker bindings: `/workspace/SOVV/apps/worker/wrangler.toml`
- Public route specification: `/workspace/SOVV/lib/api-spec/openapi.yaml`

## Contracts

| OPENAPI logical contract | Verified SOVV contract | Request shape | Response shape | Auth | Notes |
| --- | --- | --- | --- | --- | --- |
| `resolveExistingIdentity` | `GET /api/user/me` from the OpenAPI spec and generated client | No body | User object with `id`, `email`, `tier`, and role-like fields when present | `__sov_session` cookie, resolved by SOVV `getAuthUser` | OPENAPI maps to `sovv:user:{id}` and stores only that subject. |
| `getBaselineSummary` | `GET /api/baseline` in `baseline.ts` | No body | `{ baseline, datasetStatus }` | SOVV session auth or JWT fallback in SOVV | OPENAPI reduces this to status/source refs and does not expose raw DOB/TOB/POB. |
| `getBaselineDimension` | `GET /api/baseline/dataset` in `baseline.ts` | No body | status, computedAt, failureReason, identityAnchors, traitCount | SOVV session auth | OPENAPI uses this as reduced dimension availability. Framework detail remains collapsed. |
| `getCurrentConditions` | `getCurrentSkySnapshot()` in `baseline-compiler.ts` | Function call currently takes rounded lat/lng in SOVV internals | `LiveSkySnapshot` with current bodies from JPL Horizons | Not exposed as standalone HTTP route | No verified standalone route exists yet, so OPENAPI fails closed in production and uses labeled fixtures only in local/test. |
| `searchLibrary` | `GET /api/library` handled by `history.ts` | query params `q`, `limit`, optional `workspace_source` | `{ items }` | `getAuthUser` via `__sov_session` cookie | OPENAPI stores only reduced item id/title/source metadata for retrieval. |
| `resolveExistingEntitlements` | `resolveEntitlements()` in `entitlements.ts` | EntitlementUser object from DB | feature booleans and effective tier | Server-side only | Transitional reference; OPENAPI Stripe projection remains future canonical source. |

## Adapter runtime behavior

- Timeout: 2.5 seconds per SOVV HTTP call.
- Retry: none for Phase 1; add bounded retry only for idempotent reads after live deployment behavior is observed.
- Provenance: `sovv-internal-http` for verified SOVV calls, `openapi-fixture` for local/test deterministic fixtures.
- Uncertainty: `medium` when SOVV responds, `high` for unavailable/degraded services.
- Production fallback: production must not invent Baseline or current-condition content. Missing SOVV/OpenAI services return a sharp service-unavailable response.
- Privacy: no raw birth inputs, exact location, cookies, tokens, or full SOVV payloads are persisted to agent prompts or logs.

## Unresolved deployment assumptions

- OPENAPI needs a same-origin route or Cloudflare service binding to SOVV's API Worker.
- Current-condition/Horizons support needs an explicit SOVV service contract because the verified code path exists as internal source, not as a standalone HTTP route.
- Cross-domain cookie use depends on the final domain and Cloudflare routing plan.
