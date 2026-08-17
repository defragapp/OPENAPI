# Historical hosted-runner diagnosis

Status: historical evidence only.

This document records a July 25, 2026 GitHub-hosted runner failure. It is not a current release instruction.

At that time, GitHub Actions could not allocate a hosted runner for the repository. The temporary runner probe failed before checkout or any shell command across multiple hosted images. That diagnosis ruled out application code/workflow steps as the immediate cause and pointed to repository/account hosted-runner admission, billing, quota, or platform policy.

The temporary probe and preview workflow described in the original incident are retired. Do not restore or run them as production authority.

## Current authority

- GitHub Actions are not production release authority.
- Historical Cloudflare Workers Builds triggers are not production release authority.
- Current production procedure is `docs/production-release.md`.
- For the text-first launch, the exact current `origin/main` SHA must pass `pnpm verify:cloudflare-build` and then be released through `pnpm production:release:text`.
- Protected preview uses the repository-owned isolated preview procedure and is not production authority.

Do not use this historical hosted-runner incident to reintroduce GitHub Actions, Workers Builds, or another deployment path.
