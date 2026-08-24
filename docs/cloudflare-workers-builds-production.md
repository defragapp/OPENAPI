# Historical Cloudflare Workers Builds production wiring

Status: historical operational reference only. This file does not define current production release authority.

Earlier Sovereign.OS releases used Cloudflare Workers Builds triggers and build-token wiring. Those records are retained only to explain past deployments/incidents.

## Current production facts

- repository: `defragapp/OPENAPI`;
- branch authority: exact current `origin/main`;
- Worker: `sovv-web`;
- public domain: `https://sovereign.defrag.app`;
- authenticated app/API: `https://app.defrag.app`;
- current candidate schema: `0018_workers_ai_capacity_reservations` after immutable deployed `0017_privacy_access_and_eligibility`;
- private export: on-demand/no-artifact;
- current launch: text-first; Worlds/video not active.

## Current authority

Current procedure is `docs/production-release.md`.

For the text-first launch:

```bash
pnpm verify:cloudflare-build
pnpm production:release:text
```

The same exact current `origin/main` SHA must pass the full gate before the release command performs one production deploy and exact-SHA convergence.

`pnpm production:release:oauth` remains optional Browser-audited machinery when explicitly requested.

Do not use a historical Workers Builds trigger, `build_token_uuid`, manual Builds API POST, deploy hook, old build UUID, or old connected-build status as current release authority or proof that production is complete.

GitHub Actions, Cloudflare Pages, preview Workers, duplicate Workers, and alternate repositories remain outside production authority.

## Historical evidence rule

Old Workers Builds UUIDs, trigger configuration, and build-token investigations may be useful only when reconstructing a past incident/release. Interpret them as dated evidence and never let them override current release scripts, `docs/production-release.md`, current D1 schema, or live exact-SHA `/ready` evidence.
