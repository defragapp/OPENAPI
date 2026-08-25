# AI integration notes

Status: current production inference path. The historical filename is retained for links; production does not use a direct OpenAI API integration.

## Production inference path

Sovereign inference uses Cloudflare Workers AI through the existing AI Gateway:

```text
Authenticated Sovereign Worker → AI binding → AI Gateway `sovereign-ai-gateway` → @cf/zai-org/glm-4.7-flash
```

The Worker does not read a personal or project OpenAI API key. There is no direct OpenAI fallback in the production answer path.

Current runtime configuration:

```text
AI_PROVIDER=cloudflare-gateway
AI_GATEWAY_ID=sovereign-ai-gateway
AI_MODEL=@cf/zai-org/glm-4.7-flash
AI_FREE_MONTHLY_TURNS=10
AI_SOVEREIGN_PLUS_MONTHLY_TURNS=300
```

A model/provider change requires privacy review, response-contract evaluation, cost/capacity review, and updates to repository release configuration/tests.

## Text-first launch

The current authenticated product is text-first. The model returns structured `sovereign-answer.v2` data for the canonical Sovereign thread. The answer is complete without a video renderer.

Landing demo chats may demonstrate the hierarchy, but authenticated production uses real account/Baseline/permission context and the real inference path. Canned/random demo answers must never replace production inference.

Worlds/video generation is not part of the current launch and no video-provider credential or spend path is required.

## Worker binding and privacy

The Worker calls `env.AI.run()` through the request-bound adapter that:

- converts Sovereign prompt input into Workers AI chat messages;
- requests structured JSON output;
- normalizes hosted output into the stable form used by Sovereign/Baseline parsers;
- uses the configured AI Gateway;
- forces cache bypass for personalized inference;
- disables persistent request/response-content logging for the personalized request;
- sends only reduced authorized Baseline/current/relationship/system context;
- keeps raw birth input, exact private location, auth material, billing IDs, invitation secrets, unrelated account history, and raw account identifiers out of model context/metadata.

## Access and allowance boundary

Stripe subscription webhooks project effective Free/Sovereign+ state into D1. Before ordinary inference, the message route reserves one monthly turn atomically:

- Free: 10 turns per UTC month.
- Sovereign+: 300 turns per UTC month.

The Workers AI adapter also reserves conservative daily capacity in D1 before each hosted-model call. If the internal daily budget is exhausted, Sovereign returns a controlled unavailable/capacity response rather than inventing an answer.

A source-level model failure releases the daily reservation and refunds the user’s monthly turn where the current contract requires it.

Migration `0013_workers_ai_free_capacity` introduced the global capacity ledger. Release-evidence tables were introduced by `0015_release_evidence`. **Current production schema parity is `0018_workers_ai_capacity_reservations`.** Readiness requires the current migration plus release evidence, policy receipt, and privacy-access dependencies.

## Failure behavior

Production and preview never fall back to direct OpenAI or synthetic interpretation. If the AI binding, Gateway, daily capacity, Baseline provider, or required authorization state is unavailable, the Worker returns a controlled unavailable state and does not fabricate a result.

Deterministic grounded/urgent/secure-refusal responses are handled by the server-owned safety boundary and do not require ordinary inference capacity.
