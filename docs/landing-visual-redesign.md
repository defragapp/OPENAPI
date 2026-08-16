# Sovereign public landing visual contract

The authoritative implementation contract is `docs/v0-visual-port-contract.md`.

The supplied founder v0 archive is the component and visual source for the public root. The root is not a later marketing reconstruction and is not an independent dashboard application.

Archive SHA-256:

```text
6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba
```

The archive fingerprint preserves design provenance. Active user-facing wording inherits `docs/product-language-system.md`; historical archive strings are not current copy requirements.

## Required first viewport

- Brand: `Sovereign`
- Kicker: `PERSONAL AI FOR REAL LIFE`
- Headline line one: `Healing isn’t optional.`
- Outlined line two: `Holding onto the pain is.`
- Primary action: `Build my Baseline`
- Secondary action: `See a Sovereign answer`
- Trust: start free, no card required, interpretations remain reviewable

The hero must preserve the archive’s centered, near-black, atmospheric editorial composition. It must not be replaced by the later `Know yourself. Understand the system. Choose what fits.` reconstruction.

## Required sequence

1. Founder v0 hero.
2. Situational recognition: `Start with what’s actually happening.` with one rotating real-life question at a time.
3. Personal demonstration: `See the capacity beneath the pattern.` with the self chat, quiet Basis metadata, and visible answer structure.
4. Relationship demonstration: `Understand what happens between you.` with two permitted Baselines and the relationship context.
5. System demonstration: `See what keeps the pattern going—and what could change it.` with distinct people, roles, responsibility, authority, pressure, and system interaction.
6. Concise generic-AI / Sovereign comparison focused on current-conversation context versus Baseline + permitted connected context.
7. `Your thoughts deserve a better place to live.` final action.

These are rendered component requirements. Copy-string presence alone is not sufficient. Retired chatbot phrases must not be restored merely because they appeared in the founder archive.

## Selective port boundary

Bring across:

- hero composition;
- rotating questions;
- chat windows;
- Baseline evidence treatment;
- visible answer-structure flows;
- relationship example;
- system map;
- comparison;
- final action;
- dark editorial tokens, type, spacing, depth, and motion.

Do not bring across:

- mock authentication;
- localStorage users;
- canned or random answers;
- fake dashboard data;
- mock billing, account, consent, invitation, People, or Systems behavior.

## Real platform continuity

The real OPENAPI platform remains authoritative for:

- login, signup, invitation, onboarding, and account control;
- Today, Explore, People, Systems, Library, and You;
- `SovereignIntelligenceWorkspace`;
- `sovereign-answer.v2`;
- Baseline, current context, Basis, Alignment, relationship, system, and Covenant behavior;
- Cloudflare Worker APIs, D1, Durable Objects, Workers AI, AI Gateway, Resend, Turnstile, and Stripe;
- deterministic permission and consent enforcement.

## Sitewide visual application

The v0 visual language applies to the public root, static How it works, Pricing, FAQ, 404, login, signup, invitation, onboarding, policy pages, and the authenticated one-room workspace.

`apps/web/src/v0-visual-port.css` remains the founder visual foundation. `v0-global-experience.css`, route-cohesion authorities, and `passkey-auth.css` preserve the established route implementation. `apps/web/src/experience-refinement-v1.css` is appended through the existing synchronous cohesion installer as the bounded final presentation refinement; it is not another local stylesheet import and must not change product behavior.

Standalone How it works, Pricing, and FAQ retain the founder static foundation and route-cohesion layer, then load `apps/web/public/experience-static-refinement-v1.css` as the final static presentation authority.

## Verification

Production must reject:

- the `Know yourself…` reconstructed landing;
- missing archive fingerprint;
- wrong component order;
- retired active chatbot language;
- missing v0 component selectors;
- missing workspace/account selectors;
- mock runtime markers;
- a local stylesheet loaded after `passkey-auth.css`, or any change to the certified local Vite import order;
- a compiled asset missing the founder provenance fingerprint;
- a compiled experience in which the final monochrome refinement authority is absent.
