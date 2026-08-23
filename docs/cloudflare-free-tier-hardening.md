# Cloudflare Free-Tier Hardening

Status: current production infrastructure guidance for `defragapp/OPENAPI`.

## Repository facts

- Authoritative Worker config: `/wrangler.jsonc` plus repository-generated production config.
- Production Worker: `sovv-web`.
- D1 binding: `DB`.
- D1 database: `sovereign-openapi-db`.
- Current schema: `0017_privacy_access_and_eligibility`.
- Capacity ledger foundation: `0013_workers_ai_free_capacity`.
- Release-evidence table foundation: `0015_release_evidence`.
- Policy-receipt foundation: `0016_policy_acceptance_receipts`.
- AI Gateway ID: `sovereign-ai-gateway`.
- AI model: `@cf/zai-org/glm-4.7-flash` through the Workers AI binding.
- Answer contract: `sovereign-answer.v2`.
- Queue and R2: disabled.
- Private export: on-demand from D1, no retained artifact.
- Worlds/video generation: not part of the current launch runtime.

Do not replace production names with placeholders or create alternate data paths.

## Production authority

For the current text-first launch:

```bash
pnpm verify:cloudflare-build
pnpm production:release:text
```

The release command must target the same exact current `origin/main` SHA that passed the full deterministic gate. It performs one deploy and intentionally excludes live Browser Rendering.

`pnpm production:release:oauth` remains an optional Browser-audited path when explicitly requested. Historical Workers Builds triggers/build tokens, GitHub Actions, deploy hooks, Pages, preview Workers, duplicate production Workers, and alternate repositories are outside production authority.

See `docs/production-release.md` for exact sequencing and release-evidence semantics.

## Production release control sequence

The text-first release path:

1. rejects a checkout that does not match exact current `origin/main`;
2. verifies migrations/release configuration;
3. verifies the publicly served DMARC record;
4. resolves the existing production D1 database and prepares the exact production config;
5. applies migrations through `0017_privacy_access_and_eligibility`;
6. verifies required Worker secrets;
7. configures/verifies the Free-plan controls below;
8. deploys exactly one `sovv-web` version;
9. verifies parent-domain/runtime and secondary public routes without Browser Rendering;
10. writes exact-SHA release evidence and converges it across both branded domains.

A credential must support all operations the repository owns. A Worker upload succeeding does not prove release completion if route/control reconciliation fails afterward.

## D1 Sessions and read replication

The Worker uses request-scoped `DB.withSession(...)` connections for `/api/*` requests.

1. Requests without a bookmark begin with `first-primary`.
2. The Worker returns the latest opaque D1 bookmark after a query.
3. The browser stores it in session storage.
4. Later same-origin API calls return the bookmark.
5. Invalid/oversized/control-character values are ignored.
6. The bookmark is cleared on logout.
7. Requests producing no bookmark continue normally.

The bookmark is a consistency marker, not an authentication credential. Authentication remains the signed, revocable `__Host-sovereign_session` cookie.

Production read replication remains `auto` on the existing `sovereign-openapi-db`. The release path never creates a replacement database merely to enable replication.

## Free Workers AI inference

Production and preview use `@cf/zai-org/glm-4.7-flash` through the Cloudflare AI binding/Gateway.

Every personalized call enforces:

- `skipCache: true`;
- `collectLog: false`;
- structured JSON response mode;
- low-temperature structured generation;
- `sovereign-answer.v2` validation;
- authorized answer mode and Basis references;
- Covenant grounding where explicitly enabled;
- output-safety review.

The current product is text-first; no video-provider budget or generated-media path is part of this Free-tier launch architecture.

## Global daily capacity

Migration `0013_workers_ai_free_capacity` creates the D1 ledger `workers_ai_daily_capacity`.

Sovereign reserves conservatively below the account-level Workers AI allocation. Production is configured for `250,000` neurons per UTC day, while the fail-closed runtime default remains `7,500` when the variable is absent or invalid. At the current Workers AI neuron price, the configured ceiling is approximately `$2.64/day` after the included daily allocation, before any applicable taxes or plan fees. Before a hosted-model call, the Worker atomically reserves estimated capacity. Source-level model failure releases the reservation. If internal capacity is unavailable, Sovereign returns a controlled capacity response and does not guess or save an invented answer.

