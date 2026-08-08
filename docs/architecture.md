# Sovereign.OS production architecture

## Executive summary

Sovereign.OS is a TypeScript-first pnpm monorepo in `defragapp/OPENAPI`.

The production system consists of:

- a React 19 and Vite PWA;
- one Cloudflare Worker named `sovv-web`;
- D1 as canonical storage;
- one Durable Object per thread for sequencing and idempotency;
- Cloudflare Workers AI through the `sovereign` AI Gateway;
- Turnstile, Resend, and Stripe;
- static assets served by the same Worker;
- Cloudflare Workers Builds as the only supported build and deployment authority.

`defragapp/SOVV` remains read-only reference material. All production implementation belongs to OPENAPI.

## Deployment authority

Production is connected directly to `defragapp/OPENAPI` on `main`.

- Worker: `sovv-web`
- Repository root: `/`
- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm production:deploy`
- Production deploy implementation: `scripts/cloudflare-production-deploy-v2.mjs`
- Cloudflare control implementation: `scripts/configure-cloudflare-free-tier.mjs`

GitHub Actions, Cloudflare Pages, duplicate production Workers, Queue, and R2 are not supported release paths.

A release is complete only when the exact Workers Builds commit:

1. passes foundation, migration, secret, fixture, release, intelligence, visual, type, test, build, and compressed-bundle checks;
2. applies D1 migrations;
3. configures and verifies Cloudflare Free-plan controls;
4. deploys the exact commit SHA;
5. reports that SHA from `/health` and `/ready`;
6. reports migration `0013_workers_ai_free_capacity`;
7. passes live public, application, authentication, billing, security-header, and 404 probes.

## Product contract

Sovereign.OS is Baseline-first. It must provide value before the user describes an incident.

The single user-facing agent is Sovereign. Defrag, Alignment, and Covenant are internal reasoning lenses.

Authenticated navigation is:

- Today
- Explore
- People
- Systems
- Library
- You

The only supported answer contract is `sovereign-answer.v2`. Exact source data, interpretive Baseline facets, temporary current context, and question-specific synthesis remain separate. The model selects server-authorized Basis IDs and never invents displayed Basis values.

Alignment is a structured comparison, never a score, gauge, percentage, or sentiment calculation.

## Runtime responsibilities

### Web application

The web application provides:

- the public Sovereign.OS experience;
- authentication and onboarding;
- the single-room intelligence workspace;
- Today, Explore, People, Systems, Library, and You;
- consent and invitation controls;
- responsive mobile and iOS safe-area behavior;
- D1 bookmark continuity for same-origin API requests;
- no shared caching of private API responses.

### Sovereign Worker

The Worker provides:

- authentication and same-origin enforcement;
- entitlement checks;
- thread sequencing and idempotency;
- Baseline and current-condition computation;
- consent-filtered relationship and system context;
- structured Sovereign answer generation;
- exact Basis validation;
- Covenant opt-in and Scripture grounding;
- safety review;
- Stripe webhooks and hosted billing handoffs;
- privacy-safe operational health and readiness.

### D1

D1 is canonical for:

- accounts and revocable sessions;
- Baseline source data and facet profiles;
- current-condition snapshots;
- people, invitations, consent, and systems;
- threads, turns, events, and corrections;
- saved Library understanding;
- Stripe projections and webhook idempotency;
- monthly account AI usage;
- the global Workers AI daily reservation ledger.

Read replication is enabled on `sovereign-openapi-db`. API requests use request-scoped D1 Sessions. Requests without a bookmark begin with `first-primary`; later same-origin requests reuse an opaque validated bookmark.

### Durable Objects

`ThreadCoordinator` serializes concurrent sends, allocates sequence numbers, and rejects duplicate turns. D1 remains the canonical source of truth.

## Free Workers AI path

Production and preview use the Cloudflare-hosted model:

```text
@cf/zai-org/glm-4.7-flash
```

The Worker normalizes existing prompt input into Workers AI chat messages and normalizes hosted chat-completion output back into the stable `output_text` form expected by Sovereign and Baseline-facet parsers.

Every personalized model request enforces:

- `skipCache: true`;
- `collectLog: false`;
- JSON response mode;
- low-temperature structured generation;
- `sovereign-answer.v2` parsing;
- authorized answer mode and Basis references;
- output safety review.

### Global daily capacity

Cloudflare Workers AI Free provides a finite daily neuron allocation. Sovereign reserves conservatively against a 7,500-neuron daily internal budget, leaving capacity below the account-level 10,000-neuron hard limit.

The estimate uses:

- 5,500 neurons per million input tokens;
- 36,400 neurons per million output tokens;
- two characters per estimated token;
- the requested maximum output size.

Reservations are atomic in D1. A source-level model failure releases its reservation. If the internal daily budget is exhausted, Sovereign returns a controlled `429` response until the next UTC day without guessing an answer.

A failed generation also refunds the user’s monthly turn.

## Cloudflare Free-plan controls

The production deploy configures and verifies:

### D1

- read replication mode: `auto`;
- request-scoped D1 Sessions;
- migration `0013_workers_ai_free_capacity`;
- readiness failure when the capacity ledger is missing.

### AI Gateway

- gateway ID: `sovereign`;
- cache TTL: zero;
- persistent request-content logging: disabled;
- global rate limit: 50 requests per 60 seconds;
- sliding technique.

### Zone rate limiting

The single Free-plan rule protects matching thread-message paths:

```text
/api/v1/threads/*/messages
```

It uses only Free-plan-supported path fields, counts by source IP and Cloudflare data center, permits 10 matching requests per 10 seconds, and blocks for 10 seconds.

### API Shield

`docs/api-shield/sovereign-critical-api.openapi.yaml` validates short, security-sensitive mutations for:

- account onboarding;
- current-condition settings;
- consent decisions;
- Stripe Checkout and portal handoffs;
- account deletion approval.

Turnstile-bearing authentication payloads are intentionally excluded from blocking schema validation because Free-plan request-body inspection is limited to the first 1 KB. Authentication remains protected by Turnstile, origin checks, rate limits, input limits, one-time credentials, signed cookies, and D1 revocation.

## Security and privacy

Treat birth inputs, exact location, Baseline data, relationship data, system membership, spiritual prompts, Stripe references, and thread content as sensitive.

The model never receives raw birth inputs, exact private location, credentials, or unrelated account history.

Required controls include:

- HTTP-only secure session cookies;
- server-side Turnstile verification;
- strict same-origin mutation checks;
- D1-backed revocation and logout-all;
- consent enforcement before relationship or system context is loaded;
- prepared D1 statements;
- idempotent Stripe webhooks and AI turns;
- no personalized AI cache;
- no persistent prompt logging;
- no private export at launch;
- explicit deletion lifecycle.

## Billing and entitlements

Stripe is authoritative for paid billing. Sovereign.OS uses hosted Checkout and Customer Portal sessions, signed webhooks, D1 entitlement projections, and deterministic server-side feature gates.

Free includes 10 Sovereign AI turns per month. Sovereign+ includes 300 turns per month and the paid relationship, system, Library continuity, and Covenant entitlements represented in the product contract. Monthly account quotas operate beneath the global daily Free-plan capacity gate.

## Release gates

The platform is release-ready only when:

1. Today provides useful Baseline-first value without incident entry.
2. Baseline and current conditions remain distinct.
3. `sovereign-answer.v2` validates every generated answer.
4. invented Basis references and score-based Alignment output are rejected.
5. consent is enforced and revocable.
6. D1 migrations and readiness dependencies are current.
7. the Worker compressed upload remains below the 2,500 KiB internal budget and 3 MiB Free-plan limit.
8. Workers AI, D1, Durable Objects, assets, authentication, Resend, and Stripe report configured.
9. Cloudflare Free-plan gateway, rate-limit, replication, and API Shield controls verify through the API.
10. the exact commit SHA is live on `sovereign.defrag.app` and `app.defrag.app`.

## Non-negotiable repository rule

No implementation changes are made in `defragapp/SOVV`. Any future requirement to change SOVV must be separately authorized, narrowly scoped, reversible, and independently reviewed.
