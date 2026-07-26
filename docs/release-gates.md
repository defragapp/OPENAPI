# Release gates

The founder-approved launch boundary is defined in [`launch-product-contract.md`](launch-product-contract.md). Production deployment is prohibited until every applicable gate below passes for one exact commit SHA.

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
- Support contributions grant no entitlements and are not placed in the approval candidate without a separate founder decision.

## Security and privacy

- All mutations are authenticated.
- Cookie-authenticated mutations have CSRF protection.
- Invitation tokens are random, one-time, hashed at rest, time-limited, and delivered only to the invitee.
- Consent decisions are attributed to the authenticated invited account, scope, invitation, policy version, and time.
- Pair and system reads re-check consent on every use.
- Stripe signatures and timestamps are verified.
- Webhooks and thread turns are idempotent.
- All D1 queries use bound parameters.
- Secrets exist only in Worker bindings or CI secrets.
- Export and deletion are tested.
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
- Model or provider changes require privacy review, cost review, latency testing, structured-output evaluation, and relational-safety evals.

## Billing

- Free access works without creating a Stripe customer or subscription.
- Sovereign+ monthly and annual Checkout work in Stripe test mode.
- Webhooks project active and trialing subscriptions to Sovereign+ and all other relevant states safely to Free.
- Protected endpoints enforce entitlements server-side.
- Cancellation or payment failure does not delete the workspace.
- Billing Portal returns to the authenticated application.
- Support contributions, when enabled later, remain one-time and entitlement-neutral unless the founder approves a different product.

## Reliability

- CI or Cloudflare Workers Builds is green for the exact preview commit.
- D1 migrations apply locally and remotely.
- Thread ordering survives concurrent requests.
- Invitation redemption and consent decisions are race-safe and one-time.
- Health checks cover code version, D1, Durable Objects, AI Gateway, Baseline provider, email, queues, Stripe, and adapter readiness without exposing secrets.
- Traces correlate by thread and request ID.
- Request rate limits, bounded pagination, provider timeouts, and spend limits are verified.
- Scheduled retention cleanup is tested at the 30-day and 90-day boundaries.
- A production version is uploaded without receiving traffic before promotion.
- Migration compatibility and D1 backup evidence are recorded separately from Worker version promotion.
- Rollback instructions, the previous Worker version, and its rollback version ID are documented.
- Production promotion is bound to the exact uploaded version ID and exact approved commit SHA.

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

## Approval evidence

- Protected preview URL tied to the exact green commit SHA.
- Desktop and iPhone screenshots of public, authentication, Today, Explore, People, Systems, Library, You, and Covenant states.
- Browser smoke for invite, redeem, grant, compare, system overlay, revoke, and blocked-after-revocation.
- A three-person family or team overlay using consented reduced Baseline fixtures.
- Free allowance, paid upgrade, cancellation, and Free fallback smoke evidence.
- Export, deletion grace, immediate thread deletion, and scheduled retention evidence.
- Reviewed Terms and Privacy documents matching actual behavior.
- Production candidate metadata containing the exact uploaded version ID.
- Previous stable Worker and rollback version ID.
- Migration list and D1 backup confirmation for the exact commit.
- Explicit founder approval before production deployment.
