# Historical production redeploy request — 2026-07-26

Status: historical deployment marker only. This file does not define current release authority and must not be used to trigger production now.

This marker originally existed to retrigger the then-authoritative connected Cloudflare Workers Builds pipeline from `main`.

At that time, completion required the deployment script to apply migrations, deploy the exact commit, and pass the live `/ready`, `/health`, public-route, authentication, Stripe, Turnstile, asset, cache, and security probes documented by that release.

The file changed no product behavior, billing behavior, entitlement logic, user data, or runtime configuration.

Current authority is `docs/production-release.md`; current schema is `0018_workers_ai_capacity_reservations`; historical Workers Builds are not a production release path.
