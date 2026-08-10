# Sovereign.OS Worlds — private video contract

Status: launch implementation and activation boundary.

## Product role

Worlds is an immersive visualization mode inside the authenticated Sovereign.OS workspace. It is not a separate product, top-level navigation category, pricing architecture, dashboard, social feed, or general-purpose AI video generator.

The intended loop is:

> Ask → Understand → Enter → Notice → Return → Understand further

Self begins with one World. Relationship and System Worlds remain future permission-bound extensions and must preserve distinct people rather than collapse them into one generated identity.

## Semantic authority

The production chain is:

> Exact Baseline source → Baseline facets → Expression Field → World

Temporary current context may modulate the Expression Field before rendering. It changes temporary conditions only; it does not redefine the Baseline or assert a user’s emotional state.

Every World behavior must remain traceable back through the Expression Field to permitted Baseline facets and server-approved Basis. The video provider is never an interpretive authority.

## Renderer boundary

The renderer receives only a server-generated prompt containing coarse World-physics buckets derived from these Expression Field axes:

- clarity → visibility;
- urgency → tempo;
- responsibility → structural weight;
- boundaries → thresholds;
- trust → traversability;
- repair → reconnection;
- steadiness → stability.

Each value is reduced to `quiet`, `moderate`, or `strong` before provider inference.

The provider never receives:

- birth date, birth time, birthplace, latitude, longitude, timezone, natal coordinates, house cusps, exact planet degrees, or raw JPL output;
- account ID, email, name, session token, or other direct identity;
- Basis registry values or framework labels;
- conversation text, Library content, relationship descriptions, or user-written renderer prompts;
- another person’s Baseline or shared-system data.

World generation is self-only at launch.

## Visual grammar

The renderer prompt is fixed by Sovereign.OS and intentionally narrow:

- near-black, monochrome, immersive environment;
- an irregular opening or revealed view from darkness, not a literal fantasy or spiritual portal;
- restrained real-world materiality and atmospheric depth;
- no people, faces, bodies, text, astrology, planets, stars, spiritual or religious imagery, glowing rings, sci-fi HUDs, cards, dashboards, or AI-art decoration;
- World-physics values affect only light, distance, enclosure, path openness, material density, and camera pace;
- stable centered camera, subtle motion, no dramatic cuts.

This visual grammar is subordinate to the authenticated product and Expression Field contracts.

## Cloudflare execution path

World generation uses the existing Cloudflare `AI` binding and the existing AI Gateway ID. The launch implementation supports `runwayml/gen-4.5` through Cloudflare AI Gateway Unified Billing.

Sovereign.OS does not add a provider SDK, direct provider API key, second Worker, R2, Queue, or alternate deployment path for Worlds.

The inference request uses:

- `env.AI.run(...)`;
- the existing AI Gateway;
- cache bypass;
- `collectLog: false` so the render prompt and provider response are not retained as AI Gateway payload logs by this request path;
- non-identifying product metadata only.

Cloudflare Zero Data Retention is not assumed for the Runway video path. Provider-side processing and retention remain governed by the applicable Cloudflare and third-party service terms; any provider change requires a fresh privacy review before activation.

The model response URL is validated server-side. Sovereign fetches the generated video and streams it through the authenticated Worker with `private, no-store`. The provider URL is not exposed to the browser. Sovereign does not persist the generated video.

## Entitlement and cost boundary

World generation is Sovereign+ only. The initial release reserves 25 of the account’s existing monthly Sovereign AI turns per generated World, configurable by `WORLDS_VIDEO_TURN_COST` within a bounded range.

Reservation is atomic in D1. If the model request throws before a provider result is returned, the reserved allowance is restored. After a provider result is returned, allowance is not automatically restored for downstream media-delivery errors because provider inference may already have incurred cost.

Cloudflare AI Gateway spend limits are an additional account-level production requirement; application allowance is not a substitute for infrastructure spend protection.

## Activation boundary

The code ships fail-closed. `WORLDS_VIDEO_ENABLED` must equal `true` before the authenticated launcher is exposed.

Do not enable the flag until all of these external account checks are complete:

1. Cloudflare AI Gateway Unified Billing has sufficient prepaid credits.
2. A gateway spend limit is configured for the Worlds video model and an overall account-safe ceiling.
3. The production AI Gateway is the same gateway bound to the Worker.
4. A real authenticated Sovereign+ generation succeeds without a provider credential in application code.
5. The response is proxied through Sovereign and the browser receives no provider URL.
6. The privacy page has been reviewed with the optional Worlds disclosure.

The feature flag is intentionally not part of `/ready`; failure or deliberate disablement of optional video generation must not make the core Sovereign.OS workspace unavailable.

## Privacy and safety assertions

Worlds is illustrative, not authoritative. It does not detect emotion, diagnose, predict behavior, infer motive, or claim that a generated scene is a literal representation of the user.

The launch implementation remains self-only. Relationship and System Worlds require separate server contracts for scope-specific consent, revocation, and per-person data minimization before any multi-person rendering is permitted.

## Release verification

A production release containing Worlds must fail its repository checks if any of the following regressions occur:

- a v1 API can bypass the default-deny auth boundary without being explicitly allowlisted;
- `/app`, `/app/*`, or `/onboarding` can be served on `app.defrag.app` without a valid session;
- Worlds accepts arbitrary user renderer prompts;
- raw Baseline/current-location data is imported into the World provider path;
- provider API keys or direct provider endpoints appear in application code;
- AI Gateway payload logging is enabled for the World inference request;
- generated media is stored or externally exposed by URL;
- World generation is exposed to Free accounts or while `WORLDS_VIDEO_ENABLED` is not true;
- the document CSP allows arbitrary remote media instead of same-origin/blob playback.
