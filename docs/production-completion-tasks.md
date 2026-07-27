# #tasks — Sovereign.OS production completion

Updated after each completed implementation tranche.

## Current release baseline

- Production SHA before this work: `c96ccd6966c6dbab3f0a336fa90b4fce591e7a5a`
- Active implementation PR: `#55`
- The previous release build, tests, static-page verification, runtime security checks, and Stripe endpoint contracts passed.
- GitHub-hosted Actions currently fail before allocating a runner or executing the first zero-dependency step. Cloudflare’s connected production build remains the full executable release gate until that runner issue is resolved.
- Remaining work is concentrated in first-use guidance, context integrity, structured intelligence, user controls, visual consistency, recovery, billing support, and discoverability.

## Account access and communication — implemented in PR #55, pending release verification

- [x] Fix the live sign-in error path so the UI distinguishes verification, invalid email, rate limit, provider, and unexpected failures.
- [x] Center and tightly contain Cloudflare Turnstile on login and signup at desktop and mobile sizes.
- [x] Make Turnstile loading, verified, expired, unsupported, and failure states visible, accessible, and actionable.
- [x] Preserve an allowlisted `returnTo` through link creation and redemption.
- [x] Add premium branded HTML and plain-text templates for sign-in, signup, and relationship invitations.
- [x] Keep email actions on HTTPS Sovereign.OS hosts and include expiry, one-time-use, security, privacy, support, and do-not-forward context.
- [x] Keep private relationship labels, raw birth details, exact location, account history, and internal identifiers out of invitation emails.
- [x] Replace pattern-heavy and generic authentication copy with approved Baseline-first Sovereign.OS language.
- [x] Add focused tests for return routing, branded email rendering and escaping, Turnstile lifecycle, account copy, field errors, and visual containment.
- [ ] Pass the full Cloudflare build and live verification for PR #55.

## Product integrity — one Sovereign intelligence

- [x] Keep Today, Explore, People, Systems, Library, and You mounted as surfaces of one Sovereign intelligence rather than separate applications.
- [ ] Present Defrag, Alignment, and Covenant as internal modes/lenses selected by the question and user intent.
- [ ] Give signed-in users an unmistakable first action instead of presenting six equal destinations without guidance.
- [ ] Add a guided entry on Today: understand myself, examine a choice, understand a relationship, or map a system.
- [ ] Bind every thread and response to its stored surface/mode.
- [ ] Restore surface, selected person, selected system, Covenant state, and permitted context when reopening a thread.
- [ ] Prevent changing a tab from relabeling or visually reinterpreting an existing response.
- [ ] Preserve real Today, People, and system-member data in post-response visual components.
- [ ] Use contextual suggestions and plain-language explanations so users never need specialized prompting.

## Structured intelligence and visual truth

- [ ] Implement a validated structured `SovereignResponse` contract.
- [ ] Separate deterministic Baseline and Live Sky data from model interpretation.
- [ ] Replace alignment keyword scoring and response-length confidence with structured factors and explicit uncertainty.
- [ ] Render Baseline, shadow/light, alignment, relationship, system, Covenant, unknowns, and continuation options as distinct components.
- [ ] Preserve a plain-language fallback when structured validation fails without duplicate billing or usage.
- [ ] Add tests for motive uncertainty, non-diagnostic language, schema fallback, Covenant separation, and confidence semantics.

## User control and continuity

- [ ] Expose People & Permissions management from the mounted workspace.
- [ ] Support invitation review, cancellation, resend, scope review, revocation, and relationship removal.
- [ ] Add Library rename, delete, context review, and correction history.
- [ ] Add visible account deletion with the documented 14-day grace period.
- [ ] Add privacy, terms, support, billing, and permission controls to You.
- [ ] Make fit/correction choices visibly persistent after saving.
- [ ] Add keyboard focus management and focus traps to modal dialogs.

## Premium visual and brand system

- [ ] Refine a recognizable Sovereign mark derived from the Baseline orbit and use it consistently.
- [ ] Standardize warm-black, paper, copper, sage, rose, spacing, radii, typography, and semantic color roles.
- [ ] Refine the landing-page transition and visual story from personal to relationship to system intelligence.
- [ ] Build signature Baseline Orbit, Relationship Perspective, and System Intelligence assets.
- [ ] Keep body text at 17 px where practical, supporting text at least 14 px, and controls at least 44 px.
- [ ] Audit all empty, loading, success, error, disabled, hover, focus, and reduced-motion states.
- [ ] Add controlled Open Graph/social images, canonical metadata, sitemap, and robots guidance.
- [ ] Add a complete mobile public navigation rather than hiding non-CTA links.

## Account access and recovery roadmap

- [ ] Add passkeys/WebAuthn as the preferred passwordless return path.
- [ ] Evaluate Google and Apple sign-in for lower-friction onboarding.
- [ ] Add an email one-time-code fallback for clients that break magic-link continuity.
- [ ] Evaluate SMS recovery only after abuse controls, verified phone ownership, provider cost, consent, regional compliance, and account-recovery threat modeling are documented.
- [ ] Never use SMS as the sole recovery factor.

## Email and domain trust

- [ ] Verify Resend/Cloudflare sender-domain alignment, SPF, DKIM, and DMARC in the live provider configuration.
- [x] Use a consistent Sovereign.OS sender name, reply-to, support address, visual system, accessible HTML, and plain-text fallback.
- [ ] Add branded templates for permission changes, billing, cancellation, and account deletion; sign-in, signup, and invitations are complete in PR #55.
- [x] Keep security tokens only in the required private action URL; exclude private context, raw birth data, exact location, private labels, and internal identifiers.
- [x] Add content tests for HTML and text variants, escaping, and unsafe action URLs.

## Billing and public support

- [ ] Re-verify Free and Sovereign+ entitlements against public pricing and Terms.
- [ ] Verify checkout, success, cancellation, customer portal, downgrade, and webhook idempotency end to end.
- [ ] Add a clearly separate development-support/donation option to appropriate static pages only after provider, tax language, refund language, and non-entitlement wording are confirmed.
- [ ] Never imply that a donation purchases product access, influence, or future features.

## Security and operational hardening

- [x] Validate Turnstile hostname and action, classify token expiration/reuse, reset rejected tokens, and record privacy-safe mismatch events.
- [x] Preserve generic account-enumeration-safe responses while giving the current user useful local guidance.
- [x] Preserve 15-minute magic-link expiry, one-time redemption, and allowlisted post-auth return routing.
- [ ] Verify session rotation, logout invalidation, CSRF assumptions, and magic-link behavior in the live release.
- [ ] Review rate limits for sign-in, signup, invitations, checkout, AI turns, and consent changes.
- [ ] Add abuse-safe audit events without storing message content or secrets.
- [ ] Verify CSP, HSTS, frame denial, noindex rules, caching, and custom-domain redirects after each release.

## Release QA

- [ ] Restore mandatory pull-request CI after the GitHub-hosted runner can execute its first step; two probe runs failed before runner allocation.
- [ ] Add automated route and visual-state coverage at 1440, 1024, 768, 390, and 360 px.
- [ ] Test increased text size, keyboard-only use, screen readers, high contrast, reduced motion, and safe areas.
- [ ] Test the complete public → signup → email → onboarding → Free and paid experience.
- [ ] Test invitation → consent → relationship → system inclusion → revocation flows.
- [ ] Run foundation, migrations, secrets, release configuration, typecheck, worker tests, web tests, builds, deploy dry-run, and live verification.
- [ ] Deploy only after reviewed diffs and exact-SHA health/readiness verification.
