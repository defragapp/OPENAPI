# Sovereign.OS launch surface

## One product, three boundaries

### Public

The public site stays open and contains only:

- `/` — main entry and product explanation;
- `/how-it-works.html` — short operating model;
- `/pricing.html` — Free and Sovereign+ comparison;
- `/faq.html` — privacy, consent, visual, and billing answers;
- `/privacy` and `/terms`;
- `/login` and `/signup`.

The public site never needs private Baseline data and never receives Stripe secret keys.

### Protected preview

The founder-review hostname must be protected by Cloudflare Access before any preview is accepted. Access is the preview perimeter, not the customer subscription system.

Recommended layout:

- public production entry: `https://defrag.app`;
- protected preview: a dedicated preview hostname or Worker Preview URL;
- Cloudflare Access application: the entire preview hostname;
- policy: founder/reviewer identities or a CI service token only;
- no public bypass policy on the preview hostname;
- preview D1, Durable Object, secrets, Stripe test mode, and AI Gateway settings must remain isolated from production.

Run `pnpm verify:preview-access` with `PREVIEW_BASE_URL`. CI may also provide `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` to verify the authenticated response without logging either value.

### Customer app

Production customer access remains application-owned:

- passwordless account session;
- Cloudflare Turnstile on login and signup requests;
- server-side session validation;
- server-side entitlement checks on protected routes;
- Stripe Checkout for upgrades;
- Stripe Customer Portal for payment method, cancellation, and subscription management;
- Stripe webhooks projected into D1;
- cancellation or payment failure resolves safely to Free without deleting the space.

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
- consent-aware invitations and public-link sharing that never includes private space data.

Private account export is not part of the launch product.

The application must use configured price IDs and never infer entitlement from a price amount or public page copy.

## Release acceptance

A launch candidate is not complete until one exact commit has:

1. green install, typecheck, tests, and build;
2. successful D1 migration replay;
3. protected Cloudflare preview verification;
4. authenticated desktop and iPhone review;
5. test-mode Checkout, webhook, Portal, cancellation, and Free fallback verification;
6. reviewed Privacy and Terms;
7. founder approval.

No public page, successful Stripe object lookup, or deploy command by itself satisfies these gates.
