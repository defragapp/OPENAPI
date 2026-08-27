# Sovereign.OS production release procedure

Status: canonical production release authority.

Production is released from one exact current `origin/main` commit. The current launch is text-first; video generation is not part of the release boundary, and live Cloudflare Browser Rendering is not required for the core production release.

The production sequence is:

```bash
pnpm verify:cloudflare-build
pnpm production:release:text
```

Run the second command only for the **same exact SHA** that completed the full repository gate. Do not rerun the full gate merely because the release command is separate.

`pnpm production:release:oauth` remains an optional Browser-audited release path. It is not required for the current text-first launch and must not be used to fabricate Browser Rendering evidence when those audits were intentionally not run.

Cloudflare Workers Builds records, former trigger/build-token instructions, GitHub Actions, deploy hooks, Cloudflare Pages, preview Workers, duplicate production Workers, and alternate repositories are not production release authorities.

## Production target

- Repository: `defragapp/OPENAPI`
- Branch authority: exact current `origin/main`
- Worker: `sovv-web`
- Public site: `https://sovereign.defrag.app`
- Authenticated app and API: `https://app.defrag.app`
- Owned root domain: `defrag.app`
- D1: `sovereign-openapi-db`
- D1 Sessions with automatic read replication
- Durable Object: `ThreadCoordinator`
- AI: Cloudflare Workers AI through AI Gateway `sovereign-ai-gateway`
- Model: `@cf/zai-org/glm-4.7-flash`
- Daily capacity ledger introduced by migration `0013_workers_ai_free_capacity`
- Release-evidence tables introduced by migration `0015_release_evidence`
- Current candidate schema: migration `0018_workers_ai_capacity_reservations` (immutable upgrade from deployed `0017_privacy_access_and_eligibility`)
- Private export: authenticated, on-demand, no retained export artifact
- Assets: compiled web application
- Background cleanup: scheduled D1 work every 15 minutes
- R2 and Queue: disabled
- Worlds/video generation: not part of the current launch runtime

`sovereign.os` is a product name, not an owned public domain. `sovereign.app` is not an approved namespace. Namespace authority is documented in `docs/release/NAMESPACE_AUTHORITY.md`.

## Required production credentials

Encrypted Worker secrets remain in Cloudflare:

- `SESSION_SIGNING_SECRET`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

The release environment also needs the Cloudflare account identifier and an authenticated Cloudflare credential capable of the repository-owned production operations. Wrangler OAuth is the canonical interactive credential for Worker deployment, production D1 access, required Worker-secret inspection, and the Cloudflare surfaces exposed by Wrangler OAuth. Cloudflare zone WAF/ruleset and API Gateway management APIs may require zone-management permissions that Wrangler OAuth does not expose. When those two zone-control APIs return HTTP 403, the release treats the existing controls as externally managed and leaves them untouched; any non-403 reconciliation failure still blocks the release before deployment. Changing those externally managed zone controls requires separate zone-management authority and separate evidence.

Do not copy secret values into repository files, build output, issues, screenshots, or product logs.

## Release sequence

### 1. Select one exact SHA

The checkout must match current `origin/main`. `scripts/assert-main-release.mjs` rejects drift before the release command mutates production.

### 2. Run the deterministic repository gate

```bash
pnpm verify:cloudflare-build
```

This gate includes foundation, migration, secret and fixture scans, release-contract checks, type checks, web and Worker tests, Baseline/auth/jobs/AI/Stripe/product/release-closure smokes, production builds, source-map checks, and compressed Worker-size verification.

Do not run live Browser Rendering verifiers after this gate for the current launch acceptance unless the founder explicitly changes that requirement.

### 3. Release the same SHA once

```bash
pnpm production:release:text
```

The text-first release path:

1. rechecks that the checkout is the exact current `origin/main` SHA;
2. verifies migrations and production release configuration;
3. verifies the publicly served DMARC record before mutation;
4. prepares the exact production Wrangler configuration;
5. applies D1 migrations through `0018_workers_ai_capacity_reservations`;
6. verifies required Worker secrets;
7. reconciles the repository-owned Free-plan Cloudflare controls when the authenticated credential exposes the required management APIs; HTTP 403 from the WAF/ruleset or API Gateway management APIs records those zone controls as externally managed and leaves them untouched;
8. when API Shield management is available, normalizes Endpoint Management templates because Cloudflare may return named OpenAPI parameters as positional `{var1}`, `{var2}`, and equivalent forms;
9. performs exactly one `wrangler deploy` for `sovv-web`;
10. verifies parent-domain/runtime and secondary public-route behavior without Browser Rendering;
11. writes exact-SHA D1 release evidence;
12. converges that evidence across `/health` and `/ready` on both branded domains.

