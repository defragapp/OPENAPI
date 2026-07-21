# Preview and production preparation

## Resource inventory

Configure preview and production separately. Do not reuse production IDs in local files.

- Cloudflare Worker: `sovereign-agent` or environment-specific equivalent.
- Web application: same-origin route in front of the Worker/PWA shell.
- D1: canonical database with migrations applied in order.
- Durable Object: `ThreadCoordinator` for turn ordering.
- AI binding: `AI` with `AI_PROVIDER=cloudflare-gateway`.
- AI Gateway: `AI_GATEWAY_ID`, default recommendation `sovereign`.
- Unified Billing model: `AI_MODEL=openai/gpt-5.6-terra`.
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

`OPENAI_API_KEY` is not a production requirement. It may be used only for `AI_PROVIDER=openai-direct` diagnostics.

## Deployment runbook

1. Verify the target branch and clean working tree.
2. Run `pnpm install --frozen-lockfile`.
3. Run `pnpm verify:foundation`, `pnpm verify:migrations`, `pnpm scan:secrets`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm smoke:worker-gateway`.
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
