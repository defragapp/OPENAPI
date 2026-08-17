# Historical Cloudflare Workers Builds production wiring

Status: historical operational reference. This file no longer defines production release authority.

The production repository and Worker remain:

- repository: `defragapp/OPENAPI`;
- branch authority: `main`;
- Worker: `sovv-web`;
- public domain: `https://sovereign.defrag.app`;
- app/API domain: `https://app.defrag.app`;
- current migration: `0015_release_evidence`.

Earlier releases used Cloudflare Workers Builds triggers and build-token wiring. Those records are retained only to explain historical deployments and incidents.

## Current authority

The current production release procedure is `docs/production-release.md` and the executable entry point is:

```bash
pnpm production:release:oauth
```

The wrapper selects the exact current `origin/main` SHA, establishes a fresh Wrangler current-member OAuth session, runs `pnpm verify:cloudflare-build`, executes the internal `pnpm production:deploy` stage, and verifies exact-SHA readiness and release evidence on both branded domains.

Do not use a historical Workers Builds trigger, `build_token_uuid`, manual Builds API POST, deploy hook, or old build UUID as current release authority or as proof that production is complete.

GitHub Actions, Cloudflare Pages, preview Workers, duplicate Workers, and alternate repositories remain outside production authority.

## Historical evidence

Old Workers Builds UUIDs, trigger configuration, and build-token investigations may still be useful when reconstructing a past deployment. They must be interpreted as dated evidence only and must not override the live release scripts, `docs/production-release.md`, or exact `/ready` evidence from the current production domains.
