# Cloudflare production trigger activation

This marker records the first production release push made after the exact-SHA Cloudflare Workers Builds workflow was present on the default branch.

The workflow must accept only the current `main` SHA, return a Cloudflare build UUID, verify the exact deployed Worker version and migration, and confirm branded Resend delivery before the release is treated as complete.
