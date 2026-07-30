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
- Secrets exist only in Cloudflare Worker bindings or the Cloudflare build/deploy environment.
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
- Support contributions, when enabled later, remain one-time and entitlement-neutral unless the founder approves a different product.

## Reliability

- Cloudflare Workers Builds is green for the exact approved `main` commit.
- D1 migrations apply locally and remotely through `0013_workers_ai_free_capacity`.
- D1 Sessions preserve sequential API consistency and reject invalid bookmarks.
- Thread ordering survives concurrent requests.
- Invitation redemption and consent decisions are race-safe and one-time.
- Health checks cover code version, D1, Durable Objects, AI Gateway, Workers AI, Baseline provider, email, scheduled cleanup, Stripe, and adapter readiness without exposing secrets.
- `/ready` fails unless the daily AI capacity ledger exists.
- Traces correlate by thread and request ID.
- Request rate limits, bounded pagination, provider timeouts, Gateway privacy controls, API Shield, and the daily free-capacity budget are verified.
- Scheduled retention cleanup is tested at the 30-day and 90-day boundaries.
- Cloudflare Workers Builds verifies and deploys only the exact approved `main` commit.
- Migration compatibility and D1 backup evidence are recorded before the build deploys.
- Rollback instructions and the previous stable Worker version are documented.
- The production build is bound to the exact approved commit SHA and fails closed if live probes do not converge.
- GitHub Actions and ad-hoc local commands are not accepted as production release evidence.

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
- Disabled private-export, public-link sharing, deletion grace, immediate thread deletion, and scheduled retention evidence.
- Reviewed Terms and Privacy documents matching actual behavior.
- Cloudflare build UUID and post-deploy metadata for the exact commit.
- Previous stable Worker version.
- Migration list and D1 backup confirmation for the exact commit.
- Explicit founder approval before production deployment.