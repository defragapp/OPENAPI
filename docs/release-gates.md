# Release gates

Status: current launch acceptance checklist.

The founder-approved product boundary is defined in `launch-product-contract.md`. User-facing language inherits `product-language-system.md`. Executable production release authority is defined in `production-release.md`.

The current launch is text-first. Video/Worlds generation is not required. Live Browser Rendering is optional evidence, not a core release requirement; human desktop/iPhone review remains required.

## Product

- Today is useful without an incident prompt.
- Baseline and temporary current context are visibly separated.
- The UI never claims known emotion, hidden motive, diagnosis, destiny, or deterministic outcome.
- Primary user language is plain-language Baseline; source-framework machinery is secondary.
- The authenticated product is one canonical text thread in `SovereignIntelligenceWorkspace`.
- The thread presents the direct answer first, then relevant structured explanation, quiet Basis/provenance, and correction/continuation.
- Pair analysis uses two real reduced Baseline datasets and requires active identity-bound invitee permission.
- A workspace owner cannot grant consent on behalf of another person.
- Revocation immediately blocks future use of the revoked shared context.
- Systems preserve distinct participants, supplied/confirmed roles, responsibility, authority, pressure, and unknown perspectives.
- Covenant remains explicit per question/thread and grounded in verified Scripture context.
- Free remains permanent with 10 AI turns per UTC month.
- Sovereign+ remains $20/month or $99/year with 300 turns per UTC month and server-enforced paid capabilities.
- Founder-approved support links remain voluntary and entitlement-neutral.
- Worlds/video generation remains absent from the current core launch runtime.

## Account, policy, and privacy

- Signup links the exact current Terms and Privacy Policy before acceptance.
- Signup requires separate 18+ launch-eligibility confirmation.
- Policy acceptance is bound to the exact current version/hash/release evidence.
- Material policy updates can require re-review before normal private product use.
- Export, deletion, logout, and bounded billing/account rights remain available through the documented policy gate.
- Current schema is `0017_privacy_access_and_eligibility`.
- Private export is authenticated, on-demand, account-scoped, private/no-store, and not retained as an artifact.
- R2 and Queue remain disabled.
- Unsaved thread content/complete answers follow the 30-day cleanup policy.
- Minimal security/operational metadata without conversation content follows the documented 90-day boundary unless a documented exception applies.
- Library understanding remains until user deletion/account closure.
- Raw birth input, exact private location, auth material, billing IDs, invitation secrets, unrelated history, and hidden reasoning do not enter model context/logs.
- No undeclared behavioral advertising/tracking SDK is active.

## Security and consent

- Private APIs and protected documents require valid authentication.
- Cookie-authenticated mutations preserve same-origin/CSRF protections.
- Invitation links are random, one-time, hashed at rest, time-limited, and delivered only to the invitee.
- Consent decisions are identity-bound, scope-specific, auditable, and rechecked on use.
- `framework.display` remains separate from other shared-use scopes.
- Stripe signatures/timestamps are verified before entitlement projection.
- Webhooks and thread turns are idempotent.
- D1 queries remain parameter-bound.
- Secrets remain only in protected provider/Worker configuration.
- Logs/traces exclude prohibited sensitive content.

## AI behavior

- Structured output is schema/safety validated before accepted display/persistence.
- Every participant retains separate Baseline, Current, Observed, Role Context, and Unknown state.
- Relationship/System analysis never merges participants into a group diagnosis or assigns a villain.
- Basis values are server-authorized; the model never writes exact display values.
- Alignment remains qualitative and never becomes a score/percentage/gauge.
- Production inference uses Cloudflare Workers AI through AI Gateway with model `@cf/zai-org/glm-4.7-flash`.
- Personalized inference bypasses Gateway cache and persistent request-content logging.
- Failed/capacity-blocked inference follows the documented turn-refund behavior.
- The D1-backed daily reservation ledger stops inference before the account-wide Workers AI allocation is exhausted.
- Deterministic grounded/urgent/secure-refusal responses suppress normal Basis/actions as designed.

## Billing

