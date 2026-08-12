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

## Final route-cohesion release — August 3, 2026 at 10:59 PT

Trigger the connected private-repository Workers Build after aligning the canonical policy verifier with the final `--route-blue-bright` authority and adding bounded retry to non-authoritative release telemetry. This marker changes no runtime code, visual design, copy, component, route, or product behavior. Accept completion only when this exact `main` SHA is reported by both branded domains and the secondary-route, route-cohesion, and rendered page-family audits all pass.

## Final production and DMARC release — August 3, 2026 at 11:18 PT

Trigger the connected private-repository Workers Build after adding deterministic `_dmarc.defrag.app` reconciliation to the canonical production deployment path. The release must create or verify exactly one monitoring-policy TXT record, then complete exact-SHA runtime, secondary-route, route-cohesion, and rendered visual verification. The DNS step uses the existing Cloudflare build credential, fails closed on ambiguous records or missing DNS Write permission, and introduces no new service, exposed secret, user-facing design, copy, route, or product behavior.

## Cloudflare-owned release evidence — August 3, 2026 at 11:42 PT

Trigger the connected private-repository build after removing hosted third-party telemetry from release authority. The canonical sequence must verify the publicly served DMARC value without mutating DNS, deploy the exact SHA, verify runtime and every secondary route, complete the rendered Browser Run audit, persist one exact-SHA success record in the existing production D1 database, and expose that record through `/ready`. AppDeploy reporting remains optional diagnostics and cannot create, block, or prove a production release.

## Release-gate retrigger — August 6, 2026 at 20:47 PT

Trigger one clean connected Cloudflare Workers Build from this exact `main` push. Accept completion only when both canonical readiness endpoints report `ready: true`, migration `0014_passkey_authentication`, migration parity `current`, and this exact commit, and the public landing plus cohesion assets are visibly live.

## Single-deploy D1 release evidence — August 9, 2026

Trigger one clean connected Cloudflare Workers Build from this exact `main` push after introducing migration `0015_release_evidence` and the in-process single-deploy orchestrator. Accept completion only when the remote D1 migration ledger records `0015_release_evidence.sql`, exactly one Worker deployment occurs, both branded domains report this exact commit with migration parity `current`, and their `/health` and `/ready` responses expose the matching D1-backed release evidence. Reconcile `_dmarc.defrag.app` to the monitoring policy during the same release; GitHub Actions remain outside release authority.

## Exact-SHA release gate retrigger — August 10, 2026

Trigger one clean connected Cloudflare Workers Build from this exact `main` push. Accept completion only when the canonical readiness surfaces report `ready: true`, migration `0015_release_evidence`, migration parity `current`, and this exact commit, and the public landing plus cohesion assets are live.