A preparation, migration, secret, Cloudflare-control, or DMARC failure before `wrangler deploy` performs zero deployments. A failure after `wrangler deploy` is one deployment and must be diagnosed before another release attempt.

## Release evidence semantics

`sovereign-production-release-evidence.v1` records what actually occurred. Its route/rendered fields are booleans, not implied success markers:

- `routeCohesionVerified: true` only when the automated route-cohesion Browser audit actually ran and passed;
- `renderedVisualVerified: true` only when the automated rendered-visual Browser audit actually ran and passed;
- the text-first release therefore records those two automated Browser fields as `false`.

Those `false` values do **not** mean the application is unhealthy. They mean those optional automated Browser audits were not used as evidence for that release. Human desktop/iPhone acceptance is tracked separately and must not be rewritten as automated Browser Rendering evidence.

Existing v1 evidence from older releases remains readable because the contract shape is unchanged.

## Live readiness acceptance

A release is technically live only when both branded domains prove the exact target SHA and current schema.

Required state:

- `ready: true` on both `/ready` endpoints;
- `version` equal to the exact target SHA;
- `/ready.sha` equal to the exact target SHA where exposed;
- `migrationVersion: 0018_workers_ai_capacity_reservations`;
- `latestMigrationVersion: 0018_workers_ai_capacity_reservations`;
- `dependencies.migrationParity: current`;
- `dependencies.policyAcceptanceReceipts: configured`;
- `dependencies.privacyAccessControls: configured`;
- `dependencies.privateExports: on-demand-no-artifact` where exposed;
- `releaseEvidence.sha` equal to the target SHA;
- `releaseEvidence.migrationVersion` equal to `0018_workers_ai_capacity_reservations`;
- verified DMARC evidence;
- release evidence converged across both branded domains.

Do not infer failure solely because a health-only endpoint omits fields that are only exposed on `/ready`; inspect the correct endpoint contract.

## Product acceptance after deployment

Infrastructure readiness is not the same as final product acceptance. The current launch closes only after the bounded GitHub task graph under #207 proves the real product:

- #210 Account → policy/18+ → Plan → Baseline → Workspace → first text AI answer;
- #211 auth/email/billing/account lifecycle;
- #212 real consented People/Relationship/Systems and revocation;
- #213 text AI behavior, Basis, current context, Covenant, failure/capacity/safety;
- #214 human desktop + iPhone/Safari/PWA visual and interaction QA;
- #208 privacy/compliance live-behavior acceptance;
- #215 documentation/release-governance reconciliation;
- #216 final stability matrix and production sign-off.

The core authenticated experience is text-first. It does not require a video renderer or video-generation provider.

## Optional Browser audit

`docs/browser-visual-release-audit.md` remains a visual checklist and optional deterministic Browser Rendering procedure. Use it only when explicitly requested or when a future release elects to collect that automated evidence.

A Browser audit and human visual review are different evidence types. Never set the automated release-evidence booleans to `true` based only on source inspection, a repository test, or a human screenshot review.

## Transactional email

Production account and invitation email uses Resend through `apps/sovereign-worker/src/email.ts`.

Recommended identities:

- `TRANSACTIONAL_FROM_EMAIL=info@sovereign.defrag.app`
- `PUBLIC_CONTACT_EMAIL=info@sovereign.defrag.app`
- `EMAIL_SMOKE_TEST_RECIPIENT=info@sovereign.defrag.app`

The sender domain must remain verified by the transactional provider.

## Rollback

Record the previously stable Worker version before release when a production mutation is planned. If rollback is required, restore that exact Worker version through Cloudflare version/deployment controls after confirming compatibility.

Worker rollback does not reverse D1 migrations, Stripe events, email delivery, policy receipts, privacy-request events, or other external state. Use forward-repair migrations and verify compatibility before restoring older code.

## Evidence to retain

Keep, as applicable:

- exact `origin/main` SHA and exact deployed SHA;
- `pnpm verify:cloudflare-build` result for that SHA;
- one-deploy production result;
- `/health` and `/ready` evidence from both branded domains;
- migration, privacy dependency, and release-evidence parity;
- the explicit release-evidence route/rendered booleans;
- sanitized Cloudflare control/deployment metadata;
- real authenticated product-journey evidence;
- human desktop/iPhone screenshots when privacy-safe;
- optional Browser Rendering reports only when actually run;
- prior stable Worker version and any rollback decision.
