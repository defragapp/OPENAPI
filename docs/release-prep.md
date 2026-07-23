# Preview and production preparation

## Resource inventory

Configure preview and production separately. Do not reuse production IDs in local files.

- Cloudflare Worker: `sovereign-agent` or environment-specific equivalent.
- Web application: same-origin route in front of the Worker/PWA shell.
- D1: canonical database with migrations applied in order.
- Durable Object: `ThreadCoordinator` for turn ordering.
- AI binding: `AI` with `AI_PROVIDER=cloudflare-gateway`.
- AI Gateway: `AI_GATEWAY_ID`, default recommendation `sovereign`.
- Unified Billing model: `AI_MODEL=openai/gpt-5.5`.
- SOVV adapter: service binding or authenticated internal URL plus contract version `1`.
- Auth: signed session migration path or verified SOVV identity cookie.
- Stripe: test-mode secrets and price IDs only until explicit live approval.

## Secret inventory

Required secrets must be configured as platform secrets, not committed:

- `SESSION_SIGNING_SECRET`
- `SOVV_INTERNAL_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- GitHub Actions only: `CLOUDFLARE_API_TOKEN` for live smoke verification.

No OpenAI provider key is accepted by the Worker. Cloudflare Unified Billing is the only production and preview inference path.

## Deployment runbook

1. Verify the target branch and clean working tree.
2. Run `pnpm install --frozen-lockfile`.
3. Run `pnpm verify:foundation`, `pnpm verify:migrations`, a fresh local D1 migration replay, `pnpm scan:secrets`, `pnpm scan:production-fixtures`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm smoke:worker-gateway`, `pnpm smoke:stripe`, and `pnpm smoke:product`.
4. Review D1 migrations and apply to preview first.
5. Configure Worker bindings and secrets in preview.
6. Run authenticated preview smoke tests for Today, Explore, People, Systems, Library, You, Gateway streaming, export, deletion grace, and Stripe test entitlements.
7. Verify health output reports degraded dependencies safely and no secrets.
8. Promote to production only after explicit approval.

## Rollback procedure

- Keep the previous Worker version available for rollback.
- Do not rollback D1 by destructive migration. Use forward-repair migrations.
- Disable Gateway traffic by changing route binding or Worker version, not by deleting secrets.
- Keep Stripe webhooks pointed at the last known good Worker until the repaired Worker has passed replay/idempotency tests.

## Health verification

Health may report application version, runtime mode, D1 readiness, Durable Object readiness, SOVV configuration, AI provider/gateway configuration, Stripe configuration, migration version, and degraded state. It must not reveal tokens, account IDs, provider payloads, exact locations, or SOVV private topology.

## Privacy verification

Before release, inspect logs and traces for raw birth inputs, exact private location, hidden reasoning, provider authorization headers, Stripe secrets, and unconsented relationship/system context. The expected result is zero findings.


## Local deterministic smoke tests

- `pnpm smoke:worker-gateway` verifies Worker-to-Gateway streaming through a fake Cloudflare AI binding without credentials.
- `pnpm smoke:stripe` verifies Checkout, Portal, fixture webhooks, subscription projection, and entitlement resolution through the deterministic Stripe adapter.
- `pnpm smoke:product` verifies authenticated People, consent, Systems, Library, export/deletion grace, billing fixtures, and Covenant Scripture retrieval with fake external providers.
- `pnpm smoke:gateway` and `pnpm smoke:sovereign` are live-only and require Cloudflare account variables plus the scoped `CLOUDFLARE_API_TOKEN` GitHub secret.

## Stripe test-mode setup

Use `STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY`, `STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`, and `STRIPE_PORTAL_RETURN_URL` for Stripe test-mode Checkout and Portal configuration. Domain entitlement logic depends only on stable feature keys, never hard-coded Stripe product IDs.

## Scripture provider configuration

Covenant is opt-in per turn. The local fixture provider supports the configured `WEB` translation for deterministic tests and keeps retrieved passage text, citation metadata, and Sovereign interpretation separate. Production Scripture retrieval must use an approved configured provider and must not allow fabricated citations.

## Export and deletion

Exports must include only user-owned or currently consented records and must exclude secrets, authorization material, hidden reasoning, raw provider payloads, raw birth inputs, and exact private location. Deletion enters a grace state and should be executed only by tested jobs with auditable completion records.

## Incident response notes

If Gateway, Stripe, SOVV, Scripture, or D1 dependencies degrade, fail closed, preserve safe public state, avoid invented interpretations, and use forward-repair migrations or provider reconfiguration rather than destructive rollback.
