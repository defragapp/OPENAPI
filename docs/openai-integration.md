# AI integration notes

## Production inference path

Public Sovereign inference uses Cloudflare Workers AI through the existing AI Gateway:

```text
Authenticated Sovereign Worker → AI binding → AI Gateway `sovereign` → @cf/zai-org/glm-4.7-flash
```

The Worker does not read a personal or project OpenAI API key. The former `openai/gpt-5.5` Unified Billing path is retired for production because the current release is designed around Cloudflare-hosted Free-plan inference.

The reviewed runtime configuration is:

```text
AI_PROVIDER=cloudflare-gateway
AI_GATEWAY_ID=sovereign-ai-gateway
AI_MODEL=@cf/zai-org/glm-4.7-flash
AI_FREE_MONTHLY_TURNS=10
AI_SOVEREIGN_PLUS_MONTHLY_TURNS=300
```

A production model change requires privacy review, response-contract evaluation, cost review, and updates to every Wrangler and release-verification configuration.

## Worker binding and privacy

The Worker calls `env.AI.run()` through a request-bound adapter that:

- converts the existing prompt shape into Workers AI chat messages;
- requests structured JSON output;
- normalizes Workers AI chat-completion output into the stable `output_text` shape;
- uses the configured Gateway;
- forces cache bypass for personalized inference;
- disables persistent request/response logging;
- sends only reduced authorized Baseline/current context;
- keeps exact private location, secrets, source paths, and raw account IDs out of prompts and Gateway metadata.

## Access and allowance boundary

Stripe subscription webhooks project the effective Free or Sovereign+ plan into D1. Before inference, the message route reserves one monthly user turn atomically:

- Free: 10 turns per UTC calendar month.
- Sovereign+: 300 turns per UTC calendar month.

The Workers AI adapter also reserves conservative daily capacity in D1 before each hosted-model call. The production budget is intentionally below Cloudflare's account-wide free allocation so the platform returns a controlled capacity response before the provider hard limit is reached. Failed generation releases the daily reservation and refunds the user's monthly turn.

The required capacity schema is migration `0013_workers_ai_free_capacity`. Production readiness fails unless that ledger exists.

## Failure behavior

Production and preview never fall back to direct OpenAI or synthetic interpretation. If the AI binding, Gateway, daily free capacity, or private Baseline provider is unavailable, the Worker returns a clear unavailable state and does not invent a result.

The filename is retained for historical links; this document now describes the canonical Workers AI integration.