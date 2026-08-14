# Protected Cloudflare preview

## Objective

Deploy Sovereign.OS to an isolated Cloudflare preview Worker and protect the entire preview hostname with Cloudflare Access. The preview is for founder and reviewer approval only. It is not production and must not use production D1, Durable Objects, Stripe mode, secrets, routes, or customer records.

## Required preview configuration

Configure these values only in the secure preview environment:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `PREVIEW_WORKER_NAME` — default `sovereign-openapi-preview`
- `PREVIEW_D1_NAME` — default `sovereign-openapi-preview-db`
- `PREVIEW_BASE_URL`
- `PREVIEW_SESSION_SIGNING_SECRET`
- `AI_PROVIDER=cloudflare-gateway`
- `AI_GATEWAY_ID=sovereign-ai-gateway`
- `AI_MODEL=@cf/zai-org/glm-4.7-flash`
- optional sanitized `SOVV_BASE_URL`
- optional Stripe test-mode keys, price IDs, and return URLs
- optional Cloudflare Access service-token values `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET`

Do not store preview or production secrets in GitHub Actions. Preview deployment is an explicit secure-environment operation and is not a production authority.

## Cloudflare Access application

Before the preview is accepted:

1. Create a self-hosted Access application for the entire preview hostname.
2. Allow only founder/reviewer identities and the dedicated verification service token.
3. Do not add a public bypass policy.
4. Keep the public production landing hostname outside this preview application.
5. Verify the unauthenticated preview redirects to or is denied by Access.
6. Verify authenticated landing and health responses with `pnpm verify:preview-access`.

Cloudflare Access is the preview perimeter. It does not replace Sovereign account sessions, consent checks, or Stripe entitlements.

## Local preflight

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

## Preview bootstrap

`pnpm preview:bootstrap` resolves or creates the isolated preview D1 database, writes a temporary Wrangler configuration, applies migrations through `0015_release_evidence`, uploads only preview secrets, deploys the preview Worker, writes sanitized deployment metadata, and removes the temporary configuration.

The script must not be used for production. It must not attach a production route or delete preview state.

## Verification

Run the Access perimeter check:

```bash
PREVIEW_BASE_URL=https://<protected-preview-host> pnpm verify:preview-access
```

For the authenticated content check, also provide the Access service-token values without logging them.

Run application smoke with an ephemeral preview application session after Access admits the request. The smoke must cover:

- landing and supporting public pages;
- health and readiness;
- unauthenticated application 401 behavior;
- account access;
- Baseline onboarding;
- Today and Explore;
- identity-bound invitation, consent, comparison, revocation, and blocked-after-revocation;
- a three-member family or team system;
- Library save and deletion;
- Free usage and daily Workers AI capacity enforcement;
- failed inference refunding the monthly turn;
- Stripe test-mode Checkout, webhook, Portal, cancellation, and fallback to Free;
- disabled private-export boundary and deletion grace;
- optional Covenant enablement;
- structured response and inline visual behavior.

## Security checks

Reject the preview when any of the following is true:

- the hostname is publicly reachable without Access;
- a production route, D1 database, Durable Object namespace, Stripe key, or customer record is attached;
- private APIs are cached as assets;
- personalized AI requests use Gateway cache or persistent prompt logging;
- a direct OpenAI fallback exists;
- a public preview-login route exists;
- secrets, raw prompts, raw birth input, exact coordinates, hidden reasoning, or provider payloads appear in logs or health output.

## Rollback and cleanup

Rollback redeploys a previous preview Worker version. D1 and Durable Object state require forward-repair migrations. Cleanup is manual and destructive only after explicit approval; never target production names.