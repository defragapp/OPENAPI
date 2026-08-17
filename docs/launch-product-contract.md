# Sovereign.OS launch product contract

Status: canonical implementation and approval boundary.

This document governs what is included in the current launch. User-facing wording inherits `product-language-system.md`; intelligence and Basis behavior inherit `inner-recognition-intelligence.md`; privacy and release execution inherit their named current contracts.

## Product boundary

Sovereign.OS is a Baseline-first AI platform for self, relationship, and system intelligence. The launch candidate must provide useful personal exploration before an incident is explained and real permission-bound multi-user behavior.

The platform uses one explanatory movement across applicable surfaces:

1. the useful capacity beneath a pattern;
2. how that capacity may be expressing;
3. what happens between people or across the system;
4. what may keep the pattern going and what could change it.

This movement is implemented through the existing Baseline, answer, People, Systems, Library, Expression Field, and supporting contracts. It is not another top-level product, score, diagnosis, or claim of interpersonal causation.

The current launch includes:

- private Baseline creation with unknown birth time supported;
- versioned structured Baseline facets;
- exact, expiring current-condition context;
- adaptive `sovereign-answer.v2` text answers;
- exact server-approved Basis rendering;
- invited-person identity and scope-specific consent;
- two-person comparison from separate permitted structured Baselines;
- family, household, friendship, workplace, team, and custom Systems;
- immediate future-use revocation enforcement;
- contextual, confirmed Covenant exploration;
- intentional Library continuity;
- Free and Sovereign+ server-side entitlement enforcement;
- founder-approved voluntary support links separated from subscription access;
- authenticated on-demand private account export with no retained export artifact;
- one canonical text-first authenticated workspace.

**Worlds video generation is not part of the current launch.** No video renderer, provider spend, generated media, or video CTA is required for product completion. Any future spatial/Worlds capability requires a separate product decision and activation review. Existing fail-closed video code may remain dormant but must not be mounted as a core authenticated dependency.

## Text-first interaction contract

The canonical authenticated experience is `SovereignIntelligenceWorkspace`.

The normal loop is:

`user question → direct answer → relevant structured sections → quiet Basis/provenance → correction or continuation`

The public landing demo chats may teach the same hierarchy. The authenticated product must use real account state, real Baseline context, real entitlements/permissions, and the real Worker inference path; it must never substitute canned/random demo behavior.

Reasoning progression may be made visible as restrained text workflow state when useful. The product does not require video or media generation to explain how Sovereign reached an answer.

## Public answer categories

Every answer preserves the difference between:

1. a stable Baseline facet;
2. a temporary current condition;
3. a user-confirmed observation;
4. supplied role, authority, responsibility, dependence, caregiving, or material context;
5. an unconfirmed interpretation;
6. the unknown actual state.

The main answer uses plain language. Exact source values appear only in Basis.

Recurring-pattern answers may connect the relevant stable quality, possible expression, permitted interaction/system context, and supported continuation/change conditions. Contribution is not causation, feedback is not blame, and harm must never be reframed as mutual merely because more than one person is present.

## Baseline accuracy

The exact source contract may include natal body/sign/longitude/display degree/retrograde state, verified aspects/orb, partial Human Design personality gate/line activations, partial Gene Keys activation numbers, numerology, computation version, uncertainty, provenance, exact current positions, and deterministic current/pair contacts when numeric inputs exist.

Unavailable values are omitted, not guessed. The product does not claim uncomputed Human Design type, authority, centers, profile, design-side values, or channels; a complete Gene Keys profile; unsupported Gene Keys expressions/sequences; or unavailable houses.

The Baseline facet profile is versioned, validated, interpretive, tied to exact Basis references, and cached by protected input hash plus calculation/facet/model versions.

## Expression Field

The Expression Field is a deterministic authenticated representation of relative expression emphasis derived from permitted Baseline facets. It is a structural visual instrument, not emotion detection, diagnosis, compatibility scoring, calibrated psychological measurement, or an AI-authored verdict.

Public/inline structural visuals must remain downstream of authorized data and must not expose raw birth details, exact private location, account identity, private conversation content, or unconsented other-person data.

The current launch does not require a World/video renderer downstream of the Expression Field.

## Relationship and system consent

