# Production release procedure

This document defines the only supported production promotion path for Sovereign.OS.

Production is not deployed directly from a source branch. One exact commit must first pass the isolated Cloudflare preview and every applicable gate in [`release-gates.md`](release-gates.md). The production release then separates version creation, database migration, traffic promotion, and rollback into individually approved actions.

## Safety model

The production release tool:

- operates only on a full 40-character commit SHA matching the checked-out Git HEAD;
- refuses tracked working-tree changes;
- requires a commit-bound approval value for every mutating action;
- uses existing production D1, R2, Queue, Worker, route, and secret configuration;
- never creates production storage;
- never uploads secret values;
- uploads a Worker version without sending traffic to it;
- applies D1 migrations only through a separate approval;
- promotes only the exact uploaded version ID;
- records the candidate commit and version in `production-candidate.json`;
- provides an explicit rollback command.

Cloudflare Worker versions do not roll back D1 or R2 state. Database compatibility and rollback must therefore be reviewed independently from Worker code rollback.

Do not use a gradual traffic split for this static-asset application unless version affinity is configured. The web build uses content-hashed assets; serving HTML and assets from different Worker versions can break a session. After the isolated preview is approved, promote the exact production version atomically to 100% traffic.

## Production prerequisites

Create and verify these resources before release. The release tool will fail rather than create them:

- production Worker;
- production D1 database;
- production R2 bucket;
- production Queue and consumer;
- Durable Object namespace and migration history;
- Workers AI binding and AI Gateway;
- production custom domain or route;
- Turnstile production site;
- production email sender and delivery endpoint;
- Stripe live-mode products, prices, webhook endpoint, and Customer Portal configuration.

The Worker must already contain these runtime secret names:

- `SESSION_SIGNING_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TURNSTILE_SECRET_KEY`
- `EMAIL_API_TOKEN`

The release tool checks names only. It never reads or prints secret values.

## Required environment

Control-plane authentication:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Exact release identity:

- `RELEASE_COMMIT_SHA`
- `PRODUCTION_WORKER_NAME`
- `PRODUCTION_BASE_URL`
- `PRODUCTION_D1_NAME`
- `PRODUCTION_R2_BUCKET_NAME`
- `PRODUCTION_QUEUE_NAME`

Public/runtime configuration:

- `AI_PROVIDER=cloudflare-gateway`
- `AI_MODEL=openai/gpt-5.5`
- `AI_GATEWAY_ID=sovereign`
- `VITE_TURNSTILE_SITE_KEY`
- `TURNSTILE_EXPECTED_HOSTNAME`
- `EMAIL_API_URL`
- `EMAIL_FROM`
- `STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY`
- `STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL`
- `BASELINE_HORIZONS_URL=https://ssd.jpl.nasa.gov/api/horizons.api`
- `BASELINE_PROVIDER_TIMEOUT_MS=8000`
- `SCRIPTURE_TRANSLATION=WEB`

`PRODUCTION_BASE_URL` must be an HTTPS origin and must not be the isolated preview hostname. `TURNSTILE_EXPECTED_HOSTNAME` must exactly match its hostname.

## 1. Verify the exact commit

Run the complete repository verification before creating a production candidate:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm verify:cloudflare-build
```

The isolated preview must then verify:

- Cloudflare build UUID and exact commit SHA;
- remote migration replay;
- protected preview perimeter;
- authentication and Turnstile;
- Baseline onboarding and current conditions;
- invite, redeem, independent consent, pair comparison, revocation, and blocked reuse;
- a real three-person System;
- Stripe test-mode Checkout, webhook, Portal, cancellation, payment failure, and fallback to Free;
- desktop and physical-iPhone review;
- Privacy and Terms review.

## 2. Upload without traffic

Set:

```text
PRODUCTION_RELEASE_APPROVAL=candidate:<40-character-commit-sha>
```

Run:

```bash
pnpm production:candidate
```

This command verifies the production resource names and runtime secret names, builds an ephemeral Wrangler configuration, and runs `wrangler versions upload`. It does not run `wrangler deploy` and does not promote traffic. Candidate upload runs with automatic resource provisioning disabled, so a missing D1 database, R2 bucket, Queue, binding, or Worker fails closed instead of creating production infrastructure.

Save the emitted `versionId` and the generated `production-candidate.json` with the release evidence. Do not commit that file.

## 3. Apply migrations separately

Review every unapplied migration for backward compatibility with the currently active Worker. Set:

```text
PRODUCTION_MIGRATIONS_BACKWARD_COMPATIBLE=YES
PRODUCTION_RELEASE_APPROVAL=migrate:<40-character-commit-sha>
```

Run:

```bash
pnpm production:migrate
```

Wrangler applies migrations to the named production D1 database with `--remote`. Cloudflare captures a D1 backup when migrations are applied, but the release record must still include the migration list and the intended recovery procedure.

After successful application, record:

```text
PRODUCTION_MIGRATIONS_APPLIED_SHA=<40-character-commit-sha>
```

## 4. Promote the exact version

Set:

```text
PRODUCTION_VERSION_ID=<uploaded-version-id>
PRODUCTION_PREVIEW_APPROVED_SHA=<40-character-commit-sha>
PRODUCTION_MIGRATIONS_APPLIED_SHA=<40-character-commit-sha>
PRODUCTION_APPROVAL_EVIDENCE_URL=<https-url-to-reviewed-evidence>
PRODUCTION_RELEASE_APPROVAL=promote:<40-character-commit-sha>:<version-id>
```

Run:

```bash
pnpm production:promote
```

The command uses `wrangler versions deploy` to promote that exact version to 100% traffic. It cannot substitute a branch name, latest version, or different commit.

Immediately verify:

- public landing and static assets;
- `/health`, `/healthz`, and `/ready` report the release commit;
- signup, login, logout, and account recovery;
- one Free response and server-side allowance enforcement;
- one Sovereign+ entitlement check;
- queue production and consumption;
- scheduled retention trigger visibility;
- error rate, CPU time, request latency, D1 errors, Queue errors, AI errors, email errors, and Stripe webhook errors.

## 5. Rollback

Record the previously active Worker version before promotion. Set:

```text
PRODUCTION_ROLLBACK_VERSION_ID=<previous-stable-version-id>
PRODUCTION_RELEASE_APPROVAL=rollback:<version-id>
```

Run:

```bash
pnpm production:rollback
```

Rollback changes the active Worker version. It does not reverse D1 migrations, R2 writes, Queue messages, Stripe events, or external email delivery. Confirm data compatibility before executing it.

## Release evidence

A complete production release record contains:

- commit SHA;
- Cloudflare build UUID;
- isolated preview URL;
- build and smoke results;
- reviewed screenshots;
- production candidate version ID and tag;
- previous stable version ID;
- migration list and D1 backup confirmation;
- approval evidence URL;
- production deployment output;
- post-deploy health and product smoke results;
- rollback decision and outcome, when applicable.
