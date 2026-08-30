# Sovereign founder v0 selective visual-port contract

## Authority

The supplied founder archive is the visual and component authority for the Sovereign public landing and the visual language applied across the real OPENAPI platform.

Archive SHA-256:

```text
6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba
```

The archive is a design and component source. It is not the production application architecture, and its historical strings or typeface choices are not automatically current product-language requirements. Active user-facing language inherits `docs/product-language-system.md`.

## Required public composition

The root landing must preserve the archive’s recognizable sequence while using current approved language:

1. Navigation branded `SOVEREIGN.OS` with How it works, Pricing, FAQ, Sign in, and Get started. The wordmark, header height, shell geometry, link scale, and account actions must remain visually consistent across root, standalone public pages, Privacy, Terms, and account-entry surfaces.
2. Badge: `Personal AI for real life`.
3. Hero:
   - `Healing isn’t optional.`
   - `Holding onto the pain is.`
   - both lines use the active sans typography authority;
   - hierarchy may use scale, weight, opacity, or a restrained outline treatment, but must not switch to the retired display serif or a decorative replacement;
   - supporting copy immediately explains that Sovereign is private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.
4. Self exploration:
   - current language inherited from `product-language-system.md`;
   - one recognizable exploration question at a time;
   - questions can cover Alignment, expression, creativity, decisions, communication, pressure/change, connection, or other supported self domains;
   - do not reduce this section to one incident, conflict, responsibility, or carrying-outcomes example.
5. Personal demonstration:
   - section identity is `01 · You`;
   - demonstrate genuine self exploration from the supported Baseline facet universe;
   - visible product-level workflow/explanation on the left and the conversation/output on the right at desktop widths;
   - source codes stay hidden by default behind a plain `See source details` disclosure;
   - the demonstration must remain visible without IntersectionObserver/reveal-state success; motion is enhancement, never a content gate;
   - do not lead with internal `capacity` terminology or framework mechanics.
6. Relationship demonstration:
   - section identity is `02 · You + your people`;
   - `See why the same moment lands differently—and how to bridge the gap.`;
   - keep two permission-bound contexts distinct in implementation while describing the experience in ordinary language;
   - demonstrate a materially useful interaction explanation rather than paired labels alone: relevant differences, the interaction sequence when supported, a practical bridge or repair sequence when useful, and what remains unknown;
   - no motive, exact-emotion, private-thought, compatibility-score, or future-outcome claims.
7. System demonstration:
   - section identity is `03 · From 1:1 to the whole system`;
   - `See the whole system.`;
   - describe people, roles, responsibilities, pressure, interactions, and change in ordinary language rather than exposing authorization/evidence taxonomy;
   - use a stable system analysis, pressure sequence, relationship structure, or change-effect view only when it supports the explanation;
   - do not require or preserve a decorative node graph merely because one existed in the archive;
   - do not make responsibility concentration the category headline for all Systems;
   - do not treat `authority` or `missing perspective` as product intelligence dimensions;
   - do not imply that one person causes the whole pattern.
8. Comparison:
   - `Most AI starts with the prompt. Sovereign starts with you.`;
   - concise current-conversation behavior versus Baseline continuity, shared relationship information, and wider family/team information when relevant;
   - no claim that every other AI literally answers every user identically.
9. Final action:
   - `Know yourself. Understand your people. See the whole system.`

These are component and sequence requirements, not merely copy strings. Retired chatbot phrases and historical archive copy remain fingerprint provenance only and must not be restored as active UI copy.

## Included from the archive

Port and maintain:

- the full-screen dark hero composition;
- large restrained sans typography with hierarchy created by scale, weight, spacing, opacity, and layout;
- rotating question treatment;
- self, relationship, and system storytelling sequence;
- chat-window demonstrations;
- a quiet source-details disclosure whose exact example values stay collapsed until opened;
- answer/exploration structure treatment;
- a system structure/sequence treatment that supports the explanation rather than requiring a decorative graph;
- comparison composition;
- final call to action;
- restrained atmospheric motion;
- the real Expression Field renderer: one value-driven field for self, two distinct fields for a relationship, and multiple distinct fields for a system;
- near-black, cream, white/gray line, spacing, radius, and depth language;
- responsive behavior and reduced-motion treatment.

