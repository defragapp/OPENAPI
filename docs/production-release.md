# Production release procedure

Cloudflare Workers Builds connected directly to `defragapp/OPENAPI` is the only supported production deployment path for Sovereign.OS. The repository owner/name is internal infrastructure; **Defrag must never appear as a public product, hostname, sender identity, support address, generated email asset URL, redirect target, canonical URL, or user-facing brand.**

Production is released from one exact commit on `main`. Non-production branch builds remain disabled. Do not run an alternate GitHub Actions deploy, a repository-template deploy, or retired candidate/migrate/promote scripts.

## Production target

- Product and brand: `Sovereign.OS`
- Public site: `https://sovereign.app`
- Authenticated app and API: `https://app.sovereign.app`
- Public email identity: `info@sovereign.os`
- Public inbound aliases: `info@sovereign.app`, `contact@sovereign.app`
- Worker: `sovv-web`
- D1: `sovereign-openapi-db`
- D1 Sessions and automatic read replication
- Durable Object: `ThreadCoordinator`
- AI: Cloudflare Workers AI through AI Gateway `sovereign`
- Model: `@cf/zai-org/glm-4.7-flash`
- Daily capacity ledger: migration `0013_workers_ai_free_capacity`
- Assets: compiled web application
- Background cleanup: scheduled D1 work every 15 minutes
- R2 and Queue: disabled

The historical Defrag namespace is internal lineage only. Public runtime surfaces must use Sovereign identities exclusively.

Private account export is disabled for launch. Sharing sends only the public Sovereign.OS link and includes no private workspace data.

## Public mail identity and private routing

`info@sovereign.os` is the canonical sender, Reply-To, support address, and public contact shown to users.

`info@sovereign.app` and `contact@sovereign.app` are inbound aliases only. Configure all three public addresses in Cloudflare Email Routing to the founder-controlled private destination. The private destination address is provider configuration only: it must never be committed to source, rendered in HTML, returned by an API, logged, embedded in email, or shown in an admin/public product surface.

Do not reply to customer mail directly from the private destination mailbox, because that would expose the private address. Human or automated replies must be sent through the Sovereign mail path with `From` and `Reply-To` set to `info@sovereign.os`.

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

Production account, sign-in/recovery, security, billing, consent, and invitation email must use the branded Resend API transport in `apps/sovereign-worker/src/email.ts`.

Required production values:

- `TRANSACTIONAL_FROM_EMAIL=info@sovereign.os`
- `PUBLIC_CONTACT_EMAIL=info@sovereign.os`
- `PUBLIC_CONTACT_ALIASES=info@sovereign.app,contact@sovereign.app`

Resend is the required production provider. Production must fail closed when the Resend API key or verified `sovereign.os` sending domain is unavailable. A Cloudflare Email binding may be used only for non-production recovery and must never silently replace Resend in production.

Before release:

1. `sovereign.os` must be an active DNS zone under founder control.
2. `sovereign.app` and `app.sovereign.app` must be active in Cloudflare and bound to the production Worker.
3. Resend must show `sovereign.os` verified for sending with valid SPF/DKIM and DMARC configured at DNS.
4. Cloudflare Email Routing must deliver `info@sovereign.os`, `info@sovereign.app`, and `contact@sovereign.app` to the private founder destination without exposing that destination publicly.
5. Turnstile must accept `app.sovereign.app` as the expected hostname.
6. Stripe success, cancellation, and Portal return URLs must use `https://app.sovereign.app`.
7. The live delivery test must pass from a secure environment containing the Resend API key:

```bash
pnpm smoke:email
```

The command sends the same branded template used by the product, verifies delivery through Resend, reports the provider message ID, and does not print secrets or the full recipient address.

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

The build gate verifies release configuration, migrations, secret and fixture scans, public namespace/mail identity, intelligence and visual contracts, type checks, Worker and web tests, production build, and compressed Worker size.

The deploy command requires the exact Cloudflare build commit SHA. It resolves the existing D1 database, applies forward-only migrations, preserves encrypted Worker secrets, configures Cloudflare controls, deploys that exact commit, and runs live probes. It fails closed when required secrets, domains, or runtime dependencies are missing.

## Approval boundary

Do not merge a release branch to `main` until the exact branch commit has:

- green repository and protected Cloudflare preview checks;
- verified `sovereign.app` and `app.sovereign.app` production hostnames;
- verified `sovereign.os` Resend sending identity;
- verified Cloudflare Email Routing for all public aliases;
- authenticated desktop and iPhone review;
- reviewed Privacy and Terms;
- test-mode Checkout, webhook, Portal, cancellation, and Free fallback evidence;
- explicit founder approval for that commit SHA.

Merging the approved commit to `main` authorizes Cloudflare Workers Builds to execute the configured production deployment. A branch push or draft pull request does not authorize production.

## Live verification

The deploy command must confirm:

- `https://sovereign.app` and `https://app.sovereign.app` serve the exact commit;
- no rendered public route, redirect, canonical URL, email body, sender identity, support link, or health metadata exposes the retired Defrag namespace;
- `/ready` reports the current migration and `dependencies.transactionalEmail` exactly `resend`;
- `/ready` reports public and transactional mail identity as `info@sovereign.os` and never reports a private delivery destination;
- D1, D1 Sessions, authentication, AI Gateway, Workers AI capacity, Resend, Stripe, and scheduled cleanup are configured;
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
- Resend `sovereign.os` domain verification evidence;
- Cloudflare DNS/Worker route and Email Routing verification evidence;
- migration list and D1 backup confirmation;
- prior stable Worker version;
- sanitized `production-deployment.json`;
- explicit founder approval;
- post-deploy probe results and any rollback decision.
