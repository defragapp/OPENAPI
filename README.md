# Sovereign.OS

Production repository for the next-generation Sovereign.OS platform.

## Repository boundary

- All new product work belongs in this repository on `main`.
- `defragapp/SOVV` is read-only reference material.
- Secrets, private birth records, exact location history, and production identifiers must never be committed.

## Product direction

Sovereign.OS is a Baseline-first personal, relational, and system intelligence platform. One Sovereign agent helps a person understand themselves, compare consented Baseline Designs, and reason across relationships and systems such as families, households, teams, friendships, and workplaces.

Defrag, Alignment, and Covenant are internal capabilities of one agent. They are not separate top-level applications.

The founder-approved public approval boundary is defined in [`docs/launch-product-contract.md`](docs/launch-product-contract.md). The staged response and exact-data footer contract is defined in [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md).

## Stack

- TypeScript monorepo
- OpenAI Agents SDK
- ChatKit-compatible conversation contract
- Cloudflare Workers
- D1 canonical storage
- SQLite Durable Objects for thread coordination
- Cloudflare Queues for background work
- Workers AI through AI Gateway
- iOS-optimized Progressive Web App

## Direct Cloudflare preview deployment

Deploy the existing `defragapp/OPENAPI` repository directly through Cloudflare Workers Builds.

Do **not** use the Deploy to Cloudflare template button. That flow creates a new GitHub repository copy and is not the approved release path.

In **Workers & Pages**, import or connect the existing GitHub repository:

- Repository: `defragapp/OPENAPI`
- Branch: `main`
- Project/Worker: `sovereign-openapi-preview`
- Root directory: repository root
- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm preview:bootstrap`

Required first-deploy build configuration:

- `PREVIEW_SESSION_SIGNING_SECRET` as a secret
- `PREVIEW_BASE_URL=https://sovereign-openapi-preview.sovereign-os-api.workers.dev`
- `PREVIEW_WORKER_NAME=sovereign-openapi-preview`
- `PREVIEW_D1_NAME=sovereign-openapi-preview-db`
- `CLOUDFLARE_WORKERS_SUBDOMAIN=sovereign-os-api`
- `AI_PROVIDER=cloudflare-gateway`
- `AI_MODEL=openai/gpt-5.5`
- `AI_GATEWAY_ID=sovereign`

The review deployment uses D1, a SQLite Durable Object, Queue, Workers AI, and static assets. **R2 is intentionally excluded from preview** so no R2 subscription or billing enrollment is required. Downloadable export artifacts remain disabled until storage is separately approved.

Turnstile, transactional email, and Stripe test-mode configuration can be added after the first visual deployment. Those flows must not be marked verified until configured and tested.

Preview target: `https://sovereign-openapi-preview.sovereign-os-api.workers.dev`

The preview must not attach `defrag.app`, create a custom domain, modify `sovv-web`, modify `sovereign-os-api`, or touch production storage or live Stripe configuration.

## Start here

- [`docs/launch-product-contract.md`](docs/launch-product-contract.md)
- [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md)
- [`docs/cloudflare-workers-builds.md`](docs/cloudflare-workers-builds.md)
- [`docs/production-release.md`](docs/production-release.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/privacy-model.md`](docs/privacy-model.md)
- [`docs/tool-contracts.md`](docs/tool-contracts.md)
- [`docs/release-gates.md`](docs/release-gates.md)

## Production promotion

Production uses a guarded four-stage path: upload an immutable candidate without traffic, apply reviewed D1 migrations separately, promote the exact approved version, and retain an explicit rollback target. The process is defined in [`docs/production-release.md`](docs/production-release.md).

## Current state

The repository contains the app and Worker, D1 schema and migrations, Durable Object thread coordination, security primitives, billing foundations, identity-bound invitations, reduced-Baseline pair and system context, staged Inner Recognition planning, exact verified Basis selection, pre-display safety, Cloudflare-native preview deployment, and a fail-closed production promotion path.

This is production-candidate code, not a verified live production release. A successful exact-commit Cloudflare build and protected live review are still required before approval.
