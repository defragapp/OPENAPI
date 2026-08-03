# Sovereign.OS production completion

This file tracks unresolved production evidence. It is not release authority. The authoritative source is the exact `main` commit reported by the deployed `/ready` response after `pnpm production:deploy` completes.

## Last fully verified production release

The last fully verified deployment before the current hardening candidate is:

- commit `51398e015a7b6becfcd52a0cc81e134cc02296b0`;
- migration `0014_passkey_authentication`;
- 197 web tests and 205 Worker tests passed;
- public and application health/readiness passed on the approved domains;
- parent-domain redirects, security headers, public documents, pricing, unauthenticated boundaries, Turnstile rejection, Stripe signature rejection, bundle limits, and rendered screenshots passed;
- desktop founder-reference comparison passed;
- 390×844 and 430×932 mobile renders had no horizontal overflow and preserved the required section sequence.

That deployment is evidence for the previous exact SHA only. It does not approve later commits.

## Current repository-controlled work

The current `main` candidate includes:

- [x] production `workers.dev` disabled in both production Wrangler authorities;
- [x] `sovereign.defrag.app` and `app.defrag.app` retained as production Custom Domains;
- [x] `defrag.app/*` and `www.defrag.app/*` retained as redirect routes;
- [x] production runtime probes restricted to approved domains rather than the retired Worker subdomain;
- [x] safety response presentation derived from validated `sovereign-answer.v2` fields instead of fixed user-visible headlines;
- [x] ordinary answer actions, Basis evidence, and monetization controls remain suppressed for deterministic safety responses;
- [x] public FAQ explains plan-independent safety, interpretive limits, Basis evidence, corrections, and safety feedback;
- [x] desktop founder-reference comparison remains enforced;
- [x] mobile screenshot verification remains enforced at 390×844 and 430×932 for structure, sequence, typography, document height, and overflow;
- [x] mobile comparison scores are labeled diagnostic-only until viewport-specific founder-approved references exist;
- [x] Free, $20 monthly, and $99 annual public plan language remains aligned;
- [x] Queue, R2, private export, mock runtime, duplicate workspace, and versioned preview URLs remain disabled.

## Required exact-SHA Cloudflare evidence for the current candidate

- [ ] Cloudflare Workers Build runs against the exact current `main` SHA.
- [ ] `pnpm verify:cloudflare-build` completes without a repository gate, typecheck, test, build, or compressed-size failure.
- [ ] `pnpm production:deploy` completes for that same SHA.
- [ ] `/health`, `/healthz`, and `/ready` succeed through `sovereign.defrag.app` and `app.defrag.app`.
- [ ] `/ready` reports the exact candidate SHA and migration `0014_passkey_authentication`.
- [ ] The production Worker no longer exposes the `sovv-web.sovereign-os-api.workers.dev` endpoint.
- [ ] Parent-domain redirects and branded 404 behavior still pass.
- [ ] The previous stable Worker version and the new deployment/version identifiers are recorded for rollback.

## Cloudflare account actions that require dashboard or management-token access

- [ ] Delete the exposed deploy hook and confirm no replacement hook is active. Deploy hooks are not an approved release authority.
- [ ] Use a separate scoped management token to verify AI Gateway cache bypass and persistent-log disablement.
- [ ] Verify the Free-plan WAF rate-limit rule with zone-level management permission.
- [ ] Verify API Shield schema validation with zone-level management permission.
- [ ] Confirm D1 automatic read replication remains enabled.

The build/deploy token must not be broadened unnecessarily. Management verification may use a separate least-privilege token.

## Required real-account and billing evidence

These flows cannot be proven by unauthenticated release probes alone:

- [ ] Complete signup with a valid Turnstile token.
- [ ] Complete first-time email verification and returning passkey sign-in.
- [ ] Complete six-digit email-code recovery.
- [ ] Confirm link/code replay protection, session rotation, logout invalidation, and CSRF enforcement.
- [ ] Verify Resend sender-domain SPF, DKIM, and DMARC alignment.
- [ ] Complete public → signup → onboarding → Baseline → authenticated workspace.
- [ ] Verify Today, Explore, People, Systems, Library, and You remain one intelligence environment.
- [ ] Verify correction and Library save/delete flows.
- [ ] Verify invitation → consent → relationship → system inclusion → revocation → blocked-after-revocation.
- [ ] Verify optional Covenant enablement and disablement without replacing the grounded answer.
- [ ] Verify Free works without creating a Stripe customer.
- [ ] Verify the Free allowance and controlled daily-capacity response.
- [ ] Complete $20 monthly and $99 annual Checkout in Stripe test mode.
- [ ] Verify signed-webhook idempotency, Customer Portal return, cancellation, and failed-payment fallback to Free.

## Required visual approval evidence

- [x] Desktop 1440×900 founder-reference comparison is automated.
- [x] Mobile 390×844 structural render is automated.
- [x] Mobile 430×932 structural render is automated.
- [ ] Store a founder-approved 390×844 reference if exact mobile composition parity is required.
- [ ] Store a founder-approved 430×932 reference if exact larger-phone composition parity is required.
- [ ] Re-enable per-viewport pixel/rhythm release thresholds only after those references exist.
- [ ] Complete manual keyboard, screen-reader, increased-text, reduced-motion, safe-area, and mobile-keyboard composer review.

## Issue reconciliation

- `#118` risk routing is implemented and deployed in the last verified release; close only after the current candidate passes exact-SHA production evidence.
- `#119` explicit safety presentation is now contract-driven; resource localization beyond generic emergency guidance remains a separate reviewed product decision and must never use model-invented contacts.
- `#125` remains the production-closure issue until the Cloudflare, real-account, billing, rollback, and visual evidence above is recorded.
- Parent issue `#117` closes only after every remaining applicable item in this ledger is complete or explicitly descoped with a recorded reason.

## Completion rule

Production is complete only when all applicable live evidence above is recorded for one exact `main` SHA. Repository checks, dry runs, the previous successful deployment, or dashboard configuration without source parity do not substitute for exact-SHA production verification.
