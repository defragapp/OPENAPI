# Sovereign.OS — Product Truth & Intelligence Foundation Audit

## Baseline Integration Review Branch

**Repository:** `defragapp/OPENAPI`  
**Audit baseline:** `7da916ee3a1482ebca02c31fb2617d2338e5a0f9`  
**Branch:** `audit/baseline-intelligence-foundation`

## Mission

Before continuing feature development, perform a deep product-alignment audit.

This is not a stabilization pass and not a visual-polish pass.

The purpose is to identify what is missing, disconnected, implied, or underused between:

- the original Sovereign.OS vision;
- the current repository implementation;
- Baseline Design data and deterministic calculations;
- AI prompts, contracts, tools, and response schemas;
- visual intelligence components;
- user-facing flows;
- continuity, consent, billing, and saved understanding;
- repository documentation and agent operating rules.

The central risk is that Sovereign.OS becomes a polished AI interface while underutilizing its actual differentiator: **Baseline Design as the evidence-backed intelligence foundation.**

The audit must answer:

> What does Sovereign.OS know and preserve that a normal AI assistant does not?

The intended answer is:

> Sovereign.OS understands the user through Baseline Design and applies that structured foundation to self-understanding, alignment, relationships, systems, timing, and optional faith-based exploration. It does not merely generate responses. It builds connected understanding over time.

## Completed foundations

Treat these as completed foundations to evaluate, not reasons to begin a redesign:

- production release;
- Visual Intelligence system;
- ArchetypeGlyph visual layer;
- People visualization;
- Systems visualization;
- Library intelligence improvements;
- dynamic contextual actions;
- structured exploration guidance;
- onboarding transition and Baseline-first entry;
- visible plan state.

Do not replace these systems merely because a different implementation is possible.

## Non-negotiable repository truth

The repository already establishes these product rules. Verify that implementation follows them end to end:

- Sovereign.OS is Baseline-first and must be useful before the user explains an incident.
- Sovereign is the single user-facing agent.
- Defrag, Alignment, and Covenant are internal lenses, not separate top-level products.
- Authenticated navigation is Today, Explore, People, Systems, Library, and You.
- Baseline tendency, current amplification, user-supplied or user-confirmed behavior, and unknown actual state must remain distinct.
- AI must not diagnose, infer hidden motives as fact, claim exact emotions, or present framework interpretation as deterministic proof.
- Covenant must be intentional and explicitly enabled.
- Consent and authorization must be enforced in deterministic server code.
- Raw birth inputs, exact private location, secrets, and private identifiers must not be sent to the model.

If code, prompts, documentation, or UI conflicts with these rules, record the conflict explicitly.

---

# Phase 1 — Audit only

Do not immediately rewrite or implement.

First inspect. Then produce evidence. Then recommend. Implementation may begin only after the audit artifacts are complete and the highest-value change is clearly identified.

## Sources to inspect

### Repository implementation

- `apps/web/src/`
- `apps/sovereign-worker/src/`
- `packages/`
- schemas, contracts, prompts, tools, tests, migrations, seed data, and API clients

### Documentation

- `docs/`
- all `README*` files
- `AGENTS.md`
- architecture documents
- release and production specifications
- product and UX specifications
- prompt and response-contract documents

### Historical product context

Review available project discussions, prior specifications, accepted decisions, and rejected directions.

Extract:

- original product intent;
- rejected product directions;
- approved terminology;
- user-experience goals;
- safety and consent constraints;
- capabilities discussed but not yet implemented;
- capabilities implemented but not surfaced;
- claims that should not appear publicly because the repository does not yet support them.

Do not silently convert historical ideas into implemented facts.

---

# Core audit question

## Is Baseline Design actually the intelligence foundation?

Trace the statement below through the complete product stack:

> Everything Sovereign.OS understands begins with the user’s Baseline Design.

Determine whether this is true in:

1. deterministic data creation;
2. persistence and versioning;
3. API retrieval;
4. prompt assembly;
5. tool routing;
6. model response contracts;
7. visual rendering;
8. user correction;
9. Library saving;
10. future-context reuse;
11. relationship comparison;
12. system analysis;
13. plan and entitlement behavior.

A label, marketing sentence, or onboarding card does not prove integration.

For each step, identify the actual source file, function, schema, endpoint, database field, prompt section, UI component, and test that supports the claim.

---

# Required status classification

Classify every audited capability as one of:

## Implemented

The capability exists end to end and is available in the product.

## Partially represented

The capability exists in code or data but is not consistently connected, surfaced, explained, or preserved.

## Missing

The capability is important to product truth but does not exist in a usable end-to-end form.

