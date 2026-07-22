# AI integration notes

## Production inference path

Production Sovereign inference should use Cloudflare AI Gateway Unified Billing instead of a personal OpenAI API key:

```text
Sovereign Worker → Cloudflare AI Gateway → openai/gpt-5.6-terra
```

The default runtime configuration is:

```text
AI_PROVIDER=cloudflare-gateway
AI_GATEWAY_ID=sovereign
AI_MODEL=openai/gpt-5.6-terra
```

Cloudflare Unified Billing handles third-party provider authentication and billing through Cloudflare credits. `OPENAI_API_KEY` is not a production requirement for user traffic.


## Worker AI-binding adapter

The Worker message route now uses the Cloudflare `AI` binding when `AI_PROVIDER=cloudflare-gateway`. Before invoking the model, server code resolves the authenticated account, obtains reduced Baseline/current-condition context through OPENAPI adapters, removes source file paths and private fields, and sends only the public-safe reduced context plus the user request to the model.

The adapter calls the configured model through the Worker binding with AI Gateway metadata and `skipCache: true`, then normalizes streamed, response, async-iterable, or object outputs into the same public text stream used by the existing thread persistence layer. If the binding or gateway ID is missing, production fails closed instead of using direct OpenAI or an invented interpretation.

## Development-only direct OpenAI path

`AI_PROVIDER=openai-direct` may be used only for local development or temporary diagnostics. It uses the same Sovereign prompt, tools, and guardrails through the Agents SDK, but it is not the production default and must not power user traffic.

## Model adapter boundary

Sovereign behavior remains separate from provider authentication. The app resolves model configuration through `AI_PROVIDER` and `AI_MODEL`, then selects an adapter:

- `cloudflare-gateway`: preview/production path via Cloudflare AI Gateway Unified Billing.
- `openai-direct`: local development fallback requiring `OPENAI_API_KEY`.

Model changes require eval verification before production use. Production must not silently switch models without configuration review, and pricing plus behavior must be evaluated before changing the default.

## Agents SDK

The TypeScript Agents SDK remains useful for direct local development and for preserving Sovereign's tool contracts, prompt, guardrails, and eval path. Preview/production Cloudflare Gateway execution must keep the same behavior contract while routing model authentication through Cloudflare.

## ChatKit

The stale scaffold dependency `@openai/chatkit` has been replaced with the supported React package `@openai/chatkit-react`. ChatKit is not yet mounted as the full product shell because the Sovereign.OS surfaces must remain custom and same-origin. The current implementation uses a compatible streamed Worker response while preserving the option to add ChatKit as the conversation layer after server-issued session/client-secret behavior is implemented.

## Privacy

Tracing is configured to exclude sensitive data. Tool outputs are reduced adapter envelopes and must not include raw birth inputs, exact private location, secrets, or full account datasets.
