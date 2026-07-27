# Sovereign.OS

Production repository for the Sovereign.OS platform.

## Repository boundary

- All current product work belongs in this repository on `main`.
- `defragapp/SOVV` is read-only legacy reference and rollback material.
- Secrets, private birth records, exact location history, and production credential values must never be committed.

## Product direction

Sovereign.OS is a Baseline-first personal, relational, and system intelligence platform. One Sovereign agent helps a person understand themselves, compare consented Baseline Designs, and reason across relationships and systems such as families, households, teams, friendships, and workplaces.

Defrag, Alignment, and Covenant are internal capabilities of one agent. They are not separate top-level applications.

The founder-approved public contract is defined in [`docs/launch-product-contract.md`](docs/launch-product-contract.md). The staged response and exact-data footer contract is defined in [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md).

## Production architecture

- TypeScript monorepo
- Cloudflare Worker: `sovv-web`
- Public platform: `https://sovereign.defrag.app`
- Authenticated application and API: `https://app.defrag.app`
- Legacy Defrag apex preserved separately
- D1 canonical storage: `sovereign-openapi-db`
- SQLite Durable Objects for thread coordination
- Workers AI through AI Gateway
- Static assets for high-volume browser delivery
- D1-scheduled background work every 15 minutes
- Stripe-hosted Checkout and Customer Portal
- Stripe-signed subscription webhooks and server-side entitlements
- Resend transactional email fallback for magic links
- Turnstile-protected signup and login
- iOS-optimized Progressive Web App on the public hostname only

Cloudflare Queue and R2 are intentionally disabled. Private export is not part of the launch product. Sharing sends only the public Sovereign.OS link and includes no private workspace data.

## Cloudflare Workers Builds

Cloudflare Workers Builds connected directly to `defragapp/OPENAPI` is the only supported production build and deployment path. GitHub Actions is not supported for this repository and workflow files must not exist.

Use:

- Production branch: `main`
- Root directory: repository root
- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm production:deploy`
- Non-production branch builds: disabled

The deployment script receives the exact Cloudflare Git commit through `WORKERS_CI_COMMIT_SHA`, applies D1 migrations, preserves existing encrypted Worker secrets, stamps `APP_VERSION`, deploys `sovv-web`, and then tests the public site, app, health/readiness, pricing, unauthenticated boundaries, Stripe signature rejection, disabled export route, security headers, and concurrent health requests. A deploy command that fails these checks is not a completed release.

Required encrypted Worker secrets:

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Secret values belong only in Cloudflare and must never be copied into repository files, logs, issues, or chat.

## Launch billing

- Free: permanent plan with 10 Sovereign AI turns per UTC month
- Sovereign+ monthly: $20/month
- Sovereign+ annual: $99/year

Account deletion uses a 14-day grace period. When execution becomes due, every nonterminal Stripe subscription is cancelled first. Local private data is deleted only after Stripe cancellation succeeds.

## Start here

- [`docs/launch-product-contract.md`](docs/launch-product-contract.md)
- [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/privacy-model.md`](docs/privacy-model.md)
- [`docs/tool-contracts.md`](docs/tool-contracts.md)
- [`docs/release-gates.md`](docs/release-gates.md)

## Release status

The repository is production-hardened code, but a release is verified only when Cloudflare Workers Builds succeeds for the exact `main` commit and `pnpm production:deploy` completes every live probe against `sovereign.defrag.app` and `app.defrag.app`.