- Free works without creating a Stripe subscription.
- Monthly and annual Sovereign+ Checkout use the configured server-side Stripe products/prices.
- Paid access is granted only from signed/server-confirmed Stripe state.
- Billing Portal returns to the authenticated application.
- Cancellation/payment failure safely falls back to Free without deleting the workspace.
- Public support links remain outside entitlement projection.

## Reliability and production release

- Exact current `origin/main` SHA is selected and verified before mutation.
- `pnpm verify:cloudflare-build` is green for the exact candidate SHA.
- The same SHA is released through `pnpm production:release:text` for the current text-first launch.
- The release path performs exactly one Worker deploy.
- D1 migrations apply through `0017_privacy_access_and_eligibility`.
- D1 Sessions/read replication, Durable Object sequencing, AI Gateway, rate limiting, API Shield, Resend, Stripe, scheduled cleanup, and bundle limits remain verified by repository/runtime checks.
- API Shield endpoint comparison normalizes Cloudflare positional `{varN}` parameter templates before declaring a missing operation.
- The release path never deletes an unrelated Free-plan rate-limit rule to make room for Sovereign.OS.
- Both branded `/ready` endpoints report `ready: true`, exact target SHA, migration `0017_privacy_access_and_eligibility`, migration parity `current`, configured policy receipts/privacy controls, and matching release evidence.
- Private export state is reported as on-demand/no-artifact where the readiness contract exposes it.
- Production evidence fails closed if exact-SHA readiness/evidence does not converge.
- GitHub Actions, deploy hooks, Pages, preview Workers, duplicate Workers, historical Workers Builds triggers, and alternate repositories are not accepted release evidence.

## Release-evidence provenance

`sovereign-production-release-evidence.v1` must describe what actually ran.

- `routeCohesionVerified=true` only when the automated Browser route-cohesion audit ran and passed.
- `renderedVisualVerified=true` only when the automated Browser rendered-visual audit ran and passed.
- `pnpm production:release:text` intentionally records those automated Browser fields as `false`.
- `false` means that evidence type was not used; it does not by itself make `/ready` unhealthy.
- Human desktop/iPhone QA is separate acceptance evidence and may never be represented by setting automated Browser flags to `true`.

`pnpm production:release:oauth` and the individual live Browser audit commands remain optional when explicitly requested.

## UX and human device acceptance

- Founder root composition/language remain recognizable and coherent.
- `Start with what’s actually happening.` remains a visible product-recognition stage.
- Authenticated conversation is visually primary rather than a dashboard of small cards.
- User turns, Sovereign answers, direct answer, sections, Basis, corrections, and actions have clear hierarchy.
- iPhone safe areas are respected.
- Touch targets are at least 44 CSS px where applicable.
- Text remains readable at increased browser text size.
- Pinch zoom is not disabled.
- Composer remains visible/usable above the software keyboard.
- No horizontal overflow/clipped critical content.
- Focus treatment/order and keyboard/touch equivalents remain usable.
- Reduced-motion mode preserves state/comprehension.
- Invitation scope decisions remain understandable and controlled by the invitee.
- Error, loading, empty, policy-gated, billing-pending, and unavailable states remain specific and recoverable.

## Real production journey evidence

Final acceptance requires real production execution—not only fixtures—for the bounded #207 task graph:

- #210: Account → policy/18+ → Plan → Baseline → Workspace → first `sovereign-answer.v2`.
- #211: email/passkey/recovery/session/billing/account lifecycle.
- #212: invitation → selective consent → relationship → System → revoke → future use blocked/excluded.
- #213: representative text AI modes, Basis, current context, Covenant, failure/capacity/safety.
- #214: human desktop + iPhone/Safari/PWA visual/interaction/accessibility QA.
- #208: live privacy/consent behavior and separation of external governance evidence.
- #215: current documentation/release authority free of contradictions.
- #216: one final PASS/FAIL/N/A stability matrix and `100%` sign-off.

## Final approval

Do not claim `100% production ready` while a P0/P1 product defect remains or while a required real journey has not been executed. Optional post-launch/provider-account items may remain only when #216 explicitly classifies them as non-blocking and they do not contradict the live product or public claims.
