# Direct Cloudflare preview

Use the existing `defragapp/OPENAPI` repository. Do not use the Deploy to Cloudflare template flow or create a repository copy.

The repository-root `wrangler.jsonc` is the authoritative production configuration for `sovv-web`. Isolated review previews use `apps/sovereign-worker/wrangler.jsonc` with its `preview` environment and the `pnpm preview:bootstrap` command.

## Preview target

- Worker: `sovereign-openapi-preview`
- URL: `https://sovereign-openapi-preview.sovereign-os-api.workers.dev`
- D1: `sovereign-openapi-preview-db`
- Durable Object: `ThreadCoordinator`
- AI: Workers AI binding through AI Gateway `sovereign`
- Model: `@cf/zai-org/glm-4.7-flash`
- Assets: compiled Sovereign.OS web application
- Background cleanup: scheduled D1 work
- R2 and Queue: disabled

The preview must not attach a production custom domain, production D1 database, live Stripe credentials, or production customer records.

## Required Cloudflare configuration

Provide a user-scoped token with the minimum permissions needed for Workers Scripts, D1, Workers AI, account membership, and read-only account details. Queue, R2, and production Workers Routes permissions are not required.

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

## Deploy and verify

Run:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm verify:cloudflare-build
pnpm preview:bootstrap
```

The preview must apply all migrations through `0015_release_evidence`, use the same structured-output adapter as production, bypass personalized Gateway caching, disable persistent prompt logging, and return controlled capacity errors without charging monthly turns for missing answers.

Protect the entire preview hostname with Cloudflare Access before accepting it as founder-review evidence. Then verify `/health`, `/healthz`, `/ready`, the public pages, authenticated product surfaces, the disabled private-export boundary, and test-mode billing.

The preview may be removed only after explicit approval. Never target `sovv-web`, `sovereign-openapi-db`, `sovereign.defrag.app`, or `app.defrag.app` during preview cleanup.