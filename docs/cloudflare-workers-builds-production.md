# Cloudflare Workers Builds production wiring

Production source: `defragapp/OPENAPI`

Worker: `sovv-web`

Branch: `main`

Repository root: `/`

Build command:

```sh
corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build
```

Deploy command:

```sh
pnpm production:deploy
```

Required production release contract:

- Cloudflare Workers Builds is the only automatic production authority.
- A push to `main` triggers the connected production build. Non-production branch builds remain disabled.
- Cloudflare must supply the full source commit through `WORKERS_CI_COMMIT_SHA` or `GITHUB_SHA`.
- The deploy process applies D1 migrations, deploys `wrangler.production-direct.jsonc`, and verifies the exact live release.
- `/health` must report the exact deployed commit.
- `/ready` must report `ready=true`, the exact deployed commit, and migration `0015_release_evidence`.
- Closed, draft, experimental, and `ops/*` branches are never production sources and must not retain an alternative deployment workflow.
- Do not use `chatthread-app`, `defragapp/SOVV`, a Pages deployment, a preview Worker, or an external design preview as a production signal for Sovereign.OS.
- Do not retain a deploy hook that points to an unknown or retired repository or branch. Delete it and recreate it only after the Git connection is verified.
- A release is incomplete until `sovereign.defrag.app` and `app.defrag.app` report the same exact commit and `ready=true`.
- The retired `sovv-web.sovereign-os-api.workers.dev` hostname must remain unavailable because production sets both `workers_dev` and preview URLs to `false`.

## Builds API maintenance

Workers Builds trigger inspection, repair, and manual build creation require a user-scoped Cloudflare API token with `Workers Builds Configuration: Edit`; account-scoped tokens are rejected by the Builds API. This management credential is separate from the build token selected by the trigger. The production trigger's `build_token_uuid` must reference an active build token before an exact-SHA build is started.

The Worker configuration is defined in `wrangler.production-direct.jsonc`. The repository release gate is `pnpm verify:cloudflare-build`; the deploy-and-live-verification entry point is `pnpm production:deploy`.
