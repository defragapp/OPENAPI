# Sovereign.OS

Production repository for the Sovereign.OS platform.

Canonical repository: `defragapp/OPENAPI`.

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
- Public platform Custom Domain: `https://sovereign.defrag.app`
- Authenticated application and API Custom Domain: `https://app.defrag.app`
- `defrag.app/*` and `www.defrag.app/*` remain explicit Worker routes that send public traffic to Sovereign.OS and application traffic to the authenticated host
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

## Cloudflare production release

The current account has no Cloudflare Workers Builds repository connection. Production is therefore released manually through Wrangler using the repository-owned deployment command. GitHub Actions is not supported for this repository and workflow files must not exist.

Use an exact, clean `main` checkout:

- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm production:deploy`
- Commit stamp: set `WORKERS_CI_COMMIT_SHA` to the full 40-character `main` commit SHA

The deployment command applies D1 migrations, preserves existing encrypted Worker secrets, stamps `APP_VERSION`, deploys `sovv-web`, and tests the public site, app, health/readiness, pricing, unauthenticated boundaries, Stripe signature rejection, disabled export route, security headers, concurrent health requests, and all four production domains. A deploy command that fails any check is not a completed release.

Wrangler configuration is the source of truth for routes. Both production Custom Domains and both Defrag parent routes must remain declared in `wrangler.jsonc` and `wrangler.production-direct.jsonc`; dashboard-only routes can be overwritten by the next Wrangler deployment.

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

The repository is production-hardened code, but a release is verified only when `pnpm production:deploy` completes for the exact `main` commit and every live probe passes against `sovereign.defrag.app`, `app.defrag.app`, `defrag.app`, and `www.defrag.app`.