A workspace owner may request access, cancel an invitation, remove a person from their workspace, or stop using shared context. A workspace owner may never grant consent on behalf of another person.

The server rechecks identity, entitlement, and required scope on every shared use. Revocation blocks future use immediately.

Another person’s exact framework values remain absent without `framework.display`. A one-sided owner entry never exposes that person’s private Baseline.

System analysis uses supported roles, authority, responsibility, care, reliance, constraints, objectives, observations, and missing perspectives. Graph edges appear only when a relationship is supplied or confirmed.

## Covenant

Covenant is a contextual capability, not a top-level application. A grounded answer remains complete without it.

For relevant questions Sovereign may offer `Explore through Christian Scripture`. Covenant remains off until the user explicitly confirms it for that question/thread.

Covenant separates Biblical parallel, Scripture, Teaching, Application, and Boundary. Passage text comes only from verified retrieved/curated server context.

It must never claim divine certainty, assign an absent person moral status, prove motive/diagnosis, or require forgiveness, reconciliation, contact, submission, estrangement, or continued exposure to harm.

## Free access, billing, and voluntary support

Free is permanent, not a trial or Stripe subscription.

- Free: $0, 10 Sovereign AI turns per UTC month.
- Sovereign+: $20 monthly or $99 annually, 300 turns per UTC month.
- People, Systems, Library continuity, Covenant, and consent-aware shared intelligence remain server-enforced Sovereign+ capabilities under the current product contract.

Stripe Checkout, Portal, signed webhooks, products/prices, and server entitlement projection remain authoritative. Payment failure, cancellation, or expiration returns the account safely to Free without deleting the workspace.

Founder-approved support products use Stripe-hosted one-time custom-amount links and remain voluntary, entitlement-neutral contributions. They do not purchase access, subscription benefits, ownership, influence, tax-deductible status, or promised features.

No video-generation turn cost is part of the current launch because video generation is disabled/not launched.

## Policy, privacy, retention, and account control

Current schema is `0017_privacy_access_and_eligibility`.

Signup requires the exact current Terms/Privacy tuple and separate 18+ launch-eligibility confirmation. Material policy changes may pause normal private workspace/API use until re-review while bounded account rights remain available.

Retention boundaries:

- unsaved thread content and complete AI answers: scheduled deletion after 30 days;
- minimal operational/security metadata without conversation content: up to 90 days under the current policy;
- Library understandings: until user deletion/account closure;
- sessions/recovery records: purpose-specific expiry;
- billing records: bounded to subscription operation, accounting, fraud prevention, and applicable law;
- policy receipts: retained as bounded audit evidence as documented by the privacy model.

Private export is generated on demand for the authenticated account from D1, returned directly with private/no-store behavior, and not stored in R2 or as an export artifact.

Raw birth inputs, exact private locations, credentials, unrelated account history, and hidden reasoning never enter operational logs or model context by design.

Account deletion retains the 14-day grace period and Stripe-first cancellation requirement.

## Release authority

Current executable authority is inherited from `docs/production-release.md`.

For the current text-first launch:

```bash
pnpm verify:cloudflare-build
pnpm production:release:text
```

Both commands must apply to the same exact current `origin/main` SHA. The release path performs one Worker deployment and excludes live Browser Rendering.

`pnpm production:release:oauth` remains an optional Browser-audited path only when explicitly requested.

Production release requires:

- foundation/type/unit/build/smoke/secret/removal gates passing;
- successful idempotent D1 migration replay through `0017_privacy_access_and_eligibility`;
- exact-SHA `/health` and `/ready` convergence on both branded hosts;
- policy acceptance receipts and privacy access controls configured;
- private export reported as on-demand/no-artifact;
- exact matching D1 release evidence with truthful route/rendered verification booleans;
- default-deny private API/page boundaries;
- server-enforced Free/Sovereign+ entitlements;
- real permission/revocation behavior;
- real authenticated Account → policy/Plan → Baseline → Workspace → first AI response acceptance;
- human desktop/iPhone visual/interaction review;
- reviewed privacy/retention behavior;
- no private inputs, secrets, unconsented context, or hidden reasoning in traces/logs;
- explicit final acceptance through the #207/#210–#216 task graph.

A Browser Rendering result is optional evidence. Human review and automated Browser Rendering are separate evidence classes and must never be substituted for one another.
