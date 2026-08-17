# Sovereign.OS owner actions

Status: no standing manual release action is defined by this document.

The former instruction in this file asked the owner to trigger a Cloudflare Workers Build for a stale repository/deployment SHA. That instruction is superseded and must not be followed.

## Current release authority

Production release follows `docs/production-release.md` from the exact current `origin/main` SHA:

```bash
pnpm production:release:oauth
```

The release is complete only when the repository gates pass and both branded readiness endpoints prove the exact target SHA, migration `0015_release_evidence`, migration parity `current`, and matching release evidence.

## When owner action is actually required

Add an owner action here only when a current external account control cannot be completed by the repository-owned release path and the exact action, target resource, reason, and pass condition have been freshly verified.

Do not carry forward old build UUIDs, build-token UUIDs, deployed SHAs, dashboard paths, agent names, or manual trigger instructions as standing tasks.
