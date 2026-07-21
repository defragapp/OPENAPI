# Sovereign.OS

Production repository for the next-generation Sovereign.OS platform.

## Repository boundary

- All new product work belongs in this repository on `main`.
- `defragapp/SOVV` is read-only reference material.
- The first production milestone excludes static external marketing pages.
- Secrets, private birth records, exact location history, and production identifiers must never be committed.

## Product direction

Sovereign.OS is a Baseline-first personal, relational, and system intelligence platform. One Sovereign agent helps a person understand themselves, compare consented Baseline Designs, and reason across relationships and systems such as families, households, teams, friendships, and workplaces.

Defrag, Alignment, and Covenant are internal capabilities of one agent. They are not separate top-level applications.

## Initial stack

- TypeScript monorepo
- OpenAI Agents SDK
- ChatKit-compatible streamed conversation contract
- Cloudflare Workers
- D1 canonical storage
- Durable Objects for thread coordination
- Stripe Checkout, Customer Portal, webhooks, and entitlements
- iOS-optimized Progressive Web App

## Start here

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/privacy-model.md`](docs/privacy-model.md)
- [`docs/tool-contracts.md`](docs/tool-contracts.md)
- [`docs/release-gates.md`](docs/release-gates.md)
- [`docs/sovv-adapter-map.md`](docs/sovv-adapter-map.md)
- [`docs/openai-integration.md`](docs/openai-integration.md)
- [`docs/current-conditions-port.md`](docs/current-conditions-port.md)

## Current state

The repository foundation is scaffolded. It includes the app shell, Worker shell, initial D1 schema, thread Durable Object, security primitives, Stripe webhook verification, domain contracts, and CI checks. Cloudflare bindings, production secrets, live SOVV adapters, and deployment are intentionally not configured in source control.
