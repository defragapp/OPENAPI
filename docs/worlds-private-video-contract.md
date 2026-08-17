# Sovereign.OS Worlds — private video contract

Status: **future/disabled reference only**. Video generation is not part of the current Sovereign.OS launch, is not a production acceptance requirement, and must remain disconnected from the core authenticated runtime unless a future explicit product decision reopens activation.

Issue #198 was closed `not planned` for the current launch on 2026-08-17.

This document preserves the previously designed privacy/cost/renderer boundaries so a future video experiment cannot bypass them. It does **not** authorize activation, provider spend, a video CTA, or a second product path.

## Current launch decision

The canonical authenticated product is text-first:

`question → direct answer → relevant structured explanation → quiet Basis/provenance → correction or continuation`

The landing demo-chat workflow may inform text-thread presentation. No generated video is required to explain, complete, or approve a Sovereign answer.

Current production requirements:

- `WORLDS_VIDEO_ENABLED` remains false/not activated;
- the authenticated workspace does not mount `WorldVideoLauncher` as a core dependency;
- normal workspace load does not require a Worlds/video status request;
- no video provider credential/spend is required for launch;
- Free/Sovereign+ launch pricing does not include a video-generation turn cost;
- #207/#210–#216 product acceptance proceeds without generated media.

## Preserved future semantic boundary

If video is ever reconsidered, it must remain downstream of the existing intelligence chain:

`Exact Baseline source → Baseline facets → Expression Field → renderer-safe World spec → illustrative World`

Temporary current context may modulate emphasis but does not redefine Baseline identity or assert emotion/behavior.

The renderer may receive only coarse server-derived World-physics values such as visibility, tempo, structural weight, thresholds, traversability, reconnection, and stability.

A future provider must never receive:

- birth date/time/place, exact private location, natal coordinates, exact source degrees, or raw JPL output;
- account ID, email, name, session/auth data, billing identifiers, invitation secrets, or direct identity;
- Basis registry values/framework labels;
- conversation text, Library content, arbitrary renderer prompts, or unrelated account history;
- another person’s private Baseline/system data without a separately approved multi-person renderer contract.

## Preserved future visual boundary

If reopened, renderer output must remain illustrative rather than diagnostic/predictive. The prior visual grammar favored near-black, restrained real-world materiality, minimal chrome, no mystical/spiritual certainty, no astrology/planets/HUD/cards/dashboard overlays, and no identifiable person likeness without a separately reviewed likeness/consent flow.

## Preserved future execution boundary

The previously designed implementation used the existing Cloudflare AI binding/Gateway rather than a direct provider SDK/key, did not add R2/Queue/second Worker, proxied provider media through the authenticated Worker, and did not persist generated video.

Those constraints remain minimum safeguards for any future reopening. They are not a reason to keep a provider active now.

## Preserved future cost boundary

Before any future activation, product/cost review would need to define:

- explicit entitlement;
- explicit user-visible turn/cost policy;
- provider/account spend limits;
- provider availability;
- failure/refund semantics;
- privacy/retention terms;
- real authenticated end-to-end proof.

No such activation is part of the current launch.

## Preserved future relationship/system boundary

Relationship/System Worlds remain outside the current launch and would require a separate scope-specific consent/revocation/data-minimization contract. Ordinary relationship/system text intelligence does not imply permission to render another person or their private context.

## Release relationship

The current production release must not fail merely because Worlds/video is disabled. The core launch must instead prove the text-first Sovereign product, real Baseline/AI flow, billing/account lifecycle, permission-bound People/Systems, privacy controls, and human desktop/iPhone QA.

Do not reactivate video by changing only a feature flag. A future activation requires an explicit product decision, current privacy/cost review, focused tests, the full exact-SHA release gate, and a separately tracked production acceptance task.