`Sovereign Display` and serif fallback typography are explicitly excluded from the active rendered product. The retired bundled `Sovereign Sans`, `Optima`, and `Avenir Next` are also excluded as title/heading authorities. Titles inherit self-hosted Geist Sans from `apps/web/src/design-system.css` (the consolidated typography source of truth); Apple/SF Pro Display, Segoe Variable/Segoe, system-ui, Helvetica, and Arial remain resilient fallbacks only. The hero and meaningful product headings must visibly resolve to Geist whenever the bundled font asset is available. Visual hierarchy comes from scale, weight, spacing, opacity, and layout rather than a decorative face.

The refined product should not depend on electric blue, cyan glow, neon, generic AI gradients, or glassmorphism as primary UI language. Spectral color, where intentionally used, should behave like physical light rather than a generic interface accent.

## Explicitly excluded from the archive

Never import or recreate the archive’s mock product runtime:

- localStorage authentication or users;
- fake account state;
- canned or random AI responses;
- mock chat persistence;
- placeholder dashboard routes;
- fake billing, permissions, invitations, people, systems, or account data;
- any component that bypasses the real OPENAPI APIs and contracts.

The selective-port source must reject mock auth, canned answer generators, fake users, dashboard-grid behavior, and nondeterministic demonstration generation. Broad dependency-bundle string guesses are not a substitute for source-level and runtime-contract verification.

Public marketing examples may use deterministic, sanitized representative fixtures. Those fixtures must be explicitly bounded as examples, must not imply visitor data or a live private inference call, and must keep their exact source values tied to the same fixture used to author the demonstration answer. Exact codes remain collapsed until the visitor chooses `See source details`.

## Real production architecture that remains authoritative

Preserve the existing OPENAPI application and server behavior:

- React/Vite client;
- Cloudflare Worker runtime;
- D1, Durable Objects, Workers AI, AI Gateway, Turnstile, Resend, and Stripe;
- authenticated one-room workspace;
- navigation: Today, Explore, People, Systems, Library, You;
- `SovereignIntelligenceWorkspace`;
- `sovereign-answer.v2`;
- Baseline and current-context separation;
- permission-bound People and Systems;
- real billing and entitlements;
- optional contextual Covenant;
- the private Expression Field endpoint and authenticated visualization.

## Sitewide application

The archive visual language must extend beyond the landing to the real product surfaces:

- authenticated workspace shell;
- navigation and top bar;
- Today, Explore, People, Systems, Library, and You;
- composer and contextual controls;
- Baseline onboarding and reveal;
- relationship and system views;
- answer, source-details, Alignment, Covenant, and Library surfaces;
- login, signup, email access, invitation, onboarding, plan, account, privacy, terms, and not-found surfaces.

The styling layer may change presentation. It must not replace route ownership, state management, API requests, authorization, consent, billing, or AI output behavior.

The public Expression Fields use deterministic sanitized `expression-field.v1` examples only. Matching fields inside People, Systems, and relationship/system answers use axes derived from the same permitted Baseline facets already authorized for those surfaces; they do not load additional private data, infer motive, or calculate compatibility. There is one canvas renderer at every depth. Relationship engagement may be shown by lines temporarily orienting toward one another, never by a literal connector. A system never receives a synthetic center person: the system is the interaction among the distinct fields.

The explanatory hierarchy is user need → relevant Baseline reference → optional current/relationship/system information → Sovereign interpretation. Framework/source mechanics stay underneath the product explanation and appear only when useful for disclosure or inspection.

Across the landing and authenticated product, preserve the underlying intelligence separation without forcing it into the public headings. Public surfaces translate internal reasoning into ordinary human language and keep self exploration broader than conflict/problem analysis.

## Visual delivery paths

The complete Vite foundation and final refinement are required through the consolidated canonical stylesheets. The historical per-file authorities (`v0-platform-port.css`, `v0-motion-accessibility.css`, `v0-visual-port.css`, `v0-global-experience.css`, `experience-refinement-v1.css`, `rendered-fidelity-v1.css`, `landing-refinement-v2.css`, `premium-action-authority-v1.css`, `sans-typography-authority-v1.css`, `production-product-cohesion-v1.css`, `public-intelligence-demonstration-v1.css`, `production-visual-authority-v1.css`, and the inline `?inline` release layer) were removed and folded into the consolidated sheets. Their delivery roles now live in the actual files `apps/web/src/main.tsx` imports, in certified order with `passkey-auth.css` terminal:

