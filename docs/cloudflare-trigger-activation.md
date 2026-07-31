# Cloudflare production trigger activation

This marker records the first production release push made after the exact-SHA Cloudflare Workers Builds workflow was present on the default branch.

The workflow must accept only the current `main` SHA, return a Cloudflare build UUID, verify the exact deployed Worker version and migration, and confirm branded Resend delivery before the release is treated as complete.

## Release trigger — July 31, 2026

A production release was explicitly requested for the current production-safe `main` branch. This documentation-only marker is intentionally used to trigger the connected Cloudflare Workers Builds project without merging any open draft pull request or changing application runtime behavior.

## Final reconciliation trigger — July 31, 2026 at 15:48 PT

Trigger the connected Cloudflare Workers Builds production pipeline from the exact current `main` tree after repository hygiene, sampled Workers Traces, safety-boundary updates, typography, and responsive visual corrections. Accept the release only when the deployed Worker reports this commit, migration `0013_workers_ai_free_capacity`, and `ready: true` across the canonical production endpoints.
