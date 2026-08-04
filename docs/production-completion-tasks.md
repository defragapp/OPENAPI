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
- [x] safety presentation driven by explicit `sovereign-safety-response.v1` metadata rather than answer text, headline matching, or model inference;
- [x] distinct `grounded`, `supportive_resources`, `urgent`, `emergency`, and `secure_refusal` renderer states;
- [x] ordinary answer actions, Basis evidence, continuation controls, and monetization controls suppressed for deterministic safety responses;
- [x] high-contrast safety layouts, 48–52px resource actions, mobile stacking, focus treatment, and reduced-motion rules;
- [x] versioned server-owned safety catalog with jurisdiction, provenance, official source, review date, catalog version, and fixed actions;
- [x] coarse Cloudflare connection country used only as an optional U.S. default, with an explicit warning that it may be wrong and can be disregarded;
- [x] unsupported or missing jurisdiction returns a generic no-contact fallback without model-written organizations, phone numbers, URLs, or emergency instructions;
- [x] protected-system refusals do not receive unrelated crisis contacts;
- [x] public FAQ explains plan-independent safety, interpretive limits, Basis evidence, corrections, and safety feedback;
- [x] desktop founder-reference comparison remains enforced;
- [x] mobile screenshot verification remains enforced at 390×844 and 430×932 for structure, sequence, typography, document height, and overflow;
- [x] mobile comparison scores are labeled diagnostic-only until viewport-specific founder-approved references exist;
- [x] Free, $20 monthly, and $99 annual public plan language remains aligned;
- [x] Queue, R2, private export, mock runtime, duplicate workspace, and versioned preview URLs remain disabled.

## Verified external integration state

- [x] Live Sovereign+ monthly Price is active at $20 USD per month.
- [x] Live Sovereign+ annual Price is active at $99 USD per year.
- [x] Both live prices belong to the same Sovereign+ product and retain the expected lookup keys and plan metadata.
- [x] The enabled live Stripe billing webhook now targets `https://app.defrag.app/api/v1/stripe/webhook`, not the retiring production Worker subdomain.
- [x] Resend domain `defrag.app` is verified and sending is enabled.
- [x] Resend DKIM is verified.
- [x] Resend SPF MX and SPF TXT records are verified.
- [ ] Confirm a published DMARC policy for `defrag.app` through DNS evidence; Resend does not report DMARC status in the connected domain record.

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
- [x] Verify Resend sender-domain SPF and DKIM alignment.
- [ ] Verify DMARC publication and alignment.
- [ ] Complete public → signup → onboarding → Baseline → authenticated workspace.
- [ ] Verify Today, Explore, People, Systems, Library, and You remain one intelligence environment.
- [ ] Verify correction and Library save/delete flows.
- [ ] Verify invitation → consent → relationship → system inclusion → revocation → blocked-after-revocation.
- [ ] Verify optional Covenant enablement and disablement without replacing the grounded answer.
- [ ] Verify Free works without creating a Stripe customer.
- [ ] Verify the Free allowance and controlled daily-capacity response.
- [ ] Complete $20 monthly and $99 annual Checkout in Stripe test mode.
- [ ] Verify signed-webhook idempotency, Customer Portal return, cancellation, and failed-payment fallback to Free.

## Required safety and accessibility evidence

- [x] Unit coverage verifies every safety renderer state and rejects answer-only safety inference.
- [x] Worker coverage verifies U.S. 911/988 catalog selection, unsupported-jurisdiction fallback, provenance, review date, version, and protected-boundary isolation.
- [x] Transport coverage verifies safety occurs before entitlement/model access and reaches the browser as explicit metadata.
- [ ] Complete authenticated browser checks for grounded, supportive-resources, urgent, emergency, and secure-refusal output on desktop and iPhone widths.
- [ ] Complete keyboard and screen-reader review of resource regions and call/text/link controls.
- [ ] Complete increased-text, safe-area, and mobile-keyboard review for safety output.
- [ ] Record official-source stability and the next review date before expanding beyond the U.S. catalog.

## Required visual approval evidence

- [x] Desktop 1440×900 founder-reference comparison is automated.
- [x] Mobile 390×844 structural render is automated.
- [x] Mobile 430×932 structural render is automated.
- [ ] Store a founder-approved 390×844 reference if exact mobile composition parity is required.
- [ ] Store a founder-approved 430×932 reference if exact larger-phone composition parity is required.
- [ ] Re-enable per-viewport pixel/rhythm release thresholds only after those references exist.
- [ ] Complete manual keyboard, screen-reader, increased-text, reduced-motion, safe-area, and mobile-keyboard composer review.

## Issue reconciliation

- `#118` deterministic risk routing is source-complete for the accepted current categories; close only after the current candidate passes exact-SHA production evidence.
- `#119` safety response contract, five renderer states, generic fallback, and reviewed U.S. resource catalog are source-complete. Authenticated browser and accessibility evidence remains open.
- `#125` remains the production-closure issue until the Cloudflare, real-account, billing, rollback, safety-browser, and visual evidence above is recorded.
- Parent issue `#117` closes only after every remaining applicable item in this ledger is complete or explicitly descoped with a recorded reason.

## Release retrigger — August 4, 2026

A fresh `main` commit was issued after the production-readiness merge to retrigger the repository-connected Cloudflare Workers Build without changing application behavior. The build remains authoritative only when the deployed `/ready` response reports this exact resulting commit and all release evidence passes.

## Completion rule

Production is complete only when all applicable live evidence above is recorded for one exact `main` SHA. Repository checks, dry runs, the previous successful deployment, or dashboard configuration without source parity do not substitute for exact-SHA production verification.
