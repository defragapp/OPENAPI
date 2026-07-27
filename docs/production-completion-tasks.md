# #tasks — Sovereign.OS production completion

Updated after each completed implementation tranche.

## Current release baseline

- Last fully verified production SHA: `c96ccd6966c6dbab3f0a336fa90b4fce591e7a5a`.
- Unified account access and signed-in entry are merged to `main` at `67723c9285685a98338bdc66443348e44d729468`; Cloudflare promotion is pending exact-SHA verification.
- Active implementation branch: `feat/public-support-and-structured-intelligence`.
- GitHub-hosted Actions currently fail before allocating a runner or executing the first zero-dependency step. Cloudflare’s connected production build remains the executable release gate until that runner issue is resolved.
- Remaining work is concentrated in passkey/provider readiness, live provider/domain verification, broader screenshot QA, and exact-SHA production promotion.

## Account access and communication

- [x] Distinguish verification, invalid email, rate limit, provider, network, and unexpected failures.
- [x] Center and contain Cloudflare Turnstile across desktop and mobile.
- [x] Make Turnstile loading, verified, expired, unsupported, and failure states visible and actionable.
- [x] Preserve an allowlisted `returnTo` through link creation and redemption.
- [x] Add branded HTML and plain-text templates for sign-in, signup, relationship invitations, and invitation resend.
- [x] Keep email actions on HTTPS Sovereign.OS hosts and include expiry, one-time use, privacy, support, and do-not-forward context.
- [x] Keep private labels, raw birth details, exact location, account history, and internal identifiers out of invitation emails.
- [x] Replace pattern-heavy and generic authentication copy with approved Baseline-first language.
- [x] Add focused auth, email, Turnstile, link-safety, routing, invitation-resend, and email-code tests.
- [x] Add a six-digit email one-time-code fallback to the existing verified login request and redemption endpoint.
- [x] Keep missing, invalid, expired, replayed, or locked code responses browser-indistinguishable while enforcing attempt limits server-side.
- [x] Store only code hashes, expire codes after 10 minutes, lock after five failures, invalidate older codes, and invalidate the unused recovery method after either link or code succeeds.
- [ ] Confirm the connected Cloudflare build, live link/code email flow, and exact current-main health/readiness response.

## Product integrity — one Sovereign intelligence

- [x] Keep Today, Explore, People, Systems, Library, and You as surfaces of one Sovereign intelligence.
- [x] Give signed-in users an unmistakable first action.
- [x] Add four guided starts: understand myself, examine a choice, understand a relationship, map a system.
- [x] Start a new exploration when a user changes surfaces with active content.
- [x] Persist and restore surface, internal mode, person, system, Covenant state, and permitted context.
- [x] Return explicit stored surface in thread summaries instead of inferring only from message history.
- [x] Preserve real Today, People, and consent-filtered system data after responses.
- [x] Route Explore through the internal Alignment mode and all other surfaces through Defrag.
- [x] Keep Covenant as a separately enabled, permission-aware lens rather than another top-level product.
- [x] Pass the resolved internal mode and its purpose into the authorized model context.

## Structured intelligence and visual truth

- [x] Validate the server-side recognition plan with a strict schema and verified source basis.
- [x] Return the validated plan with the assistant response when a thread is restored.
- [x] Project phase, confidence, safety mode, basis, clearer form, practical action, limits, mode, and Covenant state into a structured slide-open interface.
- [x] Keep deterministic Baseline/current context separate from model interpretation through the existing source-basis contract and visible basis labels.
- [x] Replace the visible keyword and answer-length alignment instrument with validated plan confidence, basis, safety mode, and uncertainty.
- [x] Keep the plain-language answer available when structured projection cannot load; no second model call or duplicate usage occurs.
- [x] Keep hidden motive, exact emotion, diagnosis, future behavior, and divine certainty outside the structured result.
- [x] Add structured projection, basis integrity, mode, Covenant, uncertainty, and fallback tests.
- [ ] Remove the retired keyword-scoring helper from source after the Cloudflare build proves no remaining release verifier depends on it.

## User control and continuity

- [x] Expose People & Permissions from the mounted People, You, and account-control experiences.
- [x] Support invitation review, cancellation, secure resend, scope review, revocation, and relationship removal.
- [x] Replace a resent invitation’s one-time token, refresh its seven-day expiry, and enforce a two-minute server resend limit.
- [x] Persist a replacement invitation token before delivery and invalidate it if email delivery fails.
- [x] Add one mounted Account & Library control center for invitations, permissions, billing, privacy, terms, support, Library, and deletion.
- [x] Add Library rename and delete without deleting the original conversation.
- [x] Return and visibly restore the latest fit correction and optional note with the thread.
- [x] Return and render up to 20 account-scoped fit corrections as a correction-history timeline.
- [x] Add visible account deletion with an explicit 14-day grace period and cancellation.
- [x] Add reusable modal focus trapping, first-focus placement, Escape behavior, and focus restoration.

