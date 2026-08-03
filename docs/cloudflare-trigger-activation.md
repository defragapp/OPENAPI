# Cloudflare production trigger activation

This marker records production release pushes made after the exact-SHA Cloudflare Workers Builds workflow was present on the default branch.

The workflow must accept only the current `main` SHA, return a Cloudflare build UUID, verify the exact deployed Worker version and migration, and confirm branded Resend delivery before the release is treated as complete.

## Release trigger — July 31, 2026

A production release was explicitly requested for the current production-safe `main` branch. This documentation-only marker is intentionally used to trigger the connected Cloudflare Workers Builds project without merging any open draft pull request or changing application runtime behavior.

## Final reconciliation trigger — July 31, 2026 at 15:48 PT

Trigger the connected Cloudflare Workers Builds production pipeline from the exact current `main` tree after repository hygiene, sampled Workers Traces, safety-boundary updates, typography, and responsive visual corrections. Accept the release only when the deployed Worker reports this commit, migration `0013_workers_ai_free_capacity`, and `ready: true` across the canonical production endpoints.

## Urgent production retrigger — August 1, 2026

Force the connected `sovv-web` Cloudflare Workers Builds project to deploy this exact `main` commit immediately. The live public surface must not remain on a stale release. Accept completion only after both canonical readiness endpoints report `ready: true`, the expected migration, and this exact commit, with the public cohesion pages and assets available.

## Reconciled visual v3 release — August 2, 2026 at 14:53 PT

Trigger one clean connected Workers Build after the release-command drift was corrected. Accept this release only when `sovv-web.sovereign-os-api.workers.dev`, `sovereign.defrag.app`, and `app.defrag.app` report the exact current `main` SHA, migration `0014_passkey_authentication`, migration parity `current`, visual contract `v0-public-landing-v3`, and a passing rendered desktop/mobile Browser Run comparison against the founder-approved screenshot reference.

## Interactive hero and real-life questions — August 2, 2026

Deploy the exact current `main` tree containing the restored rotating real-life question treatment and the value-driven 360-degree hero field. The hero must preserve the existing landing typography and composition, keep the interactive field below the primary copy, use vivid Cloudflare blue, derive each primary line’s reach from its sanitized relative-expression value, replace the floating tooltip with a restrained fixed readout, and preserve reduced-motion and mobile behavior. Accept completion only after the full release gate, exact-SHA runtime checks, migration `0014_passkey_authentication`, custom-domain parity, and rendered desktop/mobile verification pass.

## Private repository release — August 3, 2026 at 10:21 PT

The canonical repository is now private. Trigger one clean connected Cloudflare Workers Build from this exact `main` push to verify that the Cloudflare GitHub installation retains private-repository access. Accept completion only when the branded production domains report this exact SHA, migration `0014_passkey_authentication`, migration parity `current`, visual contract `v0-public-landing-v3`, `productionWorkersDev: false`, and successful secondary-route and rendered route-cohesion audits. GitHub Actions and deploy hooks are not release authority.
