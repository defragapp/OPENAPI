# Cloudflare Free-Tier Hardening

Prepared for the `defragapp/OPENAPI` production architecture.

## Repository facts

- Authoritative Worker config: `/wrangler.jsonc` and `/wrangler.production-direct.jsonc`.
- Production Worker: `sovv-web`.
- D1 binding: `DB`.
- D1 database: `sovereign-openapi-db`.
- Current migration: `0015_release_evidence`.
- Migrations directory: `apps/sovereign-worker/migrations`.
- AI Gateway ID: `sovereign-ai-gateway`.
- AI model: `@cf/zai-org/glm-4.7-flash` through the Workers AI binding.
- Answer contract: `sovereign-answer.v2`.
- Queue and R2: disabled.

Do not replace production names with placeholders or create alternate data paths.

## Production authority

The current production release path is:

```bash
pnpm production:release:oauth
```

The wrapper selects the exact current `origin/main` SHA, establishes a fresh current-member Wrangler OAuth session, runs `pnpm verify:cloudflare-build`, executes the internal `pnpm production:deploy` stage, and proves exact-SHA readiness and release evidence on both branded domains.

Historical Cloudflare Workers Builds trigger and build-token wiring is not current production authority. GitHub Actions, deploy hooks, Pages, preview Workers, duplicate production Workers, and alternate repositories are also outside production authority.

The internal `pnpm production:deploy` stage:

1. receives the exact release SHA selected by the OAuth wrapper;
2. resolves the existing D1 database ID;
3. applies all D1 migrations;
4. verifies required Worker secrets;
5. configures and verifies the Free-plan Cloudflare controls below;
6. deploys the exact SHA;
7. verifies both live domains, current product copy, immutable assets, security headers, authentication boundaries, Stripe signature rejection, migration identity, and readiness version.

The release fails closed when an infrastructure control or live verification does not match the repository contract.

## D1 Sessions and read replication

The Sessions API does not require a new D1 binding. The Worker creates a request-scoped `DB.withSession(...)` connection for `/api/*` requests.

1. Requests without a bookmark begin with `first-primary`.
2. The Worker returns the latest opaque bookmark in `x-d1-bookmark` after a D1 query.
3. The browser stores it in session storage.
4. Later same-origin API calls return the bookmark.
5. Invalid, oversized, or control-character values are ignored.
6. The bookmark is cleared on logout.
7. Requests that produce no bookmark continue normally.

The bookmark is a consistency marker, not an authentication credential. Authentication remains the signed, revocable `__Host-sovereign_session` cookie.

The deploy script enables and verifies `read_replication.mode = auto` on the existing `sovereign-openapi-db`. It never creates a replacement database merely to enable replication.

## Free Workers AI inference

Production and preview use the Cloudflare-hosted `@cf/zai-org/glm-4.7-flash` model. Normal product turns therefore use the Workers AI Free allocation rather than a separately billed third-party model.

The request boundary normalizes Sovereign prompts into Workers AI chat messages and normalizes hosted-model output back into the stable `output_text` shape expected by the answer and Baseline-facet parsers.

Every personalized call enforces:

- `skipCache: true`;
- `collectLog: false`;
- JSON response mode;
- low temperature for structured output;
- `sovereign-answer.v2` validation;
- authorized Basis references and answer modes;
- Covenant grounding;
- output-safety review.

## Global daily Free capacity

Cloudflare Workers AI Free provides 10,000 neurons per UTC day. Sovereign.OS reserves against a lower internal budget of 7,500 neurons, leaving a 25% buffer for model variance and other account activity.

The conservative estimate uses:

- 5,500 neurons per million input tokens;
- 36,400 neurons per million output tokens;
- two characters per estimated token;
- the requested maximum output size.

Migration `0013_workers_ai_free_capacity` creates the D1 ledger `workers_ai_daily_capacity`.

Before a hosted model call, the Worker atomically reserves the estimated neurons. A source-level model failure releases that reservation. If the internal daily budget is unavailable, Sovereign returns `429 sovereign_free_capacity_reached` with a UTC reset time and does not guess or save an answer.

The readiness endpoint fails unless the capacity ledger exists. A failed generation also returns the user’s reserved monthly turn.

## Monthly account allowances

Monthly account allowances remain deterministic product limits:

- Free: 10 Sovereign turns per month.
- Sovereign+: 300 Sovereign turns per month.

A turn is reserved atomically before generation. When generation fails, the monthly reservation is released. Successful calls remain counted even when later presentation or parsing work fails, because Workers AI capacity was actually consumed.

## AI Gateway and per-IP protection

The deploy script updates and verifies the existing `sovereign-ai-gateway` gateway with:

- 50 requests per 60 seconds;
- sliding rate-limit technique;
- cache TTL zero;
- persistent request-content logs disabled.

Gateway limiting is account-wide, not per-IP. The script separately owns the single Free-plan zone rate-limit rule for matching thread-message paths:

- Path: `/api/v1/threads/*/messages`.
- Free-plan expression fields: path only.
- Characteristic: source IP and Cloudflare data center.
- Limit: 10 matching requests per 10 seconds.
- Mitigation: block for 10 seconds.

If an unrelated rule occupies the one Free-plan rate-limit slot, deployment stops rather than silently deleting it.

No paid-model spend limit is required because the active production model is Cloudflare-hosted Workers AI.

## API Shield

`docs/api-shield/sovereign-critical-api.openapi.yaml` covers short, security-sensitive mutation bodies:

- account onboarding;
- current-condition settings;
- person and invitation consent;
- Stripe Checkout and billing portal handoffs;
- account deletion approval.

Authentication requests carrying Turnstile tokens are intentionally excluded from blocking schema validation because the Free plan inspects only the first 1 KB of request bodies. Those routes remain protected by Turnstile, same-origin enforcement, rate limits, token-length limits, D1 state, and Worker validation.

The deploy script:

1. Replaces only the schema named `Sovereign.OS Critical API`.
2. Enables its validation.
3. Ensures the required operations exist in Endpoint Management.
4. Sets the schema validation mitigation to `block`.
5. Re-reads the schema, operations, and settings before deployment continues.

API Shield validates incoming HTTP requests. It does not validate AI responses. `sovereign-answer.v2` remains enforced inside the Worker.

## Worker bundle budget

The Cloudflare Workers Free compressed upload limit is 3 MiB. Sovereign.OS enforces a stricter internal budget of 2,500 KiB.

```bash
pnpm build
pnpm verify:worker-bundle-size
```

The verifier runs Wrangler in dry-run mode and parses Wrangler’s gzip upload measurement. It does not rely on an assumed uncompressed `dist/index.js` path.

## Canonical contract validation

The supplied external mock was rejected because it used:

- `version: "2.0"` instead of `version: "sovereign-answer.v2"`;
- `baseline` instead of `headline`, `direct_answer`, and structured sections;
- `basis_references` instead of `basis_refs`;
- `alignment_score`, which the repository prohibits;
- `covenant_id`, which would bypass explicit thread-level Covenant confirmation.

Regression tests reject that shape, missing `safety_mode`, invented Basis references, and score fields added to otherwise valid answers.
