# Current-condition computation port

## Reference

SOVV was inspected read-only at commit `a3db94bccc75089723bef0cf5ff36c47064bd789`.

The minimum current-condition layer was ported from these reference areas:

- `/workspace/SOVV/apps/worker/src/baseline-compiler.ts`
  - `PLANET_IDS`
  - `eclipticLongitudeToSign`
  - Horizons observer query construction
  - sequential body fetching to avoid Horizons rate limits
  - six-hour cache window
  - city-level coordinate rounding precedent
- `/workspace/SOVV/apps/worker/src/routes/explain-stream.ts`
  - confirms current sky was consumed as reduced timing context inside Defrag streaming, not exposed as a reusable route

## Classification

The OPENAPI implementation is **live NASA/JPL Horizons-backed when a permitted server-side location is configured**. It uses the public Horizons API fetch layer in `apps/sovereign-worker/src/current-conditions/current.ts` and reduces the result before it can reach Sovereign.

Local and test environments may use `OPENAPI_SANITIZED_FIXTURE` data so repeatable tests do not depend on network timing. Those fixtures are deterministic compatibility data only and must not be described as live current conditions. Production fails closed when the required current-condition source inputs are unavailable.

## Intentional OPENAPI differences

- OPENAPI exposes this behind the existing current-condition adapter contract rather than adding a fake SOVV route.
- OPENAPI output is reduced and versioned as `current-conditions.v1`.
- OPENAPI does not return exact latitude/longitude, raw birth inputs, framework dumps, exact emotion, diagnosis, motive, or prediction.
- Production requires permitted location configuration; local/test can use labeled sanitized fixtures.
- OpenAI explains reduced current-condition outputs. OpenAI does not calculate planetary positions.

## Compatibility scope

Compatibility tests assert the stable pure behavior copied from SOVV, especially longitude-to-sign normalization and reduced fixture shape. Tests compare normalized reduced outputs instead of model wording or full Horizons responses, because live Horizons responses are time- and network-dependent.
