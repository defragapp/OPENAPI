# Preview and production preparation

## Resource inventory

Configure preview and production separately. Do not reuse production IDs in local files.

- Cloudflare Worker: `sovv-web` in production or an environment-specific preview equivalent.
- Web application: same-origin route in front of the Worker/PWA shell.
- D1: canonical database with migrations applied in order.
- D1 Sessions: request-scoped sessions with opaque browser bookmarks for sequential API consistency.
- D1 read replication: automatic mode in production.
- Durable Object: `ThreadCoordinator` for turn ordering.
- AI binding: `AI` with `AI_PROVIDER=cloudflare-gateway`.
- AI Gateway: `AI_GATEWAY_ID=sovereign`.
- Workers AI model: `AI_MODEL=@cf/zai-org/glm-4.7-flash`.
- Global free-capacity ledger: migration `0013_workers_ai_free_capacity`.
- SOVV adapter: service binding or authenticated internal URL plus contract version `1`.
- Auth: signed, revocable D1-backed sessions.
- Stripe: test-mode secrets and price IDs only until explicit live approval.

## Secret inventory

Required encrypted Worker secrets must be configured in Cloudflare, not committed:

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

The Cloudflare build/deploy environment also requires a scoped `CLOUDFLARE_API_TOKEN` for the repository-owned deploy script to apply migrations and configure or verify D1 replication, AI Gateway controls, the Free-plan rate-limit rule, and API Shield.

No OpenAI provider key is accepted by the Worker. Production and preview use the Cloudflare AI binding and do not fall back to direct OpenAI.

## Canonical deployment runbook

1. Verify the exact target SHA is the current clean `main` head.
2. Allow Cloudflare Workers Builds to install with `pnpm install --frozen-lockfile`.
3. Run the configured build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`.
4. Require every foundation, migration, fixture, release, intelligence, visual, typecheck, test, build, and compressed Worker-size gate to pass.
5. Run the configured deploy command: `pnpm production:deploy`.
6. The deploy script applies D1 migrations, verifies secrets, configures Free-plan Cloudflare controls, deploys the exact SHA, and performs live production probes.
7. Treat the release as incomplete unless `/ready` reports the exact commit and current migration and all domain/security probes pass.

GitHub Actions and ad-hoc local commands are not production release authorities.

## Preview verification

Before production promotion, verify preview behavior for Today, Explore, People, Systems, Library, You, Gateway inference, the disabled private-export boundary, deletion grace, and Stripe test entitlements. Confirm:

- `sovereign-answer.v2` validation remains strict;
- exact Basis references are server-authorized;
- relationship and system context remains consent-bound;
- monthly allowance and daily free-capacity failures do not charge users for missing answers;
- personalized Gateway cache and persistent logs remain disabled;
- no direct OpenAI fallback exists.

## Rollback procedure

- Keep the previous Worker version available for rollback.
- Do not rollback D1 by destructive migration. Use forward-repair migrations.
- Change the active Worker version or route binding rather than deleting secrets.
- Keep Stripe webhooks pointed at the last known good Worker until the repaired Worker has passed replay and idempotency tests.
- A rollback may restore code, but it must not report readiness against a migration dependency it cannot satisfy.

## Health verification

Health and readiness may report application version, runtime mode, D1 readiness, Durable Object readiness, SOVV configuration, AI provider/Gateway configuration, Stripe configuration, migration version, and degraded state. They must not reveal tokens, account IDs, provider payloads, exact locations, or private topology.

Production readiness currently depends on migration `0013_workers_ai_free_capacity` and the presence of the daily AI capacity ledger.

## Privacy verification

Before release, inspect logs and traces for raw birth inputs, exact private location, hidden reasoning, provider authorization headers, Stripe secrets, and unconsented relationship/system context. The expected result is zero findings.

## Deterministic smoke tests

- `pnpm smoke:worker-gateway` verifies Worker-to-Gateway behavior through a fake Cloudflare AI binding without credentials.
- `pnpm smoke:stripe` verifies Checkout, Portal, fixture webhooks, subscription projection, and entitlement resolution through the deterministic Stripe adapter.
- `pnpm smoke:product` verifies authenticated People, consent, Systems, Library, disabled private export, deletion grace, billing fixtures, and Covenant Scripture retrieval with fake external providers.
- Production release verification is owned by `pnpm verify:cloudflare-build` and `pnpm production:deploy`, not a separate GitHub workflow.

## Stripe test-mode setup

Use `STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY`, `STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`, and `STRIPE_PORTAL_RETURN_URL` for Stripe test-mode Checkout and Portal configuration. Domain entitlement logic depends only on stable feature keys, never hard-coded Stripe product IDs.

## Scripture provider configuration

Covenant is opt-in per turn. The local fixture provider supports the configured `WEB` translation for deterministic tests and keeps retrieved passage text, citation metadata, and Sovereign interpretation separate. Production Scripture retrieval must use an approved configured provider and must not allow fabricated citations.

## Sharing and deletion

Private account export is disabled for launch. Public sharing includes only the Sovereign.OS public link and no private space data. Deletion enters a grace state and executes only through tested jobs with auditable completion records.

## Incident response notes

If Gateway, Workers AI, Stripe, SOVV, Scripture, or D1 dependencies degrade, fail closed, preserve safe public state, avoid invented interpretations, and use forward-repair migrations or provider reconfiguration rather than destructive rollback.