## Documentation-only

The capability is described but not implemented.

## UI-only

The interface implies intelligence that is not supported by the underlying data or contract.

## Unverified

Evidence was insufficient. State exactly what could not be verified.

Never mark a capability implemented based only on a component name, type name, placeholder copy, mock data, or unused schema.

---

# Baseline Intelligence Audit

## 1. Baseline data inventory

Identify every Baseline datapoint that currently exists.

Investigate at minimum:

- archetypal qualities;
- traits or tendencies;
- strengths;
- tensions;
- underused capacities;
- communication style;
- decision orientation;
- learning style;
- relational needs and tendencies;
- pressure responses;
- responsibility orientation;
- conflict response;
- leadership and contribution style;
- emotional or perceptual orientation;
- shadow expressions;
- protective expressions;
- integrated or light expressions;
- current timing or active emphasis;
- framework source factors;
- confidence, certainty, or missing-data markers;
- user confirmation or correction state;
- version or calculation provenance.

For each datapoint record:

- canonical name;
- source framework;
- deterministic input source;
- calculation or derivation path;
- storage location;
- schema and type;
- API exposure;
- prompt exposure;
- UI exposure;
- Library persistence;
- correction behavior;
- consent requirements;
- whether it is production data, placeholder data, inferred AI prose, or documentation only.

Do not invent missing datapoints to make the model appear complete.

## 2. Baseline model coherence

Determine whether the current model is:

- a stable normalized intelligence object;
- a collection of loosely related prose fields;
- a partial calculation result;
- a UI projection without durable source factors;
- or a mixture of these.

Identify duplicate, conflicting, ambiguous, or untyped fields.

Determine whether the same quality can be reliably referenced across Today, Explore, People, Systems, Library, and You.

## 3. Stable identity versus current amplification

Verify that Baseline and current timing remain separate in data, prompt, response, and UI.

A user must be able to tell:

- what is stable;
- what is more active now;
- what the user explicitly reported;
- what Sovereign is interpreting;
- what remains unknown.

Record every place these layers are merged or presented ambiguously.

---

# Evidence Layer Audit

Baseline insights must not feel like unsupported AI interpretation.

A user should be able to ask:

> Why is Sovereign showing me this?

The product should answer without exposing raw calculations, dense framework jargon, technical astrology charts, prompt internals, or a wall of metadata.

## Evidence sources to support

Audit whether insights can connect to:

- Baseline datapoints;
- deterministic framework factors;
- current timing factors;
- user-provided facts;
- user-confirmed experience;
- saved Library understanding;
- corrections and rejected interpretations;
- relationship comparison;
- system structure and consented member data;
- the selected lens or surface.

## Recommended user-facing evidence pattern

Evaluate a subtle expandable layer such as **Why this appears**.

Example:

**Insight**

> You may naturally take responsibility in group situations.

**Supporting basis**

- Baseline quality: Responsibility orientation
- Relational tendency: Stabilizing role
- User-confirmed experience: Previous exploration
- Current context: Team or family question

This must not become:

- raw natal calculations;
- hidden chain-of-thought;
- unsupported certainty;
- a false citation system;
- or decorative metadata disconnected from the actual response.

## Evidence binding test

For at least five representative insights, trace the evidence end to end:

1. deterministic source;
2. normalized Baseline factor;
3. prompt or tool input;
4. structured response field;
5. UI rendering;
6. correction or save behavior;
7. reuse in a later interaction.

If the chain breaks, identify the exact break.

---

# Intelligence Provenance Audit

Every major insight should distinguish three layers.

## Source

Where the information came from, such as:

- Baseline Design;
- current timing;
- user statement;
- saved understanding;
- relationship comparison;
- system information;
- scripture source when Covenant is enabled.

## Interpretation

What Sovereign is suggesting from those sources.

## Uncertainty

What is incomplete, unknown, permission-limited, unconfirmed, or only a possibility.

Audit whether the response contract has explicit fields for these layers or merely relies on prose discipline.

Identify where provenance is lost during streaming, parsing, fallback, rendering, saving, or later reuse.

---

# AI Behavior and Contract Audit

Determine whether Sovereign currently only answers questions or actually operates from a persistent intelligence foundation.

Audit prompts, tools, schemas, and routing for the ability to:

- understand the user’s Baseline before answering;
- load only permitted context;
- select relevant Baseline datapoints;
- connect current questions to prior understanding;
- distinguish source from interpretation;
- preserve uncertainty;
- present shadow and integrated expressions as expressions of the same quality;
- compare two people without inventing motives;
- analyze a system without reducing it to individual blame;
- generate relevant continuation actions;
- save structured understanding rather than only transcript text;
- honor user corrections in later responses.

