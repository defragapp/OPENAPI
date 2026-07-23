# AI integration notes

## Production inference path

Public Sovereign inference uses Cloudflare AI Gateway Unified Billing:

```text
Authenticated Sovereign Worker → AI binding → AI Gateway `sovereign` → openai/gpt-5.5
```

The Worker does not read a personal or project OpenAI API key. Cloudflare manages the provider credential and deducts inference cost from Unified Billing credits.

The reviewed runtime configuration is:

```text
AI_PROVIDER=cloudflare-gateway
AI_GATEWAY_ID=sovereign
AI_MODEL=openai/gpt-5.5
AI_FREE_MONTHLY_TURNS=10
AI_SOVEREIGN_PLUS_MONTHLY_TURNS=300
```

`openai/gpt-5.5` is used because the Cloudflare model catalog currently marks it as supporting Zero Data Retention. A model change requires a catalog/privacy check and behavior eval before release.

## Worker binding and privacy

The Worker calls `env.AI.run()` with:

- the configured gateway;
- cache bypass enabled;
- request/response logging disabled;
- pseudonymous account metadata;
- the effective Stripe-backed plan;
- reduced Baseline/current context only.

Raw birth input, exact private location, secrets, source paths, and raw account IDs are excluded from model input and Gateway metadata. Gateway Zero Data Retention must also be enabled at the account level; it is separate from request logging.

## Access and allowance boundary

Stripe subscription webhooks project the effective Free or Sovereign+ plan into D1. The message route then reserves one monthly AI turn atomically before inference:

- Free: 10 turns per UTC calendar month.
- Sovereign+: 300 turns per UTC calendar month.

The values are environment-configurable but must be reviewed with pricing and Cloudflare spend limits before release. Stripe is a flat subscription; it is not used as metered billing for individual model calls.

## Failure behavior

Production and preview never fall back to direct OpenAI or synthetic interpretation. If the AI binding, Gateway, Unified Billing credits, or private Baseline provider is unavailable, the Worker returns a clear unavailable state and does not invent a result.

References:

- https://developers.cloudflare.com/ai-gateway/features/unified-billing/
- https://developers.cloudflare.com/ai-gateway/usage/worker-binding-methods/
- https://developers.cloudflare.com/ai-gateway/features/spend-limits/
