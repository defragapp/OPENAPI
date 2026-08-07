# Sovereign.OS production AI safety boundary

Sovereign.OS is a non-clinical personal, relationship, and system intelligence product. It does not diagnose, determine another person’s motives, verify unseen causes, or replace emergency and professional services.

## One server-owned authority

Safety decisions remain inside the canonical `sovv-web` Cloudflare Worker. There is no second safety service, alternate model provider, emergency dashboard, Queue, R2 store, Pages project, or parallel application.

The input boundary has four dispositions:

- `standard`: continue through the ordinary consent-aware Baseline and `sovereign-answer.v2` flow;
- `grounded`: return a deterministic observed-versus-interpreted distinction when a specific unverifiable threat claim would otherwise be reinforced;
- `urgent`: return immediate general human-support guidance for explicit imminent self-harm, imminent harm to another person, dangerous ingestion, or immediate physical danger;
- `secure_refusal`: protect system prompts, credentials, private identifiers, internal security rules, consent, authorization, and entitlement boundaries.

The primary answer model cannot lower or bypass these deterministic dispositions. Model-authored `safety_mode` remains part of the validated ordinary answer contract, not policy authority.

## Execution order

For each accepted message, the Worker:

1. validates authentication, same-origin, idempotency, and the bounded user message;
2. applies the deterministic input decision to the message only;
3. records the owned thread turn;
4. completes grounded, urgent, or secure-refusal responses before checking AI Gateway availability and before reserving an AI turn;
5. uses Cloudflare Workers AI through AI Gateway only for standard messages;
6. validates answer contracts, consented context, authorized modes, Basis IDs, Covenant grounding, and output language before returning ordinary answers.

Deterministic safety responses therefore remain available when ordinary model capacity is unavailable and do not consume a monthly AI turn.

## Deterministic response limits

Grounded, urgent, and secure-refusal responses contain:

- no technical Basis;
- no Baseline interpretation;
- no Covenant or Scripture lens;
- no relationship or system synthesis;
- no Library, pricing, plan, invitation, or continuation actions;
- no invented phone number, organization, URL, jurisdiction, diagnosis, motive, spiritual cause, or promised outcome.

When immediate danger is explicit, the response directs the user toward local emergency services, the nearest emergency department, and a trusted person without guessing the user’s location or inventing local resources.

The authenticated space gives deterministic safety answers a distinct presentation and suppresses ordinary evidence, correction, saving, continuation, Covenant, and plan controls.

## Privacy and Cloudflare controls

Ordinary generation remains authorization-checked and uses Cloudflare Workers AI through AI Gateway with `skipCache: true`, `collectLog: false`, pseudonymous account metadata, and the public response-contract version. Raw birth inputs, exact private location, credentials, and unconsented person data are not supplied to the ordinary answer model.

The deterministic input router receives the bounded user message only. It does not receive Baseline data, people or system records, entitlements, exact location, credentials, or hidden prompts.

Existing account deletion and thread-retention controls remain authoritative. The public thread event stores the returned answer and the public safety disposition/category when deterministic routing is used; it does not store hidden reasoning or classifier scores.

## Product scope decisions

A semantic risk model, jurisdiction-specific resource catalog, separate “Translation Line” instrument, public classifier-detail surface, hidden-model scoring dashboard, or second safety analytics database is not part of the current production line. These additions require separately reviewed sources, privacy terms, capacity evidence, false-positive and false-negative evaluation, and an exact-SHA release gate before implementation.

## Release evidence

Production is releasable only when the repository-owned `pnpm verify:cloudflare-build` gate passes and the Worker development endpoint, `app.defrag.app`, and `sovereign.defrag.app` all report the same exact commit, `ready=true`, and migration `0013_workers_ai_free_capacity`.
