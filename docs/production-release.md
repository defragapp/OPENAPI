# Production release procedure

Cloudflare Workers Builds connected directly to `defragapp/OPENAPI` is the only supported production deployment path for Sovereign.OS.

Production is released from one exact commit on `main`. Non-production branch builds remain disabled. Do not run an alternate GitHub Actions deploy, a repository-template deploy, or retired candidate/migrate/promote scripts.

## Production target

- Worker: `sovv-web`
- Public site: `https://sovereign.defrag.app`
- Authenticated app and API: `https://app.defrag.app`
- Owned root domain: `defrag.app`
- D1: `sovereign-openapi-db`
- D1 Sessions and automatic read replication
- Durable Object: `ThreadCoordinator`
- AI: Cloudflare Workers AI through AI Gateway `sovereign`
- Model: `@cf/zai-org/glm-4.7-flash`
- Daily capacity ledger: migration `0013_workers_ai_free_capacity`
- Assets: compiled web application
- Background cleanup: scheduled D1 work every 15 minutes
- R2 and Queue: disabled

`sovereign.os` is a product name, not an owned or delegated public domain. Do not publish links or email addresses at `sovereign.os`. `sovereign.app` is a separately registrable `.app` domain and must not be used unless it is purchased and added to Cloudflare.

Private account export is disabled for launch. Sharing sends only the public Sovereign.OS link and includes no private space data.

## Required encrypted Worker secrets

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Secret values stay in Cloudflare. Never copy them into repository files, build output, issues, or chat.

The Cloudflare build/deploy environment also requires:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_TURNSTILE_SITE_KEY`

These are configured as Cloudflare Workers Builds variables or secrets, not prepended to one command in a shell chain.

## Transactional email

Production account and invitation email must use the branded Resend API template in `apps/sovereign-worker/src/email.ts`.

Recommended values:

- `TRANSACTIONAL_FROM_EMAIL=info@defrag.app`
- `PUBLIC_CONTACT_EMAIL=info@defrag.app`
- `EMAIL_SMOKE_TEST_RECIPIENT=info@defrag.app`

The exact sender domain in `TRANSACTIONAL_FROM_EMAIL` must match a verified Resend domain. Resend is the required production provider; the Cloudflare Email binding is only a fallback for non-production recovery.

Before release, verify SPF and DKIM for the selected Resend domain and add DMARC. Run the live delivery test from a secure environment that contains the Resend API key:

```bash
pnpm smoke:email
```

The command sends the same branded template used by the product, reports the Resend message ID, and does not print secrets or the full recipient address.

## Build configuration

- Production branch: `main`
- Root directory: repository root
- Build command:

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build
```

- Deploy command:

```bash
pnpm production:deploy
```

The build gate verifies release configuration, migrations through `0013_workers_ai_free_capacity`, secret and fixture scans, intelligence and visual contracts, type checks, Worker and web tests, production build, and compressed Worker size.

The deploy command requires the exact Cloudflare build commit SHA. It resolves the existing D1 database, applies forward-only migrations, preserves encrypted Worker secrets, configures Free-plan Cloudflare controls, deploys that exact commit, and runs live probes. It fails closed when required secrets or runtime dependencies are missing.

## Approval boundary

Do not merge a release branch to `main` until the exact branch commit has:

- green repository and protected Cloudflare preview checks;
- authenticated desktop and iPhone review;
- reviewed Privacy and Terms;
- test-mode Checkout, webhook, Portal, cancellation, and Free fallback evidence;
- explicit founder approval for that commit SHA.

Merging the approved commit to `main` authorizes Cloudflare Workers Builds to execute the configured production deployment. A branch push or draft pull request does not authorize production.

## Live verification

The deploy command must confirm:

- public and app hostnames serve the exact commit;
- `/ready` reports migration `0013_workers_ai_free_capacity`;
- D1, D1 Sessions, authentication, AI Gateway, Workers AI capacity, Resend, Stripe, and scheduled cleanup are configured;
- `dependencies.transactionalEmail` is exactly `resend`;
- pricing shows Free, $20 monthly, and $99 annual without legacy export or unapproved support placement;
- unauthenticated protected routes fail closed;
- invalid Stripe signatures are rejected;
- signup requires Turnstile;
- security headers and app `noindex` behavior are present;
- compiled assets are immutable;
- concurrent health probes pass.

A deploy command that does not complete these probes is not a completed release.

## Rollback

Record the previously stable Worker version before merging the approved commit. If rollback is required, use Cloudflare version/deployment controls to restore that exact version after explicit approval.

Worker rollback does not reverse D1 migrations or external Stripe and email events. Use forward-repair migrations and confirm database compatibility before restoring an older Worker.

## Release evidence

Keep:

- exact commit SHA;
- Cloudflare build UUID;
- protected preview URL and screenshots;
- test and smoke results;
- Resend provider message ID for the delivery smoke test;
- migration list and D1 backup confirmation;
- prior stable Worker version;
- sanitized `production-deployment.json`;
- explicit founder approval;
- post-deploy probe results and any rollback decision.