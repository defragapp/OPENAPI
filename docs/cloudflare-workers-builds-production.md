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
- `/ready` must report `ready=true`, the exact deployed commit, and migration `0013_workers_ai_free_capacity`.
- Closed, draft, experimental, and `ops/*` branches are never production sources and must not retain an alternative deployment workflow.
- Do not use `chatthread-app`, `defragapp/SOVV`, a Pages deployment, a preview Worker, or an external design preview as a production signal for Sovereign.OS.
- Do not retain a deploy hook that points to an unknown or retired repository or branch. Delete it and recreate it only after the Git connection is verified.
- A release is incomplete until the Worker development endpoint, `sovereign.defrag.app`, and `app.defrag.app` all report the same exact commit and `ready=true`.

The Worker configuration is defined in `wrangler.production-direct.jsonc`. The repository release gate is `pnpm verify:cloudflare-build`; the deploy-and-live-verification entry point is `pnpm production:deploy`.