## Premium visual and brand system

- [x] Add a premium guided-start hierarchy with responsive, high-contrast, focus, and reduced-motion states.
- [x] Standardize the orbit-derived Sovereign mark across public and signed-in controls.
- [x] Use the established warm-black, paper, copper, sage, rose, spacing, radii, typography, and semantic roles in new public and signed-in work.
- [x] Preserve the signature Baseline Orbit, Relationship Perspective, and System Intelligence visuals.
- [x] Keep new body/supporting text and controls within the 17 px, 14 px, and 44 px accessibility targets where practical.
- [x] Add controlled Open Graph metadata and a branded 1200×630 social asset.
- [x] Add canonical metadata, sitemap, and robots guidance with private account/auth/API routes excluded.
- [x] Add complete horizontally accessible mobile navigation to the React landing page and all static support pages.
- [ ] Run screenshot QA across all required widths before declaring the visual system final.

## Account access and recovery roadmap

- [ ] Add passkeys/WebAuthn as the preferred passwordless return path after the email-code release is verified and the RP ID/origin contract is exercised on the live custom domain.
- [ ] Evaluate and document Google and Apple sign-in prerequisites before introducing additional identity providers.
- [x] Add an email one-time-code fallback for clients that break magic-link continuity.
- [x] Keep SMS out of the release until abuse controls, verified ownership, provider cost, consent, compliance, and threat modeling exist.
- [x] Never use SMS as the sole recovery factor.

## Email and domain trust

- [ ] Verify Resend/Cloudflare sender-domain alignment, SPF, DKIM, and DMARC in the live provider configuration.
- [x] Use a consistent Sovereign.OS sender name, reply-to, support address, visual system, accessible HTML, and plain-text fallback.
- [x] Add branded sign-in, signup, invitation, and resend templates.
- [ ] Add branded permission-change, billing, cancellation, and account-deletion notifications.
- [x] Keep security tokens only in the required private action URL and exclude private context and identifiers.
- [x] Add content tests for HTML/text variants, escaping, unsafe URLs, resend privacy, and email-code privacy.

## Billing and public support

- [ ] Re-verify Free and Sovereign+ entitlements against public pricing and Terms in live QA.
- [ ] Verify checkout, success, cancellation, customer portal, downgrade, and webhook idempotency end to end.
- [x] Create a separate live Stripe development-support product and customer-chosen one-time USD price.
- [x] Configure support amounts from $5 to $500, preset at $25, without recurring billing or account provisioning.
- [x] Publish support only on explanatory public pages while keeping Pricing entitlement-only.
- [x] State that support does not purchase access, create entitlements, grant ownership or influence, promise features, or claim tax-deductible status.
- [x] Publish payment-support and refund-request contact context and tests.
- [x] Mark support PaymentIntents with `grants_entitlement=false` so contributions cannot enter subscription entitlement logic.
- [ ] Verify the Stripe-hosted support page and a real low-value payment/refund lifecycle in live QA.

## Security and operational hardening

- [x] Validate Turnstile hostname/action, classify expiration/reuse, reset rejected tokens, and record privacy-safe mismatch events.
- [x] Preserve account-enumeration-safe responses with useful local guidance.
- [x] Preserve 15-minute magic-link expiry, one-time redemption, and allowlisted post-auth routing.
- [x] Add hashed, expiring, one-use email codes with generic failure behavior and safe return routing.
- [x] Add server-side invitation resend rate limiting, token replacement, and delivery-failure invalidation.
- [ ] Verify session rotation, logout invalidation, CSRF assumptions, and link/code behavior in the live release.
- [ ] Review live limits for sign-in, signup, invitations, checkout, AI turns, consent changes, and support-payment abuse.
- [ ] Add additional abuse-safe audit events without storing message content or secrets.
- [ ] Verify CSP, HSTS, frame denial, noindex rules, caching, and custom-domain redirects after deployment.

## Release QA

- [ ] Restore mandatory pull-request CI after the GitHub-hosted runner can execute its first step; two probes failed before allocation.
- [ ] Add automated route and visual-state screenshots at 1440, 1024, 768, 390, and 360 px.
- [ ] Test increased text size, keyboard-only use, screen readers, high contrast, reduced motion, and safe areas in the deployed build.
- [ ] Test the complete public → signup → email → onboarding → Free and paid flows.
- [ ] Test invitation → consent → relationship → system inclusion → revocation → resend flows.
- [ ] Run foundation, migrations, secrets, release configuration, typecheck, worker tests, web tests, builds, deploy dry-run, and live verification.
- [ ] Deploy only after reviewed diffs and exact-SHA health/readiness verification.
