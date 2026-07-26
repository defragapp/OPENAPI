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
- [`docs/cloudflare-workers-builds.md`](docs/cloudflare-workers-builds.md)
- [`docs/cloudflare-dashboard-preview-prompt.md`](docs/cloudflare-dashboard-preview-prompt.md)
- [`docs/production-release.md`](docs/production-release.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/privacy-model.md`](docs/privacy-model.md)
- [`docs/tool-contracts.md`](docs/tool-contracts.md)
- [`docs/release-gates.md`](docs/release-gates.md)
- [`docs/sovv-adapter-map.md`](docs/sovv-adapter-map.md)
- [`docs/openai-integration.md`](docs/openai-integration.md)
- [`docs/current-conditions-port.md`](docs/current-conditions-port.md)

## Free-plan build and preview deployment

GitHub Actions is optional. The supported release path for this public repository is Cloudflare Workers Builds connected directly to `defragapp/OPENAPI`.

Use these Cloudflare build settings:

- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm preview:bootstrap`
- Production branch: `main`
- Non-production branch builds: disabled

The deploy command targets the isolated `sovereign-openapi-preview` Worker rather than the production Worker. See [`docs/cloudflare-workers-builds.md`](docs/cloudflare-workers-builds.md) for required build secrets and the Cloudflare Access protection step. When dashboard assistance is available, use the exact bounded prompt in [`docs/cloudflare-dashboard-preview-prompt.md`](docs/cloudflare-dashboard-preview-prompt.md).

Preview target: [`sovereign-openapi-preview.sovereign-os-api.workers.dev`](https://sovereign-openapi-preview.sovereign-os-api.workers.dev). This link identifies the isolated review target only; availability and readiness must be verified from the exact deployed commit before approval.

## Production promotion

Production uses a guarded four-stage command path: upload an immutable candidate without traffic, apply reviewed D1 migrations separately, promote the exact approved version, and retain an explicit rollback target. Every mutating command requires an exact commit- or version-bound approval before remote preflight. The process and evidence requirements are defined in [`docs/production-release.md`](docs/production-release.md).

## Current state

The repository now includes the app and Worker shells, D1 schema and migrations, Durable Object thread coordination, security primitives, Stripe billing foundations, export job execution, identity-bound email invitations, invitee-controlled scope decisions and revocation, reduced-Baseline pair and system context, authorization-checked relational context, staged Inner Recognition planning, exact verified Basis selection, pre-display response safety, explicit Insight Module approval, Cloudflare-native preview deployment, and a fail-closed production promotion path.

This is **production-candidate code, not a verified live production release**. Remaining evidence includes a successful exact-commit Cloudflare build, configured production resources and secrets, protected preview verification, migration replay, authenticated browser and physical-iPhone smoke tests, load testing, reviewed Terms and Privacy documents, and explicit founder approval. No production deployment is implied by the code state.
