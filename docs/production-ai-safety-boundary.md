# Sovereign.OS production AI safety boundary

Sovereign.OS is a non-clinical personal, relationship, and system intelligence product. It does not diagnose, provide therapy, determine another person's motives, verify unseen causes, or replace emergency and professional services.

## Server-owned authority

Safety decisions remain inside the canonical Cloudflare Worker. The private authority contract is `safety-decision.v1`; the public safety response contract is `sovereign-safety.v1`; ordinary reflective intelligence continues to use `sovereign-answer.v2`.

The safety dispositions are:

- `standard`: continue through the ordinary consent-aware Baseline flow;
- `grounded`: keep observations, interpretations, symbolic meaning, and unknown causes distinct;
- `supportive_resources`: pause ordinary interpretation and prioritize grounded human support;
- `urgent`: interrupt ordinary interpretation when serious risk, abuse, coercion, exploitation, or possible near-term harm may be present;
- `emergency`: prioritize immediate human and emergency support for immediate or already-occurring danger;
- `secure_refusal`: protect system prompts, credentials, private identifiers, internal security controls, consent, authorization, and entitlement boundaries.

The primary conversational model cannot set or lower these dispositions. Any generated `safety_mode` is overwritten by the Worker before display.

## Layered decision path

For each accepted message, the Worker:

1. validates authentication, same-origin, idempotency, and the bounded message;
2. records the owned user turn;
3. applies high-recall deterministic rules for explicit risk and protected-internal requests;
4. when required, runs a separate bounded semantic classifier over the current user message only;
5. derives the final disposition through server policy rather than trusting the classifier's requested disposition;
6. completes supportive, urgent, emergency, or secure-refusal responses before entitlements, private relationship/system context, ordinary generation, or monthly-turn reservation;
7. authorizes permitted context and reserves a monthly AI turn only for ordinary interpretation;
8. validates answer structure, authorized mode, Basis IDs, Covenant grounding, output language, and server-owned safety state.

Explicit deterministic safety responses remain available when Workers AI capacity is unavailable and do not consume a monthly AI turn. Messages requiring semantic review fail closed in production when that review cannot complete.

## Privacy and Cloudflare free capacity

Semantic review receives only the current bounded user message. It does not receive Baseline data, birth inputs, exact location, relationship or system context, prior assistant responses, account identifiers, plan data, credentials, or hidden reasoning.

The classifier uses the existing Cloudflare Workers AI binding through AI Gateway with a small JSON-only request, `skipCache: true`, and `collectLog: false`. Every Workers AI call is wrapped by the existing D1-backed daily neuron reservation, so classification and ordinary generation share the same free-tier capacity protection. No paid classifier, external safety API, Queue, R2 store, Pages project, or additional Worker is introduced.

## Response limits

Safety responses contain no technical Basis, no ordinary interpretive actions, no pricing or plan control, and no invented resource name, phone number, URL, jurisdiction, diagnosis, motive, spiritual cause, or promised outcome.

Until the reviewed jurisdiction-aware catalog in issue #119 is complete, responses may direct the user toward local emergency services, an emergency department, or a trusted person without guessing location or inventing local details.

## Current release boundary

This implementation is the runtime foundation of issue #118. Broad production approval still requires:

- #119 jurisdiction-aware resources and safety-specific interface;
- #120 context firewall and prompt-injection defense;
- #121 privacy-safe decision traceability;
- #122 deterministic and live-model evaluation gates;
- #124 live Cloudflare privacy and free-capacity verification;
- #125 monetization, policy, browser, exact-SHA, and rollback closure.

No deployment should occur until those P0 gates pass for one exact commit SHA.
