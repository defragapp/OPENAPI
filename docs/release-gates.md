# Release gates

The founder-approved launch boundary is defined in [`launch-product-contract.md`](launch-product-contract.md). Production deployment is prohibited until every applicable gate below passes for one exact current `origin/main` SHA. The executable release procedure is defined in [`production-release.md`](production-release.md).

## Product

- Today is useful without an incident prompt.
- Baseline and current amplification are visibly separated.
- The UI never claims known emotion or hidden intent.
- Primary user language is plain-language Baseline; astrology, Human Design, Gene Keys, numerology, and implementation detail are not required to understand the result.
- Pair analysis uses two real reduced Baseline datasets and requires active, identity-bound invitee consent.
- Family and team analysis uses participant-level Baseline context and materially changes the analysis.
- A workspace owner cannot grant consent on behalf of another person.
- Revocation immediately blocks future pair and system analysis.
- Covenant is a primary capability but remains explicit per question or thread.
- A Scripture lens is suggested subtly, retrieved from an approved source, and never presented as proof of motive, diagnosis, future behavior, or God's exact intent.
- Free remains a permanent first-party plan with 10 AI turns per UTC calendar month.
- Founder-approved support links remain publicly visible on the How it works and Questions surfaces.
- Support contributions are one-time, voluntary, and entitlement-neutral. They do not replace Free or Sovereign+ and do not purchase product access, ownership, influence, tax-deductible status, or future-feature commitments.

## Language and comprehension

- `product-language-system.md` remains the only user-facing language authority; no product, visual, strategy, or release document defines a competing hero, product promise, named model, or explanation of how Sovereign works.
- Baseline Design remains the foundation. The public experience begins from an ordinary real-life question, decision, relationship, or recurring situation and makes a useful distinction visible before exposing technical machinery.
- Relationship and system explanations extend the same Baseline-first intelligence outward while keeping every person distinct and permission-bound.
- Source calculations, Basis codes, provider details, permission mechanics, and deployment architecture remain beneath the primary explanation until needed for support, verification, control, or deeper inspection.
- The founder-locked root hero and visual sequence remain exact, while immediately adjacent copy makes the product category, interaction, and first action understandable.
- The required `Start with what’s actually happening.` recognition stage is visibly rendered; string presence in source or clipped accessibility-only text is not sufficient.
- Applicable self, relationship, system, Library, Expression Field, and Worlds surfaces inherit the same movement: capacity beneath the pattern, possible expression, what happens between people, and supported continuation or change conditions.
- Interpretive language preserves uncertainty: confirmed observations may use direct language; derived interpretations use possibility language and expose unknowns.
- Contribution is not presented as causation, feedback as blame, or multi-person context as evidence that harm is mutual.
- Expression Field and Alignment language remains qualitative and does not imply calibrated psychological precision.
- Audits, strategies, deployment markers, and historical release records are not treated as language or product authority.

## Security and privacy

- All mutations are authenticated.
- Cookie-authenticated mutations have CSRF protection.
- Invitation tokens are random, one-time, hashed at rest, time-limited, and delivered only to the invitee.
- Consent decisions are attributed to the authenticated invited account, scope, invitation, policy version, and time.
- Pair and system reads re-check consent on every use.
- Stripe signatures and timestamps are verified.
- Webhooks and thread turns are idempotent.
- All D1 queries use bound parameters.
- Secrets exist only in Cloudflare Worker bindings or protected release credentials.
- The disabled private-export boundary, public-link sharing, and deletion are tested.
- Unsaved thread content expires after 30 days.
- Minimal security and operational audit metadata without conversation content expires after 90 days unless a documented incident or legal hold applies.
- Explicitly saved Library understandings remain until user deletion or account closure.
- Logs and traces contain no full prompts, raw birth input, exact private location, hidden reasoning, provider credentials, or unconsented person data.

## AI behavior

- Structured output is parsed, schema-validated, and safety-validated before it is displayed or persisted as an accepted response.
- Streaming never exposes content that has not passed the required public-output boundary.
- Every participant retains separate Baseline, Current, Observed, Role Context, and Unknown fields.
- System analysis never merges participants into a group diagnosis or assigns a villain.
- Provenance and uncertainty remain available for verification without exposing private implementation details in the primary explanation.
- Production uses the Cloudflare Workers AI binding through AI Gateway with approved model `@cf/zai-org/glm-4.7-flash`.
- Personalized inference bypasses Gateway cache and persistent prompt logging.
- Model or provider changes require privacy review, cost review, latency testing, structured-output evaluation, and relational-safety evals.
- Failed or capacity-blocked inference does not consume the user's monthly turn.
- The D1-backed daily reservation ledger stops inference before the account-wide Workers AI free allocation is exhausted.

