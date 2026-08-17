# Sovereign.OS launch surface

Status: current route, access, plan, and launch-acceptance boundary. User-facing language inherits `product-language-system.md`; product scope inherits `launch-product-contract.md`; release execution inherits `production-release.md`.

## One product, three access boundaries

### Public

Canonical public hostname: `https://sovereign.defrag.app`.

Public routes include:

- `/` — main product entry;
- `/how-it-works` — operating model;
- `/pricing` — Free/Sovereign+ comparison;
- `/faq` — privacy, consent, product, and billing answers;
- `/privacy` and `/terms`;
- `/login` and `/signup`.

`https://defrag.app` and `https://www.defrag.app` remain owned parent-domain routes into the same Sovereign.OS product. They are not alternate identities.

Public pages do not need private Baseline data or payment secrets.

### Protected preview

An isolated preview may be used for founder/reviewer work only when protected by Cloudflare Access and isolated from production D1, Durable Object state, live Stripe credentials, production routes, and customer records.

Preview is not production authority and is not required for every production release.

### Customer app

Canonical authenticated application/API hostname: `https://app.defrag.app`.

Customer access remains application-owned:

- Turnstile-protected signup/login;
- one-time email link/code plus passkey/recovery flows;
- signed revocable account session;
- current policy/18+ eligibility review;
- server-side plan/entitlement enforcement;
- Stripe-hosted Checkout and Customer Portal;
- signed Stripe webhook projection into D1;
- Baseline readiness before AI thread use;
- consent/permission checks before shared context;
- authenticated on-demand private export.

Cloudflare Access is never the Sovereign+ paywall.

## Current onboarding path

The product journey is:

`Account → policy/eligibility → Plan → Baseline → Workspace`

Existing account state may allow the UI to skip already-completed steps, but the server boundaries remain authoritative.

- Free can be chosen without a card.
- Sovereign+ does not become effective from a browser choice; it becomes effective only from server-confirmed Stripe subscription state.
- A structurally ready Baseline is required before ordinary Sovereign messages are processed.
- Unknown birth time remains a supported Baseline path; unavailable outputs stay unavailable rather than guessed.

## Launch plans

### Free

- permanent first-party plan;
- $0, no card;
- private Baseline;
- Today and Explore personal intelligence;
- 10 Sovereign AI turns per UTC month.

### Sovereign+

- $20/month or $99/year;
- 300 Sovereign AI turns per UTC month;
- server-enforced paid capabilities defined by `launch-product-contract.md`, including permission-bound People/Systems, Library continuity, and contextual Covenant.

Private account export is an account right/control, not a Sovereign+ entitlement. It is generated on demand and not retained as an export artifact.

Voluntary support payments remain entitlement-neutral.

## Text-first launch experience

The authenticated launch is one text-first Sovereign workspace. The normal answer loop is:

`question → direct answer → relevant explanation → quiet Basis → correction/continue`

The public landing demo chats may teach that hierarchy. They are not fake authenticated state.

Worlds/video generation is not part of the current launch. No video CTA, provider, generated media, or video spend is required for production acceptance.

## Release acceptance

A launch candidate is not technically live until one exact current `origin/main` SHA has:

1. green `pnpm verify:cloudflare-build` evidence;
2. successful release through `pnpm production:release:text` for that same SHA;
3. D1 migration parity through `0017_privacy_access_and_eligibility`;
4. exact-SHA `/health` and `/ready` convergence on both branded domains;
5. configured policy acceptance receipts and privacy access controls;
6. matching exact-SHA release evidence;
7. truthful automated Browser verification booleans.

The text-first release intentionally does not run live Browser Rendering, so its automated route/rendered evidence fields remain `false`. That is not a readiness failure.

Final public launch acceptance additionally requires the real production journeys and human desktop/iPhone review tracked under #207/#210–#216.

No successful public page, historical deployment, dashboard state, isolated Stripe object lookup, branch push, or standalone upload by itself satisfies these gates.
