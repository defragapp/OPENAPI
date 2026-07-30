# Preview and production preparation

## Resource inventory

Configure preview and production separately. Do not reuse production IDs in local files.

- Production Cloudflare Worker: `sovv-web`.
- Preview Worker: `sovereign-openapi-preview`.
- Web application: same-origin static assets and API routes through the Worker.
- Production D1: `sovereign-openapi-db`, with migrations applied in order through `0013_workers_ai_free_capacity`.
- Durable Object: `ThreadCoordinator` for turn ordering.
- AI binding: `AI` with `AI_PROVIDER=cloudflare-gateway`.
- AI Gateway: `AI_GATEWAY_ID=sovereign`.
- Workers AI model: `AI_MODEL=@cf/zai-org/glm-4.7-flash`.
- Auth: signed, revocable D1 sessions plus Turnstile-protected email access.
- Stripe: test-mode secrets and price IDs only until explicit live approval; production values remain encrypted Worker secrets.
- Resend: transactional access email through the verified production sender.
- Queue and R2: disabled.

## Secret and build-variable inventory

Required production Worker secrets must be configured in Cloudflare, not committed:

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Required Cloudflare Workers Builds variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `VITE_TURNSTILE_SITE_KEY`

The deploy token must be scoped for the existing Worker, D1 migrations and read-replication settings, Workers AI/AI Gateway, zone rate-limiting rules, API Shield schemas and operations, and zone lookup. No OpenAI provider key is accepted by the Worker.

## Production authority

Cloudflare Workers Builds connected to `defragapp/OPENAPI` on `main` is the sole production authority.

```text
Build: corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build
Deploy: pnpm production:deploy
```

No GitHub Actions workflow may deploy production. Local or dashboard-only deployments are not release evidence.

## Deployment runbook

1. Verify the target is the exact clean `main` SHA supplied as `WORKERS_CI_COMMIT_SHA`.
2. Install with `pnpm install --frozen-lockfile`.
3. Run `pnpm verify:cloudflare-build`.
4. Resolve the existing `sovereign-openapi-db`; do not replace it with a new database.
5. Apply all D1 migrations remotely.
6. Verify required encrypted Worker secrets.
7. Enable and re-read D1 read replication.
8. Configure and verify AI Gateway privacy and global rate limiting.
9. Configure and verify the single Free-plan zone rate-limit rule for the thread-message path.
10. Upload and enable the short-body API Shield schema and verify Endpoint Management.
11. Deploy the exact SHA to `sovv-web`.
12. Verify `/health`, `/ready`, current migration identity, current product copy/assets, security headers, unauthenticated boundaries, Stripe signature rejection, and all production domains.

A failed control or live probe means the release is incomplete.

## Free-capacity verification

Workers AI includes 10,000 neurons per UTC day on the Free plan. Sovereign.OS reserves against a 7,500-neuron application budget to leave operational headroom.

Before release, verify:

- `workers_ai_daily_capacity` exists;
- `/ready` reports `aiFreeCapacity: configured`;
- the active migration is `0013_workers_ai_free_capacity`;
- failed model calls release their neuron reservation;
- failed generation returns the user’s monthly AI turn;
- personalized calls bypass cache and persistent request logging;
- no paid-provider fallback is configured.

## Rollback procedure

- Keep the previous Worker version available for rollback.
- Do not rollback D1 with a destructive migration. Use forward-repair migrations.
- Roll back the Worker version without deleting encrypted secrets, the existing gateway, API Shield schema, or D1 database.
- Keep Stripe webhooks pointed at the last known good Worker until the repaired Worker passes signature, replay, and idempotency tests.
- Preserve the capacity ledger and D1 bookmark contract across rollback whenever the rolled-back runtime can read them safely.

## Health verification

Health may report application version, runtime mode, D1 readiness, Free-capacity ledger readiness, Durable Object readiness, Workers AI/Gateway configuration, Baseline provider configuration, authentication, Resend, Stripe, migration version, and degraded state. It must not reveal tokens, account IDs, provider payloads, exact locations, or private topology.

## Privacy verification

Before release, inspect logs and traces for raw birth inputs, exact private location, hidden reasoning, provider authorization headers, Stripe secrets, raw account IDs, and unconsented relationship/system context. The expected result is zero findings.

## Deterministic verification

- `pnpm verify:cloudflare-build` runs the canonical release, intelligence, visual, type, Worker-test, web-test, build, and compressed-bundle gates.
- `pnpm smoke:worker-gateway` verifies the Worker-to-AI adapter through a fake binding without credentials.
- `pnpm smoke:stripe` verifies Checkout, Portal, fixture webhooks, subscription projection, and entitlement resolution through the deterministic Stripe adapter.
- `pnpm smoke:product` verifies authenticated People, consent, Systems, Library, the disabled private-export boundary, deletion grace, billing fixtures, and Covenant Scripture retrieval with fake external providers.
- Live-only smoke checks require the scoped Cloudflare deployment token and must run through the repository-owned release path.

## Stripe setup

Use `STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY`, `STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`, and `STRIPE_PORTAL_RETURN_URL` for Checkout and Portal configuration. Domain entitlement logic depends only on stable feature keys, never Stripe product IDs embedded in domain logic.

## Covenant configuration

Covenant is opt-in per relevant turn or thread. The verified `WEB` Scripture library keeps passage text, citation metadata, and Sovereign interpretation separate. Model-authored Scripture is replaced or rejected; citations outside the authorized Scripture section are not accepted.

## Sharing and deletion

Private account export is disabled for launch. Public sharing includes only the Sovereign.OS public link and no private workspace data. Deletion enters a 14-day grace state and executes only through tested jobs with auditable completion records.

## Incident response

If Workers AI, AI Gateway, D1, Stripe, Resend, Scripture, or the Baseline provider degrades, fail closed, preserve safe public and saved-workspace state, return controlled retry information, avoid invented interpretations, and use forward-repair migrations or provider reconfiguration rather than destructive rollback.