## Billing

- Free access works without creating a Stripe customer or subscription.
- Sovereign+ monthly and annual Checkout work in Stripe test mode.
- Webhooks project active and trialing subscriptions to Sovereign+ and all other relevant states safely to Free.
- Protected endpoints enforce entitlements server-side.
- Cancellation or payment failure does not delete the workspace.
- Billing Portal returns to the authenticated application.
- The two public donation Payment Links remain active and use one-time custom-amount prices.
- Donation Payment Links remain outside the subscription entitlement projection path.
- Public support copy explicitly states that contributions grant no access or subscription benefits and are not presented as tax-deductible.

## Reliability

- The exact current `origin/main` SHA is selected by `pnpm production:release:oauth` and the checkout is rejected if it does not match that authority.
- The OAuth release wrapper establishes a fresh current-member Wrangler credential and uses it for direct Cloudflare and Browser Rendering checks without printing or persisting it.
- `pnpm verify:cloudflare-build` is green for the exact target SHA before the internal deploy stage runs.
- `pnpm production:deploy` remains an internal stage of the canonical OAuth release rather than a separate authority.
- D1 migrations apply locally and remotely through `0015_release_evidence`; `0013_workers_ai_free_capacity` remains the historical capacity-ledger foundation.
- D1 Sessions preserve sequential API consistency and reject invalid bookmarks.
- Thread ordering survives concurrent requests.
- Invitation redemption and consent decisions are race-safe and one-time.
- Health checks cover code version, D1, Durable Objects, AI Gateway, Workers AI, Baseline provider, email, scheduled cleanup, Stripe, and adapter readiness without exposing secrets.
- `/ready` fails unless the daily AI capacity ledger exists.
- Traces correlate by thread and request ID.
- Request rate limits, bounded pagination, provider timeouts, Gateway privacy controls, API Shield, and the daily free-capacity budget are verified.
- Scheduled retention cleanup is tested at the 30-day and 90-day boundaries.
- Both branded `/ready` endpoints report `ready: true`, the exact target SHA, migration `0015_release_evidence`, migration parity `current`, and `releaseEvidence.sha` equal to the target SHA.
- Migration compatibility and D1 backup evidence are recorded when applicable before production mutation.
- Rollback instructions and the previous stable Worker version are documented.
- The production release fails closed if live probes do not converge.
- GitHub Actions, deploy hooks, Cloudflare Pages, preview Workers, duplicate Workers, historical Workers Builds trigger instructions, and alternate repositories are not accepted as production release evidence.

## UX

- iPhone safe areas are respected.
- Touch targets are at least 44px.
- Text remains readable at increased browser text size.
- Pinch zoom is not disabled.
- The composer remains visible above the keyboard.
- Private API responses are not cached by the service worker.
- The invitee sees exactly which scopes are requested and controls each decision.
- The owner sees invitation and consent state but no control that grants another person's consent.
- Pair and system actions explain why they are unavailable when identity, consent, Baseline data, or entitlement is missing.
- The primary result includes a clear summary, practical next move, words the user can use, uncertainty, and optional deeper actions.
- Covenant can be enabled and disabled without obscuring the grounded answer.
- Donation actions use Stripe-hosted pages, are visually separated from subscription CTAs, and explain that no entitlement is granted.

## Approval evidence

- Exact target `origin/main` SHA and repository gate evidence.
- Desktop and iPhone screenshots of public, authentication, Today, Explore, People, Systems, Library, You, and Covenant states where applicable.
- Browser Rendering landing screenshots and report for the required desktop/mobile viewports.
- Browser Rendering route-cohesion screenshots and report.
- Browser smoke for invite, redeem, grant, compare, system overlay, revoke, and blocked-after-revocation when those flows are in scope.
- A three-person family or team overlay using consented reduced Baseline fixtures.
- Free allowance, paid upgrade, cancellation, and Free fallback smoke evidence.
- Both founder-approved donation links resolve to active Stripe-hosted donation pages and preserve entitlement-neutral metadata.
- Disabled private-export, public-link sharing, deletion grace, immediate thread deletion, and scheduled retention evidence.
- Reviewed Terms and Privacy documents matching actual behavior.
- Both branded `/ready` responses proving the exact deployed SHA and release evidence.
- Previous stable Worker version.
- Migration list and D1 backup confirmation when applicable.
- Explicit founder approval before production deployment.
