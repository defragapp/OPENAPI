# Production release procedure

Cloudflare Workers Builds connected directly to `defragapp/OPENAPI` is the only supported production deployment path for Sovereign.OS.

Production is released from one exact commit on `main`. Non-production branch builds remain disabled. Do not run an alternate GitHub Actions deploy, a repository-template deploy, or the retired candidate/migrate/promote scripts.

## Production target

- Worker: `sovv-web`
- Public site: `https://sovereign.defrag.app`
- Authenticated app and API: `https://app.defrag.app`
- D1: `sovereign-openapi-db`
- Durable Object: `ThreadCoordinator`
- AI: Workers AI through AI Gateway with Unified Billing
- Assets: compiled web application
- Background cleanup: scheduled D1 work every 15 minutes
- R2 and Queue: disabled

Private account export is disabled for launch. Sharing sends only the public Sovereign.OS link and includes no private workspace data.

## Required encrypted Worker secrets

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Secret values stay in Cloudflare. Never copy them into repository files, build output, issues, or chat.

## Build configuration

- Production branch: `main`
- Root directory: repository root
- Build command:

```bash
VITE_TURNSTILE_SITE_KEY=0x4AAAAAADhGIF8-iOLIg8MU corepack enable && pnpm install --frozen-lockfile && pnpm verify:cloudflare-build
```

- Deploy command:

```bash
node scripts/cloudflare-direct-production-deploy.mjs
```

The build gate verifies the release configuration, migrations, secret scan, production-fixture scan, release contract, type checks, worker and web tests, and production build.

The deploy command requires the exact Cloudflare build commit SHA. It resolves the existing D1 database, applies forward-only migrations, preserves encrypted Worker secrets, deploys that exact commit, and runs live probes. It fails closed when required secrets or runtime dependencies are missing.

## Approval boundary

Do not merge a release branch to `main` until the exact branch commit has:

- green repository and Cloudflare preview checks;
- protected preview evidence;
- authenticated desktop and iPhone review;
- reviewed Privacy and Terms;
- test-mode Checkout, webhook, Portal, cancellation, and Free fallback evidence;
- explicit founder approval for that commit SHA.

Merging the approved commit to `main` authorizes Cloudflare Workers Builds to execute the configured production deployment. A branch push or draft pull request does not authorize production.

## Live verification

The deploy command must confirm:

- the public and app hostnames serve the exact commit;
- health and readiness report D1, authentication, AI Gateway, email, Stripe, scheduled cleanup, and the disabled private-export boundary correctly;
- pricing shows Free, $20 monthly, and $99 annual without legacy export or unapproved support placement;
- unauthenticated protected routes fail closed;
- invalid Stripe signatures are rejected;
- signup requires Turnstile;
- security headers and app `noindex` behavior are present;
- compiled assets are immutable;
- concurrent health probes pass.

A deploy command that does not complete these probes is not a completed release.

## Rollback

Record the previously stable Worker version before merging the approved commit. If rollback is required, use Cloudflare’s version/deployment controls to restore that exact version after explicit approval.

Worker rollback does not reverse D1 migrations or external Stripe and email events. Use forward-repair migrations and confirm database compatibility before restoring an older Worker.

## Release evidence

Keep:

- exact commit SHA;
- Cloudflare build UUID;
- protected preview URL and screenshots;
- test and smoke results;
- migration list and D1 backup confirmation;
- prior stable Worker version;
- sanitized `production-deployment.json`;
- explicit founder approval;
- post-deploy probe results and any rollback decision.
