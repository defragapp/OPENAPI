# Sovereign.OS

Production repository for the Sovereign.OS platform.

Canonical repository: `defragapp/OPENAPI`.

## Repository boundary

- All current product work belongs in this repository on `main`.
- `defragapp/SOVV` is read-only legacy reference and rollback material.
- Secrets, private birth records, exact location history, and production credential values must never be committed.

## Product direction

Sovereign.OS is a Baseline-first private AI for understanding yourself, your relationships, your decisions, and the human systems around you.

Baseline Design is the foundation. A person brings an ordinary real-life question, decision, relationship, or recurring situation; Sovereign uses the Baseline to make a relevant distinction visible before exposing technical machinery. Relationship and system intelligence extend that same foundation outward while keeping each person distinct and permission-bound.

The current authenticated product is **text-first**. The canonical AI experience is one continuous Sovereign thread: user question → direct answer → relevant structured explanation → quiet Basis/provenance → correction or continuation. Video generation is not part of the current launch runtime.

Defrag, Alignment, and Covenant are internal capabilities of one agent. They are not separate top-level applications.

## Documentation authority

Use this order when documents overlap:

1. [`docs/product-language-system.md`](docs/product-language-system.md) — user-facing language and explanatory sequence.
2. [`docs/launch-product-contract.md`](docs/launch-product-contract.md) — included product and approval boundary.
3. [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md) — intelligence, answer, and Basis behavior.
4. Safety, privacy, consent, visual, architecture, tool, and release documents govern their named implementation boundaries while inheriting the first three.
5. Audits, strategies, implementation plans, deployment markers, dated releases, and historical Workers Builds records are supporting or historical evidence only.

Do not allow a historical file to redefine current product or release authority.

## Production architecture

- TypeScript pnpm monorepo
- React 19 + Vite web application
- Cloudflare Worker: `sovv-web`
- Public Custom Domain: `https://sovereign.defrag.app`
- Authenticated application/API Custom Domain: `https://app.defrag.app`
- `defrag.app/*` and `www.defrag.app/*` route to the same canonical product
- production `workers.dev` access disabled
- D1 canonical storage: `sovereign-openapi-db`
- D1 Sessions with automatic read replication
- SQLite Durable Object `ThreadCoordinator`
- Cloudflare Workers AI through AI Gateway `sovereign-ai-gateway`
- production model `@cf/zai-org/glm-4.7-flash`
- personalized inference bypasses Gateway cache and persistent prompt logging
- D1-backed daily Workers AI capacity reservation
- Stripe Checkout/Portal + signed subscription webhooks
- Resend transactional email
- passkey-first returning access with email fallback/recovery
- Turnstile-protected signup/login
- iOS-aware web/PWA behavior
- Queue and R2 intentionally disabled

Current schema: **`0017_privacy_access_and_eligibility`**.

Release-evidence tables were introduced by historical migration `0015_release_evidence`; `0015` is not the current schema version.

Private account export is available through authenticated on-demand generation from D1. No export artifact is stored and no R2 export path is used.

## Intelligence contracts

- `baseline-source.v1` contains deterministic/provider-returned exact values only.
- `baseline-facets.v1` contains versioned interpretations derived from authorized source values and exact Basis references.
- Current conditions expire and may identify a theme as more relevant; they never establish behavior.
- `sovereign-answer.v2` returns a direct answer, adaptive sections, exact Basis references, correction language, contextual actions, confidence, and safety mode.
- Relationship and system context is built server-side after entitlement and consent checks.
- Covenant is contextual, explicitly confirmed, and limited to verified retrieved/curated Scripture.
- Exact source data, private location, credentials, billing identifiers, and unconsented person data remain outside language-model context.

## Production release

Canonical procedure: [`docs/production-release.md`](docs/production-release.md).

For the current text-first launch:

```bash
pnpm verify:cloudflare-build
pnpm production:release:text
```

The release command must target the same exact current `origin/main` SHA that passed the full repository gate. It performs one production deploy and does **not** run live Browser Rendering.

`pnpm production:release:oauth` remains an optional Browser-audited release path, not a requirement for the current launch.

Release evidence records actual provenance. `routeCohesionVerified` and `renderedVisualVerified` are `true` only if those automated Browser audits actually ran and passed. Human desktop/iPhone QA is separate evidence and must never be represented as automated Browser Rendering.

A technical release is live only when both branded `/ready` endpoints prove the exact deployed SHA, `ready: true`, migration `0017_privacy_access_and_eligibility`, migration parity `current`, policy-acceptance receipts configured, privacy-access controls configured, and exact matching release evidence.

GitHub Actions, deploy hooks, Cloudflare Pages, preview Workers, duplicate production Workers, historical Workers Builds triggers, and alternate repositories are not production release authorities.

## Launch plans

- Free: permanent, $0, 10 Sovereign AI turns per UTC month.
- Sovereign+: $20/month or $99/year, 300 turns per UTC month plus the server-enforced paid capabilities defined by the launch product contract.

Account deletion uses a 14-day grace period. Active Stripe subscriptions are cancelled before destructive private-data deletion.

## Start here

- [`docs/product-language-system.md`](docs/product-language-system.md)
- [`docs/launch-product-contract.md`](docs/launch-product-contract.md)
- [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md)
- [`docs/privacy-model.md`](docs/privacy-model.md)
- [`docs/privacy-data-flow-register.md`](docs/privacy-data-flow-register.md)
- [`docs/production-ai-safety-boundary.md`](docs/production-ai-safety-boundary.md)
- [`docs/v0-visual-port-contract.md`](docs/v0-visual-port-contract.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/tool-contracts.md`](docs/tool-contracts.md)
- [`docs/production-release.md`](docs/production-release.md)
- [`docs/release-gates.md`](docs/release-gates.md)

## Final production acceptance

Repository state and production state are separate. After an exact-SHA technical release, final product acceptance is tracked through GitHub #207 and bounded tasks #210–#216. The core launch is not `100%` complete until the real account/Baseline/text-AI journey, billing/auth lifecycle, permission-bound People/Systems flows, privacy controls, and human desktop/iPhone QA are all accepted.
