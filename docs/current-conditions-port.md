# Current-condition computation port

Status: current implementation provenance for the OPENAPI current-condition layer.

## Reference

SOVV was inspected read-only at commit `a3db94bccc75089723bef0cf5ff36c47064bd789` while the minimum Horizons behavior was ported into OPENAPI. That legacy source is provenance only; production executes the OPENAPI implementation.

The original reference areas supplied stable mechanics such as planetary target IDs, longitude-to-sign normalization, Horizons query construction, sequential body fetching, and the six-hour cache window.

## Current production behavior

The canonical implementation is `apps/sovereign-worker/src/current-conditions/current.ts`.

OPENAPI is live NASA/JPL Horizons-backed in production. When no permitted location is supplied, the observer is geocentric. The authenticated product may therefore use Earth-geocentric current positions without requesting device location.

A permitted location may be supplied only through the existing explicit current-condition contract when a product flow requires it. Location does not change the stable Baseline and is never required merely to obtain the default geocentric current layer.

The reduced output is versioned as `current-conditions.v1` and expires after six hours.

Local and test environments may use `OPENAPI_SANITIZED_FIXTURE` data so repeatable tests do not depend on network timing. Those fixtures are deterministic compatibility data only and must not be described as live current conditions.

## Interpretation boundary

Current conditions are temporary context, not identity or behavior measurement.

The layer may return exact current positions and deterministic current-to-natal contacts when the required numeric inputs exist. It may identify a Baseline theme as temporarily more relevant. It does not establish behavior, motive, exact emotion, diagnosis, or outcome.

The Baseline remains the stable interpretive reference. No behavior is treated as observed unless the user supplies or confirms it.

## Privacy boundary

The reduced current-condition result does not expose raw birth inputs, exact private location, framework dumps, credentials, account identifiers, exact emotion, diagnosis, motive, or prediction.

Geocentric operation uses no device location. When a permitted location is used, the same data-minimization and authorization rules in `privacy-model.md` and `inner-recognition-intelligence.md` apply.

## Compatibility scope

Compatibility tests assert the stable pure behavior originally ported from SOVV, especially longitude-to-sign normalization and reduced fixture shape. Tests compare normalized reduced outputs instead of model wording or full Horizons responses because live Horizons responses are time- and network-dependent.

OpenAI does not calculate planetary positions. Production inference uses the current Cloudflare AI path described in `openai-integration.md`; exact current positions come from the deterministic Horizons-backed computation layer.
