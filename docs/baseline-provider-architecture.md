# Baseline provider architecture

Status: reduced/partial. This document prevents OPENAPI from treating the current Baseline Worker as a full SOVV-equivalent Baseline Design engine before parity evidence exists.

## Evidence categories

Sovereign must keep these categories separate in model context and UI copy:

1. deterministic conditions: verified astronomical or time/location-derived facts;
2. interpretive frameworks: astrology, Human Design, Gene Keys, numerology, tarot, and related symbolic systems;
3. observed human data: what a user reports, confirms, corrects, repeats, or rejects;
4. unknown state: what Sovereign cannot know about the user or another person.

The internal contract uses `EvidenceItem` and `UnknownItem` records in `packages/baseline-engine` so these categories cannot silently collapse into one claim.

## Provenance table

| OPENAPI module | SOVV source path | Source commit | Port status | Parity fixture |
| --- | --- | --- | --- | --- |
| `packages/baseline-engine/src/index.ts` normalized input | `packages/core/src/types.ts` (`BaselineRequest`) | `a3db94bccc75089723bef0cf5ff36c47064bd789` | Ported as sanitized input validation, coarse place handling, and birth-time certainty normalization | Unit tests cover exact, unknown, malformed input |
| `packages/baseline-engine/src/index.ts` current-condition shape | `apps/worker/src/baseline-compiler.ts` (`LiveSkySnapshot`, `getCurrentSkySnapshot`) | `a3db94bccc75089723bef0cf5ff36c47064bd789` | Reduced scaffold only; no JPL/Horizons parity port yet | Unit tests cover reduced region precision and unavailable location |
| `packages/baseline-engine/src/index.ts` model-safe reduction | `apps/worker/src/baseline-compiler.ts` (`formatDatasetForAI`, `formatDatasetForApp`) | `a3db94bccc75089723bef0cf5ff36c47064bd789` | Reimplemented as evidence/unknown records; raw fallback is intentionally not ported | Unit tests assert raw birth date/time are absent from model-safe output |
| `packages/baseline-engine/src/index.ts` active signal reduction | `apps/worker/src/active-signals.ts` (`selectActiveSignals`, `formatActiveSignalsForPrompt`) | `a3db94bccc75089723bef0cf5ff36c47064bd789` | Not ported; interpretive framework parity remains unavailable | No fixture yet; must use verified SOVV outputs before implementation |
| `apps/baseline-worker/src/index.ts` private service | SOVV Worker/service-binding patterns | `a3db94bccc75089723bef0cf5ff36c47064bd789` | OPENAPI-owned private reduced endpoint; no SOVV production D1/KV binding | Worker tests cover readiness and internal-token protection |

## Raw input rule

SOVV's fallback path that formats raw `dob`, `tob`, and `pob` for AI context is intentionally not ported. OPENAPI must never place raw birth input or exact private location in Sovereign model context.

## Parity requirements before full Baseline claims

Before OPENAPI can claim SOVV-equivalent deterministic Baseline parity, it needs fixture evidence for:

- known complete birth time;
- approximate birth time;
- unknown birth time;
- multiple locations;
- multiple dates;
- current-condition inputs;
- malformed input;
- unavailable astronomical source.

For each fixture, compare normalized inputs, deterministic outputs, reduced context, and unavailable/error state. Where SOVV requires live dependencies that are not available in preview, OPENAPI must return unavailable context rather than substitute generic interpretation.
