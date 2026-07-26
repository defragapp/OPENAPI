# Direct Cloudflare preview

Use Cloudflare Workers Builds with the existing repository `defragapp/OPENAPI`.

Do not use the Deploy to Cloudflare template flow. It creates a repository copy and is not the approved path.

## Cloudflare project

- Repository: `defragapp/OPENAPI`
- Branch: `main`
- Project name: `sovereign-openapi-preview`
- Root directory: repository root
- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm preview:bootstrap`

The repository-root `wrangler.jsonc` exists only to give Workers Builds an exact matching Worker identity and preview resource contract. It targets `sovereign-openapi-preview`, contains no custom domains, and contains no R2 binding.

## Build token

Select a user-scoped Workers Builds token that can perform the bootstrap operations. It needs:

- Account Settings Read
- Workers Scripts Edit
- D1 Edit
- Queues Edit
- Workers AI Read
- User Details Read
- Memberships Read

R2 permission and Workers Routes permission are not required for this preview.

## Required first-deploy configuration

Add one secret:

- `PREVIEW_SESSION_SIGNING_SECRET`

Add these build variables:

- `PREVIEW_BASE_URL=https://sovereign-openapi-preview.sovereign-os-api.workers.dev`
- `PREVIEW_WORKER_NAME=sovereign-openapi-preview`
- `PREVIEW_D1_NAME=sovereign-openapi-preview-db`
- `CLOUDFLARE_WORKERS_SUBDOMAIN=sovereign-os-api`
- `AI_PROVIDER=cloudflare-gateway`
- `AI_MODEL=openai/gpt-5.5`
- `AI_GATEWAY_ID=sovereign`

The preview uses D1, SQLite Durable Objects, Cloudflare Queues, Workers AI, and static assets.

R2 is intentionally disabled for the visual-review preview. No R2 subscription or R2 permission is required. Downloadable exports remain unavailable until storage is separately approved.

Turnstile, email, and Stripe test-mode settings can be added after the visual preview is live.

## Safety boundary

The preview must not:

- create another GitHub repository;
- attach `defrag.app` or any custom domain;
- modify `sovv-web` or `sovereign-os-api`;
- modify production D1 storage;
- use live Stripe credentials;
- enable R2.

After deployment, verify `/health`, `/healthz`, and `/ready`, then enable Cloudflare Access on the dedicated `workers.dev` route.
