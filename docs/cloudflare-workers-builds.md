# Cloudflare Workers Builds release path

This repository does not require GitHub Actions for build or deployment. The supported free-plan path is Cloudflare Workers Builds connected directly to the public GitHub repository.

## Connect the repository

In Cloudflare:

1. Open **Workers & Pages**.
2. Choose **Create application** or **Import a repository**.
3. Connect GitHub and select `defragapp/OPENAPI`.
4. Use `main` as the production branch.
5. Disable non-production branch builds. `main` remains the only release source.
6. Leave the root directory at the repository root.

## Build configuration

Use these commands exactly:

- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm preview:bootstrap`

The deploy command creates or reuses the isolated preview D1 database, applies all remote migrations, deploys the dedicated `sovereign-openapi-preview` Worker, provisions its draft R2 and Queue bindings, uploads configured runtime secrets in one bulk operation, performs a final exact-commit deployment, and records the Cloudflare build UUID and Git commit SHA.

## Build token permissions

The default Workers Builds token does not include every permission required by this repository. Use one consistent **user-scoped** build token and ensure it has these account permissions for account `8b1954d216d65077c6480d62583fe2c2`:

- Account Settings Read
- Workers Scripts Edit
- Workers R2 Storage Edit
- D1 Edit
- Queues Edit
- Workers AI Read

Keep the standard user permissions used by Workers Builds:

- User Details Read
- Memberships Read

Workers Routes Edit is only needed for zone routes. This preview deploys only to its dedicated `workers.dev` hostname and must not modify `defrag.app`.

Without **D1 Edit**, the bootstrap cannot create or migrate the preview database. Without **Queues Edit** and **Workers R2 Storage Edit**, resource provisioning may fail during `wrangler deploy`.

## Build variables and secrets

Add these under the Worker's **Settings > Build > Variables and secrets**.

Required secret:

- `PREVIEW_SESSION_SIGNING_SECRET` — a long random value used only by the preview application.

Required build variable:

- `PREVIEW_BASE_URL=https://sovereign-openapi-preview.sovereign-os-api.workers.dev`

Recommended build variables:

- `PREVIEW_WORKER_NAME=sovereign-openapi-preview`
- `PREVIEW_D1_NAME=sovereign-openapi-preview-db`
- `CLOUDFLARE_WORKERS_SUBDOMAIN=sovereign-os-api`
- `AI_PROVIDER=cloudflare-gateway`
- `AI_MODEL=openai/gpt-5.5`
- `AI_GATEWAY_ID=sovereign`
- `SCRIPTURE_TRANSLATION=WEB`

Cloudflare automatically supplies:

- `WORKERS_CI=1`
- `WORKERS_CI_BUILD_UUID`
- `WORKERS_CI_COMMIT_SHA`
- `WORKERS_CI_BRANCH`

Stripe test-mode variables and secrets for billing verification:

- `STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY`
- `STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL`
- `STRIPE_SECRET_KEY` — test-mode secret only
- `STRIPE_WEBHOOK_SECRET` — test endpoint secret only

Optional integration values:

- `SOVV_BASE_URL`
- `SOVV_INTERNAL_AUTH_TOKEN`

Never place these values in GitHub files, public issue comments, build summaries, or unencrypted runtime variables.

## Expected preview resources

One successful deploy must produce or reuse exactly these preview resources:

- Worker: `sovereign-openapi-preview`
- URL: `https://sovereign-openapi-preview.sovereign-os-api.workers.dev`
- D1: `sovereign-openapi-preview-db`
- Queue: `sovereign-openapi-preview-jobs`
- R2 binding: `ARTIFACTS`
- Queue binding: `JOBS`
- D1 binding: `DB`
- Durable Object binding: `THREADS`
- Workers AI binding: `AI`
- static assets binding: `ASSETS`

Do not create duplicate resources when the named preview resource already exists.

## Protect the preview

After the first successful deployment:

1. Open **Workers & Pages > sovereign-openapi-preview**.
2. Open **Settings > Domains & Routes**.
3. For the `workers.dev` route, select **Enable Cloudflare Access**.
4. Permit only `defragapp@gmail.com` and an optional service-token policy used for automated smoke checks.
5. Keep versioned Preview URLs disabled. The dedicated preview Worker is the review target.
6. Do not change any production route or `defrag.app` Worker.

Cloudflare Access is the founder-review perimeter. It is not the customer subscription paywall. Application sessions, consent rules, and server-side Stripe entitlements remain separate.

## Completion evidence

A release is not complete until one exact `main` commit has all of the following:

- successful Cloudflare build log and build UUID;
- frozen dependency install;
- migration validation and remote migration replay;
- secret and fixture scans;
- typecheck and tests;
- web and Worker build;
- authentication, Baseline, jobs, gateway, Stripe, product, and release-closure smoke checks;
- protected preview URL;
- authenticated desktop and physical-iPhone review;
- real invitation, consent, revocation, and multi-person System verification;
- Stripe test-mode Checkout, webhook, Portal, cancellation, and fallback-to-Free verification.

GitHub Actions may remain as optional secondary verification, but no GitHub Actions quota or paid GitHub plan is required.
