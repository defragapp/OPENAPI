# Sovereign.OS intelligence and answer contract

This document defines the canonical Baseline information model, answer contract, Basis validation, relationship and system context, and Covenant behavior.

## Shared explanatory lens

When it applies to the user's question, Sovereign makes one movement visible:

1. the valid or useful capacity beneath a pattern;
2. how that capacity may be expressing;
3. what happens between people or across the system;
4. the supported conditions that may keep the pattern going and what could change.

`sovereign-answer.v2` expresses this without a new schema: `steady` carries capacity; `active_now`, `shadow`, and `gift` carry expression; `interaction` and `system` carry what happens between people; and `responsibility`, `unknowns`, `alignment`, and `experiment` carry continuation and possible change. A narrow factual answer does not force all four parts.

The fourth part is conditional and non-blaming. Contribution is not causation. Feedback is not blame. Understanding a pattern does not make harm mutual. Safety handling overrides completion of the lens when abuse, coercion, immediate danger, or a serious power imbalance is present.

## Four-layer information model

### Layer A — exact source data

`BaselineSourceData` is normalized, typed, versioned, and server-owned. It contains only deterministic or provider-returned values:

- natal body, sign, numeric longitude, display degree, and retrograde state;
- verified aspects and orb;
- partial Human Design personality gate and line activations;
- partial Gene Keys activation numbers;
- numerology values;
- calculation version, uncertainty, provenance, and calculation time;
- exact current positions from the existing NASA/JPL Horizons-backed layer;
- deterministic current-to-natal and consented pair contacts when numeric inputs exist.

Unavailable values are omitted. The contract never substitutes plausible values.

It does not claim uncomputed Human Design type, authority, centers, profile, design-side values, or channels; a complete Gene Keys profile; unsupported Gene Keys expressions, spheres, or sequences; or unavailable houses.

### Layer B — Baseline facet profile

`BaselineFacetProfile` is a validated, versioned, model-generated interpretation derived only from authorized Layer A values.

Supported facet IDs are:

- `core_orientation`;
- `identity_purpose`;
- `communication`;
- `decision_making`;
- `learning`;
- `creativity_expression`;
- `love_connection`;
- `leadership`;
- `boundaries`;
- `responsibility`;
- `conflict_repair`;
- `response_pressure`;
- `response_change`;
- `underused_capacity`;
- `shadow_expression`;
- `gift_expression`;
- `alignment_markers`.

Each facet contains a plain-language title, concise description, specific Shadow expression, specific Gift expression, observable Alignment markers, uncertainty, and exact `basisRefs`.

The server rejects any facet with an unknown Basis reference. A facet profile is interpretive and must never be presented as measured psychological fact.

The cache key includes protected Baseline input hash, source calculation version, facet-contract version, and model version. It changes only when one of those values changes or an explicit refresh is requested.

### Layer C — current overlay

Current conditions remain separate and temporary. The contract returns exact current bodies, sign, degree, retrograde state, deterministic current-to-natal contacts when available, aspect type and orb, calculation and expiry times, uncertainty, and affected facet IDs.

The authenticated web surface requires an explicit six-hour enable action, uses an Earth-geocentric observer with no device-location request, and provides immediate removal. Re-enabling refreshes the expiry; it does not alter the stable Baseline.

Expired data is not live. A body-name lookup alone never establishes pressure, clarity, behavior, emotion, or outcome.

### Layer D — question-specific synthesis

At answer time, Sovereign receives relevant facets, the exact Basis registry, valid current context, user-confirmed facts, authorized relationship or system context, thread continuity, and corrections.

The model selects Basis IDs only. The server validates every ID, attaches exact display values, and rejects invented or unauthorized references before display.

## `sovereign-answer.v2`

```ts
type SovereignAnswerV2 = {
  version: 'sovereign-answer.v2';
  mode: 'baseline' | 'now' | 'shadow_gift' | 'alignment' | 'relationship' | 'system' | 'covenant';
  depth: 'focused' | 'standard' | 'deep';
  headline: string;
  direct_answer: string;
  sections: Array<{
    id: 'steady' | 'active_now' | 'shadow' | 'gift' | 'alignment' | 'you' | 'other' | 'interaction' | 'system' | 'responsibility' | 'unknowns' | 'experiment';
    label: string;
    body: string;
  }>;
  basis_refs: string[];
  correction_prompt: string;
  actions: Array<{
    type: 'explore_facet' | 'examine_alignment' | 'open_person' | 'invite_person' | 'open_system' | 'save_to_library' | 'offer_covenant';
    label: string;
    target_id?: string;
  }>;
  confidence: 'confirmed' | 'supported' | 'exploratory';
  safety_mode: 'standard' | 'grounded' | 'escalate';
};
```

