Production Readiness — Subagent

Scope
- Verify readiness signals and perimeter: /ready endpoints, exact deployed SHA, migration 0018 current/parity, rate limits, caching, webhook handling, Durable Objects behavior, D1 pressure, AI capacity
- Confirm security boundaries: auth/entitlement/privacy checks; Stripe webhook path and signature verification; preserve existing Cloudflare Access bypass for the exact webhook path (no blanket Service Auth)

Actions
- Run pnpm verify:cloudflare-build for the exact candidate SHA; only then run pnpm production:release:text when application code changed
- Record live evidence after deploy; keep HEAD vs deployed SHA distinct
- Report concrete gaps and propose minimal fixes/tests to the primary agent
