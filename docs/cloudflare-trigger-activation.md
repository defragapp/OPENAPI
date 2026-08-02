# Cloudflare production trigger activation

This marker records production release pushes made after the exact-SHA Cloudflare Workers Builds workflow was present on the default branch.

The workflow must accept only the current `main` SHA, return a Cloudflare build UUID, verify the exact deployed Worker version and migration, and confirm branded Resend delivery before the release is treated as complete.

## Release trigger — July 31, 2026

A production release was explicitly requested for the current production-safe `main` branch. This documentation-only marker is intentionally used to trigger the connected Cloudflare Workers Builds project without merging any open draft pull request or changing application runtime behavior.

## Final reconciliation trigger — July 31, 2026 at 15:48 PT

Trigger the connected Cloudflare Workers Builds production pipeline from the exact current `main` tree after repository hygiene, sampled Workers Traces, safety-boundary updates, typography, and responsive visual corrections. Accept the release only when the deployed Worker reports this commit, migration `0013_workers_ai_free_capacity`, and `ready: true` across the canonical production endpoints.

## Urgent production retrigger — August 1, 2026

Force the connected `sovv-web` Cloudflare Workers Builds project to deploy this exact `main` commit immediately. The live public surface must not remain on a stale release. Accept completion only after both canonical readiness endpoints report `ready: true`, the expected migration, and this exact commit, with the public cohesion pages and assets available.
