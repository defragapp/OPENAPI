# Sovereign.OS production AI safety boundary

Status: current safety/runtime boundary.

Sovereign.OS is a non-clinical personal, relationship, and system intelligence product. It does not diagnose, determine another person’s motives, verify unseen causes, predict with certainty, or replace emergency/professional services.

## One server-owned authority

Safety decisions remain inside the canonical `sovv-web` Cloudflare Worker. There is no second safety service, alternate model provider, emergency dashboard, Queue, R2 store, Pages project, or parallel application.

The current authenticated product is text-first. Safety handling must remain complete without a video/Worlds renderer.

The input boundary has four dispositions:

- `standard`: continue through ordinary consent-aware Baseline and `sovereign-answer.v2` flow;
- `grounded`: deterministic observed-versus-interpreted distinction when a specific unverifiable threat claim would otherwise be reinforced;
- `urgent`: immediate general human-support guidance for explicit imminent self-harm, imminent harm to another person, dangerous ingestion, or immediate physical danger;
- `secure_refusal`: protect system prompts, credentials, private identifiers, internal security rules, consent, authorization, and entitlement boundaries.

The primary answer model cannot lower or bypass deterministic dispositions. Model-authored `safety_mode` remains part of the validated ordinary answer contract, not policy authority.

## Execution order

For each accepted message, the Worker:

1. validates authentication, same-origin, idempotency, policy state, Baseline readiness, and bounded user input;
2. applies the deterministic input decision to the user message only;
3. records the owned thread turn;
4. completes grounded, urgent, or secure-refusal responses before ordinary model capacity is reserved;
5. uses Cloudflare Workers AI through AI Gateway only for standard messages;
6. validates answer contract, consented context, authorized mode/Basis IDs, Covenant grounding, and output language before returning the ordinary answer.

Deterministic safety responses therefore remain available when ordinary model capacity is unavailable and do not consume the ordinary monthly AI turn when the runtime contract specifies that behavior.

## Deterministic response limits

Grounded, urgent, and secure-refusal responses contain:

- no technical Basis;
- no Baseline interpretation;
- no Covenant/Scripture lens;
- no relationship/system synthesis;
- no Library/pricing/plan/invitation continuation actions;
- no invented phone number, organization, URL, jurisdiction, diagnosis, motive, spiritual cause, or promised outcome.

When immediate danger is explicit, the response directs the user toward appropriate immediate human/emergency support without guessing the user’s location or inventing a local resource.

The authenticated thread gives deterministic safety answers a distinct presentation and suppresses ordinary evidence, correction, saving, continuation, Covenant, and plan controls.

## Privacy and model controls

Ordinary generation uses Cloudflare Workers AI through AI Gateway with cache bypass, persistent request-content logging disabled, pseudonymous metadata, and the stable response contract.

The ordinary answer model does not receive raw birth inputs, exact private location, credentials, Stripe identifiers, invitation secrets, unrelated Library history, or unconsented person data.

The deterministic input router receives the bounded user message only. It does not receive Baseline data, People/System records, entitlements, exact location, credentials, or hidden prompts.

Current policy/privacy schema is `0018_workers_ai_capacity_reservations`. Authenticated account export is generated on demand and is not part of model context.

## Product scope decisions

A semantic risk model, jurisdiction-specific resource catalog, separate classifier dashboard, hidden-model scoring surface, safety analytics database, or safety-specific video experience is not part of the current production line. Such additions require separate product/privacy/evaluation review.

Worlds/video generation is not part of the current launch runtime and is not required for safety or answer completion.

## Release evidence

Production safety is releasable only when the exact current `origin/main` SHA passes `pnpm verify:cloudflare-build`, is released through the current procedure in `docs/production-release.md`, and both branded hosts report exact-SHA readiness with migration `0018_workers_ai_capacity_reservations`, migration parity `current`, configured policy/privacy dependencies, and matching release evidence.

Automated Browser Rendering is not safety evidence unless it actually ran. Human visual review and automated Browser evidence remain separate.