## Contract audit

Inspect:

- request schemas;
- tool schemas;
- structured-output schemas;
- streaming event types;
- fallback behavior;
- schema validation;
- model-error behavior;
- retry and duplicate-usage protection;
- token or context reduction;
- response persistence;
- privacy-safe logs.

Report any UI element that implies structured intelligence while the backend still returns unstructured prose.

## Model-provider boundary

Audit OpenAI integration only as it affects product truth:

- model and API path used;
- structured-output enforcement;
- prompt assembly;
- tool invocation;
- context selection;
- privacy boundaries;
- retry behavior;
- observability;
- cost or usage controls.

Do not change provider credentials, projects, keys, or production model configuration during the audit.

---

# User Experience Audit

Review every major authenticated surface.

## Today

Does it clearly answer:

- Who am I?
- What remains stable?
- What is emphasized now?
- Why is this being shown?
- What can I explore next?

## Explore

Can a user discover and investigate:

- Baseline qualities;
- shadow and integrated expressions;
- alignment;
- decisions;
- behavior;
- relationships;
- system roles;
- optional Covenant exploration?

Does the user need specialized prompting, or does the interface reveal available intelligence?

## People

Does comparison use actual Baseline factors in a meaningful, consent-aware way?

Can the interface distinguish:

- self perspective;
- another possible perspective;
- shared relationship dynamic;
- confirmed facts;
- permitted Baseline interpretation;
- unknown private state?

## Systems

Does the system view use multiple Baselines, actual membership, roles, authority, responsibility, caregiving, dependence, and constraints?

Or is it primarily a visual graph with generic AI prose?

## Library

Does saving preserve:

- the insight;
- supporting Baseline factors;
- people or system involved;
- timing context;
- provenance;
- uncertainty;
- correction history;
- framework or lens;
- future retrieval value?

## You

Does the user understand that they own and control their Baseline?

Can they see:

- Baseline readiness;
- certainty and missing inputs;
- privacy boundaries;
- people and consent;
- current-timing permissions;
- Covenant state;
- plan and entitlement state;
- export and deletion controls?

---

# Relationship and System Intelligence Audit

## Relationship comparison

Verify whether People uses actual normalized comparison inputs rather than asking the model to infer a relationship from names and prose.

Audit:

- consent scopes;
- source person IDs;
- shared and private fields;
- comparison factors;
- current timing permissions;
- perspective language;
- uncertainty handling;
- revocation behavior;
- saved relationship understanding.

## System intelligence

Verify whether Systems represents the whole system rather than only a collection of pair comparisons.

Audit support for:

- system type;
- membership;
- roles;
- authority;
- responsibility;
- caregiving;
- dependence;
- shared objectives;
- user-described dynamics;
- Baseline-derived possibilities;
- missing permission;
- system-level pressure or change.

Identify any feature that visually suggests system intelligence without a corresponding data and contract layer.

---

# Library and Continuity Audit

Determine whether Sovereign.OS builds understanding over time.

Trace:

`Baseline data → interpretation → visual intelligence → user exploration → correction → saved understanding → future context`

Audit whether the Library stores structured objects or only rendered answer text.

Determine whether a later answer can reliably use a saved understanding while preserving:

- original source;
- user correction;
- uncertainty;
- people and system consent;
- timing relevance;
- deletion and revocation.

Identify where continuity is currently aspirational rather than functional.

---

# Billing and Entitlement Boundary Audit

Billing is not the product differentiator, but entitlement errors can break the intelligence experience.

Audit without mutating Stripe:

- Free versus Sovereign+ capability gates;
- frontend plan display versus server authority;
- usage limits;
- upgrade and downgrade behavior;
- webhook-derived entitlement state;
- retry and idempotency;
- whether an insight or saved object becomes inaccessible after plan changes;
- whether the UI promises capabilities the current plan cannot use;
- whether model usage can occur before deterministic entitlement checks.

Do not create, change, archive, or delete Stripe products, prices, subscriptions, customers, or webhooks during this audit.

---

# Documentation Audit

Identify missing or conflicting explanations for:

- what Baseline Design is;
- what source frameworks contribute;
- which calculations are deterministic;
- how AI uses normalized Baseline data;
- stable Baseline versus current timing;
- shadow, protective, and integrated expressions;
- alignment;
- relationships;
- systems;
- evidence and provenance;
- user correction;
- continuity and Library behavior;
- consent and privacy;
- Covenant boundaries;
- plan and entitlement behavior.

