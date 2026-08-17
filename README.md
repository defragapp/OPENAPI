# Sovereign.OS

Production repository for the Sovereign.OS platform.

Canonical repository: `defragapp/OPENAPI`.

## Repository boundary

- All current product work belongs in this repository on `main`.
- `defragapp/SOVV` is read-only legacy reference and rollback material.
- Secrets, private birth records, exact location history, and production credential values must never be committed.

## Product direction

Sovereign.OS is a Baseline-first AI platform for understanding yourself, your relationships, and the human systems around you.

Baseline Design is the foundation. A person brings an ordinary real-life question, decision, relationship, or recurring situation; Sovereign uses the Baseline to make a relevant distinction visible before exposing technical machinery. Relationship and system intelligence extend that same foundation outward while keeping each person distinct and permission-bound.

The platform uses one explanatory movement across those capabilities: see the capacity beneath a pattern, see how that capacity may be expressing, see what happens between people, and see what may keep the pattern going and what could change it. This is implemented through the existing Baseline, Expression Field, answer, People, Systems, Library, and Worlds contracts; it is not a separate product or claim of interpersonal causation.

Defrag, Alignment, and Covenant are internal capabilities of one agent. They are not separate top-level applications.

User-facing language is governed by [`docs/product-language-system.md`](docs/product-language-system.md). The founder-approved product boundary is defined in [`docs/launch-product-contract.md`](docs/launch-product-contract.md). The Layer A–D intelligence model, `sovereign-answer.v2`, and exact Basis contract are defined in [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md). Safety, privacy, visual, architecture, and release documents inherit those authorities within their own scope; audits, strategies, implementation plans, deployment markers, and release records are supporting or historical documents and do not redefine them.

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
- Cloudflare Workers AI through AI Gateway `sovereign-ai-gateway`
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

## Production release

The current production release authority is the exact current `origin/main` SHA executed through:

```bash
pnpm production:release:oauth
```

The wrapper establishes a fresh current-member Wrangler OAuth session, runs the full repository gate, executes the internal `pnpm production:deploy` stage, and verifies exact-SHA readiness and release evidence on both branded production domains. Historical Cloudflare Workers Builds trigger and build-token records are not current release authority.

GitHub Actions, deploy hooks, Cloudflare Pages, preview Workers, duplicate production Workers, and alternate repositories are not release authorities.

Wrangler configuration remains the source of truth for routes. Both production Custom Domains and both Defrag parent routes must remain declared in the production Wrangler authorities; dashboard-only route changes can be overwritten by a later deployment.

Required encrypted Worker secrets remain in Cloudflare:

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Secret values belong only in protected provider configuration and must never be copied into repository files, logs, issues, screenshots, deploy hooks, or chat.

A release is complete only when both `https://sovereign.defrag.app/ready` and `https://app.defrag.app/ready` prove the exact target SHA with `ready: true`, migration `0015_release_evidence`, migration parity `current`, and matching release evidence after all repository and live probes pass.

See [`docs/production-release.md`](docs/production-release.md) for the canonical procedure and [`docs/browser-visual-release-audit.md`](docs/browser-visual-release-audit.md) for rendered acceptance.

## Launch billing

- Free: permanent plan with 10 Sovereign AI turns per UTC month
- Sovereign+ monthly: $20/month
- Sovereign+ annual: $99/year

Account deletion uses a 14-day grace period. When execution becomes due, every nonterminal Stripe subscription is cancelled first. Local private data is deleted only after Stripe cancellation succeeds.

## Start here

- [`docs/product-language-system.md`](docs/product-language-system.md)
- [`docs/launch-product-contract.md`](docs/launch-product-contract.md)
- [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md)
- [`docs/production-ai-safety-boundary.md`](docs/production-ai-safety-boundary.md)
- [`docs/privacy-model.md`](docs/privacy-model.md)
- [`docs/v0-visual-port-contract.md`](docs/v0-visual-port-contract.md)
- [`docs/worlds-experience-contract.md`](docs/worlds-experience-contract.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/tool-contracts.md`](docs/tool-contracts.md)
- [`docs/production-release.md`](docs/production-release.md)
- [`docs/release-gates.md`](docs/release-gates.md)

## Release status

Repository state and production state are separate. Current production is verified only for an exact `origin/main` SHA that completes `pnpm production:release:oauth` and passes the required live exact-SHA, migration, release-evidence, domain, security, billing, and rendered-browser probes.
