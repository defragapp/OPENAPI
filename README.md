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

The founder-approved public approval boundary is defined in [`docs/launch-product-contract.md`](docs/launch-product-contract.md). Implementation and release work must not guess or silently change those decisions.

The staged AI response and exact-data footer contract is defined in [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md).

## Initial stack

- TypeScript monorepo
- OpenAI Agents SDK
- ChatKit-compatible conversation contract
- Cloudflare Workers
- D1 canonical storage
- Durable Objects for thread coordination
- Stripe Checkout, Customer Portal, webhooks, and entitlements
- iOS-optimized Progressive Web App

## Start here

- [`docs/launch-product-contract.md`](docs/launch-product-contract.md)
- [`docs/inner-recognition-intelligence.md`](docs/inner-recognition-intelligence.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/privacy-model.md`](docs/privacy-model.md)
- [`docs/tool-contracts.md`](docs/tool-contracts.md)
- [`docs/release-gates.md`](docs/release-gates.md)
- [`docs/sovv-adapter-map.md`](docs/sovv-adapter-map.md)
- [`docs/openai-integration.md`](docs/openai-integration.md)
- [`docs/current-conditions-port.md`](docs/current-conditions-port.md)

## Current state

The repository now includes the app and Worker shells, D1 schema and migrations, Durable Object thread coordination, security primitives, Stripe billing foundations, export job execution, identity-bound email invitations, invitee-controlled scope decisions and revocation, reduced-Baseline pair and system context, authorization-checked relational context, staged Inner Recognition planning, exact verified Basis selection, pre-display response safety, and explicit Insight Module approval.

This is **implemented, not yet approved for production**. Remaining approval evidence includes a green CI run, configured production Baseline and email services, protected Cloudflare preview, migration replay, authenticated browser and iPhone smoke tests, load testing, reviewed Terms and Privacy documents, and explicit founder approval. No production deployment is implied by the code state.
