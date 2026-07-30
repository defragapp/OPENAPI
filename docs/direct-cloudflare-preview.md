# Direct Cloudflare preview

Use the existing `defragapp/OPENAPI` repository. Do not use the Deploy to Cloudflare template flow or create a repository copy.

The repository-root `wrangler.jsonc` is the authoritative production configuration for `sovv-web`. Isolated review previews use `apps/sovereign-worker/wrangler.jsonc` with its `preview` environment and the `pnpm preview:bootstrap` command.

## Preview target

- Worker: `sovereign-openapi-preview`
- URL: `https://sovereign-openapi-preview.sovereign-os-api.workers.dev`
- D1: `sovereign-openapi-preview-db`
- Durable Object: `ThreadCoordinator`
- AI: Cloudflare-hosted `@cf/zai-org/glm-4.7-flash` through the Workers AI binding and `sovereign` AI Gateway
- Assets: compiled Sovereign.OS web application
- Background cleanup: scheduled D1 work
- R2 and Queue: disabled

The preview must not attach a production custom domain, production D1 database, live Stripe credentials, or production customer records.

## Required Cloudflare configuration

Provide a user-scoped token with the minimum permissions needed for Workers Scripts, D1, Workers AI, account membership, and read-only account details. Queue, R2, and Workers Routes permissions are not required.

Configure:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `PREVIEW_SESSION_SIGNING_SECRET`
- `PREVIEW_BASE_URL=https://sovereign-openapi-preview.sovereign-os-api.workers.dev`
- `PREVIEW_WORKER_NAME=sovereign-openapi-preview`
- `PREVIEW_D1_NAME=sovereign-openapi-preview-db`
- `CLOUDFLARE_WORKERS_SUBDOMAIN=sovereign-os-api`
- `AI_PROVIDER=cloudflare-gateway`
- `AI_MODEL=@cf/zai-org/glm-4.7-flash`
- `AI_GATEWAY_ID=sovereign`

Turnstile, email, and Stripe test-mode settings may be added for authenticated acceptance testing. Never attach live Stripe credentials to preview.

## Free-capacity behavior

Preview uses the same Workers AI account allocation as production. Migration `0013_workers_ai_free_capacity` must be applied to the preview D1 database so preview calls reserve against a controlled UTC-day budget. Review traffic must not bypass the application’s monthly allowance or shared daily capacity handling.

## Deploy and verify

Run:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm verify:cloudflare-build
pnpm preview:bootstrap
```

Protect the entire preview hostname with Cloudflare Access before accepting it as founder-review evidence. Then verify `/health`, `/healthz`, `/ready`, the public pages, authenticated product surfaces, the disabled private-export boundary, current migration identity, Workers AI availability, and test-mode billing.

The preview may be removed only after explicit approval. Never target `sovv-web`, `sovereign-openapi-db`, `sovereign.defrag.app`, or `app.defrag.app` during preview cleanup.