Focused answers serve narrow facts and follow-ups. Standard is the normal Baseline default. Deep is the default for a full interpretation, relationship comparison, or system analysis.

Standard and deep answers provide a direct answer plus two to five relevant sections. A question is asked first only when missing information materially blocks a responsible answer. Exploration does not always become an action plan.

Recurring-pattern answers use the existing section contract to show the useful capacity and its expression. When permitted relationship or system context is relevant, they also show the interaction and supported continuation or change conditions. They never invent another person's contribution, treat an inferred feedback loop as fact, or imply that the user's response caused another person's harmful behavior.

## Basis

Basis is a data-only interface owned by the server registry.

Examples of formatting:

- user confirmation: `U✓`;
- Human Design personality activation: `HD G13.1`;
- deterministically verified channel only: `HD 13–33`;
- Gene Keys activation number: `GK ACT13`;
- numerology life path: `N LP1`;
- natal placement: `☉ CAN 04.2°`;
- verified aspect and orb: `☉ □ ☾ 1.4°`;
- live factor: `LIVE ♄ ARI 02.3°R`;
- consented pair contact: `REL ☿ □ ☿ 1.8°`.

Rules:

- no internal status, withheld text, object key, provider debugging value, JSON, summary, or conclusion;
- no model-authored display value;
- no unsupported channel or completed framework claim;
- no other-person framework value without `framework.display`;
- no raw birth input or exact private location;
- at most five values on desktop;
- at most three values on mobile followed by `+N`;
- accessible labels for glyphs and abbreviations;
- a compact source drawer containing exact value, calculation time, uncertainty, and provenance only.

Basis supports an interpretation. It does not prove personality or current state.

## Alignment

Alignment is rendered from structured answer sections:

- Supports the fit;
- Pulls against it;
- The real tradeoff;
- Still needed;
- A closer version.

The interface uses balanced fields and a central tradeoff. It never derives a score, percentage, gauge, or sentiment result from generated prose.

## Relationship context

The server compares two separate permitted facet profiles and returns:

- the user’s relevant facets;
- the invited person’s permitted facets;
- shared needs and different routes;
- possible interaction pressure;
- each person’s responsibility;
- user-reported observations;
- unconfirmed interpretations;
- missing information;
- authorized exact Basis references.

The renderer keeps the two people in distinct columns and the relationship itself in a full-width field. It never claims motive, exact emotion, private experience, or future behavior.

## System context

System analysis uses consented facets and supplied role, authority, responsibility, care, dependence, constraints, objective, observation, and missing perspective data.

It returns stabilizing and change roles, pressure carriers, formal and informal authority, responsibility concentration, mediation and withdrawal, expectations, change effects, unknown roles, supported relationship edges, and a separate pressure field.

A Baseline-derived role is labeled as a possibility. A formal role or practical responsibility is factual only when supplied or confirmed. Unsupported decorative edges are prohibited.

## Covenant

Covenant may be offered contextually for a relevant personal, relationship, or family dynamic without religious keywords. It stays off until explicit confirmation.

The confirmation explains that Christian teaching and clearly cited Scripture will be added for the question while the grounded Baseline answer remains separate.

The answer separates Biblical parallel, Scripture, teaching, application, and boundary. Passage text comes only from the verified retrieval context supplied by the server.

Covenant never claims God’s exact intent, turns a metaphor into identity, assigns moral status, proves motive or diagnosis, predicts an outcome, or requires forgiveness, reconciliation, contact, submission, estrangement, or continued exposure to harm.

## Persistence and transport

Thread events persist `answer`, server-attached `basis`, context, interface actions, and user corrections. The browser requests `application/vnd.sovereign.answer+json`; plain text remains available for compatible clients.

No obsolete presentation payload, encoded presentation header, or unused presentation persistence field is part of the contract.

## Required validation

Tests must prove:

- exact source omissions and unknown-birth-time limits;
- facet completeness and Basis reference authorization;
- deterministic current and pair contacts;
- expiry enforcement;
- meaningful Baseline value without an incident;
- relationship and system structure;
- exact Basis filtering and accessible truncation;
- structured Alignment without calculated precision;
- contextual, confirmed, retrieved-passage Covenant behavior;
- consent and entitlement enforcement;
- complete answers even when the Basis drawer is never opened.
- recurring-pattern answers connect capacity, expression, applicable interaction, and possible continuation or change without adding causal certainty or blame;
- abuse, coercion, danger, and serious power imbalance cases do not receive mutualizing feedback-loop language.
