# Preview deployment and live verification

## Objective

Deploy Sovereign.OS to an isolated Cloudflare preview Worker, not production. The preview Worker serves the Vite PWA and `/api/*` routes from one same-origin Worker, applies preview D1 migrations, uses a preview Durable Object namespace, and verifies Cloudflare AI Gateway through the Worker AI binding.

## Required GitHub configuration

### Secret

- `CLOUDFLARE_API_TOKEN` — scoped to the Cloudflare account used for preview deployment and verification.
- Optional `PREVIEW_SESSION_SIGNING_SECRET` — if absent, the workflow generates an ephemeral preview session secret for the run.
- Optional Stripe test-mode secrets: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### Variables

- `CLOUDFLARE_ACCOUNT_ID`
- `PREVIEW_WORKER_NAME` — default `sovereign-openapi-preview`
- `PREVIEW_D1_NAME` — default `sovereign-openapi-preview-db`
- `AI_PROVIDER` — default `cloudflare-gateway`
- `AI_MODEL` — default `openai/gpt-5.6-terra`
- `AI_GATEWAY_ID` — default `sovereign`
- `SOVV_BASE_URL` — optional; leave empty for sanitized preview fixtures.
- `SCRIPTURE_TRANSLATION` — default `WEB`
- Optional Stripe test variables: `STRIPE_PRICE_SOVEREIGN_PLUS`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`, `STRIPE_PORTAL_RETURN_URL`, `STRIPE_SUPPORT_URL`.

## Local preflight

Run:

```bash
pnpm install --frozen-lockfile
pnpm verify:foundation
pnpm verify:migrations
pnpm scan:secrets
pnpm typecheck
pnpm test
pnpm build
pnpm smoke:worker-gateway
pnpm smoke:stripe
pnpm smoke:product
pnpm build:preview
```

`pnpm build:preview` builds web assets, validates the Wrangler preview environment, generates preview binding types into `.tmp/`, and performs a preview Worker dry-run with static assets.

## Preview bootstrap behavior

`pnpm preview:bootstrap` is idempotent. It resolves or creates the exact preview D1 database name, generates a temporary Wrangler config containing the resolved preview database ID, applies remote migrations, uploads only configured preview secrets, deploys the preview Worker, writes sanitized `preview-deployment.json`, and deletes the temporary config.

The script must not be used for production. It does not delete or reset preview state.

## Authenticated preview smoke

`pnpm smoke:preview` requires:

```bash
PREVIEW_BASE_URL=https://<preview-worker>.workers.dev
PREVIEW_SESSION_COOKIE='__Host-sovereign_session=...; Path=/; Secure; HttpOnly; SameSite=Lax'
```

The cookie is generated inside GitHub Actions with `pnpm preview:session` and must never be logged. The smoke verifies static app delivery, health/readiness, unauthenticated 401 behavior, Today, Explore, People consent, Systems alignment, Library continuity, export/deletion grace, billing fixture/test state, Covenant retrieval, and streamed Sovereign turn behavior.

## Security checks

Before accepting a preview run, verify:

- no production custom route is attached;
- no production D1 database or Durable Object namespace is bound;
- no personal `OPENAI_API_KEY` is required;
- private APIs are not cached as static assets;
- `/api/*`, `/health`, `/healthz`, and `/ready` run Worker code first;
- no public preview-login route exists;
- health/readiness output contains no secrets, account records, raw prompts, raw birth data, exact coordinates, provider payloads, or stack traces.

## Rollback

Rollback redeploys a previous Worker version or commit to the preview Worker. D1 and Durable Object state do not roll back with Worker code, so use forward-repair migrations for data issues. Do not delete preview D1 or Durable Object state during rollback.

## Manual cleanup

Cleanup is never automatic. To destroy preview resources, require explicit destructive confirmation and then remove, in order:

1. preview Worker routes and Worker deployment;
2. preview Worker secrets;
3. preview D1 database after exporting any needed diagnostic state;
4. dedicated preview AI Gateway configuration if one was created;
5. preview test records or fixtures.

Never run cleanup against production names.
