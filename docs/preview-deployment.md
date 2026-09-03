# Protected Cloudflare preview

Status: current founder/reviewer preview procedure. Preview is isolated review infrastructure, not production authority.

## Objective

Deploy Sovereign.OS to an isolated preview Worker and protect the entire preview hostname with Cloudflare Access. Preview must not use production D1, production routes, live Stripe credentials, production customer records, or production secrets.

## Required preview configuration

Configure only in the secure preview environment:

- Cloudflare account/auth values required by the preview bootstrap;
- `PREVIEW_WORKER_NAME` (default `sovereign-openapi-preview`);
- `PREVIEW_D1_NAME` (default `sovereign-openapi-preview-db`);
- `PREVIEW_BASE_URL`;
- `PREVIEW_SESSION_SIGNING_SECRET`;
- `AI_PROVIDER=cloudflare-gateway`;
- `AI_GATEWAY_ID=sovereign-ai-gateway`;
- `AI_MODEL=@cf/zai-org/glm-4.7-flash`;
- optional Turnstile/Resend/Stripe **test-mode** settings;
- optional Cloudflare Access service-token values for automated perimeter verification.

Do not store preview or production secrets in GitHub Actions. GitHub Actions are not release authority.

## Cloudflare Access perimeter

Before preview is accepted:

1. protect the entire preview hostname with a self-hosted Access application;
2. allow only founder/reviewer identities or the dedicated verification service token;
3. do not add a public bypass policy;
4. keep production public/app hosts outside the preview Access application;
5. verify unauthenticated preview access is denied/redirected by Access;
6. verify authenticated landing/health behavior with the repository-owned preview checker where applicable.

Access protects the preview perimeter. It does not replace Sovereign account sessions, consent, or Stripe entitlements.

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

`pnpm preview:bootstrap` resolves/creates the isolated preview D1 database, writes temporary preview configuration, applies migrations through **`0019_deprecate_manual_capacity`**, uploads only preview secrets, deploys the preview Worker, records sanitized preview metadata, and removes temporary configuration.

It must not be used for production or attach a production route/database.

## Current preview smoke

With Access and an ephemeral Sovereign preview session, verify the parts relevant to the review:

- landing/supporting public pages;
- health/readiness;
- unauthenticated private route/API rejection;
- account policy/18+ review;
- Plan → Baseline → text workspace;
- Today/Explore;
- identity-bound invitation/consent/comparison/revocation;
- permitted multi-person System behavior;
- Library save/delete;
- Free usage/daily capacity behavior;
- failed inference turn refund behavior;
- Stripe test-mode Checkout/webhook/Portal/cancellation/fallback;
- authenticated on-demand private export with no retained artifact;
- deletion grace;
- optional Covenant behavior;
- structured answer and inline structural visual behavior.

Worlds/video generation is not required for current launch/preview acceptance.

## Security checks

Reject preview when:

- the preview hostname is public without Access;
- a production route/database/credential/customer record is attached;
- private APIs are cacheable as public assets;
- personalized AI requests use shared cache or persistent prompt logging;
- a direct OpenAI fallback exists;
- a public preview-login bypass exists;
- secrets, raw prompts beyond approved retention, raw birth input, exact coordinates, hidden reasoning, billing secrets, or unconsented person data appear in logs/health output.

## Rollback and cleanup

Preview rollback redeploys a prior compatible preview Worker version. D1 changes require forward-repair migrations. Cleanup is manual/destructive only after explicit approval and must never target production names/state.
