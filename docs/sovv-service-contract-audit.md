# SOVV service contract audit

Audit date: 2026-07-22
Reference repository: `https://github.com/defragapp/SOVV.git`
Inspected commit: `a3db94bccc75089723bef0cf5ff36c47064bd789`

## Scope and rule

SOVV is read-only reference material for OPENAPI. This audit records verified contracts and boundaries from the SOVV source so OPENAPI can connect to proven capabilities without copying obsolete product structure or binding directly to SOVV production storage.

## Verified deployed/source components

SOVV contains a Cloudflare Worker at `apps/worker` with Wrangler service name `sovereign-os-api`. Its Worker config binds D1 as `DB`, KV as `KV`, R2 buckets as `TEMPLATES` and `LOGS`, Queue as `QUEUE`, AI as `AI`, and private service bindings `AI_SERVICE` and `SESSION_SERVICE`.

The worker config also shows legacy public product assumptions such as `APP_URL=https://defrag.app`, `STRIPE_PRICE_ID`, and `STRIPE_ANNUAL_PRICE_ID`; those names are provenance only and are not canonical for OPENAPI.

## Baseline input contract

The verified SOVV Baseline save route accepts a `BaselineRequest` shape with:

- `dob`: non-empty string
- `pob`: non-empty string
- `tob.type`: `exact` or `approx`
- `tob.value`: non-empty string

SOVV stores raw baseline input in KV by session and writes a pending `BaselineDesignDataset` before starting compilation. OPENAPI must not send this raw input to the Sovereign model.

## Baseline computation pipeline

The verified compiler is `apps/worker/src/baseline-compiler.ts`. Its documented pipeline is:

1. natal input (`dob`, `tob`, `pob`)
2. geocoding to latitude, longitude, and timezone
3. JPL Horizons ephemeris
4. astrology framework data
5. Human Design framework data
6. Gene Keys framework data
7. numerology
8. AI synthesis into derived traits and app overlays
9. stored `BaselineDesignDataset` in KV

The compiler explicitly treats AI as the synthesis layer, not the computation source. Deterministic framework data is computed before AI synthesis.

## Reduced model-safe representation

SOVV exposes model-safe reduction through:

- `formatDatasetForAI(dataset)`
- `formatDatasetForApp(dataset, app)`
- `buildHumanBehaviorTranslation(...)`
- `selectActiveSignals(...)`
- `formatActiveSignalsForPrompt(...)`

The active-signal layer states that the full baseline compute is never used directly in prompts or UI. OPENAPI should preserve that rule and send only reduced Baseline tendencies, timing/context signals, and uncertainty language into Sovereign.

## Current conditions

SOVV's `baseline-compiler.ts` includes `LiveSkySnapshot` and `getCurrentSkySnapshot(...)` for current planetary positions, caching for six hours, and timing/transit analysis. The calculation uses permitted location coordinates internally but OPENAPI should only expose/store the user's selected precision mode and reduced current-condition context.

## Existing routes and service candidates

Verified routes in `apps/worker/src/baseline.ts` include:

- `GET /api/baseline`
- `POST /api/baseline`
- `GET /api/baseline/status`
- `POST /api/baseline/translate`
- `GET /api/baseline/dataset`

SOVV's route handlers are session-oriented and tied to SOVV KV/D1 state. They should not be called from OPENAPI as public REST endpoints for user product state. A private service-binding adapter is only safe after a dedicated SOVV Worker contract exists that accepts sanitized input and returns reduced context without exposing SOVV storage.

## Recommended OPENAPI adapter contract

```ts
interface SovvBaselineService {
  computeBaseline(input: SanitizedBaselineInput): Promise<ReducedBaselineContext>;
  getCurrentConditions(input: SanitizedCurrentConditionInput): Promise<ReducedCurrentConditionContext>;
}
```

Required behavior:

- no direct binding to SOVV production D1 or KV
- no public routed SOVV calls when a private service binding is available
- no raw birth input or exact private location sent to Sovereign
- no framework dumps in prompts or user-facing output
- service unavailable or fixture mode clearly labeled

## Porting decision

No deterministic computation code was ported in this pass because the verified SOVV functions are embedded in SOVV's Worker/KV/session architecture and need either a dedicated service-binding facade or a smaller extracted library with parity tests. OPENAPI remains adapter-ready and uses deterministic reduced fixture context until a callable SOVV service contract is exposed.

## Unavailable or unverified

- No stable SOVV Worker RPC method was verified for `computeBaseline` or `getCurrentConditions`.
- No private service binding target name was verified for a dedicated Baseline/current-condition facade.
- No preview-safe SOVV authentication contract was verified.

## SOVV modification status

SOVV was cloned under OPENAPI `.tmp` for read-only inspection, its push URL was disabled, and no SOVV files were modified.
