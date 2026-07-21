# Sovereign.OS production architecture

## Executive summary

The production architecture is a TypeScript-first monorepo in `defragapp/OPENAPI`, with a Cloudflare Worker as the Sovereign agent and API, a same-origin iOS-optimized PWA as the workspace, D1 as canonical storage, Durable Objects per thread for sequencing and live coordination, and Stripe as the authoritative billing system.

`defragapp/SOVV` remains read-only. It is used only as the intelligence reference and as the source of existing Baseline, current-condition, Horizons, Library, authentication, and related Cloudflare patterns. The new product is assembled entirely in OPENAPI.

The first release is Baseline-first. It must become useful without asking the user to explain an incident. The system begins with the authenticated user's Baseline Design, permitted location and current-sky context, and then allows natural-language exploration across self, people, relationships, and systems.

## Product contract

Sovereign.OS must:

1. Load the authenticated user's computed Baseline.
2. Load permitted current-location and current-sky context.
3. Render a useful Today view without requiring an incident prompt.
4. Let the user explore identity, learning, love, expression, decisions, communication, and pressure response in plain language.
5. Let the user invite or add people privately with explicit consent controls.
6. Let the user compare two consented Baselines in one thread.
7. Explain individual tendencies, pair interaction, role alignment, and system effects.
8. Support families, households, friendships, workplaces, teams, and custom systems.
9. Save and retrieve user-approved understanding in Library.
10. Offer Covenant only as an explicit Christian, biblical lens.

The user-facing agent is always Sovereign. Defrag, Alignment, and Covenant are internal reasoning lenses.

## Voice and language

User-facing language must be sharp, humane, anti-stigma, universal, and easy to understand.

Tone references:

- “Healing isn't optional. Holding pain is.”
- “This is not a label. It is a map.”
- “Today may amplify urgency. That is pressure, not identity.”
- “Different is not wrong. It is friction without translation.”
- “Keep what helps. Leave what doesn't.”

The product must not diagnose, moralize, claim hidden intent, or present spiritual claims as fact. Covenant may use Christian and biblical language only after the user explicitly selects it.

## Repository structure

```text
OPENAPI/
  apps/
    web/
    sovereign-worker/
  packages/
    domain/
    agent-contracts/
    adapter-contracts/
    db/
    ui/
    stripe/
    evals/
  docs/
  scripts/
  .github/workflows/
```

## Runtime responsibilities

### Web app

- Authenticated workspace shell
- Today, Explore, People, Systems, Library, and You surfaces
- streamed Sovereign responses
- structured cards and response widgets
- iOS safe-area handling
- accessible typography and 44px minimum touch targets
- PWA manifest and service worker
- no static external marketing pages in milestone one

### Sovereign Worker

- request authentication
- thread creation and sequencing
- OpenAI Agents SDK orchestration
- typed tool execution
- structured response streaming
- consent enforcement
- Stripe entitlement enforcement
- trace and request correlation
- security headers and rate limiting

### D1

D1 is canonical for accounts, people, Baseline references, current-condition snapshots, relationships, systems, consent grants, threads, events, saved understandings, Library links, Stripe customer references, entitlement projections, and webhook idempotency.

### Durable Objects

Use one Durable Object per thread to serialize concurrent sends, allocate monotonically increasing event numbers, reject duplicate turns, coordinate active streams, and preserve a future path to presence or realtime voice. Durable Objects coordinate; D1 remains canonical.

### SOVV adapters

SOVV remains read-only. OPENAPI talks to narrow adapter contracts instead of importing SOVV internals.

Required adapter surface:

- `getBaselineSummary`
- `getBaselineDimension`
- `getCurrentConditions`
- `compareBaselineToCurrentConditions`
- `searchLibrary`
- `resolveExistingIdentity`
- `resolveExistingEntitlements` during transition only

The model never receives raw birth data, exact private location, credentials, internal framework dumps, or unrelated history.

### Stripe

Stripe is authoritative for billing. Use hosted Checkout, Customer Portal, webhook signature verification, an idempotency ledger, active entitlement projection into D1, and feature checks in Worker routes and agent tools.

## Navigation

### Today

Show enduring Baseline tendency, current amplification, observed behavior only when provided, and unknown actual state. Ask: “Does this match today? Yes / Partly / Not today.”

### Explore

Let the user explore decisions, communication, learning, love, expression, pressure, and identity in natural language. Technical framework detail is expandable.

### People

The owner can invite or add a person, assign a relationship role, review consent scope, select the person in a thread, compare two consented Baselines, and inspect two possible perspectives without declaring either person's exact internal state.

### Systems

A system contains type, members, formal and informal roles, authority, dependence, objective, constraints, current question, and consent scope.

Family reasoning must account for persistence, dependence, history, and shared roles. It must not default to removal or estrangement.

Team reasoning must account for authority, deadlines, responsibility, handoffs, pace, and shared objective.

### Library

Library stores user-approved continuity only. The agent may retrieve prior understanding when relevant, but it must not silently convert every conversation into permanent memory.

### You

The user controls Baseline, location permission, people, consent, systems, privacy, billing, export, deletion, and accessibility.

## Domain model

### Person

Represents the account owner or another person connected through an invitation or owner-entered record.

### Relationship

