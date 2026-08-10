# Sovereign.OS launch product contract

Status: canonical implementation and approval boundary.

## Product boundary

Sovereign.OS is a Baseline-first AI platform for self, relationship, and system intelligence. The launch candidate must provide useful personal exploration without an incident and real permission-bound multi-user behavior.

The approval candidate includes:

- private Baseline creation with unknown birth time supported;
- versioned structured Baseline facets;
- exact, expiring current-condition context;
- adaptive `sovereign-answer.v2` answers;
- exact server-approved Basis rendering;
- invited-person identity and scope-specific consent;
- two-person comparison from separate structured Baselines;
- family, household, friendship, workplace, team, and custom systems;
- immediate revocation enforcement;
- contextual, confirmed Covenant exploration;
- intentional Library continuity;
- Free and Sovereign+ server-side entitlement enforcement;
- founder-approved voluntary support links that remain separate from subscription access;
- optional self-only Worlds visualization derived from the authenticated Expression Field, enabled only after its Cloudflare spend and privacy activation checks pass.

Worlds remains an immersive mode inside Sovereign.OS. It is not a separate product, primary navigation category, social surface, or general-purpose AI video generator.

## Public answer categories

Every answer preserves the difference between:

1. a stable Baseline facet;
2. a temporary current condition;
3. a user-confirmed observation;
4. supplied role, authority, responsibility, dependence, caregiving, or material context;
5. an unconfirmed interpretation;
6. the unknown actual state.

The main answer uses plain language. Exact source values appear only in Basis.

## Baseline accuracy

The exact source contract may include natal body, sign, numeric longitude, display degree, retrograde state, verified aspects and orb, partial Human Design personality gate and line activations, partial Gene Keys activation numbers, numerology, computation version, uncertainty, provenance, exact current positions, and deterministic current or pair contacts.

Unavailable values are omitted, not guessed. The product does not claim uncomputed Human Design type, authority, centers, profile, design-side values, or channels; a complete Gene Keys profile; unsupported Gene Keys expressions or sequences; or unavailable houses.

The Baseline facet profile is versioned, validated, interpretive, and tied to exact Basis references. It is cached by protected input hash, calculation version, facet-contract version, and model version.

## Expression Field and Worlds

The Expression Field is a deterministic, authenticated representation of relative expression salience derived from permitted Baseline facets. It is not emotion detection, diagnosis, compatibility scoring, or an AI-authored artwork layer.

The Worlds chain is:

> Exact Baseline source → Baseline facets → Expression Field → World

Temporary current context may modulate the Expression Field before rendering; it does not change identity. The World renderer receives only coarse server-derived world-physics buckets. It never receives raw birth details, exact private location, account identity, Basis values, conversation content, or another person’s data.

Worlds is self-only at launch. Any future Relationship or System World requires a separate consent-and-revocation contract before multi-person data can reach a renderer.

## Relationship and system consent

A workspace owner may request access, cancel an invitation, remove a person from their workspace, or stop using shared context. A workspace owner may never grant consent on behalf of another person.

The server rechecks identity, entitlement, and the required scope on every shared use. Revocation blocks future use immediately.

Another person’s exact framework values remain absent without `framework.display`. A one-sided owner entry never exposes that person’s private Baseline.

System analysis uses supported roles, authority, responsibility, care, reliance, constraints, objectives, observations, and missing perspectives. Graph edges appear only when a relationship is supplied or confirmed.

## Covenant

Covenant is a primary capability and a contextual action, not a top-level application. A grounded answer remains complete without it.

The action may appear for relevant family roles, favoritism, rivalry, blame, betrayal, exile and return, forgiveness and reconciliation, boundaries and accountability, caregiving, pride and humility, truth and compassion, generational influence, peacekeeping, or a person carrying a role for the whole family. Religious keywords are not required for the offer.

Covenant remains off until the user explicitly confirms it for the question. It uses only verified retrieved or curated passages and separates Biblical parallel, Scripture, teaching, application, and boundary.

It must never claim divine certainty, assign an absent person moral status, or require forgiveness, reconciliation, contact, submission, estrangement, or continued exposure to harm.

## Free access, billing, and voluntary support

Free is permanent, not a trial or Stripe subscription.

- Free: $0, 10 Sovereign AI turns per UTC month.
- Sovereign+: $20 monthly or $99 annually, 300 turns per UTC month.
- People, Systems, Library, Covenant, and consent-aware shared use remain Sovereign+ capabilities.
- When Worlds video is enabled, private World generation is Sovereign+ only and consumes the explicit AI-turn cost displayed before generation. The initial server default is 25 turns per generated World.

Stripe Checkout, Portal, products, prices, lookup keys, and server entitlement enforcement remain authoritative. Payment failure, cancellation, or expiration returns the account safely to Free without deleting the workspace.

The two founder-approved support products are public on the How it works and Questions surfaces. They use Stripe-hosted one-time custom-amount Payment Links and remain voluntary, entitlement-neutral contributions. They do not purchase access, subscription benefits, ownership, influence, tax-deductible status, or a promise of future features. Support payments must never enter the Sovereign+ entitlement projection path.

Cloudflare AI Gateway Unified Billing for optional Worlds video is infrastructure spend, not a user subscription or support payment. It must be protected by Cloudflare spend limits before the Worlds feature flag is enabled.

## Retention and account control

- Unsaved thread content and complete answers: 30 days.
- Minimal operational and security metadata without conversation content: 90 days.
- Explicitly saved Library items: until the user deletes them or closes the account.
- Sessions and account access links: purpose-specific expiry.
- Billing records: only as needed for subscription operation, accounting, fraud prevention, and law.
- Generated World videos: not stored by Sovereign.OS at launch; the authenticated Worker proxies the generated media to the browser with private no-store headers.

Raw birth inputs, exact private locations, credentials, unrelated account history, and hidden reasoning never enter operational logs or model context. Worlds additionally excludes Basis values, conversations, identity, and arbitrary user renderer prompts from its provider request.

Account deletion retains the existing 14-day grace period and Stripe-first cancellation requirement.

## Release authority

Cloudflare Workers Builds connected to `defragapp/OPENAPI` is the only production release authority. GitHub Actions, ad-hoc local production deploys, a second Worker, R2, Queue, direct provider SDKs or provider API keys, and alternate deployment paths are not part of this contract.

Cloudflare-supported third-party models may be called only through the existing Cloudflare `AI` binding and AI Gateway under Cloudflare Unified Billing when a product capability explicitly requires that modality. This does not authorize a second AI integration path or provider credential in Sovereign.OS code.

Production deployment requires one exact commit with:

- foundation, type, unit, build, smoke, secret, and removal gates passing;
- successful idempotent D1 migration replay;
- desktop and mobile route review;
- real invitation, grant, comparison, system, revocation, and blocked-after-revocation flows;
- exact Basis authorization rejection tests;
- Covenant-offer, explicit-confirmation, verified-passage, and entitlement tests;
- Free and Sovereign+ pricing and entitlement verification;
- active public support links with entitlement-neutral metadata and copy;
- reviewed privacy and retention behavior;
- no private inputs, secrets, unconsented context, or hidden reasoning in traces;
- default-deny `/api/v1/*` authentication with an explicit public ingress allowlist;
- authenticated Worker gating for `/app`, `/app/*`, `/onboarding`, and `/consent.html` before private documents are served;
- Worlds remaining hidden unless its feature flag is on and its Cloudflare Unified Billing credits and spend-limit checks have been completed;
- explicit approval.
