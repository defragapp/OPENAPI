# Sovereign.OS launch surface

Status: route, access, plan, and launch-acceptance boundary. This document inherits user-facing language from `docs/product-language-system.md`, product scope from `docs/launch-product-contract.md`, and production release authority from `docs/production-release.md`; it does not define alternate page copy, positioning, or deployment authority.

## One product, three boundaries

### Public

The canonical public hostname is `https://sovereign.defrag.app`.

The public site stays open and contains:

- `/` — main entry and product explanation;
- `/how-it-works` — short operating model;
- `/pricing` — Free and Sovereign+ comparison;
- `/faq` — privacy, consent, visual, and billing answers;
- `/privacy` and `/terms`;
- `/login` and `/signup`.

`https://defrag.app` and `https://www.defrag.app` are owned parent-domain routes that resolve public traffic to the canonical Sovereign.OS public experience. They are not alternate product identities.

The public site never needs private Baseline data and never receives Stripe secret keys.

Each public route has a distinct explanatory job while inheriting the same language authority: the root introduces the product and interaction; How It Works explains the operating sequence; Pricing states plans and entitlements; FAQ explains limits, consent, privacy, and billing. These pages may adapt depth, but they must not introduce a competing hero, product promise, named framework, or causal claim.

The root must preserve the Baseline-first experience hierarchy: recognizable real-life situation first, useful distinction, Baseline Design as the private personal foundation, then relationship/system extensions where relevant. Technical machinery remains secondary.

### Protected preview

A founder-review preview hostname must be protected by Cloudflare Access before it is accepted as private review evidence. Access is the preview perimeter, not the customer subscription system.

Recommended layout:

- public production entry: `https://sovereign.defrag.app`;
- protected preview: a dedicated preview hostname or Worker Preview URL;
- Cloudflare Access application: the entire preview hostname;
- policy: founder/reviewer identities or a dedicated verification service token only;
- no public bypass policy on the preview hostname;
- preview D1, Durable Object, secrets, Stripe test mode, and AI Gateway settings remain isolated from production.

Run `pnpm verify:preview-access` with `PREVIEW_BASE_URL` when protected-preview evidence is required. A service token may be provided through the documented environment variables without logging its values.

### Customer app

The canonical production customer application and API hostname is `https://app.defrag.app`.

Production customer access remains application-owned:

- passwordless account session;
- Cloudflare Turnstile on login and signup requests;
- server-side session validation;
- server-side entitlement checks on protected routes;
- Stripe Checkout for upgrades;
- Stripe Customer Portal for payment method, cancellation, and subscription management;
- Stripe webhooks projected into D1;
- cancellation or payment failure resolves safely to Free without deleting the workspace.

Cloudflare Access must not be used as the Sovereign+ paywall. Access policies do not replace Stripe subscription state or application consent rules.

## Launch plans

### Free

- permanent first-party plan;
- no card required;
- private Baseline;
- Today and Explore;
- 10 Sovereign AI turns per UTC calendar month.

### Sovereign+

- $20 per month or $99 per year;
- everything in Free;
- consented People comparisons;
- family, household, friendship group, workplace, and team Systems;
- Library continuity;
- optional Covenant lens;
- consent-aware invitations and public-link sharing that never includes private workspace data.

Private account export is not part of the launch product.

The application must use configured price IDs and never infer entitlement from a price amount or public page copy.

## Release acceptance

A launch candidate is not complete until one exact current `origin/main` commit has the applicable evidence for:

1. green repository verification, typecheck, tests, build, smoke, and compressed-size gates;
2. successful D1 migration replay through `0015_release_evidence`;
3. protected preview verification when preview is part of the approval flow;
4. authenticated desktop and iPhone review;
5. test-mode Checkout, webhook, Portal, cancellation, and Free fallback verification;
6. reviewed Privacy and Terms;
7. rendered production landing and route evidence where visual changes are in scope;
8. founder approval;
9. successful `pnpm production:release:oauth` exact-SHA production verification;
10. both branded `/ready` endpoints proving the exact target SHA, migration parity `current`, and matching release evidence.

No public page, successful Stripe object lookup, historical Cloudflare build, dashboard state, branch push, or standalone deploy command by itself satisfies these gates.
