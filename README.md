# Sovereign.OS

Production repository for the Sovereign.OS platform.

Canonical repository: `defragapp/OPENAPI`.

## Repository boundary

- All current product work belongs in this repository on `main`.
- `defragapp/SOVV` is read-only legacy reference and rollback material.
- Secrets, private birth records, exact location history, and production credential values must never be committed.

## Product direction

Sovereign.OS is a Baseline-first AI platform for understanding yourself, your relationships, and the human systems around you. One Sovereign agent helps a person explore a structured Baseline, distinguish stable qualities from temporary current context, compare consented Baselines, examine Alignment, and understand families, households, teams, friendships, and workplaces.

Defrag, Alignment, and Covenant are internal capabilities of one agent. They are not separate top-level applications.

The founder-approved public contract is defined in [`docs/launch-product-contract.md`](docs/launch-product-contract.md). The Layer A–D intelligence model, `sovereign-answer.v2`, and exact Basis contract are defined in [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md).

## Production architecture

- TypeScript pnpm monorepo.
- Cloudflare Worker: `sovv-web`.
- Public platform Custom Domain: `https://sovereign.defrag.app`.
- Authenticated application and API Custom Domain: `https://app.defrag.app`.
- `defrag.app/*` and `www.defrag.app/*` remain explicit Worker routes that send public traffic to Sovereign.OS and application traffic to the authenticated host.
- D1 canonical storage: `sovereign-openapi-db`.
- D1 Sessions bookmarks plus read replication for sequentially consistent application requests.
- SQLite Durable Objects for thread coordination.
- Cloudflare-hosted `@cf/zai-org/glm-4.7-flash` through the Workers AI binding and the existing `sovereign` AI Gateway.
- Personalized AI cache and persistent prompt logging disabled.
- D1-backed daily reservation ledger capped below the Workers AI Free allocation.
- AI Gateway and zone-level Free-plan rate limiting.
- API Shield request-schema validation for short critical mutation bodies.
- Static assets for high-volume browser delivery.
- D1-scheduled background work every 15 minutes.
- Stripe-hosted Checkout and Customer Portal.
- Stripe-signed subscription webhooks and server-side entitlements.
- Resend transactional email fallback for magic links.
- Turnstile-protected signup and login.
- iOS-optimized Progressive Web App on the public hostname only.

Cloudflare Queue and R2 are intentionally disabled. Private export is not part of the launch product. Sharing sends only the public Sovereign.OS link and includes no private workspace data.

## Intelligence contracts

- `baseline-source.v1` contains deterministic or provider-returned exact values only.
- `baseline-facets.v1` contains versioned interpretations derived from authorized source values and exact Basis references.
- Current conditions expire and may identify a theme as more relevant; they never establish behavior.
- `sovereign-answer.v2` returns a direct answer, adaptive sections, exact Basis references, correction language, contextual actions, confidence, and safety mode.
- Relationship and system context is built on the server after entitlement and consent checks.
- Covenant is contextual, explicitly confirmed, and limited to retrieved or curated verified Scripture.

## Cloudflare production release

Cloudflare Workers Builds connected directly to `defragapp/OPENAPI` is the sole production release authority. Merging an approved, fully gated commit to `main` authorizes Cloudflare to run the repository-owned deployment command. GitHub Actions is not used as a deployment authority, ad-hoc local production deploys are forbidden, and no workflow may independently publish production.

Use an exact, clean `main` checkout:

- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm production:deploy`
- Commit stamp: Cloudflare must provide `WORKERS_CI_COMMIT_SHA` as the full 40-character `main` commit SHA.

The deployment command applies D1 migrations, verifies existing encrypted Worker secrets, configures and re-reads the Free-plan D1, AI Gateway, rate-limit, and API Shield controls, stamps `APP_VERSION`, deploys `sovv-web`, and tests the public site, application, health/readiness, pricing, unauthenticated boundaries, Stripe signature rejection, security headers, and all four production domains. A deploy command that fails any check is not a completed release.

Wrangler configuration is the source of truth for routes. Both production Custom Domains and both Defrag parent routes must remain declared in `wrangler.jsonc` and `wrangler.production-direct.jsonc`; dashboard-only routes can be overwritten by the next Wrangler deployment.

Required encrypted Worker secrets:

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Secret values belong only in Cloudflare and must never be copied into repository files, logs, issues, or chat.

## Launch billing

- Free: permanent plan with 10 Sovereign AI turns per UTC month.
- Sovereign+ monthly: $20/month.
- Sovereign+ annual: $99/year.

The product’s monthly allowances do not override the Cloudflare account’s daily Free allocation. Migration `0013_workers_ai_free_capacity` maintains a conservative shared reservation budget and returns failed generation turns to the user.

Account deletion uses a 14-day grace period. When execution becomes due, every nonterminal Stripe subscription is cancelled first. Local private data is deleted only after Stripe cancellation succeeds.

## Start here

- [`docs/launch-product-contract.md`](docs/launch-product-contract.md)
- [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/cloudflare-free-tier-hardening.md`](docs/cloudflare-free-tier-hardening.md)
- [`docs/privacy-model.md`](docs/privacy-model.md)
- [`docs/tool-contracts.md`](docs/tool-contracts.md)
- [`docs/release-gates.md`](docs/release-gates.md)

## Release status

The repository is production-hardened code, but a release is verified only when `pnpm production:deploy` completes for the exact `main` commit and every live probe passes against `sovereign.defrag.app`, `app.defrag.app`, `defrag.app`, and `www.defrag.app`.