A directed or mutual edge with type, direction, closeness, duration, household status, authority difference, dependence, contact expectations, notes, and consent scope.

### System

A family, household, team, workplace, friendship group, or custom group with members, roles, edges, objective, constraints, current question, and consent.

### Alignment layers

Every relationship or system response should distinguish individual alignment, interaction alignment, role alignment, and system alignment.

## Agent architecture

Use one OpenAI Agents SDK agent named Sovereign.

The runtime context contains account ID, thread ID, selected context type, selected person/relationship/system reference, current entitlements, consent-filtered tool access, and request trace ID.

The complete private account dataset is never placed in the prompt. Context is retrieved only through typed tools.

### Personal tools

- `get_my_baseline_summary`
- `explore_my_baseline_dimension`
- `get_my_current_conditions`
- `compare_baseline_to_current_conditions`
- `explain_framework_source`
- `save_personal_understanding`

### People tools

- `list_my_people`
- `get_person_relationship`
- `get_consented_baseline_context`
- `compare_two_baselines`
- `explain_two_perspectives`
- `assess_pair_alignment`

### System tools

- `list_my_systems`
- `get_family_system`
- `get_team_system`
- `analyze_role_distribution`
- `analyze_group_interactions`
- `assess_system_alignment`
- `compare_current_conditions_across_members`

### Continuity tools

- `retrieve_prior_understanding`
- `save_understanding`
- `update_relationship_context`
- `record_user_correction`
- `manage_consent`

### Covenant tools

- `retrieve_scripture`
- `apply_biblical_lens`

Covenant tools are unavailable unless the user explicitly opts in for that turn or thread.

## Streaming flow

1. Client submits a message.
2. Worker authenticates the account and resolves entitlements.
3. Worker routes the turn to the thread Durable Object.
4. Durable Object allocates the next sequence and rejects duplicates.
5. Worker runs Sovereign with the thread ID as the trace group.
6. Tool calls retrieve only consented, reduced context.
7. Worker streams structured response events.
8. Final user-visible output and audit events are appended to D1.
9. Trace export is flushed before Worker completion.

## Security model

Treat birth inputs, exact location, Baseline data, relationship data, system membership, spiritual prompts, Stripe references, and agent threads as sensitive.

Separate data into three zones:

1. Raw sensitive input: never sent to the model.
2. Reduced machine context: sent only when a typed tool requires it.
3. User-visible output: inspectable, savable, exportable, and deletable.

Initial consent scopes:

- `pair.compare`
- `system.include`
- `trait.display`
- `framework.display`
- `current_conditions.use`
- `library.link`
- `covenant.include`

Every scope is off by default for invited people, revocable, and visible in the UI.

Required controls include same-origin authenticated APIs, HTTP-only secure sessions or verified bearer identity, CSRF protection for cookie mutations, strict origin validation, rate limits, replay protection, webhook verification, idempotency, prepared D1 statements, Worker secret bindings, privacy-safe logs, and export/deletion.

## Stripe feature model

Stable internal feature keys:

- `baseline.today`
- `baseline.explore`
- `people.compare`
- `systems.family`
- `systems.team`
- `library.continuity`
- `covenant.lens`
- `export.full`

Do not hard-code Stripe product or price IDs in domain logic.

## PWA and iOS requirements

- safe-area-aware header and composer
- minimum 44px touch targets
- readable default text
- scalable typography
- pinch zoom allowed
- keyboard-safe composer
- responsive single-column mobile layout
- manifest and service worker
- optional, contextual install prompt
- offline app shell only
- never cache private API responses in a shared service-worker cache

## Evaluation strategy

Create eval suites for useful Today output without incident input, layer separation, non-diagnosis, uncertainty boundaries, consent enforcement, pair comparison, family persistence, team authority and roles, Covenant opt-in, biblical citation discipline, private-data protection, thread concurrency, entitlement gating, and user correction handling.

## Release gates

The first release is ready only when:

1. Today is useful without incident entry.
2. Baseline exploration works in plain language.
3. Current conditions are labeled as amplification, not certainty.
4. One consented person can be compared safely.
5. One family or team system changes the interpretation.
6. Streaming works on iPhone-sized viewports.
7. Concurrent messages cannot corrupt thread order.
8. Stripe plan changes update access correctly.
9. Consent can be inspected and revoked.
10. Export and deletion work.
11. Health checks, logs, traces, rollback, and migrations are documented.

## Implementation order

### Phase 1: foundation

Monorepo, shared TypeScript configuration, web shell, Worker shell, D1 migration, thread Durable Object, health route, and CI validation.

### Phase 2: personal intelligence

Baseline adapter, current-condition adapter, Today, Explore, personal tools, and streaming.

### Phase 3: relational intelligence

People, consent, relationships, pair overlay, and pair alignment tools.

### Phase 4: system intelligence

Family and team systems, system-aware tools, and role/authority reasoning.

### Phase 5: continuity and billing

Library, Checkout, Customer Portal, webhooks, and entitlements.

### Phase 6: Covenant and hardening

Scripture retrieval, biblical lens, evals, deletion/export, rate limits, observability, and production runbooks.

## Non-negotiable repository rule

No implementation changes are made in `defragapp/SOVV`. Any future requirement to change SOVV must be separately authorized, narrowly scoped, reversible, and independently reviewed.
