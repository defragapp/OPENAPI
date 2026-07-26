# Cloudflare dashboard prompt — deploy the protected Sovereign.OS preview

Paste the prompt below into Cloudflare’s dashboard assistant while signed into the Cloudflare account that owns the `sovereign-os-api.workers.dev` subdomain.

Do not paste secret values into the assistant conversation. Add secrets only through **Settings → Build → Variables and secrets**, **Worker Settings → Variables and Secrets**, or the relevant secure Cloudflare secret form.

---

## Prompt

You are configuring and deploying the isolated founder-review preview for Sovereign.OS.

Operate only in the current Cloudflare account and only on the preview resources named below. Do not change `defrag.app`, any existing production route, or any production Worker.

### Source authority

- GitHub repository: `defragapp/OPENAPI`
- Release source: current `main`
- Root directory: repository root
- Before building, resolve and report the exact 40-character `main` commit SHA.
- Never deploy a different branch, an older cached commit, or uncommitted dashboard code.

### Worker and resources

Use or create only these isolated preview resources:

- Worker: `sovereign-openapi-preview`
- URL: `https://sovereign-openapi-preview.sovereign-os-api.workers.dev`
- D1: `sovereign-openapi-preview-db`
- Queue: `sovereign-openapi-preview-jobs`
- R2 binding: `ARTIFACTS`
- Queue binding: `JOBS`
- D1 binding: `DB`
- Durable Object binding: `THREADS`
- Workers AI binding: `AI`
- Static assets binding: `ASSETS`
- Cron: `*/15 * * * *`

Reuse the named resources when they already exist. Do not create duplicates. Do not add a SOVV service binding.

### Connect Workers Builds

Connect the Worker to the GitHub repository and configure:

- Production branch: `main`
- Non-production branch builds: disabled
- Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build`
- Deploy command: `pnpm preview:bootstrap`
- Root directory: repository root
- Build caching: enabled only if the frozen lockfile remains authoritative

Use one user-scoped build token with:

- Account Settings Read
- Workers Scripts Edit
- Workers R2 Storage Edit
- D1 Edit
- Queues Edit
- Workers AI Read
- User Details Read
- Memberships Read

This preview uses only its dedicated `workers.dev` hostname. Do not request Workers Routes Edit and do not attach a `defrag.app` route.

### Build variables

Configure these non-secret build variables:

- `PREVIEW_BASE_URL=https://sovereign-openapi-preview.sovereign-os-api.workers.dev`
- `PREVIEW_WORKER_NAME=sovereign-openapi-preview`
- `PREVIEW_D1_NAME=sovereign-openapi-preview-db`
- `CLOUDFLARE_WORKERS_SUBDOMAIN=sovereign-os-api`
- `AI_PROVIDER=cloudflare-gateway`
- `AI_MODEL=openai/gpt-5.5`
- `AI_GATEWAY_ID=sovereign`
- `SCRIPTURE_TRANSLATION=WEB`
- `BASELINE_HORIZONS_URL=https://ssd.jpl.nasa.gov/api/horizons.api`
- `BASELINE_PROVIDER_TIMEOUT_MS=8000`
- `TURNSTILE_EXPECTED_HOSTNAME=sovereign-openapi-preview.sovereign-os-api.workers.dev`

Configure these values after the corresponding services are ready:

- `VITE_TURNSTILE_SITE_KEY`
- `EMAIL_API_URL`
- `EMAIL_FROM`
- `STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY`
- `STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL`

### Secrets

Confirm these secrets exist in the secure build/runtime configuration, without displaying their values:

- `PREVIEW_SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `EMAIL_API_TOKEN`
- `STRIPE_SECRET_KEY` — Stripe test mode only for preview
- `STRIPE_WEBHOOK_SECRET` — preview test endpoint only

Never use live Stripe credentials in the preview.

### AI Gateway — no personal OpenAI key

Use Cloudflare AI Gateway `sovereign` through the Worker’s `AI` binding and Cloudflare Unified Billing.

- Do not request, store, or use a personal OpenAI API key.
- Do not add an OpenAI key to Worker variables or secrets.
- Verify that the Cloudflare model catalog exposes `openai/gpt-5.5` for this account and that it is eligible for the required Zero Data Retention configuration.
- Enable Zero Data Retention for the gateway/account path used by this Worker.
- Keep request and response logging disabled for Sovereign inference.
- Keep cache bypass enabled.
- Set a conservative preview spend limit and alert.
- If Unified Billing credits or `openai/gpt-5.5` are unavailable, stop and report the exact missing requirement. Do not silently substitute a different model or direct OpenAI integration.

### Authentication and Access

- Configure a Turnstile site for the exact preview hostname and both signup and login flows.
- Do not set one global `TURNSTILE_EXPECTED_ACTION`; the preview handles both actions.
- Configure the approved email delivery endpoint and verified sender for magic links.
- Protect the entire preview hostname with Cloudflare Access.
- Allow `defragapp@gmail.com` and, when needed, one service-token policy for automated smoke tests.
- Keep versioned preview URLs disabled.

Cloudflare Access is only the founder-review perimeter. It must not replace the application’s own sessions, consent enforcement, or Stripe entitlements.

### Execute and verify

1. Trigger a fresh Workers Build from the exact current `main` commit.
2. Confirm the frozen install completes.
3. Confirm every command in `pnpm verify:cloudflare-build` passes.
4. Confirm remote D1 migrations apply.
5. Confirm the final deploy uses the same exact commit after runtime secrets are attached.
6. Confirm the preview hostname is protected by Access.
7. Verify:
   - `/health`
   - `/healthz`
   - `/ready`
   - public landing and static assets
   - signup, magic-link login, logout, and Turnstile
   - Baseline onboarding and current conditions
   - invite → redeem → independent scope decisions → pair result → revoke → blocked reuse
   - a real three-person family or team System
   - Free allowance enforcement
   - Stripe test-mode Checkout, webhook, Portal, cancellation, payment failure, and fallback to Free
   - export, deletion, Queue processing, and scheduled retention cleanup
8. Capture desktop and iPhone-width screenshots of Landing, signup/login, Today, Explore, People, Systems, Library, You, consent review, pair/System results, Privacy, and Terms.

### Required completion report

Return only evidence-backed results:

- exact Git commit SHA
- Cloudflare build UUID
- build status and failed step, if any
- deployed Worker version ID
- protected preview URL
- D1, R2, Queue, Durable Object, AI, assets, and cron binding status
- `/health`, `/healthz`, and `/ready` results
- AI Gateway model, Unified Billing, ZDR, logging, cache, and spend-limit status
- Turnstile and email status
- Stripe mode and smoke status
- links or locations for desktop and iPhone screenshots
- remaining blockers

Do not call the preview healthy, approval-ready, or production-ready when any required check is missing. Do not deploy production traffic.

---

## Manual dashboard locations

When the assistant cannot complete a dashboard action, use these locations:

- Git connection and commands: **Workers & Pages → sovereign-openapi-preview → Settings → Build**
- Branch control: **Settings → Build → Branch control**
- Build variables/secrets: **Settings → Build → Variables and secrets**
- Worker runtime secrets: **Settings → Variables and Secrets**
- Access: **Settings → Domains & Routes → workers.dev route → Enable Cloudflare Access**
- AI Gateway: **AI → AI Gateway → sovereign**
- Unified Billing/model catalog: **AI → AI Gateway / Model Catalog / Billing**
- Spend limits: **AI Gateway → sovereign → Settings / Spend limits**
- Build history and UUID: **Worker → Builds**
- Deployment version: **Worker → Deployments**
