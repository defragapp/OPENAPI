# Release gates

## Product

- Today is useful without an incident prompt.
- Baseline and current amplification are visibly separated.
- The UI never claims known emotion or hidden intent.
- Pair analysis requires consent.
- Family and team context materially change analysis.
- Covenant is opt-in.

## Security

- All mutations are authenticated.
- Cookie-authenticated mutations have CSRF protection.
- Stripe signatures and timestamps are verified.
- Webhooks and thread turns are idempotent.
- All D1 queries use bound parameters.
- Secrets exist only in Worker bindings or CI secrets.
- Export and deletion are tested.

## Reliability

- D1 migrations apply locally and remotely.
- Thread ordering survives concurrent requests.
- Health checks cover code version, D1, and adapter reachability.
- Traces correlate by thread and request ID.
- Rollback instructions are documented.

## UX

- iPhone safe areas are respected.
- touch targets are at least 44px.
- text remains readable at increased browser text size.
- pinch zoom is not disabled.
- the composer remains visible above the keyboard.
- private API responses are not cached by the service worker.
