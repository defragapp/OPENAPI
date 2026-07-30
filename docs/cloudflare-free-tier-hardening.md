# Cloudflare Free-Tier Hardening

Prepared for the `defragapp/OPENAPI` production architecture.

## Repository facts

- Authoritative Worker config: `/wrangler.jsonc` and `/wrangler.production-direct.jsonc`.
- Production Worker: `sovv-web`.
- D1 binding: `DB`.
- D1 database: `sovereign-openapi-db`.
- Migrations: `apps/sovereign-worker/migrations`.
- AI Gateway ID: `sovereign`.
- AI model: `openai/gpt-5.5`.
- Answer contract: `sovereign-answer.v2`.

Do not replace these values with placeholder names or alternate migration paths.

## D1 Sessions and read replication

The Sessions API does not require a new D1 binding shape. Read replication is enabled on the existing D1 database in the Cloudflare dashboard. The application must then use `DB.withSession(...)` for requests that should benefit from replicas and cross-request sequential consistency.

This release implements the transport:

1. API requests without a bookmark begin with `first-primary` so authentication, consent, billing, and account state start from current primary data.
2. The Worker returns the latest opaque bookmark in `x-d1-bookmark`.
3. The browser stores that bookmark in session storage.
4. Later same-origin `/api/*` calls return the bookmark.
5. Invalid, oversized, or control-character bookmark values are ignored.
6. The bookmark is cleared on logout.

The bookmark is a database consistency marker, not an authentication token. Authentication remains the signed, revocable `__Host-sovereign_session` cookie.

### Cloudflare account action

Enable read replication for the existing `sovereign-openapi-db` database:

`D1 > sovereign-openapi-db > Settings > Read Replication`

Do not create a replacement database and do not insert a placeholder `database_id` into the repository.

## AI Gateway controls

The repository already sets `skipCache: true` and `collectLog: false` for personalized Sovereign requests. Preserve both settings.

The default AI Gateway rate limiter applies uniformly to the gateway. It is not a per-IP limiter. For gateway-wide protection, configure the existing `sovereign` gateway with:

- Rate limit: 50 requests.
- Interval: 60 seconds.
- Technique: sliding.
- Persistent request-content logging: disabled.
- Cache TTL: zero for personalized requests.

For per-IP abuse protection, use the single Free-plan zone rate-limiting rule on the public AI message route rather than describing the AI Gateway limit as per-IP:

- Host: `app.defrag.app`.
- Path pattern: `/api/v1/threads/*/messages`.
- Method: `POST`.
- Counting characteristic: source IP.
- Threshold: choose a value compatible with the product's per-account entitlement limits.

The application-level monthly turn reservation remains authoritative. Cloudflare rate limiting is defense in depth.

### Spend limit

Set a fixed monthly global spend limit of `$5.00` on the existing `sovereign` gateway only when third-party model billing is enabled. The default action should block and return `429`; do not silently route Baseline, relationship, system, Alignment, or Covenant requests to an unevaluated cheaper model.

The code already supplies pseudonymous account metadata. A future spend rule may partition by that metadata after usage has been measured, but the initial `$5.00` rule should be global and simple.

## API Shield

`docs/api-shield/sovereign-critical-api.openapi.yaml` is an upload-ready OpenAPI 3.0 request schema for short-body, security-sensitive endpoints.

Important boundaries:

- API Shield validates incoming HTTP requests.
- It does not validate AI responses.
- `sovereign-answer.v2` remains enforced by the Worker Zod schema and parser.
- Free-plan request-body validation covers only the first 1 KB.
- Long thread-message requests therefore remain protected primarily by server-side validation, authorization, idempotency, entitlements, and safety checks.

Upload the schema under:

`Security > API Shield > Schema Validation`

Before enabling `Block`, verify each generated operation against production smoke tests. Free plans expose `Block` rather than a full log-only rollout, so do not globally block unlisted routes without confirming route coverage.

## Worker bundle budget

The Cloudflare Workers Free compressed upload limit is 3 MiB. The repository now enforces a stricter internal budget of 2,500 KiB.

Run:

```bash
pnpm build
pnpm verify:worker-bundle-size
```

The verifier runs Wrangler in dry-run mode, parses Wrangler's reported gzip upload size, and fails before release if the internal budget or Cloudflare limit is exceeded. It is included in `verify:cloudflare-build` and `verify:full`.

Do not use `du -kb dist/index.js` as the release authority. That measures an assumed uncompressed file path rather than Wrangler's actual compressed upload.

## Canonical contract validation

The supplied external mock was intentionally not adopted. It conflicted with the live contract by using:

- `version: "2.0"` instead of `version: "sovereign-answer.v2"`.
- `baseline` instead of `headline`, `direct_answer`, and structured sections.
- `basis_references` instead of `basis_refs`.
- `alignment_score`, which the repository explicitly prohibits.
- `covenant_id`, which would bypass explicit thread-level Covenant confirmation.

The existing `recognition.test.ts` now includes regression coverage that rejects that shape, missing `safety_mode`, and score fields added to otherwise valid answers.
