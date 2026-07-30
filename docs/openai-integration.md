# AI integration notes

This path is retained for existing repository references. Production no longer depends on an OpenAI API key or a separately billed OpenAI model.

## Production inference path

Public Sovereign inference uses Cloudflare-hosted Workers AI through the existing AI Gateway:

```text
Authenticated Sovereign Worker → Workers AI binding → AI Gateway `sovereign` → @cf/zai-org/glm-4.7-flash
```

The reviewed runtime configuration is:

```text
AI_PROVIDER=cloudflare-gateway
AI_GATEWAY_ID=sovereign
AI_MODEL=@cf/zai-org/glm-4.7-flash
AI_FREE_MONTHLY_TURNS=10
AI_SOVEREIGN_PLUS_MONTHLY_TURNS=300
```

`@cf/zai-org/glm-4.7-flash` is Cloudflare-hosted, supports structured chat-completion input, function calling, and a large context window, and runs inside the Workers AI daily Free allocation. A model change requires schema, pricing, privacy, safety, and answer-quality evaluation before release.

## Request and response normalization

The application’s existing synthesis calls use a stable internal request shape. The request-scoped AI wrapper converts that shape for Workers AI:

- `input` becomes a user `messages` entry;
- `max_output_tokens` becomes `max_completion_tokens`;
- JSON response mode is requested;
- temperature defaults to `0.2` for structured output;
- chat-completion `choices[].message.content` is normalized back to `output_text`.

This keeps the canonical Sovereign and Baseline-facet parsers provider-independent while production remains on the Cloudflare-hosted model.

## Gateway privacy

Every personalized inference request enforces:

- `skipCache: true`;
- `collectLog: false`;
- zero gateway cache TTL at the account configuration layer;
- pseudonymous account metadata only;
- reduced, consent-filtered Baseline/current context;
- no raw birth input, exact private location, secret, source path, or raw account ID.

AI Gateway analytics may retain aggregate operational metrics without persistent prompt/response content.

## Access and Free-capacity boundary

Stripe subscription webhooks project the effective Free or Sovereign+ plan into D1. The message route reserves one monthly AI turn atomically before inference:

- Free: 10 turns per UTC calendar month.
- Sovereign+: 300 turns per UTC calendar month.

Migration `0013_workers_ai_free_capacity` adds a shared UTC-day reservation ledger. The estimator uses the active model’s current neuron rates and reserves conservatively from input size plus maximum output size. The production budget is capped at 7,500 neurons, leaving a 25% buffer below Cloudflare’s 10,000-neuron daily Free allocation.

A failed model call releases its daily reservation and returns the user’s monthly turn. Successful calls remain counted. If shared capacity is unavailable, the Worker returns a controlled `429` response with the UTC reset time rather than crossing into paid usage.

## Failure behavior

Production and preview never fall back to direct OpenAI or synthetic interpretation. If Workers AI, AI Gateway, the Free-capacity ledger, or the private Baseline provider is unavailable, the Worker returns a clear unavailable state and does not invent a result.

References:

- https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/ai-gateway/features/rate-limiting/
- https://developers.cloudflare.com/ai-gateway/features/caching/
