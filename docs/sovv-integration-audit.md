# SOVV integration audit

Reference checkout: `/workspace/SOVV` at commit `a3db94bccc75089723bef0cf5ff36c47064bd789`.

## Verified reference areas

OPENAPI uses SOVV as read-only reference for Baseline and current-condition behavior. The inspected SOVV worker code exposes Baseline dataset usage through `getBaseline`, `getBaselineForAI`, and `getBaselineDataset`, and uses current sky snapshots through `getCurrentSkySnapshot` before generating reduced timing signals. OPENAPI must not send raw birth date, birth time, birthplace, exact coordinates, or private source identifiers to the language model.

## OPENAPI adapter stance

The OPENAPI adapter keeps SOVV HTTP calls narrow (`/api/baseline` and `/api/baseline/dataset`) and labels fixture or unavailable states honestly. When no live SOVV base URL is configured, preview and local test modes use sanitized reduced fixtures; production fails closed rather than inventing live Baseline data.

## Baseline onboarding stance

Public onboarding stores hashes for raw Baseline inputs in OPENAPI and creates only a reduced Baseline-ready context for model use. Future production integration may replace the local reduced context with a verified SOVV-backed compile route when SOVV exposes a standalone authenticated contract for that purpose.