A failed generation also releases the user’s monthly reservation where the current product contract requires it.

## AI request boundary

The public composer accepts at most 10,000 characters. The Worker independently enforces a 64 KiB JSON-body ceiling while streaming and a 12,000-character normalized-message ceiling on every thread-message route. The production preflight applies the same bounded parser before safety, entitlement, database, Durable Object, or model work. Requests above either server limit receive a controlled `413` response and are not delegated to inference.

Neuron reservation estimates use serialized UTF-8 byte length with a conservative one-byte-per-token upper bound. This prevents non-ASCII input from receiving a smaller reservation than its encoded payload warrants. The output reservation still uses the requested maximum or the guarded 3,200-token default.

## Monthly account allowances

- Free: 10 Sovereign turns per UTC month.
- Sovereign+: 300 Sovereign turns per UTC month.

Monthly plan access is server-derived. The browser cannot self-declare Sovereign+.

## AI Gateway

The production control script verifies the existing `sovereign-ai-gateway` configuration, including:

- account-wide rate limiting at `500 requests / 60 seconds` with a sliding window;
- a `$2.75` rolling 24-hour spend rule;
- a `$75` rolling 30-day spend rule;
- cache TTL zero for the configured path;
- persistent request-content logging disabled.

Gateway spend enforcement is eventually consistent, so the atomic D1 neuron ledger remains the strict primary cost ceiling during concurrent bursts. Gateway rules are defense in depth and return `429` after their tracked window reaches the configured amount. No paid video-model spend guard is required for the current launch because video generation is not activated.

## Zone rate limiting

The repository owns one Free-plan zone rate-limit rule for matching thread-message paths:

- path: `/api/v1/threads/*/messages`;
- expression fields: Free-plan-compatible path fields only;
- characteristic: source IP and Cloudflare data center;
- limit: 10 matching requests per 10 seconds;
- mitigation: block for 10 seconds.

The release script identifies its own rule before updating it. If an unrelated rule occupies the one available Free-plan rate-limit slot, release preparation stops rather than silently deleting or replacing that rule.

## API Shield and Endpoint Management

`docs/api-shield/sovereign-critical-api.openapi.yaml` covers security-sensitive mutation bodies for account onboarding, current-condition settings, person/invitation consent, Stripe Checkout/Portal, and account deletion approval.

Turnstile-bearing authentication requests are intentionally excluded from blocking request-body schema validation because the Free plan has a limited body-inspection window. Authentication remains protected by Turnstile, origin checks, rate limits, input limits, one-time credentials, signed cookies, and D1 revocation.

The release control path:

1. owns only the schema named for the Sovereign.OS critical API;
2. ensures required operations exist in Endpoint Management;
3. enables the intended schema validation behavior;
4. re-reads schema/operations/settings before deployment proceeds.

Cloudflare Endpoint Management may normalize named OpenAPI path parameters such as `{personId}` and `{scope}` into positional templates such as `{var1}` and `{var2}`. The repository normalizes both expected and returned templates before comparison. This prevents false “missing operation” failures without weakening the actual route/method contract.

## Production credential expectation

The production Cloudflare credential must be able to complete the bounded repository-owned operations required by the release, including Worker deployment, D1 access/migrations, Worker secret inspection, AI Gateway/control reads/writes where applicable, API Shield/Endpoint Management reconciliation, and the owned zone rate-limit rule.

Do not treat a credential as sufficient merely because `wrangler deploy` can upload the Worker. Release preparation/control reconciliation is part of the same production authority and fails closed when required permissions are absent.

## Worker bundle budget

The Cloudflare Workers Free compressed upload limit remains 3 MiB. Sovereign.OS enforces a stricter internal budget of 2,500 KiB.

```bash
pnpm build
pnpm verify:worker-bundle-size
```

The verifier uses Wrangler dry-run output and parses the compressed upload measurement.

## Release evidence provenance

Automated Browser evidence is explicit:

- route-cohesion Browser audit actually passed → `routeCohesionVerified: true`;
- rendered-visual Browser audit actually passed → `renderedVisualVerified: true`;
- text-first release without Browser Rendering → both fields `false`.

Human desktop/iPhone QA is separate evidence and never changes those automated fields by itself.
