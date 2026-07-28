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

- Cloudflare must supply the full source commit through `WORKERS_CI_COMMIT_SHA` or `GITHUB_SHA`.
- The deploy process applies D1 migrations, deploys `wrangler.production-direct.jsonc`, and verifies the exact live release.
- `/health` must report the exact deployed commit.
- `/ready` must report `ready=true`, the exact commit, and migration `0011_email_code_recovery`.
- Do not use `chatthread-app`, `defragapp/SOVV`, or a Pages deployment as a production signal for Sovereign.OS.
- Do not retain a deploy hook that points to an unknown or retired repository/branch. Delete it and create a new hook after the Git connection is verified.

The Worker configuration is defined in `wrangler.production-direct.jsonc`. The repository release gate is `pnpm verify:cloudflare-build`; the deploy-and-live-verification entry point is `pnpm production:deploy`.