Strengthen future documentation recommendations so another AI agent can understand:

- product philosophy;
- canonical architecture;
- approved terminology;
- user-experience goals;
- safety constraints;
- evidence requirements;
- implementation boundaries;
- what must not be rebuilt.

---

# Required deliverables

Create the following audit artifacts before proposing implementation.

## 1. `docs/audits/SOVEREIGN_INTELLIGENCE_GAP_REPORT.md`

Include:

- executive answer to the core question;
- current strengths;
- missing intelligence layers;
- missing or disconnected Baseline datapoints;
- evidence and provenance gaps;
- AI contract gaps;
- UI and user-flow gaps;
- relationship and system gaps;
- Library and continuity gaps;
- documentation gaps;
- billing or entitlement boundary risks;
- unsupported public claims;
- representative code references.

## 2. `docs/audits/BASELINE_INTELLIGENCE_MAP.md`

Map the actual implementation:

```text
Deterministic inputs
      ↓
Baseline calculation
      ↓
Normalized Baseline data
      ↓
Persistence and versioning
      ↓
Context selection and consent
      ↓
Interpretation contract
      ↓
Visual Intelligence
      ↓
User exploration and correction
      ↓
Saved understanding
      ↓
Future context
```

Mark every missing or weak connection.

## 3. `docs/audits/BASELINE_DATAPOINT_INVENTORY.md`

Provide a table with:

- datapoint;
- meaning;
- source framework;
- deterministic source;
- schema path;
- storage path;
- API path;
- prompt path;
- response field;
- UI surface;
- correction state;
- status classification;
- evidence reference.

## 4. `docs/audits/INTELLIGENCE_PROVENANCE_MATRIX.md`

For representative insights, show:

- source evidence;
- interpretation;
- uncertainty;
- contract field;
- UI renderer;
- saved representation;
- later reuse;
- failure mode.

## 5. `docs/audits/PRODUCT_TRUTH_CLAIM_MATRIX.md`

Map each major product claim to:

- implemented;
- partially represented;
- missing;
- documentation-only;
- UI-only;
- unverified.

Include exact repository evidence.

## 6. `docs/audits/INTELLIGENCE_IMPLEMENTATION_ROADMAP.md`

Prioritize recommendations by:

- user understanding;
- perceived intelligence;
- trust and evidence;
- product differentiation;
- architecture preservation;
- implementation risk;
- testability;
- dependency order.

For every recommendation include:

- problem;
- why it matters;
- smallest appropriate surface;
- required contract or data changes;
- verification plan;
- risk;
- whether product approval is required.

---

# Implementation gate

Do not implement product changes until all required audit artifacts exist.

After the audit, select only the highest-value, lowest-risk improvement.

Any implementation must:

1. explain the verified problem;
2. explain why it matters to product truth;
3. identify the missing data or contract connection;
4. modify the smallest appropriate surface;
5. add or update tests;
6. run required repository verification;
7. inspect the diff;
8. scan for secrets;
9. commit with a focused message;
10. push to this branch;
11. update the audit report with what changed and what remains.

Do not perform a broad rewrite.

Do not redesign completed visual systems before proving that the intelligence substrate requires it.

Do not merge or deploy from this branch without explicit approval.

---

# Verification requirements

At minimum, run the repository-required checks before implementation commits:

- `pnpm install`
- `pnpm verify:foundation`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Add targeted tests for any implemented intelligence connection, including as applicable:

- Baseline versus current timing distinction;
- provenance rendering;
- missing Baseline data;
- unknown birth time;
- location permission denial;
- user correction persistence;
- consent denial and revocation;
- pair comparison;
- system membership;
- structured-output validation;
- fallback behavior;
- Library save and retrieval;
- plan entitlement enforcement;
- non-diagnostic language;
- motive uncertainty;
- Covenant disabled by default.

---

# Success criteria

The audit succeeds when Sovereign.OS can clearly and demonstrably answer:

> What does this platform know that a normal AI assistant does not?

The answer must be supported by repository evidence:

- It understands the user through a normalized, deterministic Baseline Design.
- It applies that foundation across self, alignment, relationships, and systems.
- It distinguishes stable design, current emphasis, user-provided facts, interpretation, and unknowns.
- It can show a concise supporting basis for meaningful insights.
- It preserves corrections and saved understanding for future context.
- It uses consented multi-person data without claiming access to private thoughts.
- It does not merely generate responses. It builds understanding.

The likely highest-value discovery area is not more features.

It is making hidden Baseline datapoints, provenance, and continuity visible enough to create trust—without overwhelming the user or exposing unnecessary technical complexity.
