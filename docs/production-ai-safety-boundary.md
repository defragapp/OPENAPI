# Sovereign.OS production AI safety boundary

Sovereign.OS is a non-clinical personal, relationship, and system intelligence product. It does not diagnose, provide therapy, determine another person's motives, verify unseen causes, or replace emergency and professional services.

## One server-owned authority

Safety decisions remain inside the canonical `sovv-web` Cloudflare Worker. There is no second safety service, alternate model provider, emergency dashboard, Queue, R2 store, Pages project, or parallel application.

The input boundary has four public dispositions:

- `standard`: continue through the ordinary consent-aware Baseline and `sovereign-answer.v2` flow;
- `grounded`: return a deterministic observed-versus-interpreted distinction when a specific unverifiable threat claim would otherwise be reinforced;
- `urgent`: return immediate general human-support guidance for explicit imminent self-harm, imminent harm to another person, dangerous ingestion, or immediate physical danger;
- `secure_refusal`: protect system prompts, credentials, private identifiers, internal security rules, consent, authorization, and entitlement boundaries.

The primary answer model cannot change these deterministic dispositions. Model-authored `safety_mode` remains a presentation field for ordinary validated answers, not policy authority.

## Execution order

For each accepted message, the Worker:

1. validates authentication, same-origin, idempotency, and the bounded user message;
2. records the user turn in the owned thread;
3. applies the deterministic safety decision;
4. completes grounded, urgent, or secure-refusal responses before checking AI availability and before reserving an AI turn;
5. uses Cloudflare Workers AI through AI Gateway only for `standard` messages;
6. validates the answer contract, authorized mode, Basis IDs, Covenant grounding, and output language before returning it.

Deterministic safety responses therefore remain available when ordinary model capacity is unavailable and do not consume a monthly AI turn.

## Deterministic response limits

Grounded, urgent, and secure-refusal responses contain:

- no technical Basis;
- no Baseline interpretation;
- no Covenant or Scripture lens;
- no relationship or system synthesis;
- no Library, pricing, plan, invitation, or continuation actions;
- no invented phone number, organization, URL, jurisdiction, diagnosis, motive, spiritual cause, or promised outcome.

When immediate danger is explicit, the response directs the user toward local emergency services, the nearest emergency department, and a trusted person without guessing the user's location or inventing local resources.

## Context firewall

Only authorization-checked model-safe context can enter ordinary generation. Recent assistant continuity is projected into bounded validated answer fields. Raw prior assistant payloads, actions, identifiers, prompts, source paths, private names, exact location, raw birth inputs, secrets, and hidden reasoning are not replayed into the model prompt.

AI Gateway calls use `skipCache: true`, `collectLog: false`, a pseudonymous account reference, the plan class, and the public response-contract version. Authorization, consent, entitlements, and Basis allowlisting remain deterministic and server-side.

## Traceability and retention

The existing owned thread event stream records the public answer, validated answer contract, Basis values actually returned, interface actions, and the public deterministic safety disposition/category when used. It does not store hidden reasoning, classifier scores, system prompts, credentials, or a second copy of private source data.

Existing account deletion and thread-retention controls remain authoritative. No separate safety analytics database is introduced.

## Product scope decisions

A separate "Translation Line" instrument, public classifier detail, internal rule names, live hidden-model scoring dashboard, or emergency-resource product is not part of the current production surface. Grounding remains part of the single Sovereign answer flow.

Any future jurisdiction-specific resource catalog or semantic risk classifier requires independently reviewed sources, privacy terms, false-positive/false-negative evaluation, Cloudflare capacity evidence, and an exact-SHA release gate before implementation.

## Release evidence

Production is releasable only when the repository-owned `pnpm verify:cloudflare-build` gate passes and the Worker development endpoint, `app.defrag.app`, and `sovereign.defrag.app` all report the same exact commit, `ready=true`, and migration `0013_workers_ai_free_capacity`.
