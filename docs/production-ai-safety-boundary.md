# Sovereign.OS production AI safety boundary

Sovereign.OS is a non-clinical personal, relationship, and system intelligence product. It does not diagnose, provide therapy, determine another person's motives, verify unseen causes, or replace emergency and professional services.

## One server-owned authority

Safety decisions remain inside the canonical `sovv-web` Cloudflare Worker. There is no second safety service, alternate model provider, emergency dashboard, Queue, R2 store, Pages project, or parallel application.

The private authority contract is `safety-decision.v1`. The public safety response contract is `sovereign-safety.v1`. Ordinary reflective intelligence continues to use `sovereign-answer.v2`.

The safety boundary supports six dispositions:

- `standard`: continue through the ordinary consent-aware Baseline and `sovereign-answer.v2` flow;
- `grounded`: keep observable facts, possible interpretations, symbolic meaning, and unknown causes distinct;
- `supportive_resources`: pause ordinary interpretation and prioritize a grounded human point of contact;
- `urgent`: interrupt ordinary interpretation when serious risk, abuse, coercion, exploitation, or possible near-term harm may be present;
- `emergency`: prioritize immediate human and emergency support for immediate or already-occurring danger;
- `secure_refusal`: protect system prompts, credentials, private identifiers, internal security controls, consent, authorization, and entitlement boundaries.

The primary conversational model cannot set or lower these dispositions. Model-authored `safety_mode` is overwritten by the Worker before display.

## Layered decision path

For each accepted message, the Worker:

1. validates authentication, same-origin, idempotency, and the bounded user message;
2. records the user turn in the owned thread;
3. applies high-recall deterministic rules for explicit risk and protected-internal requests;
4. when required, runs a separate bounded semantic classifier over the current user message only;
5. derives the final disposition through server policy rather than trusting the classifier's requested disposition;
6. completes supportive, urgent, emergency, or secure-refusal responses before entitlements, private relationship/system context, ordinary generation, or monthly-turn reservation;
7. authorizes permitted context and reserves a monthly AI turn only for ordinary interpretation;
8. validates the answer contract, authorized mode, Basis IDs, Covenant grounding, output language, and server-owned safety state before returning it.

Explicit high-risk deterministic responses remain available when Workers AI capacity is unavailable and do not consume a monthly AI turn. Messages requiring semantic review fail closed in production when that review cannot complete; development and test fixtures may use the deterministic result.

## Semantic review privacy and free-tier capacity

Semantic review receives only the current bounded user message. It does not receive:

- Baseline facets or source data;
- birth inputs or exact location;
- relationship or system context;
- prior assistant responses;
- account identifiers;
- plan or entitlement data;
- prompts, credentials, or hidden reasoning.

The classifier uses the existing Cloudflare Workers AI binding through AI Gateway with a small JSON-only request, `skipCache: true`, and `collectLog: false`. Every Workers AI call is wrapped by the existing D1-backed daily neuron reservation, so the classifier and ordinary generation share the same free-tier capacity protection. No paid classifier, external safety API, or additional storage service is introduced.

## Safety response limits

Safety responses contain:

- no technical Basis;
- no Baseline, relationship, system, Covenant, or symbolic interpretation when ordinary interpretation is suppressed;
- no Library, pricing, plan, invitation, save, or continuation actions;
- no invented phone number, organization, URL, jurisdiction, diagnosis, motive, spiritual cause, or promised outcome.

Until the reviewed jurisdiction-aware catalog in issue #119 is complete, the response may direct the user toward local emergency services, an emergency department, or a trusted person without guessing the user's location or inventing local details.

## Interface behavior

The authenticated interface recognizes emergency, urgent, supportive, grounded, and secure-refusal responses as distinct states. Safety states:

- hide ordinary answer actions and Basis evidence;
- replace the ordinary answer label with a clear safety label;
- use alert semantics for emergency and urgent responses;
- use stable, motion-limited presentation;
- preserve presentation for already-persisted responses from the preceding safety contract.

A full jurisdiction-aware resource interface remains part of issue #119 and is not claimed complete by this boundary.

## Context and authorization boundary

Authorization, consent, entitlements, and Basis allowlisting remain deterministic and server-side. High-risk responses are routed before relationship or system context authorization. Ordinary model context remains limited by the existing model-safe projection.

The stronger trust-class context firewall, validated continuity summary, and indirect prompt-injection protections described in issue #120 remain a separate required P0 implementation. This document does not claim that work is complete.

## Traceability and retention

The existing owned thread event stream records the user event, public answer, Basis values returned, interface actions, and public safety response when used. It does not store hidden reasoning or classifier explanations.

The versioned privacy-safe AI decision record, retention cleanup, and incident reconstruction described in issue #121 remain required before broad production approval.

## Current release boundary

This implementation completes the runtime foundation of issue #118 when its unit, type, build, and Cloudflare verification gates pass. It does not by itself complete the full public-safety release.

Broad production approval still requires:

- issue #119: reviewed jurisdiction-aware resources and complete safety-specific interface;
- issue #120: context firewall and prompt-injection defense;
- issue #121: privacy-safe decision traceability;
- issue #122: locked deterministic and live-model evaluation thresholds;
- issue #124: live Cloudflare privacy and free-capacity verification;
- issue #125: monetization, policy, browser, exact-SHA, and rollback closure.

No deployment should occur until those P0 gates are complete for one exact commit SHA.
