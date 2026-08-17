# Direct Cloudflare preview

Status: current isolated preview guidance. Preview is not production authority.

Use the existing `defragapp/OPENAPI` repository. Do not use a Deploy-to-Cloudflare template or create a repository copy.

Production configuration remains repository-owned. Isolated review preview uses `apps/sovereign-worker/wrangler.jsonc` with its preview environment and `pnpm preview:bootstrap`.

## Preview target

- Worker: `sovereign-openapi-preview`
- default workers.dev URL: `https://sovereign-openapi-preview.sovereign-os-api.workers.dev`
- D1: `sovereign-openapi-preview-db`
- Durable Object: `ThreadCoordinator`
- AI: Workers AI through Gateway `sovereign-ai-gateway`
- model: `@cf/zai-org/glm-4.7-flash`
- capacity-ledger foundation: migration `0013_workers_ai_free_capacity`
- current schema target: `0017_privacy_access_and_eligibility`
- assets: compiled Sovereign.OS web application
- R2/Queue: disabled
- private export behavior: on-demand/no-artifact
- video/Worlds: not required for current preview acceptance

`0013_workers_ai_free_capacity` is retained here as schema lineage for the daily capacity ledger. It is not the current migration; current preview parity must advance through `0017_privacy_access_and_eligibility`.

Preview must never attach a production custom domain, production D1 database, live Stripe credential/customer state, or production route.

## Required preview configuration

Use secure environment values for the preview only, including the Cloudflare account/credential, preview session signing secret, preview URL/Worker/D1 names, and current AI Gateway/model configuration. Add Turnstile, Resend, and Stripe **test-mode** settings only when those preview journeys are in scope.

Never commit preview or production secret values.

## Deploy and verify

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm verify:cloudflare-build
pnpm preview:bootstrap
```

The preview must apply migrations through `0017_privacy_access_and_eligibility`, use the same structured text-answer adapter as production, bypass personalized Gateway cache, disable persistent prompt logging, and preserve controlled capacity/failure behavior.

Protect the entire preview hostname with Cloudflare Access before treating it as private founder/reviewer evidence.

Then verify, as relevant:

- `/health` and `/ready`;
- public pages;
- unauthenticated private-route/API rejection;
- account policy/18+ handling;
- Plan → Baseline → text workspace flow;
- on-demand private export;
- permission-bound People/Systems behavior;
- Stripe test-mode billing;
- account deletion grace.

No private video generation is required.

## Cleanup

Preview cleanup is explicit and destructive only after approval. Never target `sovv-web`, `sovereign-openapi-db`, `sovereign.defrag.app`, `app.defrag.app`, or production customer state during preview cleanup.
