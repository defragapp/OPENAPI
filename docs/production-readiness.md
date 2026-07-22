# Production readiness evidence

Status: **not production-ready** as of 2026-07-22.

This document records repository-side evidence for the Sovereign.OS release candidate and the exact items that still require live GitHub and Cloudflare execution. It must be updated by the release engineer after PR delivery, preview deployment, visual review, and final approval.

## Final main commit and tree

Pending live GitHub delivery.

- PR #2 local reconciliation commit: `f55a93ec98db09e10ef2ec79347b36672a13c762`
- PR #2 canonical tree preserved by reconciliation: `60cfdb6390a83b92d07723b96584168d41e5a207`
- Preserved R2/Stripe follow-up commit: `eb02bc89d018386da386b279e21a0b582082355a`
- Follow-up tree: `693bfb1748a0eeceeadd50dc48636b3667d9a3f9`

## Merged PRs

Pending live GitHub delivery.

Required before production approval:

1. Merge PR #2 after pushing `f55a93ec98db09e10ef2ec79347b36672a13c762` or an equivalent verified repair commit.
2. Merge the R2/Stripe follow-up branch created from the newly merged `main`.
3. Merge the Baseline runtime branch containing `packages/baseline-engine` and `apps/baseline-worker`.
4. Close or supersede any competing release PRs only after their useful work is contained in `main`.

## Cloudflare resources

Pending live preview inventory and deployment.

Expected preview resources:

- Sovereign Worker: `sovereign-openapi-preview`
- Baseline Worker: `sovereign-baseline-preview`
- D1: `sovereign-openapi-preview-db`
- R2: `sovereign-openapi-preview-artifacts`
- Durable Object class: `ThreadCoordinator`
- Sovereign Worker private service binding: `BASELINE`
- AI binding: `AI`

Do not record account IDs, opaque resource IDs, tokens, or private deployment metadata in this public document.

## D1 migrations

Repository-side migrations are present through artifact metadata. Live remote migration application is pending preview deployment.

## Durable Object migrations

`ThreadCoordinator` is configured for the Sovereign Worker. Live migration evidence is pending preview deployment.

## R2

The Sovereign Worker has an `ARTIFACTS` binding and D1 stores artifact ownership/lifecycle metadata. Live R2 bucket creation/reuse evidence is pending preview deployment.

## Baseline Worker

Repository-side status:

- `packages/baseline-engine` provides normalized, reduced, model-safe Baseline/current-condition contexts.
- `apps/baseline-worker` exposes private reduced Baseline/current-condition endpoints.
- The Sovereign Worker is configured with a private `BASELINE` service binding.

The current implementation intentionally fails closed or returns reduced context rather than fabricating unavailable SOVV framework computations. Full parity fixtures from verified SOVV outputs remain required before claiming complete SOVV-equivalent deterministic framework computation.

## AI Gateway

Repository-side configuration exists. Live Cloudflare Gateway verification is pending preview deployment.

## Authentication

Repository-side passwordless auth, sessions, origin enforcement, and deterministic auth smoke exist. Live Turnstile and email delivery verification are pending preview deployment and account configuration.

## Stripe

Repository-side Sovereign+ monthly/annual configuration and support-payment entitlement isolation exist. Live read-only Stripe product verification and webhook configuration remain pending environment-secret configuration.

## Support link

Repository supports a configured public support link with `entitlementEffect: none`. Live configured URL verification is pending preview deployment.

## Privacy controls

Repository-side boundaries include reduced Baseline/current-condition contexts, support for export/deletion jobs, session controls, and no raw birth input or exact location in model-safe Baseline output. Live preview verification remains pending.

## Export and deletion

Repository-side routes and smoke coverage exist. Live preview verification remains pending.

## Security headers and CSP

Security headers are implemented in the Worker. Live preview header verification remains pending.

## Secret scan

Last local release gates reported no committed secret patterns. Run `pnpm scan:secrets` after every merge.

## Tests

Run the complete Node 22 release gate after every merge:

```bash
npx -y node@22 "$(which pnpm)" install --frozen-lockfile
npx -y node@22 "$(which pnpm)" verify:foundation
npx -y node@22 "$(which pnpm)" verify:migrations
npx -y node@22 "$(which pnpm)" scan:secrets
npx -y node@22 "$(which pnpm)" typecheck
npx -y node@22 "$(which pnpm)" test
npx -y node@22 "$(which pnpm)" build
npx -y node@22 "$(which pnpm)" smoke:worker-gateway
npx -y node@22 "$(which pnpm)" smoke:auth
npx -y node@22 "$(which pnpm)" smoke:stripe
npx -y node@22 "$(which pnpm)" smoke:product
npx -y node@22 "$(which pnpm)" smoke:release
npx -y node@22 "$(which pnpm)" build:preview
git diff --check
git status --short
```

## Performance

Pending deployed preview measurement.

## Accessibility

Pending deployed preview review at 390×844, 430×932, 768×1024, and 1440×1000.

## Preview URL

Pending preview deployment.

## Screenshot evidence

Pending preview deployment and visual review.

## Known limitations

- GitHub delivery requires a secure non-interactive `GITHUB_TOKEN` or equivalent credential helper.
- Cloudflare preview deployment requires account credentials and configured preview secrets.
- Full deterministic SOVV-equivalent framework parity requires verified SOVV output fixtures or a dedicated SOVV computation facade.
- Live Turnstile, email, Stripe webhook, and Cloudflare Gateway verification require external account configuration.

## Production environment names

Use GitHub environments:

- `preview`
- `production`

Production deployment must require manual approval.

## Rollback procedure

1. Identify the last verified healthy production commit.
2. Confirm its migrations are compatible with the current database state.
3. Dispatch the production workflow for the verified rollback commit through the protected `production` environment.
4. Verify `/health`, `/healthz`, `/ready`, auth, billing projection, and Sovereign streaming.
5. Record the rollback commit, run URL, and verification evidence.

## Launch procedure

1. Confirm final `main` commit and tree.
2. Confirm no competing release PR remains open.
3. Confirm preview deployment is green.
4. Confirm visual and accessibility review is complete.
5. Confirm legal review for Privacy and Terms.
6. Confirm production secrets are environment-scoped.
7. Request explicit production approval.
8. Dispatch the protected production deployment workflow.
9. Verify production health/readiness and critical smokes.
10. Record release evidence.
