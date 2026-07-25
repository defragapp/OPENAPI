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

Cloudflare Workers Builds supplies Wrangler authentication through its generated deployment token. The preview bootstrap also continues to support explicit `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` values when run elsewhere.

The deploy command creates or reuses the isolated preview D1 database, applies all remote migrations, uploads configured secrets, deploys the dedicated `sovereign-openapi-preview` Worker, and records the deployed commit SHA.

## Build variables and secrets

Add these under the Worker's **Settings > Build > Variables and secrets**.

Required secret:

- `PREVIEW_SESSION_SIGNING_SECRET` — a long random value used only by the preview application.

Recommended build variables:

- `PREVIEW_WORKER_NAME=sovereign-openapi-preview`
- `PREVIEW_D1_NAME=sovereign-openapi-preview-db`
- `AI_PROVIDER=cloudflare-gateway`
- `AI_MODEL=openai/gpt-5.5`
- `AI_GATEWAY_ID=sovereign`

Stripe test-mode variables and secrets for billing verification:

- `STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY`
- `STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL`
- `STRIPE_SECRET_KEY` — test-mode secret only
- `STRIPE_WEBHOOK_SECRET` — test endpoint secret only

Optional integration values:

- `SOVV_BASE_URL`
- `SOVV_INTERNAL_AUTH_TOKEN`
- `SCRIPTURE_TRANSLATION=WEB`

Never place these values in GitHub files, public issue comments, or unencrypted runtime variables.

## Protect the preview

After the first successful deployment:

1. Open **Workers & Pages > sovereign-openapi-preview**.
2. Open **Settings > Domains & Routes**.
3. For the `workers.dev` route, select **Enable Cloudflare Access**.
4. Permit only the founder's approved email identity or group.
5. Keep versioned Preview URLs disabled. The dedicated preview Worker is the review target.
6. Trigger one new Cloudflare build so verification occurs against the protected route.

Cloudflare Access is the founder-review perimeter. It is not the customer subscription paywall. Production customers continue to use the application's passwordless sessions, consent rules, and server-side Stripe entitlements.

## Completion evidence

A release is not complete until one exact `main` commit has all of the following:

- successful Cloudflare build log;
- frozen dependency install;
- migration validation and remote migration replay;
- secret and fixture scans;
- typecheck and tests;
- web and Worker build;
- authentication, Baseline, jobs, gateway, Stripe, product, and release-closure smoke checks;
- protected preview URL;
- authenticated desktop and physical-iPhone review;
- Stripe test-mode Checkout, webhook, Portal, cancellation, and fallback-to-Free verification.

GitHub Actions may remain in the repository as an optional secondary verification path, but it is not required for this deployment model.
