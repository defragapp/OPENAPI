# Sovereign.OS

Production repository for the Sovereign.OS platform.

Canonical repository: `defragapp/OPENAPI`.

## Repository boundary

- All current product work belongs in this repository on `main`.
- `defragapp/SOVV` is read-only legacy reference and rollback material.
- Secrets, private birth records, exact location history, and production credential values must never be committed.

## Product direction

Sovereign.OS is a Baseline-first AI platform for understanding yourself, your relationships, and the human systems around you. One Sovereign agent helps a person explore a structured Baseline, distinguish stable qualities from temporary current context, compare consented Baselines, examine Alignment, and understand families, households, teams, friendships, and workplaces.

The platform uses one explanatory movement across those capabilities: see the capacity beneath a pattern, see how that capacity may be expressing, see what happens between people, and see what may keep the pattern going and what could change it. This is implemented through the existing Baseline, Expression Field, answer, People, Systems, Library, and Worlds contracts; it is not a separate product or claim of interpersonal causation.

Defrag, Alignment, and Covenant are internal capabilities of one agent. They are not separate top-level applications.

The founder-approved public contract is defined in [`docs/launch-product-contract.md`](docs/launch-product-contract.md). The Layer A–D intelligence model, `sovereign-answer.v2`, and exact Basis contract are defined in [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md).

## Production architecture

- TypeScript monorepo
- Cloudflare Worker: `sovv-web`
- Public platform Custom Domain: `https://sovereign.defrag.app`
- Authenticated application and API Custom Domain: `https://app.defrag.app`
- `defrag.app/*` and `www.defrag.app/*` remain explicit Worker routes that send public traffic to Sovereign.OS and application traffic to the authenticated host
- Production `workers.dev` access is disabled; direct Worker subdomain access is not part of the production surface
- D1 canonical storage: `sovereign-openapi-db`
- D1 Sessions with browser-held opaque bookmarks for sequential API consistency
- D1 read replication in automatic mode
- SQLite Durable Objects for thread coordination
- Cloudflare Workers AI through AI Gateway `sovereign`
- Production model: `@cf/zai-org/glm-4.7-flash`
- Personalized inference bypasses Gateway cache and persistent prompt logging
- D1-backed daily free-capacity reservations stop inference before the account-wide Workers AI free allocation is exhausted
- Daily Workers AI capacity ledger introduced by migration `0013_workers_ai_free_capacity`
- Current migration: `0015_release_evidence`
- Static assets for high-volume browser delivery
- D1-scheduled background work every 15 minutes
- Stripe-hosted Checkout and Customer Portal
- Stripe-signed subscription webhooks and server-side entitlements
- Resend transactional email fallback for magic links
- Passkey-first returning access with email verification and recovery fallback
- Turnstile-protected signup and login
- iOS-optimized Progressive Web App on the public hostname only

The release gate verifies that personalized inference bypasses Gateway cache and persistent prompt logging.

Cloudflare Queue and R2 are intentionally disabled. Private export is not part of the launch product. Sharing sends only the public Sovereign.OS link and includes no private workspace data.

## Intelligence contracts

- `baseline-source.v1` contains deterministic or provider-returned exact values only.
- `baseline-facets.v1` contains versioned interpretations derived from authorized source values and exact Basis references.
- Current conditions expire and may identify a theme as more relevant; they never establish behavior.
- `sovereign-answer.v2` returns a direct answer, adaptive sections, exact Basis references, correction language, contextual actions, confidence, and safety mode.
- Relationship and system context is built on the server after entitlement and consent checks.
- Covenant is contextual, explicitly confirmed, and limited to retrieved or curated verified Scripture.
- Safety presentation is driven by the validated answer contract rather than matching user-visible headlines.

## Cloudflare production release

Cloudflare Workers Builds connected directly to `defragapp/OPENAPI` is the sole production release authority. Merging an approved, fully gated commit to `main` authorizes Cloudflare to run the repository-owned deployment command. GitHub Actions, deploy hooks, and ad-hoc local production deploys are not release authorities.

Use an exact, clean `main` checkout:

- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm production:deploy`
- Commit stamp: set `WORKERS_CI_COMMIT_SHA` to the full 40-character `main` commit SHA

The deployment command applies D1 migrations, preserves existing encrypted Worker secrets, configures and verifies Free-plan Cloudflare controls, stamps `APP_VERSION`, deploys `sovv-web`, and tests the public site, app, health/readiness, pricing, unauthenticated boundaries, Stripe signature rejection, disabled export route, security headers, concurrent health requests, and all four approved production domains. A deploy command that fails any check is not a completed release.

Wrangler configuration is the source of truth for routes. Both production Custom Domains and both Defrag parent routes must remain declared in `wrangler.jsonc` and `wrangler.production-direct.jsonc`; dashboard-only routes can be overwritten by the next Wrangler deployment. Preview may use its separately named `workers.dev` environment, but production may not.

Required encrypted Worker secrets:

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

The production deploy environment also requires a scoped `CLOUDFLARE_API_TOKEN` so the repository-owned deploy script can configure and verify D1 replication, AI Gateway controls, the Free-plan rate-limit rule, and API Shield. Secret values belong only in Cloudflare and must never be copied into repository files, logs, issues, deploy hooks, or chat.

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
