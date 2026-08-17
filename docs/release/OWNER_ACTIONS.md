# Sovereign.OS owner actions

Status: no standing manual release action is defined by this document.

Historical instructions in this file that asked the owner to trigger a stale Workers Build are superseded and must not be followed.

## Current release authority

Production follows `docs/production-release.md` from one exact current `origin/main` SHA.

For the current text-first launch:

```bash
pnpm verify:cloudflare-build
pnpm production:release:text
```

The second command is run only for the same SHA that passed the full gate.

A technical release is complete only when both branded readiness endpoints prove the exact target SHA, `ready: true`, migration `0017_privacy_access_and_eligibility`, migration parity `current`, configured policy/privacy dependencies, and matching release evidence.

Automated Browser audit fields in release evidence are truthful booleans. They remain `false` when the current text-first release intentionally does not run Browser Rendering.

## When owner action is actually required

Add an owner action here only when a current external account control cannot be completed by repository-owned release/product flows and the exact action, target resource, reason, and pass condition have been freshly verified.

Examples may include a provider-account permission/billing setting that cannot be expressed in source. Such an item must be classified as launch-blocking or non-blocking in the relevant current GitHub task.

Do not carry forward old build UUIDs, build-token UUIDs, stale SHAs, dashboard paths, agent names, manual trigger instructions, or video-provider activation as standing tasks.

Worlds/video activation is not a current owner action; #198 is closed `not planned` for this launch.
