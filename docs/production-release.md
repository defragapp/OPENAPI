# Sovereign.OS production release procedure

Status: canonical production release authority.

Production is released from one exact `origin/main` commit through the repository-owned Wrangler OAuth wrapper:

```bash
pnpm production:release:oauth
```

That command is the executable production authority. It verifies that the local checkout matches current `origin/main`, establishes a fresh current-member Wrangler OAuth session, provides the same fresh credential to the direct Cloudflare and Browser Rendering checks without printing it, runs the full repository gate, executes the internal production deploy stage, and proves exact-SHA readiness on both branded domains.

`pnpm production:deploy` is an internal deploy-and-live-verification stage used by the OAuth wrapper. Running it by itself is not the complete production release procedure.

Cloudflare Workers Builds records and former trigger/build-token instructions are historical operational evidence. They do not override this procedure and are not required to authorize or prove the current production release.

GitHub Actions, deploy hooks, Cloudflare Pages, a second production Worker, repository-template deploy flows, preview Workers, and retired candidate/migrate/promote scripts are not production release authorities.

## Production target

- Repository: `defragapp/OPENAPI`
- Branch authority: current `origin/main`
- Worker: `sovv-web`
- Public site: `https://sovereign.defrag.app`
- Authenticated app and API: `https://app.defrag.app`
- Owned root domain: `defrag.app`
- D1: `sovereign-openapi-db`
- D1 Sessions and automatic read replication
- Durable Object: `ThreadCoordinator`
- AI: Cloudflare Workers AI through AI Gateway `sovereign-ai-gateway`
- Model: `@cf/zai-org/glm-4.7-flash`
- Daily capacity ledger introduced by migration `0013_workers_ai_free_capacity`
- Current release-evidence schema: migration `0015_release_evidence`
- Assets: compiled web application
- Background cleanup: scheduled D1 work every 15 minutes
- R2 and Queue: disabled

`sovereign.os` is a product name, not an owned or delegated public domain. Do not publish links or email addresses at `sovereign.os`. `sovereign.app` is not an approved production namespace. Current namespace authority is documented in `docs/release/NAMESPACE_AUTHORITY.md`.

Private account export is disabled for launch. Sharing sends only the public Sovereign.OS link and includes no private workspace data.

## Required production credentials

Encrypted Worker secrets remain in Cloudflare:

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Never copy secret values into repository files, build output, issues, screenshots, or chat.

The OAuth release wrapper intentionally clears inherited Cloudflare API-token variables before establishing the current-member Wrangler OAuth session. It then exposes that fresh OAuth credential only to the repository-owned commands that require direct Cloudflare REST or Browser Rendering access.

`CLOUDFLARE_ACCOUNT_ID` and `VITE_TURNSTILE_SITE_KEY` remain non-secret release configuration where required by the scripts.

## Transactional email

Production account and invitation email uses the branded Resend template in `apps/sovereign-worker/src/email.ts`.

Recommended identities:

- `TRANSACTIONAL_FROM_EMAIL=info@defrag.app`
- `PUBLIC_CONTACT_EMAIL=info@defrag.app`
- `EMAIL_SMOKE_TEST_RECIPIENT=info@defrag.app`

The sender domain must match a verified Resend domain. Resend is the production transactional provider.

## Release sequence

The canonical wrapper performs the following sequence against the same exact SHA:

1. fetch current `origin/main` and reject a checkout that does not match it;
2. stamp the exact SHA into the release environment;
3. clear inherited Cloudflare token variables and establish Wrangler OAuth for the current member;
4. verify production D1 access before mutation;
5. run `pnpm verify:cloudflare-build`;
6. run `pnpm production:deploy`;
7. run the parent-domain route verification owned by that deploy path;
8. verify `/ready` on both `app.defrag.app` and `sovereign.defrag.app` for the exact target SHA;
9. require migration `0015_release_evidence`, migration parity `current`, and `releaseEvidence.sha` equal to the target SHA;
10. complete the deterministic Browser Rendering audits required by the release scripts.

The repository gate includes foundation, migrations, secret and fixture scans, intelligence and visual contracts, type checks, Worker and web tests, production builds, smoke tests, and compressed Worker-size verification.

## Approval boundary

A release candidate must have the applicable repository, product, consent, billing, privacy, accessibility, and rendered visual checks complete before production release is treated as approved.

A branch, pull request, successful build, dashboard configuration, or isolated deploy command does not by itself authorize production. The target is always the exact current `origin/main` SHA selected by the OAuth release wrapper.

## Live verification

A production release is complete only when the same exact SHA is proven on both branded domains and the live probes succeed.

Required readiness evidence includes:

- `ready: true`;
- `version` equal to the exact target SHA;
- `migrationVersion: 0015_release_evidence`;
- `latestMigrationVersion: 0015_release_evidence`;
- `dependencies.migrationParity: current`;
- `releaseEvidence.sha` equal to the exact target SHA.

The deploy path also verifies the configured D1, D1 Sessions, authentication, AI Gateway, Workers AI capacity, Resend, Stripe, scheduled cleanup, pricing, protected-route boundaries, Stripe signature rejection, Turnstile behavior, security headers, immutable assets, parent-domain routing, and concurrent health behavior represented by the current repository tests and scripts.

A command that does not complete those exact-SHA probes is not a completed release.

## Visual release evidence

Rendered completion additionally follows `docs/browser-visual-release-audit.md`.

Do not freeze or replace a founder visual reference until the intended composition has been rendered at the required desktop and mobile viewports, the actual screenshots have been inspected, and known documentation-to-render contradictions have been repaired.

## Rollback

Record the previously stable Worker version before release. If rollback is required, use Cloudflare version/deployment controls to restore that exact version after explicit approval.

Worker rollback does not reverse D1 migrations or external Stripe and email events. Use forward-repair migrations and confirm database compatibility before restoring an older Worker.

## Release evidence

Keep, as applicable:

- exact `origin/main` SHA;
- exact deployed SHA;
- `/ready` evidence from both branded domains;
- migration and release-evidence parity;
- repository gate and smoke results;
- Browser Rendering landing screenshots/report;
- Browser Rendering route screenshots/report;
- authenticated desktop/mobile review evidence when required;
- prior stable Worker version;
- sanitized deployment metadata;
- any rollback decision.