1. `apps/web/src/design-system.css`
   - owns the platform-wide typography tokens (`--font-title`, `--font-display`, `--font-subheading`, `--font-body`, `--serif`) and the self-hosted Geist Sans title system;
   - the token foundation, distinct from route-owned composition.
2. `apps/web/src/public.css`
   - owns the founder landing composition (`v0-landing-port`, `v0-hero`, `.public-approved-v8`), the warm-metal public palette, the monochrome-fidelity and reduced-motion treatment, the public demo surface, the click-led 360 Expression Field, and mobile proof;
   - must not alter product logic, consent, Baseline contracts, or answer contracts.
3. `apps/web/src/workspace.css`
   - owns the real authenticated workspace structure and launch-surface cohesion.
4. `apps/web/src/app-shell.css`
   - owns the shared navigation, wordmark, layout, and responsive shell geometry.
5. `apps/web/src/passkey-auth.css`
   - terminal in the certified local import order; no local component stylesheet or later visual override may load after it.
6. Standalone public documents
   - retain the deployed static foundations;
   - load `apps/web/public/premium-action-static-v1.css` last as their terminal static authority;
   - that terminal static authority must inherit the same Geist Sans title system, public header/wordmark hierarchy, and final static presentation.

`apps/web/src/releases.css` remains in the source tree but is not imported; `main.tsx` must not reintroduce any obsolete versioned authority or a later visual override after `passkey-auth.css`.

Removing or bypassing any one of these means the visual port is not sitewide.

## Runtime identity

`apps/web/src/v0-release-fingerprint.ts` must expose:

- the exact archive SHA-256;
- the exact founder sequence fingerprint as historical provenance;
- `data-sovereign-visual-contract="v0-landing-selective-port"` on the running document;
- archive and sequence values on the running document.

The runtime fingerprint proves which founder visual source was compiled. It does not override current product-language authority.

## Release enforcement

A production release must fail unless all of the following are true:

- `PublicLanding.tsx` contains the exact archive fingerprint;
- the runtime bundle contains the exact historical sequence fingerprint as provenance only;
- the required founder component structure is compiled;
- active UI copy follows `docs/product-language-system.md` and excludes retired product-positioning language;
- root marketing communicates You → You + your people → whole system before source mechanics;
- the root landing does not use `foundation` as its Baseline metaphor or enumerate framework sources in its main narrative;
- the terminal production visual authority remains the final inline presentation layer;
- active headings/titles resolve to the approved native sans title system and never to `Sovereign Display`, the retired bundled `Sovereign Sans`, `Optima`, `Avenir Next`, or serif fallbacks;
- root/static/policy public navigation exposes the expected page-in/page-out destinations with one consistent `SOVEREIGN.OS` wordmark identity without freezing temporary breakpoint geometry as the design authority;
- product demonstrations remain visible without reveal-state success;
- public demo workflow precedes the conversation at desktop widths and the composer reads as the bottom of the thread rather than floating in the middle of the answer field;
- public source codes remain collapsed by default behind `See source details`, stay tied to the exact representative fixture, and never imply visitor/private runtime data;
- the system demonstration supports the explanation with a stable sequence/structure rather than requiring a decorative node graph;
- compiled CSS contains founder landing, real workspace/account, onboarding, policy, and access selectors;
- Privacy and Terms render as disciplined documents rather than a generic card grid;
- the final compiled presentation contains the near-black/cream refinement authority;
- standalone public routes load the static terminal action/typography authority after route cohesion/refinement;
- archive mock-runtime markers are absent;
- `/health` and `/ready` report the exact release SHA;
- the public entry document is non-storable;
- the retired service worker remains non-caching;
- the private Expression Field boundary remains `401` without a session.

## Change control

Do not use the words `canonical`, `approved`, `v0`, `editorial`, or `cinematic` as evidence by themselves.

Release, deployment, copy, verifier, and infrastructure work must not redefine the founder visual system as a side effect. Any intentional visual-system change requires a focused visual task, a narrow diff, and desktop+iPhone human review against the current founder contract.

A future change is valid only when the rendered component structure, current language authority, archive fingerprint provenance, visual delivery paths, and real platform contracts agree. Static string checks must never certify a visually different implementation as the founder visual port.