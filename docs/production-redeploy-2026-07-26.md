# Production redeploy request — 2026-07-26

This operational marker intentionally retriggers the authoritative Cloudflare Workers Builds production pipeline from `main`.

The deployment remains fail-closed. Completion requires the deployment script to apply D1 migrations, deploy the exact commit, and pass the live `/ready`, `/health`, public route, authentication, Stripe, Turnstile, asset, cache, and security probes documented in the repository.

This file changes no product behavior, billing behavior, entitlement logic, user data, or runtime configuration.
