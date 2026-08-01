# Sovereign public landing visual contract

The authoritative implementation contract is `docs/v0-visual-port-contract.md`.

The supplied founder v0 archive is the component and visual source for the public root. The root is not a later marketing reconstruction and is not an independent dashboard application.

Archive SHA-256:

```text
6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba
```

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
2. Rotating real-life questions.
3. `Ask about your life. Get an answer built for you.` with the self chat and reasoning flow.
4. `See the space between you.` with two permitted Baselines and the relationship flow.
5. `From one person to the whole system.` with the family/system map.
6. `Other AI answers everyone the same.` comparison.
7. `Your thoughts deserve a better place to live.` final action.

These are rendered component requirements. Copy-string presence alone is not sufficient.

## Selective port boundary

Bring across:

- hero composition;
- rotating questions;
- chat windows;
- Baseline evidence treatment;
- visible reasoning flows;
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

`apps/web/src/v0-visual-port.css` is the founder visual foundation for Vite-rendered surfaces. `v0-global-experience.css` extends it across non-landing product surfaces, and `passkey-auth.css` is the final local visual authority.

`apps/web/public/v0-public-port.css` is the final visual authority for standalone public documents through `premium-public-release.css`.

## Verification

Production must reject:

- the `Know yourself…` reconstructed landing;
- missing archive fingerprint;
- wrong component order;
- missing v0 component selectors;
- missing workspace/account selectors;
- mock runtime markers;
- a local stylesheet loaded after `passkey-auth.css`, or any change to the certified Vite cascade order;
- a compiled public asset that does not contain the exact v0 sequence.
