# Sovereign.OS production completion

This file tracks unresolved production evidence. It is not release authority. The authoritative source is the exact `main` commit reported by the deployed `/ready` response after `pnpm production:deploy` completes.

## Current code baseline

The current repository release contract includes:

- Cloudflare Workers Builds as the sole production deployment authority;
- Worker `sovv-web` on the four declared production domains;
- Cloudflare Workers AI through AI Gateway `sovereign`;
- approved model `@cf/zai-org/glm-4.7-flash`;
- D1 Sessions and automatic read replication;
- migration `0013_workers_ai_free_capacity`;
- D1-backed daily Workers AI capacity reservations;
- failed inference refunding the user's monthly turn;
- strict `sovereign-answer.v2` validation;
- consent-bound relationship and system intelligence;
- Free, $20 monthly, and $99 annual plans;
- private account export disabled;
- Queue and R2 disabled;
- public metadata, social preview, PWA manifest, static 404, and service-worker cache aligned to the current product contract.

Code readiness is not production completion. Do not mark the release complete from repository state alone.

## Required Cloudflare release evidence

- [ ] Cloudflare Workers Build runs against the exact current `main` SHA.
- [ ] `pnpm verify:cloudflare-build` completes without a repository gate, typecheck, test, build, or compressed-size failure.
- [ ] `pnpm production:deploy` completes for that same SHA.
- [ ] Cloudflare build UUID and deployment/version identifiers are recorded.
- [ ] D1 migrations apply through `0013_workers_ai_free_capacity`.
- [ ] D1 automatic read replication is configured.
- [ ] AI Gateway cache bypass and persistent-log disablement are verified.
- [ ] Free-plan WAF rate limiting and API Shield configuration are verified.
- [ ] The previous stable Worker version is recorded before promotion.

## Required live readiness evidence

- [ ] `/health`, `/healthz`, and `/ready` return successfully on the production Worker.
- [ ] `/ready` reports the exact deployed SHA.
- [ ] `/ready` reports migration `0013_workers_ai_free_capacity`.
- [ ] `/ready` reports `aiFreeCapacity: configured`.
- [ ] D1, Durable Objects, authentication, AI Gateway, Workers AI, Resend, Stripe, and scheduled cleanup report their intended states without exposing secrets.
- [ ] `sovereign.defrag.app`, `app.defrag.app`, `defrag.app`, `www.defrag.app`, and the workers.dev fallback converge on the intended release.
- [ ] Unknown public routes return the branded static 404.
- [ ] Private application and API responses are not cached by the service worker.

## Required account and authentication evidence

- [ ] Complete signup with a real account and valid Turnstile token.
- [ ] Complete magic-link sign-in.
- [ ] Complete six-digit email-code recovery.
- [ ] Confirm link and code replay protection.
- [ ] Confirm session rotation and logout invalidation.
- [ ] Confirm CSRF protection on cookie-authenticated mutations.
- [ ] Verify Resend sender-domain SPF, DKIM, and DMARC alignment.

## Required product evidence

- [ ] Complete public → signup → onboarding → Baseline → authenticated workspace flow.
- [ ] Verify Today, Explore, People, Systems, Library, and You as one intelligence environment.
- [ ] Verify a valid `sovereign-answer.v2` response with authorized Basis references.
- [ ] Verify correction and Library save/delete flows.
- [ ] Verify invitation → consent → relationship → system inclusion → revocation → blocked-after-revocation.
- [ ] Verify another person's motive or private experience is never asserted as known.
- [ ] Verify optional Covenant enablement and disablement without replacing the grounded answer.

## Required billing evidence

- [ ] Free works without creating a Stripe customer.
- [ ] Free monthly allowance is enforced.
- [ ] Daily Workers AI capacity failure returns a controlled response and refunds the monthly turn.
- [ ] $20 monthly Checkout succeeds in Stripe test mode.
- [ ] $99 annual Checkout succeeds in Stripe test mode.
- [ ] Signed webhooks project entitlements correctly and remain idempotent.
- [ ] Customer Portal opens and returns to the authenticated application.
- [ ] Cancellation or payment failure returns the account safely to Free without deleting the workspace.

Support payments are not part of the launch entitlement contract and must not appear in production approval evidence unless separately approved.

## Required deployed UX evidence

- [ ] Review desktop widths at 1440, 1024, and 768 px.
- [ ] Review mobile widths at 390 and 360 px.
- [ ] Verify increased text size, keyboard-only use, screen-reader labels, high contrast, reduced motion, safe areas, and composer behavior above the mobile keyboard.
- [ ] Verify public metadata and social preview render the current promise: “Know yourself. Understand the system. Choose what fits.”
- [ ] Verify the PWA installs with the current self, relationship, and system description.

## Completion rule

Production is complete only when all applicable live evidence above is recorded for one exact `main` SHA. Repository checks, dry runs, or an older successful deployment do not substitute for exact-SHA production verification.